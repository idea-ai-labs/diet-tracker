"use client"

import { useEffect, useState } from "react"

interface HealthSummaryRow {
  id: number
  order_no: number
  type: string
  test_name: string
  year: number
  value: string
  reference_range: string
}

interface PivotRow {
  type: string
  test_name: string
  reference_range: string
  values: Record<number, string>
}

export default function HealthSummaryPage() {

  const [rows, setRows] = useState<PivotRow[]>([])
  const [years, setYears] = useState<number[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {

    const res = await fetch("/api/health-summary")
    const json = await res.json()

    if (!json.success) return

    const records: HealthSummaryRow[] = json.rows

    const uniqueYears = Array.from(
      new Set(records.map(r => r.year))
    ).sort()

    setYears(uniqueYears)

    const grouped: Record<string, PivotRow> = {}

    records.forEach(r => {

      const key = `${r.type}-${r.test_name}`

      if (!grouped[key]) {
        grouped[key] = {
          type: r.type,
          test_name: r.test_name,
          reference_range: r.reference_range,
          values: {}
        }
      }

      grouped[key].values[r.year] = r.value
    })

    setRows(Object.values(grouped))
  }

  function getTrend(values: Record<number,string>, year:number){

    const current = parseFloat(values[year] ?? "")
    const prev = parseFloat(values[year-1] ?? "")

    if (isNaN(current) || isNaN(prev)) return ""

    if (current > prev) return "↑"
    if (current < prev) return "↓"
    return "→"
  }

  function getColor(value:string, range:string){

    const v = parseFloat(value)

    if (isNaN(v)) return {}

    const parts = range.split("-")

    if (parts.length === 2){

      const low = parseFloat(parts[0])
      const high = parseFloat(parts[1])

      if (!isNaN(low) && v < low) return { background:"#ffe0e0" }
      if (!isNaN(high) && v > high) return { background:"#ffe0e0" }

      return { background:"#e8f7e8" }
    }

    return {}
  }

  function exportExcel(){

    const header = ["Type","Test",...years,"Reference Range"]

    const csvRows = []

    csvRows.push(header.join(","))

    rows.forEach(r => {

      const row = [
        r.type,
        r.test_name,
        ...years.map(y => r.values[y] ?? ""),
        r.reference_range
      ]

      csvRows.push(row.join(","))
    })

    const blob = new Blob([csvRows.join("\n")],{type:"text/csv"})
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "health_summary.csv"
    a.click()

    URL.revokeObjectURL(url)
  }

  function sparkline(values:Record<number,string>){

    const nums = years
      .map(y => parseFloat(values[y]))
      .filter(v => !isNaN(v))

    if(nums.length < 2) return null

    const max = Math.max(...nums)
    const min = Math.min(...nums)

    const points = nums.map((v,i)=>{

      const x = (i/(nums.length-1))*100
      const y = 30 - ((v-min)/(max-min))*30

      return `${x},${y}`
    }).join(" ")

    return (
      <svg width="100" height="30">
        <polyline
          fill="none"
          stroke="steelblue"
          strokeWidth="2"
          points={points}
        />
      </svg>
    )
  }

  return (

    <div style={{padding:"20px",fontFamily:"Arial"}}>

      <h1>Health Summary</h1>

      <button
        onClick={exportExcel}
        style={{
          marginBottom:"15px",
          padding:"8px 14px",
          cursor:"pointer"
        }}
      >
        Export to Excel
      </button>

      <div style={{overflowX:"auto"}}>

        <table
          style={{
            borderCollapse:"collapse",
            minWidth:"900px",
            width:"100%"
          }}
        >

          <thead>

            <tr style={{background:"#f0f0f0"}}>

              <th style={cell}>Type</th>
              <th style={cell}>Test</th>

              {years.map(y=>(
                <th key={y} style={cell}>{y}</th>
              ))}

              <th style={cell}>Reference</th>
              <th style={cell}>Trend</th>

            </tr>

          </thead>

          <tbody>

            {rows.map((r,i)=>(
              <tr key={i}>

                <td style={cell}>{r.type}</td>
                <td style={cell}>{r.test_name}</td>

                {years.map(y=>{

                  const val = r.values[y] ?? ""

                  return(
                    <td
                      key={y}
                      style={{
                        ...cell,
                        ...getColor(val,r.reference_range)
                      }}
                    >
                      {val} {getTrend(r.values,y)}
                    </td>
                  )
                })}

                <td style={cell}>{r.reference_range}</td>

                <td style={cell}>
                  {sparkline(r.values)}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}

const cell:React.CSSProperties={
  border:"1px solid #ddd",
  padding:"6px",
  textAlign:"center"
}