import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { query } = body

    // Password check
  if (password !== process.env.SQL_EDITOR_PASSWORD) {
    return Response.json({
      success: false,
      error: "Unauthorized"
    })
  }


    const result = await sql.query(query)

    return NextResponse.json({
      success: true,
      rows: result.rows
    })

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    })
  }
}
