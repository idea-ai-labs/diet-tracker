"use client"

import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

interface Row {
  test_name: string
  year: number
  value: string
  reference_range: string
}

interface Metric {
  test: string
  years: number[]
  values: number[]
  reference: string
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [alerts, setAlerts] = useState<string[]>([])
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const res = await fetch("/api/health-summary")
    const data = await res.json()
    if (!data.success) return

    const rows: Row[] = data.rows
    const grouped: Record<string, Metric> = {}

    rows.forEach(r => {
      const v = parseFloat(r.value)
      if (isNaN(v)) return

      if (!grouped[r.test_name]) {
        grouped[r.test_name] = {
          test: r.test_name,
          years: [],
          values: [],
          reference: r.reference_range
        }
      }

      grouped[r.test_name].years.push(r.year)
      grouped[r.test_name].values.push(v)
    })

    const list = Object.values(grouped)
    setMetrics(list)
    if (list.length > 0) setSelectedMetric(list[0])
    generateAlerts(list)
  }

  function generateAlerts(list: Metric[]) {
    const alerts: string[] = []

    list.forEach(m => {
      const vals = m.values
      if (vals.length >= 3) {
        const last3 = vals.slice(-3)
        if (last3[0] < last3[1] && last3[1] < last3[2])
          alerts.push(`${m.test} rising for 3 years`)
      }
    })

    setAlerts(alerts)
  }

  const trend = (vals: number[]) => {
    if (vals.length < 2) return ""
    const prev = vals[vals.length - 2]
    const curr = vals[vals.length - 1]
    if (curr > prev) return "↑"
    if (curr < prev) return "↓"
    return "→"
  }

  const latest = (vals: number[]) => vals[vals.length - 1]

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Health Dashboard</h1>

      {/* Key Indicator Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
          marginBottom: "30px"
        }}
      >
        {metrics.map(m => (
          <div
            key={m.test}
            onClick={() => setSelectedMetric(m)}
            style={{
              border: selectedMetric?.test === m.test ? "2px solid #1976d2" : "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "center",
              backgroundColor: "#f5f5f5",
              transition: "transform 0.2s"
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <strong>{m.test}</strong>
            <div style={{ fontSize: "24px", marginTop: "8px" }}>{latest(m.values)} {trend(m.values)}</div>
          </div>
        ))}
      </div>

      {/* Trend Chart for Selected Metric */}
      {selectedMetric && (
        <div
          style={{
            border: "1px solid #eee",
            padding: "15px",
            borderRadius: "6px",
            marginBottom: "30px"
          }}
        >
          <h3>{selectedMetric.test} Trend</h3>
          <Line
            data={{
              labels: selectedMetric.years,
              datasets: [
                {
                  label: selectedMetric.test,
                  data: selectedMetric.values,
                  tension: 0.3,
                  borderColor: "#1976d2",
                  backgroundColor: "rgba(25,118,210,0.2)"
                }
              ]
            }}
          />
        </div>
      )}

      {/* Alerts */}
      <h2>Alerts</h2>
      {alerts.length === 0 && <p>No alerts</p>}
      <ul>
        {alerts.map((a, i) => (
          <li key={i}>⚠ {a}</li>
        ))}
      </ul>
    </div>
  )
}