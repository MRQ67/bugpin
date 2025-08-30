import { useState, useCallback, useRef } from 'react'

export interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  onOptimisticUpdate?: (variables: TVariables) => void
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables) => void
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void
}

export interface OptimisticMutationState {
  isLoading: boolean
  isOptimistic: boolean
  error: Error | null
}

export function useOptimisticMutation<TData = unknown, TVariables = unknown>(
  options: OptimisticMutationOptions<TData, TVariables>
) {
  const [state, setState] = useState<OptimisticMutationState>({
    isLoading: false,
    isOptimistic: false,
    error: null,
  })

  const rollbackRef = useRef<(() => void) | null>(null)

  const mutate = useCallback(
    async (variables: TVariables, rollbackFn?: () => void) => {
      try {
        // Set optimistic state
        setState({
          isLoading: true,
          isOptimistic: true,
          error: null,
        })

        // Store rollback function
        rollbackRef.current = rollbackFn || null

        // Apply optimistic update
        options.onOptimisticUpdate?.(variables)

        // Perform actual mutation
        const data = await options.mutationFn(variables)

        // Success - clear optimistic state
        setState({
          isLoading: false,
          isOptimistic: false,
          error: null,
        })

        rollbackRef.current = null
        options.onSuccess?.(data, variables)
        options.onSettled?.(data, null, variables)

        return data
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Mutation failed')

        // Rollback optimistic update
        if (rollbackRef.current) {
          rollbackRef.current()
          rollbackRef.current = null
        }

        // Set error state
        setState({
          isLoading: false,
          isOptimistic: false,
          error: err,
        })

        options.onError?.(err, variables)
        options.onSettled?.(undefined, err, variables)

        throw err
      }
    },
    [options]
  )

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isOptimistic: false,
      error: null,
    })
    rollbackRef.current = null
  }, [])

  return {
    mutate,
    reset,
    ...state,
  }
}