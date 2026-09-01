# Architecture guide

This guide explains the current monorepo boundaries and runtime data flow. For product status, placeholders, and change-sensitive paths, see the root `PROJECT_CONTEXT.md`.

## Workspace graph

```text
packages/contracts
      ├── type contracts ──► client ──► static SPA in the browser
      └── type contracts ──► server ──► long-running NestJS process
                                      ├── PostgreSQL
                                      ├── local /uploads (development)
                                      └── Socket.IO clients
```

| Workspace | Public name | Build output |
| --- | --- | --- |
| `client/` | `@5ss/client` | `client/dist/` |
| `server/` | `@5ss/server` | `server/dist/` |
| `packages/contracts/` | `@5ss/contracts` | `packages/contracts/dist/` |

The root builds contracts before the two applications. Install from the repository root so npm links the workspaces.

## Client boundary

`client/src` is organized by responsibility:

- `app/`: router, global provider, loading UI, route shells, and not-found route.
- `marketing/`: homepage, public marketing sections, layout, and marketing-only data.
- `features/`: activities, forms, journey, and STARPRINT vertical slices.
- `shared/`: cross-feature components, hooks, REST/media client, and navigation utilities.
- `three/`: marketing scenes separated from the STARPRINT Sky scene.
- `styles/`: ordered global style layers.
- `config/`: site/contact sources of truth.

Feature code should depend on `shared` and contracts. Shared code should not import a feature implementation.

### Route shells

```text
BrowserRouter
├── GameShell
│   ├── /starprint
│   ├── /starprint/result/:id
│   └── /sky
└── MarketingShell
    ├── /
    ├── /hanh-trinh-5-tot
    ├── /hoat-dong
    └── *
```

`MarketingShell` owns Header, Footer, Lenis, hash scrolling, metadata, and the skip link. `GameShell` stays full-screen and reduced-motion aware. Marketing loading must not block game routes.

### Browser state

| State | Owner | Persistence |
| --- | --- | --- |
| Journey checklist | Journey repository/hook | `localStorage` |
| Selected journey criterion | Router | `?criterion=<id>` |
| Open activity detail | Router & API | `?item=<slug>` (resolved by slug via backend) |
| STARPRINT in-progress UI | Zustand store | Partial `sessionStorage` state |
| Authoritative STARPRINT progress | Server | PostgreSQL |
| Sky snapshot/live additions | Sky page | React state from REST + Socket.IO |

On a STARPRINT reload, the persisted session ID is reconciled with `GET /api/sessions/:id`. The database, not the browser store, decides completed games and whether a generated result exists.

## Contract boundary

`packages/contracts/src` is the public shape boundary:

- `activities/`: `NewsItem`, `EventItem`, `DerivedEventStatus`, `RegistrationRequest`, `RegistrationResponse`, `ContactRequest`, `ContactResponse`.
- `games/`: canonical game IDs/order, explicit legacy raw payloads, forward-compatible v2 `GameRawResultMap`, and legacy/v2 submission shapes.
- `sessions/`: create/restore shapes and statuses.
- `starprints/`: legacy result shapes plus the official seven traits, Local/Global Hidden Profile types, Star Type/effect identifiers, and exact-five `WingPalette`.
- `sky/`: public star and `star.created` event.
- `versions/`: centralized legacy-v1 and official-v2 raw/content/scoring/profile/palette identifiers.

The currently active game endpoint remains explicitly legacy and rejects payloads carrying v2 version fields. Official v2 raw contracts cannot be submitted through it until each game receives its migration and authoritative validator. The standalone server engine at `server/src/modules/games/scoring/v2/hidden-profile.engine.ts` requires an explicit declaration for all seven traits: structural non-observability is `null`, while poor performance or timeout after valid opportunities is numeric `0`. It normalizes game-supplied contribution/opportunity pairs and performs unweighted, non-null aggregation; an all-zero observed profile is complete, while `insufficient-evidence` means a trait has no observing source. The engine is not wired into generation yet.

When a network shape changes:

1. Change the shared contract.
2. Adapt server DTO/service mapping.
3. Adapt the client API types/consumer.
4. Verify REST and Socket.IO payloads.

## Server boundary

`server/src` is divided into:

- `common/`: domain error types/filter and CORS helper.
- `config/`: environment mapping.
- `database/`: application TypeORM module, CLI data source, migrations, and seeds.
- `modules/`: feature modules.

```text
SessionsModule
   │ session lookup/status
   ├────────► GamesModule ───────► game_results
   │                │ aggregate
   │                ▼
   ├────────► StarprintsModule ──► starprints
   │                │ publish after commit
   │                ▼
   ├────────► UploadsModule       SkyGateway
   │                │                │
   │                ▼                ▼
   ├────────► NewsModule ────────► news
   │
   ├────────► EventsModule ──────► events + event_registrations
   │
   └────────► ContactModule ─────► contact_submissions
```

### HTTP and Socket.IO

```text
GET  /api/news
GET  /api/news/:slug
GET  /api/events
GET  /api/events/:slug
POST /api/events/:eventId/registrations
POST /api/contact
POST /api/sessions
GET  /api/sessions/:id
POST /api/sessions/:sessionId/photo
POST /api/sessions/:sessionId/games/:gameId
POST /api/starprints/generate
GET  /api/starprints/:id
POST /api/starprints/:id/publish
GET  /api/sky
WS   star.created
```

Swagger exposes the controller surface at `/api/docs`.

### Database

PostgreSQL migrations create:
- `player_sessions`
- `game_results`
- `starprints`
- `news`
- `events`
- `event_registrations`
- `contact_submissions`

The CLI data source reads compiled entities and migrations under `server/dist`. A server build (`npm run build:server`) is required before `migration:run`, `migration:generate`, or `seed:dev`.

## Media path

```text
multipart file
  → MIME/5 MB guard
  → Sharp: orient + fit inside 1024×1024 + WebP quality 85
  → MEDIA_LOCAL_DIR/<uuid>.webp
  → /uploads/<uuid>.webp
  → client normalizeMediaUrl()
```

The local adapter is development-only. `MEDIA_STORAGE` is present in configuration but does not yet choose another implementation.

## Environment split

- `client/.env` is consumed at Vite build time. `VITE_API_URL` must include `/api`.
- `server/.env` is consumed at server runtime. It owns database, port, CORS, and media settings.
- Socket.IO runs on the server origin, not the `/api` path.
- Production client and server builds must agree on `VITE_API_URL` and `CLIENT_ORIGIN`.

## Architectural invariants

1. Source and manifests override stale prompts or documentation.
2. Public client/server shapes belong in `@5ss/contracts`.
3. Marketing and game shells remain isolated.
4. Server/database state is authoritative for STARPRINT progress and event registrations.
5. Publication privacy is applied in both REST Sky mapping and the live event payload.
6. Database state transitions complete before live events are emitted.
7. Local journey data stays local unless an approved product change says otherwise.
8. Demo business/game rules remain explicitly provisional.
9. Preserve the CSS import order and reduced-motion/accessibility behavior.
10. Production deployment cannot rely on the current local upload directory.
