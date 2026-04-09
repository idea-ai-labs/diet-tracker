import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

  const { username, password } = await req.json()

  // 1️⃣ Check DB first
  const { rows } = await sql`
    SELECT id, password, role FROM users WHERE username=${username}
  `

  if(rows.length > 0){
    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password)
    if(!valid){
      return NextResponse.json({ success: false })
    }

    const res = NextResponse.json({ success: true })

    res.cookies.set("user_id", String(user.id), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true
    })

    return res
  }

  // 2️⃣ Fallback to ENV variable
  if(process.env.SQL_EDITOR_PASSWORD && password === process.env.SQL_EDITOR_PASSWORD){
    // temporary "super-admin" session
    const res = NextResponse.json({ success: true, fallback: true })

    res.cookies.set("user_id", "0", { // 0 means ENV fallback
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true
    })

    return res
  }

  // 3️⃣ Invalid login
  return NextResponse.json({ success: false })
}
