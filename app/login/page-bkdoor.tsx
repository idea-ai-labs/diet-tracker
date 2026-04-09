"use client"

import { useState } from "react"

export default function LoginPage(){

  const [password,setPassword] = useState("")

  async function login(){

    const res = await fetch("/api/login",{
      method:"POST",
      headers:{ "Content-Type":"application/json"},
      body: JSON.stringify({ password })
    })

    const data = await res.json()

    if(data.success){

      window.location.href="/"

    }else{

      alert("Wrong password")

    }

  }

  return(

    <div className="container">

      <div className="card">

        <h2>Secure Dashboard</h2>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <br/><br/>

        <button onClick={login}>
          Login
        </button>

      </div>

    </div>

  )

}
