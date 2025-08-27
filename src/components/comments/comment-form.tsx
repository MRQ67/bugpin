'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function CommentForm({ postId }: { postId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = content.trim()
    if (!text) return
    setSubmitting(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('comments').insert({
        content: text,
        error_post_id: postId,
        user_id: user.id,
      })
      if (error) throw error
      setContent('')
      // Revalidate server components and show the new comment
      router.refresh()
    } catch (e) {
      console.error('Add comment error', e)
      alert('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share a solution or insight…"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
          {submitting ? 'Posting…' : 'Post comment'}
        </Button>
      </div>
    </form>
  )
}
