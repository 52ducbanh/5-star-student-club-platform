# PROJECT CONTEXT — 5SS UET Website & STARPRINT Platform

> Last source audit: 2026-09-01, handoff from Antigravity to Codex.
>
> This file is the engineering handoff for the live repository. Source code and package manifests remain the source of truth when they disagree with documentation.

## 1. Product scope and status

5SS UET is the digital brand space for the Sinh viên 5 Tốt Club at VNU University of Engineering and Technology. The repository currently contains:

1. A public marketing experience for the club with 3D solar system, centered Journey CTA beneath the 3D star, smooth continuous student affiliation logo conveyor belt (dual-sequence seamless loop, ~3-4 distinct logos visible per viewport section, soft edge fade, and desktop hover pause), and synchronized 5 criteria color system.
2. A browser-local checklist and constellation journey with criteria deep-linking.
3. Server-backed news, events, event registration, and contact submission experiences (NestJS + PostgreSQL).
4. STARPRINT Platform (v2 Final BA Package Aligned):
   - **Current Implementation:** fully integrated official STARPRINT v2 architecture spanning client and server, directly extracted from the latest BA specification Google Docs and linked Google Sheets.
   - **Gameplay v2:** 5 mini-games:
     - SOLVE v2: Canonical 50-question bank (10 questions × 5 categories: `pattern_sequence`, `visual_precision`, `quick_logic`, `rule_shift`, `general_5ss`). Server deterministically assigns exactly 1 question per category per session, persisted across reload/reconnect. 6s per-question timer, 5 options A–E, no right/wrong UI, server-authoritative scoring.
     - SENSE v2: Canonical 15-scenario bank across 5 distinct groups (A, B, C, D, E). Server deterministically assigns 3 scenarios from 3 different groups per session. 75 options with primary/secondary tendency weighting (0.80 / 0.20), response-time modifiers (0–3s: sharpness +0.20, initiative +0.10; 7–10s: insight +0.10, precision +0.10), 10% primary tendency consistency bonus, and exact BA normalization denominators. 10s per-scenario timer, 5 options A–E, no moral judgment UI.
     - SPRINT v2: Finite 3-lane runner, 15–18s track, 20s hard cap, collision slowdown without Game Over, max 2 attempts on the exact same deterministic track.
     - SUPPORT v2: Deterministic 3-puzzle Cut-the-Rope, 10s timer per puzzle, wrong cut sequence auto-reset with timer continuation.
     - SYNC v2: 20 cards / 10 semantic pairs (Official Deck 1 with 11 real image assets: Tháp Eiffel, Bún bò, Samba, Hangul, Cờ Hàn Quốc, Merlion, Cờ Singapore, Taco, Cờ Mexico, WiFi, Váy Kilt), 30s hard timer, mismatch lock 600ms, responsive grid, client preloading.
   - **Hidden Traits & Engine:** 7 Canonical Hidden Traits (`sharpness`, `insight`, `precision`, `initiative`, `connection`, `adaptation`, `persistence`), Local Trait Profiles with strict null vs 0 semantics, and 7D Global Hidden Profile aggregation.
   - **Classification & Effects:** Cosine classifier against 5 official archetypes (`STRATEGIST`, `SPARK`, `SYNERGIST`, `SEEKER`, `SUSTAINER`) with official effects (`SHIMMER`, `SPARK`, `ORBIT`, `FLOW`, `PULSE`), Euclidean tiebreak, priority order, and zero-norm template fallback.
   - **OKLCH Palette:** User-selected Signature Color + stage local profile projections producing deterministic 5-wing OKLCH palette with $\Delta E_{OK} < 0.06$ similar color guard.
   - **STAR CARD Digital & Auto-Publish:**
     - Automatic publication to 5SS Sky on save with idempotent event emission.
     - Separate event consent & card model: `published_to_sky`, `physical_card_requested`, `media_permission` (enforcing `if (physicalCardRequested) mediaPermission = true`), `event_id`, `event_edition`.
     - STAR CARD Digital container rendering 5SS branding, display nickname, type, tagline, description, public star ID, and event edition.
     - High-resolution (600×860 @2x) collector card image export (`star-card-<id>.png`) and link sharing.
5. 5SS Sky: a privacy-filtered public collection with REST loading, Socket.IO updates, 3D rendering, and a grid fallback.

### Status language

- **Implemented:** the current client/server lifecycle, validation, persistence, image processing, publication transaction, live Sky update, dynamic news and events API, event registration with capacity and duplicate identity enforcement, contact form submissions, full STARPRINT v2 mini-games, scoring engine, 7D hidden traits, 5-archetype classifier, OKLCH 5-wing palette, public Star ID, and download capability.
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
| Contact/location channels | `client/src/config/contact.ts` | Source file; official links and Google Maps embed for UET 144 Xuân Thủy are active |
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
- **Real Content & Development Seed:** Seeded via `npm --workspace @5ss/server run seed:dev`. Idempotently cleans up legacy demo fixtures and seeds 3 verified News items (`uet-5ss-mo-don-tuyen-thanh-vien-gen-01`, `sinh-vien-uet-trao-doi-quoc-te-tai-dh-su-pham-quang-tay`, `thanh-lap-clb-sinh-vien-5-tot-truong-dai-hoc-cong-nghe`) and 1 confirmed Event item (`nhap-hoc-cung-5-tot-rinh-ngay-100k` - "Nhập học cùng 5 tốt – Rinh ngay 100K (Take 01)", 03/09–05/09/2026, poster `/uploads/nhap-hoc-cung-5-tot.png`, and Google Form registration link). Only approved personnel (Lê Thúy Hà) are included. News/event bodies automatically parse clickable links and event modals render an external Google Form registration action when present.

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
- `server/test/starprint-v2-flow.spec.ts`: 14 comprehensive tests verifying all 5 v2 game scorers (SOLVE, SENSE, SPRINT, SUPPORT, SYNC), 7D profile aggregation, 5-archetype classification with ties and zero-norm template distance, and OKLCH 5-wing palette with similar color guards.
- `server/test/support-engine.spec.ts`: 14 pure TypeScript SUPPORT engine & geometry tests (line intersection, point-to-segment tolerance, Level 1-3 cut validation, invalid-state reset, idempotency, trajectories, recoil).
- `server/test/starprint-auth-and-sky-payload.spec.ts`: 5 P1/P2 security and authorization boundary tests.
- `server/test/sprint-engine.spec.ts`: 17 pure TypeScript SPRINT engine tests covering continuous physical/visual coordinate synchronization, lookahead visibility window, perspective scaling, parabolic jump elevation profiles, collision deduplication, hurdle clearance thresholds, blocker dodge/hit, attempt state reset, and extended track pacing invariants.
- `server/test/app.e2e-spec.ts`: 11 STARPRINT full-lifecycle tests.
- `server/test/activities.e2e-spec.ts`: 17 tests covering News listing/slug/draft exclusion, Event listing/slug/status derivation, Event Registration (success, normalization, duplicate prevention, cross-event registration, disabled/expired rejection, capacity lock, invalid payloads), and Contact submission.
- **Total automated test cases: 126 across 8 suites (all passing).**

