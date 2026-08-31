# PROJECT CONTEXT — 5SS UET Website & STARPRINT Platform

> Last source audit: 2026-08-31, after the npm-workspaces monorepo refactor.
>
> This file is the engineering handoff for the live repository. Source code and package manifests remain the source of truth when they disagree with documentation.

## 1. Product scope and status

5SS UET is the digital brand space for the Sinh viên 5 Tốt Club at VNU University of Engineering and Technology. The repository currently contains:

1. A public marketing experience for the club and five Sinh viên 5 Tốt criteria.
2. A browser-local checklist and constellation journey.
3. Demo news, events, contact, and registration experiences.
4. STARPRINT: a server-backed five-game flow that generates a deterministic illustrated star result.
5. 5SS Sky: a privacy-filtered public collection with REST loading, Socket.IO updates, 3D rendering, and a grid fallback.

### Status language

- **Implemented:** the current client/server lifecycle, validation, persistence, image processing, publication transaction, and live Sky update.
- **Demo/provisional:** marketing data, forms, official club information, all game content and balance, five-dimensional scoring, archetype names/descriptions, and type/effect mapping.
- **Not present:** authentication, user accounts, moderation/admin UI, recognized evidence submission, production media storage, backend deployment infrastructure, and automated client tests.

The current STARPRINT engine is deterministic and server-enforced, but it is not an approved psychometric instrument. Do not present it as official club policy or finalize any `TODO BUSINESS CONFIRMATION` or `TODO GAME DESIGN CONFIRMATION` item without approved stakeholder requirements.

## 2. Monorepo architecture

The root `package.json` is private and owns these npm workspaces:

```text
5SS website/
├── client/                    @5ss/client
│   ├── src/
│   │   ├── app/               router, providers, shells, loading, not-found
│   │   ├── marketing/         homepage pages/sections/data/layout
│   │   ├── features/          activities, forms, journey, starprint
│   │   ├── shared/            reusable components, hooks, HTTP, utilities
│   │   ├── three/             marketing and STARPRINT scenes
│   │   ├── styles/            ordered CSS architecture
│   │   ├── config/            site and contact sources of truth
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── .env.example
│   ├── vite.config.ts
│   └── vercel.json
├── server/                    @5ss/server
│   ├── src/
│   │   ├── common/            domain exceptions, global filter, CORS helper
│   │   ├── config/            environment mapping
│   │   ├── database/          TypeORM module, CLI data source, migrations
│   │   ├── modules/           sessions, games, uploads, starprints, sky
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/                  Jest unit + full lifecycle tests
│   └── .env.example
├── packages/
│   └── contracts/             @5ss/contracts shared TypeScript contracts
├── docs/
│   ├── architecture/
│   ├── testing/
│   └── prompts/               historical implementation prompts
├── AGENTS.md
├── README.md
├── PROJECT_CONTEXT.md
├── package.json
└── package-lock.json
```

Dependency direction:

```text
@5ss/contracts ─────► @5ss/client ─────► browser
       │                    │ REST + Socket.IO
       └────────────► @5ss/server ─────► PostgreSQL
                              └────────► local upload directory (development)
```

### Workspace boundaries

- Client code imports source through the `@/*` alias and shared API/domain types through `@5ss/contracts`.
- Server feature code lives under `server/src/modules/*`. Cross-module relative imports must follow that structure.
- Database migrations live under `server/src/database/migrations/*`. The TypeORM CLI reads compiled files from `server/dist/database/migrations/*.js`.
- `@5ss/contracts` exports games, sessions, starprints, and Sky contracts. Keep request/response/event shape changes synchronized there before adapting both consumers.
- Do not move generated `dist/` output or runtime `uploads/` into source control.

## 3. Root commands and build outputs

| Root command | Scope |
| --- | --- |
| `npm run dev:client` | Vite development server for `@5ss/client` |
| `npm run dev:server` | Nest watch server for `@5ss/server` |
| `npm run build` | Contracts, then client, then server |
| `npm run build:contracts` | `packages/contracts/dist/` |
| `npm run build:client` | `client/dist/` |
| `npm run build:server` | `server/dist/` |
| `npm run typecheck` | All workspace typecheck scripts with `--if-present` |
| `npm run lint` | All workspace lint scripts with `--if-present` |
| `npm test` | Server Jest suite |
| `npm run preview` | Client production preview |

