# 5SS UET / STARPRINT
# MASTER HANDOFF & COMPLETE CLIENT–SERVER REFACTOR CONTRACT

> Dùng **chính file này** cho cả Antigravity và Codex.
>
> Mục tiêu:
>
> 1. Antigravity đọc và chuẩn hóa bối cảnh hiện tại.
> 2. Codex tiếp quản từ trạng thái mới nhất và thực hiện structural refactor hoàn chỉnh.
> 3. Từ thời điểm này trở đi, mọi coding agent phải duy trì `PROJECT_CONTEXT.md` để AI khác có thể tiếp quản project mà không cần lịch sử chat.

---

# 0. PROJECT STATUS

Project hiện là **5SS UET / STARPRINT**.

Có frontend React/Vite và backend NestJS/PostgreSQL.

STARPRINT có các thành phần chính:

- Marketing website.
- Journey.
- Activities.
- Forms.
- STARPRINT flow.
- 5 mini-game:
  - SOLVE.
  - SENSE.
  - SPRINT.
  - SUPPORT.
  - SYNC.
- Camera / photo.
- Hidden profile / scoring.
- STARPRINT generation.
- Final Reveal.
- Publish consent.
- 5SS Sky.
- Socket.IO realtime.
- Three.js / React Three Fiber scenes.

Business specification cho 5 mini-game **vẫn đang được BA hoàn thiện**.

Do đó:

> STRUCTURAL REFACTOR ĐƯỢC PHÉP LÀM MẠNH.  
> BUSINESS RULE CHƯA ĐƯỢC BA CHỐT THÌ KHÔNG ĐƯỢC TỰ CHỐT.

---

# 1. SOURCE OF TRUTH

Thứ tự ưu tiên:

```text
1. Source code hiện tại
2. Git working tree hiện tại
3. PROJECT_CONTEXT.md
4. README.md
5. Docs khác
6. Assumption / prompt cũ
```

Nguyên tắc:

> Source code hiện tại là source of truth.

Nếu `PROJECT_CONTEXT.md` không khớp source:

- không ép source quay về context cũ;
- ghi nhận discrepancy;
- hiểu implementation thực tế;
- sau khi thay đổi xong, cập nhật lại `PROJECT_CONTEXT.md`.

---

# 2. AI HANDOFF CONTRACT — BẮT BUỘC TỪ NAY VỀ SAU

Từ task này trở đi:

## Trước khi code

Mọi coding agent phải đọc:

```text
AGENTS.md
PROJECT_CONTEXT.md
README.md
```

nếu các file này tồn tại.

## Sau khi code

Nếu thay đổi ảnh hưởng tới bất kỳ mục nào sau đây:

```text
architecture
folder/module ownership
route
component responsibility
state management
data flow
API
database
migration
Socket.IO
upload/media
environment
dependency
config
CSS architecture
responsive behavior quan trọng
animation
Three.js / WebGL
reusable component
build/test command
deployment
feature implementation status
technical debt
business TODO status
```

thì **phải review và cập nhật `PROJECT_CONTEXT.md` trong cùng task**.

Không được để:

```text
code mới
+
context cũ
```

rồi bàn giao sang AI khác.

Không cần update context cho những chỉnh sửa cực nhỏ như:

```text
padding vài px
typo nhỏ
rename local variable
comment nhỏ
đổi một giá trị visual không ảnh hưởng behavior
```

---

# 3. AGENTS.md — PHẢI TẠO Ở ROOT

Nếu root chưa có:

```text
AGENTS.md
```

hãy tạo.

Nội dung tối thiểu:

```md
# AI / CODING AGENT RULES

1. Always read PROJECT_CONTEXT.md before making material code changes.
2. Source code is the source of truth.
3. Preserve user working-tree changes.
4. Never finalize TODO BUSINESS CONFIRMATION or TODO GAME DESIGN CONFIRMATION without approved requirements.
5. Review PROJECT_CONTEXT.md after every material implementation change.
6. Update PROJECT_CONTEXT.md when architecture, behavior, routes, state/data flow, API, DB, config, dependencies, responsive/3D behavior, testing status, implementation status, or technical debt changes.
7. Do not finish a task with documentation that contradicts source code.
8. Run relevant typecheck/lint/build/tests before finishing.
9. Do not use destructive Git commands without explicit user authorization.
```

