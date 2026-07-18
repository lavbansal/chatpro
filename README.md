# chatpro

A ChatGPT-style chat interface built with [assistant-ui](https://github.com/assistant-ui/assistant-ui) and the [Vercel AI SDK](https://sdk.vercel.ai/), running on Next.js 15 with the App Router.

## Features

- Streaming chat UI powered by `@assistant-ui/react`
- Model picker in the header: OpenAI (GPT-4o mini / GPT-4o), Google Gemini, and OpenRouter models, with unavailable models greyed out until their API key is set
- Tool calling: a built-in `getWeather` tool backed by the free Open-Meteo API (no key required), plus an optional `webSearch` tool backed by [Tavily](https://tavily.com/) when `TAVILY_API_KEY` is set
- Image and text-file attachments in the composer; image attachments are only offered for models that support vision
- Light/dark mode toggle in the header (follows the system theme by default)
- Collapsible sidebar, thread list, and Markdown rendering (GitHub-flavored)
- Server-side chat endpoint with request validation and clear error messages surfaced in the UI
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

Copy the example file and fill in your key(s):

```bash
cp .env.example .env.local
```

```
OPENAI_API_KEY=sk-...            # required (default models)
GOOGLE_GENERATIVE_AI_API_KEY=... # optional, enables Gemini models
OPENROUTER_API_KEY=...           # optional, enables OpenRouter models
TAVILY_API_KEY=tvly-...          # optional, enables the webSearch tool
```

Models whose key is missing appear disabled in the model picker. Without `TAVILY_API_KEY` the assistant simply has no web search tool; everything else works.

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
  api/chat/route.ts    # Chat endpoint (validation, system prompt, tools, streaming)
  api/models/route.ts  # Lists models and whether their API key is configured
  assistant.tsx        # Chat layout: sidebar + thread + model picker state
  page.tsx             # Renders <Assistant />
  layout.tsx           # Root layout, fonts, global styles
components/
  assistant-ui/        # Thread, message, attachment, and markdown components
  model-picker.tsx     # Header model dropdown
  ui/                  # shadcn-style primitives (button, sidebar, ...)
lib/
  models.ts            # Model registry shared by client and server
  utils.ts             # cn() and helpers
  @ai-sdk/openrouter.ts  # OpenRouter provider (OpenAI-compatible API)
```

## Adding or changing models

Edit the registry in [`lib/models.ts`](lib/models.ts). Each entry maps a model id to a provider (`openai`, `google`, or `openrouter`) and declares whether the model accepts image input (`supportsImages`). The provider determines which environment variable must be set for the model to be selectable; `supportsImages` controls whether the composer offers image attachments while that model is selected.
