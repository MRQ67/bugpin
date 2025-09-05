'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, email, created_at, updated_at') // Include all Profile fields
        .eq('id', userId)
        .maybeSingle()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" - not a real error
        console.error('Error fetching profile:', error)
      }
      
      return profileData as Profile | null
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      return null
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }, [user, fetchProfile])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      // Clear local state immediately
      setUser(null)
      setProfile(null)
      setSession(null)
      // Redirect to home page after sign out
      router.push('/home')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }, [supabase, router])

  useEffect(() => {
    let mounted = true
    let profileChannel: any = null

    const handleSession = async (currentSession: Session | null) => {
      if (!mounted) return
      
      setSession(currentSession)
      
      if (currentSession?.user) {
        setUser(currentSession.user)
        // Set loading to false immediately for better UX, profile loads in background
        setLoading(false)
        
        // Load profile in background
        const profileData = await fetchProfile(currentSession.user.id)
        if (mounted) {
          setProfile(profileData)
        }
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }
        
    const initializeAuth = async () => {
      try {
        // Get initial session - this should be safe
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting initial session:', error)
        }
        
        await handleSession(initialSession)
      } catch (error) {
        console.error('Error in initializeAuth:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setSession(null)
          setLoading(false)
        }
      }
    }

    const setupProfileSubscription = (userId: string) => {
      if (profileChannel) {
        supabase.removeChannel(profileChannel)
      }
      
      profileChannel = supabase
        .channel(`profile:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`
          },
          (payload) => {
            if (!mounted) return
            
            if (payload.eventType === 'UPDATE' && payload.new) {
              setProfile(payload.new as Profile)
            } else if (payload.eventType === 'INSERT' && payload.new) {
              setProfile(payload.new as Profile)
            } else if (payload.eventType === 'DELETE') {
              setProfile(null)
            }
          }
        )
        .subscribe()
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return
        
        console.log('Auth state change:', event, !!currentSession)
        
        if (event === 'SIGNED_OUT' || !currentSession) {
          setUser(null)
          setProfile(null)
          setSession(null)
          
          // Clean up profile subscription
          if (profileChannel) {
            supabase.removeChannel(profileChannel)
            profileChannel = null
          }
        } else {
          // Handle any auth event with a session (SIGNED_IN, TOKEN_REFRESHED, etc.)
          await handleSession(currentSession)
          
          // Set up profile subscription if we have a user
          if (currentSession.user && !profileChannel) {
            setupProfileSubscription(currentSession.user.id)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
      
      if (profileChannel) {
        supabase.removeChannel(profileChannel)
      }
    }
  }, [supabase, fetchProfile])

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
