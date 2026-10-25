# PROJECT CONTEXT — 5SS UET & STARPRINT

Last source audit: 2026-10-25. Source code and manifests are authoritative. This document describes the current implementation; older checkpoints are archived in `docs/history/2026-10-25-before-cloud.md` and are not operating guidance.

## Product and architecture

The npm-workspaces monorepo contains a React/Vite marketing site, browser-local five-criterion journey, news/events/contact/registration API, STARPRINT v2 five-game workflow and public 5SS Sky. Marketing and Game route shells remain separate. Preserve CSS ordering, accessibility, responsive behavior and reduced-motion fallbacks.

| Workspace | Responsibility | Output |
| --- | --- | --- |
| `client` / `@5ss/client` | React 19, TypeScript, Vite 8, Router, Zustand, Motion, Three/R3F, Socket.IO | `client/dist` |
| `server` / `@5ss/server` | NestJS 11, TypeORM, PostgreSQL, Socket.IO, validation/Swagger | `server/dist` |
| `packages/contracts` / `@5ss/contracts` | Shared request/response/domain/version shapes | `packages/contracts/dist` |

Build contracts first. Install from repository root. The architecture guide is `docs/architecture/README.md`; current operations are in `docs/deployment/README.md`.

## Current deployment implementation

User approved Vercel frontend, Render Free API in Singapore, Supabase Free PostgreSQL in Singapore, and cron-job.org external requests. No media storage service or persistent disk is required.

- Supabase project `5ss-starprint` (`pwyfnsondzatcjrncbve`) is Healthy. Data API is disabled; SSL enforcement is enabled.
- All six TypeORM migrations were applied. A repeatable-read transfer copied and checksum-verified 100 application records: 3 news, 1 event, 19 sessions, 65 game results, 8 starprints, 4 contact submissions and 0 registrations.
- Existing local DB and runtime image files are preserved. Custom-format backup and checksum report are in ignored `scratch/`; no secrets/backups are tracked.
- Cloud rows clear legacy portrait URLs and physical-card flags. Static marketing URLs use first-party `/assets/` paths.
- Runtime `app_runtime` has only application DML/schema usage. Application tables have RLS policies restricted to that role; anon/authenticated grants are revoked. Migration credentials remain separate.
- Local API successfully starts against Supabase with the runtime role; `/api/health/ready` returns healthy.
- Render service srv-dberbdjncjis73f6jk70 is Live at https://fivess-starprint-api.onrender.com on release code commit 41f0214. Vercel API/media variables have been replaced with Config values for the assigned Render origin. cron-job.org jobs 8718306 (5 min liveness) and 8718317 (15 min readiness) are enabled, with HTTP 200 test runs and email failure/recovery after 3 failures. Vercel Production is Ready on 41f0214. Both jobs also succeeded on scheduled executions. Full production gameplay, 1200×1886 card download with a local image, public mascot-only card, exactly one realtime star event, and backend restart/reconnect were verified. At deployment completion, three synthetic QA sessions were removed and the original 100 application records were retained; see the subsequent owner-requested game reset below.

### Owner-requested fresh-game reset — 2026-10-25 15:31 (Asia/Ho_Chi_Minh)

After accepting the deployed game, the owner explicitly requested clearing all existing stars and starting fresh. The production Supabase game tables were backed up (verified custom-format archive plus JSON snapshot), write-locked and cleared transactionally: **9 starprints, 70 game results and 20 sessions removed**. All three game tables were verified empty, live `GET /api/sky` returned `200 []`, and readiness remained healthy. News (3), events (1), contacts (4), registrations (0) and migration history (6) were content-checksummed unchanged. The original local database/files were not reset. Backup/report files are ignored under `scratch/starprint-before-reset-2026-10-25T08-31-13-888Z.*`; do not commit them. Existing browser tabs may require reload; `/starprint?new=1` clears their old local game state. This operation does not establish a recurring retention/deletion policy.

## Client routes and state

| Route | Behavior |
| --- | --- |
| `/` | Club marketing, 3D scene, anchors and dynamic activities |
| `/hanh-trinh-5-tot?criterion=<id>` | Browser-local checklist and selected criterion |
| `/hoat-dong?item=<slug>` | API-backed activities/detail modal |
| `/starprint?new=1` | Reset local STARPRINT state and begin workflow |
| `/starprint/result/:id` | Result, local portrait overlay, PNG download and media preference |
| `/star/:id` | Public shared result using default mascot |
| `/sky` | Public REST snapshot + Socket.IO additions; 3D/grid fallback |