`AGENTS.md` không thay thế `PROJECT_CONTEXT.md`.

Vai trò:

```text
AGENTS.md
→ luật cho AI

PROJECT_CONTEXT.md
→ kiến thức kỹ thuật sống của project
```

---

# 4. BA SPEC CHƯA FINAL

Không tự chốt các phần sau nếu BA chưa xác nhận:

```text
SOLVE official question bank
SENSE official scenarios
SPRINT official balance / score weights
SUPPORT final mechanic
SYNC official content
hidden profile official dimensions
scoring formulas
game weights
official 5 Star Type names
type thresholds
Type → Effect official mapping
official palette business formula
official consent policy
STAR CARD business rules
data retention policy
final acceptance rules
```

Nếu source hiện đang có implementation cho các phần trên:

phân loại rõ:

```text
IMPLEMENTED
DOCUMENT-SPECIFIED
PROVISIONAL
TODO BUSINESS CONFIRMATION
TODO GAME DESIGN CONFIRMATION
DEVELOPMENT PLACEHOLDER
```

Không biến placeholder thành final rule.

---

# 5. PHÂN VAI KHI DÙNG FILE NÀY

## Nếu bạn là ANTIGRAVITY

Mục tiêu chính của bạn:

> Chuẩn bị trạng thái repository và context thật sạch để Codex tiếp quản.

Bạn phải:

1. Đọc toàn project.
2. Đọc `PROJECT_CONTEXT.md`.
3. Đối chiếu source với context.
4. Kiểm tra Git.
5. Ghi baseline build/test.
6. Cập nhật `PROJECT_CONTEXT.md` nếu hiện đang stale.
7. Tạo `AGENTS.md` nếu chưa có.
8. Ghi lại business TODO đang chờ BA.
9. Không tự thực hiện một cuộc architecture rewrite khác nếu Codex sẽ là agent chính thực hiện refactor.
10. Không tự chốt nghiệp vụ.

Nếu project đã được user yêu cầu Antigravity trực tiếp refactor trước Codex thì vẫn phải tuân thủ toàn bộ phần kiến trúc bên dưới.

Sau khi hoàn tất, đảm bảo Codex có thể mở repo và hiểu được trạng thái hiện tại chỉ qua:

```text
AGENTS.md
PROJECT_CONTEXT.md
git status
repository tree
```

---

## Nếu bạn là CODEX

Bạn là agent chính thực hiện:

> COMPLETE CLIENT–SERVER STRUCTURAL REFACTOR.

Không tin mù quáng vào output của agent trước.

Trước khi sửa:

1. đọc `AGENTS.md`;
2. đọc `PROJECT_CONTEXT.md`;
3. đọc source;
4. kiểm tra Git;
5. đối chiếu context với implementation;
6. chạy baseline.

Sau đó thực hiện refactor theo contract dưới đây.

---

# 6. GIT SAFETY

Trước khi thay đổi:

```bash
git status
git diff
git diff --stat
```

Phải hiểu:

- modified files;
- staged files;
- untracked files;
- file user vừa sửa;
- file agent trước vừa sửa;
- file nào chưa commit.

TUYỆT ĐỐI KHÔNG:

```bash
git reset --hard
git checkout .
git restore .
git clean -fd
```

Không được làm mất user changes.

Không tự:

```text
commit
push
force push
rewrite history
```

nếu user chưa yêu cầu.

Nếu cần xóa legacy file:

```text
verify consumer
→ migrate replacement
→ build/test
→ delete
```

---

# 7. BASELINE TRƯỚC REFACTOR

Đọc `package.json` thực tế.

Không giả định script tồn tại.

Ghi baseline:

```text
Client typecheck:
Client lint:
Client build:

Server typecheck:
Server lint:
Server build:
Unit tests:
E2E:
Migration:
Socket.IO:
```

Dùng trạng thái:

