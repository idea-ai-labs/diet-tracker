import { sql } from "@vercel/postgres"

export async function POST(req: Request) {

  const { name, details } = await req.json()

  await sql`
    INSERT INTO logs (name, details)
    VALUES (${name}, ${details})
  `

  return Response.json({ success: true })

}

export async function GET() {

  const { rows } = await sql`
    SELECT id, name, details, created_at
    FROM logs
    ORDER BY created_at DESC
  `

  return Response.json(rows)

}
