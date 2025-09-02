'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type Profile } from '@/lib/types'

type User = {
  id: string
  email?: string | null
  user_metadata?: { 
    avatar_url?: string
    name?: string 
  }
}

export type UserProfile = {
  user: User | null
  profile: Profile | null
  loading: boolean
}

export function useUser(): UserProfile {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    let ignore = false

    const fetchUserAndProfile = async () => {
      try {
        // Get the current user
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        if (!ignore) {
          setUser(currentUser)
          
          if (currentUser) {
            // Fetch the user's profile information
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single()
            
            if (!ignore) {
              setProfile(profileData)
            }
          } else {
            setProfile(null)
          }
          
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching user and profile:', error)
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchUserAndProfile()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetchUserAndProfile()
        }
      }
    )

    return () => {
      ignore = true
      subscription.unsubscribe()
    }
  }, [supabase])

  return { user, profile, loading }
}
