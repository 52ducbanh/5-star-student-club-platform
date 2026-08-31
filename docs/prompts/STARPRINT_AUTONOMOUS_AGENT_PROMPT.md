# AUTONOMOUS IMPLEMENTATION TASK
# 5SS UET — CLIENT/SERVER REFACTOR + BUILD YOUR STAR / STARPRINT

Bạn đang đóng vai trò:

- Senior Full-stack Engineer;
- Software Architect;
- Frontend Engineer;
- Backend Engineer;
- Game/Web Interaction Engineer;
- QA Engineer;

và phải tự triển khai task này END-TO-END.

Đây là một AUTONOMOUS IMPLEMENTATION TASK.

Mục tiêu là sau khi nhận task, bạn có thể:

Audit
→ Plan
→ Refactor
→ Implement
→ Integrate
→ Test
→ Fix
→ Regression Test
→ Update Documentation
→ Final Report

mà KHÔNG cần người dùng giám sát liên tục.

Không được chỉ phân tích rồi dừng.

Không được chỉ viết plan.

Không được chỉ tạo skeleton rồi báo hoàn thành.

Hãy trực tiếp sửa source code và đưa project tới trạng thái Definition of Done.

---

# 0. TÀI LIỆU PHẢI ĐỌC TRƯỚC

Trước khi sửa code:

1. đọc toàn bộ `PROJECT_CONTEXT.md`;
2. đọc toàn bộ tài liệu:

   `Build Your Own Starprint.docx`

   hoặc tài liệu BUILD YOUR STAR / STARPRINT tương đương có trong workspace;

3. đọc trực tiếp source code hiện tại;
4. đọc package.json;
5. đọc cấu hình TypeScript;
6. đọc cấu hình Vite;
7. đọc CSS architecture;
8. đọc routing;
9. đọc các component nhạy cảm;
10. chạy `git status`.

KHÔNG được dựa hoàn toàn vào `PROJECT_CONTEXT.md`.

`PROJECT_CONTEXT.md` là architectural context.

SOURCE CODE hiện tại mới là nguồn xác nhận implementation thực tế.

Nếu context và code mâu thuẫn về trạng thái hiện tại:

→ tin source code.

Nếu source code hiện tại khác target architecture trong task này:

→ task này là yêu cầu refactor và phải được thực hiện.

---

# 1. THỨ TỰ ƯU TIÊN NGUỒN THÔNG TIN

Khi có ambiguity/conflict, áp dụng thứ tự:

1. yêu cầu explicit trong prompt này;
2. BUILD YOUR STAR / STARPRINT specification;
3. PROJECT_CONTEXT.md;
4. source code hiện tại để xác nhận implementation;
5. conventions đang được dùng trong project;
6. engineering best practices.

Không để một implementation legacy vô tình override target requirement mới.

---

# 2. AUTONOMOUS EXECUTION CONTRACT

Task này được thiết kế để chạy tự động mà không cần người dùng theo dõi liên tục.

Sau khi bắt đầu:

KHÔNG hỏi người dùng những câu hỏi kiểu:

- đặt tên file gì;
- chia component thế nào;
- dùng helper nào;
- animation 300ms hay 400ms;
- folder nên đặt ở đâu nếu convention đã đủ rõ;
- lựa chọn implementation nhỏ;
- CSS implementation detail;
- nên dùng interface hay type trong trường hợp không ảnh hưởng architecture;
- những quyết định kỹ thuật thông thường mà senior engineer có thể tự quyết.

Trong các trường hợp đó:

→ tự chọn giải pháp đơn giản, maintainable và phù hợp codebase nhất.

---

# 3. CHỈ DỪNG KHI GẶP HARD BLOCKER

Chỉ được dừng và yêu cầu người dùng hỗ trợ nếu gặp một trong các trường hợp:

1. cần credential / secret / API key không tồn tại;
2. cần quyền truy cập external service không được cấp;
3. cần thao tác destructive đối với dữ liệu thật;
4. cần migration phá dữ liệu production hiện tại;
5. hai requirement bắt buộc mâu thuẫn và không thể đồng thời thỏa mãn;
6. environment bị giới hạn khiến build/test/implementation không thể tiếp tục;
7. file/source thiết yếu hoàn toàn không tồn tại.

KHÔNG được coi những điều sau là blocker:

- chưa có tên personality type final;
- scoring business chưa final;
- thiếu asset decoration;
- chưa biết animation timing hoàn hảo;
- có nhiều cách tổ chức component;
- có nhiều cách implement algorithm;
- một thư viện optional không tồn tại;
- một UI chi tiết chưa được design pixel-perfect.

Nếu business decision chưa final:

→ tạo deterministic MVP implementation;
→ đặt config centralized;
→ đánh dấu:

`TODO BUSINESS CONFIRMATION`

→ tiếp tục implementation.

---

# 4. MỤC TIÊU KIẾN TRÚC

Project hiện tại là React SPA client-side.

Sau task này kiến trúc phải trở thành:

```text
CLIENT
React + Vite
      │
      │ REST API / Socket.IO
      ▼
SERVER
NestJS
      │
      │ TypeORM
      ▼
PostgreSQL
```

Frontend chịu trách nhiệm:

- UI;
- rendering;
- interaction;
- animation;
- camera capture;
- SVG STARPRINT rendering;
- mini-game runtime;
- temporary game state;
- client-side Final Reveal;
- Three.js 5SS Sky rendering.

Backend chịu trách nhiệm:

- Player Session;
- persistence;
- game result validation;
- game result persistence;
- hidden scoring;
- hidden profile calculation;
- STARPRINT type;
- palette generation;
- consent persistence;
- publish;
- image processing;
- storage abstraction;
- Socket.IO realtime;
- PostgreSQL access.

Không để React trở thành nơi chứa:

```text
UI
+
Persistence
+
Database rules
+
Personality scoring
+
Business rules
```

---

# 5. KHÔNG REWRITE WEBSITE

Đây là architectural refactor.

KHÔNG phải rewrite.

Phải giữ frontend stack đang có:

- React 19;
- Vite;
- TypeScript;
- React Router;
- Tailwind CSS v4;
- Motion for React;
- Lenis;
- Three.js;
- React Three Fiber;
- Drei;
- Lucide React.

Không chuyển sang:

- Next.js;
- Vue;
- Angular;
- Firebase;
- Supabase;
- Prisma;
- MongoDB.

Không redesign toàn website.

Không thay thế những phần hiện tại đã ổn.

---

# 6. PHẢI BẢO TOÀN WEBSITE CŨ

Không gây regression cho:

- Header;
- Footer;
- HomePage;
- JourneyPage;
- ActivitiesPage;
- FAQ;
- Contact;
- LoadingScreen;
- Hero Galaxy;
- Criteria 3D Scene;
- responsive;
- accessibility;
- reduced-motion;
- hash navigation;
- URL-synced activity modal;
- Browser Back behavior;
- Journey checklist;
- LocalStorage Journey progress;
- mobile menu;
- loading/reveal behavior.

---

# 7. BACKEND STACK CHÍNH THỨC

Backend sử dụng:

