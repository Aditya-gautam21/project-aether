# Vercel AI Chatbot - Complete UI Implementation Guide for Claude/Kiro AI

**Prepared for: Amazon Kiro AI / Claude / Anthropic Models**

## Project Overview

You are tasked with building a complete, production-ready AI chatbot interface that matches the Vercel AI Chatbot template exactly. This guide provides all necessary specifications, architecture patterns, and code requirements.

---

## Visual Reference - Expected Output

The final application should match the Vercel AI Chatbot interface:
1. **Main Chat Interface**: Dark theme with left sidebar and centered chat area
2. **Sidebar**: Chat history list with "New Chat" button, model selector at bottom
3. **Messages**: 
   - User messages: Right-aligned, blue bubble
   - AI messages: Left-aligned, darker background with markdown support
   - Tool/Weather cards: Rich formatted responses with visual data
4. **Input Area**: Bottom textarea with send button and model selector
5. **Suggested Prompts**: Initial empty state with suggested conversation starters (4 cards in 2x2 grid)
6. **Tools/Features**: Model selection dropdown, voice input toggle (Grok Vision), file upload capability

---

## Technology Stack (MANDATORY - NO SUBSTITUTIONS)

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14+ | Framework with App Router |
| React | 18+ | UI library |
| TypeScript | Latest | Type safety |
| Tailwind CSS | 3+ | Styling system |
| shadcn/ui | Latest | Component library |
| Vercel AI SDK | v5+ | LLM integration |
| @ai-sdk/react | 1.0+ | React hooks for AI |
| @ai-sdk/openai | 1.0+ | OpenAI provider |
| react-markdown | 9.0+ | Markdown rendering |
| remark-gfm | 4.0+ | GitHub Flavored Markdown |
| react-syntax-highlighter | 15.5+ | Code syntax highlighting |
| lucide-react | 0.400+ | Icon library |
| next-themes | 0.3+ | Theme management |
| zod | 3.22+ | Schema validation |

---

## Project Structure (EXACT REQUIRED FORMAT)

```
your-chatbot-project/
├── app/
│   ├── layout.tsx                           # Root layout with providers & metadata
│   ├── page.tsx                             # Landing page (optional redirect)
│   ├── globals.css                          # Global styles with CSS variables
│   ├── (chat)/                              # Route group for chat functionality
│   │   ├── layout.tsx                       # Chat layout with sidebar
│   │   ├── page.tsx                         # New chat page with empty state
│   │   └── chat/
│   │       └── [id]/
│   │           └── page.tsx                 # Individual chat session page
│   └── api/
│       └── chat/
│           └── route.ts                     # POST endpoint for streaming chat
├── components/
│   ├── chat.tsx                             # Main chat container orchestrator
│   ├── chat-list.tsx                        # Renders message list
│   ├── chat-message.tsx                     # Single message with markdown
│   ├── chat-panel.tsx                       # Bottom input area
│   ├── chat-header.tsx                      # Top header with chat title
│   ├── chat-scroll-anchor.tsx               # Auto-scroll handler
│   ├── empty-screen.tsx                     # Welcome screen with suggestions
│   ├── sidebar.tsx                          # Left sidebar container
│   ├── sidebar-list.tsx                     # Chat history list
│   ├── sidebar-item.tsx                     # Individual chat history item
│   ├── provider.tsx                         # App providers wrapper
│   ├── theme-provider.tsx                   # Theme context setup
│   └── ui/
│       ├── button.tsx                       # shadcn/ui button component
│       ├── card.tsx                         # shadcn/ui card component
│       ├── input.tsx                        # shadcn/ui text input
│       ├── textarea.tsx                     # shadcn/ui textarea
│       ├── scroll-area.tsx                  # shadcn/ui scroll container
│       ├── avatar.tsx                       # shadcn/ui avatar display
│       ├── dropdown-menu.tsx                # shadcn/ui dropdown
│       ├── select.tsx                       # shadcn/ui select
│       └── (other shadcn components as needed)
├── lib/
│   ├── utils.ts                             # cn() helper for Tailwind + classnames
│   ├── types.ts                             # TypeScript type definitions
│   ├── constants.ts                         # App constants and config
│   └── hooks/
│       └── use-local-storage.ts             # Custom storage hook (optional)
├── public/
│   └── (static assets and images)
├── components.json                          # shadcn/ui configuration
├── tailwind.config.ts                       # Tailwind CSS configuration
├── tsconfig.json                            # TypeScript compiler configuration
├── next.config.js                           # Next.js configuration
├── .env.local                               # Environment variables (LOCAL ONLY)
├── .env.example                             # Example environment variables
├── .gitignore                               # Git ignore file
└── package.json                             # Dependencies and scripts
```