Required repository checks:

```powershell
npm run typecheck
npm run lint
npm run build
npm test
```

## 10. Confirmations and technical debt

### COMPLETED: SYNC MINI-GAME OFFICIAL DECK 1 & REAL-IMAGE ASSET INTEGRATION

1. **Deck 1 Real Asset Deployment:**
   - Deployed 11 verified image assets (`eiffel.jpg`, `bun_bo.jpeg`, `samba.jpg`, `hangeul.png`, `korea.png`, `merlion.png`, `singapore.png`, `taco.png`, `mexico.webp`, `wifi.jpg`, `kilt.avif`) to `client/public/assets/sync/`.
   - Updated `client/src/features/starprint/games/sync/sync-deck.ts` with `SYNC_DECK_ID = 'sync-deck-deck1-v2'`, defining 20 cards / 10 official pairs with `imageUrl` mapping and `'image'` display type.
   - Synchronized server config `server/src/modules/games/questions/sync-deck-v2.config.ts` identically for authoritative matching validation.
2. **Client Rendering, Image Protection & Preloading:**
   - Added eager image preloading on component mount in `SyncGame.tsx` (`new Image().src = c.imageUrl`) guaranteeing 0ms flip latency during 30s game timer.
   - Added `.sync-card__image-wrap` and `.sync-card__img` in `client/src/styles/starprint.css` with `object-fit: contain; border-radius: 6px; user-select: none; pointer-events: none;`, preventing any clipping of flags (Korea, Singapore, Mexico) or distortion of photos.
   - Responsive typography for concept text (`clamp(9.5px, 2.5vw, 11.5px)`) ensures long phrases like "Kết nối Internet" and "Hello World!" fit within mobile card cells.
3. **Verification:**
   - 126/126 automated unit and E2E tests passing.
   - 0 typecheck errors, 0 lint errors, build succeeded across contracts, client, and server.

### COMPLETED: EVENT CARD MEDIA ASPECT RATIO & VERTICAL SHIFT FIX

1. **Root Cause Analysis:** `.media-placeholder` possessed a generic base rule `min-height: 180px` designed for the fallback placeholder when no image is supplied. In `EventCard`, the thumbnail container (`.event-card__media-wrap`) is configured with `width: 220px; aspect-ratio: 16 / 9` ($220 \times 9 / 16 = 123.75\text{px}$). Because CSS `min-height` overrides `height: 100%`, `.media-placeholder` expanded vertically from 123.75px to 180px. Inside `.media-placeholder--poster`, `.media-placeholder__fg` (`height: 100% !important; object-fit: contain; object-position: center;`) centered the 123.75px image within the 180px box, introducing a $(180 - 123.75) / 2 = 28.125\text{px}$ blank gap above the image and shifting it downwards. The parent container's `overflow: hidden` then sliced off the bottom 28.125px of the image (cutting off the date and bottom camera frame markers).
2. **Comprehensive Resolution:**
   - Updated `MediaPlaceholder.tsx`: dynamically applies `minHeight: 0` alongside inline `aspectRatio`, preventing any fallback min-height from breaking declared aspect ratios.
   - Updated `components.css`: explicitly configured `min-height: 0;` on `.media-placeholder--image` and `.media-placeholder--poster`.
   - Updated `pages.css`: specified `min-height: 0;` on `.event-card__media-wrap .media-placeholder` and `.news-card__media .media-placeholder`.
   - Updated `responsive.css`: aligned media selectors to `.event-card__media-wrap .media-placeholder` with `min-height: 0;` across mobile breakpoints (320px–768px).
3. **Verification:** Validated across Desktop (1440×900), Tablet (768×1024), and Mobile (390×844, 320×568) via Playwright headless browser: bounding box of wrapper, placeholder, and foreground image aligned identically at 123.75px height ($y = 491.45\text{px}$), 0px top gap, 0px bottom clipping, and 126/126 automated tests passing.

### COMPLETED: GOOGLE MAPS EMBED & ACCURATE LOCATION INTEGRATION

1. **Accurate School Location Embed:** Configured canonical Google Maps embed in `client/src/config/contact.ts` referencing **Trường Đại học Công nghệ – ĐHQGHN** (144 Xuân Thủy, Cầu Giấy, Hà Nội) with `hl=vi` parameter.
2. **Interactive Map Display:** Automatically replaces the static placeholder (`map-placeholder`) in `ContactSection.tsx` with a fully interactive responsive iframe (`.map-frame-wrap` / `.map-frame`) pinpointing UET.
3. **Visual & Responsive Verification:** Verified on Desktop (1440×900) and Mobile (390×844) viewports: seamless alignment with the contact form card, zero horizontal overflows, and active external directions / open links.

### COMPLETED: NEWS & EVENTS SECTION REFACTOR (EDITORIAL SHOWCASE, ASPECT RATIOS, TEMPORAL ORDERING & PROGRESSIVE DISCLOSURE)

A complete architectural and visual overhaul of the News & Events system was implemented:
1. **Root Cause Resolution for Image Distortion & Squashing:**
   - Eliminated hardcoded `height: 260px` / `220px` combined with wide grid columns. Replaced with unified `aspect-ratio: 16 / 9` media containers.
   - Introduced `MediaPlaceholder` poster mode (`fit="poster"`): renders blurred background copy (`filter: blur(24px) brightness(0.42)`) + foreground contained artwork (`object-fit: contain`) sharing the same image URL (0 duplicate network requests). This completely eliminates cropping of typography/logos on poster artwork such as "Tuyển quân SV5T / Coming Soon Gen 1".
   - **Precise Center Alignment:** Positioned `.media-placeholder__fg` with `position: absolute; top: 0; bottom: 0; left: 0; right: 0; margin: auto; object-fit: contain; object-position: center;` ensuring non-16:9 images (square 1:1, 4:3) are centered with symmetrical blur margins on both left and right across all devices and viewports.
2. **Desktop Editorial Showcase (1 Featured + 2 Stacked Secondary):**
   - Replaced the previous unbalanced 3-card grid that created an orphan 3rd card with a massive empty area.
   - Layout:
     - Left column: Dominant Article #1 (`NewsCard variant="featured"`).
     - Right column: Vertical stack of Articles #2 and #3 (`NewsCard variant="secondary"`), optically matching the featured card's height on desktop.
     - Articles #4+: Responsive 3-column regular grid (`.activities-regular-grid`).
   - Gracefully handles 0, 1, and 2 item edge cases without empty slots.
