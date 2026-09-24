# Dispatch Assignment: Worker M1 (Milestone 1 Implementation)

## Context
Project: Aura Apparel luxury minimalist web storefront.
Milestone: M1 - Project Setup & Responsive Shell.
Workspace: C:\Users\YC\teamwork_projects\aura_apparel
Your working directory: C:\Users\YC\teamwork_projects\aura_apparel\.agents\worker_m1_1
Authoritative user request: C:\Users\YC\teamwork_projects\aura_apparel\ORIGINAL_REQUEST.md
Scope document: C:\Users\YC\teamwork_projects\aura_apparel\.agents\orchestrator_1\PROJECT.md

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Input Reference Reports
- Scaffolding & Toolchain: `C:\Users\YC\teamwork_projects\aura_apparel\.agents\explorer_m1_1\analysis.md`
- Navigation & Footer: `C:\Users\YC\teamwork_projects\aura_apparel\.agents\explorer_m1_2\analysis.md`
- Editorial Showcase & Fallbacks: `C:\Users\YC\teamwork_projects\aura_apparel\.agents\explorer_m1_3\analysis.md`

## Implementation Tasks
1. Initialize Project & Configuration:
   - `package.json` with `"type": "module"`, React 19, Vite 8, Tailwind CSS v4, `@tailwindcss/vite`, Lucide React, Vitest 4, `@testing-library/react`, `jsdom`. Note: Use UTF-8 without BOM.
   - `vite.config.ts` with `@tailwindcss/vite`, `@vitejs/plugin-react`, and `test: { environment: 'jsdom', pool: 'threads', setupFiles: './src/tests/setup.ts' }`.
   - `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`.
   - `index.html` with Bodoni Moda (400, 500) and Hanken Grotesk (400, 500, 600) Google Fonts and responsive viewport meta tags.
   - Run `npm install` and verify dependencies install cleanly.
2. Styling & Theme Tokens:
   - `src/index.css`: `@import "tailwindcss";` and `@theme` tokens (Obsidian `#0D0D0D`, Pale Gold `#D4AF37`, Cloud White `#FBF9F9`, Surface White `#FFFFFF`, Surface Low `#F5F5F3`, Slate Grey `#707070`, outlines `#C4C7C7`/`#E0E0E0`, AAA text `#1B1C1C`).
   - Enforce 0px border geometry universally (`* { border-radius: 0px !important; }`).
3. Core Components:
   - `src/components/common/ImageWithFallback.tsx` with inline SVG data URI luxury placeholder.
   - `src/components/layout/Navbar.tsx` (sticky scroll transition, Bodoni Moda wordmark, category links with Pale Gold active underline, bag button with live count, mobile hamburger toggle).
   - `src/components/layout/MobileDrawer.tsx` (slide-in drawer for <768px, backdrop, escape dismiss, smooth links).
   - `src/components/layout/Footer.tsx` (Obsidian ground, newsletter with email regex validation & confirmation state, directory links, 4-currency selector).
   - `src/components/home/Hero.tsx` (full-bleed editorial banner, Bodoni Moda 72px/48px headline "THE FORM OF STILLNESS", narrative copy, sharp 0px CTA).
   - `src/components/home/CollectionsShowcase.tsx` (3 curated cards: Outerwear, Essentials, Summer Drop, 1.03x hover zoom, category trigger).
   - `src/components/home/BrandStory.tsx` (asymmetric bento, Bodoni Moda manifesto quote, 3 craftsmanship pillars: Architectural Precision, Rare Textiles, Atelier Ethos).
   - `src/App.tsx` and `src/main.tsx` assembling the application shell.
4. Testing & Verification:
   - `src/tests/setup.ts` mocking localStorage and matchMedia.
   - Initial verification tests for M1 components in `src/tests/m1-shell.test.tsx`.
   - Run `npm test` and `npm run build` and ensure both pass with 0 errors and 0 warnings.
5. Report:
   - Write your detailed implementation report in `changes.md` and your 5-component `handoff.md`.

## 2026-09-03T10:54:39Z
<USER_REQUEST>
You are a Worker implementing Milestone 1 of the Aura Apparel project.
Your working directory is: C:\Users\YC\teamwork_projects\aura_apparel\.agents\worker_m1_1
Authoritative user request: C:\Users\YC\teamwork_projects\aura_apparel\ORIGINAL_REQUEST.md
Scope document: C:\Users\YC\teamwork_projects\aura_apparel\.agents\orchestrator_1\PROJECT.md
Your detailed dispatch assignment is at: C:\Users\YC\teamwork_projects\aura_apparel\.agents\worker_m1_1\DISPATCH.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Consult the Explorer analysis reports:
- Scaffolding & Config: C:\Users\YC\teamwork_projects\aura_apparel\.agents\explorer_m1_1\analysis.md
- Navigation & Footer: C:\Users\YC\teamwork_projects\aura_apparel\.agents\explorer_m1_2\analysis.md
- Hero, Collections & Story: C:\Users\YC\teamwork_projects\aura_apparel\.agents\explorer_m1_3\analysis.md

Implement the Milestone 1 codebase in C:\Users\YC\teamwork_projects\aura_apparel:
1. package.json, vite.config.ts (with pool: 'threads'), tsconfig.json, tsconfig.app.json, tsconfig.node.json, index.html.
2. Run npm install.
3. src/index.css with @theme tokens and sharp 0px border geometry.
4. src/components/common/ImageWithFallback.tsx.
5. src/components/layout/Navbar.tsx, MobileDrawer.tsx, Footer.tsx.
6. src/components/home/Hero.tsx, CollectionsShowcase.tsx, BrandStory.tsx.
7. src/App.tsx, src/main.tsx.
8. src/tests/setup.ts and src/tests/m1-shell.test.tsx.
9. Execute npm test and npm run build. Verify 0 errors and 0 warnings.
Write changes.md and deliver a self-contained handoff.md in your working directory.
When finished, send a message to parent with your verification results and path to handoff.md.
</USER_REQUEST>
