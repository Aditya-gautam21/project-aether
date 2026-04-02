# Frontend Specification: Project Aether

## 1. Design Philosophy
- **Dynamic & Fluid:** The UI must feel alive. Messages should stream in. Sidebars should slide.
- **Context-Aware:** The interface changes based on state.
  - *Empty State:* Large, welcoming greeting with "Starter Questions" chips.
  - *Active State:* The input bar shrinks/moves, history sidebar appears/enables.
- **Glassmorphism/Modern:** Dark mode default, subtle gradients, rounded corners (Shadcn/UI).

## 2. Tech Stack Requirements
- **Framework:** Next.js 15+ (App Router).
- **Styling:** Tailwind CSS + `clsx` + `tailwind-merge`.
- **Components:** Shadcn/UI (Radix Primitives).
- **Icons:** Lucide-React.
- **Animations:** Framer Motion (essential for the "Dynamic" feel).
- **AI Integration:** Vercel AI SDK (`ai/react`) for `useChat` hooks and streaming support.

## 3. Core Features
### A. The Chat Interface
- **Streaming:** The frontend must handle chunked streaming responses from the Python backend.
- **Optimistic UI:** User messages appear instantly.
- **Thinking State:** A subtle pulse or "Thinking..." indicator while waiting for the first token.

### B. Dynamic History (Sidebar)
- **Behavior:** The sidebar lists past conversation threads.
- **Persistence:** Save chat history to `localStorage` (or IndexDB) so it persists on refresh.
- **Conditional Visibility:** On mobile, it's a drawer. On desktop, it's a collapsible rail.
- **New Chat:** A clear "New Chat" button that resets the context.

### C. Backend Bridge
- **Proxy:** Configure `next.config.mjs` to rewrite `/api/chat` -> `http://127.0.0.1:8000/chat`.
- **Type Safety:** TypeScript interfaces must match Pydantic models in `backend/models.py`.

## 4. File Structure Target
```text
/app
  /api/chat/route.ts  <-- Edge function proxy (optional)
  /layout.tsx         <-- Global providers (Tooltip, Theme)
  /page.tsx           <-- Main Chat Wrapper
  /components
    /chat-interface.tsx
    /sidebar.tsx
    /message-bubble.tsx
    /empty-screen.tsx