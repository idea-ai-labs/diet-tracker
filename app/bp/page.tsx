"use client"

import { useEffect, useState } from "react"

type BPReading = {
  id: number
  reading_time: string
  systolic: number
  diastolic: number
  heart_rate: number
  comments: string
}

export default function BPPage() {

  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [heartRate, setHeartRate] = useState("")
  const [comments, setComments] = useState("")
  const [readings, setReadings] = useState<BPReading[]>([])

  async function loadData() {

    const res = await fetch("/api/bp")

    const data = await res.json()

    setReadings(data)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function saveReading() {

    await fetch("/api/bp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systolic,
        diastolic,
        heartRate,
        comments
      })
    })

    setSystolic("")
    setDiastolic("")
    setHeartRate("")
    setComments("")

    loadData()
  }

  function getCategory(sys: number, dia: number) {

    if (sys < 120 && dia < 80) return "Normal"
    if (sys < 130 && dia < 80) return "Elevated"
    if (sys < 140 || dia < 90) return "Stage 1"
    return "Stage 2"
  }

  return (

    <div style={{
      maxWidth: 900,
      margin: "auto",
      padding: 20,
      fontFamily: "Arial"
    }}>

      <h1 style={{ textAlign: "center" }}>
        Blood Pressure Monitor
      </h1>

      {/* Entry Card */}

      <div style={{
        background: "#f5f7fa",
        padding: 20,
        borderRadius: 10,
        marginBottom: 30
      }}>

        <h3>New Reading</h3>

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

        <button
          onClick={saveReading}
          style={{
            marginTop: 15,
            padding: 10,
            width: "100%",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: 6
          }}
        >
          Save Reading
        </button>

      </div>

      {/* History Table */}

      <div>

        <h3>Recent Readings</h3>

        <div style={{ overflowX: "auto" }}>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse"
            }}
          >

            <thead style={{ background: "#1976d2", color: "white" }}>
              <tr>
                <th>Date</th>
                <th>BP</th>
                <th>Heart</th>
                <th>Status</th>
                <th>Comments</th>
              </tr>
            </thead>

            <tbody>

              {readings.map(r => {

                const status = getCategory(r.systolic, r.diastolic)

                return (

                  <tr key={r.id} style={{ borderBottom: "1px solid #ddd" }}>

                    <td>
                      {new Date(r.reading_time).toLocaleString()}
                    </td>

                    <td>
                      <strong>{r.systolic}/{r.diastolic}</strong>
                    </td>

                    <td>{r.heart_rate}</td>

                    <td>{status}</td>

                    <td>{r.comments}</td>

                  </tr>

                )

              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  )
}
