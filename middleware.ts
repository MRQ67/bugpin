import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from './src/lib/supabase/middleware'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient(req, res)

  try {
    // Use getSession instead of getUser to avoid AuthSessionMissingError
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const user = session?.user
    const url = req.nextUrl
    const protectedPaths = ['/upload', '/profile']
    const isProtected = protectedPaths.some((p) => url.pathname.startsWith(p))
    const isAuthPath = url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/auth')
    const isHomeLanding = url.pathname === '/home'

    // Redirect authenticated users from landing page to root
    if (isHomeLanding && user) {
      return NextResponse.redirect(new URL('/', url))
    }

    // Redirect authenticated users from auth pages to root
    if (isAuthPath && user && !url.pathname.includes('/callback')) {
      return NextResponse.redirect(new URL('/', url))
    }

    // Redirect unauthenticated users from root to landing page
    if (url.pathname === '/' && !user) {
      return NextResponse.redirect(new URL('/home', url))
    }

    // Handle protected routes
    if (isProtected && !user) {
      const redirectUrl = new URL('/sign-in', url)
      redirectUrl.searchParams.set('redirectedFrom', url.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error('Middleware auth error:', error)
    // If there's an auth error and we're on the root path, redirect to home
    if (req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/home', req.nextUrl))
    }
    return res
  }
}

export const config = {
  matcher: ['/', '/home', '/sign-in', '/auth/:path*', '/upload/:path*', '/profile/:path*'],
}
