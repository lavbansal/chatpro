# Instructions

- Never use em dashes.
- Never add a `Co-Authored-By` trailer that names Claude to a commit message.
- Only modify files required for the current task. Preserve unrelated user changes.
- Do not add a dependency unless it is necessary. Explain why before adding it.
- Never commit or push unless the user explicitly requests it. Use concise commit messages and never include AI attribution.
- Avoid `any`, silent error handling, duplicated logic, and speculative abstractions.
- For user-facing changes, preserve the existing design system and handle loading, empty, success, and error states.
- Update `README.md` or `.env.example` when commands, configuration, environment variables, or setup steps change.

# Project

- Next.js 15 (App Router, Turbopack) + React 19 + TypeScript.
- Chat UI built on `@assistant-ui/react` with the Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/google`).
- Styling with Tailwind CSS v4; UI primitives under `components/ui` (shadcn-style, configured via `components.json`).
- Chat backend lives in `app/api/chat/route.ts`. App entry is `app/page.tsx` / `app/assistant.tsx`.
- Requires `OPENAI_API_KEY` in `.env.local`.

# Commands

- `npm run dev` — start the dev server on http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint (`eslint-config-next`)