```text
PASS
FAIL
WARNING
ENVIRONMENT BLOCKED
NOT AVAILABLE
```

Phân biệt:

```text
pre-existing issue
new regression
environment-specific issue
```

Không nói PASS nếu command không thực sự chạy.

---

# 8. TARGET REPOSITORY — CLIENT / SERVER RÕ RÀNG

Sau refactor repository phải hướng tới:

```text
5ss-uet/
│
├── client/
│
├── server/
│
├── packages/
│   └── contracts/
│
├── docs/
│   ├── architecture/
│   ├── prompts/
│   └── testing/
│
├── .gitignore
├── AGENTS.md
├── LICENSE
├── PROJECT_CONTEXT.md
├── README.md
├── package.json
└── package-lock.json
```

Không dừng ở trạng thái hybrid:

```text
/client/src
/root/src

/server
/server-old
```

Không giữ duplicate source "để backup".

Git đã giữ history.

---

# 9. CLIENT APPLICATION

Toàn bộ React/Vite frontend phải nằm dưới:

```text
client/
```

Target:

```text
client/
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes/
│   │   ├── providers/
│   │   └── shells/
│   │
│   ├── features/
│   │   ├── starprint/
│   │   ├── journey/
│   │   ├── activities/
│   │   └── forms/
│   │
│   ├── marketing/
│   │   ├── pages/
│   │   ├── sections/
│   │   └── data/
│   │
│   ├── shared/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── three/
│   │   ├── marketing/
│   │   └── starprint/
│   │
│   ├── config/
│   ├── styles/
│   └── main.tsx
│
├── .env
├── .env.example
├── package.json
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vercel.json
```

Đây là target định hướng.

Không tạo folder rỗng vô nghĩa.

Phân loại theo responsibility thật.

---

# 10. CLIENT APP LAYER

`client/src/app/` chỉ chứa application-level responsibility:

```text
App
routes
providers
MarketingShell
GameShell
route metadata
bootstrap
```

Không đưa feature business logic vào `app/`.

Dependency direction:

```text
app
↓
features / marketing / three
↓
shared
```

Không để:

```text
shared → feature
```

---

# 11. STARPRINT FEATURE

STARPRINT phải có ownership rõ:

```text
client/src/features/starprint/
├── pages/
├── components/
├── games/
│   ├── solve/
│   ├── sense/
│   ├── sprint/
│   ├── support/
│   └── sync/
├── services/
├── store/
├── hooks/
├── types/
├── utils/
└── index.ts
```

Các file kiểu:

```text
StarprintPage
StarprintResultPage
SkyPage
CameraStep
PlayerInfoStep
ColorPickerStep
GeneratingStep
FinalReveal
PublishConsent
StarPrintSVG
```

nên thuộc feature này nếu đúng responsibility.

Không duplicate.

Không tạo barrel export gây circular dependency.

---

# 12. MINI-GAME OWNERSHIP

Mỗi game nên có ownership rõ:

```text
features/starprint/games/solve/
features/starprint/games/sense/
features/starprint/games/sprint/
features/starprint/games/support/
features/starprint/games/sync/
```

Nếu game chỉ có một file nhỏ:

không cần tách quá nhiều file.

Không over-engineer.

---

# 13. JOURNEY

Journey:

```text
client/src/features/journey/
```

Nếu đang có LocalStorage repository abstraction:

GIỮ.

Không cho component truy cập LocalStorage trực tiếp trở lại.

---

# 14. ACTIVITIES

Activities:

```text
client/src/features/activities/
```

Giữ:

```text
filters
URL/query state
modal
Back/Forward
direct URL
```

Không phá URL-driven behavior.

---

# 15. FORMS

Contact / Registration:

```text
client/src/features/forms/
```

hoặc tách feature riêng nếu source thực tế lớn.

Giữ service boundary.

Không chuyển mock/service logic trở lại presentation component.

---

# 16. MARKETING

Các phần chỉ phục vụ website giới thiệu:

```text
Hero
About
Criteria
FAQ
Contact marketing section
homepage storytelling
```

thuộc:

```text
client/src/marketing/
```

Ví dụ:

```text
marketing/
├── pages/
├── sections/
└── data/
```

Không trộn marketing vào STARPRINT.

---

# 17. CLIENT SHARED

`client/src/shared/` chỉ chứa code thực sự dùng chung.

Ví dụ:

```text
AccessibleModal
Toast
BrandMark
generic UI primitives
generic hooks
generic utilities
generic services
```

Rule:

```text
one feature only
→ feature

multiple unrelated consumers
→ shared
```

Không dùng `shared` làm dumping ground.

---

# 18. THREE.JS / R3F

Giữ riêng:

```text
client/src/three/
├── marketing/
└── starprint/
```

Ví dụ:

```text
HeroGalaxyScene
Criteria3DScene
StarSkyScene
```

Không làm thay đổi:

```text
lazy loading
IntersectionObserver
frameloop
DPR
PerformanceMonitor
responsive camera
reduced motion
WebGL fallback
pointer interactions
offscreen behavior
```

Structural refactor không được làm Three.js tải sớm hơn.

---

# 19. CLIENT CONFIG

Centralize app config hợp lý:

```text
client/src/config/
```

Ví dụ:

```text
API config
route constants
brand config
contact config
feature flags nếu thực sự cần
```

Không hard-code URL/config rải trong component nếu hiện có thể centralize hợp lý.

---

# 20. CLIENT STYLES

Không redesign.

Có thể tổ chức:

```text
client/src/styles/
```

nhưng trước khi move:

đọc toàn bộ CSS import order/cascade.

Nếu cascade hiện phụ thuộc thứ tự:

GIỮ behavioral ordering.

Không reorder CSS chỉ để đẹp tree.

---

# 21. SERVER APPLICATION

Backend phải nằm hoàn toàn trong:

```text
server/
```

Target:

```text
server/
├── src/
│   ├── modules/
│   │   ├── sessions/
│   │   ├── games/
│   │   ├── starprints/
│   │   ├── sky/
│   │   └── uploads/
│   │
│   ├── common/
│   ├── config/
│   ├── database/
│   ├── app.module.ts
│   └── main.ts
│
├── migrations/
├── test/
├── .env
├── .env.example
├── package.json
├── nest-cli.json
├── tsconfig.json
└── tsconfig.build.json
```

Adapt theo source thật.

Không tạo layer rỗng chỉ vì nhìn enterprise.

---

# 22. SERVER MODULE OWNERSHIP

Ví dụ games:

```text
server/src/modules/games/
├── dto/
├── entities/
├── domain/
├── games.controller.ts
├── games.service.ts
└── games.module.ts
```

Starprints:

```text
server/src/modules/starprints/
├── dto/
├── entities/
├── domain/
├── starprints.controller.ts
├── starprints.service.ts
└── starprints.module.ts
```

Uploads:

```text
server/src/modules/uploads/
├── storage/
├── dto/
├── uploads.controller.ts
├── uploads.service.ts
└── uploads.module.ts
```

Sky:

```text
server/src/modules/sky/
├── sky.controller.ts
├── sky.service.ts
├── sky.gateway.ts
└── sky.module.ts
```

Không đưa domain logic vào `common`.

---

# 23. SERVER COMMON

Chỉ cross-cutting concerns:

```text
filters
pipes
interceptors
exceptions
decorators
generic utilities
generic types
```

STARPRINT scoring/type/palette không thuộc `common`.

---

# 24. SERVER CONFIG

Centralize hợp lý:

```text
server/src/config/
```

Ví dụ:

```text
app config
database config
cors config
media config
validation config
```

Không đọc `process.env` rải rác nếu có thể gom lại mà không over-engineer.

---

# 25. DATABASE

Database ownership:

```text
server/src/database/
```

Migrations:

```text
server/migrations/
```

hoặc vị trí TypeORM hiện tại nếu cần giữ convention.

Không:

```text
drop schema
rewrite migration history
synchronize:true
```

chỉ vì refactor folder.

Schema không được thay đổi ngoài ý muốn.

---

# 26. PACKAGES / CONTRACTS

Tạo:

```text
packages/contracts/
```

Target:

```text
packages/contracts/
├── src/
│   ├── games/
│   ├── sessions/
│   ├── starprints/
│   ├── sky/
│   └── index.ts
├── package.json
└── tsconfig.json
```

Chỉ chứa pure shared contract:

```text
GameId
SessionStatus
SkyStar
Starprint API response
API boundary enums/types
```

Không chứa:

```text
React props
Zustand state
NestJS controllers/services
TypeORM entities
class-validator decorated DTO
database model
```

Không DRY quá mức.

Nếu FE/BE semantics khác nhau:

không ép share.

---

# 27. ROOT NPM WORKSPACE

Root `package.json` trở thành workspace orchestrator.

Target:

```json
{
  "name": "5ss-uet",
  "private": true,
  "workspaces": [
    "client",
    "server",
    "packages/*"
  ]
}
```

Dựa vào scripts thực tế để tạo root commands.

Mục tiêu:

```bash
npm install

npm run dev:client
npm run dev:server

npm run build
npm run typecheck
npm run lint
npm test
```

Có thể thêm `concurrently` cho:

```bash
npm run dev
```

nếu thực sự hữu ích.

Không thêm:

```text
Nx
Turborepo
Lerna
pnpm
Yarn
```

trong task này.

---

# 28. DEPENDENCY OWNERSHIP

## Root

Chỉ workspace orchestration / shared tooling thật sự dùng chung.

## Client

Frontend dependencies:

```text
React
Vite
React Router
Motion
Three
R3F
Drei
Zustand
Lucide
Socket.IO client
...
```

## Server

Backend dependencies:

```text
NestJS
TypeORM
PostgreSQL
Socket.IO
Sharp
class-validator
class-transformer
Swagger
...
```

## Contracts

Dependency tối thiểu.

Không giữ frontend/backend dependency ở root vì legacy.

---

# 29. LOCKFILE

Mục tiêu:

```text
root/package-lock.json
```

là lockfile workspace chính.

Không edit lockfile bằng tay.

Không giữ multiple lockfile nếu không có lý do kỹ thuật rõ.

---

# 30. NODE_MODULES / DIST

Không move:

```text
node_modules
dist
```

như source.

Generated outputs:

```text
client/dist/
server/dist/
```

phải ignored.

Legacy root `dist/` nếu chỉ là generated build:

xóa sau khi xác minh.

---

# 31. ENVIRONMENT

Tách:

```text
client/.env
client/.env.example
```

chỉ browser-safe:

```text
VITE_API_URL
VITE_*
```

Server:

```text
server/.env
server/.env.example
```

chứa backend secrets/config:

```text
DATABASE_URL
PORT
CLIENT_ORIGIN
MEDIA_STORAGE
MEDIA_LOCAL_DIR
...
```

Không đưa backend secret sang client.

Không output secret trong report.

---

# 32. .gitignore

Root `.gitignore` phải cover monorepo.

Tối thiểu verify:

```gitignore
**/node_modules/
**/dist/

**/.env
**/.env.*
!**/.env.example

server/uploads/
```

Thêm cache/generated path thực tế nếu có.

Không xóa local `.env`.

---

# 33. DOCUMENTATION

Root giữ:

```text
README.md
PROJECT_CONTEXT.md
AGENTS.md
LICENSE
```

Các tài liệu khác:

```text
docs/
├── architecture/
├── prompts/
└── testing/
```

Prompt cũ/audit/testing checklist không nên nằm lẫn root config nếu không cần.

Không xóa tài liệu chưa xác định.

---

# 34. README.md

Sau refactor README phải hướng dẫn đúng architecture mới.

Một developer mới clone repo phải biết:

```text
project overview
repo structure
requirements
npm install
client env
server env
PostgreSQL
run client
run server
run both
build
typecheck
lint
tests
deployment notes
```

Không để command/path cũ.

---

# 35. PROJECT_CONTEXT.md — PHẢI REWRITE/UPDATE MẠNH

Sau refactor, context phải đủ để AI mới hiểu project không cần lịch sử chat.

Bao gồm tối thiểu:

