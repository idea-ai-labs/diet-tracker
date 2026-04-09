import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest){

  const auth = req.cookies.get("site_auth")

  const isLoginPage = req.nextUrl.pathname.startsWith("/login")

  if(!auth && !isLoginPage){

    return NextResponse.redirect(new URL("/login", req.url))

  }

  return NextResponse.next()

}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
}