```text
Node.js
NestJS
TypeScript

REST API

Socket.IO

TypeORM

PostgreSQL

class-validator
class-transformer

Swagger / OpenAPI

Sharp
```

Không dùng:

- Prisma;
- Supabase;
- Firebase;
- MongoDB.

---

# 8. SEPARATION OF CONCERNS

Frontend:

```text
Presentation
↓
Application / Feature Logic
↓
Service / Gateway Contract
↓
HTTP / Storage Adapter
```

Backend:

```text
Controller
↓
Service
↓
Domain Logic
↓
Repository
↓
TypeORM
↓
PostgreSQL
```

Không để React component kiểu:

```text
Component
├── JSX
├── fetch()
├── localStorage
├── scoring
├── persistence
└── domain rules
```

---

# 9. JOURNEY LOCALSTORAGE

Journey checklist hiện tại tiếp tục dùng LocalStorage.

KHÔNG migrate Journey lên backend trong task này.

Nhưng tách LocalStorage khỏi UI.

Kiến trúc:

```text
Journey UI
↓
useJourneyProgress
↓
JourneyProgressRepository
↓
LocalStorageJourneyProgressRepository
```

Contract tương đương:

```ts
export interface JourneyProgressRepository {
  load(): JourneyProgress;
  save(progress: JourneyProgress): void;
  clear(): void;
}
```

Không over-engineer bằng DI container.

Behavior hiện tại phải giữ nguyên.

---

# 10. CONTACT / REGISTRATION FORMS

ContactForm và RegistrationForm hiện đang simulated submit.

Tách:

```text
ContactForm
↓
ContactService
↓
Current adapter
```

và:

```text
RegistrationForm
↓
RegistrationService
↓
Current adapter
```

Không để simulated `setTimeout()` nằm trực tiếp trong React component.

KHÔNG bắt buộc persist Contact/Registration vào DB trong scope này.

STARPRINT là ưu tiên.

---

# 11. APP SHELL REFACTOR

Tách layout thành:

```text
App

├── MarketingShell
│   ├── /
│   ├── /hanh-trinh-5-tot
│   └── /hoat-dong
│
└── GameShell
    ├── /starprint
    ├── /starprint/result/:id
    └── /sky
```

MarketingShell:

```text
Header
Lenis
main
Footer
```

GameShell:

```text
full-screen
no marketing Header
no marketing Footer
no global Lenis dependency
```

GameShell phải có:

- responsive riêng;
- accessibility riêng;
- focus handling;
- reduced-motion support.

---

# 12. LOADING SYSTEM

Existing cinematic LoadingScreen thuộc Marketing experience.

Marketing route vẫn giữ behavior hiện tại.

```text
/
 /hanh-trinh-5-tot
 /hoat-dong

→ existing LoadingScreen
```

Game routes:

```text
/starprint
/starprint/result/:id
/sky
```

KHÔNG phụ thuộc Hero loading/reveal.

Không replay Marketing Hero reveal khi vào STARPRINT.

Nếu STARPRINT cần loader:

→ tạo GameAssetLoader riêng.

---

# 13. STARPRINT DOMAIN

Tạo domain riêng:

```text
src/features/starprint/
```

Không đưa STARPRINT vào:

```text
src/features/journey/
```

Cấu trúc gợi ý:

```text
src/features/starprint/
├── components/
├── games/
│   ├── solve/
│   ├── sense/
│   ├── sprint/
│   ├── support/
│   └── sync/
├── camera/
├── store/
├── services/
├── contracts/
├── types/
├── hooks/
├── config/
└── utils/
```

Có thể điều chỉnh theo convention thực tế.

Không tạo một:

```text
StarprintPage.tsx
```

khổng lồ chứa toàn bộ implementation.

---

# 14. AUTHORITATIVE GAME FLOW

Flow bắt buộc:

```text
INTRO
↓
PLAYER_INFO
↓
CAMERA
↓
SOLVE
↓
SENSE
↓
SPRINT
↓
SUPPORT
↓
SYNC
↓
COLOR_PICKER
↓
GENERATING
↓
FINAL_REVEAL
↓
RESULT
↓
PUBLISH_TO_SKY
```

Không tạo route:

```text
/game1
/game2
/game3
...
```

Toàn bộ 5 game nằm trong controlled game flow.

Không cho phép đổi URL để skip game.

Server phải là authoritative progress state.

---

# 15. AUTHORITATIVE MINI-GAME MAPPING

Mapping cố định:

```text
GAME_01
SOLVE
Học tập tốt

GAME_02
SENSE
Đạo đức tốt

GAME_03
SPRINT
Thể lực tốt

GAME_04
SUPPORT
Tình nguyện tốt

GAME_05
SYNC
Hội nhập tốt
```

Không thay game khác.

---

# 16. SOLVE — HỌC TẬP TỐT

Mechanic:

Quick Logic Puzzle.

MVP implementation:

- 4 câu;
- mỗi câu target khoảng 5 giây;
- tổng khoảng 20–25 giây;
- câu hỏi logic/pattern/observation;
- không phụ thuộc kiến thức chuyên ngành;
- nội dung lấy từ centralized config/question bank.

Ví dụ dạng:

- sequence;
- missing shape;
- pattern;
- quick logic;
- visual observation.

Không hiện personality score.

Có thể hiện:

- success animation;
- progress 1/4, 2/4...

Raw result:

```ts
interface SolveRawResult {
  gameId: "solve";
  answers: Array<{
    questionId: string;
    selectedOptionId: string | null;
    correct: boolean;
    responseTimeMs: number;
  }>;
  correctCount: number;
  totalDurationMs: number;
}
```

Backend phải validate range hợp lý.

Frontend không tính profile.

---

# 17. SENSE — ĐẠO ĐỨC TỐT

Mechanic:

Situation / Decision Game.

MVP:

- 3 situation;
- mỗi situation có 3 option;
- không hiển thị đúng/sai;
- không phán xét người chơi là "đạo đức tốt/xấu".

Nội dung nên xoay quanh:

- collaboration;
- responsibility;
- communication;
- helping others;
- team decisions;
- integrity;

nhưng phải ngắn gọn và phù hợp sinh viên.

Toàn bộ situation/option đặt trong config.

Raw result:

```ts
interface SenseRawResult {
  gameId: "sense";
  decisions: Array<{
    scenarioId: string;
    optionId: string;
    responseTimeMs: number;
  }>;
  totalDurationMs: number;
}
```

Weight/profile mapping chỉ nằm backend config.

---

# 18. SPRINT — THỂ LỰC TỐT

Implementation mặc định:

2D horizontal endless-runner style mini-game.

KHÔNG fallback sang quiz.

Player/mascot:

→ star mascot hoặc simple 5SS star avatar.

Mechanic:

- auto-run;
- tap/click/Space để jump;
- né obstacles;
- thu collectable stars/energy;
- fixed duration;
- không chết/Game Over sớm.

Duration:

```text
20 seconds
```

Collision:

→ giảm performance/energy metric;
→ player vẫn tiếp tục chạy.

Không làm Temple Run phức tạp.

Ưu tiên:

- Canvas 2D;
hoặc
- DOM/SVG nếu implementation clean hơn.

Không cần Three.js.

Raw result:

```ts
interface SprintRawResult {
  gameId: "sprint";
  durationMs: number;
  obstaclesEncountered: number;
  obstaclesAvoided: number;
  collisions: number;
  collectiblesAvailable: number;
  collectiblesCollected: number;
  jumpCount: number;
}
```

---

# 19. SUPPORT — TÌNH NGUYỆN TỐT

Chốt implementation:

SUPPORT: CONNECT.

KHÔNG dùng Cut.

KHÔNG dùng Guide trong current implementation.

Mechanic:

Grid rotation puzzle.

MVP:

- grid 4x4;
- Source;
- Target;
- các path tile;
- tap/click tile → rotate 90°;
- goal = tạo continuous path Source → Target.

Không cần physics.

Khi path hoàn thành:

→ animate light travelling Source → Target.

Duration target:

```text
20–25 seconds
```

Có thể kết thúc sớm nếu hoàn thành.

Nếu hết thời gian:

→ vẫn ghi raw result;
→ không block toàn game;
→ cho phép flow tiếp tục.

Raw result:

```ts
interface SupportRawResult {
  gameId: "support";
  completed: boolean;
  rotations: number;
  elapsedMs: number;
}
```

Puzzle layout phải deterministic/configurable.

Không để component chứa puzzle definition hard-coded rải rác.

---

# 20. SYNC — HỘI NHẬP TỐT

Chốt implementation MVP:

Fast Memory / Matching Game.

Board:

```text
8 cards
4 pairs
```

Các pair đại diện cho:

- pattern;
- symbol;
- communication;
- related concepts;

không biến thành geography exam.

Duration:

```text
20–25 seconds
```

Mechanic:

- tap card;
- reveal;
- match pair;
- mismatch → flip back;
- finish khi đủ 4 pair hoặc timeout.

Raw result:

```ts
interface SyncRawResult {
  gameId: "sync";
  pairsTotal: number;
  pairsMatched: number;
  mismatches: number;
  flips: number;
  elapsedMs: number;
  completed: boolean;
}
```

---

# 21. GAME DURATION TARGET

Target toàn experience:

```text
Nickname + Camera:     ~20–30s
SOLVE:                 ~20–25s
SENSE:                 ~20–30s
SPRINT:                ~20s
SUPPORT:               ~20–25s
SYNC:                  ~20–25s
Color Picker:          ~10–15s
Reveal + Publish:      ~15–20s
```

Target tổng:

```text
~3 minutes
```

Không được làm animation khiến experience kéo dài vô lý.

---

# 22. MINI-GAME CONTRACT

Tạo contract chung.

Ví dụ:

```ts
interface MiniGameResult<T = unknown> {
  gameId: StarprintGameId;
  rawResult: T;
}
```

Mỗi game phải:

- render độc lập;
- nhận callback hoàn thành;
- trả raw result;
- cleanup timers;
- cleanup RAF;
- cleanup listeners.

Không cho game tự gọi scoring engine.

---

# 23. ZUSTAND

Chỉ dùng Zustand cho STARPRINT.

Không migrate toàn website sang Zustand.

State có thể tương đương:

```ts
interface StarprintGameState {
  sessionId: string | null;
  nickname: string;
  photoPreviewUrl: string | null;

  currentStep: StarprintStep;

  completedGameIds: StarprintGameId[];

  gameResults: MiniGameResult[];

  selectedColor: string | null;

  starprint: StarprintResult | null;
}
```

Zustand chỉ là:

```text
temporary client state
```

Không phải source of truth.

Backend/database authoritative.

---

# 24. NETWORK / REFRESH RECOVERY

Persist tối thiểu trong:

```text
sessionStorage
```

chỉ những dữ liệu cần recovery:

```text
sessionId
```

Có thể lưu thêm currentStep để UX nhanh hơn.

Nhưng sau reload:

```text
sessionStorage sessionId
↓
GET /api/sessions/:id
↓
server state
↓
derive legitimate current step
```

Không tin client currentStep tuyệt đối.

Ví dụ:

server có:

```text
solve
sense
sprint
```

đã hoàn thành

→ reload phải tiếp tục SUPPORT.

Không quay về SOLVE.

---

# 25. FRONTEND KHÔNG TÍNH PERSONALITY

Tuyệt đối không có trong React:

```ts
focus += 10;
social += 5;
energy += 2;
```

Không có:

- personality calculation;
- hidden profile;
- type assignment;
- profile weighting;

ở frontend.

Frontend:

```text
Interaction
↓
Raw Result
↓
API
```

Backend:

```text
Raw Result
↓
Scoring Engine
↓
Profile
↓
Type Engine
↓
Palette Engine
```

---

# 26. HIDDEN PROFILE DIMENSIONS

MVP profile dimensions:

```text
focus
explore
energy
social
adapt
```

Normalized:

```text
0..100
```

Architecture phải cho phép đổi scoring config sau này.

Không hard-code magic number trực tiếp trong service.

Tạo centralized backend config.

Ví dụ:

```text
server/src/games/scoring/
server/src/starprints/domain/
```

hoặc cấu trúc tương đương.

---

# 27. MVP SCORING POLICY

Scoring này là deterministic MVP gameplay mapping.

Không tuyên bố đây là psychological assessment khoa học.

Code/documentation phải ghi rõ:

```text
MVP gameplay profile mapping.
TODO BUSINESS CONFIRMATION before treating as final personality model.
```

Implementation phải deterministic:

```text
same raw inputs
→ same profile
→ same type
→ same palette
```

Không dùng random cho scoring.

---

# 28. SOLVE PROFILE CONTRIBUTION

SOLVE chủ yếu ảnh hưởng:

```text
focus
explore
```

Tính performance từ:

- accuracy;
- response speed.

Normalize kết quả về:

```text
0..100
```

Sau đó đóng góp:

```text
focus   = 65%
explore = 35%
```

Không tính ở frontend.

---

# 29. SENSE PROFILE CONTRIBUTION

Mỗi option trong SENSE có vector config.

Ví dụ structure:

```ts
{
  focus: number;
  explore: number;
  energy: number;
  social: number;
  adapt: number;
}
```

Mỗi giá trị:

```text
0..1
```

Các option không được label "good/bad".

Sau 3 scenario:

→ average vectors.

Scenario text + vector mapping đều centralized.

---

# 30. SPRINT PROFILE CONTRIBUTION

SPRINT chủ yếu ảnh hưởng:

```text
energy
adapt
```

Dựa trên:

- obstacle avoidance ratio;
- collision ratio;
- collectible ratio.

Contribution target:

```text
energy = 60%
adapt  = 40%
```

Clamp kết quả 0..100.

---

# 31. SUPPORT PROFILE CONTRIBUTION

SUPPORT chủ yếu ảnh hưởng:

```text
social
focus
```

Dựa trên:

- puzzle completion;
- rotations efficiency;
- elapsed time.

Target:

```text
social = 55%
focus  = 45%
```

---

# 32. SYNC PROFILE CONTRIBUTION

SYNC chủ yếu ảnh hưởng:

