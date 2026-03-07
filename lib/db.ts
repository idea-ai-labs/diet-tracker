import { sql } from "@vercel/postgres"

export async function initDB(){

await sql`
CREATE TABLE IF NOT EXISTS meals (
 id SERIAL PRIMARY KEY,
 meal_date DATE,
 meal_time TEXT,
 food TEXT
)
`

}

