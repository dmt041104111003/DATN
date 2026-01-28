import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/enterprise/login', '/agent/login', '/trace']
const dashboardPrefixes = ['/enterprise/dashboard', '/agent/dashboard']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasToken = request.cookies.get('access_token')
  const isLegacyLogin = pathname === '/login'
  const isLegacyDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  const isPublic = publicRoutes.includes(pathname) || pathname.startsWith('/trace')
  const isDashboard = dashboardPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const defaultAuthedPath = '/enterprise/dashboard'
  const loginPath = pathname.startsWith('/agent/') ? '/agent/login' : '/enterprise/login'

  if (isLegacyLogin) {
    return NextResponse.redirect(new URL('/enterprise/login', request.url))
  }

  if (isLegacyDashboard) {
    return NextResponse.redirect(new URL(defaultAuthedPath, request.url))
  }

  if (hasToken && isPublic) {
    return NextResponse.redirect(new URL(defaultAuthedPath, request.url))
  }

  if (!hasToken && !isPublic) {
    return NextResponse.redirect(new URL(loginPath, request.url))
  }

  if (hasToken && !isPublic && !isDashboard) {
    return NextResponse.redirect(new URL(defaultAuthedPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)'],
}
