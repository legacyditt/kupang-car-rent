# Mobile Hero Cinematic — Design

Date: 2026-11-26 · Scope: landing hero, viewport < 768px only. Desktop (>= 768px) is not changed.

## Problem
Mobile hero is the desktop hero stacked vertically: small flat photo block, boxed Tarif/Layanan card,
no entrance motion (GSAP is desktop-only since `perf/desktop-only-gsap`). Desktop has rules, beam, parallax; mobile has none.

## Decisions (approved by user)
1. **Stage.** Photo is full-bleed under a transparent header (mobile only), fading into obsidian at the bottom.
   Header turns solid after `scrollY > 24` (existing `isScrolled`).
2. **Content, bottom-anchored (thumb zone).** Headline + subtext unchanged (em-dash in subtext replaced by a period),
   big price numeral instead of the Tarif/Layanan card, full-width 52px CTA.
3. **Fleet rail.** Horizontal scroll-snap pills (name + price) from `usePublicCars` (shared react-query cache).
   Fixed height + skeleton while loading, so CLS stays 0. Tap → `#katalog`.
4. **Motion, CSS-only**, mobile + `prefers-reduced-motion: no-preference` only: photo settle (1.06 → 1),
   beam grows, text/price/pills rise in stagger, scroll-driven parallax via `animation-timeline: scroll()` (progressive enhancement).
   Nothing loops.
5. **Asset.** `hero-mobile.webp` re-exported as a portrait-friendly 820x720 crop (x 230..1050) of the original 1280x720 photo. Budget <= 60 KB.

## Constraints
- One accent (gold). No new fonts, no new libraries, no new image in LCP path beyond the re-exported hero.
- Pricing inside hero deviates from the anti-slop skill (pricing teaser) on purpose: price is the main decision input
  for a renter and already exists on desktop.
- Starting price on mobile is derived from live data (min `pricePerDay`, fallback Rp 300rb). Desktop still has the hardcoded text.

## Units
| Unit | Responsibility |
|---|---|
| `HeroSection.tsx` | Shell: stage, scrims, desktop content untouched, mounts mobile panel |
| `HeroMobilePanel.tsx` | Price numeral, CTA, mounts rail; owns `usePublicCars` |
| `HeroFleetRail.tsx` | Presentational pills + skeleton |
| `index.css` | Keyframes + mobile-scoped utility classes |
| `Navbar.tsx` | Transparent-at-top variant on mobile |
| `lib/utils.ts` | `formatRupiahCompact` |

## Verification
`tsc` (lint), `vite build`, screenshot at 390x844 and 1280x720 from the built app (desktop must look unchanged).
PageSpeed Insights Mobile only after deploy; target: Performance not below ~80, CLS 0.

