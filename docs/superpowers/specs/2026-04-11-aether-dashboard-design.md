# Aether Dashboard Design Spec

## 1. Goal
Transform the current "Crextio" HR dashboard into "Aether" - an industry-ready personal life management system. It maintains the existing light-mode visual shell but replaces the contents with four new core modules (Finance, Tasks, Habits, Social) tightly integrated with real-time AI via a synchronized WebSocket architecture.

## 2. Architecture & Data Flow

**Pattern: State-Synced WebSocket Architecture**
- **Frontend (Next.js):** Maintains a single persistent WebSocket connection to the backend. React Context acts as the global store for Tasks, Habits, Finances, and Social data.
- **Backend (FastAPI):** `ConnectionManager` handles the WS layer. The AI Service processes natural language requests, classifies intents, and invokes specialized tool handlers. 
- **The Core Loop:** 
  1. User asks the AI "Log my gym session today."
  2. AI Service invokes `HabitTools.log_habit(name="Gym")`.
  3. The database updates the habit streak.
  4. The backend broadcasts a `dashboard_sync` JSON event.
  5. The React frontend consumes the event and instantly updates the grid widgets, seamlessly connecting the UI output to the AI action.

## 3. Database & Domain Models

SQLAlchemy models will be updated to reflect the new feature domains:
- **Tasks:** `id`, `user_id`, `title`, `description`, `status` (pending/completed), `tag` (finance/habit/social), `due_date`.
- **Habits:** `id`, `user_id`, `name`, `streak_count`, JSON array of `logs` (timestamps).
- **Finances:** `id`, `user_id`, `category` (e.g., Food, Subscriptions), `amount_spent`, `allotted_limit`, `month`.
- **Social (Connections):** `id`, `user_id`, `person_name`, `last_contacted_date`, `status` (overdue/done/ping).

## 4. Frontend UI Components

- The main wrapper (`app/page.tsx`) will be rebranded to **Aether**.
- The Dynamic Dashboard grid will replace its current internal HR metrics with four new custom widgets:
  1. `<TasksWidget />` (Interactive checklist mode)
  2. `<HabitsWidget />` (Visual streak map / dots)
  3. `<FinanceWidget />` (Horizontal progress bars mapping spent vs limit)
  4. `<SocialWidget />` (List of contacts with "Ping" action buttons)
- Overview Row: Top cards showing Net Balance, Tasks Done, Habit Streak, and Social Health totals.
- All dashboard widgets will listen for the `dashboard_sync` WebSocket events and re-render optimistically or reactively via a custom hook (`useDashboardSync`).

## 5. Development Phases

1. **Phase 1: Backend Data & Tooling** - Create SQLAlchemy models, database migrations, and the new Python AI tools for managing these 4 areas.
2. **Phase 2: WebSocket Sync Engine** - Modify `websocket_manager.py` to support robust real-time state broadcast alongside the chat stream.
3. **Phase 3: Frontend Refactor** - Tear down the Crextio HR widgets, build the Aether widgets, and wire them to the React Context/WebSocket hook.
4. **Phase 4: Polish** - Ensure dynamic dragging works correctly, edge-to-edge layout is clean, and the entire app feels market-ready.
