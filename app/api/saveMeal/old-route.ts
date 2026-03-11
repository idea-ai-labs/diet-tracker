import { sql } from "@vercel/postgres"

export async function POST(req:Request){

const {date,time,food}=await req.json()

await sql`
INSERT INTO meals(meal_date,meal_time,food)
VALUES(${date},${time},${food})
`

return Response.json({success:true})

}