```text
social
adapt
```

Dựa trên:

- matched ratio;
- mismatch ratio;
- completion speed.

Target:

```text
social = 50%
adapt  = 50%
```

---

# 33. FINAL PROFILE AGGREGATION

Sau 5 games:

Aggregate contribution của các game.

Normalize cuối cùng:

```ts
interface HiddenProfile {
  focus: number;
  explore: number;
  energy: number;
  social: number;
  adapt: number;
}
```

range:

```text
0..100
```

Nếu tied dimension:

dùng deterministic tie-breaking order:

```text
focus
explore
energy
social
adapt
```

Không random tie breaker.

---

# 34. STARPRINT TYPE ENGINE

MVP có 5 type.

Centralized config.

Không hard-code tên ở nhiều component.

Working names:

```text
NAVIGATOR
EXPLORER
CATALYST
CONNECTOR
VISIONARY
```

Mapping:

```text
focus   → NAVIGATOR
explore → EXPLORER
energy  → CATALYST
social  → CONNECTOR
adapt   → VISIONARY
```

Đây là working MVP naming.

Đánh dấu:

```text
TODO BUSINESS CONFIRMATION
```

nhưng implementation vẫn phải chạy hoàn chỉnh.

Mỗi type config:

```ts
interface StarTypeDefinition {
  id: string;
  displayName: string;
  description: string;
  effect: StarEffect;
}
```

---

# 35. EFFECT MAPPING

Mapping deterministic:

```text
NAVIGATOR → FLOW
EXPLORER  → SHIMMER
CATALYST  → SPARK
CONNECTOR → ORBIT
VISIONARY → PULSE
```

Tất cả mapping đặt trong backend/domain config hoặc shared rendering config phù hợp.

Server trả effect ID.

Client render effect.

---

# 36. COLOR ENGINE

Sau 5 game player chọn:

```text
baseColor
```

Frontend gửi baseColor.

Backend kết hợp:

```text
baseColor
+
hidden profile
```

→ tạo:

```text
palette[5]
```

Không dùng AI.

Ưu tiên OKLCH.

Có thể sử dụng:

```text
culori
```

nếu hợp lý.

Nếu không cần dependency mới, có thể tự implement utility clean.

Requirements:

- deterministic;
- same input → same output;
- giữ gamut hợp lý;
- tránh quá tối;
- tránh quá sáng;
- tránh saturation cực đoan;
- tránh 5 màu gần như giống nhau;
- đảm bảo contrast/render đẹp trên dark background.

Backend trả 5 màu.

Frontend không tự generate palette.

---

# 37. STARPRINT SVG ENGINE

STARPRINT chính dùng:

```text
SVG
+
Motion
+
CSS
```

KHÔNG dùng Three.js cho ngôi sao chính.

Structure:

```text
           Wing 1

Wing 5                Wing 2

          PHOTO

Wing 4                Wing 3
```

5 cánh có cùng geometry.

Không dùng kích thước cánh để biểu diễn personality.

Personalization đến từ:

- palette;
- gradient;
- pattern;
- glow;
- effect;
- photo.

Initial:

```text
5 inactive wings
```

Sau mỗi game:

```text
corresponding wing
→ Soft Gold completed state
```

Sau 5 games:

```text
★★★★★
```

Final Reveal:

```text
Soft Gold
→ personal palette
```

SVG phải hỗ trợ:

- responsive scaling;
- gradients;
- clipPath/mask;
- center photo;
- glow;
- patterns;
- animation;
- future image export.

---

# 38. FINAL REVEAL

Final Reveal hoàn toàn client-side.

Flow:

```text
5 gold wings
↓
short anticipation
↓
core glow
↓
palette transformation
↓
pattern reveal
↓
type effect
↓
photo reveal
↓
nickname
↓
type name
↓
description
```

Không render video server-side.

Dùng:

- Motion;
- SVG;
- CSS.

Reduced Motion:

→ không được mất thông tin;
→ chỉ giảm/chuyển animation thành instant/fade.

Không ép người dùng chờ animation quá dài.

---

# 39. CAMERA FLOW

Client:

```text
navigator.mediaDevices.getUserMedia()
```

Flow:

```text
Camera
↓
Preview
↓
Capture
↓
Blob
↓
Multipart upload
```

Camera component phải cleanup MediaStream khi:

- capture xong;
- chuyển step;
- unmount;
- error.

Không lưu ảnh base64 dài hạn vào LocalStorage.

Nếu camera:

- denied;
- unsupported;
- unavailable;

thì cung cấp fallback:

```text
Upload photo from device
```

Game không được dead-end chỉ vì camera permission bị từ chối.

---

# 40. IMAGE UPLOAD API

Implement:

```http
POST /api/sessions/:sessionId/photo
```

Content-Type:

```text
multipart/form-data
```

Field:

```text
file
```

Accepted MIME:

```text
image/jpeg
image/png
image/webp
```

Maximum input size:

```text
5 MB
```

Backend dùng Sharp:

- decode/validate;
- resize;
- auto rotate;
- compress;
- convert WebP;
- strip unnecessary metadata.

Target output:

- max dimension khoảng 1024px;
- quality phù hợp web;
- storage-safe filename.

Response:

```json
{
  "photoUrl": "/..."
}
```

Không lưu binary vào PostgreSQL.

---

# 41. MEDIA STORAGE ABSTRACTION

Tạo interface tương đương:

```ts
interface MediaStorage {
  upload(input: MediaUploadInput): Promise<StoredMedia>;
  delete(key: string): Promise<void>;
}
```

Không lock domain logic vào local disk/cloud provider.

Current development adapter:

```text
LocalMediaStorage
```

Production provider chưa chốt.

Phải configurable bằng environment.

Không tự tích hợp một paid service hoặc yêu cầu credential khi chưa được cấp.

---

# 42. BACKEND STRUCTURE

Tạo:

```text
server/
```

Gợi ý:

```text
server/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   ├── database/
│   ├── sessions/
│   ├── games/
│   │   ├── scoring/
│   │   └── ...
│   ├── starprints/
│   ├── uploads/
│   ├── sky/
│   └── common/
│
├── test/
├── package.json
├── tsconfig.json
└── ...
```

Không bắt buộc y nguyên nếu codebase convention khác tốt hơn.

---

# 43. DATABASE MODEL

PostgreSQL tối thiểu:

```text
PlayerSession
     │
     ├── GameResult
     │
     └── Starprint
```

---

# 44. PLAYER SESSION ENTITY

Fields tối thiểu:

```text
id UUID PK

nickname varchar

photoUrl nullable

status

createdAt
updatedAt
```

Suggested status:

```text
IN_PROGRESS
READY_TO_GENERATE
GENERATED
PUBLISHED
```

Không dùng client làm authoritative status.

---

# 45. GAME RESULT ENTITY

```text
id UUID PK

sessionId FK

gameId

rawResult JSONB

createdAt
```

Unique constraint:

```text
(sessionId, gameId)
```

Không cho duplicate legitimate submission.

---

# 46. STARPRINT ENTITY

