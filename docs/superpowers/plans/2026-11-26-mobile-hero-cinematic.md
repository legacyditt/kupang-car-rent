# Mobile Hero Cinematic — Plan

Spec: `docs/superpowers/specs/2026-11-26-mobile-hero-cinematic-design.md`. Branch: `feat/mobile-hero-cinematic`.
Frontend has no test runner, so each task is verified with `npm --prefix frontend run lint` (tsc) and, at the end, build + screenshots.

| # | Task | Files | Verify |
|---|---|---|---|
| 1 | Re-export mobile hero crop (820x720, <= 60 KB) | `frontend/public/hero-mobile.webp` | file size |
| 2 | Add `formatRupiahCompact` | `frontend/src/lib/utils.ts` | lint |
| 3 | Mobile-scoped keyframes + classes | `frontend/src/index.css` | build |
| 4 | Presentational rail with skeleton | `frontend/src/features/landing/components/HeroFleetRail.tsx` | lint |
| 5 | Price + CTA + rail panel | `frontend/src/features/landing/components/HeroMobilePanel.tsx` | lint |
| 6 | Hero shell: full-bleed stage, scrims, hide desktop strip on mobile | `frontend/src/features/landing/components/HeroSection.tsx` | lint |
| 7 | Transparent header on mobile at top | `frontend/src/components/layout/Navbar.tsx` | lint |
| 8 | Build + screenshots 390x844 and 1280x720 | — | build exit 0, desktop unchanged |
| 9 | Commit SoC, push | — | `git status` clean |

