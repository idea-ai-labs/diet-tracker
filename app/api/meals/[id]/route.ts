import { NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

// PATCH /api/meals/:id → update meal
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) return NextResponse.json({ error: "Missing meal ID" }, { status: 400 })

  const { food } = await req.json()
  if (typeof food !== "string") {
    return NextResponse.json({ error: "Invalid food value" }, { status: 400 })
  }

  const result = await sql`
    UPDATE meals
    SET food = ${food}
    WHERE id = ${id}
    RETURNING *
  `

  return NextResponse.json({ updated: result.rows[0] })
}
