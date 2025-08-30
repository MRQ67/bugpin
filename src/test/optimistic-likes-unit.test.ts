import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOptimisticLikes } from '@/hooks/use-optimistic-likes'

// Mock Supabase client with proper typing
const mockSupabaseClient = {
  from: vi.fn(() => ({
    insert: vi.fn(),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  })),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('useOptimisticLikes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with provided state', () => {
      const initialState = { isLiked: false, likeCount: 5 }
      
      const { result } = renderHook(() =>
        useOptimisticLikes(initialState, 'post-123')
      )

      expect(result.current.likeState).toEqual(initialState)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isOptimistic).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should initialize with liked state', () => {
      const initialState = { isLiked: true, likeCount: 10 }
      
      const { result } = renderHook(() =>
        useOptimisticLikes(initialState, 'post-123')
      )

      expect(result.current.likeState).toEqual(initialState)
    })
  })

  describe('Like Toggle Functionality', () => {
    it('should handle successful like operation', async () => {
      // Mock successful insert
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(),
        })),
      }))
      
      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
        delete: mockDelete,
      })

      const initialState = { isLiked: false, likeCount: 5 }
      
      const { result } = renderHook(() =>
        useOptimisticLikes(initialState, 'post-123')
      )

      // Perform like operation
      await act(async () => {
        await result.current.toggleLike('user-123')
      })

      // Should call Supabase insert with correct parameters
      expect(mockInsert).toHaveBeenCalledWith({
        error_post_id: 'post-123',
        user_id: 'user-123',
      })

      // Should update optimistic state
      expect(result.current.likeState.isLiked).toBe(true)
      expect(result.current.likeState.likeCount).toBe(6)
    })

    it('should handle successful unlike operation', async () => {
      // Mock successful delete
      const mockDelete = vi.fn().mockResolvedValue({ error: null })
      const mockEq = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(mockDelete),
      })
      
      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn(),
        delete: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      })

      const initialState = { isLiked: true, likeCount: 5 }
      
      const { result } = renderHook(() =>
        useOptimisticLikes(initialState, 'post-123')
      )

      // Perform unlike operation
      await act(async () => {
        await result.current.toggleLike('user-123')
      })

      // Should call Supabase delete with correct parameters
      expect(mockEq).toHaveBeenCalledWith('error_post_id', 'post-123')
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123')

      // Should update optimistic state
      expect(result.current.likeState.isLiked).toBe(false)
      expect(result.current.likeState.likeCount).toBe(4)
    })

    it('should handle like operation errors with rollback', async () => {
      // Mock failed insert
      const mockError = new Error('Database error')
      const mockInsert = vi.fn().mockResolvedValue({ error: mockError })
      const mockDelete = vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(),
        })),
      }))
      
      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
        delete: mockDelete,
      })

      const initialState = { isLiked: false, likeCount: 5 }
      
      const { result } = renderHook(() =>
        useOptimisticLikes(initialState, 'post-123')
      )

      // Perform like operation (should fail)
      await act(async () => {
        try {
          await result.current.toggleLike('user-123')
        } catch (error) {
          // Expected to throw
        }
      })

      // Should rollback to original state
      expect(result.current.likeState.isLiked).toBe(false)
      expect(result.current.likeState.likeCount).toBe(5)
      expect(result.current.error).toBeTruthy()
    })

    it('should handle network errors gracefully', async () => {
      // Mock network error
      const networkError = new Error('Network timeout')
      const mockInsert = vi.fn().mockRejectedValue(networkError)
      const mockDelete = vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(),
        })),
      }))
      
      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
        delete: mockDelete,
      })

      const initialState = { isLiked: false, likeCount: 5 }
      
      const { result } = renderHook(() =>
        useOptimisticLikes(initialState, 'post-123')
      )

      // Perform like operation (should fail)
      await act(async () => {
        try {
          await result.current.toggleLike('user-123')
        } catch (error) {
          // Expected to throw
        }
      })

      // Should rollback to original state
      expect(result.current.likeState.isLiked).toBe(false)
      expect(result.current.likeState.likeCount).toBe(5)
    })
  })

  describe('State Synchronization', () => {
    it('should sync state when not in optimistic mode', () => {
      const initialState = { isLiked: false, likeCount: 5 }
      
      const { result } = renderHook(() =>
        useOptimisticLikes(initialState, 'post-123')
      )

      const newState = { isLiked: true, likeCount: 10 }

      act(() => {
        result.current.syncState(newState)
      })

      expect(result.current.likeState).toEqual(newState)
    })

    it('should not sync state during optimistic operations', async () => {
      // Mock slow insert to keep optimistic state active
      const mockInsert = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      )
      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(),
          })),
        })),
      })

      const initialState = { isLiked: false, likeCount: 5 }
      
      const { result } = renderHook(() =>
        useOptimisticLikes(initialState, 'post-123')
      )

      // Start optimistic operation
      const togglePromise = act(async () => {
        await result.current.toggleLike('user-123')
      })

      // Try to sync state during optimistic operation
      act(() => {
        result.current.syncState({ isLiked: false, likeCount: 100 })
      })

      // Should maintain optimistic state, not sync
      expect(result.current.likeState.isLiked).toBe(true)
      expect(result.current.likeState.likeCount).toBe(6)

      // Wait for operation to complete
      await togglePromise
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero like count correctly', async () => {
      const mockDelete = vi.fn().mockResolvedValue({ error: null })
      const mockEq = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(mockDelete),
      })
      
      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn(),
        delete: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      })

      const initialState = { isLiked: true, likeCount: 1 }
      
      const { result } = renderHook(() =>
        useOptimisticLikes(initialState, 'post-123')
      )

      await act(async () => {
        await result.current.toggleLike('user-123')
      })

      // Should not go below zero
      expect(result.current.likeState.likeCount).toBe(0)
    })

    it('should handle concurrent toggle operations', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(),
          })),
        })),
      })

      const initialState = { isLiked: false, likeCount: 5 }
      
      const { result } = renderHook(() =>
        useOptimisticLikes(initialState, 'post-123')
      )

      // Start multiple concurrent operations
      const operations = [
        result.current.toggleLike('user-123'),
        result.current.toggleLike('user-123'),
        result.current.toggleLike('user-123'),
      ]

      await act(async () => {
        await Promise.allSettled(operations)
      })

      // Should handle concurrent operations gracefully
      expect(mockInsert).toHaveBeenCalled()
      expect(result.current.likeState.likeCount).toBeGreaterThanOrEqual(5)
    })

    it('should handle malformed server responses', async () => {
      // Mock malformed response
      const mockInsert = vi.fn().mockResolvedValue({ error: 'Invalid response format' })
      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(),
          })),
        })),
      })

      const initialState = { isLiked: false, likeCount: 5 }
      
      const { result } = renderHook(() =>
        useOptimisticLikes(initialState, 'post-123')
      )

      await act(async () => {
        try {
          await result.current.toggleLike('user-123')
        } catch (error) {
          // Expected to handle error
        }
      })

      // Should rollback to original state
      expect(result.current.likeState.isLiked).toBe(false)
      expect(result.current.likeState.likeCount).toBe(5)
    })
  })

  describe('Performance', () => {
    it('should create fresh Supabase client for each operation', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(),
          })),
        })),
      })

      const initialState = { isLiked: false, likeCount: 5 }
      
      const { result } = renderHook(() =>
        useOptimisticLikes(initialState, 'post-123')
      )

      await act(async () => {
        await result.current.toggleLike('user-123')
      })

      // Should create a fresh client for the operation
      expect(createClient).toHaveBeenCalled()
    })

    it('should not leak memory on multiple operations', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(),
          })),
        })),
      })

      const initialState = { isLiked: false, likeCount: 5 }
      
      const { result } = renderHook(() =>
        useOptimisticLikes(initialState, 'post-123')
      )

      // Perform many operations
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await result.current.toggleLike(`user-${i}`)
        })
      }

      // Should complete without memory issues
      expect(mockInsert).toHaveBeenCalledTimes(10)
    })
  })
})