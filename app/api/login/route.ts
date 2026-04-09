import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password } = body

    console.log("LOGIN ATTEMPT:", username)

    const { rows } = await sql`
      SELECT id, password, role FROM users WHERE username=${username}
    `

    console.log("DB ROWS:", rows)

    // 1️⃣ DB user found
    if (rows.length > 0) {
      const user = rows[0]

      const valid = await bcrypt.compare(password, user.password)

      console.log("PASSWORD VALID:", valid)

      if (!valid) {
        return NextResponse.json({ success: false, step: "password" })
      }

      const res = NextResponse.json({ success: true, source: "db" })

      res.cookies.set("user_id", String(user.id), {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: true,
      })

      return res
    }

    // 2️⃣ ENV fallback
    if (process.env.SQL_EDITOR_PASSWORD && password === process.env.SQL_EDITOR_PASSWORD) {
      const res = NextResponse.json({ success: true, source: "env" })

      res.cookies.set("user_id", "0", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: true,
      })

      return res
    }

    // 3️⃣ FAIL
    return NextResponse.json({ success: false, step: "no_user" })

  } catch (err) {
    console.error("LOGIN ERROR:", err)

    return NextResponse.json(
      { success: false, error: "server_error" },
      { status: 500 }
    )
  }
}