```text
Project overview
Current product scope
Business status
Repository structure
Client architecture
Server architecture
Shared packages
Routes
MarketingShell / GameShell
STARPRINT flow
5 mini-games
Business rules final vs pending
State ownership
API architecture
Database
Entities
Migrations
Media
Camera
Consent status
Socket.IO
5SS Sky
Three.js
CSS architecture
Responsive architecture
Environment variables
Development workflow
Build commands
Test commands
Deployment assumptions
Known limitations
Technical debt
Sensitive areas
AI maintenance rules
```

Không để stale reference tới structure cũ.

---

# 36. BUSINESS STATUS TRONG CONTEXT

Context phải ghi rõ:

```text
BA specification is still in progress.
```

Và từng game có status chính xác.

Không được ghi tất cả là FINAL.

Ví dụ:

```text
SOLVE
→ document-specified mechanic, content/business details pending

SENSE
→ document-specified mechanic, official scenario/vector mapping pending

SPRINT
→ document-specified mechanic, official balance/scoring pending

SUPPORT
→ multiple documented alternatives; final BA mechanic pending

SYNC
→ document-specified mechanic, official content/scoring pending
```

Adapt theo docs/source mới nhất.

---

# 37. PRESERVE PUBLIC ROUTES

Không đổi public URL chỉ vì move file.

Giữ routes hiện tại theo source, ví dụ:

```text
/
 /hanh-trinh-5-tot
 /hoat-dong
 /starprint
 /starprint/result/:id
 /sky
```

Direct URL phải vẫn hoạt động.

---

# 38. PRESERVE PRODUCT BEHAVIOR

Structural refactor không được phá:

```text
MarketingShell
GameShell
Header
Footer
LoadingScreen
Lenis
Journey LocalStorage
Activities query/modal
Back/Forward
forms
Zustand STARPRINT
session state
camera
5 games
generate
reveal
result
consent
publish
5SS Sky
Socket.IO
```

Không rewrite gameplay.

---

# 39. PRESERVE UI / UX

Không redesign.

Giữ:

```text
visual identity
brand
typography
color system
layout
spacing
animation
cosmic style
responsive behavior
reduced motion
```

Không tranh thủ polish ngoài scope.

---

# 40. SERVER AUTHORITY

Giữ nguyên:

```text
Client decides presentation.
Server decides business truth.
```

Không chuyển:

```text
scoring
hidden profile
type determination
consent authority
```

sang client.

---

# 41. IMPORTS / PATHS

Sau move phải sửa toàn bộ:

```text
relative imports
aliases
lazy imports
dynamic imports
CSS imports
asset paths
test imports
Vite aliases
TS paths
Nest paths
migration paths
upload paths
deployment config
```

Search stale references sau refactor.

---

# 42. LEGACY FILE CLEANUP

Được phép xóa:

```text
dead file
duplicate config
obsolete shell
duplicate source
stale package
stale lockfile
legacy frontend root source
```

NHƯNG chỉ sau khi:

```text
no consumer
+
replacement verified
+
build/test pass
```

Không xóa theo tên file.

---

# 43. APP SHELL LEGACY

Nếu có legacy `AppShell.tsx` và architecture mới đã dùng:

```text
MarketingShell
GameShell
```

thì:

1. search references;
2. migrate consumer nếu cần;
3. nếu không còn consumer → remove.

Không giữ dead architecture chỉ để "an toàn".

---

# 44. NAMING

Directories:

```text
lowercase
kebab-case khi cần
```

React component files:

```text
PascalCase.tsx
```

Hooks:

```text
useSomething.ts
```

Frontend utilities/services:

```text
camelCase.ts
```

Nest conventions:

```text
games.service.ts
games.controller.ts
games.module.ts
create-session.dto.ts
```

Không rename hàng loạt nếu tên hiện tại đã rõ.

---

# 45. NO OVER-ENGINEERING

Không tạo enterprise layers giả như:

```text
ports
adapters
use-cases
facades
managers
repositories everywhere
application/domain/infrastructure/presentation everywhere
```

nếu project không cần.

Target đủ tốt:

```text
client
  app
  features
  marketing
  shared
  three

server
  modules
  common
  config
  database

packages
  contracts
```