Server-only runtime/migration scripts are invoked through the workspace, for example:

```powershell
npm --workspace @5ss/server run start:prod
npm --workspace @5ss/server run migration:run
```

The migration scripts reference compiled JavaScript. Run `npm run build:server` before them.

## 4. Client architecture

### Stack

- React/React DOM 19.2
- Vite 8.2 and TypeScript 6.0
- React Router 7.18
- Zustand 5 with `sessionStorage` persistence for STARPRINT
- Motion 13 and Lenis 1.3
- Tailwind CSS 4 plus repository CSS files
- Three.js 0.180, React Three Fiber 9.7, Drei 10.7, and postprocessing
- Socket.IO Client 4.8
- Oxlint

### Routing

`client/src/app/App.tsx` owns all routes and lazy-loads the three STARPRINT/Sky pages.

| Path | Shell | Component | URL state |
| --- | --- | --- | --- |
| `/` | `MarketingShell` | `marketing/pages/HomePage` | Home anchors: `#gioi-thieu`, `#hanh-trinh`, `#starprint-showcase`, `#hoat-dong-noi-bat`, `#faq`, `#lien-he` |
| `/hanh-trinh-5-tot` | `MarketingShell` | `features/journey/pages/JourneyPage` | `?criterion=<id>`; valid IDs are `dao-duc`, `hoc-tap`, `the-luc`, `tinh-nguyen`, `hoi-nhap` |
| `/hoat-dong` | `MarketingShell` | `features/activities/pages/ActivitiesPage` | `?item=<news-or-event-id>` opens the matching modal |
| `/starprint` | `GameShell` | `features/starprint/pages/StarprintPage` | `?new=1` resets persisted game state, then replaces the URL |
| `/starprint/result/:id` | `GameShell` | `features/starprint/pages/StarprintResultPage` | `:id` is the server STARPRINT UUID |
| `/sky` | `GameShell` | `features/starprint/pages/SkyPage` | Local 3D/grid view state |
| `*` | `MarketingShell` | `app/routes/NotFoundPage` | Not found |

Do not revive the stale pre-refactor route or path names `src/*`, `?news=`, or `?event=` in documentation. The activities page uses one `item` parameter.

### Shell and loading contracts

- `MarketingShell` owns Header, Footer, the skip link, page title/description changes, Lenis, and hash scrolling with an 80px offset.
- `GameShell` is minimal and supplies the reduced-motion data attribute.
- The cinematic `LoadingScreen` is shown only while marketing routes initialize. `/starprint*` and `/sky` bypass it. Its internal progress tracking is decoupled from `@react-three/drei` and driven by font/image/timer progression to ensure zero Three.js footprint on initial boot while maintaining the identical visual UX.
- STARPRINT, result, Sky, and the 3D Sky scene are lazy chunks. All 3D scenes (`HeroGalaxyScene`, `Criteria3DScene`, `StarSkyScene`) are loaded strictly on demand via `React.lazy` and `<Suspense>`.

### Client state and data

| Concern | Source of truth | Persistence |
| --- | --- | --- |
| Marketing/site metadata | `client/src/config/site.ts` | Source file |
| Contact/location channels | `client/src/config/contact.ts` | Source file; links are currently null placeholders |
| About/FAQ | `client/src/marketing/data/*` | Source files; demo copy |
| Activities/events | `client/src/features/activities/data/activities.ts` | Source file; demo content |
| Journey content | `client/src/features/journey/data/journey.ts` | Source file; advisory/demo content |
| Journey checklist | `journey-progress.repository.ts` | `localStorage` key `uet5ss:journey-progress:v1` |
| STARPRINT browser session | `useStarprintStore.ts` | `sessionStorage` key `starprint-session`, partial state only |
| STARPRINT authoritative progress | Server session/game records | PostgreSQL |
| Activity/journey selection | URL search parameters | Browser history |
| Public Sky | REST snapshot plus `star.created` | React state |

The STARPRINT store persists session ID, nickname, current step, completed game IDs, and selected color. On reload the page calls `GET /api/sessions/:id`; generated or published sessions redirect to their result, while incomplete sessions reconcile to the next game.

`submitGameWithReconciliation()` handles a lost successful response by fetching the session and accepting the game as completed when the server already stored it.

