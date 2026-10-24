# AETHR ONE

A fictional premium interactive product experience built as a client-side 3D showcase. The site renders an interactive 3D product viewer with physics-based interaction, GSAP-driven motion, and post-processing effects — no backend or user data involved.

## Tech stack

- **Next.js 15** / **React 19** — app framework and UI
- **Three.js** + **@react-three/fiber** — 3D rendering
- **@react-three/drei** — common 3D helpers (loaders, controls, etc.)
- **@react-three/rapier** — physics simulation
- **@react-three/postprocessing** / **postprocessing** — visual post-processing effects
- **GSAP** — scroll and interaction animation
- **Zustand** — client-side state management
- **TypeScript**

## Running locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

Other scripts:

```bash
npm run build        # production build
npm run start         # serve the production build
npm run lint          # eslint
npm run typecheck     # tsc --noEmit
npm run assets:prepare  # prepares/processes 3D assets (scripts/prepare-assets.mjs)
```
