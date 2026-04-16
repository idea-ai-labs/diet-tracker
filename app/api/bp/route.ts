import { sql } from "@vercel/postgres"

// ---------------- GET ----------------
export async function GET() {
  const { rows } = await sql`
    SELECT
      id,
      reading_time,
      systolic,
      diastolic,
      heart_rate,
      comments
    FROM blood_pressure
    ORDER BY reading_time DESC
    LIMIT 50
  `

  return Response.json(rows)
}

// ---------------- POST ----------------
export async function POST(req: Request) {
  const { reading_time, systolic, diastolic, heartRate, comments } =
    await req.json()

  // 🔥 FORCE UTC STORAGE
  const utcTime = new Date(reading_time).toISOString()

  await sql`
    INSERT INTO blood_pressure
    (reading_time, systolic, diastolic, heart_rate, comments)
    VALUES
    (
      ${utcTime},
      ${Number(systolic)},
      ${Number(diastolic)},
      ${heartRate ? Number(heartRate) : null},
      ${comments || ""}
    )
  `

  return Response.json({ success: true })
}

// ---------------- PUT ----------------
export async function PUT(req: Request) {
  const { id, reading_time, systolic, diastolic, heartRate, comments } =
    await req.json()

  const utcTime = new Date(reading_time).toISOString()

  await sql`
    UPDATE blood_pressure
    SET
      reading_time = ${utcTime},
      systolic = ${Number(systolic)},
      diastolic = ${Number(diastolic)},
      heart_rate = ${heartRate ? Number(heartRate) : null},
      comments = ${comments || ""}
    WHERE id = ${id}
  `

  return Response.json({ success: true })
}

// ---------------- DELETE ----------------
export async function DELETE(req: Request) {
  const { id } = await req.json()

  await sql`
    DELETE FROM blood_pressure
    WHERE id = ${id}
  `

  return Response.json({ success: true })
}