```text
id UUID PK

sessionId FK UNIQUE

baseColor

palette JSONB

type

effect

isPublic

consentPhoto
consentName

createdAt
updatedAt
```

Không cần lưu hidden profile nếu có thể derive cleanly.

Nếu lựa chọn persist profile để:

- audit;
- deterministic historical output;
- versioning;

thì phải giải thích trong documentation.

Không lưu ảnh binary trong DB.

---

# 47. TYPEORM

Dùng migrations.

KHÔNG:

```ts
synchronize: true
```

trong production config.

Có thể bật synchronize chỉ trong test environment nếu thật sự hợp lý, nhưng migrations vẫn là source cho normal environments.

---

# 48. SESSION API

Implement:

```http
POST /api/sessions
GET /api/sessions/:id
```

Create:

```json
{
  "nickname": "Minh"
}
```

Validation:

- trim;
- 1–24 visible characters;
- reject empty string;
- reject unreasonable payload.

Response create:

```json
{
  "id": "uuid",
  "nickname": "Minh",
  "status": "IN_PROGRESS"
}
```

GET session phải trả đủ dữ liệu để restore flow:

```json
{
  "id": "...",
  "nickname": "Minh",
  "photoUrl": "...",
  "status": "IN_PROGRESS",
  "completedGameIds": [
    "solve",
    "sense"
  ],
  "starprintId": null
}
```

Không trả hidden profile.

---

# 49. GAME RESULT API

Implement:

```http
POST /api/sessions/:sessionId/games/:gameId
```

Request:

```json
{
  "rawResult": {}
}
```

Backend phải:

1. validate session;
2. validate game id;
3. validate expected game order;
4. validate raw result shape;
5. reject duplicate;
6. persist result;
7. calculate completed progress;
8. update session state khi cần.

Không tin client field:

```text
correct
```

một cách mù quáng nếu server có question config.

Đối với SOLVE:

server nên derive correctness từ:

```text
questionId + selectedOptionId
```

thay vì tin `correct` do browser gửi.

Raw payload có thể chứa client-side `correct` cho UI/debug nhưng backend authoritative.

---

# 50. GAME ORDER VALIDATION

Server enforce:

```text
solve
↓
sense
↓
sprint
↓
support
↓
sync
```

Không cho:

```text
sync
```

submit khi SOLVE chưa hoàn thành.

Nếu state invalid:

return domain error.

---

# 51. STARPRINT GENERATION API

Implement:

```http
POST /api/starprints/generate
```

Request:

```json
{
  "sessionId": "...",
  "baseColor": "#8B5CF6"
}
```

Server:

```text
validate session
↓
verify all 5 games
↓
load results
↓
calculate hidden profile
↓
determine type
↓
generate palette
↓
determine effect
↓
persist Starprint
↓
update session
↓
return render data
```

Response:

```json
{
  "id": "...",
  "nickname": "Minh",
  "photoUrl": "...",
  "type": {
    "id": "explorer",
    "name": "The Explorer",
    "description": "..."
  },
  "effect": "shimmer",
  "palette": [
    "#...",
    "#...",
    "#...",
    "#...",
    "#..."
  ]
}
```

KHÔNG trả:

- hidden profile;
- scoring internals;
- raw weight matrix.

---

# 52. GET STARPRINT API

Implement:

```http
GET /api/starprints/:id
```

Dùng cho result page và refresh.

Chỉ trả public/render-safe fields.

Nếu chưa public, owner session vẫn cần xem result trong current flow.

Vì không có login trong current scope, có thể dùng simple session ownership mechanism phù hợp project MVP hoặc cho result lookup theo UUID unguessable identifier.

Không over-engineer authentication.

---

# 53. RESULT PAGE

Route:

```text
/starprint/result/:id
```

Phải có:

- STARPRINT visual;
- photo;
- nickname;
- personality type;
- description;
- palette/effect;
- CTA publish;
- CTA restart/new star nếu phù hợp;
- save/share nếu implement cleanly.

Không hiển thị:

- raw scores;
- hidden profile;
- scoring matrix.

---

# 54. CONSENT

Trước khi publish:

UI bắt buộc hỏi:

```text
Cho phép hiển thị STARPRINT của bạn trên 5SS Sky.

[ ] Hiển thị nickname
[ ] Hiển thị ảnh
```

Có thể publish Starprint mà:

```text
consentName = false
consentPhoto = false
```

nếu product UX vẫn muốn anonymous star.

Backend lưu authoritative consent.

Không chỉ lưu LocalStorage.

---

# 55. PUBLISH API

Implement:

```http
POST /api/starprints/:id/publish
```

Request:

```json
{
  "consentName": true,
  "consentPhoto": true
}
```

Server:

```text
validate starprint
↓
validate consent payload
↓
persist consent
↓
set public
↓
commit transaction
↓
emit realtime event
```

Chỉ emit Socket.IO sau DB success.

---

# 56. SKY API

Implement:

```http
GET /api/sky
```

Response chỉ chứa public stars.

Ví dụ:

```ts
interface SkyStar {
  id: string;
  palette: string[];
  type: string;
  effect: string;

  nickname?: string;
  photoUrl?: string;

  createdAt: string;
}
```

Chỉ include nickname nếu:

```text
consentName = true
```

Chỉ include photo nếu:

```text
consentPhoto = true
```

---

# 57. SOCKET.IO

Backend:

```text
NestJS Gateway
+
Socket.IO
```

Event:

```text
star.created
```

Payload:

```ts
interface StarCreatedEvent {
  star: SkyStar;
}
```

Flow:

```text
publish
↓
DB commit
↓
star.created
↓
Sky client receives
↓
new star animation
```

Không emit trước persistence.

---

# 58. SOCKET CLIENT

Tách socket logic khỏi React rendering.

Ví dụ:

```text
src/features/starprint/services/skySocket.ts
```

Phải xử lý:

- connection;
- reconnect;
- disconnect;
- subscription cleanup;
- duplicate listeners.

Không tạo socket mới mỗi React render.

---

# 59. SKY PAGE

Route:

```text
/sky
```

Initial:

```text
GET /api/sky
```

Realtime:

```text
star.created
```

Rendering:

```text
React
+
React Three Fiber
+
Three.js
```

Tạo scene:

```text
StarSkyScene
```

Three.js chỉ nhận render data.

Không fetch DB trực tiếp trong Scene.

Không scoring trong Scene.

---

# 60. SKY PERFORMANCE

Reuse performance pattern hiện có:

- controlled DPR;
- mobile particle reduction;
- `prefers-reduced-motion`;
- pause/throttle khi không visible nếu phù hợp;
- lazy-load scene;
- avoid excessive postprocessing;
- cleanup resources.

Không preload Sky Three.js assets khi player đang chơi SOLVE.

---

# 61. CENTRALIZED API CLIENT

Tạo frontend API layer.

Ví dụ:

```text
src/services/http/
├── apiClient.ts
├── apiError.ts
└── types.ts
```

Base URL:

```ts
import.meta.env.VITE_API_URL
```

Không hardcode:

```text
http://localhost:3000
```

trong React component.

Feature service:

```text
starprintApi
```

sử dụng centralized client.

---

