import { getToken } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/login') || pathname.startsWith('/vendor-onboarding')) {
    if (pathname.startsWith('/login') && token) return NextResponse.redirect(new URL('/', req.url))
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon\\.ico).*)'],
}