### Forms and content status

- `contact.service.ts` and `registration.service.ts` are simulated delay adapters. They do not send data to the server.
- Activities, dates, locations, registration availability, images, and much of the marketing prose are explicitly illustrative.
- `siteConfig.demoMode` is `true`.
- Recruitment URL, social/email/phone links, and map URL are not confirmed.
- The journey disclaimer states that the guidance does not replace official Hội Sinh viên requirements.

### Styling, motion, and 3D

`client/src/index.css` defines a sensitive import order:

```text
tailwindcss
→ tokens.css
→ animations.css
→ components.css
→ pages.css
→ journey.css
→ theme-5ss.css
→ responsive.css
→ starprint.css
→ base/layout rules in index.css
```

Preserve this order unless a deliberate cascade migration accompanies the change.

Three.js scenes are separated by concern:

- `client/src/three/marketing/HeroGalaxyScene.tsx` — homepage hero.
- `client/src/three/marketing/Criteria3DScene.tsx` — five-criteria visualization.
- `client/src/three/starprint/StarSkyScene.tsx` — public community sky.

The Sky defaults to its grid view for users who prefer reduced motion. Interactive UI must retain semantic HTML, keyboard behavior, visible focus, mobile safe areas, and non-WebGL fallbacks.

## 5. Shared contracts

`packages/contracts/src/index.ts` re-exports:

- `games`: `GameId`, submit request/response, and the five IDs.
- `sessions`: create/response shapes and lifecycle status union.
- `starprints`: generation/publication/result shapes, palette, type, and effect.
- `sky`: public star and `star.created` event envelope.

The package points TypeScript consumers to `src/index.ts` and runtime consumers to `dist/index.js`. Current imports are type-only, but the root build still emits the package before its consumers.

Contract status values:

```text
IN_PROGRESS → READY_TO_GENERATE → GENERATED → PUBLISHED
```

Game IDs in the contract are a union and are not ordered. The server service and client store separately enforce the current demo sequence:

```text
solve → sense → sprint → support → sync
```

## 6. Server architecture

### Stack

- NestJS 11 with Express
- TypeScript 5.7 compilation target
- TypeORM 0.3 with PostgreSQL
- class-validator/class-transformer and a global strict `ValidationPipe`
- Swagger 11 at `/api/docs`
- Socket.IO 4.8
- Sharp 0.35
- Jest 29 and ts-jest

### Bootstrap and cross-cutting behavior

`server/src/main.ts`:

- loads `AppModule`;
- configures credentialed CORS through `buildCorsOriginMatcher`;
- strips unknown properties and rejects non-whitelisted DTO fields;
- installs `DomainExceptionFilter`;
- serves the configured local media directory at `/uploads`;
- publishes Swagger at `/api/docs`;
- listens on `PORT`, default 3000.

In production, CORS accepts exact comma-separated `CLIENT_ORIGIN` values. In non-production it additionally permits localhost, loopback, and RFC1918 private IPv4 origins for LAN booth testing.

### Modules

| Module | Location | Responsibility |
| --- | --- | --- |
| Sessions | `server/src/modules/sessions` | Create/restore player sessions, update photo/status |
| Games | `server/src/modules/games` | Enforce demo sequence, validate current raw-result shapes, persist one result per game, aggregate scores |
| Uploads | `server/src/modules/uploads` | Accept up to 5 MB JPEG/PNG/WebP, auto-orient/resize inside 1024×1024, encode WebP quality 85, save locally |
| Starprints | `server/src/modules/starprints` | Generate palette/type/profile, persist once per session, fetch, publish with consent |
| Sky | `server/src/modules/sky` | Return consent-filtered public stars and broadcast `star.created` |

Generation and publication each use a TypeORM QueryRunner transaction to save the STARPRINT state and corresponding session status together. Publication emits the Socket.IO event only after the transaction commits.

### REST and real-time surface

