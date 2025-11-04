'use client'

import { useChat } from 'ai/react'
import { ChatList } from './chat-list'
import { ChatPanel } from './chat-panel'
import { EmptyScreen } from './empty-screen'
import { ChatScrollAnchor } from './chat-scroll-anchor'

interface ChatProps {
  id?: string
  initialMessages?: any[]
}

export function Chat({ id, initialMessages }: ChatProps) {
  const { messages, input, setInput, handleSubmit, isLoading, stop } = useChat({
    api: '/api/chat',
    id,
    initialMessages,
  })

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt)
    // Auto-submit the prompt
    setTimeout(() => {
      handleSubmit(new Event('submit') as any)
    }, 100)
  }

  return (
    <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out">
      <div className="pb-[200px] pt-4 md:pt-10">
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor />
          </>
        ) : (
          <EmptyScreen onPromptSelect={handlePromptSelect} />
        )}
      </div>
      <ChatPanel
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onStop={stop}
      />
    </div>
  )
}