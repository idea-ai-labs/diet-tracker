"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { FaAppleAlt, FaFlask, FaChartLine, FaDatabase } from "react-icons/fa"

export default function HomePage() {
  const [mealCount, setMealCount] = useState(0)
  const [labCount, setLabCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState("")

  useEffect(() => {
    // Fetch total meals
    fetch("/api/meals?summary=true")
      .then((res) => res.json())
      .then((data) => setMealCount(data.count || 0))

    // Fetch total lab tests
    fetch("/api/health-summary?summary=true")
      .then((res) => res.json())
      .then((data) => {
        setLabCount(data.count || 0)
        if (data.rows?.length) {
          const latest = data.rows[data.rows.length - 1]
          setLastUpdate(`${latest.test_name} (${latest.year})`)
        }
      })
  }, [])

  const pages = [
    {
      title: "Diet Tracker",
      description: `Log your meals. Total meals: ${mealCount}`,
      href: "/viewer",
      color: "#FFCDD2",
      icon: <FaAppleAlt size={36} />
    },
    {
      title: "Health Summary",
      description: `View lab tests. Total records: ${labCount}`,
      href: "/health-summary",
      color: "#C8E6C9",
      icon: <FaFlask size={36} />
    },
    {
      title: "Health Dashboard",
      description: `Interactive trends and alerts. Last update: ${lastUpdate}`,
      href: "/dashboard",
      color: "#BBDEFB",
      icon: <FaChartLine size={36} />
    },
    {
      title: "SQL Editor",
      description: "Run custom queries on your database",
      href: "/sql",
      color: "#FFF9C4",
      icon: <FaDatabase size={36} />
    }
  ]

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>
        Welcome to Your Personal Health Tracker
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px"
        }}
      >
        {pages.map((p) => (
          <Link key={p.href} href={p.href} style={{ textDecoration: "none" }}>
            <div
              style={{
                backgroundColor: p.color,
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                transition: "transform 0.2s",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "180px",
                textAlign: "center"
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <div style={{ marginBottom: "12px", color: "#333" }}>
                {p.icon}
              </div>
              <h2 style={{ margin: "0 0 8px 0", color: "#333" }}>{p.title}</h2>
              <p style={{ margin: 0, color: "#555" }}>{p.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <footer style={{ marginTop: "60px", textAlign: "center", color: "#555" }}>
        <p>© {new Date().getFullYear()} Your Personal Health Tracker</p>
      </footer>
    </div>
  )
}

