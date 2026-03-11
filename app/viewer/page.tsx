"use client"

import { useEffect, useState, useRef } from "react"

type Meal = {
  id: number
  meal_date: string
  meal_time: string
  food: string
}

export default function ViewerPage() {

  const today = new Date().toISOString().split("T")[0]

  const [startDate, setStartDate] = useState(today)
  const [data, setData] = useState<Meal[]>([])
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [cellValue, setCellValue] = useState("")
  const [saving, setSaving] = useState(false)

  const navigatingRef = useRef(false)

  const times: string[] = []

  for (let h = 7; h <= 23; h++) {
    for (let m of [0, 30]) {
      if (h === 23 && m === 30) continue
      times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
    }
  }

  const weekDates: string[] = []

  if (startDate) {

    const [y, m, d] = startDate.split("-").map(Number)

    const start = new Date(y, m - 1, d)

    const sunday = new Date(start)

    sunday.setDate(start.getDate() - start.getDay())

    for (let i = 0; i < 7; i++) {

      const day = new Date(sunday)

      day.setDate(sunday.getDate() + i)

      weekDates.push(
        `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`
      )

    }

  }

  useEffect(() => {
    if (startDate) loadGrid()
  }, [startDate])

  async function loadGrid() {

    const res = await fetch(`/api/meals?start=${weekDates[0]}&end=${weekDates[6]}`)

    const json = await res.json()

    setData(json)

  }

  const getCell = (date: string, time: string) =>
    data
      .filter(e => e.meal_date === date && e.meal_time === time)
      .map(e => e.food)
      .filter(Boolean)
      .join(", ")

  async function saveOrDeleteCell(date: string, time: string) {

    if (saving) return

    setSaving(true)

    try {

      const value = cellValue.trim()

      if (value === "") {

        await fetch("/api/deleteMeal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, time })
        })

      } else {

        await fetch("/api/saveMeal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, time, food: value })
        })

      }

      await loadGrid()

    } catch (err) {

      console.error(err)

    } finally {

      setSaving(false)

    }

  }

  function moveToCell(dateIndex: number, timeIndex: number) {

    if (dateIndex < 0 || dateIndex >= weekDates.length) return
    if (timeIndex < 0 || timeIndex >= times.length) return

    const newCell = `${weekDates[dateIndex]}-${times[timeIndex]}`

    setEditingCell(newCell)

    const value = getCell(weekDates[dateIndex], times[timeIndex])

    setCellValue(value)

  }

  return (

    <div style={{ padding: 30, fontFamily: "Arial", maxWidth: 1200, margin: "auto" }}>

      <h1 style={{ textAlign: "center", marginBottom: 30 }}>
        Weekly Diet Tracker
      </h1>

      <div style={{ marginBottom: 20, display: "flex", gap: 15, alignItems: "center" }}>

        <label style={{ fontWeight: "bold" }}>
          Start Date
        </label>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc" }}
        />

        <button
          onClick={loadGrid}
          style={{
            padding: "7px 15px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Show Week
        </button>

      </div>

      <div style={{ overflowX: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: 8 }}>

        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 700 }}>

          <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>

            <tr>

              <th style={{ padding: 10 }}>
                Time
              </th>

              {weekDates.map(date => {

                const localDate = new Date(date + "T00:00:00")

                const dayName = localDate.toLocaleDateString("en-US", { weekday: "short" })

                const formattedDate = localDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })

                return (
                  <th key={date} style={{ padding: 10 }}>
                    {dayName}
                    <br />
                    {formattedDate}
                  </th>
                )

              })}

            </tr>

          </thead>

          <tbody>

            {times.map((time, timeIndex) => (

              <tr key={time}>

                <td style={{ padding: 8, fontWeight: "bold", background: "#f0f0f0" }}>
                  {time}
                </td>

                {weekDates.map((date, dateIndex) => {

                  const cellId = `${date}-${time}`

                  const cellContent = getCell(date, time)

                  return (

                    <td
                      key={cellId}
                      onClick={() => {

                        if (saving) return

                        setEditingCell(cellId)
                        setCellValue(cellContent)

                      }}
                      style={{
                        padding: 6,
                        border: "1px solid #ddd",
                        cursor: "pointer",
                        backgroundColor: editingCell === cellId ? "#fff9c4" : "#fff"
                      }}
                    >

                      {editingCell === cellId ? (

                        <input
                          autoFocus
                          value={cellValue}
                          disabled={saving}

                          onChange={(e) => setCellValue(e.target.value)}

                          onKeyDown={async (e) => {

                            let nextRow = timeIndex
                            let nextCol = dateIndex

                            if (e.key === "Enter") nextRow++
                            if (e.key === "Tab") nextCol++
                            if (e.key === "ArrowRight") nextCol++
                            if (e.key === "ArrowLeft") nextCol--
                            if (e.key === "ArrowDown") nextRow++
                            if (e.key === "ArrowUp") nextRow--

                            if (nextRow !== timeIndex || nextCol !== dateIndex) {

                              e.preventDefault()

                              navigatingRef.current = true

                              await saveOrDeleteCell(date, time)

                              moveToCell(nextCol, nextRow)

                              navigatingRef.current = false

                            }

                          }}

                          onBlur={async () => {

                            if (navigatingRef.current) return

                            await saveOrDeleteCell(date, time)

                            setEditingCell(null)

                          }}

                          style={{
                            width: "100%",
                            padding: "4px 6px",
                            borderRadius: 4,
                            border: "1px solid #1976d2"
                          }}
                        />

                      ) : (

                        cellContent

                      )}

                    </td>

                  )

                })}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}