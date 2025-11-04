import { useState, useRef, useEffect } from 'react'
import { Send, Plus, Bot, User, Paperclip } from 'lucide-react'
import { cn } from './lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<{id: string, title: string}[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Add to chat history if first message
    if (messages.length === 0) {
      const chatTitle = input.slice(0, 30) + (input.length > 30 ? '...' : '')
      setChatHistory(prev => [{ id: Date.now().toString(), title: chatTitle }, ...prev])
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      }

      setMessages(prev => [...prev, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                setMessages(prev => prev.map(m => 
                  m.id === assistantMessage.id 
                    ? { ...m, content: m.content + parsed.content }
                    : m
                ))
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedPrompts = [
    "What are the advantages of using Next.js?",
    "Write code to demonstrate Dijkstra's algorithm",
    "Help me write an essay about Silicon Valley",
    "What is the weather in San Francisco?"
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-[260px] md:flex-col glass-dark">
        <div className="flex h-[60px] items-center px-4">
          <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Aether AI</h1>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <button 
            onClick={() => {
              setMessages([])
              setInput('')
            }}
            className="flex items-center gap-2 rounded-lg glass px-4 py-2 text-foreground hover:bg-primary/20 transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>
        <div className="flex-1 p-2">
          {chatHistory.length > 0 && (
            <>
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Recent</div>
              <div className="space-y-1">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className="rounded-lg px-2 py-2 text-sm hover:glass cursor-pointer transition-all duration-300">
                    {chat.title}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="border-t border-white/10 glass p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full glass text-xs font-medium uppercase text-muted-foreground">
              G
            </div>
            <div className="flex flex-1 flex-col">
              <div className="text-xs font-medium">Guest</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold mb-2">Hello there!</h1>
                <p className="text-muted-foreground">How can I help you today?</p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full max-w-md sm:grid-cols-2">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="h-auto p-4 text-left justify-start whitespace-normal glass rounded-lg hover:glass-dark transition-all duration-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl px-4 py-4">
              {messages.map((message) => (
                <div key={message.id} className="mb-4">
                  {message.role === 'user' ? (
                    <div className="flex items-start justify-end">
                      <div className="flex max-w-[70%] flex-col">
                        <div className="rounded-lg bg-primary glass px-3 py-2 text-primary-foreground shadow-lg">
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md glass shadow-lg">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="ml-4 flex-1 space-y-2 overflow-hidden">
                        <div className="prose break-words dark:prose-invert prose-p:leading-relaxed max-w-none glass-dark rounded-lg p-3">
                          <p>{message.content}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Panel */}
        <div className="border-t border-white/10 glass-dark p-4">
          <div className="mx-auto sm:max-w-2xl">
            <form onSubmit={handleSubmit}>
              <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden glass px-8 sm:rounded-md sm:px-12">
                <textarea
                  placeholder="Send a message..."
                  className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm border-0 focus:ring-0 placeholder:text-muted-foreground"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
                <div className="absolute left-0 top-[13px] sm:left-4">
                  <button type="button" className="h-8 w-8 rounded-md hover:glass flex items-center justify-center transition-all duration-300">
                    <Paperclip className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute right-0 top-[13px] sm:right-4">
                  <div className="flex items-center gap-1">
                    <div className="text-xs text-muted-foreground mr-2">Aether Vision</div>
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="h-8 w-8 rounded-md bg-primary glass text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center transition-all duration-300 shadow-lg"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App