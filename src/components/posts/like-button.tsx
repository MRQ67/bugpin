'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

export default function LikeButton({ postId, initialCount = 0 }: { postId: string; initialCount?: number }) {
  const supabase = createClient()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!mounted) return
      setUserId(user?.id ?? null)

      const [{ data: myLike }, countRes] = await Promise.all([
        user
          ? supabase.from('likes').select('id').eq('error_post_id', postId).eq('user_id', user.id).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase.from('likes').select('id', { count: 'exact', head: true }).eq('error_post_id', postId),
      ])

      if (!mounted) return
      setLiked(Boolean(myLike))
      setCount((countRes.count as number) ?? initialCount)
    }

    bootstrap()

    const channel = supabase
      .channel(`likes:${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'likes', filter: `error_post_id=eq.${postId}` },
        (payload: any) => {
          if (payload.eventType === 'INSERT') setCount((c) => c + 1)
          if (payload.eventType === 'DELETE') setCount((c) => Math.max(0, c - 1))
          if (userId) {
            if (payload.eventType === 'INSERT' && (payload.new as any).user_id === userId) setLiked(true)
            if (payload.eventType === 'DELETE' && (payload.old as any).user_id === userId) setLiked(false)
          }
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [postId, supabase, initialCount, userId])

  const toggle = async () => {
    if (!userId) {
      return alert('Please sign in to like posts')
    }
    if (busy) return
    setBusy(true)
    try {
      if (!liked) {
        setLiked(true)
        setCount((c) => c + 1)
        const { error } = await supabase.from('likes').insert({ error_post_id: postId, user_id: userId })
        if (error) throw error
      } else {
        setLiked(false)
        setCount((c) => Math.max(0, c - 1))
        const { error } = await supabase.from('likes').delete().eq('error_post_id', postId).eq('user_id', userId)
        if (error) throw error
      }
    } catch (e) {
      // revert optimistic
      setLiked((v) => !v)
      setCount((c) => (liked ? c + 1 : Math.max(0, c - 1)))
      console.error('Toggle like error', e)
      alert('Failed to update like')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button variant={liked ? 'destructive' : 'outline'} size="sm" onClick={toggle} disabled={busy} className="gap-2">
      <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
      {count}
    </Button>
  )
}
