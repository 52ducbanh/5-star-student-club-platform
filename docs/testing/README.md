# Testing and verification

The repository currently has automated server tests plus compile/lint/build checks for all workspaces. There is no automated client UI, browser, accessibility, or visual-regression suite yet.

## Fast repository checks

Run from the repository root:

```powershell
npm run typecheck
npm run lint
npm run build
```

These commands cover every workspace script that exists:

| Check | Contracts | Client | Server |
| --- | --- | --- | --- |
| `typecheck` | TypeScript strict no-emit | TypeScript project build/no-emit | TypeScript no-emit |
| `lint` | Oxlint `src` | Oxlint | Oxlint `src` |
| `build` | Emits `dist` | TypeScript + Vite | Nest build |

## Server test prerequisites

The Jest suite imports the real `AppModule`. Its end-to-end tests therefore connect to PostgreSQL through `DATABASE_URL`.

1. Create a dedicated, non-production test database.
2. Put its connection string in `server/.env` or set `DATABASE_URL` for the test process.
3. Build the compiled data source and apply the migration:

```powershell
npm run build:contracts
npm run build:server
npm --workspace @5ss/server run migration:run
npm --workspace @5ss/server run seed:dev
```

Do not point this test suite at production. The current lifecycle test deletes the session it creates and relies on cascade cleanup, but it does not provision or isolate a database automatically.

## Run tests

Run all server tests serially:

```powershell
npm --workspace @5ss/server test -- --runInBand
```

The root alias also runs the server suite:

```powershell
npm test
```

Useful targeted commands:

```powershell
npm --workspace @5ss/server test -- --runInBand test/scoring.spec.ts
npm --workspace @5ss/server test -- --runInBand test/hidden-profile-v2.spec.ts
npm --workspace @5ss/server test -- --runInBand test/app.e2e-spec.ts
npm --workspace @5ss/server test -- --runInBand test/activities.e2e-spec.ts
```

## Current automated coverage

### Domain unit tests

`server/test/scoring.spec.ts` currently contains 13 cases:

- deterministic scoring for SOLVE, SENSE, SPRINT, SUPPORT, and SYNC;
- aggregation into a bounded five-dimensional vector;
- selection of each of the five demo archetypes;
- deterministic tie ordering;
- deterministic five-color palette generation.

These tests lock the current demo implementation. They do not establish business approval or psychometric validity.

### Official v2 profile foundation tests

`server/test/hidden-profile-v2.spec.ts` contains 35 cases covering:

- exact official trait, Star Type, effect, game-order, WingPalette, and version invariants;
- Local Trait Profile normalization using the maximum valid observation opportunities actually presented;
- mandatory seven-trait observability declarations, structural null, timeout/incorrect numeric zero, lower/upper clamping, invalid denominator, NaN, and Infinity;
- unweighted Global Hidden Profile means with null excluded and numeric zero included;
- all-zero observed profiles remaining complete, with explicit insufficient-evidence only when a trait has no observing source;
- rejection of official-v2 SOLVE/SENSE payloads at the unversioned legacy submission validator;
- finite `[0,1]` output validation.

This engine is a standalone v2 foundation. The five current mini-games and legacy result generation still use `server/test/scoring.spec.ts` behavior until their later migration checkpoints.

### STARPRINT full-lifecycle tests

`server/test/app.e2e-spec.ts` currently contains 11 ordered cases:

1. Create a session.
2. Reject an out-of-order game.
3. Reject an invalid raw game payload.
4. Reject early STARPRINT generation.
5. Accept SOLVE and reject its duplicate.
6. Accept SENSE, SPRINT, SUPPORT, and SYNC in sequence.
7. Restore completed progress from the session endpoint.
8. Generate a STARPRINT.
9. Fetch the result.
10. Publish with consent flags.
11. List the public star with consent filtering.

### Dynamic content & activities tests

`server/test/activities.e2e-spec.ts` currently contains 17 cases:

- News: list published news ordered by `publishedAt DESC`, slug lookup, draft exclusion, 404 for unknown/draft items.
- Events: list published events with derived `status` and `registrationAvailable`, slug lookup, 404 for unknown items.
- Event Registration: successful creation, trimmed studentId and normalized lowercase email, 409 `DUPLICATE_REGISTRATION` for duplicate studentId on same event, cross-event registration allowed, 422 for disabled/passed deadline, 422 `EVENT_FULL` for capacity overflow, 404 for unknown event, 400 for invalid payload.
- Contact: valid submission persisted in `contact_submissions`, 400 for invalid payload.

**Total current automated Jest cases: 76 across 4 suites.**

## Manual client smoke checklist

Because the client has no automated UI suite, perform proportional manual checks after route, state, API, styling, or 3D changes.

### Marketing shell

- Load `/` and confirm the cinematic loader clears.
- Test anchors `#gioi-thieu`, `#hanh-trinh`, `#starprint-showcase`, `#hoat-dong-noi-bat`, `#faq`, and `#lien-he`.
- Navigate to `/hanh-trinh-5-tot` and `/hoat-dong` without a full reload.
- Verify header/footer, focus movement, hash offset, mobile menu, and reduced motion.
- Load an unknown path and confirm the marketing not-found page.

### Journey and activities

- Open `/hanh-trinh-5-tot?criterion=hoc-tap` and confirm the matching criterion is selected.
- Toggle checklist items, reload, and confirm browser-local persistence.
- Reset progress and confirm the local state clears.
- Open `/hoat-dong?item=<slug>` and an event slug; close the modal and confirm `item` is removed.
- Confirm invalid `item` values do not open a modal.
- Submit contact form and event registration form; verify persistence in database.

### STARPRINT

- Start `/starprint?new=1` and confirm the query is consumed.
- Create a session, use camera or file fallback, and complete games in order.
- Reload midway and confirm reconciliation returns to the correct step.
- Generate a result, directly reload `/starprint/result/:id`, and verify not-found/network states separately.
- Publish with each name/photo consent combination and inspect `/sky`.
- Confirm a live publication appears once via `star.created`.

### 3D, responsive, and accessibility

- Test at 320px, a common mobile width, tablet, desktop, and a wide viewport.
- Confirm touch interactions do not depend on hover.
- Test `prefers-reduced-motion: reduce`; Sky should start in grid mode.
- Navigate interactive controls with a keyboard and verify visible focus, modal focus trapping, Escape, and focus return.
- Verify meaningful content still works if WebGL is unavailable.
- Check browser console and network panel for chunk, REST, media, and Socket.IO errors.

## LAN smoke test

1. Set `client/.env` `VITE_API_URL` to the computer's reachable LAN address, including `:3000/api`.
2. Start both workspaces.
3. Open Vite's LAN URL from another device.
4. Confirm REST, uploaded media, and Socket.IO all resolve to the computer rather than the phone's localhost.

Vite listens on all interfaces. Development CORS accepts private IPv4 origins. Production still requires explicit `CLIENT_ORIGIN` values.

## Deployment smoke test

After `npm run build`:

- Run `npm run preview` and deep-link to every client route through an SPA-capable host.
- Run `npm --workspace @5ss/server run start:prod` with production-like environment values.
- Verify migrations were applied before startup.
- Verify `/api/docs`, a complete STARPRINT lifecycle, uploaded media URL resolution, and WebSocket reconnection.
- Verify the production host preserves Socket.IO upgrades and does not rely on ephemeral local media storage.

## Known testing gaps

- Client component and hook tests.
- Browser end-to-end tests.
- Automated accessibility checks.
- Screenshot/visual regression at responsive breakpoints.
- Upload processing and invalid-file integration tests.
- Socket.IO event integration/reconnection tests.
- CORS and multi-origin tests.
- Migration up/down tests and isolated test database provisioning.
- Authentication/authorization tests are not applicable yet because those features do not exist.
