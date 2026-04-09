import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    const { rows } = await sql`
      SELECT id, password, role
      FROM users
      WHERE username=${username}
    `

    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        code: "USER_NOT_FOUND"
      })
    }

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

  } catch (err) {
    console.error(err)

    return NextResponse.json({
      success: false,
      code: "SERVER_ERROR"
    })
  }
}