---

## Core Components Detailed Specification

### 1. **app/layout.tsx** - Root Layout

**Requirements:**
- Configure document metadata (title, description, favicon)
- Setup Geist font family (recommended)
- No default Next.js styles - remove all unnecessary CSS
- Wrap children with ThemeProvider
- Wrap with all necessary providers (use provider.tsx)
- Support dark mode from system preference

**Structure:**
```typescript
- HTML element with lang attribute
- Head with metadata
- Body with className for dark mode
- ThemeProvider wrapping children
- No navigation or common layout items (chat layout handles it)
```

### 2. **app/(chat)/layout.tsx** - Chat Layout

**Requirements:**
- Two-column layout: sidebar (fixed) + main content (flex)
- Sidebar width: 240-280px on desktop, hidden on mobile
- Main content: scrollable chat area + fixed input panel
- Responsive hamburger menu for mobile sidebar toggle
- Header area for chat title

**Structure:**
```typescript
- Flex container (flex-row)
- Sidebar component (fixed width or hidden on mobile)
- Main content area (flex-col)
  - Chat header
  - Chat messages (scrollable, flex-1)
  - Chat input panel (fixed bottom)
```

### 3. **app/(chat)/page.tsx** - New Chat Page

**Requirements:**
- Generate unique chat ID (UUID v4 or nanoid)
- Show EmptyScreen with suggested prompts
- Initialize with no messages
- Pass generated ID to Chat component
- Store chat in database

**Functionality:**
- Generate new chat ID
- Set up empty state
- Render Chat component with id and empty initialMessages

### 4. **app/(chat)/chat/[id]/page.tsx** - Chat Session Page

**Requirements:**
- Extract chat ID from params
- Fetch chat history from database
- Load all existing messages
- Display chat title in header
- Pass initialMessages to Chat component
- Handle 404 if chat doesn't exist

**Features:**
- Server-side data fetching
- Error handling for missing chats
- Pre-populate with existing messages

### 5. **app/api/chat/route.ts** - Chat API Endpoint

**CRITICAL REQUIREMENTS:**

```typescript
// Must be POST endpoint
export async function POST(req: Request) {
  // 1. Parse request body
  const { messages } = await req.json();
  
  // 2. Optional: Validate authentication
  // const session = await getServerSession(req);
  // if (!session) return new Response('Unauthorized', { status: 401 });
  
  // 3. Call streamText with configuration:
  const result = streamText({
    model: 'openai/gpt-4o',  // Can be configured
    messages: convertToModelMessages(messages),
    system: 'You are a helpful AI assistant.',  // Custom system prompt
    maxTokens: 2000,
    temperature: 0.7,
  });
  
  // 4. Return streaming response
  return result.toUIMessageStreamResponse();
}
```

**Must include:**
- Proper error handling
- Request validation
- Streaming response setup
- Authentication (if needed)
- Maximum duration: 30 seconds

### 6. **components/chat.tsx** - Main Chat Container

**Requirements:**
```typescript
'use client'  // REQUIRED

interface ChatProps {
  id?: string;  // Chat session ID
  initialMessages?: UIMessage[];  // Pre-loaded messages
  selectedModelId?: string;  // Model selection (optional)
}

// Core hooks:
- useChat from @ai-sdk/react
- useEffect for auto-scroll
- useState for input state

// Layout:
- flex flex-col h-screen
- ChatHeader (shows chat title)
- ChatList or EmptyScreen (flex-1)
- ChatPanel (fixed bottom)

// Functionality:
- Auto-scroll to latest message
- Handle form submission
- Display loading states
- Show error messages
```

**Configuration:**
```typescript
const { messages, setMessages, input, setInput, append, handleSubmit, isLoading } 
  = useChat({
    api: '/api/chat',
    id: id,
    initialMessages: initialMessages,
    onError: (error) => console.error(error),
  });
```

### 7. **components/chat-message.tsx** - Message Display

**Requirements:**
- Display both user and assistant messages
- Role-based styling and alignment
- Avatar display (icon or image)
- Markdown rendering for AI messages
- Code syntax highlighting

**Structure:**
```typescript
- Flex container with role-based alignment
  - Avatar (left for assistant, right for user)
  - Message bubble
    - Text content (user)
    - Markdown content (assistant) with:
      - Tables
      - Lists
      - Code blocks with syntax highlighting
      - Links
      - Bold/italic
- Action buttons (copy, regenerate)
```

