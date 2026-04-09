"use client"

import { useState, useEffect } from "react"

export default function AdminPage(){

  const [users,setUsers] = useState([])
  const [form,setForm] = useState({
    first_name:"",
    last_name:"",
    username:"",
    password:"",
    role:"read"
  })

  async function loadUsers(){
    const res = await fetch("/api/users")
    setUsers(await res.json())
  }

  useEffect(()=>{ loadUsers() },[])

  async function createUser(){

    await fetch("/api/users",{
      method:"POST",
      headers:{ "Content-Type":"application/json"},
      body: JSON.stringify(form)
    })

    loadUsers()
  }

  async function deleteUser(id:number){

    await fetch(`/api/users?id=${id}`,{
      method:"DELETE"
    })

    loadUsers()
  }

  return(

    <div className="container">

      <div className="card">
        <h2>Create User</h2>

        <input placeholder="First Name" onChange={e=>setForm({...form,first_name:e.target.value})}/>
        <input placeholder="Last Name" onChange={e=>setForm({...form,last_name:e.target.value})}/>
        <input placeholder="Username" onChange={e=>setForm({...form,username:e.target.value})}/>
        <input type="password" placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})}/>

        <select onChange={e=>setForm({...form,role:e.target.value})}>
          <option value="read">Read</option>
          <option value="write">Write</option>
        </select>

        <button onClick={createUser}>Create</button>
      </div>

      <div className="card">
        <h2>Users</h2>

        {users.map((u:any)=>(
          <div key={u.id} style={{display:"flex",justifyContent:"space-between"}}>
            <span>{u.first_name} ({u.role})</span>
            <button className="danger" onClick={()=>deleteUser(u.id)}>Delete</button>
          </div>
        ))}

      </div>

    </div>

  )

}
