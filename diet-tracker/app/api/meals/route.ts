import { sql } from "@vercel/postgres"

export async function POST(req:Request){

const {start,end}=await req.json()

const {rows}=await sql`
SELECT * FROM meals
WHERE meal_date BETWEEN ${start} AND ${end}
`

return Response.json(rows)

}