**Features:**
- Copy to clipboard button
- Language detection in code blocks
- Proper markdown parsing
- Smooth rendering during streaming

### 8. **components/chat-list.tsx** - Message List Container

**Requirements:**
```typescript
interface ChatListProps {
  messages: UIMessage[];
  isLoading?: boolean;
}

// Functionality:
- Map through messages array
- Render ChatMessage for each
- Show loading indicator at bottom if isLoading
- Handle empty state
- Smooth scrolling container
```

### 9. **components/chat-panel.tsx** - Input Area

**Requirements:**
```typescript
interface ChatPanelProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onStop?: () => void;
  selectedModelId?: string;
}

// Components:
- Textarea input (resizable)
- Send button
- Stop button (while loading)
- Model selector dropdown (optional)
- Character counter (optional)
```

**Features:**
- Enter to send, Shift+Enter for newline
- Auto-resize textarea
- Disabled state while loading
- Model selection
- Keyboard shortcuts

### 10. **components/empty-screen.tsx** - Welcome Screen

**Requirements:**
```typescript
interface EmptyScreenProps {
  setInput: (value: string) => void;
  submit: (value: string) => void;
}

// Content:
- Title: "What can I help you with?"
- Subtitle: (optional)
- 4 suggested prompts in 2x2 grid

// Suggested prompts:
1. "What are the advantages of using Next.js?"
2. "Write code to demonstrate Dijkstra's algorithm"
3. "Help me write an essay about Silicon Valley"
4. "What is the weather in San Francisco?"

// Functionality:
- Clicking prompt fills input and sends message
- Cards have hover effects
```

### 11. **components/sidebar.tsx** - Left Sidebar

**Requirements:**
```typescript
interface SidebarProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Sections:
1. Header
   - Logo/App name
   - "New Chat" button (+ icon)
   
2. Main content (scrollable)
   - SidebarList component
   
3. Footer
   - Model selector dropdown
   - Theme toggle
   - User menu (optional)
```

**Features:**
- Mobile toggle
- Smooth animations
- Persistent width on desktop
- Collapsible on mobile

### 12. **components/sidebar-list.tsx** - Chat History

**Requirements:**
```typescript
interface SidebarListProps {
  chats?: Chat[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Functionality:
- Display list of previous chats
- Highlight current active chat
- Show creation date/time
- Delete button on hover
- Navigate to chat on click
- Keyboard navigation support
```

---

## Type Definitions - lib/types.ts

**EXACT TYPES REQUIRED:**

```typescript
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: MessagePart[];
  createdAt: Date;
}

export type MessagePart = 
  | { type: 'text'; text: string }
  | { type: 'tool-call'; toolName: string; args: any }
  | { type: 'tool-result'; result: any };

export interface Chat {
  id: string;
  title: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  path: string;
}

export interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  parts: Array<{ type: string; text: string }>;
}
```

---

## Styling Specifications

### Global CSS Variables

**Required in app/globals.css:**

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --primary: 221.2 83.2% 53.3%;
  --muted: 210 40% 96.1%;
  /* ... etc */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... etc */
}
```

### Tailwind Key Classes

```
Layout: flex, flex-col, gap-4, p-4
Colors: bg-background, text-foreground, bg-muted, border-border
Responsive: md:hidden, lg:flex, hidden md:flex
Shadows: shadow-sm, shadow-md
Borders: border, border-border, rounded-lg
```

---

## Environment Variables - .env.local

```env
# ===== AI PROVIDER =====
OPENAI_API_KEY=sk-...your-key-here...
VERCEL_OIDC_TOKEN=optional-for-ai-gateway

# ===== DATABASE (if using Supabase) =====
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# ===== AUTHENTICATION (if using NextAuth) =====
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000

# ===== APP CONFIG =====
NEXT_PUBLIC_APP_NAME=AI Chatbot
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

---

## Installation & Initialization (EXACT STEPS)

### Step 1: Create Next.js Project
```bash
npx create-next-app@latest your-chatbot-project \
  --typescript \
  --tailwind \
  --app \
  --no-eslint \
  --import-alias '@/*'
cd your-chatbot-project
```

### Step 2: Install Core Dependencies
```bash
npm install ai @ai-sdk/react @ai-sdk/openai
npm install react-markdown remark-gfm react-syntax-highlighter
npm install next-themes zod lucide-react
npm install class-variance-authority clsx tailwind-merge
```

