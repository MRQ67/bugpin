'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RelativeTime } from '@/components/ui/relative-time'
import { useOptimisticComments, type Comment } from '@/hooks/use-optimistic-comments'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface OptimisticCommentsProps {
  postId: string
}

export default function OptimisticComments({ postId }: OptimisticCommentsProps) {
  const [content, setContent] = useState('')
  const [user, setUser] = useState<any>(null)
  const [profiles, setProfiles] = useState<Record<string, { name?: string; username?: string; avatar_url?: string }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    comments,
    addComment,
    syncComments,
    addRealtimeComment,
    isLoading: isAddingComment,
  } = useOptimisticComments([], postId)

  useEffect(() => {
    let mounted = true
    const supabase = createClient() // Create fresh client instance

    const bootstrap = async () => {
      try {
        setError(null)
        
        // Get current user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.warn('Auth error:', userError)
          // Continue without user - comments can still be viewed
        }
        if (!mounted) return
        setUser(currentUser)

        // Fetch initial comments (without profiles join to avoid relationship issues)
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            created_at,
            user_id,
            error_post_id
          `)
          .eq('error_post_id', postId)
          .order('created_at', { ascending: true })

        if (commentsError) {
          console.error('Failed to load comments:', commentsError)
          setError('Failed to load comments. Please refresh the page.')
          setLoading(false)
          return
        }

        if (!mounted) return

        // Transform comments to match our interface (without profiles for now)
        const transformedComments: Comment[] = (commentsData || []).map(comment => ({
          ...comment,
          profiles: undefined, // Will be loaded separately
        }))

        syncComments(transformedComments)

        // Fetch profiles for all comment authors
        if (commentsData && commentsData.length > 0) {
          const userIds = [...new Set(commentsData.map(comment => comment.user_id))]
          
          try {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, username, name, avatar_url')
              .in('id', userIds)

            if (profilesData) {
              const profilesMap: Record<string, any> = {}
              profilesData.forEach(profile => {
                profilesMap[profile.id] = {
                  username: profile.username,
                  name: profile.name || profile.username,
                  avatar_url: profile.avatar_url,
                }
              })
              setProfiles(profilesMap)
            }
          } catch (profileError) {
            console.warn('Failed to load profiles:', profileError)
            // Continue without profiles - comments will still work
          }
        }

        setLoading(false)
      } catch (error) {
        console.error('Failed to bootstrap comments:', error)
        setError('Failed to initialize comments. Please refresh the page.')
        setLoading(false)
      }
    }

    bootstrap()

    // Set up real-time subscription
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'comments', 
          filter: `error_post_id=eq.${postId}` 
        },
        async (payload: any) => {
          if (!mounted) return

          const newComment = payload.new
          
          // Add comment without profile first for immediate feedback
          const commentWithoutProfile: Comment = {
            ...newComment,
            profiles: undefined,
          }

          addRealtimeComment(commentWithoutProfile)

          // Fetch profile for the new comment in background
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, username, name, avatar_url')
              .eq('id', newComment.user_id)
              .single()

            if (profile && mounted) {
              // Update profiles cache
              setProfiles(prev => ({
                ...prev,
                [newComment.user_id]: {
                  username: profile.username,
                  name: profile.name || profile.username,
                  avatar_url: profile.avatar_url,
                },
              }))
            }
          } catch (profileError) {
            console.warn('Failed to load profile for new comment:', profileError)
            // Comment will still show without profile info
          }
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [postId, syncComments, addRealtimeComment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please sign in to comment')
      return
    }

    if (!content.trim()) return

    const supabase = createClient() // Fresh client for this operation

    try {
      // Get or create user profile
      let profile = profiles[user.id]
      if (!profile) {
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, name, avatar_url')
          .eq('id', user.id)
          .single()

        if (existingProfile && !profileError) {
          profile = existingProfile
          setProfiles(prev => ({ ...prev, [user.id]: existingProfile }))
        } else {
          // Create profile if it doesn't exist
          const displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'User'
          const username = user.email?.split('@')[0]?.toLowerCase() || `user-${Math.random().toString(36).substring(2, 8)}`
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              name: displayName,
              username,
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
              updated_at: new Date().toISOString(),
            })
            .select('id, username, name, avatar_url')
            .single()

          if (newProfile && !insertError) {
            profile = newProfile
            setProfiles(prev => ({ ...prev, [user.id]: newProfile }))
          }
        }
      }

      await addComment(content, user.id, profile?.username || 'User')
      setContent('')
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert('Failed to post comment. Please try again.')
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading comments…</div>
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
        {error}
        <button 
          onClick={() => window.location.reload()} 
          className="ml-2 underline hover:no-underline"
        >
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share a solution or insight…"
            maxLength={1000}
            disabled={isAddingComment}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {content.length}/1000 characters
            </span>
            <Button 
              type="submit" 
              size="sm" 
              disabled={isAddingComment || !content.trim()}
              className="gap-2"
            >
              {isAddingComment && <Loader2 className="h-3 w-3 animate-spin" />}
              {isAddingComment ? 'Posting…' : 'Post comment'}
            </Button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          {user ? 'Be the first to comment.' : 'Sign in to view and post comments.'}
        </div>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => {
            // Get profile from comment or profiles cache
            const commentProfile = comment.profiles
            const cachedProfile = profiles[comment.user_id]
            
            // Merge profile data, preferring cached profile which has name field
            const profile = cachedProfile || commentProfile
            const displayName = profile?.name || profile?.username || 'Unknown user'
            
            return (
              <li 
                key={comment.id} 
                className={cn(
                  'rounded border p-3 text-sm transition-all duration-200',
                  comment.isOptimistic && 'bg-muted/50 border-primary/20',
                  comment.isPending && 'opacity-70'
                )}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={profile?.avatar_url || '/next.svg'}
                    alt={displayName}
                    className="h-7 w-7 rounded-full border object-cover bg-card mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{displayName}</span>
                      {profile?.username && (
                        <span className="text-xs text-muted-foreground">@{profile.username}</span>
                      )}
                      <div className="ml-auto flex items-center gap-2">
                        {comment.isPending && (
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        )}
                        <RelativeTime 
                          date={comment.created_at} 
                          className="text-xs text-muted-foreground"
                        />
                      </div>
                    </div>
                    <div className="text-foreground whitespace-pre-wrap">{comment.content}</div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}