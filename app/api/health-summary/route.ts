import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    const result = await sql`
      SELECT id, order_no, type, test_name, year, value, reference_range
      FROM health_summary
      ORDER BY order_no, year
    `

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