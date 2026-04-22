# BrandMirror Handoff

This document is for the next Codex operator taking over BrandMirror.

## Product Snapshot

BrandMirror is a standalone SAHAR product for brand diagnosis.

The current product has four main surfaces:

- `/` landing page
- `/first-read` free first-read experience
- `/full-report` paid/full report screen experience
- `/sample-report` sample diagnostic output

The product direction is:

- premium, editorial, cinematic
- dark screen system for web
- PDF is the master art direction
- web full report should feel like the screen-native version of that same report, not a separate design language

## Current Environment

- Node: `22.x`
- `.nvmrc` is set to `22`
- Vercel project node version is also set to `22.x`

Recommended local setup:

```bash
cd "/Users/marynadabrytskaya/Desktop/Brand Mirror"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22
npm install
```

Local dev:

```bash
npm run dev
```

If local dev starts behaving strangely under Turbopack, this command has been the most reliable fallback:

```bash
./node_modules/.bin/next dev --webpack
```

Production build verification:

```bash
npm run build
```

This build was verified successfully before the latest Vercel preview handoff.

## Live Preview

Public Vercel preview:

- `https://brand-mirror-my8fa0qz8-marynadabrytskaya-2721s-projects.vercel.app`

Verified routes:

- `/`
- `/first-read`
- `/full-report`
- `/sample-report`

All four returned `200` during the latest verification pass.

Vercel project:

- Project name: `brand-mirror`
- Team: `marynadabrytskaya-2721s-projects`
- `.vercel/project.json` is present locally

Important Vercel state:

- Preview Protection / Vercel Authentication was disabled
- Project Node version was changed from `24.x` to `22.x`

## What Was Fixed Recently

### 1. Vercel and build stability

- Project linked to Vercel
- Public preview flow enabled
- Vercel runtime aligned to Node 22
- Local production build confirmed green

### 2. Duplicate type folders issue

The repo had Finder-style duplicate folders inside `node_modules/@types`, such as:

- `estree 2`
- `node 2`
- `react 2`

These broke TypeScript in production builds. They were removed locally, and that was part of the reason builds started passing again.

If TypeScript suddenly starts failing with weird type-library errors again, check `node_modules/@types` for duplicate folders with ` 2` suffixes.

### 3. Screen system alignment

The web surfaces were pushed toward a single darker screen language:

- `first-read`
- `sample-report`
- middle sections of `full-report`

The main changes were:

- moved those screens into the darker `report-shell`
- reduced beige/light fallouts
- aligned CTA styling
- aligned panel treatment toward the PDF/web art direction system

## Key Files

These are the main files to continue from:

- [src/app/globals.css](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/src/app/globals.css)
- [src/components/full-report-experience.tsx](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/src/components/full-report-experience.tsx)
- [src/components/first-read-experience.tsx](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/src/components/first-read-experience.tsx)
- [src/app/sample-report/page.tsx](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/src/app/sample-report/page.tsx)
- [src/app/full-report/page.tsx](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/src/app/full-report/page.tsx)
- [src/components/language-switcher.tsx](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/src/components/language-switcher.tsx)

API / report generation entry points:

- [src/app/api/brand-read/route.ts](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/src/app/api/brand-read/route.ts)
- [src/app/api/brand-report/route.ts](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/src/app/api/brand-report/route.ts)
- [src/app/api/brand-report/pdf/route.ts](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/src/app/api/brand-report/pdf/route.ts)

Project instructions worth reading before changing Next-specific behavior:

- [AGENTS.md](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/AGENTS.md)

## Current Design Intent

For the next pass, assume this is the intended direction:

- PDF is the master art direction
- web full report should inherit that direction, but in a screen-native way
- no light/beige cards breaking the darker system
- cool dark palette is preferred over warm caregiver-like beige
- typography should feel editorial and premium, not generic SaaS
- the web experience should feel like one product family across:
  - landing page
  - first read
  - sample report
  - full report

## What Still Needs Work

This is the cleanest next-task list.

### Priority 1: Bring web full report closer to PDF master art direction

Focus on [src/components/full-report-experience.tsx](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/src/components/full-report-experience.tsx).

What still needs refinement:

- middle sections need stronger visual hierarchy
- some sections still read as assembled blocks instead of one intentional editorial flow
- the screen version should feel less like stacked report cards and more like a designed report sequence
- typography pacing can be tightened further

### Priority 2: Unify the three web report surfaces

Focus on:

- [src/components/first-read-experience.tsx](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/src/components/first-read-experience.tsx)
- [src/app/sample-report/page.tsx](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/src/app/sample-report/page.tsx)
- [src/components/full-report-experience.tsx](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/src/components/full-report-experience.tsx)

Goal:

- one screen system
- one panel language
- one CTA language
- one typography hierarchy

### Priority 3: Use the Vercel preview as the review environment

Do not rely only on localhost for final visual review.

Use the live preview:

- `https://brand-mirror-my8fa0qz8-marynadabrytskaya-2721s-projects.vercel.app`

That is the correct place to review the real output while continuing polish work.

## Known Notes

- There is no git remote configured right now.
- The Vercel deploys were triggered from dirty local state via CLI.
- If a Vercel build looks inconsistent with local changes, force a fresh deploy after a confirmed local `npm run build`.
- If build logs mention JSX EOF / unclosed tags, verify the actual file on disk first before assuming the current source is broken. Earlier Vercel errors were sometimes from stale deployments, not the latest local state.

## Suggested First Move For The Next Operator

1. Open the Vercel preview and compare `/first-read`, `/sample-report`, and `/full-report`.
2. Start in [src/components/full-report-experience.tsx](/Users/marynadabrytskaya/Desktop/Brand%20Mirror/src/components/full-report-experience.tsx).
3. Treat the current task as a visual systems pass, not a feature pass.
4. Keep the darker `report-shell` direction and push it into a more intentional editorial composition.

