import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from './src/lib/supabase/middleware'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient(req, res)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = req.nextUrl
  const protectedPaths = ['/upload', '/profile']
  const isProtected = protectedPaths.some((p) => url.pathname.startsWith(p))

  if (isProtected && !user) {
    const redirectUrl = new URL('/sign-in', url)
    redirectUrl.searchParams.set('redirectedFrom', url.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/upload/:path*', '/profile/:path*'],
}
