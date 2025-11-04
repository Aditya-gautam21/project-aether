'use client'

import { SidebarItem } from './sidebar-item'
import type { Chat } from '@/lib/types'

interface SidebarListProps {
  chats?: Chat[]
}

// Mock chat data for demonstration
const mockChats: Chat[] = [
  {
    id: '1',
    title: 'Weather Inquiry',
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
    path: '/chat/1'
  }
]

export function SidebarList({ chats = mockChats }: SidebarListProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="px-2">
        <div className="text-xs font-medium text-muted-foreground mb-2">Today</div>
      </div>
      {chats.map((chat) => (
        <SidebarItem key={chat.id} chat={chat} />
      ))}
      <div className="px-2 mt-4">
        <div className="text-xs text-muted-foreground text-center">
          You have reached the end of your chat history.
        </div>
      </div>
    </div>
  )
}