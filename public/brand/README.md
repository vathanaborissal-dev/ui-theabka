# Theabka assets

Mark: **Arch Card** (3A). Mascot: **Thiep**.
Palette: garnet #8c2f39 · antique gold #c39b52 · parchment #fdfaf4 · gold-on-dark #e8c98a

## mark/
- arch-duo.svg — primary, garnet outline + gold seal
- arch-1color.svg — inherits `currentColor`, single-ink printing
- arch-reverse.svg — parchment + gold, for dark backgrounds
- arch-16.svg — **solid silhouette, use at ≤20px.** The outlined master fills in at 16px; this variant drops the seal dot and goes solid.

## mascot/  (product UI only — never on a couple's invitation)
thiep.svg (default) · thiep-wave.svg (onboarding, welcome) · thiep-happy.svg (RSVP received, check-in success) · thiep-sleeping.svg (empty states) · thiep-qr.svg (share / QR screens) · thiep-holding-card.svg (invitation editor) · thiep-reverse.svg (dark backgrounds) · thiep-1color.svg + thiep-1color-wave.svg (single ink) · thiep-avatar.svg (circular crop, 100×100)
Smallest useful size: 28px. Below that use the mark.

## lockup/ · wordmark/
horizontal-duo · horizontal-1color · stacked-bilingual · latin · khmer-kantumruy · khmer-noto-serif

⚠ These contain **live `<text>`**, not outlines. They render correctly wherever Quicksand and Kantumruy Pro (or Noto Serif Khmer) are installed or webfont-loaded. Before sending to a printer, open in Illustrator/Figma and convert text to outlines — I can't outline reliably, and Khmer especially must not be outlined without a native reader checking the ៀ vowel and the ការ tail.

## icon/
favicon.svg (64) · favicon-16.svg (solid silhouette) · apple-touch-icon.svg (180) · maskable-512.svg
Still needed from a raster step: favicon.ico and PNG sizes. Point Next.js at `app/icon.svg` (favicon.svg) and `app/apple-icon.png` — and delete the 25KB scaffold favicon.

## social/
share-1200x630.svg — Khmer tagline still to come; the English one is a placeholder for it.

## mascot/animated/  (self-contained animated SVG — animates in `<img>`, CSS only, no JS)
- loading.svg — bob + three pulsing dots. Spinner replacement; safe down to 24px if you crop the dots.
- loading-reverse.svg — same, parchment + gold, for garnet/dark surfaces (buttons, toasts)
- pushing.svg — heaving a sealed card to the right. Sending / publishing an invitation.
- happy.svg — jump with gold sparks. RSVP received, check-in success, payment done.
- thinking.svg — head tilt, eyes tracking, thought dots. Processing, generating, saving.
- waving.svg — arm pivot at the shoulder. Onboarding, first run, empty inbox.
- idle.svg — slow breathe, eyes shut. Long waits and idle screens.

All loop infinitely. For `prefers-reduced-motion`, swap to the static variant in `mascot/` rather than freezing these.


---

## Implementation notes (added when wiring these into the site)

**The animated files arrived without their keyframes.** All seven carried the
class hooks (`bob`, `wave`, `jump`, `breathe`, `push`, `tilt`, …) but no
`<style>` block, no `@keyframes` and no `<animate>` elements — so nothing
moved. Keyframes have been written into each file from the descriptions above.
**The timing and easing are a reconstruction, not the designer's**: worth a
look, and worth replacing wholesale if a corrected export turns up. Each file
also now carries its own `prefers-reduced-motion` guard, in addition to the
component-level swap to a still.

**Wordmarks and lockups are not used as files.** They contain live `<text>`,
so as `<img>` they would silently fall back to Trebuchet wherever Quicksand
had not loaded. The wordmark is set as HTML instead — Quicksand is loaded
through `next/font` — which also keeps it selectable and searchable. The SVGs
remain here for print and for handoff to anyone outside the app.

**The mark is drawn inline** in `components/app-shell/brand.tsx` rather than
loaded from `mark/*.svg`: it appears on nearly every screen, so inlining saves
a request per page, and the ≤20px silhouette rule is enforced in code by the
`size` prop instead of relying on each call site to remember it.

**Icons and the share card are generated, not shipped.** `app/icon.svg` is
`icon/favicon.svg`; `app/apple-icon.tsx` and `app/opengraph-image.tsx` render
real PNGs at the sizes Safari and the social platforms require, which closes
the "still needed from a raster step" gap above. The fonts they embed live in
`app/_fonts/` so the build needs no network.

**The Khmer name differs between the assets and the app.** These files say
**ធៀបការ**; `lib/i18n/dictionary.ts` says **ធៀបកា** (no final រ). One is wrong
and a Khmer reader should settle it — nothing here has been changed either way.
