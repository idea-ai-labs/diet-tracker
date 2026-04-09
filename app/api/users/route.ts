import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"

export async function GET(){

  const { rows } = await sql`
    SELECT id, first_name, username, role FROM users
  `

  return Response.json(rows)
}

export async function POST(req: Request){

  const { first_name, last_name, username, password, role } = await req.json()

  const hash = await bcrypt.hash(password,10)

  await sql`
    INSERT INTO users (first_name, last_name, username, password, role)
    VALUES (${first_name}, ${last_name}, ${username}, ${hash}, ${role})
  `

  return Response.json({success:true})
}

export async function DELETE(req: Request){

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  await sql`DELETE FROM users WHERE id=${id}`

  return Response.json({success:true})
}
