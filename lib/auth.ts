import { sql } from "@vercel/postgres"
import { cookies } from "next/headers"

export async function getUser() {

  const cookieStore = cookies()
  const userId = cookieStore.get("user_id")?.value

  if(!userId) return null

  // 1️⃣ ENV fallback session
  if(userId === "0") {
    return { id: 0, role: "write", fallback: true }
  }

  // 2️⃣ Regular DB user
  const { rows } = await sql`
    SELECT id, role FROM users WHERE id=${userId}
  `

  if(rows.length === 0) return null

  return rows[0]
}
