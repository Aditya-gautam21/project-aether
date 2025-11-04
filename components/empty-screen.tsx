'use client'

import { Button } from '@/components/ui/button'
import { SUGGESTED_PROMPTS } from '@/lib/constants'

interface EmptyScreenProps {
  onPromptSelect: (prompt: string) => void
}

export function EmptyScreen({ onPromptSelect }: EmptyScreenProps) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">
            Hello there!
          </h1>
          <p className="text-muted-foreground">
            How can I help you today?
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 w-full max-w-md sm:grid-cols-2">
          {SUGGESTED_PROMPTS.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 text-left justify-start whitespace-normal"
              onClick={() => onPromptSelect(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}