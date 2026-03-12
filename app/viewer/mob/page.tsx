"use client"

import { useEffect, useRef, useState } from "react"

type Meal = {
  id: number
  meal_date: string
  meal_time: string
  food: string
}

function formatTime12(time: string) {
  const [h, m] = time.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`
}

export default function ViewerPage() {
  const todayStr = new Date().toISOString().split("T")[0]

  const [startDate, setStartDate] = useState(todayStr)
  const [data, setData] = useState<Meal[]>([])
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [cellValue, setCellValue] = useState("")
  const [mobileDayIndex, setMobileDayIndex] = useState(0)

  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const tableRef = useRef<HTMLTableElement | null>(null)

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768

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
        `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(day.getDate()).padStart(2, "0")}`
      )
    }
  }

  useEffect(() => {
    loadGrid()
  }, [startDate])

  useEffect(() => {
    autoScrollToCurrentTime()
  }, [data])

  async function loadGrid() {
    if (weekDates.length === 0) return

    const res = await fetch(
      `/api/meals?start=${weekDates[0]}&end=${weekDates[6]}`
    )

    const json = await res.json()

    setData(json)
  }

  function autoScrollToCurrentTime() {
    if (!tableRef.current) return

    const now = new Date()

    const currentTime =
      `${String(now.getHours()).padStart(2, "0")}:` +
      `${now.getMinutes() < 30 ? "00" : "30"}`

    const row = tableRef.current.querySelector(
      `[data-time='${currentTime}']`
    )

    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const getCell = (date: string, time: string) =>
    data
      .filter((e) => e.meal_date === date && e.meal_time === time)
      .map((e) => e.food)
      .filter(Boolean)
      .join(", ")

  async function saveCell(date: string, time: string, value: string) {
    await fetch("/api/saveMeal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date,
        time,
        food: value,
      }),
    })

    loadGrid()
    setEditingCell(null)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.changedTouches[0].screenX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return

    const distance = e.changedTouches[0].screenX - touchStartX

    if (distance > 50) {
      setMobileDayIndex((i) => Math.max(0, i - 1))
    }

    if (distance < -50) {
      setMobileDayIndex((i) => Math.min(6, i + 1))
    }

    setTouchStartX(null)
  }

  const visibleDates = isMobile
    ? [weekDates[mobileDayIndex]]
    : weekDates

  return (
    <div
      style={{
        padding: "15px",
        fontFamily: "Arial",
        maxWidth: 1200,
        margin: "auto",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>
        Weekly Diet Tracker
      </h1>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: "bold" }}>Start Date</label>{" "}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      {isMobile && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <button
            onClick={() =>
              setMobileDayIndex((i) => Math.max(0, i - 1))
            }
          >
            ◀
          </button>

          <div style={{ fontWeight: "bold" }}>
            {new Date(weekDates[mobileDayIndex]).toLocaleDateString(
              "en-US",
              { weekday: "long", month: "short", day: "numeric" }
            )}
          </div>

          <button
            onClick={() =>
              setMobileDayIndex((i) => Math.min(6, i + 1))
            }
          >
            ▶
          </button>
        </div>
      )}

      <div
        style={{ overflowX: "auto" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <table
          ref={tableRef}
          style={{
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <thead
            style={{
              background: "#1976d2",
              color: "white",
            }}
          >
            <tr>
              <th style={{ padding: 10 }}>Time</th>

              {visibleDates.map((date) => {
                const localDate = new Date(date + "T00:00:00")

                const day = localDate.toLocaleDateString("en-US", {
                  weekday: "short",
                })

                const d = localDate.toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                })

                const isToday = date === todayStr

                return (
                  <th
                    key={date}
                    style={{
                      padding: 10,
                      background: isToday
                        ? "#0d47a1"
                        : "#1976d2",
                      color: "white",
                    }}
                  >
                    {day}
                    <br />
                    {d}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {times.map((time) => (
              <tr key={time} data-time={time}>
                <td
                  style={{
                    fontWeight: "bold",
                    background: "#f0f0f0",
                    padding: 8,
                  }}
                >
                  {formatTime12(time)}
                </td>

                {visibleDates.map((date) => {
                  const cellId = `${date}-${time}`

                  const cellContent = getCell(date, time)

                  const isToday = date === todayStr

                  return (
                    <td
                      key={cellId}
                      style={{
                        border: "1px solid #ddd",
                        padding: 8,
                        minWidth: 120,
                        background: isToday
                          ? "#e3f2fd"
                          : "white",
                      }}
                      onClick={() => {
                        setEditingCell(cellId)
                        setCellValue(cellContent)
                      }}
                    >
                      {editingCell === cellId ? (
                        <input
                          autoFocus
                          value={cellValue}
                          onChange={(e) =>
                            setCellValue(e.target.value)
                          }
                          onBlur={() =>
                            saveCell(date, time, cellValue)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveCell(date, time, cellValue)
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: 6,
                            border: "1px solid #1976d2",
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
