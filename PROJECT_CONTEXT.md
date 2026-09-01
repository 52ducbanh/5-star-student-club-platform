# PROJECT CONTEXT — 5SS UET Website & STARPRINT Platform

> Last source audit: 2026-09-01, handoff from Antigravity to Codex.
>
> This file is the engineering handoff for the live repository. Source code and package manifests remain the source of truth when they disagree with documentation.

## 1. Product scope and status

5SS UET is the digital brand space for the Sinh viên 5 Tốt Club at VNU University of Engineering and Technology. The repository currently contains:

1. A public marketing experience for the club with 3D solar system, centered Journey CTA beneath the 3D star, desktop static student affiliation logo showcase (with responsive mobile marquee), and synchronized 5 criteria color system.
2. A browser-local checklist and constellation journey with criteria deep-linking.
3. Server-backed news, events, event registration, and contact submission experiences (NestJS + PostgreSQL).
4. STARPRINT Platform:
   - **Current Implementation:** server-backed five-game flow (`solve`, `sense`, `sprint`, `support`, `sync`) with provisional/legacy 5-dimension scoring (`focus`, `explore`, `energy`, `social`, `adapt`) and 5 legacy star archetypes (`NAVIGATOR`, `EXPLORER`, `CATALYST`, `CONNECTOR`, `VISIONARY`).
   - **Official v2 foundation implemented:** shared contracts now define the canonical 7 Hidden Traits, official Star Type/effect identifiers, fixed five-color wing palette, version families, explicit legacy/v2 raw-result maps, and server-side Local/Global Hidden Profile normalization/aggregation. The v2 engine is deliberately not wired into the current game submission/generation path yet.
   - **Upcoming migrations:** the detailed specification in `Main question for building minigame in 5SS web` still requires game-by-game migration, cosine classification, OKLCH palette generation, Result/Public Star ID work, and additive persistence changes. The current gameplay and generated results remain legacy v1 until those checkpoints are completed.
5. 5SS Sky: a privacy-filtered public collection with REST loading, Socket.IO updates, 3D rendering, and a grid fallback.

### Status language

- **Implemented:** the current client/server lifecycle, validation, persistence, image processing, publication transaction, live Sky update, dynamic news and events API, event registration with capacity and duplicate identity enforcement, and contact form submissions.
- **Demo/provisional:** marketing copy, initial news/events seed data, official club leadership/recruitment links, all game content and balance, five-dimensional scoring, archetype names/descriptions, and type/effect mapping.
- **Not present:** authentication, user accounts, moderation/admin dashboard UI, recognized evidence submission, production media storage (S3/GCS), backend deployment infrastructure, and automated client tests.

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
│   │   ├── database/          TypeORM module, CLI data source, migrations, seeds
│   │   ├── modules/           sessions, games, uploads, starprints, sky, news, events, contact
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/                  Jest unit + full lifecycle + dynamic content tests
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
- Development database seeds live under `server/src/database/seeds/*` and run via `node dist/database/seeds/dev-seed.js`.
- `@5ss/contracts` exports activities, games, sessions, starprints, and Sky contracts. Keep request/response/event shape changes synchronized there before adapting both consumers.
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

Server-only runtime/migration/seed scripts are invoked through the workspace:

```powershell
npm --workspace @5ss/server run start:prod
npm --workspace @5ss/server run migration:run
npm --workspace @5ss/server run seed:dev
```

The migration and seed scripts reference compiled JavaScript. Run `npm run build:server` before them.

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

`client/src/app/routes/AppRoutes.tsx` owns all routes and lazy-loads the three STARPRINT/Sky pages. `client/src/app/App.tsx` supplies `BrowserRouter` and the global loading provider.

