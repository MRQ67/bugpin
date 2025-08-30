import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOptimisticComments } from '@/hooks/use-optimistic-comments'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'comment-123',
            content: 'Test comment',
            created_at: new Date().toISOString(),
            user_id: 'user-123',
            error_post_id: 'post-123',
          },
          error: null,
        }),
      })),
    })),
  })),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Comments Fix', () => {
  it('should handle comment creation without profiles join', async () => {
    const { result } = renderHook(() =>
      useOptimisticComments([], 'post-123')
    )

    expect(result.current.comments).toHaveLength(0)

    // Add a comment
    await act(async () => {
      await result.current.addComment('Test comment', 'user-123', 'testuser')
    })

    // Should have added the comment
    expect(result.current.comments).toHaveLength(1)
    expect(result.current.comments[0].content).toBe('Test comment')
    expect(result.current.comments[0].user_id).toBe('user-123')
  })

  it('should validate comment input', async () => {
    const { result } = renderHook(() =>
      useOptimisticComments([], 'post-123')
    )

    // Try empty comment
    await act(async () => {
      await result.current.addComment('   ', 'user-123', 'testuser')
    })

    // Should not add empty comment
    expect(result.current.comments).toHaveLength(0)

    // Try long comment
    const longComment = 'a'.repeat(1001)
    await act(async () => {
      await result.current.addComment(longComment, 'user-123', 'testuser')
    })

    // Should not add long comment
    expect(result.current.comments).toHaveLength(0)
  })

  it('should sync comments correctly', async () => {
    const { result } = renderHook(() =>
      useOptimisticComments([], 'post-123')
    )

    const serverComments = [
      {
        id: 'comment-1',
        content: 'Server comment',
        created_at: new Date().toISOString(),
        user_id: 'user-123',
        error_post_id: 'post-123',
      },
    ]

    // Sync comments
    act(() => {
      result.current.syncComments(serverComments)
    })

    expect(result.current.comments).toHaveLength(1)
    expect(result.current.comments[0].content).toBe('Server comment')
  })
})