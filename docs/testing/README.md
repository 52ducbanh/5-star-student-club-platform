# Testing and verification

Current local Jest result: **140 passing tests in 13 suites** (2026-10-25). Typecheck, lint and production builds cover all workspaces. Client smoke checks are manual; there is no automated browser/visual/accessibility suite.

## Reproduce

Use an isolated PostgreSQL database. Integration tests write and clean fixtures; never provide a production URL. Set `DATABASE_URL` and local `DATABASE_SSL=false`, then run from repository root:

```powershell
npm ci --include=dev
npm run build:contracts
npm run typecheck
npm run lint
npm run build
npm --workspace @5ss/server run migration:run
npm test -- --runInBand
```

The compiled data source is required for migrations. CI provisions its own PostgreSQL service and runs this sequence without production secrets. `seed:dev` is optional for local browsing, never part of release startup.

## Automated coverage

- Legacy scoring and v2 hidden-profile normalization, observability/null/zero, classification, palettes and invariants.
- v2 game flow, deterministic SPRINT track and SUPPORT puzzle engine.
- Full session/game/generate/publish lifecycle, invalid/order/duplicate submissions and ownership checks.
- News/events, publication filtering, registration identity/capacity/deadlines and contact persistence.
- Retired photo/card upload endpoints return 404; Sky legacy photos are redacted.
- Liveness does not query DB; readiness uses a bounded query and returns sanitized 503 on failure.
- Production URL requirement, verified TLS, pool settings and SSL query-parameter rejection.
- Write limits reject repeated contact/registration/session creation, isolate IPs, expire windows and exclude gameplay/health.

## Browser smoke checks for this release

1. Start a fresh session. Choose a synthetic JPEG/PNG/WebP or camera image, confirm preview and continue. Confirm no photo/card-image POST appears in network traffic.
2. Reload while playing; verify correct game and portrait preservation. Temporarily stop the API: retry should retain progress instead of clearing it, and the game timer must not run during restore.
3. Complete all five games, select a color, generate and download PNG. Verify 1200×1886 dimensions and custom image. Reload the result in the same tab and download again.
4. Open `/star/:id` and `/sky`: both use mascot, no player portrait. Start another session: previous portrait must not carry over. Skip portrait and verify mascot download.
5. Simulate blocked/full sessionStorage: game remains usable through the memory fallback. A reload may lose the portrait in this case; progress storage fallback is best-effort.
6. Confirm physical-print UI and server image persistence are absent. Existing owner/public result links and media preference still work.
7. Check news/events and first-party marketing images; contact/registration validation. Verify SPA deep links, mobile layout, keyboard focus and reduced-motion/grid fallback proportionally to changed code.
8. Verify Socket.IO publication once and REST refresh on reconnect. Inspect console for real errors; existing large Three.js build warnings are tracked separately.

## Deployment verification

See [runbook](../deployment/README.md): clean CI, repeated migration with zero pending work, live health/readiness, exact CORS, HTTPS/Socket.IO, restart persistence, cron execution history and backup/restore rehearsal. Use a specifically named QA session and remove only that fixture after testing.

Known gaps: automated client component/e2e/accessibility/visual checks, distributed Socket.IO/limits, sustained production-like load testing, approved retention/moderation policy and disaster-recovery automation. Passing tests do not constitute BA approval or establish psychometric validity.
