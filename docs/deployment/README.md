# Deployment and operations

Approved topology: Vercel static React client → Render single NestJS/Socket.IO process → Supabase PostgreSQL. cron-job.org sends external health requests. No media bucket, persistent disk, Redis or image-processing worker is required.

## Resources

| Component | Configuration |
| --- | --- |
| Frontend | Existing Vercel project `5-star-student-club-platform-client` |
| Backend | Render Free, Singapore, service `5ss-starprint-api` |
| Database | Supabase Free project `5ss-starprint`, Singapore, project ref `pwyfnsondzatcjrncbve` |
| Liveness | `GET https://5ss-starprint-api.onrender.com/api/health` |
| Readiness | `GET https://5ss-starprint-api.onrender.com/api/health/ready` |
| Monitoring | cron-job.org, liveness every 5 min; readiness every 15 min |

Provisioning status and validation evidence are recorded in the root project context. Resource names alone do not confirm a successful release.

## Database preparation

1. Create a Free Supabase project in Singapore. Disable Data API: this application connects through NestJS only and does not need Supabase Auth, Storage or a frontend Supabase SDK/key.
2. Enable SSL enforcement in Database Settings. Download the project's root certificate and verify the server certificate and hostname. Never disable certificate verification to resolve a connection error.
3. Use **Session Pooler on port 5432** for IPv4 connectivity. For this project the host is `aws-0-ap-southeast-1.pooler.supabase.com`; username is `<role>.pwyfnsondzatcjrncbve`. Database is `postgres`. Percent-encode credentials in URLs.
4. Keep a custom-format `pg_dump --no-owner --no-privileges` backup of the original application database before migration. Store it outside Git and outside public static files.
5. Apply compiled TypeORM migrations through `npm run migration:deploy` with the administrator/migration connection. The runner holds a session advisory lock and runs pending migrations transactionally; repeated execution is safe. Do not use the transaction pooler on 6543 for this lock.
6. Transfer only the seven application tables in foreign-key order: news, events, player_sessions, game_results, starprints, contact_submissions, event_registrations. Preserve IDs, timestamps and JSON payloads. Verify counts and content before accepting the transfer. Do not restore over Supabase's auth/storage/platform schemas or replace its roles.
7. Cloud transfer clears legacy player photo URLs, disables physical-card flags and changes the four known marketing `/uploads/` URLs to `/assets/`. The original database and backup retain their original values; image files are not transferred.
8. Create `app_runtime` with LOGIN and no superuser/create-db/create-role/replication permissions. Grant CONNECT, schema USAGE and application-table SELECT/INSERT/UPDATE/DELETE. Enable RLS with an application-role-only policy; revoke anon/authenticated application-table privileges. Migration history has RLS with no runtime policy. Keep the migration owner separate.
9. For a future migration adding tables/sequences, explicitly grant required runtime privileges and add RLS policies in the reviewed migration. Verify with the runtime role before release.

No automated production seed runs during startup. `seed:dev` removes/replaces known fixtures and is a local development command.

## Render configuration

Use the repository root, not `server/`, because npm workspaces link contracts. `render.yaml` documents the desired service settings. If creating manually, enter the same values:

| Setting | Value |
| --- | --- |
| Runtime / region / plan | Node / Singapore / Free |
| Branch | `main` |
| Build | `npm ci --include=dev && npm run build:contracts && npm run build:server` |
| Start | `bash scripts/render-start.sh` |
| Health check | `/api/health` |
| Auto-deploy | After CI Checks Pass |
| Root directory | Empty (repository root) |

The shell runner changes into `server`, executes pending migrations, removes `MIGRATION_DATABASE_URL` from the API process environment, and replaces itself with Node. A failed migration prevents startup. Free services do not support a separate pre-deploy command. `.gitattributes` keeps shell scripts in LF format.

| Environment | Value / handling |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Secret runtime-role Session Pooler URL, without SSL query parameters |
| `MIGRATION_DATABASE_URL` | Secret migration-owner Session Pooler URL |
| `DATABASE_SSL_CA` | Root PEM, actual newlines or literal `\n` accepted |
| `CLIENT_ORIGIN` | `https://5-star-student-club-platform-client.vercel.app` (no trailing slash) |
| `DATABASE_MAX_CONNECTIONS` | `5` |
| `DATABASE_MIN_CONNECTIONS` | `0` |
| `DATABASE_CONNECT_TIMEOUT_MS` | `3000` |
| `PORT` | Supplied by Render; listen on `0.0.0.0` |

Production always enables verified TLS. `DATABASE_SSL=false` cannot turn TLS off in production. Do not put `sslmode`, `sslcert`, `sslkey` or `sslrootcert` in the URL: pg can override explicit TLS options from URL parameters. `DATABASE_SSL_CA_FILE` is the local/secret-file alternative to the PEM variable.

