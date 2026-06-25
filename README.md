# Sitecore AI Chat — Next.js + OpenAI + Sitecore Search

A production-ready RAG (Retrieval-Augmented Generation) chat application that grounds OpenAI GPT-4o answers with live content from **Sitecore Search (Discover)**.

---

## Architecture

```
User Message
     │
     ▼
┌─────────────────────────────────┐
│  Next.js 14 App Router          │
│  /api/chat  (POST)              │
└────────────┬────────────────────┘
             │
     ┌───────┴────────┐
     │                │
     ▼                ▼
Sitecore Search    OpenAI GPT-4o
(RAG context)      (completion)
     │                │
     └───────┬────────┘
             ▼
     Grounded AI Response
     + Source Citations
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Required: OpenAI
OPENAI_API_KEY=sk-proj-...

# Required: Sitecore Search (Discover)
SITECORE_SEARCH_API_URL=https://discover.sitecorecloud.io
SITECORE_SEARCH_API_KEY=your-api-key
SITECORE_SEARCH_CUSTOMER_KEY=your-customer-key  # e.g. "rfkid_xxx"

# Optional
SITECORE_SEARCH_SOURCE_ID=your-source-id
OPENAI_MODEL=gpt-4o
```

### 3. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Sitecore Search Setup

1. Go to [Sitecore Search](https://search.sitecorecloud.io) → **Settings → API Keys**
2. Copy your **Customer Key** and **API Key**
3. Set up a **Source** with your content (website crawler, sitemap, or manual ingestion)
4. Configure the search widget with `rfk_id: "rfkid_7"` (or update in `lib/sitecoreSearch.ts`)

### Search API Endpoint

The app calls the Sitecore Discover REST API:

```
POST https://discover.sitecorecloud.io/v1/{customerKey}/search/v3/discover
```

You can customize the widget configuration in `lib/sitecoreSearch.ts` to match your specific **rfk_id** and entity types.

---

## File Structure

```
sitecore-chat-app/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts         # Chat API: OpenAI + Sitecore RAG
│   ├── components/
│   │   ├── ChatMessage.tsx      # Message bubble + source cards
│   │   └── ChatInput.tsx        # Textarea + suggested prompts
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main chat page
│   └── globals.css              # All styles
├── lib/
│   └── sitecoreSearch.ts        # Sitecore Search client
├── .env.local.example
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Features

- **RAG Pattern**: Every user query first searches Sitecore for relevant content, which is injected as context into the OpenAI prompt
- **Source Citations**: AI responses include clickable source cards from Sitecore with title, description, type, and date
- **Toggle**: Sidebar switch to enable/disable Sitecore Search grounding
- **Streaming-ready**: API route is structured for easy upgrade to streaming responses
- **Conversation History**: Full multi-turn conversation sent to OpenAI on each request
- **Suggested Prompts**: Quick-start chips for common queries
- **Error Handling**: Graceful fallback if Sitecore Search fails
- **Mobile Responsive**: Sidebar collapses on mobile

---

## Customization

### Change the OpenAI model

```env
OPENAI_MODEL=gpt-4o-mini   # cheaper
OPENAI_MODEL=gpt-4-turbo   # older turbo
```

### Update the system prompt

Edit `SYSTEM_PROMPT` in `app/api/chat/route.ts`.

### Add streaming

Replace `openai.chat.completions.create` with `openai.chat.completions.stream` and update the route to return a `ReadableStream`.

### Custom Sitecore widget

Edit `lib/sitecoreSearch.ts` to match your widget's `rfk_id` and field mappings.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| AI | OpenAI GPT-4o via `openai` SDK |
| Search | Sitecore Search (Discover) REST API |
| Styling | Plain CSS (no Tailwind dependency) |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
