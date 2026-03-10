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

ChartJS.register(
CategoryScale,
LinearScale,
PointElement,
LineElement,
Tooltip,
Legend
)

interface Row {
test_name:string
year:number
value:string
reference_range:string
}

interface Metric {
test:string
years:number[]
values:number[]
reference:string
}

export default function Dashboard(){

const [metrics,setMetrics] = useState<Metric[]>([])
const [alerts,setAlerts] = useState<string[]>([])

useEffect(()=>{
load()
},[])

async function load(){

const res = await fetch("/api/health-summary")
const data = await res.json()

if(!data.success) return

const rows:Row[] = data.rows

const grouped:Record<string,Metric> = {}

rows.forEach(r=>{

const v = parseFloat(r.value)

if(isNaN(v)) return

if(!grouped[r.test_name]){

grouped[r.test_name]={
test:r.test_name,
years:[],
values:[],
reference:r.reference_range
}

}

grouped[r.test_name].years.push(r.year)
grouped[r.test_name].values.push(v)

})

const list = Object.values(grouped)

setMetrics(list)

generateAlerts(list)
}

function generateAlerts(list:Metric[]){

const alerts:string[]=[]

list.forEach(m=>{

const vals=m.values

if(vals.length>=3){

const last3=vals.slice(-3)

if(last3[0]<last3[1] && last3[1]<last3[2])
alerts.push(`${m.test} rising for 3 years`)
}

})

setAlerts(alerts)
}

function latest(vals:number[]){
return vals[vals.length-1]
}

function trend(vals:number[]){

if(vals.length<2) return ""

const prev=vals[vals.length-2]
const curr=vals[vals.length-1]

if(curr>prev) return "↑"
if(curr<prev) return "↓"
return "→"
}

function exportData(){

const rows:string[]=[]

rows.push("Test,Year,Value")

metrics.forEach(m=>{
m.years.forEach((y,i)=>{
rows.push(`${m.test},${y},${m.values[i]}`)
})
})

const blob=new Blob([rows.join("\n")],{type:"text/csv"})
const url=URL.createObjectURL(blob)

const a=document.createElement("a")
a.href=url
a.download="health_data.csv"
a.click()
}

return(

<div style={{padding:"20px",fontFamily:"Arial"}}>

<h1>Health Dashboard</h1>

<button onClick={exportData}>
Export Data
</button>

<h2>Key Indicators</h2>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
gap:"15px"
}}>

{metrics.map(m=>(

<div key={m.test}
style={{
border:"1px solid #ddd",
padding:"10px",
borderRadius:"6px"
}}
>

<strong>{m.test}</strong>

<div style={{fontSize:"24px"}}>
{latest(m.values)} {trend(m.values)}
</div>

</div>

))}

</div>

<h2 style={{marginTop:"30px"}}>Trend Charts</h2>

{metrics.map(m=>(

<div key={m.test}
style={{
marginBottom:"40px",
border:"1px solid #eee",
padding:"15px",
borderRadius:"6px"
}}
>

<h3>{m.test}</h3>

<Line
data={{
labels:m.years,
datasets:[
{
label:m.test,
data:m.values,
tension:0.3
}
]
}}
/>

</div>

))}

<h2>Alerts</h2>

{alerts.length===0 && <p>No alerts</p>}

<ul>
{alerts.map((a,i)=>(
<li key={i}>⚠ {a}</li>
))}
</ul>

</div>
)
}