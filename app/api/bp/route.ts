import { sql } from "@vercel/postgres"
import { requireWriteAccess } from "@/lib/permissions"

// ---------- GET ----------
export async function GET() {
  const { rows } = await sql`
    SELECT id, reading_time, systolic, diastolic, heart_rate, comments
    FROM blood_pressure
    ORDER BY reading_time DESC
    LIMIT 50
  `

  return Response.json(rows)
}

// ---------- POST ----------
export async function POST(req: Request) {
  try {
    await requireWriteAccess()

    const { reading_time, systolic, diastolic, heartRate, comments } =
      await req.json()

    if (!reading_time || !systolic || !diastolic) {
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    await sql`
      INSERT INTO blood_pressure
      (reading_time, systolic, diastolic, heart_rate, comments)
      VALUES
      (
        ${reading_time},
        ${Number(systolic)},
        ${Number(diastolic)},
        ${heartRate ? Number(heartRate) : null},
        ${comments || ""}
      )
    `

    return Response.json({ success: true })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 403 })
  }
}

// ---------- PUT ----------
export async function PUT(req: Request) {
  try {
    await requireWriteAccess()

    const { id, reading_time, systolic, diastolic, heartRate, comments } =
      await req.json()

    if (!id) {
      return Response.json({ success: false, error: "Missing ID" }, { status: 400 })
    }

    await sql`
      UPDATE blood_pressure
      SET
        reading_time = ${reading_time},
        systolic = ${Number(systolic)},
        diastolic = ${Number(diastolic)},
        heart_rate = ${heartRate ? Number(heartRate) : null},
        comments = ${comments || ""}
      WHERE id = ${id}
    `

    return Response.json({ success: true })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 403 })
  }
}

// ---------- DELETE ----------
export async function DELETE(req: Request) {
  try {
    await requireWriteAccess()

    const { id } = await req.json()

    if (!id) {
      return Response.json({ success: false, error: "Missing ID" }, { status: 400 })
    }

    await sql`
      DELETE FROM blood_pressure
      WHERE id = ${id}
    `

    return Response.json({ success: true })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 403 })
  }
}