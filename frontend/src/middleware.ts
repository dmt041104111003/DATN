import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/trace']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasToken = request.cookies.get('access_token')
  const isPublic = publicRoutes.includes(pathname) || pathname.startsWith('/trace')
  const isDashboard = pathname.startsWith('/dashboard')

  if (hasToken && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!hasToken && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasToken && !isPublic && !isDashboard) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)'],
}
