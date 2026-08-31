# 5SS UET — CODEX MINIGAME HANDOFF

> Handoff Date: 2026-09-01  
> Prepared by: Antigravity Agent  
> Target Agent: Codex  
> Target Scope: STARPRINT Mini-Game & Scoring Engine Overhaul

---

## 1. REPOSITORY STATE

- **Current Branch:** `refactor/client-server`
- **Latest Commit:** `46c077f feat: migrate dynamic content to server-backed APIs`
- **Working Tree State:** Cleanly modified working tree with 17 tracked source files containing verified Round-1 UI/content refinements and visual polish:
  - Hero visual hierarchy (clean badges, centered Journey CTA below 3D star).
  - 5 SV5T Criteria Colors canonical synchronization (`#ff5c5c`, `#6cd5f7`, `#ffd467`, `#5fe3a1`, `#b794f6`).
  - Student Affiliation Showcase: Desktop static presentation with smooth tablet/mobile continuous marquee.
  - Journey CTA: Refined cosmic glow, hover feedback, and clear secondary visual hierarchy.
  - Official About section copy & tagline (`BEYOND A STAR — WE CREATE OUR OWN LIGHT.`).
  - Confirmed Contact configuration (`facebook.com/5ss.uet`, `@5ssuet`, `085 901 8686`, `5ss.uet.vnu@gmail.com`, 144 Xuân Thủy, `demoMode: true`, `mapUrl: null`).
  - **Quality Gates:** 0 typecheck errors, 0 linter errors, production build passes, 41/41 backend tests pass.

---

## 2. COMPLETED RECENT ARCHITECTURE & MILESTONES

1. **Client-Server Monorepo Refactor (`STABLE`):**
   - Workspaces: `client/` (`@5ss/client`), `server/` (`@5ss/server`), `packages/contracts/` (`@5ss/contracts`).
   - Architecture direction: `@5ss/contracts` $\rightarrow$ `@5ss/client` & `@5ss/server`.
2. **Dynamic Content Migration (`STABLE`):**
   - News, Events, Event Registration (with transactional row-locking & duplicate prevention), and Contact form submissions fully backed by NestJS 11 + TypeORM + PostgreSQL.
3. **Homepage Polish & Semantic Tokens (`STABLE`):**
   - Fully responsive across 320px, 375px, 390px, 768px, 1024px, 1440px.

---

## 3. CURRENT STARPRINT ARCHITECTURE

```text
client/src/features/starprint/
├── components/          # Shell, camera upload, color picker, step flow, SVGs
├── games/
│   ├── solve/           # [PROVISIONAL] Logic/speed question UI
│   ├── sense/           # [PROVISIONAL] 3-scenario decision matrix UI
│   ├── sprint/          # [PROVISIONAL] Infinite runner canvas
│   ├── support/         # [PROVISIONAL] Pipe/bridge rotation puzzle
│   └── sync/            # [PROVISIONAL] 8-pair memory card game
├── pages/
│   ├── StarprintPage.tsx        # Main game orchestrator
│   ├── StarprintResultPage.tsx  # Result card, download, publish
│   └── SkyPage.tsx              # 3D star sky + grid view
├── services/starprintApi.ts     # REST client
└── store/useStarprintStore.ts   # Zustand store with sessionStorage sync

packages/contracts/src/
├── games/               # GameId, SubmitGameRequest, SubmitGameResponse
├── sessions/            # Session lifecycle status & DTOs
├── starprints/          # StarprintRenderData, Palette, Effect, Profile
└── sky/                 # SkyStar, star.created socket event

server/src/modules/
├── sessions/            # PlayerSession entity, controller, service
├── games/               # GameResult entity, controller, service, scoring/
├── starprints/          # Starprint entity, controller, service, domain/
└── sky/                 # Sky controller, service, Socket.IO gateway
```

---

## 4. CRITICAL WARNING: LEGACY PROVISIONAL LOGIC VS NEW SPECIFICATION

