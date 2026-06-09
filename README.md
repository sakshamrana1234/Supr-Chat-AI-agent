# SwiftCart AI Support Chat

A production-quality AI-powered live chat support agent for SwiftCart (fictional e-commerce store), built for the **Spur Founding Full-Stack Engineer** take-home assignment.

---

## Features

- 💬 Real-time AI chat powered by OpenAI GPT-3.5 Turbo
- 🔄 Persistent conversation history (survives page reloads via localStorage + PostgreSQL)
- 🛍️ FAQ knowledge baked into the system prompt (shipping, returns, payments, etc.)
- ⌨️ "Agent is typing…" indicator with animated dots
- 📱 Fully responsive (mobile-first fallback to full-screen)
- 🛡️ Input validation, LLM error handling, friendly error UI
- 💡 Suggested questions on first open
- 🗂️ Clean layered architecture: routes → controllers → services → repositories

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + TypeScript + Vite        |
| Backend    | Node.js + Express + TypeScript      |
| Database   | PostgreSQL + Prisma ORM             |
| LLM        | OpenAI API (GPT-3.5 Turbo)         |
| Styling    | Vanilla CSS (no framework)          |

---

## Folder Structure

```
spur-chat/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # DB schema (Conversation + Message)
│   │   └── seed.ts                # Demo seed data
│   └── src/
│       ├── controllers/
│       │   └── chat.controller.ts # HTTP ↔ service translation
│       ├── lib/
│       │   ├── prisma.ts          # Prisma singleton
│       │   └── types.ts           # Shared TypeScript types
│       ├── middlewares/
│       │   └── errorHandler.ts    # Global error + 404 handlers
│       ├── repositories/
│       │   └── conversation.repository.ts  # All DB queries
│       ├── routes/
│       │   └── chat.routes.ts     # Express route definitions
│       ├── services/
│       │   ├── chat.service.ts    # Business logic
│       │   └── llm.service.ts     # OpenAI integration
│       ├── app.ts                 # Express app setup
│       └── index.ts               # Entry point + graceful shutdown
└── frontend/
    └── src/
        ├── components/
        │   ├── ChatWidget.tsx      # Main chat panel
        │   ├── MessageBubble.tsx   # Individual message
        │   ├── TypingIndicator.tsx # Animated dots
        │   └── ErrorBanner.tsx     # Error display
        ├── hooks/
        │   └── useChat.ts         # All chat state + API calls
        ├── types/
        │   └── index.ts           # Shared TS types
        ├── utils/
        │   └── api.ts             # Fetch wrappers
        ├── App.tsx
        ├── main.tsx
        └── styles.css             # All styles (CSS variables, responsive)
```

---

## Local Setup

### Prerequisites

- Node.js ≥ 18
- PostgreSQL running locally (or a hosted instance like Supabase/Neon)
- An OpenAI API key

---

### 1. Clone and install

```bash
git clone <your-repo-url>
cd spur-chat
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/spur_chat?schema=public"
OPENAI_API_KEY="sk-..."
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

### 3. Database setup

```bash
# Create DB (if not already done)
createdb spur_chat

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# (Optional) Seed with demo data
npm run db:seed
```

### 4. Start the backend

```bash
npm run dev
# → Server running on http://localhost:3001
```

### 5. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3001
```

### 6. Start the frontend

