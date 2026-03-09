no"use client"

import { useEffect, useState } from "react"

type Meal = {
  id: number
  meal_date: string
  meal_time: string
  food: string
}

export default function ViewerPage() {
  const [startDate, setStartDate] = useState<string>("")
  const [data, setData] = useState<Meal[]>([])
  const [editing, setEditing] = useState<Meal | null>(null)

  // Generate 30-min time slots from 7:00 to 23:30
  const times: string[] = []
  for (let h = 7; h <= 23; h++) {
    for (let m of [0, 30]) {
      if (h === 23 && m === 30) continue
      const hh = String(h).padStart(2, "0")
      const mm = String(m).padStart(2, "0")
      times.push(`${hh}:${mm}`)
    }
  }

  // Generate 7 dates for the week (Sunday → Saturday) based on startDate
  const weekDates: string[] = []
  if (startDate) {
    const start = new Date(startDate)
    const sunday = new Date(start)
    sunday.setDate(start.getDate() - start.getDay()) // move to Sunday
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday)
      d.setDate(sunday.getDate() + i)
      weekDates.push(d.toISOString().split("T")[0])
    }
  }

  // Load meals from API
  async function loadGrid() {
    if (!startDate) return
    const end = weekDates[6] // Saturday of the week
    const res = await fetch(`/api/meals?start=${weekDates[0]}&end=${end}`)
    const json = await res.json()
    setData(json)
  }

  // Helper to get meals for a given date + time
  const getCell = (date: string, time: string) => {
    return data
      .filter((e) => e.meal_date === date && e.meal_time === time)
      .map((e) => e.food)
      .join(", ")
  }

  // Open edit modal for a cell
  const openEditByDate = (date: string, time: string) => {
    const meal = data.find((e) => e.meal_date === date && e.meal_time === time)
    if (meal) {
      setEditing(meal)
    } else {
      setEditing({ id: -1, meal_date: date, meal_time: time, food: "" })
    }
  }

  // Save meal (create or update)
  const saveEdit = async () => {
    if (!editing) return
    if (editing.id === -1) {
      // Create new meal
      await fetch("/api/saveMeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editing.meal_date,
          time: editing.meal_time,
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

      <button
        style={{ marginLeft: "20px" }}
        onClick={() => {
          loadGrid()
        }}
      >
        Show Week
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

            {weekDates.map((date) => {
            const localDate = new Date(date + "T00:00:00")
          
            const dayName = localDate.toLocaleDateString("en-US", {
              weekday: "short",
            })
          
            const formattedDate = localDate.toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
            })
          
            return (
              <th key={date}>
                {dayName}
                <br />
                {formattedDate}
              </th>
            )
          })}
          </tr>
        </thead>
        <tbody>
          {times.map((time) => (
            <tr key={time}>
              <td>{time}</td>
              {weekDates.map((date) => (
                <td
                  key={date}
                  style={{ cursor: "pointer", minWidth: "100px", padding: "4px" }}
                  onClick={() => openEditByDate(date, time)}
                >
                  {getCell(date, time)}
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
            <p>
              {editing.meal_date} {editing.meal_time}
            </p>
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
