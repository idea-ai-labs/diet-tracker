import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { date, time, food } = await req.json()
    if (!date || !time) return NextResponse.json({ success: false, error: "Missing date or time" })

    const cleanFood = food?.trim() ?? ""

    if (cleanFood === "") {
      // Delete meal if empty
      await db.meals.deleteMany({
        where: { meal_date: date, meal_time: time },
      })
    } else {
      // Upsert meal
      await db.meals.upsert({
        where: { meal_date_meal_time: { meal_date: date, meal_time: time } },
        update: { food: cleanFood },
        create: { meal_date: date, meal_time: time, food: cleanFood },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message })
  }
}
