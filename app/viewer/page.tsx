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
  const [editing, setEditing] = useState<Meal | null>(null)

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Generate 30-min time slots
  const times: string[] = []
  for (let h = 7; h <= 23; h++) {
    for (let m of [0, 30]) {
      if (h === 23 && m === 30) continue
      const hh = String(h).padStart(2, "0")
      const mm = String(m).padStart(2, "0")
      times.push(`${hh}:${mm}`)
    }
  }

  // Load meals from API
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

  // Find the first meal id for a cell (for editing)
  const getMealId = (dayIndex: number, time: string) => {
    const meal = data.find((e) => {
      const date = new Date(e.meal_date)
      return date.getDay() === dayIndex && e.meal_time === time
    })
    return meal ? meal.id : null
  }

  // Open edit modal for a cell
  const openEdit = (dayIndex: number, time: string) => {
    const mealId = getMealId(dayIndex, time)
    const mealFood = getCell(dayIndex, time)
    if (mealId !== null) {
      setEditing({ id: mealId, meal_date: "", meal_time: "", food: mealFood })
    } else {
      // create a temporary meal for new entry
      setEditing({ id: -1, meal_date: "", meal_time: "", food: "" })
    }
  }

  // Save edited meal
  const saveEdit = async () => {
    if (!editing) return
    if (editing.id === -1) {
      // Create new meal
      await fetch("/api/saveMeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: startDate,
          time: "07:00", // default time, adjust as needed
          food: editing.food,
        }),
      })
    } else {
      // Update existing meal
      await fetch(`/api/meals/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food: editing.food }),
      })
    }
    setEditing(null)
    loadGrid()
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
                <td
                  key={dayIndex}
                  style={{ cursor: "pointer" }}
                  onClick={() => openEdit(dayIndex, time)}
                >
                  {getCell(dayIndex, time)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>Edit Meal</h3>
            <textarea
              value={editing.food}
              onChange={(e) =>
                setEditing({ ...editing, food: e.target.value })
              }
              style={{ width: "100%", height: "80px" }}
            />
            <div style={{ marginTop: "10px", textAlign: "right" }}>
              <button onClick={saveEdit} style={{ marginRight: "10px" }}>
                Save
              </button>
              <button onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
