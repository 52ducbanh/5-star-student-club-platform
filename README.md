# 5SS UET — Student 5 Good Club Website

An interactive, modern digital brand space and cosmic roadmap ("5SS Galaxy – Hành trình tỏa sáng") for the **Sinh viên 5 Tốt (Student 5 Good)** Club at **VNU University of Engineering and Technology (UET – VNU Hanoi)**.

---

## Project Overview

The website guides university students through the 5 criteria of the nationwide "Sinh viên 5 Tốt" movement:
1. **Đạo đức tốt** (Ethics & Morality)
2. **Học tập tốt** (Academic & Research)
3. **Thể lực tốt** (Physical Fitness)
4. **Tình nguyện tốt** (Volunteering & Community)
5. **Hội nhập tốt** (Integration & Global Mindset)

Key user experiences include:
- **Hero Galaxy & 3D Interactive Scenes**: Powered by Three.js and React Three Fiber with performance-conscious frame throttling.
- **Interactive Constellation Journey Map**: Gamified criteria tracker with persistent checklist progress stored in browser `localStorage`.
- **Activities Archive & Deep-Linked Modals**: Filterable news, workshops, and events with bidirectional URL search parameter synchronization (`?item=id`).
- **Responsive & Accessible Design**: Crafted for viewports from 320px mobile to ultrawide monitors, adhering to WAI-ARIA and `prefers-reduced-motion` standards.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/) with Rolldown/ESBuild
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom 8-layer CSS Architecture
- **3D & WebGL**: [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/), [@react-three/drei](https://github.com/pmndrs/drei)
- **Animation**: [Motion](https://motion.dev/) (Framer Motion engine)
- **Smooth Scroll**: [Lenis](https://lenis.darkroom.engineering/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## Prerequisites

Before running the project locally, ensure you have the following installed:
- **Node.js**: `v18.0.0` or higher (Node.js 20+ LTS recommended)
- **npm**: `v9.0.0` or higher (comes with Node.js)

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "5SS website"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Run Development Server

Start the local Vite development server:

```bash
npm run dev
```

Once started, open your browser and navigate to:
- **Local URL**: `http://localhost:5173`
- **Network URL**: The development server binds to `0.0.0.0` (host: true), allowing you to test on mobile devices connected to the same Wi-Fi network.

---

## Production Build & Preview

1. Build the production assets:
   ```bash
   npm run build
   ```
   This runs TypeScript type checking (`tsc -b`) and Vite production bundling into the `dist/` directory with optimized chunk splitting.

2. Preview the production build locally:
   ```bash
   npm run preview
   ```
   This serves the `dist/` bundle on `http://localhost:4173`.

---

## Available Scripts

Defined in `package.json`:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with hot module replacement (HMR). |
| `npm run build` | Compiles TypeScript and builds production-ready static assets in `dist/`. |
| `npm run typecheck` | Runs the TypeScript compiler (`tsc -b --pretty false`) to verify types without emitting files. |
| `npm run lint` | Runs the high-performance Oxlint linter across all source files. |
| `npm run preview` | Spins up a local static server to test the production build output. |

---

## Project Structure

```text
5SS website/
├── public/                     # Static assets served at root
│   ├── assets/                 # Brand badges and SV5T marks
│   └── og-5ss-v2.png           # Social share preview card
├── src/
│   ├── assets/                 # Bundled graphics (emblems, SVG strips)
│   ├── components/             # Reusable UI & layout components
│   │   ├── layout/             # AppShell, Header, Footer
│   │   ├── loading/            # LoadingScreen, LoadingStarPentagon
│   │   └── ui/                 # AccessibleModal, AffiliationMarquee, PageIntro, Toast, etc.
│   ├── config/                 # Site configuration, navigation hierarchy, contact info
│   ├── context/                # LoadingContext for smooth intro transitions
│   ├── data/                   # Content models (journey criteria, activities, FAQ, about)
│   ├── features/               # Feature-specific state and components
│   │   ├── activities/         # Event registration form
│   │   ├── forms/              # Contact form & validation helpers
│   │   ├── journey/            # 2D Constellation map, mobile track, checklist panel, progress hook
│   │   └── shared/             # Shared custom hooks (useMediaQuery)
│   ├── hooks/                  # Global hooks (useIsMobile, useReducedMotion, useScrollProgress)
│   ├── pages/                  # Page routes (HomePage, JourneyPage, ActivitiesPage, NotFoundPage)
│   ├── sections/               # Composite sections on the homepage (Hero, About, Criteria, etc.)
│   ├── styles/                 # 8-layer CSS cascade architecture
│   │   ├── tokens.css          # Design tokens & color variables
│   │   ├── animations.css      # Keyframes and animation rules
│   │   ├── components.css      # Base UI components styling
│   │   ├── pages.css           # Page layout constraints
│   │   ├── journey.css         # Constellation roadmap styling
│   │   ├── theme-5ss.css       # Bright Dreamy Cosmic theme overrides
│   │   └── responsive.css      # Responsive rules (320px to 1024px)
│   ├── three/
│   │   └── scenes/             # Three.js / R3F scenes (HeroGalaxyScene, Criteria3DScene)
│   ├── utils/                  # Navigation and anchor scroll helpers
│   ├── App.tsx                 # Root router and layout provider
│   ├── index.css               # Master stylesheet import entry point
│   └── main.tsx                # Application bootstrap entry point
├── .oxlintrc.json              # Oxlint linting rules
├── index.html                  # HTML entry point with meta tags and Google Fonts
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript project references
├── tsconfig.app.json           # Application TypeScript compiler options
├── tsconfig.node.json          # Vite node configuration
├── vercel.json                 # Single Page Application (SPA) rewrite rules
└── vite.config.ts              # Vite configuration with Tailwind CSS and Rolldown chunking
```

---

## Notes & Implementation Details

- **Client-Side SPA Architecture**: The application is a pure client-side static web app and does not require a dedicated backend server to run.
- **Demo / Simulation Data**: Forms (e.g., Contact Form, Event Registration) execute simulated client-side submission flows with realistic feedback banners. No personal data is sent to or stored on an external server.
- **LocalStorage Persistence**: Student progress in the Journey Map is stored locally under the key `uet5ss:journey-progress:v1`. Resetting or clearing browser storage will reset checklist marks to 0%.
- **Single Source of Truth**: Detailed architectural documentation and coding guidelines are maintained in `PROJECT_CONTEXT.md`.