# 62. ENVIRONMENT CONFIG

Frontend:

```text
.env.example
```

tối thiểu:

```env
VITE_API_URL=http://localhost:3000/api
```

Backend:

```text
server/.env.example
```

tối thiểu:

```env
PORT=3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/5ss

CLIENT_ORIGIN=http://localhost:5173

MEDIA_STORAGE=local
MEDIA_LOCAL_DIR=uploads
```

Không commit secret thật.

Không hard-code production credentials.

---

# 63. LOCAL DEVELOPMENT

Project phải có documentation đủ để developer chạy:

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd server
npm install
npm run migration:run
npm run start:dev
```

PostgreSQL:

document rõ:

- DB requirement;
- database creation;
- DATABASE_URL.

Nếu Docker có sẵn và thêm một `docker-compose` đơn giản giúp local development đáng kể thì có thể thêm PostgreSQL compose.

Nhưng:

- không bắt Docker nếu environment hiện tại không dùng;
- không over-engineer container infrastructure.

---

# 64. CORS

Backend phải config CORS từ environment:

```text
CLIENT_ORIGIN
```

Không dùng:

```text
origin: "*"
```

cho production assumptions nếu không cần.

---

# 65. SWAGGER

Expose:

```text
/api/docs
```

Document:

- endpoints;
- DTO;
- response;
- domain errors.

---

# 66. ERROR CONTRACT

Không để frontend chỉ nhận generic:

```text
500 Internal Server Error
```

Domain error codes tối thiểu:

```text
SESSION_NOT_FOUND

INVALID_GAME

INVALID_GAME_STATE

GAME_ALREADY_SUBMITTED

INVALID_GAME_RESULT

PHOTO_REQUIRED

UPLOAD_INVALID

NOT_ALL_GAMES_COMPLETED

STARPRINT_ALREADY_GENERATED

STARPRINT_NOT_FOUND

