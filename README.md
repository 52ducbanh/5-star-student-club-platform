# 5SS UET Website & STARPRINT Platform

5SS UET is a monorepo for the digital presence of the Sinh viên 5 Tốt Club at VNU University of Engineering and Technology. It combines a React marketing site, a local journey checklist, and the server-backed STARPRINT game and community sky experience.

> **Current status: functional demo.** Marketing copy, events, forms, contact channels, STARPRINT questions, scoring, archetypes, and visual mappings are provisional. They must not be treated as official club requirements, eligibility guidance, or validated personality assessment rules.

## Repository layout

The root package is an npm-workspaces orchestrator.

| Path | Workspace | Responsibility |
| --- | --- | --- |
| `client/` | `@5ss/client` | React 19 SPA, marketing pages, journey UI, STARPRINT UI, 3D scenes |
| `server/` | `@5ss/server` | NestJS REST API, Socket.IO gateway, PostgreSQL persistence, image processing |
| `packages/contracts/` | `@5ss/contracts` | Shared TypeScript request, response, event, and domain contracts |
| `docs/` | — | Architecture, testing notes, and historical implementation prompts |
| `package.json` | — | Cross-workspace build, check, test, and development commands |

See [the architecture guide](docs/architecture/README.md), [the testing guide](docs/testing/README.md), and [the detailed project context](PROJECT_CONTEXT.md).

## User-facing routes

| Route | Shell | Behavior |
| --- | --- | --- |
| `/` | Marketing | Homepage. Section anchors include `#gioi-thieu`, `#hanh-trinh`, `#starprint-showcase`, `#hoat-dong-noi-bat`, `#faq`, and `#lien-he`. |
| `/hanh-trinh-5-tot` | Marketing | Five-criterion journey and browser-local checklist. `?criterion=<id>` selects a criterion. |
| `/hoat-dong` | Marketing | Demo news and events. `?item=<id>` opens a detail modal. |
| `/starprint` | Game | STARPRINT workflow. `?new=1` clears the persisted browser session and starts again. |
| `/starprint/result/:id` | Game | Loads a generated result and offers privacy-controlled publication. |
| `/sky` | Game | Public stars in a lazy-loaded 3D view or accessible grid, updated through `star.created` Socket.IO events. |
| Any unmatched path | Marketing | Not-found page. |

The marketing shell owns the header, footer, cinematic loader, hash scrolling, and Lenis. The game shell intentionally excludes those concerns.

## Stack

- Client: React 19, TypeScript 6, Vite 8, React Router 7, Zustand, Motion, Tailwind CSS 4, Three.js/React Three Fiber, Lenis, and Socket.IO Client.
- Server: NestJS 11, TypeScript, TypeORM, PostgreSQL, Socket.IO, Sharp, class-validator, and Swagger.
- Contracts: strict TypeScript package consumed by both client and server.
- Tests: Jest/ts-jest unit and full-lifecycle server tests. There is currently no automated client test suite.

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0` (required by Vite 8). The refactor was verified with Node.js 24.
- npm with workspace support.
- PostgreSQL for the server and all server integration tests.

The marketing routes can be viewed without PostgreSQL, but STARPRINT and 5SS Sky require the server.

## Install and run locally

Run all installs from the repository root:

```powershell
npm install
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

Create the PostgreSQL database named by `server/.env`, then build the compiled TypeORM data source and run the migration:

```powershell
npm run build:contracts
npm run build:server
npm --workspace @5ss/server run migration:run
```

Start the two applications in separate terminals:

```powershell
npm run dev:server
```

```powershell
npm run dev:client
```

Default local URLs:

- Client: `http://localhost:5173`
- API and Socket.IO server: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api/docs`

For phone or LAN testing, set `VITE_API_URL` to the server address reachable by that device. Vite listens on all interfaces; development CORS permits localhost and private-LAN origins.

## Environment variables

Client variables belong in `client/.env` and are embedded by Vite at build time.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Recommended | REST base URL including `/api`. Example: `http://localhost:3000/api`. If empty, the HTTP client derives port 3000 from the page hostname. Set it explicitly outside simple local development. |
| `VITE_MEDIA_URL` | Optional | Separate public media origin. The code supports it, but it is not yet listed in `client/.env.example`. Otherwise the origin is derived from `VITE_API_URL`. |

