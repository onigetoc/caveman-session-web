# Caveman Conversation Compressor

High-fidelity conversation compression for LLM workflows. Paste a transcript of a
human ↔ LLM exchange, and the app rewrites it into a condensed, structured brief that
another LLM can pick up and resume from — without losing decisions, constraints, code,
or open questions.

Every run is measured: token / word / character counts before and after, percentage
savings, and the actual Gemini API cost of producing the compression.

> **Why?** Long agent-style sessions burn context. A 60–80% smaller transcript that
> preserves every decision and every identifier verbatim is cheaper to resend on every
> subsequent turn.

## Features

- **Two compression prompts, editable in-app**
  - `caveman` — a strict, structured compressor. Emits `CONTEXT`, `FACTS`, `DECISIONS`,
    `CODE/TECH`, `STATE`, `OPEN`. Telegraphic style, technical identifiers preserved verbatim.
  - `ponytail` — a lazy-senior-developer voice prompt, edited live in the modal and resettable
    to its default at any time.
- **Three intensity levels** — `lite` (fluff stripped, full sentences), `full` (fragment /
  telegraphic, the default), `ultra` (one word per fact).
- **Live statistics** — character, word, and token counts for both sides, updated as you type.
  Token counts use `js-tiktoken` (`cl100k_base`) with a ~4-chars-per-token fallback.
- **Savings & cost panel** — percentage saved, plus the real prompt/candidate token usage and
  an estimated USD cost returned by the API.
- **Sample transcripts** — React/Express debugging, database architecture choice, customer
  support escalation. One click loads them.
- **Split / single-pane views**, formatted preview vs raw markdown editing, copy to clipboard,
  and download the result as a `.md` file.
- **Keyboard shortcut** — `Ctrl+Enter` / `Cmd+Enter` runs compression.

## Tech stack

| Layer     | Choice                                                       |
| --------- | ------------------------------------------------------------ |
| Frontend  | React 19, TypeScript, Vite 6, Tailwind CSS 4, lucide-react   |
| Backend   | Express (Node), `tsx` in dev, bundled to CJS for production   |
| AI        | Google Gemini via `@google/genai` (`gemini-3.1-flash-lite`)   |
| Tokenizing| `js-tiktoken` (`cl100k_base`)                                 |

## Requirements

- Node.js 20+ (or [Bun](https://bun.sh), given the lockfile)
- A Gemini API key — get one at [Google AI Studio](https://aistudio.google.com/apikey)

## Getting started

```bash
# 1. Install dependencies
bun install        # or: npm install

# 2. Create your env file
cp .env.example .env
# then set GEMINI_API_KEY in .env

# 3. Start the dev server (Vite runs in middleware mode)
bun run dev        # or: npm run dev
```

Open <http://localhost:3000>.

## Environment variables

| Variable         | Required | Description                                                  |
| ---------------- | -------- | ------------------------------------------------------------ |
| `GEMINI_API_KEY` | Yes      | Gemini API key. The server throws at request time if missing. |
| `APP_URL`        | No       | Public URL of the deployment, injected in hosted environments. |
| `NODE_ENV`       | No       | `production` serves the built bundle from `dist/` instead of Vite. |
| `DISABLE_HMR`    | No       | Set to `true` to turn off Vite HMR and file watching.         |

## Scripts

| Command         | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| `dev`           | Express + Vite middleware, dev server on port 3000.                |
| `build`         | `vite build`, then bundle `server.ts` to `dist/server.cjs`.        |
| `start`         | Run the production bundle (`NODE_ENV=production`).                 |
| `lint`          | `tsc --noEmit` type check.                                         |
| `clean`         | Remove `dist/` and `server.js`.                                    |

## API

### `POST /api/compress`

```json
{
  "transcript": "User: ...\nAssistant: ...",
  "prompt": "optional system instruction",
  "level": "lite | full | ultra"
}
```

Response:

```json
{
  "success": true,
  "compressedText": "CONTEXT: ...",
  "apiUsage": {
    "promptTokens": 4210,
    "candidatesTokens": 880,
    "totalTokens": 5090,
    "estimatedCostUsd": 0.00058
  }
}
```

`prompt` becomes the Gemini `systemInstruction`; `level` is prepended as an intensity
instruction. Temperature is fixed at `0.2` for fidelity.

### `GET /api/health`

Returns `{ "status": "ok" }`.

## Project structure

```
server.ts                        # Express app, /api/compress, Vite middleware or static dist
index.html                       # Vite entry
src/
  App.tsx                        # State, keyboard shortcut, layout composition
  main.tsx                       # React root
  components/
    Header.tsx                   # Brand, sample loader, level switch, view toggle, compress button
    MainArea.tsx                 # Input/output panes + structured Caveman renderer
    PromptModal.tsx              # Edit / select / reset system prompts
    StatusBar.tsx                # Token stats, savings badge, cost, copy, download
  constants/cavemanPrompt.ts     # Default caveman + ponytail prompts, sample transcripts
  utils/tokenCounter.ts          # cl100k_base counting and savings calculation
```

## How the compression works

1. The active system prompt is sent as Gemini's `systemInstruction`; the transcript plus the
   intensity level becomes the user content.
2. The model strips pleasantries, rejected alternatives, and reasoning that never changed the
   conclusion — while keeping facts, decisions, code, commands, errors, paths, numbers, and open
   questions verbatim.
3. The output is rendered with the section headers highlighted, and both sides are re-measured
   client-side.

**Anti-loss rule** (built into the default prompt): if compressing something would make a
decision or constraint ambiguous, keep it in plain uncompressed language. Clarity always wins
over compression ratio.

## Notes and caveats

- Client-side token counts use `cl100k_base` (OpenAI's encoding) as a common denominator for
  savings, so they will not exactly match Gemini's own token counts. Use the `apiUsage` figures
  for what Gemini actually charged.
- `estimatedCostUsd` in `server.ts` uses hard-coded Flash-tier rates — update them if you change
  the model.
- Nothing is persisted; state lives in React only and is lost on reload.

## License

MIT