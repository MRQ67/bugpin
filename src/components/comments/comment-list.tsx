'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Item = {
  id: string
  content: string
  created_at: string
  user?: { name?: string | null; username?: string | null }
}

export default function CommentList({ postId }: { postId: string }) {
  const supabase = createClient()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchInitial = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('comments')
        .select('id, content, created_at')
        .eq('error_post_id', postId)
        .order('created_at', { ascending: true })
      if (!mounted) return
      if (error) {
        console.error('Load comments error', error)
      }
      setItems((data ?? []) as Item[])
      setLoading(false)
    }

    fetchInitial()

    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `error_post_id=eq.${postId}` },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setItems((prev) => [...prev, payload.new as Item])
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((c) => c.id !== (payload.old as any).id))
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) => prev.map((c) => (c.id === (payload.new as any).id ? (payload.new as Item) : c)))
          }
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [postId, supabase])

  if (loading) return <div className="text-sm text-muted-foreground">Loading comments…</div>

  if (!items.length) return <div className="text-sm text-muted-foreground">Be the first to comment.</div>

  return (
    <ul className="space-y-3">
      {items.map((c) => (
        <li key={c.id} className="rounded border p-3 text-sm">
          <div className="text-foreground whitespace-pre-wrap">{c.content}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {new Date(c.created_at).toLocaleString()}
          </div>
        </li>
      ))}
    </ul>
  )
}