```bash
npm run dev
# → App running on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) and start chatting!

---

## Environment Variables

### Backend (`.env`)

| Variable         | Description                                   | Required |
|-----------------|-----------------------------------------------|----------|
| `DATABASE_URL`   | PostgreSQL connection string                  | ✅       |
| `OPENAI_API_KEY` | Your OpenAI secret key                        | ✅       |
| `PORT`           | Port for the Express server (default: 3001)   | ✅       |
| `CORS_ORIGIN`    | Allowed frontend origin                       | ✅       |

### Frontend (`.env`)

| Variable        | Description              | Required |
|----------------|--------------------------|----------|
| `VITE_API_URL`  | Backend base URL         | ✅       |

---

## API Documentation

### `POST /chat/message`

Send a user message and get an AI reply.

**Request body:**
```json
{
  "message": "What are your shipping options?",
  "sessionId": "uuid-optional"
}
```

**Response:**
```json
{
  "reply": "We offer shipping to India (3–5 days) and the USA (7–12 days)...",
  "sessionId": "c1e4f2a0-..."
}
```

**Error responses:**
- `400` — Empty message or message too long (>1000 chars)
- `502` — OpenAI API error (returned as a user-friendly message)
- `500` — Internal server error

---

### `GET /chat/history/:sessionId`

Retrieve all messages for a conversation.

**Response:**
```json
{
  "sessionId": "c1e4f2a0-...",
  "messages": [
    {
      "id": "...",
      "conversationId": "...",
      "sender": "user",
      "text": "Hi!",
      "createdAt": "2024-03-01T10:00:00.000Z"
    }
  ]
}
```

---

### `GET /health`

Basic health check — returns `{ "status": "ok" }`.

---

## LLM Architecture

### Provider
OpenAI — GPT-3.5 Turbo (cost-efficient, fast, well-suited for structured support tasks)

### Prompting Strategy

1. **System prompt** — establishes the agent identity, tone, and hard rules ("only use the store policies below")
2. **Store knowledge** — shipping, returns, payments, support hours, cancellations baked directly into the system prompt as structured text
3. **Conversation history** — last 10 turns (20 messages) are included for context continuity
4. **User message** — appended last

```
[System: identity + knowledge]
[History: last N turns]
[User: current message]
```

### Cost controls
- `max_tokens: 500` per reply
- `temperature: 0.4` (more deterministic for support)
- Max 10 history turns (20 messages) included per request
- Message length capped at 1000 characters on the backend

### Guardrails
- LLM errors (401, 429, 503) are caught and translated to user-friendly messages
- Empty or whitespace-only messages are rejected before hitting the LLM
- The system prompt instructs the agent to escalate unknowns to human support rather than hallucinate

---

## Data Model

```
Conversation
  id         uuid (PK)
  createdAt  timestamp
  updatedAt  timestamp

Message
  id             uuid (PK)
  conversationId uuid (FK → Conversation.id, CASCADE DELETE)
  sender         enum { user, ai }
  text           text
  createdAt      timestamp
```

Session continuity is handled by storing the `conversationId` in `localStorage` on the frontend and passing it as `sessionId` on every request.

---

## Deployment

### Backend → Render (Free tier)

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo, set root directory to `backend/`
3. Build command: `npm install && npm run db:generate && npm run db:deploy && npm run build`
4. Start command: `node dist/index.js`
5. Add environment variables in the Render dashboard
6. Add a **PostgreSQL** database in Render and copy the connection string to `DATABASE_URL`

### Frontend → Vercel

1. Import your GitHub repo on [Vercel](https://vercel.com)
2. Set root directory to `frontend/`
3. Framework preset: **Vite**
4. Add `VITE_API_URL` pointing to your Render backend URL (e.g. `https://spur-chat-api.onrender.com`)
5. Deploy

---

## Trade-offs & Design Decisions

### Deliberate simplifications

- **No auth** — The prompt explicitly said it's not required. Session identity via localStorage UUIDs is sufficient for the exercise.
- **Optimistic UI** — User message appears immediately; removed on failure. This feels snappier than waiting for the round trip.
- **Minimal DB schema** — No user table, no metadata on conversations. Easy to extend.
- **Vanilla CSS** — Chose not to add Tailwind to keep the bundle small and avoid the config overhead for a single-page app.

### If I had more time…

- **Streaming responses** — Use `openai.chat.completions.stream()` + SSE to stream tokens to the frontend for a more interactive feel
- **Redis caching** — Cache recent conversation history to reduce DB queries on hot sessions
- **Rate limiting** — Add per-IP or per-session rate limits with `express-rate-limit`
- **Tool calling** — Let the LLM call structured tools (e.g. `lookupOrder(orderId)`) for real order status lookups
- **Multiple channels** — The `chat.service.ts` / `llm.service.ts` separation makes it straightforward to plug in a WhatsApp or Instagram adapter
- **Tests** — Unit tests for `chat.service.ts` and `llm.service.ts` (jest + ts-jest), plus integration tests for the API routes
- **Better markdown rendering** — Use a proper markdown parser (e.g. `marked`) instead of the naive regex in `MessageBubble.tsx`
- **Conversation management** — Allow users to start a new conversation or view past ones
- **Admin dashboard** — View all conversations, flag ones needing human follow-up
