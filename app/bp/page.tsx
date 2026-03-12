"use client"

import { useEffect, useState } from "react"

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from "chart.js"

import { Line } from "react-chartjs-2"

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
)

type BPReading = {
  id: number
  reading_time: string
  systolic: number
  diastolic: number
  heart_rate: number
  comments: string
}

export default function BPPage() {

  const [readings, setReadings] = useState<BPReading[]>([])

  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [heartRate, setHeartRate] = useState("")
  const [comments, setComments] = useState("")

  const [editingId, setEditingId] = useState<number | null>(null)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  async function loadData() {

    let url = "/api/bp"

    if (startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`
    }

    const res = await fetch(url)

    const data = await res.json()

    setReadings(data)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function saveReading() {

    if (!systolic || !diastolic) {
      alert("Systolic and Diastolic required")
      return
    }

    if (editingId) {

      await fetch("/api/bp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          systolic,
          diastolic,
          heartRate,
          comments
        })
      })

      setEditingId(null)

    } else {

      await fetch("/api/bp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systolic,
          diastolic,
          heartRate,
          comments
        })
      })
    }

    resetForm()
    loadData()
  }

  function resetForm() {

    setSystolic("")
    setDiastolic("")
    setHeartRate("")
    setComments("")
    setEditingId(null)
  }

  function startEdit(r: BPReading) {

    setEditingId(r.id)

    setSystolic(String(r.systolic))
    setDiastolic(String(r.diastolic))
    setHeartRate(String(r.heart_rate ?? ""))
    setComments(r.comments ?? "")

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function deleteEntry(id: number) {

    if (!confirm("Delete this reading?")) return

    await fetch(`/api/bp?id=${id}`, {
      method: "DELETE"
    })

    loadData()
  }

  const chartData = {

    labels: readings.map(r =>
      new Date(r.reading_time).toLocaleDateString()
    ),

    datasets: [
      {
        label: "Systolic",
        data: readings.map(r => r.systolic),
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: "Diastolic",
        data: readings.map(r => r.diastolic),
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: "Heart Rate",
        data: readings.map(r => r.heart_rate),
        borderWidth: 2,
        tension: 0.3
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const }
    }
  }

  return (

    <div style={{
      maxWidth: 1000,
      margin: "auto",
      padding: 20,
      fontFamily: "Arial"
    }}>

      <h1 style={{ textAlign: "center" }}>
        Blood Pressure Monitor
      </h1>

      {/* Entry Form */}

      <div style={{
        background: "#f5f7fa",
        padding: 20,
        borderRadius: 10,
        marginBottom: 30
      }}>

        <h3>
          {editingId ? "Edit Reading" : "New Reading"}
        </h3>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10
        }}>

          <input
            placeholder="Systolic"
            value={systolic}
            onChange={e => setSystolic(e.target.value)}
          />

          <input
            placeholder="Diastolic"
            value={diastolic}
            onChange={e => setDiastolic(e.target.value)}
          />

          <input
            placeholder="Heart Rate"
            value={heartRate}
            onChange={e => setHeartRate(e.target.value)}
          />

          <input
            placeholder="Comments"
            value={comments}
            onChange={e => setComments(e.target.value)}
          />

        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 15 }}>

          <button
            onClick={saveReading}
            style={{
              flex: 1,
              padding: 10,
              background: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: 6
            }}
          >
            {editingId ? "Update Reading" : "Save Reading"}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              style={{
                padding: 10
              }}
            >
              Cancel
            </button>
          )}

        </div>

      </div>

      {/* Date Filter */}

      <div style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 20
      }}>

        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />

        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />

        <button onClick={loadData}>
          Load Range
        </button>

      </div>

      {/* Chart */}

      <div style={{ marginBottom: 40 }}>

        <Line data={chartData} options={chartOptions} />

      </div>

      {/* Table */}

      <div style={{ overflowX: "auto" }}>

        <table style={{
          width: "100%",
          borderCollapse: "collapse"
        }}>

          <thead style={{
            background: "#1976d2",
            color: "white"
          }}>
            <tr>
              <th>Date</th>
              <th>BP</th>
              <th>Heart</th>
              <th>Comments</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>

            {readings.map(r => (

              <tr key={r.id} style={{
                borderBottom: "1px solid #ddd"
              }}>

                <td>
                  {new Date(r.reading_time).toLocaleString()}
                </td>

                <td>
                  <strong>
                    {r.systolic}/{r.diastolic}
                  </strong>
                </td>

                <td>{r.heart_rate}</td>

                <td>{r.comments}</td>

                <td>

                  <button
                    onClick={() => startEdit(r)}
                  >
                    Edit
                  </button>

                </td>

                <td>

                  <button
                    onClick={() => deleteEntry(r.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}