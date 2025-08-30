import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useOptimisticMutation } from './use-optimistic-mutation'
import { toast } from 'sonner'

interface LikeState {
  isLiked: boolean
  likeCount: number
}

interface LikeMutationVariables {
  postId: string
  userId: string
  isCurrentlyLiked: boolean
}

export function useOptimisticLikes(initialState: LikeState, postId: string) {
  const [optimisticState, setOptimisticState] = useState<LikeState>(initialState)

  const likeMutation = useOptimisticMutation<void, LikeMutationVariables>({
    mutationFn: async ({ postId, userId, isCurrentlyLiked }) => {
      const supabase = createClient() // Fresh client for each mutation
      
      try {
        if (isCurrentlyLiked) {
          // Unlike the post
          const { error } = await supabase
            .from('likes')
            .delete()
            .eq('error_post_id', postId) // Use error_post_id to match the schema
            .eq('user_id', userId)

          if (error) throw error
        } else {
          // Like the post
          const { error } = await supabase
            .from('likes')
            .insert({
              error_post_id: postId, // Use error_post_id to match the schema
              user_id: userId,
            })

          if (error) throw error
        }
      } catch (error) {
        console.error('Like mutation error:', error)
        throw error
      }
    },
    onOptimisticUpdate: ({ isCurrentlyLiked }) => {
      // Apply optimistic update immediately
      setOptimisticState(prev => ({
        isLiked: !isCurrentlyLiked,
        likeCount: isCurrentlyLiked ? prev.likeCount - 1 : prev.likeCount + 1,
      }))
    },
    onError: (error, { isCurrentlyLiked }) => {
      // Rollback on error
      setOptimisticState(prev => ({
        isLiked: isCurrentlyLiked,
        likeCount: isCurrentlyLiked ? prev.likeCount + 1 : prev.likeCount - 1,
      }))
      
      toast.error('Failed to update like. Please try again.')
      console.error('Like mutation error:', error)
    },
  })

  const toggleLike = useCallback(
    async (userId: string) => {
      const currentState = optimisticState
      
      try {
        await likeMutation.mutate({
          postId,
          userId,
          isCurrentlyLiked: currentState.isLiked,
        })
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    },
    [likeMutation, optimisticState, postId]
  )

  // Sync with external state changes (e.g., from real-time updates)
  const syncState = useCallback((newState: LikeState) => {
    if (!likeMutation.isOptimistic) {
      setOptimisticState(newState)
    }
  }, [likeMutation.isOptimistic])

  return {
    likeState: optimisticState,
    toggleLike,
    syncState,
    isLoading: likeMutation.isLoading,
    isOptimistic: likeMutation.isOptimistic,
    error: likeMutation.error,
  }
}