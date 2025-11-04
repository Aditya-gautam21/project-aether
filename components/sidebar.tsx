'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface SidebarProps {
  children?: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="flex h-full w-full flex-col bg-muted/10">
      <div className="flex flex-col gap-2 p-4">
        <Button asChild className="w-full justify-start h-10 px-4 py-2">
          <Link href="/chat">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Link>
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-2">
          {children}
        </div>
      </ScrollArea>
      <div className="mt-auto border-t bg-background p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full bg-muted/50 text-xs font-medium uppercase text-muted-foreground">
            G
          </div>
          <div className="flex flex-1 flex-col">
            <div className="text-xs font-medium">Guest</div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}