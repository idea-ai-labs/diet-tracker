"use client"

import {useState,useEffect} from "react"

const times=[]

for(let h=7;h<=23;h++){

for(let m of ["00","30"]){

if(h===23 && m==="30") continue

times.push(`${String(h).padStart(2,"0")}:${m}`)

}

}

function getWeek(start){

const d=new Date(start)

const days=[]

for(let i=0;i<7;i++){

const day=new Date(d)

day.setDate(d.getDate()+i)

days.push(day.toISOString().slice(0,10))

}

return days

}

export default function Viewer(){

const today=new Date()

const sunday=new Date(today.setDate(today.getDate()-today.getDay()))

const [weekStart,setWeekStart]=useState(sunday.toISOString().slice(0,10))
const [data,setData]=useState([])
const [edit,setEdit]=useState(null)
const [food,setFood]=useState("")

const days=getWeek(weekStart)

async function load(){

const res=await fetch("/api/meals",{

method:"POST",

body:JSON.stringify({

start:days[0],

end:days[6]

})

})

setData(await res.json())

}

useEffect(()=>{load()},[weekStart])

function getMeal(date,time){

const m=data.find(x=>x.meal_date===date && x.meal_time===time)

return m?m.food:""

}

async function save(){

await fetch("/api/saveMeal",{

method:"POST",

body:JSON.stringify(edit)

})

setEdit(null)

setFood("")

load()

}

return(

<div style={{padding:20}}>

<button onClick={()=>{

const d=new Date(weekStart)

d.setDate(d.getDate()-7)

setWeekStart(d.toISOString().slice(0,10))

}}>Prev</button>

<button onClick={()=>{

const d=new Date(weekStart)

d.setDate(d.getDate()+7)

setWeekStart(d.toISOString().slice(0,10))

}}>Next</button>

<table border="1">

<thead>

<tr>

<th>Time</th>

{days.map(d=>(<th key={d}>{d}</th>))}

</tr>

</thead>

<tbody>

{times.map(t=>(

<tr key={t}>

<td>{t}</td>

{days.map(d=>{

const meal=getMeal(d,t)

return(

<td key={d}

onClick={()=>{

setEdit({date:d,time:t,food:meal})

setFood(meal)

}}

style={{cursor:"pointer"}}

>

{meal}

</td>

)

})}

</tr>

))}

</tbody>

</table>

{edit &&(

<div style={{marginTop:20}}>

<h3>{edit.date} {edit.time}</h3>

<textarea

value={food}

onChange={e=>setFood(e.target.value)}

style={{width:300,height:80}}

/>

<br/>

<button onClick={()=>{

edit.food=food

save()

}}>Save</button>

<button onClick={()=>setEdit(null)}>Cancel</button>

</div>

)}

</div>

)

}