3. **Temporal Ordering & Classification:**
   - **News:** Prioritizes explicit pinned/featured (if present) → newest remaining article (`publishedAt DESC`).
   - **Events:** Exact classification into `ongoing` (`startAt <= now <= endAt`), `upcoming` (`startAt > now`), and `past` (`endAt < now`).
     - Ordering for combined view: ongoing (soonest ending first) → nearest upcoming (soonest starting first) → later upcoming → most recent past → older past.
     - New badge: `● Đang diễn ra` (emerald), `● Sắp diễn ra` (cyan), `○ Đã kết thúc` (muted).
4. **Progressive Disclosure for 100+ Articles:**
   - Initial count: 9 articles (1 featured + 2 secondary + 6 regular = 2 complete 3-col rows).
   - Load More button: reveals `+6` items per click, preserving desktop 3-column grid row alignment.
   - Tab switching cleanly resets batch count back to 9.
   - 100% frontend-only; existing REST contracts `/api/news` and `/api/events` remain untouched.

### COMPLETED: REAL-DATA RECLASSIFICATION — "NHẬP HỌC CÙNG 5 TỐT" MOVED TO EVENTS

Based on organizer requirements and confirmed assets:
1. **Reclassified from News to Event:** "Nhập học cùng 5 tốt" was migrated from the news category to the events category (`nhap-hoc-cung-5-tot-rinh-ngay-100k` - "Nhập học cùng 5 tốt – Rinh ngay 100K (Take 01)"). Legacy news slug `nhap-hoc-cung-5-tot-challenge` was removed from the `news` table.
2. **Real Operational Data from Banner:** Dates `03/09/2026 – 05/09/2026` (`startAt: 03.09.2026 08:00`, `endAt: 05.09.2026 23:59`, `registrationDeadline: 05.09.2026 23:59`), venue `Trường ĐH Công nghệ - ĐHQGHN (144 Xuân Thủy, Cầu Giấy, Hà Nội)`.
3. **Official Banner Asset:** Saved and served via `/uploads/nhap-hoc-cung-5-tot.png` and `/assets/nhap-hoc-cung-5-tot.png` from uploaded banner `media_1788356676781.png`.
4. **Google Form Integration:** Linked official registration form `https://forms.gle/BnS6i2pu7K6hKUsN8`. Added `renderParagraphWithLinks` and external Google Form CTA button in `ActivitiesPage.tsx`.

### COMPLETED: SPRINT RUNNER PRESENTATION & EXTENDED TRACK PACING UPGRADE

A comprehensive overhaul of SPRINT runner presentation, visibility lookahead, and track duration was implemented:
1. **Root Cause Resolution for Top Obstacle Stacking:**
   - Identified that `calculateEntityTopPercent` previously used `Math.max(0, ...)`, which clamped all far-future events (`atMs - elapsed > 2500ms`) to `top: 0%`. This caused all 12–14 future obstacles across the track to pre-render simultaneously in a stacked row at the top edge.
   - Removed 0-clamping to allow continuous coordinates. Added `isEntityInVisibleWindow(topPercent)` strictly bounding rendering to `[-12%, 106%]`. Far-future events are not mounted in the DOM.
2. **Subtle Forward-Motion Perspective:**
   - Distant obstacles spawn offscreen just above the stage (`top: -12%`) with reduced scale (0.72) and soft opacity (0.35).
   - As obstacles approach the player collision plane (`top: 78%`), scale and opacity grow smoothly to 1.0. At any time, typically only 1 main challenge approaches the player, with at most 1 second obstacle entering in the distance.
3. **Extended Playable Track Length (~26s):**
   - Playable track duration extended from 15.5s–17s to ~26s–26.5s of active running (`expectedDurationMs: 26000–26500`, `hardCapMs: 30000`).
   - Extended challenge sequences:
     - **Track A (sprint-track-a-v2):** 18 events (7 stars, 5 barriers, 6 blockers), 26000ms expected duration, 1200ms finish buffer.
     - **Track B (sprint-track-b-v2):** 19 events (7 stars, 6 barriers, 6 blockers), 26200ms expected duration, 1100ms finish buffer.
     - **Track C (sprint-track-c-v2):** 20 events (7 stars, 6 barriers, 7 blockers), 26500ms expected duration, 1700ms finish buffer.
   - Pacing progression: calm opening (0–3s), steady single-event rhythm (3–10s), mixed barrier/blocker/star interactions (10–20s), faster climax (20–24.5s), and clean finish line breathing room (24.5–26s).
4. **Server Scoring & Validation Alignment:**
   - Synchronized server `sprint-tracks-v2.config.ts` tracks identically to client definitions.
   - Updated `HARD_CAP_MS = 30000` in `sprint.scorer.ts` (preserving persistence bonus normalization `best.durationMs / HARD_CAP_MS`).
   - Updated `attempt.durationMs > 30001` validation tolerance in `raw-result-validator-v2.ts`.
5. **Deterministic Replay Invariant:**
   - Attempt 2 replays the exact same track with identical timestamps, order, and lanes. All transient states (`starsCount`, `collisionsCount`, `lane`, `motionState`, sets) reset cleanly.
6. **Browser QA Verification:** Verified in headless Chromium across Desktop (1440×900) and Mobile (390×844, 375×812) viewports. Simultaneously rendered entity count measured at 2–3 mid-run, with 0 console or page errors.

### COMPLETED: REAL-DATA IMPORT & SOURCE-BACKED SEEDING (DATA/ ALIGNED)

Imported and verified real public content from the local `Data/` folder into PostgreSQL database and client configuration:
1. **Source Hierarchy & Personnel Boundary:** `Data/In4.docx` is enforced as highest public authority. Only approved public identity is loaded: Lê Thúy Hà (Chủ nhiệm CLB / Founder, 085 901 8686, portrait `Data/ảnh chân dung.jpg`). Proposal personnel table (Nguyễn Huy Toàn, Trần Hiểu Văn, Trần Tiến Phong, Trần Thị Hoa, Lưu Quang Linh, Bành Đức Minh) is strictly excluded from all public seeds, API, About section, FAQ, and metadata.
2. **Real News Seeded in PostgreSQL:** 4 verified news items with media paths (`uet-5ss-mo-don-tuyen-thanh-vien-gen-01`, `sinh-vien-uet-trao-doi-quoc-te-tai-dh-su-pham-quang-tay`, `nhap-hoc-cung-5-tot-challenge`, `thanh-lap-clb-sinh-vien-5-tot-truong-dai-hoc-cong-nghe`). Idempotent seed removes legacy demo slugs.
3. **Zero Fabricated Events:** Planned activities in proposal lack confirmed operational dates/times/venues/capacities; 0 unconfirmed events seeded to avoid fabricating operational facts.
4. **Media Normalization & Assets:** Real image assets (`tuyen-quan-sv5t.png`, `trai-he.jpg`, `logo-5ss.png`, `anh-chan-dung.jpg`) served via `server/uploads/` and client static `/assets/`. `normalizeMediaUrl` cleanly distinguishes `/assets/` and `/uploads/`.
5. **Client Configuration & FAQ:** Set real `recruitmentUrl` (`https://forms.gle/Rhh1XmwhFxBE1m6q8`), real founder quote and portrait in `about.ts`, and updated `faq.ts` with verified club facts and contact channels.
6. **Quality Gates:** 121/121 automated tests passing across 8 suites, 0 typecheck errors, 0 lint errors, build succeeded across contracts, client, and server.