CONSENT_INVALID
```

API response có structure consistent.

Ví dụ:

```json
{
  "statusCode": 409,
  "code": "GAME_ALREADY_SUBMITTED",
  "message": "This game has already been submitted."
}
```

Frontend mapping lỗi thành message phù hợp.

Không expose production stack trace.

---

# 67. VALIDATION

Global NestJS ValidationPipe.

Dùng:

- class-validator;
- class-transformer.

Validate:

- nickname;
- UUID;
- game ID;
- raw result;
- ranges;
- baseColor;
- image MIME;
- image size;
- consent.

Base color chỉ nhận format hợp lệ.

Không trust arbitrary JSONB.

Mỗi rawResult phải có DTO/parser tương ứng.

---

# 68. RATE LIMITING

Nếu có thể thêm rate limiting basic mà không gây complexity lớn:

→ làm.

Nếu dependency hiện tại hoặc environment khiến không đáng:

→ không over-engineer;
→ ghi technical debt.

Không thêm auth/login chỉ vì muốn chống abuse.

---

# 69. KHÔNG LÀM LOGIN

Không thêm:

- account;
- password;
- JWT authentication;
- OAuth;
- admin panel.

Player session UUID đủ cho current scope.

---

# 70. SHARED CONTRACTS

Frontend và backend không được drift contract tùy tiện.

Nếu cùng repository, có thể tạo:

```text
shared/
```

cho:

- enums;
- API-safe types;
- game IDs;
- result DTO interfaces;

nếu làm vậy đơn giản.

Không biến project thành monorepo phức tạp chỉ để share vài type.

---

# 71. CSS / DESIGN SYSTEM

STARPRINT kế thừa Bright Dreamy Cosmic.

Giữ identity:

- Deep Cobalt;
- University Blue;
- Sky Cyan;
- Soft Gold;
- Mint;
- Lavender.

Không tạo design system mới cạnh tranh với website hiện tại.

Initial wing:

```text
inactive
```

Completed:

```text
Soft Gold
```

Final:

```text
Personal Palette
```

Nếu thêm CSS:

```text
starprint.css
game.css
```

hoặc module tương đương.

Phải đưa vào cascade có chủ đích.

Không phá:

- theme-5ss.css;
- responsive.css;
- journey.css.

---

# 72. MASCOT

Nếu cần mascot cho SPRINT/UI:

dùng một simple five-point rounded star mascot.

Có thể thêm:

- gradient blue scarf;
- small light stick;
- subtle facial expression.

Không dành quá nhiều thời gian thiết kế mascot.

Gameplay và architecture quan trọng hơn mascot polish.

Không để thiếu mascot asset trở thành blocker.

Có thể dùng SVG/CSS simple mascot tự tạo trong code.

---

# 73. RESPONSIVE

STARPRINT mobile-first.

Test ít nhất các widths:

```text
320
360
375
390
430
768
1024
1366
1920
```

Requirements:

- zero horizontal overflow;
- touch target đủ lớn;
- không phụ thuộc hover;
- text readable;
- camera usable portrait;
- color picker usable;
- game controls usable bằng thumb;
- result readable;
- Sky fallback hợp lý.

Pointer Events support:

```text
mouse
touch
pen
```

---

# 74. ACCESSIBILITY

Phải giữ:

```text
prefers-reduced-motion
```

Game cần:

- semantic button;
- focus-visible;
- ARIA label;
- readable text;
- keyboard fallback nếu mechanic cho phép;
- không truyền thông tin chỉ qua màu;
- visible game state.

SPRINT keyboard:

```text
Space / ArrowUp
```

SUPPORT/SYNC:

keyboard interaction nếu implementation không quá phức tạp.

Camera phải có upload fallback.

Final Reveal reduced-motion vẫn hiển thị đầy đủ kết quả.

---

# 75. PERFORMANCE

Mục tiêu:

- load nhanh tại booth;
- mobile ổn;
- avoid unnecessary WebGL;
- lazy-load heavy modules;
- lazy-load `/sky`;
- cleanup RAF;
- cleanup intervals;
- cleanup listeners;
- cleanup camera stream;
- cleanup Socket.IO;
- revoke temporary object URLs;
- avoid memory leak.

Không đưa Three.js vào 5 mini-game nếu không cần.

SPRINT ưu tiên Canvas 2D/SVG/DOM.

STARPRINT chính là SVG.

Sky mới dùng Three.js.

---

# 76. SECURITY

Không over-engineer.

Nhưng tối thiểu:

- input validation;
- UUID validation;
- file validation;
- bounded JSON;
- safe filename;
- no stack trace production;
- controlled CORS;
- database constraints;
- no arbitrary path write;
- no base64 DB;
- no secrets in repo.

---

# 77. GIT SAFETY

Trước khi sửa:

```bash
git status
```

Phải preserve unrelated changes.

TUYỆT ĐỐI KHÔNG:

```bash
git reset --hard
git clean -fd
git checkout -- .
git restore .
force checkout
force push
```

Không xóa code người dùng.

Không overwrite unrelated work.

Không push remote.

Không deploy production.

Không thay repository remote.

Không commit nếu task/environment không yêu cầu.

Nếu commit được phép:

→ logical commits;
→ vẫn không push.

---

# 78. IMPLEMENTATION ORDER

Không code ngẫu nhiên.

Thực hiện đúng thứ tự sau.

---

## PHASE 1 — PRE-REFACTOR AUDIT

Đọc source.

Map:

```text
File
Current Responsibility
Coupling
Risk
Decision
```

Audit:

- routing;
- AppShell;
- LoadingContext;
- LoadingScreen;
- LocalStorage;
- forms;
- browser side effects;
- Three.js;
- CSS cascade;
- mobile behavior;
- build scripts;
- git state.

Không cần gửi user để xin duyệt.

Tự tiếp tục.

---

## PHASE 2 — SAFE CLIENT ARCHITECTURE REFACTOR

Implement:

- MarketingShell;
- GameShell;
- Journey repository boundary;
- Contact service boundary;
- Registration service boundary;
- centralized HTTP foundation.

Sau Phase này:

existing website phải vẫn build/run.

Chạy verification.

Nếu regression:

→ sửa trước khi tiếp tục.

---

## PHASE 3 — STARPRINT FLOW SKELETON

Dựng full controlled flow trước.

Có thể dùng temporary dummy completion UI:

```text
Intro
Player Info
Camera placeholder
Game 1
Game 2
Game 3
Game 4
Game 5
Color
Generate placeholder
Reveal
Result
```

Mục đích:

prove navigation/state architecture.

Không polish game lúc này.

---

## PHASE 4 — BACKEND SKELETON

Create NestJS server.

Implement:

- config;
- database;
- TypeORM;
- entities;
- migrations;
- sessions;
- games;
- starprints;
- uploads;
- sky;
- Swagger;
- error handling.

Backend phải build trước khi tiếp tục.

---

## PHASE 5 — API INTEGRATION

Connect frontend:

- create session;
- recover session;
- photo upload;
- game submit;
- generate starprint;
- load result;
- publish;
- initial sky.

End-to-end skeleton phải chạy.

---

## PHASE 6 — DOMAIN ENGINES

Implement:

- scoring;
- profile;
- type engine;
- palette engine;
- deterministic tests.

Không phụ thuộc UI.

---

## PHASE 7 — REAL MINI-GAMES

Replace dummy games lần lượt:

1. SOLVE
2. SENSE
3. SPRINT
4. SUPPORT
5. SYNC

Sau mỗi game:

- test;
- verify cleanup;
- verify mobile;
- verify result contract.

Không thay shared contract tùy tiện.

---

## PHASE 8 — REAL CAMERA + MEDIA PIPELINE

Implement:

- getUserMedia;
- capture;
- preview;
- upload fallback;
- Sharp;
- storage adapter;
- session photo update.

---

## PHASE 9 — FINAL REVEAL + RESULT

Implement:

- SVG Star;
- gold wing completion;
- personal palette;
- type effect;
- photo;
- nickname;
- result page;
- consent UI.

---

## PHASE 10 — REALTIME SKY

Implement:

- GET `/api/sky`;
- Socket Gateway;
- `star.created`;
- Sky page;
- StarSkyScene;
- realtime spawn animation;
- reconnect cleanup.

---

## PHASE 11 — QA / OPTIMIZATION

Test:

- refresh recovery;
- network error;
- camera denied;
- duplicate submit;
- invalid flow;
- reduced motion;
- mobile;
- desktop;
- memory cleanup;
- regression old site.

---

## PHASE 12 — DOCUMENTATION

Update:

```text
PROJECT_CONTEXT.md
README.md
.env.example
server/.env.example
```

PROJECT_CONTEXT must reflect implementation THẬT.

---

# 79. KHÔNG BẮT ĐẦU BẰNG GAME POLISH

Nguyên tắc bắt buộc:

Trước khi polish SOLVE/SPRINT:

prove:

```text
Session
↓
Photo
↓
5 game result submissions
↓
Generate
↓
Result
↓
Publish
↓
Socket event
↓
Sky
```

hoạt động.

Correct architecture trước visual polish.

---

# 80. TEST / VERIFICATION FRONTEND

Chạy các script thực tế tương ứng.

Tối thiểu nếu project đang có:

```bash
npm run typecheck
npm run lint
npm run build
```

Nếu script name khác:

→ đọc `package.json`;
→ dùng script tương ứng.

Không disable rule chỉ để build xanh.

Phân biệt:

```text
pre-existing warning
vs
new regression
```

Không nhận warning legacy là lỗi do task nếu nó đã tồn tại trước.

Nhưng không tạo warning/error mới.

---

# 81. TEST / VERIFICATION BACKEND

Backend phải chạy:

```text
typecheck
lint
build
tests
```

Test tối thiểu:

1. session creation;
2. invalid session;
3. game order;
4. duplicate game result;
5. complete 5-game flow;
6. generation before five games → reject;
7. successful Starprint generation;
8. deterministic scoring;
9. deterministic type;
10. deterministic palette;
11. photo validation;
12. publish;
13. consent privacy;
14. sky public filtering.

---

# 82. RETRY POLICY

Nếu verification fail:

1. đọc error đầy đủ;
2. xác định root cause;
3. sửa root cause;
4. chạy lại relevant verification;
5. chạy final full verification.

Không:

- comment test;
- skip test;
- disable TypeScript strictness;
- thêm `any` bừa;
- thêm eslint/oxlint ignore bừa;
- xóa functionality để build pass.

---

# 83. TYPE SAFETY

Strict TypeScript.

Tránh:

```ts
any
```

Nếu raw payload chưa parsed:

```ts
unknown
```

sau đó validate/narrow.

Không:

```ts
as SomeType
```

bừa để né type system.

---

# 84. MANUAL REGRESSION — EXISTING WEBSITE

Kiểm tra:

```text
/
 /hanh-trinh-5-tot
 /hoat-dong
```

và:

- Header;
- Footer;
- loading;
- Hero;
- Criteria;
- FAQ;
- Contact;
- Journey;
- Journey LocalStorage;
- Activities modal;
- URL query;
- Browser Back;
- hash navigation;
- mobile menu;
- reduced motion.

---

# 85. STARPRINT REGRESSION

Kiểm tra:

```text
/starprint
/starprint/result/:id
/sky
```

Flow test:

```text
Intro
→ Nickname
→ Camera
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
→ Sky
```

---

# 86. REFRESH TEST

Refresh tại ít nhất:

- before Game 1;
- after Game 2;
- before Generate;
- Result page;
- Sky page.

Expected:

- không corrupt state;
- không duplicate results;
- restore từ backend hợp lý.

---

# 87. CAMERA FAILURE TEST

Simulate camera denied/unavailable.

Expected:

```text
Upload from device
```

phải cho flow tiếp tục.

Không dead-end.

---

# 88. NETWORK FAILURE

Nếu API request fail:

- show retryable error;
- không duplicate submit khi user retry;
- giữ temporary UX state hợp lý;
- không silently mark game completed khi server chưa persist.

Backend authoritative.

---

# 89. DATABASE CONCURRENCY

Use database constraint/service logic để tránh:

```text
double click
→ two GameResult rows
```

và:

```text
two generate requests
→ two Starprints
```

Design idempotency/concurrency reasonably.

Không cần distributed architecture.

---

# 90. FILES NHẠY CẢM

Đặc biệt cẩn thận trước khi sửa:

```text
LoadingScreen.tsx
LoadingContext.tsx

