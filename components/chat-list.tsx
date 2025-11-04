'use client'

import { ChatMessage } from './chat-message'
import type { UIMessage } from '@/lib/types'

interface ChatListProps {
  messages: any[]
}

export function ChatList({ messages }: ChatListProps) {
  if (!messages.length) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  )
}