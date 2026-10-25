# Architecture guide

Source and `PROJECT_CONTEXT.md` describe current behavior. Historical prompts/checkpoints are not current requirements.

```text
@5ss/contracts ──► Vercel React SPA ── REST/Socket.IO ──► Render NestJS
       └───────────────────────────────────────────────────┘
                                                           │ verified TLS
                                                           ▼
                                                  Supabase PostgreSQL
cron-job.org ── GET liveness/readiness ──► Render
```

Install/build from repository root. Build outputs are `packages/contracts/dist`, `client/dist` and `server/dist`.

## Client

- `app`: router, providers, marketing/game shells, loader and not-found route.
- `marketing`: club homepage/layout/content; `features`: journey, activities, forms, STARPRINT.
- `shared`: HTTP, common components/hooks; `three`: marketing/Sky scenes; `styles`: ordered CSS.
- Marketing routes own Header/Footer/Lenis/hash navigation. Game routes remain full-screen and isolated.
- Journey checklist uses localStorage. STARPRINT partial state/portrait uses sessionStorage with memory/quota fallback. Server reconciliation determines actual progress.
- A local portrait is overlaid only on the matching session's private result view. Public sharing and Sky use the mascot. SVG/card/PNG render in the browser; no image request is uploaded.
- The client waits for readiness before session creation/restoration. Network failure retains progress; only a missing session resets it.

## Server and contracts

`packages/contracts/src` owns activities, games, sessions, starprints, sky and version shapes. Adapt server mapping and client consumers together when changing a public shape. Legacy nullable photo/physical fields remain for compatibility and are returned as null/false.

Feature modules are Sessions, Games, Starprints, Sky, News, Events, Contact and Health. There is no UploadsModule or file-storage adapter. Gameplay supports the implemented v2 deterministic assignments/validation/scoring and legacy result compatibility; deployment changes do not rebalance games.

Seven application tables persist sessions, game results, starprints, news, events, registrations and contact submissions. Publication commits before `star.created` emits. Sky REST and Socket.IO share the same privacy mapping, and reconnect refetches a snapshot. One backend instance is supported; scaling needs a shared event bus and distributed limits.

TypeORM runtime and CLI use shared configuration. Schema synchronization and runtime auto-migration are off. The shell startup runs a separate locked transactional migration process, then starts Node with the runtime URL. Supabase uses the session pooler, verified TLS, max-five runtime pool, a DML-only runtime role and role-restricted RLS. New table migrations must include runtime grants/policies.

Liveness never queries the database. Readiness uses the existing pool and a bounded SELECT. Per-IP in-memory limits protect contact, registrations and new sessions; health and game submissions are excluded. Production CORS matches configured origins, and Express trusts one hosting proxy hop.

## Assets and environment

Marketing images are Vercel `/assets/` files; the migration normalizes four known legacy URLs. No Render filesystem persistence is needed. Existing local image files/legacy columns are retained without being served or written.

VITE variables are public build-time configuration. Database, migration URL, CA and CORS are backend runtime settings. Socket.IO uses the backend origin without `/api`; API uses `/api`. See [deployment](../deployment/README.md) for exact values and [testing](../testing/README.md) for verification.
