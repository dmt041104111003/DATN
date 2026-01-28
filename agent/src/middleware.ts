import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/login']
const dashboardPrefixes = ['/dashboard']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasToken = request.cookies.get('access_token')
  const isPublic = publicRoutes.includes(pathname)
  const isDashboard = dashboardPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const defaultAuthedPath = '/dashboard'
  const loginPath = '/login'

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
