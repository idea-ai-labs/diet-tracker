import { NextResponse } from "next/server"
import sqlite3 from "sqlite3"
import { open } from "sqlite"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { query, password } = body
    /*
    if (password !== process.env.SQL_EDITOR_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      })
    }
    */

    const db = await open({
      filename: "./data.db",
      driver: sqlite3.Database
    })

    const trimmed = query.trim().toLowerCase()

    let result

    if (trimmed.startsWith("select") || trimmed.startsWith("pragma")) {
      result = await db.all(query)
    } else {
      result = await db.run(query)
    }

    return NextResponse.json({
      success: true,
      result
    })

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    })
  }
}