| Path | Shell | Component | URL state |
| --- | --- | --- | --- |
| `/` | `MarketingShell` | `marketing/pages/HomePage` | Home anchors: `#gioi-thieu`, `#hanh-trinh`, `#starprint-showcase`, `#hoat-dong-noi-bat`, `#faq`, `#lien-he` |
| `/hanh-trinh-5-tot` | `MarketingShell` | `features/journey/pages/JourneyPage` | `?criterion=<id>`; valid IDs are `dao-duc`, `hoc-tap`, `the-luc`, `tinh-nguyen`, `hoi-nhap` |
| `/hoat-dong` | `MarketingShell` | `features/activities/pages/ActivitiesPage` | `?item=<slug>` opens the matching news or event modal by slug |
| `/starprint` | `GameShell` | `features/starprint/pages/StarprintPage` | `?new=1` resets persisted game state, then replaces the URL |
| `/starprint/result/:id` | `GameShell` | `features/starprint/pages/StarprintResultPage` | `:id` is the server STARPRINT UUID |
| `/sky` | `GameShell` | `features/starprint/pages/SkyPage` | Local 3D/grid view state |
| `*` | `MarketingShell` | `app/routes/NotFoundPage` | Not found |

Do not revive stale pre-refactor route or query parameter names (`src/*`, `?news=`, `?event=`). The activities page uses the single `item` slug parameter (`?item=<slug>`).

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
| News & Events | Server REST API (`/api/news`, `/api/events`) | PostgreSQL (`news`, `events`) |
| Event Registration | Server REST API (`/api/events/:id/registrations`) | PostgreSQL (`event_registrations`) |
| Contact Submissions | Server REST API (`/api/contact`) | PostgreSQL (`contact_submissions`) |
| Journey content | `client/src/features/journey/data/journey.ts` | Source file; advisory/demo content |
| Journey checklist | `journey-progress.repository.ts` | `localStorage` key `uet5ss:journey-progress:v1` |
| STARPRINT browser session | `useStarprintStore.ts` | `sessionStorage` key `starprint-session`, partial state only |
| STARPRINT authoritative progress | Server session/game records | PostgreSQL |
| Activity/journey selection | URL search parameters | Browser history (`?item=<slug>`, `?criterion=<id>`) |
| Public Sky | REST snapshot plus `star.created` | React state |

### Activities and deep-link behavior

- `/hoat-dong` fetches news and events in parallel from the backend on mount.
- If deep-linked via `?item=<slug>`, `ActivitiesPage` immediately queries `GET /api/news/:slug` (and falls back to `GET /api/events/:slug`) so the requested modal opens promptly without waiting for the entire list payload.
- API failures are rendered as visible, actionable error states — never disguised as empty lists (`HTTP 200 []` is the only legitimate empty state).
- Date and time presentation are formatted on the client from canonical ISO `timestamptz` values via `formatDisplayDate` and `formatTimeRange`.

### Forms

- `ContactForm` submits directly to `POST /api/contact`. Factual success and server-driven error feedback are rendered.
- `RegistrationForm` receives the event's internal UUID (`eventId`) and title (`eventTitle`), submitting to `POST /api/events/:eventId/registrations`. Duplicate student ID errors (409) and capacity/deadline errors (422) are surfaced to the user.

## 5. Shared contracts

`packages/contracts/src/index.ts` re-exports:

- `activities`: `NewsItem`, `EventItem`, `DerivedEventStatus`, `RegistrationRequest`, `RegistrationResponse`, `ContactRequest`, `ContactResponse`.
- `games`: canonical `GameId` order; explicit legacy payload contracts; forward-compatible v2 `GameRawResultMap`; legacy and v2 submission request shapes.
- `sessions`: create/response shapes and lifecycle status union.
- `starprints`: `TraitId`, `LocalTraitProfile` (`number | null`), numeric `GlobalHiddenProfile`, official `StarTypeId`/`StarEffect`, exact-five `WingPalette`, explicit legacy result/effect/palette shapes, and generation/publication responses.
- `sky`: public star and `star.created` event envelope.
- `versions`: centralized legacy-v1 and official-v2 identifiers for raw payload, content, scoring, profile model, and palette algorithm. An absent payload version is explicitly treated as legacy v1 during migration.

`@5ss/contracts` now emits Node16/CommonJS so its runtime invariant/version constants can be consumed by the CommonJS NestJS server as well as the Vite client. Jest maps the package to contract source so tests do not depend on a stale generated `dist` directory.

