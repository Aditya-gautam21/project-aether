'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Copy, User, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: any
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  const copyToClipboard = () => {
    const text = message.content || (message.parts ? message.parts.map((part: any) => part.text).join('') : '')
    navigator.clipboard.writeText(text)
  }

  if (isUser) {
    return (
      <div className="group relative mb-4 flex items-start justify-end">
        <div className="flex max-w-[70%] flex-col">
          <div className="rounded-lg bg-primary px-3 py-2 text-primary-foreground">
            <p className="text-sm">
              {message.content || (message.parts ? message.parts.map((part: any) => part.text).join('') : '')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative mb-4 flex items-start">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow">
        <Bot className="h-4 w-4" />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden">
        <div className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '')
                const isInline = !match
                return !isInline ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {message.content || (message.parts ? message.parts.map((part: any) => part.text).join('') : '')}
          </ReactMarkdown>
        </div>
        <div className="flex items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={copyToClipboard}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}