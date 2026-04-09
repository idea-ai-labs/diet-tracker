import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const userId = req.cookies.get("user_id")?.value

  // Public routes that should NOT be blocked
  const publicRoutes = [
    "/login",
    "/api/login",
    "/api/logout",
    "/_next",
    "/favicon.ico",
  ]

  const isPublic = publicRoutes.some((path) =>
    pathname.startsWith(path)
  )

  // Allow public routes
  if (isPublic) {
    return NextResponse.next()
  }

  // ❌ Not logged in → redirect to login
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
      Run middleware on all routes except:
      - static files
      - images
      - next internals
    */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
