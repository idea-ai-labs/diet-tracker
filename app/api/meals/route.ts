import { NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

// GET /api/meals?start=YYYY-MM-DD&end=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  if (!start || !end) {
    return NextResponse.json(
      { error: "Missing start or end date" },
      { status: 400 }
    )
  }

  // Ensure dates are in YYYY-MM-DD format
  const startDate = start
  const endDate = end

  try {
    const meals = await sql`
      SELECT id, meal_date, meal_time, food
      FROM meals
      WHERE meal_date >= ${startDate} AND meal_date <= ${endDate}
      ORDER BY meal_date, meal_time
    `

    return NextResponse.json(meals.rows)
  } catch (err) {
    console.error("Error fetching meals:", err)
    return NextResponse.json(
      { error: "Failed to fetch meals" },
      { status: 500 }
    )
  }
}
