import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest){

  const auth = req.cookies.get("site_auth")?.value

  const path = req.nextUrl.pathname

  const isPublic =
    path.startsWith("/login") ||
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path === "/favicon.ico"

  if(!auth && !isPublic){
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}
