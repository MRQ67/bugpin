import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useOptimisticMutation } from './use-optimistic-mutation'
import { toast } from 'sonner'

export interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  error_post_id: string
  profiles?: {
    username: string
    avatar_url?: string
  }
  isOptimistic?: boolean
  isPending?: boolean
}

interface AddCommentVariables {
  content: string
  postId: string
  userId: string
  username: string
}

export function useOptimisticComments(initialComments: Comment[], postId: string) {
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>(initialComments)
  const tempIdCounter = useRef(0)

  const addCommentMutation = useOptimisticMutation<Comment, AddCommentVariables>({
    mutationFn: async ({ content, postId, userId }) => {
      const supabase = createClient() // Fresh client for each mutation
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: content.trim(),
          error_post_id: postId,
          user_id: userId,
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          error_post_id
        `)
        .single()

      if (error) throw error
      
      // Return comment without profiles (will be loaded separately)
      return {
        ...data,
        profiles: undefined,
      } as Comment
    },
    onOptimisticUpdate: ({ content, userId, username }) => {
      // Create optimistic comment with temporary ID
      const tempId = `temp-${Date.now()}-${++tempIdCounter.current}`
      const optimisticComment: Comment = {
        id: tempId,
        content: content.trim(),
        created_at: new Date().toISOString(),
        user_id: userId,
        error_post_id: postId,
        profiles: {
          username,
        },
        isOptimistic: true,
        isPending: true,
      }

      setOptimisticComments(prev => [...prev, optimisticComment])
    },
    onSuccess: (serverComment, variables) => {
      // Replace optimistic comment with server comment
      setOptimisticComments(prev =>
        prev.map(comment => {
          if (comment.isOptimistic && comment.user_id === variables.userId) {
            // Find the most recent optimistic comment from this user
            const optimisticComments = prev.filter(c => c.isOptimistic && c.user_id === variables.userId)
            const latestOptimistic = optimisticComments[optimisticComments.length - 1]
            
            if (comment.id === latestOptimistic.id) {
              return {
                ...serverComment,
                isOptimistic: false,
                isPending: false,
              }
            }
          }
          return comment
        })
      )
    },
    onError: (error, variables) => {
      // Remove failed optimistic comment
      setOptimisticComments(prev =>
        prev.filter(comment => 
          !(comment.isOptimistic && comment.user_id === variables.userId && comment.content === variables.content)
        )
      )
      
      toast.error('Failed to post comment. Please try again.')
      console.error('Add comment error:', error)
    },
  })

  const addComment = useCallback(
    async (content: string, userId: string, username: string) => {
      if (!content.trim()) {
        toast.error('Comment cannot be empty')
        return
      }

      if (content.trim().length > 1000) {
        toast.error('Comment is too long (max 1000 characters)')
        return
      }

      try {
        await addCommentMutation.mutate({
          content,
          postId,
          userId,
          username,
        })
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    },
    [addCommentMutation, postId]
  )

  // Sync with external state changes (e.g., from real-time updates or initial load)
  const syncComments = useCallback((newComments: Comment[]) => {
    if (!addCommentMutation.isOptimistic) {
      setOptimisticComments(newComments)
    } else {
      // Merge server comments with optimistic ones, avoiding duplicates
      setOptimisticComments(prev => {
        const optimisticComments = prev.filter(c => c.isOptimistic)
        const serverComments = newComments.filter(c => !c.isOptimistic)
        
        // Remove any optimistic comments that now exist on the server
        const filteredOptimistic = optimisticComments.filter(optimistic => 
          !serverComments.some(server => 
            server.content === optimistic.content && 
            server.user_id === optimistic.user_id
          )
        )
        
        return [...serverComments, ...filteredOptimistic]
      })
    }
  }, [addCommentMutation.isOptimistic])

  // Add new comment from real-time subscription
  const addRealtimeComment = useCallback((comment: Comment) => {
    setOptimisticComments(prev => {
      // Check if this comment already exists (avoid duplicates)
      const exists = prev.some(c => c.id === comment.id)
      if (exists) return prev
      
      // Add the new comment
      return [...prev, comment]
    })
  }, [])

  return {
    comments: optimisticComments,
    addComment,
    syncComments,
    addRealtimeComment,
    isLoading: addCommentMutation.isLoading,
    isOptimistic: addCommentMutation.isOptimistic,
    error: addCommentMutation.error,
  }
}