import { sql } from "@vercel/postgres"

export async function GET() {

  const { rows } = await sql`
    SELECT *
    FROM blood_pressure
    ORDER BY reading_time DESC
    LIMIT 50
  `

  return Response.json(rows)
}

export async function POST(req: Request) {

  const { reading_time, systolic, diastolic, heartRate, comments } = await req.json()

  await sql`
    INSERT INTO blood_pressure
    (reading_time, systolic, diastolic, heart_rate, comments)
    VALUES
    (${reading_time}, ${systolic}, ${diastolic}, ${heartRate}, ${comments})
  `

  return Response.json({ success: true })

}

export async function DELETE(req: Request) {

  const { searchParams } = new URL(req.url)

  const id = searchParams.get("id")

  await sql`
    DELETE FROM blood_pressure
    WHERE id=${id}
  `

  return Response.json({ success: true })
}