Zustand `useStarprintStore` persists partial state under sessionStorage key `starprint-session`, version 2. It stores session ID, nickname, step, completed games, selected color, assignments and optional local data-image portrait. A memory fallback keeps play usable when storage is blocked/full; quota fallback persists progress without the portrait. Reload durability is best-effort in those cases. Version migration and merge reject legacy server portrait URLs. Changing session ID/reset clears the portrait. Closing the tab ends normal sessionStorage retention (browser session restoration may retain it).

On reload, the client waits for readiness, then reconciles with `GET /api/sessions/:id`. Server state determines completed games/results. Only an actual missing session resets progress; transient network/cold-start errors retain state and offer retry. The game is gated during restore so timers do not run before reconciliation. A new session POST waits for readiness to avoid retrying a non-idempotent create. Readiness polling has a 90-second bound; ordinary GETs retry transient failures, writes are not automatically repeated.

Sky refetches its snapshot on socket connect/reconnect. There is one Render process and no Redis/shared event bus; horizontal scaling requires additional work.

## Portrait and card policy (approved 2026-10-25)

- Camera and file selection remain available. JPEG/PNG/WebP up to 5 MB are decoded/resized to at most 1024×1024 and converted to JPEG in the browser.
- Portraits are data URLs in browser session storage/memory only. No photo bytes or generated card PNG are sent to the API.
- Visible local card and manual download share `renderStarCardToBlob`. Output remains 1200×1886 PNG with student-friendly filename.
- Result view overlays a local portrait only when result session ID matches the current local session. Public sharing and Sky use the default star mascot.
- Server responses always return `photoUrl: null` and `physicalCardRequested: false`, including legacy records. New generation disables physical printing; the UI no longer requests physical printing.
- UploadsModule, local-media adapter, Sharp dependency, photo upload/delete and card-image upload routes have been removed. `/uploads` is no longer served. Old DB columns/files are retained for compatibility; the new server never writes images/cards.
- Publication remains automatic after generation, and media permission remains editable. Local photo storage does not alter scoring or archetypes.

## Gameplay invariants

The current active v2 workflow is SOLVE → SENSE → SPRINT → SUPPORT → SYNC → color → generation/reveal. Preserve server authority, deterministic assignments, versioned payload validation and null-versus-zero observability semantics.

- SOLVE: canonical 50-question bank, exactly one per category (five categories), 6 seconds/question and five options.
- SENSE: 15 scenarios in five groups, three distinct groups/session, 10 seconds/scenario; weighted primary/secondary tendencies, response-time modifiers and consistency bonus.
- SPRINT: deterministic finite three-lane track, max two attempts on the same track, collision slowdown, 20-second cap.
- SUPPORT: three deterministic cut-the-rope puzzles, 10-second timer each, reset wrong cuts without resetting the timer.
- SYNC: 20 cards/10 semantic pairs, 30-second cap, 600ms mismatch lock, versioned image deck.
- Seven traits: sharpness, insight, precision, initiative, connection, adaptation, persistence. Profile aggregation excludes structural null and includes observed numeric zero.
- Cosine classification uses five archetypes STRATEGIST/SPARK/SYNERGIST/SEEKER/SUSTAINER; effect identifiers SHIMMER/SPARK/ORBIT/FLOW/PULSE, deterministic tiebreak/fallback, five-wing OKLCH palette and similar-color guard.
- Legacy v1 payloads/results remain supported where implemented; do not rewrite scoring as part of deployment.
- A session ID functions as an unguessable owner capability for writes. There are no user accounts, admin dashboard, moderation system or validated psychometric claims.

## API and database

| Method | Route |
| --- | --- |
| GET | `/api/health` (liveness; no DB) |
| GET | `/api/health/ready` (bounded pool query; 503 on failure) |
| POST / GET | `/api/sessions`, `/api/sessions/:id` |
| POST | `/api/sessions/:sessionId/games/:gameId` |
| POST / GET / POST | `/api/starprints/generate`, `/api/starprints/:id`, `/api/starprints/:id/publish` |
| GET | `/api/sky`, `/api/news`, `/api/news/:slug`, `/api/events`, `/api/events/:slug` |
| POST | `/api/events/:eventId/registrations`, `/api/contact` |
| WS | Socket.IO `star.created`, namespace/path defaults |
| GET | `/api/docs` Swagger |

