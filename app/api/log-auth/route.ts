export async function POST(req: Request) {

  const { password } = await req.json()

  const valid = password === process.env.SQL_EDITOR_PASSWORD

  return Response.json({ valid })

}
