'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PostGrid from './post-grid'
import { toast } from 'sonner'

interface RealtimePostGridProps {
  initialPosts: any[]
}

export default function RealtimePostGrid({ initialPosts }: RealtimePostGridProps) {
  const [posts, setPosts] = useState(initialPosts)
  const supabase = createClient()

  useEffect(() => {
    // Set initial posts when they change from server
    setPosts(initialPosts)
  }, [initialPosts])

  useEffect(() => {
    let mounted = true

    // Set up real-time subscription for new posts
    const channel = supabase
      .channel('error_posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'error_posts'
        },
        (payload) => {
          if (!mounted) return

          const newPost = payload.new as any
          setPosts(currentPosts => {
            // Check if post already exists to prevent duplicates
            const exists = currentPosts.some(p => p.id === newPost.id)
            if (exists) return currentPosts
            
            // Add new post to the beginning with default like data
            return [{
              ...newPost,
              likes_count: 0,
              user_liked: false
            }, ...currentPosts]
          })
          
          // Optional: Show toast for new posts
          toast.success('New error post shared!')
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'error_posts'
        },
        (payload) => {
          if (!mounted) return

          const updatedPost = payload.new as any
          setPosts(currentPosts => 
            currentPosts.map(post => 
              post.id === updatedPost.id 
                ? { ...post, ...updatedPost }
                : post
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'error_posts'
        },
        (payload) => {
          if (!mounted) return

          const deletedPostId = (payload.old as any).id
          setPosts(currentPosts => 
            currentPosts.filter(post => post.id !== deletedPostId)
          )
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return <PostGrid posts={posts} />
}
