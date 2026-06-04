# AGENTS.md

## Project Overview

Chinese middle school English spelling game (拼字游戏). Players see a Chinese meaning and must spell the English word by arranging scrambled letters. Feedback uses Wordle-style color coding (green/yellow/gray). The entire UI is in Chinese — this is intentional.

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build (production)
npm run lint       # eslint .
npm run preview    # Preview production build locally
```

No test framework is configured. There are no tests.

## Tech Stack

- **React 19** + **TypeScript 6** (strict mode, `erasableSyntaxOnly: true`)
- **Vite 8** with `@vitejs/plugin-react` and `@tailwindcss/vite` plugins
- **Tailwind CSS 4** (uses `@theme inline` and CSS variables, no `tailwind.config` file)
- **shadcn/ui** (base-nova style, `rsc: false`) — UI primitives live in `src/components/ui/`
- **lucide-react** for icons
- **`class-variance-authority`** + **`clsx`** + **`tailwind-merge`** via the `cn()` utility in `src/lib/utils.ts`

## Path Alias

`@/*` maps to `./src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`).

## Architecture

### State Management

No external state library. All state lives in custom React hooks:

- **`useGameState`** (`src/hooks/useGameState.ts`) — Central game state machine. Phase-based: `welcome → playing → feedback → levelComplete`. Uses `useState` + `useRef` for stale-closure avoidance. All game actions (`selectLetter`, `submitAnswer`, `nextWord`, etc.) are `useCallback` with functional `setState` updates.
- **`useStats`** (`src/hooks/useStats.ts`) — Persists stats to `localStorage` under key `spelling-game-stats`. Auto-saves on every state change via `useEffect`.
- **`useSpeech`** (`src/hooks/useSpeech.ts`) — Thin wrapper around `window.speechSynthesis` (Web Speech API, `en-US`, rate 0.8).

### Data Flow

```
App.tsx
  ├── useGameState()  →  GameState (phase-driven rendering)
  ├── useStats()      →  Stats (localStorage-backed)
  │
  ├── phase=welcome      → WelcomeScreen (grade filter)
  ├── phase=playing/feedback → GameScreen (main gameplay)
  └── phase=levelComplete → LevelComplete (level results)
```

`App.tsx` is the only place where `useGameState` and `useStats` connect — `GameScreen` receives `onRecordWord` to bridge them.

### Game Logic

`src/lib/game.ts` contains pure functions:

- `scrambleLetters()` — Fisher-Yates shuffle, guaranteed to differ from original
- `calculateFeedback()` — Two-pass Wordle-style letter matching (correct → present → absent)
- `calculateScore()` — Points with streak/time bonuses, hint penalty
- `getWordsForLevel()` — Filters + shuffles words by level config
- `LEVELS` — Array of `LevelConfig` objects defining difficulty progression

### Word Data

`src/data/words.ts` exports a static `Word[]` array. Each word has `{ word, meaning, grade }` where grade is `'7A' | '7B' | '8A' | '8B'` (Chinese school textbook semesters).

### Components

All components are functional with explicit TypeScript interfaces. No prop drilling beyond one level. Game components receive state + callbacks from `App`:

| Component | Purpose |
|---|---|
| `WelcomeScreen` | Grade selection, game start |
| `GameScreen` | Orchestrates gameplay UI, handles feedback display |
| `AnswerSlots` | Letter slots with feedback coloring |
| `LetterPool` | Scrambled letter buttons |
| `ActionBar` | Clear/Submit/Hint buttons |
| `MeaningDisplay` | Shows Chinese meaning + speaker button |
| `LevelComplete` | End-of-level results + next level navigation |
| `StatsDialog` | shadcn Dialog with learning statistics |
| `CoinEffect` | CSS particle animation on correct answers |

## Key Conventions

- **Named exports only** for components (no default exports except `App`).
- **Functional `setState`** everywhere in `useGameState` — never read state directly in callbacks; always use the `prev` parameter.
- **No router** — navigation is purely phase-based state.
- **No API calls** — fully client-side, all data is static.
- **Tailwind CSS 4** — no config file; theme is defined inline in `src/index.css` using `@theme inline` with CSS custom properties.
- Game-specific colors (`correct`, `present`, `absent`) are defined as custom Tailwind theme colors in `index.css` and used via `text-correct`, `bg-correct`, etc.

## Deployment

- **GitHub Pages** via `.github/workflows/deploy.yml`
- Triggers on push to `main`
- Uses `npm ci` + `npm run build`, then deploys `dist/`
- Node 22 in CI
- `base: '/'` in `vite.config.ts`

## Gotchas

- **`erasableSyntaxOnly: true`** in tsconfig — this means TypeScript features that require runtime emit (like `enum`, `namespace`, `parameter properties`) are forbidden. Use `const` objects or union types instead.
- **`verbatimModuleSyntax: true`** — requires explicit `type` keyword on type-only imports: `import type { Foo } from '...'`.
- **`noUnusedLocals` and `noUnusedParameters`** are enabled — the build will fail on unused variables.
- Tailwind CSS 4 uses a different configuration approach than v3 — don't look for `tailwind.config.js`. Theme extensions live in `src/index.css`.
- Adding shadcn/ui components: use `npx shadcn@latest add <component>`. Config is in `components.json` at project root.
- The `selectedLetters` array in game state uses `null` for empty slots and pool indices for filled slots — this is the core data structure connecting `LetterPool` to `AnswerSlots`.
