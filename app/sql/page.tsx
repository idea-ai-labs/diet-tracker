"use client"

import { useState, useEffect } from "react"

export default function SqlPage() {
  const [query, setQuery] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<any[]>([])
  const [error, setError] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [message, setMessage] = useState("")

  const runQuery = async () => {
    if (!query.trim()) return

    setError("")
    setMessage("Running query...")
    setResult([])

    const res = await fetch("/api/sql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        password
      })
    })

    const data = await res.json()

    if (!data.success) {
      setError(data.error)
      setMessage("")
      return
    }

    if (Array.isArray(data.result)) {
      setResult(data.result)
      setMessage(`Returned ${data.result.length} rows`)
    } else {
      setMessage("Query executed successfully")
    }

    setHistory((prev) => [query, ...prev.slice(0, 9)])
  }

  const clearResults = () => {
    setResult([])
    setError("")
    setMessage("")
  }

  const handleKeyDown = (e: any) => {
    if (e.ctrlKey && e.key === "Enter") {
      runQuery()
    }
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>SQL Editor</h1>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "6px", width: "200px" }}
        />
      </div>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write SQL here...  (Ctrl + Enter to run)"
        style={{
          width: "100%",
          height: "180px",
          fontFamily: "monospace",
          fontSize: "14px"
        }}
      />

      <div style={{ marginTop: "10px" }}>
        <button onClick={runQuery}>Run Query</button>
        <button onClick={clearResults} style={{ marginLeft: "10px" }}>
          Clear
        </button>
      </div>

      <div style={{ marginTop: "10px", color: "green" }}>{message}</div>

      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>
          {error}
        </div>
      )}

      {result.length > 0 && (
        <table
          border={1}
          cellPadding={6}
          style={{ marginTop: "20px", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              {Object.keys(result[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val: any, j) => (
                  <td key={j}>{String(val)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {history.length > 0 && (
        <>
          <h3 style={{ marginTop: "30px" }}>Query History</h3>
          <ul>
            {history.map((h, i) => (
              <li key={i}>
                <button
                  onClick={() => setQuery(h)}
                  style={{ fontFamily: "monospace" }}
                >
                  {h}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