Expected steady-state pool is at most 5 runtime connections, plus 2 during startup migrations. The migration lock and runner require two connections. Avoid scaling beyond one instance until Socket.IO event distribution and rate limits are shared across instances.

## Vercel configuration

- Use the existing project, Git repository and production branch `main`.
- Install/build from the monorepo root; build contracts before the client. Keep the existing SPA rewrite in `client/vercel.json` and output `client/dist` (or project root `client` with its existing workspace-aware commands).
- Set Production `VITE_API_URL=https://5ss-starprint-api.onrender.com/api`. Remove stale ngrok socket/media overrides, or point `VITE_SOCKET_URL` to the backend origin without `/api`. `/assets/` remains on Vercel.
- These variables are public build configuration. Never add database URLs, passwords, service-role keys or migration credentials to any `VITE_*` variable.
- Vite reads `client/.env.production` as a public default. Vercel project overrides take precedence. Redeploy after changing environment variables; an already-built deployment does not pick them up.
- CORS accepts only configured origins in production. Preview domains require deliberate additional origins/backend isolation; do not enable every preview domain for production writes.

## cron-job.org

Create two enabled GET jobs:

| Job | URL | Schedule | Expected result |
| --- | --- | --- | --- |
| 5SS API liveness | `/api/health` | Every 5 min | HTTP 200, small JSON, no DB access |
| 5SS database readiness | `/api/health/ready` | Every 15 min | HTTP 200, `database: up`; HTTP 503 on DB failure |

Use HTTPS, no auth credential/query token, no redirects to unrelated hosts, no response-body storage containing user data. Enable failure/recovery email notifications to the account owner with a small consecutive-failure threshold. Run both jobs manually once and inspect execution history. Health requests set `Cache-Control: no-store`.

Readiness uses the existing runtime pool and a bounded query. It never opens a new pool per ping and never returns database errors or credentials. Contact and registration rate limiting excludes health requests.

External pings reduce idle spin-down; they do not guarantee uptime or defeat account limits. Render Free has shared monthly instance hours, can suspend/restart, and has no always-on SLA. Supabase Free can pause inactive projects and does not include a production backup SLA. Inspect the actual account quotas, particularly because this Render workspace hosts another API. For an event with a fixed attendance window, warm the service beforehand and keep a paid-instance upgrade as an owner-approved option.

## Release verification

1. CI must pass clean `npm ci`, typecheck, lint, build, isolated PostgreSQL migrations and server tests. CI does not receive production credentials.
2. Verify live liveness and readiness, allowed-origin CORS and rejection of an unrelated origin; verify news/event images load from Vercel.
3. Create a test session, select a synthetic portrait, play all five stages, reload mid-flow, generate a result and download PNG. Verify 1200×1886 output and the intended portrait.
4. Check the local card retains its image after reload in the same browser tab/session; public `/star/:id` and Sky use the default avatar. New sessions must not inherit the previous portrait. Storage failures must not prevent play/download, though portraits may be lost on reload when storage is unavailable/full.
5. Verify photo/card-image POST and photo DELETE endpoints return 404 and no `/uploads` assets are served.
6. Verify Socket.IO connects, a published star appears once, and reconnect refreshes the REST snapshot.
7. Restart the backend and verify database progress survives and migration runner reports zero pending migrations. Observe cron success history after at least one scheduled run.
8. Remove only the specifically identified synthetic QA session using a controlled database command; preserve actual application data.

## Backup and rollback

- Supabase Free: export application schema/data before risky migrations and before events. Keep encrypted copies in owner-controlled storage, with a tested restore into an isolated database. A backup sitting only on one laptop is not a disaster-recovery strategy.
- For code rollback, redeploy a known-good compatible commit on Render and promote the matching Vercel deployment. Review compatibility before rolling back across schema changes.
- Do not blindly run migration `down` in production: it can delete game data. Prefer a reviewed forward fix. The marketing URL migration intentionally has a no-op down because `/assets/` remains valid.
- Restore data to a separate project/database first, validate counts/game replay, then deliberately change secrets and deployment targets. Do not overwrite an active production database as a first response.
- If health fails, inspect Render build/runtime logs and Supabase status/connection usage. Distinguish process liveness from database readiness. Never paste connection URLs or passwords into an issue, PR or chat.

Official references: [Render Free](https://render.com/docs/free), [Render deploys](https://render.com/docs/deploys), [Render Blueprint](https://render.com/docs/blueprint-spec), [Supabase connections](https://supabase.com/docs/guides/database/connecting-to-postgres), [Supabase TLS](https://supabase.com/docs/guides/platform/ssl-enforcement), [Vercel environment variables](https://vercel.com/docs/environment-variables), [cron-job.org](https://cron-job.org/en/).