### COMPLETED: SPRINT GAME FEEL & INTERACTION FEEDBACK UPGRADE

A comprehensive gameplay UX and interaction feedback upgrade has been implemented for the SPRINT mini-game:
1. **Synchronized Physical & Visual Coordinates:**
   - Established deterministic mapping aligning visual `topPercent` and physical collision check directly with the 2500ms horizon and player baseline (`top: 78%`).
   - Clean per-entity lifecycle tracking (`APPROACHING` → `COLLECTED` | `JUMP_CLEARED` | `DODGED` | `COLLIDED` | `MISSED`) with stable set deduplication (`collectedStarIds`, `collidedObstacleIds`, `processedEventsRef`). Every interaction evaluates and registers strictly once.
2. **Jump Elevation & Parabolic Clearance Geometry:**
   - Replaced simplistic `isJumping === true` flag with continuous parabolic jump elevation $h(u) = 4u(1-u)$. Low hurdles are cleared only when player reaches $h(u) \ge 0.35$ within the peak ~70% of the jump arc. Late/early jumps below the threshold trigger realistic hurdle stumble with clear causality.
3. **Distinct Obstacle Entities & Visual Grammar:**
   - **Collectible Star:** Glowing 5-point celestial star with golden flare; on collection triggers instant `+1 ⭐` floating badge, HUD counter pulse (`stars--pulse`), and collection burst animation.
   - **Low Barrier:** Distinct low horizontal hurdle bar with yellow/cyan hazard chevrons and ground feet; triggers hurdle crash and stumble recoil on collision.
   - **Lane Blocker:** Tall crimson/amber hazard energy pillar with warning glyph; clearly signals full-lane obstruction requiring lateral lane change.
4. **Collision Recoil & Safe Recovery State:**
   - Collisions trigger momentary stage camera shake (`stage--shake`), red border hit flash (`stage--hit`), player stumble recoil (`player--stumble`), and 500ms anti-chain-hit recovery flicker (`player--recovering`).
   - Controls remain active during recovery so players can steer away from upcoming obstacles.
5. **Deterministic Attempt 2 Reset & Summary Modal:**
   - Attempt 1 completion modal surfaces player-facing metrics: ⭐ **Sao thu thập**, 💥 **Số lần va chạm**.
   - "Thử lại cùng đường chạy" cleanly resets transient gameplay state (`starsCount = 0`, `collisionsCount = 0`, `lane = 1`, `motionState = GROUNDED`, `collectedStarIds`, `collidedObstacleIds`, `floatingFeedbacks`) while retaining Attempt 1 records for final comparative scoring on the exact same deterministic track.
6. **Real-Browser Verification:** Verified across Desktop (1440×900) and Mobile (390×844, 375×812) viewports with Playwright headless Chrome: 0 errors, full flow passing.

### COMPLETED: REAL-DEVICE MOBILE UI FIX (SENSE + SPRINT + 5SS SKY)

A targeted real-device mobile UI/UX fix was implemented and verified against user ground-truth screenshots across the full viewport matrix (320px–1440px):
1. **SENSE Option Wrapping & Alignment:**
   - Decoupled `.sense-game__option` from the global `.btn` class's `white-space: nowrap` constraint.
   - Wrapped option text in `<span className="sense-game__option-text">` with `flex: 1; min-width: 0; word-break: break-word; line-height: 1.45;`.
   - Fixed `a.`, `b.`, `c.`, `d.`, `e.` marker alignment (`flex-shrink: 0; width: 20px; font-weight: 800; color: #6cd5f7;`).
   - Verified 0/5 overflowing options on all mobile viewports (down from 4/5 overflows).
2. **SPRINT Stage & Touch Ergonomics:**
   - Moved `.sprint-touch-controls` out of `.sprint-stage`, placing controls cleanly underneath the runner stage with 0% overlap/obscuration.
   - Enhanced `.lane-label` contrast (`rgba(182, 222, 245, 0.75)`, `font-weight: 700`, uppercase).
   - Reduced top dead-space on tall mobile devices by aligning `.game-step` to `justify-content: flex-start; padding-top: max(72px, calc(env(...) + 56px));`.
3. **5SS Sky 3D Framing & Celestial Composition:**
   - Adjusted `SkyDome` star distribution formula (`y = radius * Math.cos(phi) * 1.25`) and mobile camera parameters (`fov: 54`, `camera.position: [0, 0, 6.8]`) in `StarSkyScene.tsx` so stars distribute evenly across the entire vertical viewport without top-clustering or empty bottom space.
   - Refactored `.sky-page__3d-container` height to `clamp(300px, 46vh, 460px)` and polished `.sky-page__footer` CTA button centering and vertical rhythm.
4. **Game Progress Header Collision Fix:**
   - Updated `.game-progress` to `display: inline-flex; align-items: center; gap: 8px;`, preventing badge and step label collision (`💫 SENSE` and `Tình huống...` separated cleanly).
5. **Real-Browser Visual Verification:** Verified across 9 viewports (320×568, 360×800, 375×812, 390×844, 412×915, 430×932, 768×1024, 1366×768, 1440×900) with 100% pass on visual inspection and zero overflow.

### COMPLETED: CROSS-DEVICE UI/UX AUDIT & HANDOFF FOR CODEX