Seven application tables: player_sessions, game_results, starprints, news, events, event_registrations, contact_submissions. TypeORM maintains migrations separately. Six migrations in `server/src/database/migrations`; no synchronize or automatic runtime migration. `scripts/render-start.sh` runs locked transactional migrations before starting Node. The URL-fix migration only changes four known image paths and has a no-op down.

Publication commits DB state before emitting Sky events. Session/game ordering, duplicate submission, registration identity/capacity and ownership validation remain enforced.

## Runtime configuration and security

`server/src/config/database.config.ts` is shared by the runtime and compiled migration data source. Production requires a URL and verified TLS; optional CA PEM/file. SSL URL parameters are rejected to prevent pg overriding certificate settings. Session Pooler 5432 supports the session advisory lock; transaction pooling 6543 does not. Runtime pool defaults max 5/min 0, 30s idle/3s connect; migration pool max 2. Search path includes public and extensions. Readiness uses the existing pool with a 2s query timeout.

Client VITE variables are public and baked at build time. `VITE_API_URL` includes `/api`; socket origin omits it. `/assets/` stays on Vercel. `client/.env.production` supplies a public API default; deployment overrides win. No database secrets belong in client env.

Production CORS uses exact `CLIENT_ORIGIN` values. Express trusts one Render proxy hop in production. Bounded process-memory per-IP POST limits: contact 10/min, event registrations collectively 20/min, session creation 120/min; return 429 and Retry-After. Gameplay and health are excluded. Limits reset on process restart and are not distributed; they reduce basic abuse, not DDoS.

## Commands and checks

- `npm ci` installs all workspaces; Node is pinned in `.node-version`.
- `npm run dev:server` and `npm run dev:client` run local applications separately.
- `npm run dev:tunnel` only starts the optional fixed-domain ngrok tunnel to local port 3000; it does not start the server or database.
- `npm run build`, `npm run typecheck`, `npm run lint` cover all workspaces.
- Build server before `npm run migration:deploy` or workspace `migration:run`.
- `npm test -- --runInBand` runs server tests. Always use an isolated test DB; integration tests write/delete their fixtures.
- CI: `.github/workflows/ci.yml`, clean npm install, typecheck/lint/build, isolated PostgreSQL service, migrations, Jest. It does not access production secrets.
- Latest local validation: typecheck/build/lint passed; public result mapping also redacts the internal owner UUID; Jest **140/140 in 13 suites**, including upload retirement, health failures, TLS config and write limits. Clean GitHub CI passed on 12bc7b7 and PR #1 merged. Production health/readiness/news/events/Sky, exact CORS, upload retirement, public capability redaction and 50 concurrent readiness requests passed; full frontend production rollout/card export/reload and Sky realtime/reconnect checks passed. Backup restore into an isolated DB and browser-storage fallback checks also passed. See docs/deployment/VALIDATION.md.

## TODO BUSINESS CONFIRMATION / TODO GAME DESIGN CONFIRMATION

These stakeholder decisions are not finalized by deployment work. Preserve the historical pending list until BA/organizers approve it:

1. Review official SYNC illustrations/deck assets with BA; do not infer final approval from shipped versioned assets.
2. Final zero-vector and exact near-tie classifier policy.
3. Final visual behavior for Type-to-effect mapping; identifiers/mapping remain fixed.
4. Official club copy, milestones, leadership media, recruitment links and evidence rules.
5. Event/registration policy, privacy notice, retention and consent language.
6. Historical Round 1 confirmations remain as recorded in the archived context; deployment does not expand their scope.

## Remaining debt / operational limits

- No automated client UI/visual/accessibility suite. Browser smoke verification is required for changed flows.
- Public session capability is not an account authentication system; no moderation/admin interface.
- Free Render can restart/suspend and shares instance hours with other services; pings do not guarantee availability. Supabase Free requires owner-controlled backups and quota/pause checks.
- No durable image/card service by deliberate current scope. Users must download PNG for durable portrait-bearing results.
- Database raw-game retention fields exist; an approved production retention/cleanup policy is still required.
- Large Three.js bundles retain existing Vite chunk warnings. Server TS settings are looser than client/contracts.
