import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createClient } from '@/lib/supabase/client'
import LikeButton from '@/components/posts/like-button'
import OptimisticComments from '@/components/comments/optimistic-comments'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        })),
        order: vi.fn(() => ({
          // Mock comments query
        })),
      })),
      count: vi.fn(),
      head: vi.fn(),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  })),
  auth: {
    getUser: vi.fn(() => ({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })),
  },
  channel: vi.fn(() => ({
    on: vi.fn(() => ({
      subscribe: vi.fn(),
    })),
  })),
  removeChannel: vi.fn(),
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

describe('Optimistic UI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('LikeButton Optimistic Updates', () => {
    it('should show immediate feedback when liking a post', async () => {
      // Mock successful like insertion
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })
      mockSupabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null }),
            }),
          }),
          count: 'exact',
          head: true,
        }),
        insert: mockInsert,
      })

      // Mock count query
      const mockCountQuery = vi.fn().mockResolvedValue({ count: 5 })
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'likes') {
          return {
            select: (columns: string, options?: any) => {
              if (options?.count === 'exact' && options?.head === true) {
                return {
                  eq: () => mockCountQuery,
                }
              }
              return {
                eq: () => ({
                  eq: () => ({
                    maybeSingle: () => Promise.resolve({ data: null }),
                  }),
                }),
              }
            },
            insert: mockInsert,
          }
        }
        return mockSupabase.from()
      })

      render(<LikeButton postId="post-123" initialCount={5} initialLiked={false} />)

      // Wait for component to initialize
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const likeButton = screen.getByRole('button')
      
      // Should show initial state
      expect(likeButton).toHaveTextContent('5')
      expect(likeButton).not.toHaveClass('bg-destructive')

      // Click to like
      fireEvent.click(likeButton)

      // Should immediately show optimistic update
      await waitFor(() => {
        expect(likeButton).toHaveTextContent('6')
      })

      // Should eventually call the server
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalled()
      })
    })

    it('should rollback on like failure', async () => {
      // Mock failed like insertion
      const mockError = new Error('Like failed')
      const mockInsert = vi.fn().mockRejectedValue(mockError)
      
      mockSupabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null }),
            }),
          }),
          count: 'exact',
          head: true,
        }),
        insert: mockInsert,
      })

      const mockCountQuery = vi.fn().mockResolvedValue({ count: 5 })
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'likes') {
          return {
            select: (columns: string, options?: any) => {
              if (options?.count === 'exact' && options?.head === true) {
                return {
                  eq: () => mockCountQuery,
                }
              }
              return {
                eq: () => ({
                  eq: () => ({
                    maybeSingle: () => Promise.resolve({ data: null }),
                  }),
                }),
              }
            },
            insert: mockInsert,
          }
        }
        return mockSupabase.from()
      })

      render(<LikeButton postId="post-123" initialCount={5} initialLiked={false} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const likeButton = screen.getByRole('button')
      
      // Click to like (will fail)
      fireEvent.click(likeButton)

      // Should show optimistic update first
      await waitFor(() => {
        expect(likeButton).toHaveTextContent('6')
      })

      // Should rollback after failure
      await waitFor(() => {
        expect(likeButton).toHaveTextContent('5')
      }, { timeout: 3000 })
    })
  })

  describe('Comments Optimistic Updates', () => {
    it('should show optimistic comment immediately', async () => {
      // Mock successful comment insertion
      const mockInsert = vi.fn().mockResolvedValue({
        data: {
          id: 'comment-123',
          content: 'Test comment',
          created_at: new Date().toISOString(),
          user_id: 'user-123',
          error_post_id: 'post-123',
          profiles: { username: 'testuser' },
        },
        error: null,
      })

      // Mock initial comments query
      const mockCommentsQuery = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'comments') {
          return {
            select: () => ({
              eq: () => ({
                order: () => mockCommentsQuery,
              }),
            }),
            insert: () => ({
              select: () => ({
                single: mockInsert,
              }),
            }),
          }
        }
        if (table === 'profiles') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: { username: 'testuser', name: 'Test User' },
                }),
              }),
            }),
            insert: () => ({
              select: () => ({
                single: () => Promise.resolve({
                  data: { username: 'testuser', name: 'Test User' },
                }),
              }),
            }),
          }
        }
        return mockSupabase.from()
      })

      render(<OptimisticComments postId="post-123" />)

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/share a solution/i)).toBeInTheDocument()
      })

      const textarea = screen.getByPlaceholderText(/share a solution/i)
      const submitButton = screen.getByRole('button', { name: /post comment/i })

      // Type a comment
      fireEvent.change(textarea, { target: { value: 'Test comment' } })
      
      // Submit the comment
      fireEvent.click(submitButton)

      // Should show optimistic comment immediately
      await waitFor(() => {
        expect(screen.getByText('Test comment')).toBeInTheDocument()
      })

      // Should show pending state
      expect(screen.getByText('Test comment').closest('li')).toHaveClass('opacity-70')

      // Should eventually call the server
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalled()
      })
    })

    it('should validate comment length', async () => {
      render(<OptimisticComments postId="post-123" />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/share a solution/i)).toBeInTheDocument()
      })

      const textarea = screen.getByPlaceholderText(/share a solution/i)
      const submitButton = screen.getByRole('button', { name: /post comment/i })

      // Try to submit empty comment
      fireEvent.change(textarea, { target: { value: '   ' } })
      fireEvent.click(submitButton)

      // Should not add any comment
      expect(screen.queryByText('   ')).not.toBeInTheDocument()

      // Try to submit long comment
      const longComment = 'a'.repeat(1001)
      fireEvent.change(textarea, { target: { value: longComment } })
      fireEvent.click(submitButton)

      // Should not add the long comment
      expect(screen.queryByText(longComment)).not.toBeInTheDocument()
    })
  })

  describe('Real-time Updates', () => {
    it('should handle real-time like updates', async () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      }
      
      mockSupabase.channel.mockReturnValue(mockChannel)

      render(<LikeButton postId="post-123" initialCount={5} initialLiked={false} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      // Verify channel subscription was set up
      expect(mockSupabase.channel).toHaveBeenCalledWith('likes:post-123')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: 'error_post_id=eq.post-123',
        }),
        expect.any(Function)
      )
    })

    it('should handle real-time comment updates', async () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      }
      
      mockSupabase.channel.mockReturnValue(mockChannel)

      render(<OptimisticComments postId="post-123" />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/share a solution/i)).toBeInTheDocument()
      })

      // Verify channel subscription was set up
      expect(mockSupabase.channel).toHaveBeenCalledWith('comments:post-123')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: 'error_post_id=eq.post-123',
        }),
        expect.any(Function)
      )
    })
  })
})