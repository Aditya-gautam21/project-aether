import { Sidebar } from '@/components/sidebar'
import { SidebarList } from '@/components/sidebar-list'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:flex md:w-[260px] md:flex-col">
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex h-[60px] items-center px-4">
            <h1 className="text-lg font-semibold">Chatbot</h1>
          </div>
          <Sidebar>
            <SidebarList />
          </Sidebar>
        </div>
      </div>
      <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out">
        {children}
      </div>
    </div>
  )
}