Server variables belong in `server/.env` and are read at runtime.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP and Socket.IO port |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/5ss` | PostgreSQL connection |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Comma-separated allowed production origins; development additionally accepts private-LAN origins |
| `MEDIA_STORAGE` | `local` | Reserved storage selection setting; the current module still wires only the local adapter |
| `MEDIA_LOCAL_DIR` | `uploads` | Server-relative directory for processed WebP files |

Do not commit either `.env` file.

## Root scripts

| Command | What it does |
| --- | --- |
| `npm run dev:client` | Starts Vite for `@5ss/client` |
| `npm run dev:server` | Starts NestJS in watch mode for `@5ss/server` |
| `npm run build` | Builds contracts, client, then server |
| `npm run build:contracts` | Emits `packages/contracts/dist/` |
| `npm run build:client` | Type-checks and builds `client/dist/` |
| `npm run build:server` | Builds `server/dist/` |
| `npm run typecheck` | Runs every workspace typecheck script |
| `npm run lint` | Runs every workspace lint script |
| `npm test` | Runs the server Jest suite |
| `npm run preview` | Serves the existing client production build locally |

Additional server commands:

```powershell
npm --workspace @5ss/server run start:prod
npm --workspace @5ss/server run migration:run
```

The migration scripts execute the compiled `server/dist/database/data-source.js`, so build the server before running them.

## Build, test, and verify

```powershell
npm run typecheck
npm run lint
npm run build
npm --workspace @5ss/server test -- --runInBand
```

The server tests require a migrated PostgreSQL database through `DATABASE_URL`. Use a dedicated non-production database. See [docs/testing/README.md](docs/testing/README.md) for test coverage and smoke checks.

## API summary

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/sessions` | Create a player session |
| `GET` | `/api/sessions/:id` | Restore session progress and generated result ID |
| `POST` | `/api/sessions/:sessionId/photo` | Upload JPEG, PNG, or WebP; process to WebP |
| `POST` | `/api/sessions/:sessionId/games/:gameId` | Validate and store the next demo game result |
| `POST` | `/api/starprints/generate` | Generate one STARPRINT after all five games |
| `GET` | `/api/starprints/:id` | Fetch a result |
| `POST` | `/api/starprints/:id/publish` | Publish with name/photo consent flags |
| `GET` | `/api/sky` | List public stars with consent filtering |

Game submissions currently follow `solve → sense → sprint → support → sync`. The server validates order and the current payload shapes, then deterministically derives a demo profile, palette, archetype, and effect. These mechanics are implementation defaults pending business and game-design approval.

## Deployment

The repository produces three build outputs:

- `packages/contracts/dist/` — shared package JavaScript/declarations
- `client/dist/` — static SPA assets
- `server/dist/` — long-running Node/NestJS service

A production deployment needs:

1. A static host for `client/dist/` with SPA history fallback. `client/vercel.json` contains the current catch-all rewrite.
2. A Node host that supports persistent Socket.IO connections for `server/dist/main.js`.
3. PostgreSQL with migrations run before the server starts.
4. Production `VITE_API_URL`, `CLIENT_ORIGIN`, and `DATABASE_URL` values.
5. Durable object/media storage before relying on uploads. The current local disk adapter is a development placeholder.

There is no backend container, infrastructure-as-code, managed database, or production media-storage configuration in this repository yet. When a provider builds this monorepo, install from the repository root so workspace dependencies resolve, then publish `client/dist/` and run `server/dist/main.js` as separate services.

## Product and business placeholders

- Journey criteria details are suggestions, not official recognition requirements.
- News, event dates, images, locations, and registration flows are illustrative.
- Contact links, recruitment URL, map URL, and some club/leader media are not confirmed.
- Contact and event registration services only simulate submission in the browser.
- STARPRINT content, scoring weights, archetype names/descriptions, and type-to-effect mapping require BA/club approval.
- There is no authentication, administration, moderation, or production upload storage.

Do not remove these caveats or finalize a `TODO BUSINESS CONFIRMATION` / `TODO GAME DESIGN CONFIRMATION` item without approved requirements from the club organizers.