The official v2 profile foundation lives at `server/src/modules/games/scoring/v2/hidden-profile.engine.ts`. Its normalization input must explicitly declare all seven traits: `null` is reserved for a trait the game is structurally not designed to observe, while incorrect answers, timeouts, and zero positive signal use `rawContribution: 0` with a positive maximum from the valid opportunities actually presented. It normalizes authoritative raw/max pairs to `[0,1]`, aggregates each trait using an unweighted mean over non-null game observations, and returns `insufficient-evidence` only when a trait has no observing source across the supplied local profiles. An all-zero but fully observed profile is complete evidence. The legacy submission route rejects versioned v2 payloads; the legacy `ScoringService` remains active and isolated.

`RegistrationRequest` deliberately excludes `eventId`, as the event UUID is supplied through the endpoint route parameter `POST /api/events/:eventId/registrations`.

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

### Modules

| Module | Location | Responsibility |
| --- | --- | --- |
| Sessions | `server/src/modules/sessions` | Create/restore player sessions, update photo/status |
| Games | `server/src/modules/games` | Enforce demo sequence, validate raw-result shapes, persist one result per game, aggregate scores |
| Uploads | `server/src/modules/uploads` | Accept up to 5 MB JPEG/PNG/WebP, auto-orient/resize inside 1024×1024, encode WebP quality 85, save locally |
| Starprints | `server/src/modules/starprints` | Generate palette/type/profile, persist once per session, fetch, publish with consent |
| Sky | `server/src/modules/sky` | Return consent-filtered public stars and broadcast `star.created` |
| News | `server/src/modules/news` | List published news (ordered by `publishedAt DESC`), query by slug |
| Events | `server/src/modules/events` | List published events, derive `status` / `registrationAvailable`, query by slug, race-safe registration |
| Contact | `server/src/modules/contact` | Persist contact submissions with normalized fields |

### REST and real-time surface

| Method | Path | Contract |
| --- | --- | --- |
| `GET` | `/api/news` | `NewsItem[]` (published only, newest first) |
| `GET` | `/api/news/:slug` | `NewsItem` (404 if draft or missing) |
| `GET` | `/api/events` | `EventItem[]` (published only, newest first, derived `status`) |
| `GET` | `/api/events/:slug` | `EventItem` (404 if missing) |
| `POST` | `/api/events/:eventId/registrations` | `RegisterEventDto → RegistrationResponse` |
| `POST` | `/api/contact` | `ContactDto → ContactResponse` |
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

TypeORM migrations define the schema:

1. `player_sessions` — nickname, optional photo URL, status (`IN_PROGRESS`, `READY_TO_GENERATE`, `GENERATED`, `PUBLISHED`), timestamps.
2. `game_results` — session FK, enum game ID, JSONB raw result, timestamp, unique `(sessionId, gameId)`.
3. `starprints` — unique session FK, base color, JSONB palette/profile, type/effect, publication and consent flags, timestamps.
4. `news` — UUID PK, unique `slug`, title, excerpt, JSONB `body`, tag, optional `imageUrl`, `publishedAt` timestamptz (null = draft), timestamps.
5. `events` — UUID PK, unique `slug`, title, excerpt, JSONB `body`, location, optional `imageUrl`, `startAt` timestamptz, optional `endAt` timestamptz, optional `registrationDeadline` timestamptz, optional `capacity`, `registrationEnabled` boolean, `published` boolean, timestamps.
6. `event_registrations` — UUID PK, eventId FK (cascade on delete), name, normalized `studentId`, normalized `email`, phone, unit, optional message, timestamps. Unique constraint on `(eventId, studentId)`.
7. `contact_submissions` — UUID PK, name, normalized `email`, message text, timestamp.

### Event business & registration rules

- **Identifier strategy:** UUID is used for internal database keys, foreign keys, and the registration submission endpoint. `slug` is used for stable public identifiers and URL search parameters (`/hoat-dong?item=<slug>`).
- **Time canonicalization:** All temporal data is persisted as PostgreSQL `timestamptz` canonical values. Display strings (`dd.mm.yyyy`, `hh:mm`) are formatted client-side.
- **Status derivation:** `upcoming` vs `past` is derived at query time:
  ```text
  comparisonTime = endAt ?? startAt
  now > comparisonTime → 'past'
  otherwise → 'upcoming'
  ```
  In-progress events remain `upcoming`.
