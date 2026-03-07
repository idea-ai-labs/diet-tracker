"use client"

import { useEffect, useState } from "react"

type Meal = {
  id: number
  meal_date: string
  meal_time: string
  food: string
}

export default function ViewerPage() {
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [data, setData] = useState<Meal[]>([])

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const times: string[] = []
  for (let h = 7; h <= 23; h++) {
    for (let m of [0, 30]) {
      if (h === 23 && m === 30) continue
      const hh = String(h).padStart(2, "0")
      const mm = String(m).padStart(2, "0")
      times.push(`${hh}:${mm}`)
    }
  }

  async function loadGrid() {
    if (!startDate || !endDate) return
    const res = await fetch(`/api/meals?start=${startDate}&end=${endDate}`)
    const json = await res.json()
    setData(json)
  }

  // Helper to get meals for a given day index and time
  const getCell = (dayIndex: number, time: string) => {
    return data
      .filter((e) => {
        const date = new Date(e.meal_date)
        return date.getDay() === dayIndex && e.meal_time === time
      })
      .map((e) => e.food)
      .join(", ")
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Weekly Viewer</h1>

      <label>
        Start Date:{" "}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>

      <label style={{ marginLeft: "20px" }}>
        End Date:{" "}
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </label>

      <button
        style={{ marginLeft: "20px" }}
        onClick={() => {
          loadGrid()
        }}
      >
        Show
      </button>

      <table
        border={1}
        style={{
          marginTop: "20px",
          borderCollapse: "collapse",
          width: "100%",
          textAlign: "left",
        }}
      >
        <thead>
          <tr>
            <th>Time</th>
            {days.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((time) => (
            <tr key={time}>
              <td>{time}</td>
              {days.map((_, dayIndex) => (
                <td key={dayIndex}>{getCell(dayIndex, time)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
