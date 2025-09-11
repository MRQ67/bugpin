import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from './src/lib/supabase/middleware'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient(req, res)

  try {
    // Use getSession to check auth status
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const user = session?.user
    const url = req.nextUrl
    const protectedPaths = ['/upload', '/profile']
    const isProtected = protectedPaths.some((p) => url.pathname.startsWith(p))
    const isAuthPath = url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/auth')
    const isFeedPage = url.pathname === '/home'

    // Redirect authenticated users from feed page to root (which will now be the main app)
    if (isFeedPage && user) {
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
    // If there's an auth error and we're on the root path, redirect to home (landing page)
    if (req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/home', req.nextUrl))
    }
    return res
  }
}

// Updated matcher to run on all paths except static assets and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
