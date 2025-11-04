import { Chat } from '@/components/chat'
import { generateId } from '@/lib/utils'

export default function ChatPage() {
  const id = generateId()
  return <Chat id={id} />
}