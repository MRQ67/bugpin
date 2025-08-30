import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'

describe('Optimistic UI Demo', () => {
  it('demonstrates the complete optimistic UI flow', async () => {
    // Simulate a like system with optimistic updates
    let uiState = { isLiked: false, likeCount: 10 }
    let serverState = { isLiked: false, likeCount: 10 }
    
    // Mock server mutation that takes time
    const mockLikeMutation = vi.fn().mockImplementation(async (shouldLike: boolean) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Update server state
      if (shouldLike) {
        serverState = { isLiked: true, likeCount: serverState.likeCount + 1 }
      } else {
        serverState = { isLiked: false, likeCount: Math.max(0, serverState.likeCount - 1) }
      }
      
      return serverState
    })

    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: mockLikeMutation,
        onOptimisticUpdate: (shouldLike: boolean) => {
          // Apply optimistic update immediately for instant UI feedback
          if (shouldLike) {
            uiState = { isLiked: true, likeCount: uiState.likeCount + 1 }
          } else {
            uiState = { isLiked: false, likeCount: Math.max(0, uiState.likeCount - 1) }
          }
        },
        onSuccess: (serverResult) => {
          // Sync UI with server response
          uiState = { ...serverResult }
        },
        onError: () => {
          // Rollback optimistic update on error
          uiState = { ...serverState }
        },
      })
    )

    // Initial state
    expect(uiState.isLiked).toBe(false)
    expect(uiState.likeCount).toBe(10)
    expect(serverState.isLiked).toBe(false)
    expect(serverState.likeCount).toBe(10)

    // User clicks like button
    await act(async () => {
      await result.current.mutate(true)
    })

    // Verify the complete flow:
    // 1. Optimistic update was applied immediately
    // 2. Server mutation was called
    // 3. UI was synced with server response
    expect(mockLikeMutation).toHaveBeenCalledWith(true)
    expect(uiState.isLiked).toBe(true)
    expect(uiState.likeCount).toBe(11)
    expect(serverState.isLiked).toBe(true)
    expect(serverState.likeCount).toBe(11)
  })

  it('demonstrates rollback on server error', async () => {
    let uiState = { isLiked: false, likeCount: 5 }
    const originalState = { ...uiState }
    
    // Mock server mutation that fails
    const mockFailingMutation = vi.fn().mockRejectedValue(new Error('Server error'))

    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: mockFailingMutation,
        onOptimisticUpdate: () => {
          // Apply optimistic update
          uiState = { isLiked: true, likeCount: uiState.likeCount + 1 }
        },
        onError: () => {
          // Rollback to original state
          uiState = { ...originalState }
        },
      })
    )

    // User clicks like button (will fail)
    await act(async () => {
      try {
        await result.current.mutate(true)
      } catch (error) {
        // Expected to throw
      }
    })

    // Verify rollback occurred
    expect(mockFailingMutation).toHaveBeenCalledWith(true)
    expect(uiState.isLiked).toBe(false) // Rolled back
    expect(uiState.likeCount).toBe(5)   // Rolled back
  })

  it('demonstrates optimistic comment posting', async () => {
    let comments: Array<{ id: string; content: string; isOptimistic?: boolean }> = []
    
    // Mock server mutation for posting comment
    const mockPostComment = vi.fn().mockImplementation(async (content: string) => {
      await new Promise(resolve => setTimeout(resolve, 50))
      return {
        id: `server-${Date.now()}`,
        content,
        created_at: new Date().toISOString(),
      }
    })

    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: mockPostComment,
        onOptimisticUpdate: (content: string) => {
          // Add optimistic comment immediately
          const optimisticComment = {
            id: `temp-${Date.now()}`,
            content,
            isOptimistic: true,
          }
          comments = [...comments, optimisticComment]
        },
        onSuccess: (serverComment, originalContent) => {
          // Replace optimistic comment with server comment
          comments = comments.map(comment => 
            comment.isOptimistic && comment.content === originalContent
              ? { ...serverComment, isOptimistic: false }
              : comment
          )
        },
        onError: (error, originalContent) => {
          // Remove failed optimistic comment
          comments = comments.filter(comment => 
            !(comment.isOptimistic && comment.content === originalContent)
          )
        },
      })
    )

    // Initial state
    expect(comments).toHaveLength(0)

    // User posts a comment
    await act(async () => {
      await result.current.mutate('This is a test comment')
    })

    // Verify the flow:
    // 1. Comment was added optimistically
    // 2. Server mutation was called
    // 3. Optimistic comment was replaced with server comment
    expect(mockPostComment).toHaveBeenCalledWith('This is a test comment')
    expect(comments).toHaveLength(1)
    expect(comments[0].content).toBe('This is a test comment')
    expect(comments[0].isOptimistic).toBe(false) // Replaced with server comment
    expect(comments[0].id).toMatch(/^server-/) // Server-generated ID
  })

  it('demonstrates upload progress with optimistic feedback', async () => {
    let uploadState = {
      stage: 'idle' as 'idle' | 'uploading' | 'processing' | 'complete' | 'error',
      progress: 0,
      message: '',
    }

    // Mock file upload with progress updates
    const mockUpload = vi.fn().mockImplementation(async (file: File) => {
      // Simulate upload stages
      uploadState = { stage: 'uploading', progress: 25, message: 'Uploading...' }
      await new Promise(resolve => setTimeout(resolve, 50))
      
      uploadState = { stage: 'processing', progress: 75, message: 'Processing...' }
      await new Promise(resolve => setTimeout(resolve, 50))
      
      uploadState = { stage: 'complete', progress: 100, message: 'Complete!' }
      return { url: 'https://example.com/uploaded-file.jpg' }
    })

    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: mockUpload,
        onOptimisticUpdate: () => {
          // Start showing progress immediately
          uploadState = { stage: 'uploading', progress: 10, message: 'Starting upload...' }
        },
        onSuccess: () => {
          // Upload completed successfully
          uploadState = { stage: 'complete', progress: 100, message: 'Upload complete!' }
        },
        onError: () => {
          // Upload failed
          uploadState = { stage: 'error', progress: 0, message: 'Upload failed' }
        },
      })
    )

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    // Initial state
    expect(uploadState.stage).toBe('idle')
    expect(uploadState.progress).toBe(0)

    // User starts upload
    await act(async () => {
      await result.current.mutate(mockFile)
    })

    // Verify upload completed with progress feedback
    expect(mockUpload).toHaveBeenCalledWith(mockFile)
    expect(uploadState.stage).toBe('complete')
    expect(uploadState.progress).toBe(100)
    expect(uploadState.message).toBe('Upload complete!')
  })
})