A comprehensive real-browser UI/UX audit was conducted across 15 viewports using Playwright headless Chrome against the running Vite client and NestJS server:
1. **Viewport Coverage (15 Viewports):** Mobile Ultra-Compact (320×568), Mobile Standard (360×800), Mobile Modern (375×812, 390×844, 412×915, 430×932), Tablet (768×1024, 820×1180, 1024×1366), Desktop/Laptop (1280×720, 1366×768, 1440×900, 1536×864, 1920×1080), and Narrow Landscape (812×375).
2. **Deep Flow Verification:** 100% successful execution across all marketing routes (`/`, `/hanh-trinh-5-tot`, `/hoat-dong`, `/sky`) and full STARPRINT flow (`Intro` → `Player Info` → `Camera Skip` → `SOLVE` → `SENSE` → `SPRINT` → `SUPPORT` → `SYNC` → `Color Picker` → `Final Reveal` → `Result Page` → `Digital STAR CARD`).
3. **Primary Deliverable:** [`UI_UX_CROSS_DEVICE_HANDOFF.md`](file:///c:/Users/52duc/Desktop/5SS%20website/UI_UX_CROSS_DEVICE_HANDOFF.md) created at project root containing detailed findings, responsive breakdowns, device matrices, and recommended CSS polish points.
4. **Local LAN Wi-Fi Fix:** Resolved mobile connection issue by dynamically resolving LAN hostname in `apiClient.ts` and binding NestJS server to `0.0.0.0`.

### COMPLETED: SUPPORT LOW-LAG DETERMINISTIC CUT-THE-ROPE ARCHITECTURE

The SUPPORT mini-game has been refactored into a high-performance, deterministic Cut-the-Rope interaction:
1. **Target Architecture:** Pure TypeScript `SupportEngine` decoupled from React state, driving an SVG coordinate stage (`viewBox="0 0 100 100"`) and continuous requestAnimationFrame motion evaluation.
2. **Unified Pointer Input:** Unified `SwipeCutter` listening to Pointer Events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) with pointer capture and `touchAction: 'none'`. Seamlessly handles swipe gestures and tap/click fallback through the exact same logical `cutRope` path.
3. **Deterministic Trajectories & Motion:** Harmonic sine idle sway, single-rope damped pendulum swing, cubic ease-out target bezier entry with soft squash/stretch, invalid cut drop/wobble before auto-reset, and dual-stub quadratic bezier rope recoils fading in ~200ms.
4. **Scoring Invariant & Level Progression:** 3 predefined deterministic levels matching server configs (`support-puzzle-1-v2`, `support-puzzle-2-v2`, `support-puzzle-3-v2`). Continuous 10s timer unaffected by resets. Valid cuts advance immediately; invalid cuts trigger `invalid-state` auto-reset without advancing. Results are derived exclusively from logical engine events.
5. **Real Browser QA Verification:** Fully validated with Playwright in headless Chrome across Desktop (1440×900) and Mobile (375×812) viewports.

### COMPLETED: STARPRINT V2 FINAL BA PACKAGE ALIGNMENT

The official STARPRINT v2 specification and finalized BA package content have been fully implemented across both client and server:
1. **SOLVE Final Question Bank:** Complete 50-question bank across 5 categories (`pattern_sequence`, `visual_precision`, `quick_logic`, `rule_shift`, `general_5ss`). Server-authoritative deterministic assignment per session (1 from each category, 5 total), persistent across reload/resume. 5 options A–E, 6s timer, no right/wrong feedback.
2. **SENSE Final Scenario Bank:** Complete 15-scenario bank across 5 groups (A, B, C, D, E). Server-authoritative deterministic assignment of 3 scenarios from 3 distinct groups per session. 75 options with primary (0.80) & secondary (0.20) tendency weights, response time modifiers (0–3s, 7–10s), 10% consistency bonus, and exact BA sheet normalization denominators (`sense_gid_473422769_norm.csv`).
3. **SPRINT, SUPPORT, SYNC Mechanics:** Aligned with BA game design: finite 3-lane runner with same-track retry (max 2 attempts); deterministic 3-puzzle Cut-the-Rope (10s each); 20 cards / 10 pairs semantic matching (30s timer, official Deck 1 with 11 real image assets and eager preloading).
4. **STAR CARD Digital & Auto-Publish:** Automatic publication to 5SS Sky on save with idempotent event emission. Complete STAR CARD Digital card container and high-resolution export (`star-card-<id>.png`).
5. **Event Metadata & Separate Privacy Consent:** Supported `published_to_sky`, `physical_card_requested`, `media_permission` (enforcing `if (physicalCardRequested) mediaPermission = true`), `event_id`, and `event_edition`.
6. **Database Migration:** Additive TypeORM migration `1761000000000-AddStarprintCardAndEventFields.ts` preserving legacy data without destructive drops.
### COMPLETED: CROSS-DEVICE UI/UX AUDIT & VERIFICATION (15-VIEWPORT MATRIX)

A comprehensive real-browser QA audit across 15 responsive viewports (Mobile 320px–430px, Tablet 768px–1024px, Desktop 1280px–1920px, and Narrow Landscape 812×375) has been completed and verified:
1. **iOS Safari Auto-Zoom Guard:** Added `@media (max-width: 768px) { input:not([type="checkbox"]):not([type="radio"]), select, textarea { font-size: 16px !important; } }` in `client/src/styles/responsive.css` to prevent auto-zooming on iOS inputs.
2. **Touch Target Ergonomics:** Expanded interactive bounds for `.hero-orbit-label__link` (44px hit-box via pseudo-elements and direct bounding box scaling), `.activity-secondary-card__link`, and `.site-footer__link`/`.site-footer__social-link` (40px–44px min-heights).
3. **Short Landscape Viewports (`max-height: 500px`):** Added responsive rules compressing `.game-step` vertical padding (`48px 12px 16px`) and game stage container heights (`220px`), ensuring action buttons remain accessible above the fold.
4. **SVG & Digital STAR CARD Scalability:** Ensured `.star-card-digital-wrapper` and `.starprint-svg` scale dynamically without clipping on compact 320px screens. Added `cursor: crosshair` on desktop `.support-stage-container` for drag-cutting affordance.
5. **Real Browser Validation:** Verified with Playwright across all 15 viewports and all 7 routes + 5-game deep flows (`scratch/audit-cross-device.cjs`). 0 horizontal overflows, 0 critical clipping issues.
6. **Documentation Handoff:** Complete `UI_UX_CROSS_DEVICE_HANDOFF.md` created with issue breakdown, responsive decisions, and Codex workflow guidelines.

### COMPLETED: SAFE FULL-CODEBASE REFACTOR & CLEANUP

A safe, behavior-preserving refactoring and dead-code cleanup has been executed across the repository:
1. **Legacy Directory Removal:** Removed 16 obsolete/empty directories (`client/src/components/`, `context/`, `data/`, `hooks/`, `pages/`, `sections/`, `services/`, `utils/`, `assets/`, `features/shared/`, `three/scenes/`).
2. **Proven Dead File & Wrapper Pruning:** Removed 11 unimported/dead files and pass-through wrappers (`BackgroundOrbs.tsx`, `BrandMark.tsx`, `GlassCard.tsx`, `MouseGlow.tsx`, `useMousePosition.ts`, `useScrollProgress.ts`, `ProgressRing.tsx`, `registration.service.ts`, `contact.service.ts`, `activities/data/activities.ts`, `support-puzzles.ts`).
3. **Dead CSS & Asset Cleanup:** Cleaned unreferenced `.glass-card` styling from `client/src/styles/components.css`, and removed unreferenced legacy assets (`client/public/og.png`, `client/public/assets/sv5t-mark-original.png`).
4. **Backward-Compatibility Preservation:** Preserved legacy v1 server paths (`scoring.service.ts`, `raw-result-validator.ts`, `palette-engine.ts`, `type-engine.ts`, `star-types.config.ts`) and dual-format category identifiers (`pattern-sequence` / `pattern_sequence`).
5. **Quality Gates & Browser QA:** Monorepo typecheck (0 errors), lint (0 errors), 104/104 unit & E2E tests passed, production build passed. Full Playwright regression verified across 4 viewports (390×844, 768×1024, 1366×768, 1440×900) confirming zero layout regressions on SENSE, SPRINT, SUPPORT, SYNC, STAR CARD, and 5SS Sky.

