'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function CommentForm({ postId }: { postId: string }) {
  const supabase = createClient()
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
      
      // Get or create the current user's profile
      let profile = null
      
      // Try to get existing profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .eq('id', user.id)
        .single()
      
      if (existingProfile) {
        profile = existingProfile
      } else {
        // If no profile exists, create one with basic info using auth user metadata
        const displayName = (user.user_metadata as any)?.name || user.email?.split('@')[0] || 'User'
        const username = (user.email || '').split('@')[0]?.toLowerCase() || `user-${Math.random().toString(36).substring(2, 8)}`
        const avatar = (user.user_metadata as any)?.avatar_url || (user.user_metadata as any)?.picture || null

        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              name: displayName,
              username,
              avatar_url: avatar,
              updated_at: new Date().toISOString(),
            },
          ])
          .select('id, name, username, avatar_url')
          .single()
          
        if (profileError) {
          console.error('Error creating user profile:', profileError)
          throw new Error('Failed to create user profile')
        }
        
        profile = newProfile
      }
      
      const { data: insertedComment, error } = await supabase.from('comments').insert({
        content: text,
        error_post_id: postId,
        user_id: user.id,
      }).select().single()
      
      if (error) throw error
      console.log('Comment inserted successfully:', insertedComment)
      setContent('')
      // Real-time subscription will handle showing the new comment automatically
    } catch (e: any) {
      // Surface better diagnostics
      const msg = e?.message || e?.error_description || 'Unknown error'
      console.error('Add comment error', e)
      alert(`Failed to add comment: ${msg}`)
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