### Step 3: Initialize shadcn/ui
```bash
npx shadcn-ui@latest init

# When prompted, choose:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - TypeScript: Yes
```

### Step 4: Add shadcn Components
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
```

### Step 5: Setup Environment
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Step 6: Start Development Server
```bash
npm run dev
# Visit http://localhost:3000
```

---

## Implementation Order (STRICT SEQUENCE)

**PHASE 1: Foundation (30 minutes)**
1. Create Next.js project
2. Install all dependencies
3. Initialize shadcn/ui
4. Add components
5. Setup environment variables

**PHASE 2: Styling (20 minutes)**
1. Update app/globals.css with theme variables
2. Configure tailwind.config.ts
3. Setup next-themes provider
4. Create provider.tsx wrapper

**PHASE 3: API Layer (15 minutes)**
1. Create app/api/chat/route.ts
2. Implement streamText logic
3. Test with curl/Postman

**PHASE 4: Core Components (45 minutes)**
1. Create lib/types.ts
2. Create lib/utils.ts
3. Build chat-message.tsx
4. Build chat-list.tsx
5. Build chat-panel.tsx
6. Build empty-screen.tsx
7. Build chat.tsx

**PHASE 5: Navigation (30 minutes)**
1. Create sidebar.tsx
2. Create sidebar-list.tsx
3. Create app/(chat)/layout.tsx
4. Create routing pages

**PHASE 6: Polish (20 minutes)**
1. Add theme switching
2. Test responsive design
3. Add loading states
4. Error handling

---

## Critical Implementation Notes

### Message Streaming
- Use `toUIMessageStreamResponse()` from Vercel AI SDK
- Messages stream incrementally to UI
- Implement skeleton loaders while streaming
- Show typing indicator during response generation

### Markdown Rendering
- Use `ReactMarkdown` with `remark-gfm` plugin
- Syntax highlighting via `react-syntax-highlighter`
- Detect language from code fence: ` ```python `
- Support tables, lists, links, bold, italic

### Auto-Scrolling
- Use `useEffect` with `useRef` for message container
- Scroll to bottom when `messages` length changes
- Use `scrollIntoView({ behavior: 'smooth' })`

### State Management
- Use `useChat` hook from @ai-sdk/react
- Local state for input field
- Do NOT use Redux/Context for basic chat state

### Theme Management
- Use `next-themes` provider
- Support 'light', 'dark', 'system' modes
- Persist choice in localStorage automatically

---

## Testing Checklist

- [ ] API endpoint streams responses correctly
- [ ] Chat messages display both user and assistant
- [ ] Markdown renders properly (code, tables, lists)
- [ ] Code syntax highlighting works
- [ ] Auto-scroll follows latest message
- [ ] Theme toggle switches dark/light
- [ ] Sidebar shows chat history
- [ ] New chat creates unique ID
- [ ] Empty state shows 4 suggestions
- [ ] Input validation prevents empty messages
- [ ] Loading states display correctly
- [ ] Error messages show if API fails
- [ ] Mobile layout is responsive
- [ ] Keyboard shortcuts work (Enter to send)
- [ ] Copy button works on code blocks

---

## Success Criteria

The final implementation must:
✅ Visually match Vercel AI Chatbot exactly
✅ Stream AI responses in real-time
✅ Render markdown with syntax highlighting
✅ Support chat history management
✅ Toggle dark/light theme
✅ Be fully responsive (mobile to desktop)
✅ Have complete error handling
✅ Be production-ready for Vercel deployment
✅ Support authentication (optional but recommended)
✅ Persist data in database

---

## DO's and DON'Ts for AI Model

### ✅ DO:
- Follow project structure exactly
- Use specified tech stack only
- Implement all components
- Add TypeScript types everywhere
- Use Tailwind for all styling
- Support dark/light theme
- Include error boundaries
- Make it mobile responsive
- Write clean, commented code
- Test each component thoroughly

### ❌ DON'T:
- Use other CSS libraries (styled-components, emotion, etc.)
- Skip TypeScript types
- Use hardcoded values
- Implement extra features not specified
- Use other UI component libraries
- Mix styling approaches
- Skip mobile responsiveness
- Ignore error handling
- Use deprecated Vercel AI SDK features

---

## Final Deliverables

The AI model should generate:
1. Complete Next.js project structure
2. All component files with full implementations
3. API routes with streaming setup
4. Type definitions file
5. Global styles and Tailwind config
6. Environment example file
7. All necessary configuration files
8. README with setup instructions

The result should be a copy-paste ready project that works immediately after installing dependencies and adding API keys.
