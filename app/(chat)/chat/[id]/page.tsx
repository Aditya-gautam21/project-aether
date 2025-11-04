import { Chat } from '@/components/chat'
import { notFound } from 'next/navigation'

interface ChatPageProps {
  params: {
    id: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id } = params

  if (!id) {
    notFound()
  }

  return <Chat id={id} />
}