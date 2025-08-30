'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useOptimisticLikes } from '@/hooks/use-optimistic-likes'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  postId: string
  initialCount?: number
  initialLiked?: boolean
}

export default function LikeButton({ postId, initialCount = 0, initialLiked = false }: LikeButtonProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    likeState,
    toggleLike,
    syncState,
    isLoading,
    isOptimistic,
  } = useOptimisticLikes(
    { isLiked: initialLiked, likeCount: initialCount },
    postId
  )

  useEffect(() => {
    let isMounted = true
    let currentUserId: string | null = null
    const supabase = createClient() // Fresh client for this effect

    const bootstrap = async () => {
      try {
        setError(null)
        
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        
        if (userError) {
          console.warn('Auth error in like button:', userError)
          // Continue without user - likes can still be viewed
        }
        
        if (!isMounted) return
        
        currentUserId = user?.id ?? null
        setUserId(currentUserId)

        // Fetch current like state from server
        try {
          const [{ data: myLike }, countRes] = await Promise.all([
            user
              ? supabase.from('likes').select('id').eq('error_post_id', postId).eq('user_id', user.id).maybeSingle()
              : Promise.resolve({ data: null }),
            supabase.from('likes').select('id', { count: 'exact', head: true }).eq('error_post_id', postId),
          ])

          if (!isMounted) return

          // Sync with server state
          syncState({
            isLiked: Boolean(myLike),
            likeCount: (countRes.count as number) ?? initialCount,
          })
        } catch (likeError) {
          console.warn('Failed to fetch like state:', likeError)
          // Continue with initial state
        }

        setMounted(true)
      } catch (error) {
        console.error('Failed to bootstrap like button:', error)
        setError('Failed to load like button')
        setMounted(true)
      }
    }

    bootstrap()

    // Set up real-time subscription for likes
    const channel = supabase
      .channel(`likes:${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'likes', filter: `error_post_id=eq.${postId}` },
        (payload: any) => {
          if (!isMounted) return

          // Update like count based on real-time changes
          if (payload.eventType === 'INSERT') {
            const newState = {
              ...likeState,
              likeCount: likeState.likeCount + 1,
              isLiked: currentUserId && (payload.new as any).user_id === currentUserId ? true : likeState.isLiked,
            }
            syncState(newState)
          }
          
          if (payload.eventType === 'DELETE') {
            const newState = {
              ...likeState,
              likeCount: Math.max(0, likeState.likeCount - 1),
              isLiked: currentUserId && (payload.old as any).user_id === currentUserId ? false : likeState.isLiked,
            }
            syncState(newState)
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [postId, initialCount, syncState])

  const handleToggle = async () => {
    if (!userId) {
      toast.error('Please sign in to like posts')
      return
    }

    await toggleLike(userId)
  }

  if (!mounted) {
    // Show loading skeleton
    return (
      <Button variant="outline" size="sm" disabled className="gap-2 opacity-50">
        <Heart className="h-4 w-4" />
        {initialCount}
      </Button>
    )
  }

  if (error) {
    // Show error state
    return (
      <Button variant="outline" size="sm" disabled className="gap-2 opacity-50">
        <Heart className="h-4 w-4" />
        {initialCount}
      </Button>
    )
  }

  return (
    <Button
      variant={likeState.isLiked ? 'destructive' : 'outline'}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading && !isOptimistic}
      className={cn(
        'gap-2 transition-all duration-200',
        isOptimistic && 'ring-2 ring-primary/20',
        likeState.isLiked && 'hover:bg-destructive/90'
      )}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-all duration-200',
          likeState.isLiked && 'fill-current scale-110',
          isOptimistic && 'animate-pulse'
        )}
      />
      <span className={cn(
        'transition-all duration-200',
        isOptimistic && 'font-semibold'
      )}>
        {likeState.likeCount}
      </span>
    </Button>
  )
}