| Method | Path | Current contract |
| --- | --- | --- |
| `POST` | `/api/sessions` | `CreateSessionRequest → SessionResponse` |
| `GET` | `/api/sessions/:id` | `SessionResponse` |
| `POST` | `/api/sessions/:sessionId/photo` | Multipart field `file → { photoUrl }` |
| `POST` | `/api/sessions/:sessionId/games/:gameId` | `SubmitGameRequest → SubmitGameResponse` |
| `POST` | `/api/starprints/generate` | `GenerateStarprintRequest → StarprintResponse` |
| `GET` | `/api/starprints/:id` | `StarprintResponse` |
| `POST` | `/api/starprints/:id/publish` | `PublishStarprintRequest → { success: true }` |
| `GET` | `/api/sky` | `SkyStar[]`, newest first |
| Socket.IO | `star.created` | `SkyStarCreatedEvent` |

### Persistence model

The initial migration creates:

- `player_sessions` — nickname, optional photo URL, status, timestamps.
- `game_results` — session FK, enum game ID, JSONB raw result, timestamp, unique session/game pair.
- `starprints` — unique session FK, base color, JSONB palette/profile, type/effect, publication and consent flags, timestamps.

Both child tables cascade when their session is deleted. `synchronize` and automatic migration execution are disabled.

### Current STARPRINT rules are demo rules

The server is authoritative about the current implementation:

- it accepts games only in the current five-step order;
- it validates IDs, bounds, and shapes defined in `raw-result-validator.ts`;
- it requires all five stored results before generation;
- it stores only one result per game and one STARPRINT per session;
- it calculates a bounded five-dimension profile, selects the dominant demo archetype, and creates a deterministic palette;
- it filters public nickname/photo fields using independent consent flags.

This authority protects state integrity; it does **not** make the questions, scenarios, timings, weights, profile dimensions, tie order, archetypes, labels, or visual effects approved business rules.

## 7. Environment and networking

### Client: `client/.env`

| Variable | Behavior |
| --- | --- |
| `VITE_API_URL` | REST base including `/api`. The example uses `http://localhost:3000/api`. If unset, the shared HTTP client derives the page hostname with port 3000. |
| `VITE_MEDIA_URL` | Optional explicit media origin (e.g. CDN or S3 bucket). Documented in `client/.env.example`. If left blank, automatically derived from `VITE_API_URL`. |

`SkyPage` derives its Socket.IO origin directly from `VITE_API_URL` and otherwise falls back to localhost. Therefore LAN and production builds should always provide `VITE_API_URL` explicitly.

### Server: `server/.env`

| Variable | Default |
| --- | --- |
| `PORT` | `3000` |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/5ss` |
| `CLIENT_ORIGIN` | `http://localhost:5173` |
| `MEDIA_STORAGE` | `local` |
| `MEDIA_LOCAL_DIR` | `uploads` |

`MEDIA_STORAGE` is not yet an adapter switch: `UploadsModule` always injects `LocalMediaStorage`.

## 8. Local development and database workflow

From the repository root:

```powershell
npm install
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
npm run build:contracts
npm run build:server
npm --workspace @5ss/server run migration:run
```

Then run:

```powershell
npm run dev:server
npm run dev:client
```

The repo has no combined `dev` script. The client defaults to port 5173 and listens on all interfaces. The server defaults to port 3000 and connects to PostgreSQL during application initialization.

## 9. Testing and verification

The current Jest configuration discovers both `*.spec.ts` and `*.e2e-spec.ts` under `server/`.

- `server/test/scoring.spec.ts`: 13 deterministic scoring/type/palette tests.
- `server/test/app.e2e-spec.ts`: 11 lifecycle tests against a real PostgreSQL connection, including invalid order/payload, duplicate prevention, reload restoration, generation, publication, and consent filtering.
- Total current test cases: 24.
- E2E cleanup deletes the created session, relying on database cascades. Use a dedicated migrated non-production database.
- There are no client component, browser, accessibility automation, or visual-regression tests.

Required repository checks:

```powershell
npm run typecheck
npm run lint
npm run build
npm --workspace @5ss/server test -- --runInBand
```

See `docs/testing/README.md` for prerequisites and manual smoke coverage.

## 10. Deployment model

`npm run build` produces:

- `packages/contracts/dist/`;
- `client/dist/`, a static SPA;
- `server/dist/`, a long-running Node service.

Current repository support:

- `client/vercel.json` rewrites all client routes to `index.html`.
- `server/package.json` provides `start:prod` as `node dist/main`.
- Database migration scripts are available, but they are not run automatically.

Production gaps:

