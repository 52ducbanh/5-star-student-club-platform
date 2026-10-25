# Release verification — 2026-10-25

Release code: PR [#1](https://github.com/52ducbanh/5-star-student-club-platform/pull/1), merged as `5601c13`; assigned-hostname/config follow-up `41f0214`. Resource setup was performed in the owner's logged-in accounts with explicit approval for Render database credentials and replacement of Vercel URL variables.

| Resource | Live configuration |
| --- | --- |
| Client | https://5-star-student-club-platform-client.vercel.app |
| API | https://fivess-starprint-api.onrender.com/api |
| Render | `5ss-starprint-api`, `srv-dberbdjncjis73f6jk70`, Free, Singapore |
| Supabase | `5ss-starprint`, `pwyfnsondzatcjrncbve`, Free, Singapore |
| Liveness job | cron-job.org `8718306`, GET `/api/health`, every 5 minutes |
| Readiness job | cron-job.org `8718317`, GET `/api/health/ready`, every 15 minutes |

## Verified

- Typecheck, lint and contracts/client/server production build pass. The existing large Three.js chunk warning remains.
- 140 Jest tests pass in 13 suites against an isolated local database. Clean GitHub Actions install/build/migrations/tests passed before merging PR #1.
- Supabase applied all six migrations; a repeat run applied zero. Schema synchronization is disabled.
- 100 original application rows copied with preserved IDs/timestamps/JSON, foreign-key order, transaction and content checksums. Cloud-only legacy photo URLs/physical-print flags were cleared; four known marketing image paths were normalized.
- Original local database/files preserved. Custom-format backup restored into separate local database `five_ss_restore_verify`; counts match all original tables, including five original migration-history records.
- Verified certificate/hostname TLS is used; database-side `pg_stat_ssl` reports true after SSL enforcement. `app_runtime` has no superuser, role creation, database creation, replication, RLS bypass or public-schema CREATE permissions. Data API is disabled and table RLS/grants restrict application access.
- Render and Vercel report Live/Ready on `41f0214`. Render uses root workspace commands, the Node version pin, startup migrations, health check and After CI Checks Pass. Build include paths match `render.yaml`.
- Vercel Production/Preview API/media variables are Config values for the actual `fivess-` hostname. Production API requests observed in Chrome target that Render domain.
- Live health/readiness/news/events/Sky return HTTP 200. Exact production-origin CORS works; an unrelated origin receives no allow-origin header. Old image/card mutation routes and static uploads return 404. Public result responses expose neither owner session nor internal result UUID.
- 50 concurrent live readiness requests all returned 200 (a small connectivity/pool smoke check, not a full gameplay load benchmark).
- Production Socket.IO connects using WebSocket. Reconnect snapshot refresh is implemented.
- Full local-browser flow against Supabase completed, including mid-game reload, local portrait retained after result reload, shared card using first-party mascot, and downloaded 1200×1886 PNG.
- Browser storage checks cover normal reload, blocked-storage memory fallback, quota fallback retaining progress without the portrait, and rejection of legacy server image URLs.
- Production session creation, image selection and game submissions succeed. Network observation shows no image/card upload requests.
- Both cron jobs returned 200 in manual tests. Scheduled liveness succeeded at 15:01 and 15:05; scheduled readiness succeeded at 15:15 (Asia/Ho_Chi_Minh; provider jitter of seconds is normal). Failure-after-three and recovery notices target the owner's account email, without storing response bodies.

Full production flow completed with a selected synthetic logo image. PNG download was visually inspected and measured at 1200×1886 (2,561,475 bytes); the matching private result retained its local JPEG after reload. Its public link used the default mascot. Network observation across 113 requests found zero photo/card uploads. Sky received exactly one star.created event and added one matching card. Render recorded a service restart at 15:21 and its startup log reported zero pending migrations at 15:21:54; the persisted result reloaded correctly, the local portrait remained, and Sky returned to LIVE.

At deployment completion, three deployment-only QA sessions were backed up privately and removed by exact recorded IDs and nicknames. Table counts then matched the original 100 application records, with six migration-history rows. No pre-existing user/session records were removed during that deployment validation.

## Subsequent owner-requested game reset

On 2026-10-25 at 15:31 Asia/Ho_Chi_Minh, after accepting the deployed game, the owner requested removing all existing stars for a fresh start. The production reset removed 9 starprints, 70 game results and 20 sessions inside a transaction after verifying a private custom-format backup and JSON snapshot. All three tables were empty after deletion; the live Sky API returned HTTP 200 with `[]`, and database readiness returned 200. Content checksums confirmed news, events, contacts, registrations and migration history were unchanged. Local development data/files were preserved. Backup and report are under ignored `scratch/starprint-before-reset-2026-10-25T08-31-13-888Z.*`. Old browser tabs can reload Sky or open `/starprint?new=1` to discard their old session state. No application code or schema changed for this operation.

## Subsequent reviewed fanpage news publication

On 2026-10-25 at 15:58 Asia/Ho_Chi_Minh, six recent substantive fanpage posts were summarized and published as news, using `content/facebook-news-2026-10-25.json` and the explicit `scripts/import-facebook-news.cjs` workflow. Dates, publishers, original source URLs and matching cover images were verified in Chrome. Shared Club Expo and UET AI support posts retain their publisher context. This is a one-time update, not a recurring crawler.

- Local typecheck, lint, build and importer syntax checks passed. Existing lint/chunk warnings remain. GitHub CI passed on `e98e7b8` for main and the deployment branch; Vercel reported Ready and Render Live on that commit.
- All six Vercel images returned HTTP 200 with image content types and SHA-256 hashes matching the local reviewed assets before database publication.
- Runtime-role import backed up existing news and transactionally added six rows. Total news is nine. Repeating dry-run yields zero inserts and six skips.
- Original three news rows and events/contacts/registrations/game tables passed unchanged content checksums. Game tables remain empty after the earlier owner-requested reset.
- Public news listing/order and six detail endpoints match titles, excerpts, bodies, source credits, dates and image paths. Original detail endpoints remain intact. Readiness returned 200 with database up; Sky returned 200 with `[]`.
- Live Chrome verification covered nine visible news articles, all six new covers, recruitment detail with correct form/source anchors and the homepage's three newest articles. Screenshots and private baseline/backup/report remain ignored under `scratch/`.

## Operating boundaries

Portraits and generated PNG are not stored by the API. Same-tab sessionStorage is temporary and best-effort; users should download the card. Public links/Sky use the mascot. No object storage or Render persistent disk is provisioned.

Pings reduce idle spin-down but do not provide an always-on SLA. Render instance hours are shared across the workspace; the dashboard showed 0.25/750 hours at initial release. Keep quota checks and owner-controlled backups in the event checklist. Supabase Free pause/backup limits and the lack of a moderation/account system remain documented debt.

Evidence files, database backup/transfer checksums and credentials are in ignored `scratch/` on the deployment machine. They are not published in this repository. See [operations](README.md) for recovery and rollback.
