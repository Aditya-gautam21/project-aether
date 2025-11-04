export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Forward to FastAPI backend
    const response = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      })
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    // Return the streaming response from backend
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}