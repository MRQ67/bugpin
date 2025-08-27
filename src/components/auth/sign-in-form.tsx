'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Github, Mail } from 'lucide-react'

export default function SignInForm() {
  const [loading, setLoading] = useState<'github' | 'google' | null>(null)
  const supabase = createClient()

  const signIn = async (provider: 'github' | 'google') => {
    try {
      setLoading(provider)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (e) {
      console.error('OAuth error', e)
      alert('Failed to sign in. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <Button disabled={loading !== null} className="w-full" variant="default" onClick={() => signIn('github')}>
        <Github className="mr-2 h-4 w-4" />
        {loading === 'github' ? 'Signing in…' : 'Continue with GitHub'}
      </Button>
      <Button disabled={loading !== null} className="w-full" variant="secondary" onClick={() => signIn('google')}>
        <Mail className="mr-2 h-4 w-4" />
        {loading === 'google' ? 'Signing in…' : 'Continue with Google'}
      </Button>
    </div>
  )
}
