'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Square, Paperclip } from 'lucide-react'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'

interface ChatPanelProps {
  input: string
  setInput: (value: string) => void
  isLoading: boolean
  onSubmit: (e: React.FormEvent) => void
  onStop?: () => void
}

export function ChatPanel({
  input,
  setInput,
  isLoading,
  onSubmit,
  onStop
}: ChatPanelProps) {
  const { formRef, onKeyDown } = useEnterSubmit()

  return (
    <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80">
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
        </div>
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <form ref={formRef} onSubmit={onSubmit}>
            <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
              <Textarea
                tabIndex={0}
                onKeyDown={onKeyDown}
                placeholder="Send a message..."
                className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                name="message"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="absolute left-0 top-[13px] sm:left-4">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute right-0 top-[13px] sm:right-4">
                <div className="flex items-center gap-1">
                  <div className="text-xs text-muted-foreground mr-2">
                    Grok Vision
                  </div>
                  {isLoading ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={onStop}
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="icon"
                      className="h-8 w-8"
                      disabled={!input.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}