- **Publication state:** Events use `published: boolean`. News uses `publishedAt IS NOT NULL`.
- **Concurrency & Capacity:** Registration uses a transactional pessimistic row-lock (`SELECT ... FOR UPDATE` on the Event row). It validates publication, enabled state, deadline, and capacity before inserting.
- **Duplicate Prevention:** Enforced via database constraint `UNIQUE(eventId, studentId)`. `studentId` is trimmed; `email` is trimmed and lowercased before insert. Duplicate submissions throw `DomainException(DUPLICATE_REGISTRATION)` (HTTP 409).
- **Development Seed:** Migrations contain schema only. Development fixtures (6 news items, 4 events) are seeded via `npm --workspace @5ss/server run seed:dev`, which performs slug-based upsert with explicit `Asia/Ho_Chi_Minh` timezone parsing.

## 7. Environment and networking

### Client: `client/.env`

| Variable | Behavior |
| --- | --- |
| `VITE_API_URL` | REST base including `/api`. The example uses `http://localhost:3000/api`. If unset, the shared HTTP client derives the page hostname with port 3000. |
| `VITE_MEDIA_URL` | Optional explicit media origin (e.g. CDN or S3 bucket). Documented in `client/.env.example`. If left blank, automatically derived from `VITE_API_URL`. |

### Server: `server/.env`

| Variable | Default |
| --- | --- |
| `PORT` | `3000` |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/5ss` |
| `CLIENT_ORIGIN` | `http://localhost:5173` |
| `MEDIA_STORAGE` | `local` |
| `MEDIA_LOCAL_DIR` | `uploads` |

## 8. Local development and database workflow

From the repository root:

```powershell
npm install
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
npm run build:contracts
npm run build:server
npm --workspace @5ss/server run migration:run
npm --workspace @5ss/server run seed:dev
```

Then run:

```powershell
npm run dev:server
npm run dev:client
```

