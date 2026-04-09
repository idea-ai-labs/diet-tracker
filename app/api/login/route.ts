import { NextResponse } from "next/server"

export async function POST(req: Request){

  const { password } = await req.json()

  if(password !== process.env.SQL_EDITOR_PASSWORD){

    return Response.json({ success:false })

  }

  const response = NextResponse.json({ success:true })

  response.cookies.set("site_auth","1",{
    httpOnly:true,
    secure:true,
    path:"/"
  })

  return response

}
