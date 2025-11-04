'use client'

import { Button } from '@/components/ui/button'
import { MessageSquare, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Chat } from '@/lib/types'

interface SidebarItemProps {
  chat: Chat
}

export function SidebarItem({ chat }: SidebarItemProps) {
  return (
    <div className="group relative">
      <Button
        variant="ghost"
        className="w-full justify-start px-2 py-2 h-auto text-sm font-normal hover:bg-accent"
        asChild
      >
        <Link href={`/chat/${chat.id}`}>
          <div className="flex-1 overflow-hidden text-left">
            <div className="truncate">
              {chat.title}
            </div>
          </div>
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.preventDefault()
          // TODO: Implement delete functionality
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}