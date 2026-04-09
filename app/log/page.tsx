"use client"

import { useState, useEffect } from "react"

export default function LogPage(){

  const [password,setPassword] = useState("")
  const [authenticated,setAuthenticated] = useState(false)

  const [name,setName] = useState("")
  const [details,setDetails] = useState("")

  const [logs,setLogs] = useState<any[]>([])

  useEffect(()=>{

    const unlocked = sessionStorage.getItem("log_auth")

    if(unlocked){
      setAuthenticated(true)
      loadLogs()
    }

  },[])

  async function login(){

    const res = await fetch("/api/log-auth",{
      method:"POST",
      headers:{ "Content-Type":"application/json"},
      body: JSON.stringify({ password })
    })

    const data = await res.json()

    if(data.valid){

      sessionStorage.setItem("log_auth","1")

      setAuthenticated(true)

      loadLogs()

    }else{

      alert("Wrong password")

    }

  }

  async function loadLogs(){

    const res = await fetch("/api/log")

    const data = await res.json()

    setLogs(data)

  }

  async function save(){

    if(!name || !details){

      alert("Please enter name and details")

      return

    }

    await fetch("/api/log",{
      method:"POST",
      headers:{ "Content-Type":"application/json"},
      body: JSON.stringify({ name, details })
    })

    setName("")
    setDetails("")

    loadLogs()

  }

  function download(log:any){

    const blob = new Blob([log.details],{type:"text/plain"})

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")

    const date = new Date(log.created_at).toISOString().slice(0,10)

    a.href = url
    a.download = `${date}-${log.name}.txt`

    a.click()

    URL.revokeObjectURL(url)

  }

  if(!authenticated){

    return(

      <div className="card">

        <h2>Secure Logs</h2>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <br/><br/>

        <button onClick={login}>
          Unlock
        </button>

      </div>

    )

  }

  return(

    <div className="container">

      <div className="card">

        <h2>Create Log</h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <br/><br/>

        <textarea
          placeholder="Details"
          value={details}
          onChange={(e)=>setDetails(e.target.value)}
          rows={6}
        />

        <br/><br/>

        <button onClick={save}>
          Save
        </button>

      </div>

      <div className="card">

        <h2>Saved Logs</h2>

        <table>

          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Download</th>
            </tr>
          </thead>

          <tbody>

            {logs.map(log => (

              <tr key={log.id}>

                <td>{log.name}</td>

                <td>
                  {new Date(log.created_at).toLocaleString()}
                </td>

                <td>

                  <button
                    className="secondary"
                    onClick={()=>download(log)}
                  >
                    Download
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
