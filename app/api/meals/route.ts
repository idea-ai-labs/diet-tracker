import { NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const start = searchParams.get("start")
  const end = searchParams.get("end")

  if (!start || !end) {
    return NextResponse.json({ error: "Missing dates" }, { status: 400 })
  }

  const result = await sql`
    SELECT
      id,
      TO_CHAR(meal_date, 'YYYY-MM-DD') AS meal_date,
      TO_CHAR(meal_time, 'HH24:MI') AS meal_time,
      food
    FROM meals
    WHERE meal_date BETWEEN ${start} AND ${end}
    ORDER BY meal_date, meal_time
  `

  return NextResponse.json(result.rows)
}
