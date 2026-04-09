"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    setError("") // clear previous error
    setLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      setLoading(false)

      if (data.success) {
        router.push("/")
      } else {
        setError("Invalid username or password")
      }

    } catch (err) {
      setLoading(false)
      setError("Server error. Please try again.")
    }
  }

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "100px auto",
        padding: "24px",
        borderRadius: "12px",
        background: "white",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Login
      </h2>

      {/* 🔴 TOP ERROR BANNER */}
      {error && (
        <div
          style={{
            background: "#ffe5e5",
            color: "#b00020",
            padding: "10px 12px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
            border: "1px solid #ffb3b3",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>
    </div>
  )
}
