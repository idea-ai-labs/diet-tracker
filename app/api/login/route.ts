import { NextResponse } from "next/server"

export async function POST(req: Request){

  const { password } = await req.json()

  if(password !== process.env.SQL_EDITOR_PASSWORD){
    return NextResponse.json({ success:false })
  }

  const response = NextResponse.json({ success:true })

  response.cookies.set({
    name: "site_auth",
    value: "1",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/"
  })

  return response
}
