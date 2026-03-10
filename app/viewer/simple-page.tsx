"use client"

import { useEffect, useState } from "react"

type Meal = {
  id: number
  meal_date: string
  meal_time: string
  food: string
}

export default function ViewerPage() {

  const today = new Date().toISOString().split("T")[0]

  const [startDate, setStartDate] = useState<string>(today)
  const [data, setData] = useState<Meal[]>([])
  const [editing, setEditing] = useState<Meal | null>(null)

  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [cellValue, setCellValue] = useState("")

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

  // Generate week dates
  const weekDates: string[] = []

  if (startDate) {

    const [y, m, d] = startDate.split("-").map(Number)
    const start = new Date(y, m - 1, d)

    const sunday = new Date(start)
    sunday.setDate(start.getDate() - start.getDay())

    for (let i = 0; i < 7; i++) {

      const day = new Date(sunday)
      day.setDate(sunday.getDate() + i)

      const yyyy = day.getFullYear()
      const mm = String(day.getMonth() + 1).padStart(2, "0")
      const dd = String(day.getDate()).padStart(2, "0")

      weekDates.push(`${yyyy}-${mm}-${dd}`)
    }
  }

  useEffect(() => {
    if (startDate) loadGrid()
  }, [startDate])

  // Load meals
  async function loadGrid() {

    if (!startDate) return

    const end = weekDates[6]

    const res = await fetch(`/api/meals?start=${weekDates[0]}&end=${end}`)
    const json = await res.json()

    setData(json)
  }

  // Get cell value
  const getCell = (date: string, time: string) => {

    return data
      .filter((e) => e.meal_date === date && e.meal_time === time)
      .map((e) => e.food)
      .join(", ")
  }

  // Modal editing
  const openEditByDate = (date: string, time: string) => {

    const meal = data.find((e) => e.meal_date === date && e.meal_time === time)

    if (meal) {
      setEditing(meal)
    } else {
      setEditing({ id: -1, meal_date: date, meal_time: time, food: "" })
    }
  }

  const saveEdit = async () => {

    if (!editing) return

    if (editing.id === -1) {

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
        onClick={() => loadGrid()}
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

              {weekDates.map((date) => {

                const cellId = `${date}-${time}`

                return (

                  <td
                    key={cellId}
                    tabIndex={0}
                    onClick={() => {
                      const existing = getCell(date, time)
                      setEditingCell(cellId)
                      setCellValue(existing)
                    }}

                    // ⭐ Spreadsheet typing improvement
                    onKeyDown={(e) => {

                      if (editingCell !== cellId) {

                        setEditingCell(cellId)

                        if (e.key.length === 1) {
                          setCellValue(e.key)
                        } else {
                          setCellValue("")
                        }
                      }
                    }}

                  >

                    {editingCell === cellId ? (

                      <input
                        autoFocus
                        value={cellValue}
                        onChange={(e) => setCellValue(e.target.value)}

                        onKeyDown={async (e) => {

                          if (e.key === "Enter") {

                            const existing = data.find(
                              (m) => m.meal_date === date && m.meal_time === time
                            )
                            
                            if (cellValue.trim() === "") {
                            
                              // DELETE if empty
                              if (existing) {
                                await fetch(`/api/meals/${existing.id}`, {
                                  method: "DELETE",
                                })
                              }
                            
                            } else if (existing) {
                            
                              // UPDATE existing
                              await fetch(`/api/meals/${existing.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ food: cellValue }),
                              })
                            
                            } else {
                            
                              // INSERT new
                              await fetch("/api/saveMeal", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  date,
                                  time,
                                  food: cellValue,
                                }),
                              })
                            }

                            setEditingCell(null)

                            loadGrid()
                          }
                        }}

                        onBlur={() => setEditingCell(null)}

                        style={{ width: "100%" }}

                      />

                    ) : (

                      getCell(date, time)

                    )}

                  </td>
                )
              })}

            </tr>

          ))}

        </tbody>

      </table>

      {/* Modal */}

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

              <button onClick={() => setEditing(null)}>
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}
