import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createClient } from '@/lib/supabase/client'
import LikeButton from '@/components/posts/like-button'

// Mock Supabase client with proper error handling
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
  channel: vi.fn(),
  removeChannel: vi.fn(),
}

// Mock the createClient function
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('LikeButton', () => {
  // Setup mock chain for database operations
  const mockSelect = vi.fn()
  const mockEq = vi.fn()
  const mockMaybeSingle = vi.fn()
  const mockInsert = vi.fn()
  const mockDelete = vi.fn()
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  }

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    
    // Setup default mock implementations
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })

    // Setup method chaining for database operations
    mockEq.mockReturnValue({
      eq: mockEq,
      maybeSingle: mockMaybeSingle,
    })
    
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
    
    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      delete: mockDelete,
    })

    mockSupabaseClient.channel.mockReturnValue(mockChannel)

    // Default successful responses
    mockMaybeSingle.mockResolvedValue({ data: null }) // Not liked initially
    mockInsert.mockResolvedValue({ error: null })
    mockDelete.mockResolvedValue({ error: null })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should render with initial count and not liked state', async () => {
      // Mock count query
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'likes') {
          return {
            select: (columns: string, options?: any) => {
              if (options?.count === 'exact' && options?.head === true) {
                return {
                  eq: () => Promise.resolve({ count: 5 }),
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
            delete: mockDelete,
          }
        }
        return mockSupabaseClient.from()
      })

      render(<LikeButton postId="post-123" initialCount={5} initialLiked={false} />)

      // Should show loading state initially
      expect(screen.getByRole('button')).toBeDisabled()

      // Wait for component to initialize
      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled()
      })

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('5')
      expect(button).not.toHaveClass('bg-destructive')
    })

    it('should handle authentication errors gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth failed'),
      })

      render(<LikeButton postId="post-123" initialCount={0} initialLiked={false} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled()
      })

      // Should still render the button even with auth error
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Like Functionality', () => {
    it('should handle successful like operation', async () => {
      // Setup successful like operation
      mockInsert.mockResolvedValue({ error: null })
      
      // Mock count query to return updated count
      let callCount = 0
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'likes') {
          return {
            select: (columns: string, options?: any) => {
              if (options?.count === 'exact' && options?.head === true) {
                callCount++
                return {
                  eq: () => Promise.resolve({ count: callCount === 1 ? 5 : 6 }),
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
            delete: mockDelete,
          }
        }
        return mockSupabaseClient.from()
      })

      render(<LikeButton postId="post-123" initialCount={5} initialLiked={false} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled()
      })

      const button = screen.getByRole('button')
      
      // Click to like
      fireEvent.click(button)

      // Should show optimistic update immediately
      await waitFor(() => {
        expect(button).toHaveTextContent('6')
      })

      // Should eventually call the insert method
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith({
          error_post_id: 'post-123',
          user_id: 'user-123',
        })
      })
    })

    it('should handle like operation errors with rollback', async () => {
      // Setup failing like operation
      const mockError = new Error('Database error')
      mockInsert.mockResolvedValue({ error: mockError })

      render(<LikeButton postId="post-123" initialCount={5} initialLiked={false} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled()
      })

      const button = screen.getByRole('button')
      
      // Click to like (will fail)
      fireEvent.click(button)

      // Should show optimistic update first
      await waitFor(() => {
        expect(button).toHaveTextContent('6')
      })

      // Should rollback after failure
      await waitFor(() => {
        expect(button).toHaveTextContent('5')
      }, { timeout: 3000 })
    })

    it('should require authentication for liking', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const { toast } = await import('sonner')

      render(<LikeButton postId="post-123" initialCount={5} initialLiked={false} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled()
      })

      const button = screen.getByRole('button')
      
      // Click to like without authentication
      fireEvent.click(button)

      // Should show error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please sign in to like posts')
      })

      // Count should not change
      expect(button).toHaveTextContent('5')
    })
  })

  describe('Real-time Updates', () => {
    it('should set up real-time subscription', async () => {
      render(<LikeButton postId="post-123" initialCount={5} initialLiked={false} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled()
      })

      // Verify channel subscription was set up
      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('likes:post-123')
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
      expect(mockChannel.subscribe).toHaveBeenCalled()
    })

    it('should clean up subscription on unmount', async () => {
      const { unmount } = render(<LikeButton postId="post-123" initialCount={5} initialLiked={false} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled()
      })

      // Unmount component
      unmount()

      // Should clean up the channel
      expect(mockSupabaseClient.removeChannel).toHaveBeenCalledWith(mockChannel)
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockSupabaseClient.from.mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      render(<LikeButton postId="post-123" initialCount={5} initialLiked={false} />)

      // Should still render in error state
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')
      expect(button).toBeDisabled() // Should be disabled in error state
    })

    it('should handle network timeouts gracefully', async () => {
      // Mock a timeout scenario
      mockMaybeSingle.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      )

      render(<LikeButton postId="post-123" initialCount={5} initialLiked={false} />)

      // Should eventually show the button even after timeout
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })

  describe('Optimistic UI Behavior', () => {
    it('should show visual feedback during optimistic state', async () => {
      render(<LikeButton postId="post-123" initialCount={5} initialLiked={false} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled()
      })

      const button = screen.getByRole('button')
      
      // Click to like
      fireEvent.click(button)

      // Should show optimistic styling
      await waitFor(() => {
        expect(button).toHaveClass('ring-2', 'ring-primary/20')
      })
    })

    it('should handle concurrent like operations', async () => {
      render(<LikeButton postId="post-123" initialCount={5} initialLiked={false} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled()
      })

      const button = screen.getByRole('button')
      
      // Click multiple times rapidly
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      // Should handle concurrent operations gracefully
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalled()
      })

      // Final state should be consistent
      await waitFor(() => {
        expect(button).toHaveTextContent(/[5-6]/) // Should be either 5 or 6
      })
    })
  })
})