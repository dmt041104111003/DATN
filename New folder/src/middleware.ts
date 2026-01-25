import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = [
  "/dashboard",
  "/products",
  "/suppliers",
  "/materials",
  "/batches",
  "/shipments",
  "/agents",
  "/inventory",
  "/sales",
]
const authRoutes = ["/login"]

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|logo.svg|images).*)",
  ],
}