---

# 46. PHASED EXECUTION

Không move cả repository một lần.

## PHASE 1 — INVENTORY

- Read context.
- Read source.
- Git status/diff.
- Baseline.
- Dependency map.
- Old → new mapping.

## PHASE 2 — ROOT WORKSPACE

- Setup workspace.
- Create/normalize `client`, `server`, `packages`, `docs`.
- Verify npm workspace.

## PHASE 3 — CLIENT MOVE

Move frontend root vào:

```text
client/
```

Verify:

```text
typecheck
lint
build
```

## PHASE 4 — CLIENT INTERNAL RESTRUCTURE

Organize:

```text
app
features
marketing
shared
three
```

Verify again.

## PHASE 5 — SERVER RESTRUCTURE

Normalize:

```text
modules
common
config
database
```

Verify server.

## PHASE 6 — CONTRACTS

Create:

```text
packages/contracts
```

only for truly shared contracts.

Verify client + server.

## PHASE 7 — ENV / TOOLING / DOCS

Update:

```text
.env examples
.gitignore
root scripts
README
AGENTS
PROJECT_CONTEXT
docs
```

## PHASE 8 — LEGACY CLEANUP

Only after verification:

remove obsolete duplicate structure.

## PHASE 9 — FULL VERIFICATION

Run all quality gates.

---

# 47. AFTER EVERY MAJOR PHASE

Run:

```bash
git status
git diff --stat
```

và build/test tương ứng.

Không chờ đến cuối mới phát hiện path regression.

---

# 48. FULL VERIFICATION

Dựa trên scripts thực tế.

Report:

```text
Client typecheck:
Client lint:
Client build:

Server typecheck:
Server lint:
Server build:
Unit:
E2E:
Migration:
Socket.IO:
```

Không nói PASS nếu chưa chạy.

---

# 49. STARPRINT SMOKE TEST

Nếu environment cho phép:

```text
Create Session
→ Player Info
→ Camera / Skip
→ SOLVE
→ SENSE
→ SPRINT
→ SUPPORT
→ SYNC
→ Color
→ Generate
→ Reveal
→ Result
→ Consent
→ Publish
→ 5SS Sky
```

Không thay business rule trong lúc test.

---

# 50. ROUTE REGRESSION

Verify tối thiểu:

```text
/
 /hanh-trinh-5-tot
 /hoat-dong
 /starprint
 /sky
 /starprint/result/:id
```

Check:

```text
direct URL
reload
Back
Forward
route transition
asset load
API
Socket.IO
```

---

# 51. RESPONSIVE REGRESSION

Nếu browser environment cho phép, test:

```text
320
375
390
430
768
1024
1280
1366
1440
1920
```

Check:

```text
Header
Hero
Footer
marketing sections
Journey
Activities
modal
forms
STARPRINT
5 games
Result
Sky
```

Không redesign.

---

# 52. THREE.JS REGRESSION

Verify:

```text
HeroGalaxyScene
Criteria3DScene
StarSkyScene
```

Check:

```text
canvas sizing
camera framing
DPR
offscreen behavior
reduced motion
WebGL fallback
mobile performance
pointer interaction
```

---

# 53. SEARCH STALE REFERENCES

Sau restructure search toàn repo:

```text
root/src
root/public
legacy Vite path
legacy server path
old documentation command
old migration path
old env path
old deployment path
old import path
```

Không kết thúc nếu docs/config còn mô tả cấu trúc cũ.

---

# 54. ROOT CLEANLINESS

Final root nên gần:

```text
5ss-uet/
├── client/
├── server/
├── packages/
├── docs/
├── .gitignore
├── AGENTS.md
├── LICENSE
├── PROJECT_CONTEXT.md
├── README.md
├── package.json
└── package-lock.json
```

Nếu giữ thêm file root:

giải thích tại sao đó là repository-level concern.

---

# 55. FINAL CONTEXT VALIDATION

Trước khi kết thúc:

Tự kiểm tra câu hỏi:

