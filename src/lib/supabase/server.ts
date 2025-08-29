import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Read-only client for page rendering (cannot modify cookies)
export const createClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {
          // No-op for read-only client - prevents cookie modification errors
        },
        remove: () => {
          // No-op for read-only client - prevents cookie modification errors
        },
      },
    }
  )
}

// Client for Server Actions and Route Handlers (can modify cookies)
export const createActionClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Silently ignore cookie setting errors in read-only contexts
            if (process.env.NODE_ENV === 'development') {
              console.warn('Could not set cookie:', name, error)
            }
          }
        },
        remove: (name: string, options: any) => {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 })
          } catch (error) {
            // Silently ignore cookie removal errors in read-only contexts
            if (process.env.NODE_ENV === 'development') {
              console.warn('Could not remove cookie:', name, error)
            }
          }
        },
      },
    }
  )
}