### COMPLETED: STARPRINT STEP 2 PORTRAIT PHOTO CAPTURE/UPLOAD + "CHỌN ẢNH" & PERSISTENCE FIX

The STARPRINT Step 2 (ẢNH CHÂN DUNG) workflow has been thoroughly overhauled, fixing the portrait persistence bug and adding a device file picker:
1. **Server-Side Sharp Runtime Fix & Static Serving (`uploads.service.ts`, `main.ts`):**
   - **Root Cause:** In `uploads.service.ts`, `import sharp from 'sharp';` combined with NestJS's CommonJS compilation emitted `(0, sharp_1.default)(file.buffer)`. Because `sharp` exports via CommonJS `module.exports = function sharp(...)`, `sharp_1.default` was runtime `undefined`, causing all photo uploads to fail with `UPLOAD_INVALID: Failed to process image: (0 , sharp_1.default) is not a function`.
   - **Fix:** Switched import to `import type sharpType from 'sharp'; const sharp: typeof sharpType = require('sharp');`.
   - **Orientation:** Added `.rotate()` to automatically honor EXIF orientation metadata from mobile cameras before resizing to 512×512 WebP (quality 85).
   - **CORS Headers on `/uploads`:** Configured Express static middleware in `main.ts` with `Access-Control-Allow-Origin: *` and `Cross-Origin-Resource-Policy: cross-origin` headers to prevent CORS issues or canvas tainting when rendering STAR CARD and generating PNG exports.
   - **Session Photo Deletion:** Added `DELETE /api/sessions/:sessionId/photo` (HTTP 204) to allow clearing portraits when users skip or reselect.
2. **Client UI/UX & Flow Overhaul (`CameraStep.tsx`, `starprint.css`):**
   - **Three Clear Choices:**
     - `[ 📷 Chụp ảnh ]` (Primary): Opens live camera only upon explicit user tap (no mount-time permission prompts).
     - `[ 🖼️ Chọn ảnh ]` (Secondary): Triggers native device gallery / file picker via hidden `<input type="file" accept="image/jpeg,image/png,image/webp">` (strictly omitting `capture` attribute to avoid mobile camera-only lock).
     - `[ Bỏ qua bước này → ]` (Tertiary): Clears portrait, stops any camera streams, deletes session photo, and advances to `SOLVE`.
   - **Eliminated Camera Mount Race Condition:** Replaced fragile ref assignment with callback ref `setVideoRef`, ensuring `videoRef.current.srcObject` is assigned and plays immediately regardless of DOM mounting order.
   - **Portrait Framing Guide:** Renders circular celestial framing guide overlay with golden dashed ring and selfie mirror transform (`scaleX(-1)`).
   - **Client-Side Validation:** Validates file MIME types (JPEG, PNG, WebP) and 5MB size limit before processing, showing friendly Vietnamese alert banners.
   - **Preview & Confirmation:** Square center-crop preview (`object-fit: cover`) with `[ Dùng ảnh này ✓ ]`, `[ 📸 Chụp lại ]` / `[ 🖼️ Chọn ảnh khác ]`, and `[ ← Chọn cách khác ]`. Button disabled with "Đang lưu ảnh..." state to protect against double clicks.
   - **Resource Lifecycle Management:** All camera stream tracks are stopped on frame capture, retake, cancel, step change, and component unmount. Object URLs are revoked cleanly.
3. **End-to-End Persistence & STAR CARD Export:**
   - **Zustand Persistence:** Added `photoPreviewUrl` to `partialize` array in `useStarprintStore.ts` so photos survive page reloads.
   - **Session Restoration:** Updated `restoreFromSession` to restore `photoPreviewUrl` from `session.photoUrl`.
   - **Star Card Rendering & PNG Export:** Updated `GeneratingStep.tsx` and `StarCardExport.ts` so custom portrait URLs load cleanly with fallback to `DEFAULT_STAR_AVATAR` (`/assets/starprint/default-star-avatar.png`).
4. **Verification & Testing:**
   - Added `server/test/uploads.e2e-spec.ts` testing upload validation, WebP conversion, session DB persistence, and deletion (6/6 tests passing).
   - Real-browser Playwright test verified:
     - Gallery file picker upload, preview, confirmation, and sessionStorage persistence.
     - Responsive layouts across 5 viewports (375×812, 390×844, 430×932, 1366×768, 1440×900) with zero horizontal overflow.
     - Skip flow clearing photo and falling back to default mascot.
     - Live fake-camera capture, confirm, 5-game completion, Star Card `<image>` rendering with `/uploads/...`, and high-resolution PNG export (2.76 MB) with zero console errors.
   - Full automated test suite passing: 9 Jest suites / 132 tests, TypeScript typecheck (0 errors across 3 workspaces), oxlint (0 errors).

### COMPLETED: STARPRINT RESULT LAYOUT + CONSENT UI UPDATE & P1/P2 SECURITY REMEDIATION

1. **Fluid Height-Aware 2-Column Desktop Layout (≥1024px):** Result page renders as a fluid CSS Grid 2-column layout. Left column: STAR CARD preview + download/share actions. Right column: PublishConsent panel (owner only) or Public Showcase Info (public view) + contextual CTAs. Both columns and the card automatically scale proportionally to available viewport height and width (`calc((100svh - clamp(...)) * 0.636)`), fitting within standard laptop screens (`1280x720`, `1366x768`, `1440x900`, `1536x864`, `1920x1080`) without unnecessary vertical scrolling. Single-column stacked layout is preserved on mobile and tablet.
2. **Frontend Public vs Owner Route Boundary (P1 Remediation):**
   - Public route `/star/:publicStarId` is strictly read-only (`readOnly={true}`): `PublishConsent` checkboxes and save buttons are completely omitted, preventing public visitors from modifying owner preferences.
   - Owner route `/starprint/result/:id` renders the full editable `PublishConsent` controls, bound to the owner's active session.
