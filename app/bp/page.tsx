"use client"

import { useState, useEffect } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface BPRecord {
  id: number
  reading_time: string
  systolic: number
  diastolic: number
  heart_rate: number
  comments: string
}

export default function BPPage() {

  // ==============================
  // 🔥 TIME NORMALIZATION (FIX ALL ISSUES)
  // ==============================
  const parseDate = (ts: string) => {
    if (!ts) return new Date()
    return new Date(ts.replace(" ", "T"))
  }

  // ==============================
  // 🕒 HISTORY FORMAT (AM/PM RESTORED)
  // ==============================
  const formatHistory = (ts: string) => {
    const d = parseDate(ts)

    return d.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  // ==============================
  // 📥 INPUT FORMAT
  // ==============================
  const formatInput = (ts: string) =>
    ts ? ts.replace(" ", "T").slice(0, 16) : ""

  // ==============================
  // ⏱ CURRENT TIME DEFAULT
  // ==============================
  const getNowLocal = () => {
    const now = new Date()
    const offset = now.getTimezoneOffset() * 60000
    return new Date(now.getTime() - offset).toISOString().slice(0, 16)
  }

  // ==============================
  // 🌅 TAG LOGIC
  // ==============================
  const getTag = (ts: string) => {
    const hour = parseDate(ts).getHours()

    if (hour < 12) return "Morning ☀️"
    if (hour < 17) return "Afternoon 🌤"
    if (hour < 21) return "Evening 🌙"
    return "Night 🌑"
  }

  // ==============================
  // STATE
  // ==============================
  const [readingTime, setReadingTime] = useState(getNowLocal)
  const [records, setRecords] = useState<BPRecord[]>([])
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [heartRate, setHeartRate] = useState("")
  const [comments, setComments] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // ==============================
  // LOAD
  // ==============================
  async function loadRecords() {
    const res = await fetch("/api/bp")
    const data = await res.json()
    setRecords(data)
  }

  useEffect(() => {
    loadRecords()
  }, [])

  // ==============================
  // RESET
  // ==============================
  function resetForm() {
    setReadingTime(getNowLocal())
    setSystolic("")
    setDiastolic("")
    setHeartRate("")
    setComments("")
    setEditingId(null)
  }

  // ==============================
  // SAVE
  // ==============================
  async function saveRecord() {
    if (!systolic || !diastolic) return

    const payload = {
      reading_time: readingTime,
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      heartRate: Number(heartRate),
      comments,
    }

    if (editingId) {
      await fetch("/api/bp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...payload }),
      })
    } else {
      await fetch("/api/bp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }

    resetForm()
    loadRecords()
  }

  // ==============================
  // EDIT
  // ==============================
  function editRecord(r: BPRecord) {
    setEditingId(r.id)
    setReadingTime(formatInput(r.reading_time))
    setSystolic(String(r.systolic))
    setDiastolic(String(r.diastolic))
    setHeartRate(String(r.heart_rate || ""))
    setComments(r.comments || "")
  }

  // ==============================
  // DELETE
  // ==============================
  async function deleteRecord(id: number) {
    await fetch("/api/bp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    loadRecords()
  }

  // ==============================
  // FILTER
  // ==============================
  const filteredRecords = records.filter((r) => {
    const d = parseDate(r.reading_time)

    if (startDate && d < new Date(startDate)) return false
    if (endDate && d > new Date(endDate)) return false

    return true
  })

  // ==============================
  // CHART (FIXED TIME SHIFT)
  // ==============================
  const chartData = {
    labels: filteredRecords.map((r) =>
      parseDate(r.reading_time).toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    ),
    datasets: [
      {
        label: "Systolic",
        data: filteredRecords.map((r) => r.systolic),
        borderColor: "#1976d2",
        tension: 0.3,
      },
      {
        label: "Diastolic",
        data: filteredRecords.map((r) => r.diastolic),
        borderColor: "#43a047",
        tension: 0.3,
      },
      {
        label: "Heart Rate",
        data: filteredRecords.map((r) => r.heart_rate),
        borderColor: "#fbc02d",
        tension: 0.3,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "BP Trend" },
    },
  }

  // ==============================
  // UI
  // ==============================
  return (
    <div className="container">

      {/* ENTRY */}
      <div className="card">
        <h2>Blood Pressure Entry</h2>

        <input
          type="datetime-local"
          value={readingTime}
          onChange={(e) => setReadingTime(e.target.value)}
        />

        <input placeholder="Systolic" value={systolic} onChange={(e) => setSystolic(e.target.value)} />
        <input placeholder="Diastolic" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} />
        <input placeholder="Heart Rate" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} />
        <input placeholder="Comments" value={comments} onChange={(e) => setComments(e.target.value)} />

        <button onClick={saveRecord}>
          {editingId ? "Update Entry" : "Save Entry"}
        </button>
      </div>

      {/* HISTORY */}
      <div className="card">
        <h2>History</h2>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Tag</th>
              <th>Systolic</th>
              <th>Diastolic</th>
              <th>HR</th>
              <th>Comments</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>{formatHistory(r.reading_time)}</td>
                <td>{getTag(r.reading_time)}</td>
                <td>{r.systolic}</td>
                <td>{r.diastolic}</td>
                <td>{r.heart_rate}</td>
                <td>{r.comments}</td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => editRecord(r)}>Edit</button>
                    <button onClick={() => deleteRecord(r.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CHART */}
      <div className="card">
        <h2>BP Trend</h2>
        <Line data={chartData} options={chartOptions} />
      </div>

    </div>
  )
}