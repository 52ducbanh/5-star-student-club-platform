# 5SS UET & STARPRINT

React marketing site and STARPRINT game with NestJS, Socket.IO and PostgreSQL in an npm-workspaces monorepo. The five v2 mini-games, hidden-trait scoring, archetype/palette generation, public Sky and local PNG export are implemented. Business/game policy still requires organizer approval; this is not a validated personality assessment.

## Deployment

Approved stack: **Vercel client + Render API + Supabase PostgreSQL + cron-job.org monitoring**. Portrait selection/camera and PNG download work in the browser. The server does not store portrait/card files; shared results and Sky use the default mascot.

Live game: [STARPRINT](https://5-star-student-club-platform-client.vercel.app/starprint). [Release verification](docs/deployment/VALIDATION.md) records checks and service identifiers.

See [deployment and operations](docs/deployment/README.md) for exact settings, TLS, migrations, backups, health jobs and rollback. See [current project context](PROJECT_CONTEXT.md) for actual release status and [architecture](docs/architecture/README.md) for boundaries.

## Local setup

Use the Node version in `.node-version`, npm and PostgreSQL. Run from repository root:

```powershell
npm ci
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
npm run build:contracts
npm run build:server
npm --workspace @5ss/server run migration:run
npm --workspace @5ss/server run seed:dev
```

Create the database named in `server/.env` first. Do not overwrite an existing environment file or seed production. Start in separate terminals:

```powershell
npm run dev:server
```

```powershell
npm run dev:client
```

Defaults: client `http://localhost:5173`, API `http://localhost:3000/api`, Swagger `/api/docs`. `npm run dev:tunnel` is an optional ngrok tunnel to port 3000; it only starts the tunnel. Production Render does not need a local server or ngrok.

## Configuration

| Setting | Purpose |
| --- | --- |
| Client `VITE_API_URL` | Public API URL including `/api`; set at build time |
| Client `VITE_SOCKET_URL` | Optional Socket.IO origin without `/api` |
| Server `DATABASE_URL` | Runtime PostgreSQL secret |
| Server `MIGRATION_DATABASE_URL` | Separate migration-owner secret |
| Server `DATABASE_SSL_CA` / `_FILE` | Trusted root PEM/file; production always verifies TLS |
| Server `CLIENT_ORIGIN` | Exact allowed production frontend origins, comma-separated |
| Server `PORT` | Listening port, default 3000; supplied by Render |

Production frontend default is tracked in `client/.env.production`; host environment overrides take precedence and require a new build. Never place database secrets in VITE variables. Full optional settings are in workspace `.env.example` files.

## Routes and workspaces

- Client: `/`, `/hanh-trinh-5-tot`, `/hoat-dong`, `/starprint`, `/starprint/result/:id`, `/star/:id`, `/sky`.
- `client` (`@5ss/client`): React 19/Vite/Three.js SPA.
- `server` (`@5ss/server`): NestJS REST/Socket.IO; seven application tables.
- `packages/contracts` (`@5ss/contracts`): shared public types and domain versions.
- `/api/health`: process liveness. `/api/health/ready`: bounded database readiness.

## Validation

```powershell
npm run typecheck
npm run lint
npm run build
npm test -- --runInBand
```

Tests require an isolated PostgreSQL database with migrations applied. Never point them at production. GitHub Actions provisions its own test database. See [testing](docs/testing/README.md) for coverage and smoke checks.
