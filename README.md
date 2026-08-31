# 5SS UET Website & STARPRINT Platform

5SS UET is a monorepo for the digital presence of the Sinh viên 5 Tốt Club at VNU University of Engineering and Technology. It combines a React marketing site, a local journey checklist, server-backed news/events/contact/registration, and the STARPRINT game and community sky experience.

> **Current status: functional demo.** Marketing copy, initial news/events seed data, contact channels, STARPRINT questions, scoring, archetypes, and visual mappings are provisional. They must not be treated as official club requirements, eligibility guidance, or validated personality assessment rules.

## Repository layout

The root package is an npm-workspaces orchestrator.

| Path | Workspace | Responsibility |
| --- | --- | --- |
| `client/` | `@5ss/client` | React 19 SPA, marketing pages, journey UI, activities UI, STARPRINT UI, 3D scenes |
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
| `/hoat-dong` | Marketing | API-backed news and events. `?item=<slug>` opens a detail modal by slug. |
| `/starprint` | Game | STARPRINT workflow. `?new=1` clears the persisted browser session and starts again. |
| `/starprint/result/:id` | Game | Loads a generated result and offers privacy-controlled publication. |
| `/sky` | Game | Public stars in a lazy-loaded 3D view or accessible grid, updated through `star.created` Socket.IO events. |
| Any unmatched path | Marketing | Not-found page. |

The marketing shell owns the header, footer, cinematic loader, hash scrolling, and Lenis. The game shell intentionally excludes those concerns.

## Stack

- Client: React 19, TypeScript 6, Vite 8, React Router 7, Zustand, Motion, Tailwind CSS 4, Three.js/React Three Fiber, Lenis, and Socket.IO Client.
- Server: NestJS 11, TypeScript, TypeORM, PostgreSQL, Socket.IO, Sharp, class-validator, and Swagger.
- Contracts: strict TypeScript package consumed by both client and server.
- Tests: Jest/ts-jest unit, full-lifecycle, and dynamic content server tests (41 automated test cases).

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0` (required by Vite 8). Verified with Node.js 24.
- npm with workspace support.
- PostgreSQL for the server and all server integration tests.

The marketing routes can be viewed without PostgreSQL, but activities, registration, contact, STARPRINT, and 5SS Sky require the server.

## Install and run locally

Run all installs from the repository root:

```powershell
npm install
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

Create the PostgreSQL database named by `server/.env`, then build the compiled TypeORM data source, run the migration, and seed demo content:

```powershell
npm run build:contracts
npm run build:server
npm --workspace @5ss/server run migration:run
npm --workspace @5ss/server run seed:dev
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
| `VITE_MEDIA_URL` | Optional | Separate public media origin (e.g. CDN or S3 bucket). Documented in `client/.env.example`. If left blank, automatically derived from `VITE_API_URL`. |

Server variables belong in `server/.env` and are read at runtime.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP and Socket.IO port |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/5ss` | PostgreSQL connection |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin in production |
| `MEDIA_STORAGE` | `local` | Storage provider (`local` supported) |
| `MEDIA_LOCAL_DIR` | `uploads` | Directory for uploaded WebP files |

## Quality checks

```powershell
npm run typecheck
npm run lint
npm run build
npm test
```

## Seed development data

```powershell
npm --workspace @5ss/server run seed:dev
```
