import "./globals.css"

export default function RootLayout({children}:{children:React.ReactNode}){

return(

<html>

<body>

<h1 style={{textAlign:"center"}}>Personal Health Dashboard</h1>

{children}

</body>

</html>

)

}

