// app/api/saveMeal/route.ts
import { sql } from "@vercel/postgres"

export async function POST(req: Request) {
  const { date, time, food } = await req.json()
  if (!date || !time) return Response.json({ success: false, error: "Missing date or time" })

  const cleanFood = (food ?? "").trim()

  try {
    if (cleanFood === "") {
      // Delete meal if empty
      await sql`DELETE FROM meals WHERE meal_date = ${date} AND meal_time = ${time}`
    } else {
      // Upsert meal
      // Ensure you have UNIQUE(meal_date, meal_time) on your table
      await sql`
        INSERT INTO meals (meal_date, meal_time, food)
        VALUES (${date}, ${time}, ${cleanFood})
        ON CONFLICT (meal_date, meal_time) DO UPDATE
        SET food = ${cleanFood}
      `
    }

    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ success: false, error: err.message })
  }
}