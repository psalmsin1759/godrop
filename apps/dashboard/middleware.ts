import { getToken } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'

// Granular RBAC, defense in depth: the same path -> permission mapping the
// Sidebar uses to hide links. Permission keys are shared across admin types
// by convention (e.g. "orders:read" means the same thing for a SYSTEM and a
// VENDOR admin), so one flat map covers all three consoles.
const PATH_PERMISSION_MAP: [string, string][] = [
  ['/business/riders', 'riders:read'],
  ['/business/wallet', 'wallet:read'],
  ['/business/team', 'team:read'],
  ['/orders', 'orders:read'],
  ['/vendors', 'vendors:read'],
  ['/riders', 'riders:read'],
  ['/customers', 'customers:read'],
  ['/trucks', 'trucks:read'],
  ['/parcels', 'parcels:read'],
  ['/heroes', 'heroes:write'],
  ['/banners', 'banners:write'],
  ['/coupons', 'coupons:write'],
  ['/analytics', 'analytics:read'],
  ['/disputes', 'disputes:read'],
  ['/audit-logs', 'audit_logs:read'],
  ['/admins', 'admins:read'],
  ['/roles', 'roles:read'],
  ['/businesses', 'businesses:read'],
  ['/otp-assist', 'otp:issue'],
  ['/messaging', 'messaging:send'],
  ['/push', 'push:send'],
  ['/catalog', 'catalog:read'],
  ['/wallet', 'wallet:read'],
  ['/team', 'team:read'],
  ['/settings', 'settings:read'],
]

function hasPermission(permissions: string[] | undefined, key: string): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes(key)
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/vendor-onboarding')
  ) {
    if (pathname.startsWith('/login') && token) return NextResponse.redirect(new URL('/', req.url))
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const required = PATH_PERMISSION_MAP.find(([prefix]) => pathname.startsWith(prefix))?.[1]
  if (required && !hasPermission(token.admin?.role?.permissions, required)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon\\.ico).*)'],
}