3. **Backend Mutation Authorization & Public Star ID Protection (P1 Remediation):**
   - `POST /api/starprints/:id/publish` strictly requires `:id` to be the internal Starprint UUID. Calling `publish` with a `publicStarId` is explicitly rejected with `403 Forbidden` (`UNAUTHORIZED_MUTATION`).
   - `PublishStarprintDto` mandates `sessionId: string`. The backend verifies `starprint.sessionId === dto.sessionId`. Unauthenticated or mismatched session mutation attempts are rejected with `403 Forbidden` (`UNAUTHORIZED_SESSION`).
   - `GET /api/starprints/:id` redacts `sessionId` (returns `""`) when looked up via `publicStarId`, preventing session credential leakage.
4. **Canonical Sky Public Payload Alignment (P2 Remediation):**
   - Created a single canonical mapper `mapStarprintToSkyStar(starprint, session)` shared by both REST (`GET /api/sky` via `SkyService`) and WebSocket (`star.created` event via `SkyGateway`).
   - Standardized canonical public fields: `id` uses `publicStarId || id`, `palette` prefers `wingPalette` with legacy palette fallback, `wingPalette` is explicitly included, `nickname`, `photoUrl`, `type`, `effect`, and `createdAt` are identical across both channels.
5. **Consent UI Simplification & Safe Migration:**
   - Removed the "Hiển thị biệt danh" and "Hiển thị ảnh chân dung" checkboxes from the UI entirely (server always writes `true`).
   - `physicalCardRequested` and `mediaPermission` default to `true` for all new starprints, while user opt-outs (`false/false`) are preserved across reload.
   - Safe migration `1762000000000-UpdateConsentDefaultsToTrue.ts` backfills only `consentName` and `consentPhoto` to `true`, leaving existing `physicalCardRequested` and `mediaPermission` values untouched.
### COMPLETED: FIGMA STAR CARD REDESIGN & HD CANVAS EXPORT

The STAR CARD visual presentation and download pipeline have been rebuilt to match the official Figma design (`node-id=0-1`):
1. **Component Architecture (`StarCard.tsx`):**
   - Reusable standalone component rendering the exact Figma geometry and visual styling.
   - Outer metallic gold border (`2px solid #dfa838`) with `border-radius: 22px`.
   - Deep cosmic nebula / starry galaxy background with fine sparkling starfield.
   - Inner gold frame (inset 14px) with corner crosshair bracket notches extending past all 4 corners via deterministic SVG overlay.
   - Header: 5SS brand mark square logo box + "5SS" in gold serif (`#edd48d`), "2026 - 2027" edition mark.
   - Center Starprint Star: 5-pointed star with gold separating strokes (`#e8be5a`) and 5 polygonal wings filled with user's dynamic OKLCH `wingPalette` / `palette`.
   - Center Pentagon ($r = 0.48 \times R$): Renders uploaded portrait (`photoUrl`) with pentagonal clip-path and gold border, or clean minimalist avatar silhouette (`👤`) when no photo was uploaded.
   - Lower Profile Info: Uppercase dynamic nickname with white celestial glow, warm gold archetype pill badge (`THE STRATEGIST`, `THE VISIONARY`, etc.) with dark navy text, elegant italic serif tagline in soft cream gold, and gold serif Star ID (`Star ID: ${publicStarId || id}`).
   - Dynamic CSS Star Animations (`effect-shimmer`, `effect-pulse`, `effect-spark`, `effect-orbit`, `effect-flow`).
2. **Deterministic HD Canvas PNG Export (`StarCardExport.ts`):**
   - Renders the full Figma card at 2x resolution (`760px x 1216px`) using pure HTML5 Canvas 2D methods.
   - Features deterministic cosmic nebula radial gradients, starry sparkles, inner gold crosshairs, header brand mark, 5-wing star geometry, portrait/avatar clipping, nickname with glow, archetype gradient pill, italic tagline, Star ID, and outer rounded border.
   - Triggers clean PNG file download (`star-card-${publicStarId}.png`).
3. **Integration & Security Boundary Preservation:**
   - Wired seamlessly into `StarprintResultPage.tsx` for both Owner view (`/starprint/result/:id`) and Public share view (`/star/:publicStarId`).
   - P1 authorization protections, read-only visitor restrictions, and P2 canonical Sky payload mappings remain 100% intact.
4. **Verification & Quality Gates:**
   - 10-Viewport Playwright automated matrix (320px–1920px) passed with 0 horizontal overflows and perfect scaling.
   - Full monorepo typecheck (0 errors), lint (0 errors), build (contracts, client, server), and 109/109 automated tests passing across 7 suites.

### COMPLETED: STARPRINT 5-GAME FULL EXPERIENCE UPGRADE (AUTONOMOUS COMPLETE PASS)

A comprehensive, end-to-end UX, interaction feedback, game feel, audio, responsive design, and QA upgrade across all five STARPRINT games (`SOLVE` -> `SENSE` -> `SPRINT` -> `SUPPORT` -> `SYNC` -> `Signature Color` -> `STARPRINT`):

1. **Shared Experience & Constellation Navigation Layer:**
   - **First-Party Audio Controller (`gameSfx.ts`):** Lightweight, zero-dependency HTML5 media manager with pooled audio elements, local asset preloading, mute controls persisted to `localStorage` (`starprint_sound_muted`), debouncing to prevent audio stacking, unhandled autoplay rejection guards, and mobile haptic feedback via `navigator.vibrate`.
   - **Constellation Navigation Header (`ConstellationNav.tsx`):** Unified 5-node top journey tracker across `SOLVE`, `SENSE`, `SPRINT`, `SUPPORT`, `SYNC`, and `COLOR_PICKER`. Displays lit completed nodes with cyan/gold glow (`✦`), gently pulsing active node, subdued upcoming nodes, animated connector lines, and an unobtrusive sound toggle button (🔊 / 🔇).
   - **Micro-intro Lines:** Concise, friendly 1-line gameplay instructions centered under the progress bar for every game.

2. **SOLVE Game Upgrade:**
   - **Input Locking:** Immediate synchronous lock on option selection to eliminate double-clicks and race conditions with the timer.
   - **Immediate Visual & Audio Feedback:** Correct option illuminates in glowing emerald (`solve-option--correct`) with checkmark `✓`, bright chime (`solve_correct`), and haptic impulse. Incorrect choice displays restrained crimson (`solve-option--wrong`) with `✕`, subtle error sound (`solve_wrong`), and simultaneous green highlight of the true answer.
   - **Official Explanations & Timeout:** Displays canonical explanation card under options. On timer expiration (6s), triggers timeout cue (`timer_timeout`) and reveals the correct answer with explanation before auto-advancing.
   - **Pacing & Scoring Integrity:** 1100–1450ms readable pauses for comprehension; zero visible score or correctness streak, strictly preserving the non-evaluative ethos while server remains authoritative.

