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
  const ET = "America/New_York"

  // ---------- Helper to get current ET string for datetime-local ----------
  function getETNowString(): string {
    const now = new Date()
    const etParts = now
      .toLocaleString("en-US", {
        timeZone: ET,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .match(/\d+/g)
    if (!etParts) return now.toISOString().slice(0, 16)
    const [month, day, year, hour, minute] = etParts
    return `${year}-${month}-${day}T${hour}:${minute}`
  }

  // ---------- State ----------
  const [readingTime, setReadingTime] = useState(getETNowString)
  const [records, setRecords] = useState<BPRecord[]>([])
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [heartRate, setHeartRate] = useState("")
  const [comments, setComments] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // ---------- Load Records ----------
  async function loadRecords() {
    const res = await fetch("/api/bp")
    const data = await res.json()
    setRecords(data)
  }

  useEffect(() => {
    loadRecords()
  }, [])

  // ---------- Determine Tag ----------
  function getTag(dateString: string) {
    const hour = new Date(dateString).getHours()
    if (hour < 12) return "Morning ☀️"
    if (hour < 17) return "Afternoon 🌤"
    if (hour < 21) return "Evening 🌙"
    return "Night 🌑"
  }

  // ---------- Reset Form ----------
  function resetForm() {
    setReadingTime(getETNowString())
    setSystolic("")
    setDiastolic("")
    setHeartRate("")
    setComments("")
    setEditingId(null)
  }

  // ---------- Save Record ----------
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

  // ---------- Edit Record ----------
  function editRecord(r: BPRecord) {
    setEditingId(r.id)
    const etDate = new Date(r.reading_time).toLocaleString("en-US", {
      timeZone: ET,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).match(/\d+/g)
    if (etDate) {
      const [month, day, year, hour, minute] = etDate
      setReadingTime(`${year}-${month}-${day}T${hour}:${minute}`)
    }
    setSystolic(String(r.systolic))
    setDiastolic(String(r.diastolic))
    setHeartRate(String(r.heart_rate || ""))
    setComments(r.comments || "")
  }

  // ---------- Delete Record ----------
  async function deleteRecord(id: number) {
    await fetch("/api/bp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    loadRecords()
  }

  // ---------- Filter records for chart ----------
  const chartRecords = records.filter((r) => {
    if (startDate && new Date(r.reading_time) < new Date(startDate)) return false
    if (endDate && new Date(r.reading_time) > new Date(endDate)) return false
    return true
  })

  // ---------- Prepare chart data ----------
  const chartData = {
    labels: chartRecords.map((r) =>
      new Date(r.reading_time).toLocaleString("en-US", {
        timeZone: ET,
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
        data: chartRecords.map((r) => r.systolic),
        borderColor: "#1976d2",
        backgroundColor: "rgba(25,118,210,0.2)",
        tension: 0.3,
      },
      {
        label: "Diastolic",
        data: chartRecords.map((r) => r.diastolic),
        borderColor: "#43a047",
        backgroundColor: "rgba(67,160,71,0.2)",
        tension: 0.3,
      },
      {
        label: "Heart Rate",
        data: chartRecords.map((r) => r.heart_rate),
        borderColor: "#fbc02d",
        backgroundColor: "rgba(251,192,45,0.2)",
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

  // ---------- UI ----------
  return (
    <div className="container">
      {/* Entry Form */}
      <div className="card">
        <h2>Blood Pressure Entry</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          <div>
            <label>Entry Time</label>
            <input
              type="datetime-local"
              value={readingTime}
              onChange={(e) => setReadingTime(e.target.value)}
            />
          </div>

          <div></div>

          <input
            placeholder="Systolic"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
          />

          <input
            placeholder="Diastolic"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
          />

          <input
            placeholder="Heart Rate"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
          />

          <input
            placeholder="Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        <div style={{ marginTop: "12px" }}>
          <button onClick={saveRecord}>
            {editingId ? "Update Entry" : "Save Entry"}
          </button>

          {editingId && (
            <button
              className="secondary"
              style={{ marginLeft: "10px" }}
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="card">
        <h2>History</h2>
        <table>
          <thead>
            <tr>
              <th>Date (ET)</th>
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
                <td>
                  {new Date(r.reading_time).toLocaleString("en-US", {
                    timeZone: ET,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </td>
                <td>{getTag(r.reading_time)}</td>
                <td>{r.systolic}</td>
                <td>{r.diastolic}</td>
                <td>{r.heart_rate}</td>
                <td>{r.comments}</td>
                <td>
                  <button className="secondary" onClick={() => editRecord(r)}>
                    Edit
                  </button>
                  <button
                    className="danger"
                    style={{ marginLeft: "6px" }}
                    onClick={() => deleteRecord(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BP Trend Chart */}
      <div className="card">
        <h2>BP Trend</h2>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <div>
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  )
}