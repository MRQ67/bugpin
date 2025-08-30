'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RelativeTime } from '@/components/ui/relative-time'

type Item = {
  id: string
  content: string
  created_at: string
  user_id: string
  user?: { name?: string | null; username?: string | null; avatar_url?: string | null }
}

export default function CommentList({ postId }: { postId: string }) {
  const supabase = createClient()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<Record<string, { name?: string | null; username?: string | null; avatar_url?: string | null }>>({})

  useEffect(() => {
    let mounted = true

    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id')
        .eq('error_post_id', postId)
        .order('created_at', { ascending: true })
      if (!mounted) return
      if (error) {
        console.error('Load comments error', error)
        return
      }
      const list = (data ?? []) as Item[]
      setItems(list)
      // Batch load profiles for unique user_ids
      const ids = Array.from(new Set(list.map((c) => c.user_id))).filter(Boolean)
      if (ids.length) {
        const { data: profs, error: pErr } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url')
          .in('id', ids)
        if (!mounted) return
        if (pErr) {
          console.error('Load profiles error', pErr)
        } else {
          const map: Record<string, { name?: string | null; username?: string | null; avatar_url?: string | null }> = {}
          for (const p of profs ?? []) map[(p as any).id] = {
            name: (p as any).name,
            username: (p as any).username,
            avatar_url: (p as any).avatar_url,
          }
          setProfiles(map)
        }
      }
    }

    const fetchInitial = async () => {
      setLoading(true)
      await fetchComments()
      if (mounted) setLoading(false)
    }

    fetchInitial()

    // Set up polling as a fallback (every 5 seconds)
    const pollInterval = setInterval(() => {
      if (mounted) {
        fetchComments()
      }
    }, 5000)

    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `error_post_id=eq.${postId}` },
        (payload: any) => {
          console.log('Comment real-time event:', payload.eventType, payload)
          if (payload.eventType === 'INSERT') {
            const inserted = payload.new as Item
            setItems((prev) => {
              // Avoid duplicates
              if (prev.some(item => item.id === inserted.id)) {
                return prev
              }
              return [...prev, inserted]
            })
            const uid = (inserted as any).user_id
            if (uid) {
              // lazy-load missing profile
              supabase
                .from('profiles')
                .select('id, name, username, avatar_url')
                .eq('id', uid)
                .single()
                .then(({ data: p }) => {
                  if (!p) return
                  setProfiles((prev) => ({
                    ...prev,
                    [(p as any).id]: {
                      name: (p as any).name,
                      username: (p as any).username,
                      avatar_url: (p as any).avatar_url,
                    },
                  }))
                })
            }
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((c) => c.id !== (payload.old as any).id))
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) => prev.map((c) => (c.id === (payload.new as any).id ? (payload.new as Item) : c)))
          }
        }
      )
      .subscribe((status) => {
        console.log('Comment subscription status:', status)
      })

    return () => {
      mounted = false
      clearInterval(pollInterval)
      supabase.removeChannel(channel)
    }
  }, [postId, supabase])

  if (loading) return <div className="text-sm text-muted-foreground">Loading comments…</div>

  if (!items.length) return <div className="text-sm text-muted-foreground">Be the first to comment.</div>

  return (
    <ul className="space-y-3">
      {items.map((c) => {
        // Use user data from comment if available, otherwise fall back to profiles cache
        const userData = c.user || profiles[c.user_id]
        const displayName = userData?.name || userData?.username || 'Unknown user'
        
        return (
          <li key={c.id} className="rounded border p-3 text-sm">
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userData?.avatar_url || '/next.svg'}
                alt={displayName}
                className="h-7 w-7 rounded-full border object-cover bg-card mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{displayName}</span>
                  {userData?.username && (
                    <span className="text-xs text-muted-foreground">@{userData.username}</span>
                  )}
                  <div className="ml-auto">
                    <RelativeTime 
                      date={c.created_at} 
                      className="text-xs text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="text-foreground whitespace-pre-wrap">{c.content}</div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