> Nếu một AI hoàn toàn mới chưa từng xem lịch sử chat, chỉ đọc `AGENTS.md`, `PROJECT_CONTEXT.md` và repository tree, nó có hiểu đúng project hiện tại không?

Nếu chưa:

tiếp tục cập nhật context.

---

# 56. FINAL GIT REVIEW

Chạy:

```bash
git status
git diff --stat
git diff
```

Review:

```text
user changes preserved
no secrets leaked
no generated files tracked accidentally
no duplicate source
no stale paths
no business logic changed unexpectedly
no UI redesign
```

---

# 57. FINAL REPORT FORMAT

## A. Baseline

Before-refactor checks.

## B. Architecture Before

Tree rút gọn.

## C. Architecture After

Tree mới.

## D. Migration Map

| Old location | New location | Reason |
|---|---|---|

## E. Deleted Legacy Files

File + reason.

## F. Functional Behavior Changed

Expected:

```text
NONE
```

Nếu có, giải thích.

## G. Business Rules Changed

Expected:

```text
NONE
```

trừ requirement mới đã được user/BA xác nhận.

## H. Verification

```text
Client typecheck:
Client lint:
Client build:

Server typecheck:
Server lint:
Server build:
Unit:
E2E:
Migration:
Socket.IO:
```

## I. PROJECT_CONTEXT Update

Liệt kê sections đã update.

## J. Remaining BA TODO

Liệt kê business/gameplay items còn pending.

## K. Remaining Technical Debt

Chỉ report.

Không tự mở rộng scope.

---

# 58. DEFINITION OF DONE

Task chỉ DONE khi:

1. Source/context đã được đọc và đối chiếu.
2. User working-tree changes được bảo toàn.
3. Frontend nằm hoàn toàn trong `client/`.
4. Backend nằm hoàn toàn trong `server/`.
5. Root không còn frontend legacy source.
6. Không có duplicate source tree.
7. npm workspace hoạt động.
8. Dependency ownership đúng.
9. Client architecture rõ:
   - app
   - features
   - marketing
   - shared
   - three.
10. STARPRINT có ownership rõ.
11. 5 mini-game có ownership rõ.
12. Server module ownership rõ.
13. Shared contracts framework-agnostic.
14. Env client/server tách đúng.
15. `.gitignore` đúng.
16. Generated files ignored.
17. Routes giữ nguyên.
18. UI/UX không redesign.
19. Database schema không bị thay đổi ngoài ý muốn.
20. Socket.IO không regression.
21. BA TODO không bị tự chốt.
22. README đúng architecture mới.
23. `AGENTS.md` tồn tại.
24. `PROJECT_CONTEXT.md` phản ánh implementation mới.
25. Context ghi rõ business spec vẫn pending.
26. Không còn stale path/documentation.
27. Typecheck/build/test pass hoặc failure được báo trung thực.
28. AI mới có thể tiếp quản bằng context mà không cần lịch sử chat.

---

# 59. PERMANENT RULE FOR ALL FUTURE AGENTS

Từ đây trở đi, mọi task code phải tuân theo:

```text
READ AGENTS.md
↓
READ PROJECT_CONTEXT.md
↓
READ SOURCE
↓
IMPLEMENT
↓
VERIFY
↓
REVIEW PROJECT_CONTEXT.md
↓
UPDATE CONTEXT IF MATERIAL CHANGE
```

Không được bỏ bước cuối.

---

# FINAL PRINCIPLE

Đây là nhiệm vụ:

> Biến project thành một fullstack client–server repository rõ ràng, maintainable, AI-handoff-friendly, nhưng không tự thay đổi nghiệp vụ khi BA chưa chốt.

Ưu tiên:

```text
Protect user work
>
Correct architecture
>
Clear client/server ownership
>
Preserve product behavior
>
Accurate persistent context
>
Build/test stability
>
Long-term maintainability
>
Small diff
```

Strong refactor được phép tạo diff lớn.

Nhưng diff lớn phải là:

```text
folder ownership
module ownership
config
workspace
imports
docs
```

không phải:

```text
business rule rewrite
gameplay redesign
UI redesign
```

Không kết thúc task ở trạng thái nửa cũ nửa mới.