3. **SENSE Game Upgrade:**
   - **Non-Judgmental Neutrality:** Strictly maintains zero right/wrong framing, zero moral judgment, and zero positive/negative audio dichotomy.
   - **Warm Tactile Confirmation:** Choice selection triggers soft neutral chime (`sense_confirm`) and displays warm celestial golden-cyan highlight (`sense-option--selected`) with peaceful confirmation banner (`✨ Đã ghi nhận phản xạ của bạn.`).

4. **SPRINT Game Upgrade:**
   - **Visual Presentation & Perspective:** Continuous unclamped coordinates (`y = (elapsed - atMs) * speed + 80`), lookahead visibility window (`[-12%, 106%]`) preventing entity stacking at stage top, depth scaling ($0.72 \to 1.0$) and opacity gradients creating authentic forward-moving runner depth.
   - **Pacing & Track Length:** Extended deterministic tracks A, B, and C to ~26s duration (26000ms, 26200ms, 26500ms, hard cap 30000ms) with 18–20 rhythmic events synchronized across client and server.
   - **Interaction Audio:** Tactile lateral whoosh (`sprint_lane`), jump whoosh (`sprint_jump`), soft landing (`sprint_land`), crystal star chime (`sprint_star`), barrier collision impact (`sprint_barrier_hit`), and energy shield deflection (`sprint_blocker_hit`).

5. **SUPPORT Game Upgrade:**
   - **3 Distinct Puzzles:** Puzzle 1 (Learn: 3 ropes, balance & cut), Puzzle 2 (Momentum/Timing: dual anchors and gravity swing), Puzzle 3 (Mastery: 4-rope sequential release).
   - **Tactile Cut & Physics Audio:** Crisp slice sound (`support_cut`), rope snap, target arrival flourish (`support_success`), and gentle rewind cue (`support_reset`).
   - **Auto-Reset Mechanics:** Invalid cut sequences reset puzzle state deterministically within 650ms while the 10s countdown timer continues running.

6. **SYNC Game Upgrade:**
   - **20 Cards (10 Semantic Pairs):** Responsive 4×5 mobile / 5×4 desktop grid, 30s countdown timer.
   - **Memorization Window & Tactile Audio:** Card flip sound (`sync_flip`), 600ms interaction lock on mismatch to allow memorization without frustrating button locks, card slide mismatch cue (`sync_mismatch`), and melodic crystal chime on pair match (`sync_match`).

7. **STARPRINT Reveal:**
   - Celebratory cosmic crescendo (`starprint_reveal`) synchronized with the 5-wing star assembly.

8. **Audio Assets & CC0 Provenance:**
   - 21 focused, lightweight local audio assets (totaling <300KB) placed under `client/public/audio/` (`ui/`, `solve/`, `sense/`, `sprint/`, `support/`, `sync/`, `starprint/`).
   - 100% CC0 Public Domain sourced from Kenney and qubodup. Zero external runtime CDN or API calls.
   - Full provenance manifest documented in `client/public/audio/AUDIO_SOURCES.md`.

9. **Verification & Quality Gates:**
   - `npm run typecheck`: 0 errors across all 3 workspaces (`@5ss/client`, `@5ss/server`, `@5ss/contracts`).
   - `npm run lint`: 0 errors (oxlint).
   - `npm test`: All 8 test suites passed, 126/126 tests passing (100%).
   - `npm run build`: Full production build succeeded (`contracts`, `client`, `server`).
   - Real-browser Playwright matrix verified across 7 viewports: `375x812`, `390x844`, `430x932`, `768x1024`, `1366x768`, `1440x900`, and `812x375` (landscape). Zero console errors, zero layout overflows.
8. **STAR CARD Visual & Export Parity + Default Avatar:**
   - **One Visual Source of Truth:** Visible web card and downloaded PNG share the exact same rendering system (`StarCard` → `StarprintIdentityCard` → `StarPrintSVG`).
   - **What User Sees = What User Downloads:** Downloaded PNG preserves the exact same artwork: rounded portrait frame, gold double-borders, deep cosmic nebula with starfield, 5SS brand mark and season `2026 - 2027`, faceted 5-wing gem star with dynamic OKLCH colors and ambient glow, central avatar circle with gold border, bold nickname, English archetype pill badge (e.g. `THE STRATEGIST`), italic serif tagline (`Think with purpose.`), and Star ID in Cinzel serif.
   - **Canonical High-Resolution Export:** Export renders `StarCard` in `mode="export"` inside an off-screen container at fixed canonical dimensions (600×943px) captured with `html-to-image` at `pixelRatio: 2`, generating a razor-sharp 1200×1886 PNG regardless of whether the user triggers the download from a 375px phone or a 4K desktop.
   - **Default Avatar Mascot:** When the user does not provide a custom photo, `resolveStarCardAvatar` defaults to the first-party star mascot asset `/assets/starprint/default-star-avatar.png` (student star with graduation cap, blue scarf, and wand). Rendered smoothly inside the central circular mask with `preserveAspectRatio="xMidYMid slice"`.
   - **Custom Photo & Safe Fallback:** Custom uploaded photos render in both web card and exported PNG. If an uploaded image fails to load or 404s, both display and export gracefully fall back to the default star mascot without throwing or rendering a broken image icon.
   - **Legacy Exporter Removal:** Removed the legacy 378-line manual 2D canvas drawing from `StarCardExport.ts` that diverged with an outdated 5-point star, English labels, and wire crosshair borders.

### COMPLETED: STARPRINT STAR & PENTAGON GEOMETRY OVERHAUL (FIGMA SPEC ALIGNED)

1. **Outer 5-Point Star + Center Pentagon:** Eliminated the 10-sided polygon decagon/umbrella wedge structure. Replaced with a 5-pointed star with rounded tips and golden border (`#ffd467`). The center is a regular pentagon whose 5 vertices align with the star's inner valleys, with a horizontal top edge and bottom vertex pointing down between the two legs.
2. **Pentagon Avatar Framing:** Avatar/mascot is clipped to the pentagon shape via SVG `clipPath` and framed by the golden pentagon border.
3. **5 Distinct Wings:** The 5 criteria wings extend from the pentagon's 5 edges to the outer tips, maintaining dynamic OKLCH palette colors.
4. **Display & Export Parity:** Verified in `StarPrintSVG`, `StarCard`, and `StarCardExport`. 0 typecheck errors, 0 linter errors, 126/126 tests passed.

### TODO BUSINESS CONFIRMATION

1. SYNC official image assets: once BA provides card illustrations for the 10 concept pairs, replace the versioned provisional deck.
2. Final zero-vector and exact near-tie handling for the cosine classifier; official Star Type identifiers are already fixed.
3. Final visual behavior for the approved Type-to-effect mapping; the official identifiers/mapping are fixed but the renderer is not migrated yet.
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
| Contact form & API | `client/src/features/forms/ContactForm.tsx`, `api/contactApi.ts` |
| Event registration form & API | `client/src/features/activities/RegistrationForm.tsx`, `api/registrationApi.ts` |
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
