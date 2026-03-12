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

  const { systolic, diastolic, heartRate, comments } = await req.json()

  await sql`
    INSERT INTO blood_pressure
    (systolic, diastolic, heart_rate, comments)
    VALUES
    (${systolic}, ${diastolic}, ${heartRate}, ${comments})
  `

  return Response.json({ success: true })
}
