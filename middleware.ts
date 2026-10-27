import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/asisten', '/checklist', '/dokumen', '/insiden', '/profil']
const ADMIN_PREFIXES = ['/admin']
const AUTH_ONLY_ROUTES = ['/login', '/register']

export function middleware(req: NextRequest) {
  const { nextUrl } = req
  const pathname = nextUrl.pathname

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)
  const response = NextResponse.next({ request: { headers: requestHeaders } })

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join('; '),
  )

  const rawSession = req.cookies.get('lexora_session')?.value
  const authjsToken = req.cookies.get('authjs.session-token')?.value || req.cookies.get('__Secure-authjs.session-token')?.value

  let role = ''
  if (rawSession) {
    try {
      role = JSON.parse(decodeURIComponent(rawSession)).role ?? ''
    } catch {}
  }

  const isLoggedIn = !!authjsToken || !!rawSession

  if (isLoggedIn && AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL(role === 'ADMIN' || role === 'LEGAL_REVIEWER' ? '/admin' : '/dashboard', nextUrl))
  }

  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', nextUrl)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (role && role !== 'ADMIN' && role !== 'LEGAL_REVIEWER') {
      return NextResponse.redirect(new URL('/403', nextUrl))
    }
  }

  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', nextUrl)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