- no Dockerfiles, process manager, health endpoint, CI/CD, infrastructure-as-code, or backend hosting config;
- no managed database or backup configuration;
- no durable media adapter/CDN; local disk can disappear on ephemeral hosts;
- no authentication, authorization, rate limiting, moderation, or admin workflow;
- no provider-specific monorepo build configuration has been validated.

A provider must install at the repository root, build workspace dependencies, host `client/dist` with an SPA fallback, run `server/dist/main.js` on a WebSocket-capable service, supply PostgreSQL, run migrations, and configure client/server origins.

## 11. Confirmations and technical debt

### TODO GAME DESIGN CONFIRMATION

Do not finalize without organizer/BA approval:

1. SOLVE question bank, answer keys, timer, difficulty, and scoring.
2. SENSE scenarios, language, choices, and five-dimensional vectors.
3. SPRINT duration, physics, spawn rates, collision rules, and scoring.
4. SUPPORT layouts, path rules, time/rotation scoring, and fallback behavior.
5. SYNC cards, pair count, cooldown, mismatch behavior, and scoring.

### TODO BUSINESS CONFIRMATION

1. The five archetype names, descriptions, dimensions, thresholds, and tie behavior.
2. Archetype-to-effect mapping (`flow`, `shimmer`, `spark`, `orbit`, `pulse`).
3. Whether/how STARPRINT results should be framed to users.
4. Official club copy, milestones, leader information/media, social links, email, phone, recruitment link, and map.
5. Official journey criteria, evidence rules, recognized activities, and disclaimers.
6. Real event data, registration policy, privacy notice, retention, and consent language.

### Engineering debt/placeholders

1. Local-only media storage; `MEDIA_STORAGE` does not select an adapter.
2. Sky Socket.IO fallback is localhost rather than the HTTP helper's LAN-aware fallback.
3. Simulated contact/registration adapters.
4. No automated client tests.
5. Server compiler options are permissive compared with the strict contracts/client packages.
6. E2E tests use the configured database rather than provisioning an isolated database automatically.
7. Deployment configuration covers only a client-side Vercel history rewrite.

## 12. Sensitive files and change map

| Concern | Primary locations |
| --- | --- |
| Router/shell isolation | `client/src/app/App.tsx`, `client/src/app/shells/*` |
| Marketing navigation and metadata | `client/src/config/site.ts`, `client/src/marketing/components/layout/*` |
| Contact placeholders | `client/src/config/contact.ts`, `client/src/marketing/sections/Contact/*` |
| Journey data and local persistence | `client/src/features/journey/data/journey.ts`, `journey-progress.repository.ts` |
| Activity demo data/modal URL | `client/src/features/activities/data/activities.ts`, `pages/ActivitiesPage.tsx` |
| STARPRINT state and reconciliation | `client/src/features/starprint/store/useStarprintStore.ts`, `services/gameSubmission.ts` |
| Client REST/media origin | `client/src/shared/services/http/apiClient.ts` |
| CSS cascade | `client/src/index.css` and `client/src/styles/*` |
| 3D scenes | `client/src/three/marketing/*`, `client/src/three/starprint/*` |
| Public contracts | `packages/contracts/src/*` |
| Server lifecycle | `server/src/modules/sessions/*`, `games/*`, `starprints/*` |
| Demo rule validation/scoring | `server/src/modules/games/validation/*`, `scoring/*`, `questions/*` |
| Transactions/privacy broadcast | `server/src/modules/starprints/starprints.service.ts`, `server/src/modules/sky/*` |
| Database schema | `server/src/database/migrations/*`, `database/data-source.ts` |
| CORS/bootstrap/static media | `server/src/main.ts`, `server/src/common/utils/cors.util.ts` |

## 13. Agent handoff checklist

Before material changes:

1. Read `AGENTS.md` and this file.
2. Check `git status` and preserve unrelated working-tree changes.
3. Confirm the relevant source path is under the refactored workspace, not a pre-refactor root path.
4. Update `@5ss/contracts` first when a public client/server shape changes.
5. Keep demo/business caveats unless requirements are explicitly approved.

Before finishing:

1. Re-read the changed source and update this context when architecture, behavior, routes, API, data flow, configuration, dependencies, tests, deployment, or technical debt changed.
2. Run relevant typecheck, lint, build, and tests.
3. Ensure documentation does not claim placeholder content is official or that local infrastructure is production-ready.
