# chatpro

A ChatGPT-style chat interface built with [assistant-ui](https://github.com/assistant-ui/assistant-ui) and the [Vercel AI SDK](https://sdk.vercel.ai/), running on Next.js 15 with the App Router.

## Features

- Streaming chat UI powered by `@assistant-ui/react`
- Collapsible sidebar, thread list, and Markdown rendering (GitHub-flavored)
- Server-side chat endpoint using the Vercel AI SDK
- OpenAI (`gpt-4o-mini`) by default, with a drop-in OpenRouter provider available
- Tailwind CSS v4 with shadcn-style UI primitives

## Tech stack

- Next.js 15 (App Router, Turbopack) + React 19 + TypeScript
- `@assistant-ui/react`, `@assistant-ui/react-ai-sdk`
- Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/google`)
- Tailwind CSS v4, Radix UI, lucide-react

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your key:

```bash
cp .env.example .env.local
```

```
OPENAI_API_KEY=sk-...
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the dev server (Turbopack)     |
| `npm run build` | Create a production build            |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Run ESLint (`eslint-config-next`)    |

## Project structure

```
app/
  api/chat/route.ts   # Chat endpoint (streams from the model)
  assistant.tsx       # Chat layout: sidebar + thread
  page.tsx            # Renders <Assistant />
  layout.tsx          # Root layout, fonts, global styles
components/
  assistant-ui/       # Thread, message, and markdown components
  ui/                 # shadcn-style primitives (button, sidebar, ...)
lib/
  utils.ts            # cn() and helpers
  @ai-sdk/openrouter.ts  # Optional OpenRouter provider
```

## Switching the model

The default model is set in [`app/api/chat/route.ts`](app/api/chat/route.ts):

```ts
model: openai("gpt-4o-mini"),
```

To use OpenRouter instead, set `OPENROUTER_API_KEY` in `.env.local`, then swap the import for the provider in `lib/@ai-sdk/openrouter.ts`.