AppShell.tsx
Header.tsx
Footer.tsx

JourneyMap.tsx
useJourneyProgress.ts
journeyCoordinates.ts

ActivitiesPage.tsx

theme-5ss.css
responsive.css
journey.css

HeroGalaxyScene.tsx
Criteria3DScene.tsx
```

Đọc dependencies/callers trước khi thay đổi.

---

# 91. PROJECT_CONTEXT UPDATE

Sau implementation phải cập nhật `PROJECT_CONTEXT.md`.

File phải phản ánh:

- client/server architecture;
- frontend responsibilities;
- backend responsibilities;
- final folder structure;
- MarketingShell;
- GameShell;
- STARPRINT;
- Zustand;
- HTTP client;
- API endpoints;
- Socket.IO;
- TypeORM entities;
- PostgreSQL schema;
- migrations;
- scoring engine;
- type engine;
- palette engine;
- SVG renderer;
- 5 games;
- camera;
- image pipeline;
- storage adapter;
- Sky;
- env;
- local development;
- placeholders;
- technical debt;
- deployment assumptions;
- verification status.

Không để context tiếp tục ghi project là:

```text
Pure Client-Side Static Website
```

sau khi backend đã tồn tại.

---

# 92. README

README cuối cùng phải hướng dẫn bằng tiếng Anh:

- prerequisites;
- frontend install;
- backend install;
- PostgreSQL setup;
- env setup;
- migrations;
- development;
- production builds;
- important routes;
- Swagger;
- storage development behavior.

Không đưa secret vào README.

---

# 93. KHÔNG DEPLOY

Task này chỉ implementation.

KHÔNG:

- deploy Vercel;
- deploy Render;
- deploy VPS;
- push GitHub;
- thay DNS;
- tạo cloud database thật;

trừ khi người dùng explicit yêu cầu trong task khác.

Code phải deployment-ready nhưng không tự deploy.

---

# 94. PLACEHOLDER POLICY

Các phần hiện đang MVP/provisional:

- 5 personality names;
- exact psychometric meaning;
- scoring weights;
- type descriptions;
- final production storage provider;
- final event content.

Nhưng chúng KHÔNG được làm implementation dở dang.

Hệ thống phải chạy bằng deterministic MVP config.

Mọi placeholder:

- centralized;
- documented;
- dễ thay;
- không hard-code rải khắp UI.

---

# 95. SCOPE CONTROL

Không mở rộng sang:

- login;
- admin dashboard;
- analytics platform;
- leaderboard;
- email system;
- CMS;
- social network;
- payment;
- complex cloud deployment;
- user account;
- AI generation.

trừ khi bắt buộc để STARPRINT hoạt động.

---

# 96. PRIORITY

Nếu phải trade-off:

```text
1. Correct architecture
2. End-to-end working flow
3. Data integrity
4. No regression
5. Mobile usability
6. Performance
7. Accessibility
8. Visual quality
9. Extra polish
```

Không hy sinh architecture để animation đẹp hơn.

---

# 97. DEFINITION OF DONE

Task CHỈ hoàn thành khi:

1. website cũ không có regression mới;
2. client-server boundary rõ;
3. NestJS backend chạy được;
4. TypeORM kết nối PostgreSQL;
5. migrations tồn tại;
6. session API hoạt động;
7. camera/upload flow hoạt động;
8. cả 5 game hoạt động;
9. game order được server enforce;
10. game results persist;
11. frontend không tính hidden profile;
12. backend scoring deterministic;
13. type engine deterministic;
14. palette deterministic;
15. STARPRINT SVG render đúng;
16. Final Reveal hoạt động;
17. Result route hoạt động;
18. consent persist;
19. publish hoạt động;
20. Sky API chỉ trả public data;
21. Socket event phát sau DB commit;
22. `/sky` nhận star realtime;
23. refresh recovery hoạt động;
24. camera denied có fallback;
25. mobile không horizontal overflow;
26. reduced-motion hoạt động;
27. frontend typecheck pass;
28. frontend build pass;
29. không có lint regression mới;
30. backend typecheck pass;
31. backend build pass;
32. backend tests pass;
33. README được cập nhật;
34. `.env.example` đầy đủ;
35. `PROJECT_CONTEXT.md` phản ánh source thực tế.

Không trả lời "Done" nếu chưa đạt các điều trên hoặc chưa ghi rõ blocker.

---

# 98. FINAL REPORT FORMAT

Sau khi hoàn thành, trả báo cáo theo format:

## A. Pre-refactor audit

Table:

```text
File
Old responsibility
Problem
Decision
```

## B. Final architecture

```text
React/Vite
↓
REST + Socket.IO
↓
NestJS
↓
TypeORM
↓
PostgreSQL
```

## C. Frontend

Liệt kê:

- shells;
- Starprint architecture;
- games;
- store;
- API client;
- camera;
- SVG engine;
- Sky.

## D. Backend

Liệt kê:

- modules;
- controllers;
- services;
- entities;
- repositories;
- migrations;
- DTO;
- endpoints;
- gateway.

## E. Database

Entity relationships + constraints.

## F. STARPRINT Flow

```text
QR
→ Intro
→ Nickname
→ Camera
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

## G. Scoring

Explain:

- dimensions;
- deterministic mapping;
- types;
- placeholders/TODO BUSINESS CONFIRMATION.

KHÔNG expose hidden score trong UI, nhưng report kỹ thuật có thể mô tả architecture.

## H. Files changed

```text
Created
Modified
Deleted
```

và lý do.

## I. Verification

Report actual result:

```text
Frontend typecheck:
Frontend lint:
Frontend build:

Backend typecheck:
Backend lint:
Backend build:
Backend tests:

Responsive:
Camera fallback:
Refresh recovery:
Realtime:
Existing-site regression:
```

Không ghi PASS nếu chưa thực sự chạy.

## J. Remaining placeholders / technical debt

Chỉ liệt kê những thứ thật sự còn lại.

---

# 99. FINAL EXECUTION RULE

Sau khi đọc prompt này:

KHÔNG trả lời bằng một kế hoạch đơn thuần.

Bắt đầu bằng:

1. audit repository;
2. inspect source;
3. inspect git status;
4. identify current architecture;
5. implement Phase 1 → Phase 12;
6. run verification;
7. fix regressions;
8. update documentation;
9. produce final report.

Không yêu cầu confirmation giữa các phase.

Chỉ dừng nếu gặp HARD BLOCKER theo Section 3.

Nếu gặp một lỗi implementation:

→ tự debug.

Nếu gặp test fail:

→ tự sửa.

Nếu gặp build fail:

→ tự sửa.

Nếu có nhiều giải pháp hợp lệ:

→ chọn giải pháp đơn giản, maintainable và phù hợp existing codebase nhất.

Mục tiêu cuối cùng:

A WORKING, TESTED, DOCUMENTED,
CLIENT–SERVER STARPRINT IMPLEMENTATION

chứ không phải một bản proposal.
