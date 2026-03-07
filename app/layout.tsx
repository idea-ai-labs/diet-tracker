import "./globals.css"

export default function RootLayout({children}:{children:React.ReactNode}){

return(

<html>

<body>

<h1 style={{textAlign:"center"}}>Diet Tracker</h1>

{children}

</body>

</html>

)

}