Default local URLs:
- Client: `http://localhost:5173`
- API and Socket.IO: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api/docs`

## 9. Testing and verification

The Jest test suite discovers `*.spec.ts` and `*.e2e-spec.ts` under `server/`:

- `server/test/scoring.spec.ts`: 13 deterministic scoring/type/palette tests.
- `server/test/hidden-profile-v2.spec.ts`: 35 focused tests for 7D local normalization, strict structural null/zero semantics, all-zero completeness, no-evidence handling, unweighted global aggregation, finite bounds, contract identifiers, fixed wing palette shape, version separation, and legacy-route rejection of v2 SOLVE/SENSE payloads.
- `server/test/app.e2e-spec.ts`: 11 STARPRINT full-lifecycle tests.
- `server/test/activities.e2e-spec.ts`: 17 tests covering News listing/slug/draft exclusion, Event listing/slug/status derivation, Event Registration (success, normalization, duplicate prevention, cross-event registration, disabled/expired rejection, capacity lock, invalid payloads), and Contact submission.
- **Total automated test cases: 76 across 4 suites (all passing).**

Required repository checks:

```powershell
npm run typecheck
npm run lint
npm run build
npm test
```

## 10. Confirmations and technical debt

### TODO GAME DESIGN CONFIRMATION / NEXT CODEX TASK

The upcoming mini-game specification is documented in `Main question for building minigame in 5SS web`. Checkpoint 1 established official terminology, versioning, typed contracts, and the standalone 7D Local/Global Profile engine. The remaining migration work is:

1. **Game integration:** Replace legacy 5D scorers with authoritative per-game v2 contribution/max-opportunity scorers and persist their Local Trait Profiles.
2. **Star Types:** Implement and integrate cosine classification for the official `STRATEGIST`, `SPARK`, `SYNERGIST`, `SEEKER`, and `SUSTAINER` contracts after the zero-vector/tie policy is finalized.
3. **SOLVE:** Update logic/speed question bank and trait contribution vectors.
4. **SENSE:** Update 3 scenario decision matrices for 7-trait vector contributions.
5. **SPRINT:** Rebuild as a finite 3-lane runner (Left / Right / Jump), 15–18s track length, 20s hard cap, max 2 attempts.
6. **SUPPORT:** Rebuild as Cut-the-Rope physics/puzzle game with 3 predefined puzzles (10s per puzzle), tap/click rope, and auto-reset after invalid state.
7. **SYNC:** Rebuild as Memory + Semantic Matching game with 20 cards / 10 pairs (4×5 grid, 30s timer).
8. **Generation/persistence:** Integrate the v2 profile engine, OKLCH palette, official effects, Result/Public Star ID/download, and additive database version/profile fields without fake 5D-to-7D backfills.

### TODO BUSINESS CONFIRMATION

1. Final zero-vector and exact near-tie handling for the cosine classifier; official Star Type identifiers are already fixed.
2. Final visual behavior for the approved Type-to-effect mapping; the official identifiers/mapping are fixed but the renderer is not migrated yet.
3. Official club copy, milestones, leader information/media, recruitment link, and evidence rules.
4. Real event data, registration policy, privacy notice, retention, and consent language.
5. Confirmed in Round 1: Official contact info (`facebook.com/5ss.uet`, `@5ssuet`, `085 901 8686`, `5ss.uet.vnu@gmail.com`, 144 Xuân Thủy), official about statement and tagline (`BEYOND A STAR — WE CREATE OUR OWN LIGHT.`), 4 Core Value colors, and 5 SV5T Criteria colors (`dao-duc`: #ff5c5c, `hoc-tap`: #6cd5f7, `the-luc`: #ffd467, `tinh-nguyen`: #5fe3a1, `hoi-nhap`: #b794f6).

### Engineering debt/placeholders

1. Local-only media storage; `MEDIA_STORAGE` does not select an S3/cloud adapter.
2. Sky Socket.IO fallback is localhost rather than the HTTP helper's LAN-aware fallback.
3. No automated client UI / browser component tests.
4. Server compiler options are permissive compared with the strict contracts/client packages.
5. E2E tests use the configured database rather than provisioning an isolated database automatically.
6. Deployment configuration covers only a client-side Vercel history rewrite.
7. Public endpoints (`POST /api/contact` and `POST /api/events/:eventId/registrations`) currently lack rate limiting / abuse protection middleware (e.g. `@nestjs/throttler` or Cloudflare turnstile). Production deployment requires rate-limiting protection.

## 11. Sensitive files and change map

| Concern | Primary locations |
| --- | --- |
| Router/shell isolation | `client/src/app/App.tsx`, `client/src/app/routes/AppRoutes.tsx`, `client/src/app/shells/*` |
| Marketing navigation and metadata | `client/src/config/site.ts`, `client/src/marketing/components/layout/*` |
| Contact form & service | `client/src/features/forms/ContactForm.tsx`, `contact.service.ts`, `api/contactApi.ts` |
| Event registration form & service | `client/src/features/activities/RegistrationForm.tsx`, `registration.service.ts`, `api/registrationApi.ts` |
| Activities API & pages | `client/src/features/activities/services/activitiesApi.ts`, `pages/ActivitiesPage.tsx` |
| Homepage activities section | `client/src/marketing/sections/Activities/ActivitiesSection.tsx` |
| Date formatting | `client/src/shared/utils/formatDate.ts` |
| Journey data and local persistence | `client/src/features/journey/data/journey.ts`, `journey-progress.repository.ts` |
| STARPRINT state and reconciliation | `client/src/features/starprint/store/useStarprintStore.ts`, `services/gameSubmission.ts` |
| Client REST/media origin | `client/src/shared/services/http/apiClient.ts` |
| CSS cascade | `client/src/index.css` and `client/src/styles/*` |
| 3D scenes | `client/src/three/marketing/*`, `client/src/three/starprint/*` |
| Public contracts | `packages/contracts/src/*` |
| STARPRINT v2 profile foundation | `server/src/modules/games/scoring/v2/hidden-profile.engine.ts`, `server/test/hidden-profile-v2.spec.ts` |
| News module | `server/src/modules/news/*` |
| Events module | `server/src/modules/events/*` |
| Contact module | `server/src/modules/contact/*` |
| Server lifecycle | `server/src/modules/sessions/*`, `games/*`, `starprints/*` |
| Database schema & seeds | `server/src/database/migrations/*`, `seeds/dev-seed.ts`, `database/data-source.ts` |
