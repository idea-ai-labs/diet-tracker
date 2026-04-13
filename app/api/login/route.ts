import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    // 1️⃣ Check DB
    const { rows } = await sql`
      SELECT id, password, role
      FROM users
      WHERE username=${username}
    `

    // ✅ CASE 1: User exists in DB
    if (rows.length > 0) {
      const user = rows[0]

      const valid = await bcrypt.compare(password, user.password)

      if (!valid) {
        return NextResponse.json({
          success: false,
          code: "INVALID_PASSWORD"
        })
      }

      const res = NextResponse.json({
        success: true,
        code: "DB_LOGIN_SUCCESS",
        role: user.role
      })

      res.cookies.set("user_id", String(user.id), {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: true,
      })

      return res
    }

    // ✅ CASE 2: User NOT found → try ENV fallback
    if (
      process.env.SQL_EDITOR_PASSWORD &&
      password === process.env.SQL_EDITOR_PASSWORD
    ) {
      const res = NextResponse.json({
        success: true,
        code: "ENV_LOGIN_SUCCESS",
        role: "write"
      })

      // special user_id = 0 for fallback
      res.cookies.set("user_id", "0", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: true,
      })

      return res
    }

    // ❌ CASE 3: Fail
    return NextResponse.json({
      success: false,
      code: "USER_NOT_FOUND"
    })

  } catch (err) {
    console.error(err)

    return NextResponse.json({
      success: false,
      code: "SERVER_ERROR"
    })
  }
}