"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [debug, setDebug] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    setError("")
    setDebug(null)
    setLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      console.log("LOGIN RESPONSE:", data)
      setDebug(data)

      setLoading(false)

      if (data.success) {
        router.push("/")
      } else {
        setError(data.code || "LOGIN_FAILED")
      }

    } catch (err) {
      setLoading(false)
      setError("NETWORK_ERROR")
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "100px auto" }}>

      <h2>Login</h2>

      {/* ERROR BANNER */}
      {error && (
        <div style={{
          background: "#ffe5e5",
          color: "#b00020",
          padding: 10,
          marginBottom: 10,
          borderRadius: 6
        }}>
          Error: {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <button disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* DEBUG PANEL */}
      {debug && (
        <pre style={{
          marginTop: 20,
          background: "#111",
          color: "#0f0",
          padding: 10,
          fontSize: 12
        }}>
          {JSON.stringify(debug, null, 2)}
        </pre>
      )}

    </div>
  )
}