> [!WARNING]
> The current mini-game implementation in `client/src/features/starprint/games/` and `server/src/modules/games/scoring/` was built earlier as a provisional demonstration MVP.
> **DO NOT** assume existing mini-game mechanics, question banks, trait vectors, or scoring algorithms are final.
> The upcoming source of truth is the approved document: **`Main question for building minigame in 5SS web`**.

---

## 5. NEW SOURCE OF TRUTH: `Main question for building minigame in 5SS web`

When implementing the mini-games, follow the approved design decisions in that document. Note: Later explicit/final "Chốt" sections override earlier exploratory questionnaire sections if any conflict arises.

### Summary of Known Major Specification Shifts:

| Component | Current Implementation (Provisional) | Target Specification (`Main question for building minigame in 5SS web`) |
| :--- | :--- | :--- |
| **Hidden Profile Traits** | 5 dimensions: `focus`, `explore`, `energy`, `social`, `adapt` | **7 official traits:** `Sharpness`, `Insight`, `Precision`, `Initiative`, `Connection`, `Adaptation`, `Persistence` |
| **Star Types (Personalities)** | `NAVIGATOR`, `EXPLORER`, `CATALYST`, `CONNECTOR`, `VISIONARY` | **5 official types:** `STRATEGIST`, `SPARK`, `SYNERGIST`, `SEEKER`, `SUSTAINER` |
| **SOLVE** | 4 simple logic questions | Logic / Speed quiz with updated trait vector weighting |
| **SENSE** | 3 scenarios with 5D vectors | 3 situational decision scenarios mapped to 7-trait vector contributions |
| **SPRINT** | Endless obstacle avoidance runner | **Finite 3-lane runner** (Left / Right / Jump), 15–18s track, 20s hard cap, max 2 attempts |
| **SUPPORT** | Pipe/path rotation puzzle | **Cut-the-Rope physics/puzzle game** (3 predefined puzzles, 10s per puzzle, tap/click rope, auto-reset on invalid state) |
| **SYNC** | Simple 8-pair flip matching | **Memory + Semantic Matching** (20 cards / 10 pairs, 4×5 grid, 30s timer) |
| **Scoring Engine** | Legacy 5D aggregation | Server-side deterministic normalization across 7 traits, dominant trait mapping, deterministic tie-breaking |

---

## 6. DOCUMENT PRIORITY HIERARCHY

Codex must strictly resolve requirements using this priority order:

1. **Latest detailed mini-game specification (`Main question for building minigame in 5SS web`)** — Primary source of truth for all game rules, traits, scoring, and archetypes.
2. **Current source code** — Primary source of truth for technical architecture, monorepo structure, and existing working integrations.
3. **`PROJECT_CONTEXT.md`** — Canonical architecture handoff and status.
4. **`AGENTS.md`** — Rules of engagement (no destructive Git commands, preserve user work).
5. **Current architecture & testing docs (`docs/architecture/`, `docs/testing/`)**.
6. **Historical prompts (`docs/prompts/*`)** — Reference context only; superseded by current code and latest spec.

---

## 7. SAFE NEXT ACTION FOR CODEX

When Codex starts the mini-game migration, it should follow this exact sequence:

```text
Step 1: Read current repository state + this handoff + latest mini-game specification.
Step 2: Perform GAP ANALYSIS:
        - Contracts (@5ss/contracts: GameResult, Profile, StarType, DTOs)
        - Client Mini-Game Components (SOLVE, SENSE, SPRINT, SUPPORT, SYNC)
        - Server Scoring Engine (scoring.service.ts, type-engine.ts, palette-engine.ts)
        - Database entities (JSONB profile structures)
        - Automated Unit & E2E Tests
Step 3: Create a structured IMPLEMENTATION PLAN and request user review before coding.
Step 4: Execute iteratively (Contracts -> Server Engine -> Client Games -> Integration -> QA).
```

---

## 8. GIT & ENVIRONMENT SAFETY

- **DO NOT** use destructive Git commands (`git reset --hard`, `git checkout .`, `git restore .`, `git clean -fd`).
- **DO NOT** automatically commit or push.
- **Preserve** the 17 uncommitted working-tree files from Round-1 UI polish.
