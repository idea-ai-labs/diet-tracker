"use client"

import { useState, useEffect } from "react"

interface BPRecord {
  id:number
  reading_time:string
  systolic:number
  diastolic:number
  heart_rate:number
  comments:string
}

export default function BPPage(){

const [records,setRecords]=useState<BPRecord[]>([])

const [readingTime,setReadingTime]=useState(
  new Date().toISOString().slice(0,16)
)

const [systolic,setSystolic]=useState("")
const [diastolic,setDiastolic]=useState("")
const [heartRate,setHeartRate]=useState("")
const [comments,setComments]=useState("")

const [editingId,setEditingId]=useState<number|null>(null)


// ---------- Load Records ----------

async function loadRecords(){

const res=await fetch("/api/bp")
const data=await res.json()

setRecords(data)

}

useEffect(()=>{

loadRecords()

},[])


// ---------- Determine Tag ----------

function getTag(dateString:string){

const hour=new Date(dateString).getHours()

if(hour<12) return "Morning ☀️"
if(hour<17) return "Afternoon 🌤"
if(hour<21) return "Evening 🌙"

return "Night 🌑"

}


// ---------- Reset Form ----------

function resetForm(){

setReadingTime(new Date().toISOString().slice(0,16))
setSystolic("")
setDiastolic("")
setHeartRate("")
setComments("")
setEditingId(null)

}


// ---------- Save Record ----------

async function saveRecord(){

if(!systolic || !diastolic) return

const payload={
reading_time:readingTime,
systolic:Number(systolic),
diastolic:Number(diastolic),
heartRate:Number(heartRate),
comments
}

if(editingId){

await fetch("/api/bp",{
method:"PUT",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify({
id:editingId,
...payload
})
})

}else{

await fetch("/api/bp",{
method:"POST",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify(payload)
})

}

resetForm()
loadRecords()

}


// ---------- Edit Record ----------

function editRecord(r:BPRecord){

setEditingId(r.id)

setReadingTime(
  new Date(r.reading_time).toISOString().slice(0,16)
)

setSystolic(String(r.systolic))
setDiastolic(String(r.diastolic))
setHeartRate(String(r.heart_rate || ""))
setComments(r.comments || "")

}


// ---------- Delete Record ----------

async function deleteRecord(id:number){

await fetch("/api/bp",{
method:"DELETE",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify({id})
})

loadRecords()

}


// ---------- UI ----------

return(

<div className="container">

<div className="card">

<h2>Blood Pressure Entry</h2>

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"10px",
marginTop:"10px"
}}>

<div>

<label>Entry Time</label>

<input
type="datetime-local"
value={readingTime}
onChange={(e)=>setReadingTime(e.target.value)}
/>

</div>

<div></div>

<input
placeholder="Systolic"
value={systolic}
onChange={(e)=>setSystolic(e.target.value)}
/>

<input
placeholder="Diastolic"
value={diastolic}
onChange={(e)=>setDiastolic(e.target.value)}
/>

<input
placeholder="Heart Rate"
value={heartRate}
onChange={(e)=>setHeartRate(e.target.value)}
/>

<input
placeholder="Comments"
value={comments}
onChange={(e)=>setComments(e.target.value)}
/>

</div>

<div style={{marginTop:"12px"}}>

<button onClick={saveRecord}>
{editingId ? "Update Entry" : "Save Entry"}
</button>

{editingId && (

<button
className="secondary"
style={{marginLeft:"10px"}}
onClick={resetForm}
>

Cancel

</button>

)}

</div>

</div>


<div className="card">

<h2>History</h2>

<table>

<thead>

<tr>

<th>Date</th>
<th>Tag</th>
<th>Systolic</th>
<th>Diastolic</th>
<th>HR</th>
<th>Comments</th>
<th></th>

</tr>

</thead>

<tbody>

{records.map(r=>(

<tr key={r.id}>

<td>

{new Date(r.reading_time).toLocaleString()}

</td>

<td>

{getTag(r.reading_time)}

</td>

<td>{r.systolic}</td>

<td>{r.diastolic}</td>

<td>{r.heart_rate}</td>

<td>{r.comments}</td>

<td>

<button
className="secondary"
onClick={()=>editRecord(r)}
>

Edit

</button>

<button
className="danger"
style={{marginLeft:"6px"}}
onClick={()=>deleteRecord(r.id)}
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
