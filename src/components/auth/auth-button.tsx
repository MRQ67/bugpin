'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function AuthButton() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<null | { email?: string | null; user_metadata?: { avatar_url?: string; name?: string } }>(null)

  useEffect(() => {
    let ignore = false
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!ignore) setUser(data.session?.user ?? null)
    }
    fetchSession()
    const { data: sub } = supabase.auth.onAuthStateChange(() => fetchSession())
    return () => {
      ignore = true
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  if (!user) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link href="/sign-in">Sign in</Link>
      </Button>
    )
  }

  const avatarUrl = (user.user_metadata?.avatar_url as string) || ''
  const display = (user.user_metadata?.name as string) || user.email || 'User'

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarImage src={avatarUrl} alt={display} />
          <AvatarFallback>{display.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <Button
        size="sm"
        variant="destructive"
        disabled={loading}
        onClick={async () => {
          try {
            setLoading(true)
            await supabase.auth.signOut()
          } finally {
            setLoading(false)
          }
        }}
      >
        Sign out
      </Button>
    </div>
  )
}
