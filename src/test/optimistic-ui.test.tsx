import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'

// Mock Supabase client
const mockSupabase = {
    from: vi.fn(() => ({
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
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                    maybeSingle: vi.fn(),
                })),
            })),
            count: vi.fn(),
            head: vi.fn(),
        })),
    })),
    storage: {
        from: vi.fn(() => ({
            upload: vi.fn(),
            getPublicUrl: vi.fn(() => ({
                data: { publicUrl: 'https://example.com/image.jpg' },
            })),
        })),
    },
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

describe('Optimistic UI', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('useOptimisticMutation', () => {
        it('should handle successful mutations with optimistic updates', async () => {
            const mockMutationFn = vi.fn().mockResolvedValue({ id: '123', data: 'success' })
            const mockOnOptimisticUpdate = vi.fn()
            const mockOnSuccess = vi.fn()

            const { result } = renderHook(() =>
                useOptimisticMutation({
                    mutationFn: mockMutationFn,
                    onOptimisticUpdate: mockOnOptimisticUpdate,
                    onSuccess: mockOnSuccess,
                })
            )

            expect(result.current.isLoading).toBe(false)
            expect(result.current.isOptimistic).toBe(false)
            expect(result.current.error).toBe(null)

            // Start mutation
            await act(async () => {
                await result.current.mutate({ test: 'data' })
            })

            // Should complete successfully
            expect(result.current.isLoading).toBe(false)
            expect(result.current.isOptimistic).toBe(false)
            expect(result.current.error).toBe(null)
            expect(mockMutationFn).toHaveBeenCalledWith({ test: 'data' })
            expect(mockOnOptimisticUpdate).toHaveBeenCalledWith({ test: 'data' })
            expect(mockOnSuccess).toHaveBeenCalledWith({ id: '123', data: 'success' }, { test: 'data' })
        })

        it('should handle failed mutations with rollback', async () => {
            const mockError = new Error('Mutation failed')
            const mockMutationFn = vi.fn().mockRejectedValue(mockError)
            const mockOnOptimisticUpdate = vi.fn()
            const mockOnError = vi.fn()

            const { result } = renderHook(() =>
                useOptimisticMutation({
                    mutationFn: mockMutationFn,
                    onOptimisticUpdate: mockOnOptimisticUpdate,
                    onError: mockOnError,
                })
            )

            // Start mutation
            await act(async () => {
                try {
                    await result.current.mutate({ test: 'data' })
                } catch (error) {
                    // Expected to throw
                }
            })

            // Should show error state
            expect(result.current.isLoading).toBe(false)
            expect(result.current.isOptimistic).toBe(false)
            expect(result.current.error).toBe(mockError)
            expect(mockOnOptimisticUpdate).toHaveBeenCalledWith({ test: 'data' })
            expect(mockOnError).toHaveBeenCalledWith(mockError, { test: 'data' })
        })

        it('should reset state correctly', async () => {
            const { result } = renderHook(() =>
                useOptimisticMutation({
                    mutationFn: vi.fn().mockRejectedValue(new Error('Test error')),
                })
            )

            // Trigger error state
            await act(async () => {
                try {
                    await result.current.mutate({ test: 'data' })
                } catch (error) {
                    // Expected to throw
                }
            })

            expect(result.current.error).toBeTruthy()

            // Reset
            act(() => {
                result.current.reset()
            })

            expect(result.current.isLoading).toBe(false)
            expect(result.current.isOptimistic).toBe(false)
            expect(result.current.error).toBe(null)
        })
    })

    describe('Optimistic UI Integration', () => {
        it('should demonstrate optimistic mutation pattern', async () => {
            // This test demonstrates the core optimistic UI pattern
            let optimisticState = { count: 0 }
            let serverState = { count: 0 }

            const mockMutationFn = vi.fn().mockImplementation(async ({ increment }: { increment: number }) => {
                // Simulate server delay
                await new Promise(resolve => setTimeout(resolve, 100))
                serverState.count += increment
                return serverState
            })

            const mockOnOptimisticUpdate = vi.fn().mockImplementation(({ increment }: { increment: number }) => {
                // Apply optimistic update immediately
                optimisticState.count += increment
            })

            const mockOnSuccess = vi.fn().mockImplementation((result) => {
                // Sync with server state
                optimisticState = { ...result }
            })

            const { result } = renderHook(() =>
                useOptimisticMutation({
                    mutationFn: mockMutationFn,
                    onOptimisticUpdate: mockOnOptimisticUpdate,
                    onSuccess: mockOnSuccess,
                })
            )

            // Initial state
            expect(optimisticState.count).toBe(0)
            expect(serverState.count).toBe(0)

            // Perform optimistic mutation
            await act(async () => {
                await result.current.mutate({ increment: 1 })
            })

            // Verify optimistic update was applied and then synced with server
            expect(mockOnOptimisticUpdate).toHaveBeenCalledWith({ increment: 1 })
            expect(mockMutationFn).toHaveBeenCalledWith({ increment: 1 })
            expect(mockOnSuccess).toHaveBeenCalledWith({ count: 1 }, { increment: 1 })
            expect(optimisticState.count).toBe(1)
            expect(serverState.count).toBe(1)
        })

        it('should handle rollback on mutation failure', async () => {
            let optimisticState = { count: 5 }
            const originalState = { ...optimisticState }

            const mockError = new Error('Server error')
            const mockMutationFn = vi.fn().mockRejectedValue(mockError)

            const mockOnOptimisticUpdate = vi.fn().mockImplementation(({ increment }: { increment: number }) => {
                optimisticState.count += increment
            })

            const mockOnError = vi.fn().mockImplementation(() => {
                // Rollback to original state
                optimisticState = { ...originalState }
            })

            const { result } = renderHook(() =>
                useOptimisticMutation({
                    mutationFn: mockMutationFn,
                    onOptimisticUpdate: mockOnOptimisticUpdate,
                    onError: mockOnError,
                })
            )

            // Perform failing mutation
            await act(async () => {
                try {
                    await result.current.mutate({ increment: 3 })
                } catch (error) {
                    // Expected to throw
                }
            })

            // Verify optimistic update was applied then rolled back
            expect(mockOnOptimisticUpdate).toHaveBeenCalledWith({ increment: 3 })
            expect(mockOnError).toHaveBeenCalledWith(mockError, { increment: 3 })
            expect(optimisticState.count).toBe(5) // Rolled back to original
        })

        it('should handle concurrent mutations correctly', async () => {
            let callCount = 0
            const mockMutationFn = vi.fn().mockImplementation(async () => {
                callCount++
                await new Promise(resolve => setTimeout(resolve, 50))
                return { success: true, callNumber: callCount }
            })

            const { result } = renderHook(() =>
                useOptimisticMutation<{ success: boolean; callNumber: number }, { action: string }>({
                    mutationFn: mockMutationFn,
                })
            )

            // Start two concurrent mutations
            const [result1, result2] = await act(async () => {
                return Promise.all([
                    result.current.mutate({ action: 'first' }),
                    result.current.mutate({ action: 'second' })
                ])
            })

            // Both should complete successfully
            expect(result1.success).toBe(true)
            expect(result2.success).toBe(true)
            expect(mockMutationFn).toHaveBeenCalledTimes(2)
        })
    })
})