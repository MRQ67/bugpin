'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      const supabase = createClient()
      // Complete the PKCE auth flow by exchanging the code in the URL for a session
      const url = new URL(window.location.href)
      const redirectedFrom = url.searchParams.get('redirectedFrom') || '/'
      const code = url.searchParams.get('code')
      const errorParam = url.searchParams.get('error')

      // If there's no code or an error param, bail out quickly
      if (!code || errorParam) {
        router.replace('/sign-in?error=callback')
        return
      }

      // Safety timeout to avoid getting stuck
      const timeout = setTimeout(() => {
        router.replace('/sign-in?error=timeout')
      }, 8000)
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
        if (error) {
          console.error('OAuth exchange error:', error)
          router.replace('/sign-in?error=oauth')
          return
        }
        // Optional: verify session
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          // Fallback if session not yet present
          router.replace('/sign-in?error=nosession')
          return
        }
        router.replace(redirectedFrom)
      } catch (e) {
        console.error('OAuth callback failure:', e)
        router.replace('/sign-in?error=exception')
      } finally {
        clearTimeout(timeout)
      }
    }
    run()
  }, [router])

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
      Completing sign-in...
    </div>
  )
}
