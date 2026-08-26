# Theabka — Cambodian wedding & event platform

Frontend for an event platform built around how Cambodian weddings actually run:
a printed invitation carries a QR code, guests scan it to open a bilingual
digital invitation and reply, and the family tracks guests, cash gifts
(_ចំណងដៃ_) and expenses from there.

Frontend only — all data is mock data held in a client-side store.

```bash
npm run dev
```

## The two surfaces

The product is deliberately split in two, and they look nothing alike:

|                | Route                 | Who it's for                               |
| -------------- | --------------------- | ------------------------------------------ |
| **Dashboard**  | `/events/[eventId]/…` | The couple and family running the event    |
| **Invitation** | `/i/[slug]`           | Guests, usually on a phone, usually via QR |

The invitation has its own typography, palette and layout system, its own
`LocaleProvider` (defaulting to Khmer), and shares nothing with the dashboard
chrome beyond a handful of primitives.

## Layout

```
app/
  page.tsx                    Marketing landing
  events/                     Workspace: list, creation wizard
  events/[eventId]/           Dashboard, invitation builder, guests,
                              gifts, expenses, planner, share, settings
  i/[slug]/                   Public invitation (guest-facing)

components/
  ui/                         shadcn/ui primitives (Base UI under the hood)
  shared/                     Cross-feature building blocks
  app-shell/                  Sidebar (collapsible), phone tab bar, event switcher, ⌘K palette
  dashboard/ guests/ gifts/ expenses/ planner/ events/ share/
  invitation/
    templates/                Four full invitation designs
    sections/                 Shared invitation sections
    builder/                  The editor + live preview
  charts/                     Hand-drawn SVG charts
  providers/                  Theme, locale, data

lib/
  types.ts                    Domain model
  data/                       Deterministic mock data
  i18n/                       Khmer/English dictionary
  invitation/                 Template + palette registries
  stats.ts format.ts themes.ts nav.ts
```

## Decisions worth knowing

**Global search is ⌘K / Ctrl+K, spotlight-style.** `CommandPaletteProvider`
owns the open state and the key binding (also `/` when not typing in a
field); `CommandPalette` renders the actual dialog on top of `cmdk`. With no
query it offers the current event's pages and quick actions; typing searches
guests (name, Khmer name, family, phone), events, expenses and tasks at once,
because "where is that person" is the question this product gets asked most.
Selecting a guest deep-links into the guest list pre-filtered to them — the
guests page reads `?q=`/`?new=` and remounts on that key so navigating there
from an already-open tab isn't silently ignored.

**The sidebar collapses to icons**, state remembered in `localStorage`
(`sidebarStore`, read via `useSyncExternalStore` so it's correct on the very
first paint, no flash). Collapsed nav items keep their tooltip label — an
icon rail with no way to know what an icon means is a worse sidebar, not a
smaller one. `⌘B` / `Ctrl+B` toggles it from the keyboard, matching the
convention most editors use.

**Event-type agnostic model.** Weddings are the flagship, but `Event`, `Guest`,
`Gift` and `Expense` carry nothing wedding-specific. Guests belong to side `a`,
`b` or `shared`, and the _labels_ for those sides live on the event — "Groom's
side / Bride's side" for a wedding, "Family / Community" for a funeral. Adding
an event type is configuration, not new types.

**Themes are personalities, not hues.** `angkor`, `lotus` and `studio` each
redefine palette, display typeface, corner radius and surface treatment via CSS
custom properties, applied to the shadcn primitives by `data-slot` — so `lotus`
genuinely has pill buttons and soft shadows while `studio` has square corners
and hairline borders. Each has a light and dark variant. Applied before first
paint by an inline script; read through `useSyncExternalStore`, never an effect.

**Invitation templates are independent of the app theme.** Nine templates ×
thirteen palettes × four type pairings × six background patterns × three ornament
levels × nine photo frames × four gallery layouts × five entrance animations,
all driven by `--inv-*` custom properties. Templates read only those
variables, so changing a palette or typeface never touches a template.

| Template                      | Character                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------ |
| **Baisei** (បាយសី)            | Gold arch, baisei offering cone, white blooms, the couple in traditional dress |
| **Angkor** (អង្គរ)            | Temple silhouette, flame-tipped pediment over the names, carved kbach borders  |
| **Reachny** (រាជនី)           | Formal engraved card — indigo and gold rules, cartouche, ruled honour line     |
| **Bopha** (បុប្ផា)            | Classic Khmer card — gold frame, stacked family names                          |
| **Phka Romduol** (ផ្កា​រំដួល) | Garlands and blooms of Cambodia's national flower                              |
| **Naga** (នាគ)                | Dark and ceremonial, naga balustrade over a full-bleed cover                   |
| **Chan** (ចន្ទ)               | Modern editorial, large serif, generous whitespace                             |
| **Kravan** (ក្រវាន់)          | Photo-first, details laid over the cover                                       |
| **Sila** (សីល)                | Restrained — memorials get a layout that isn't celebratory                     |

**The figurative motifs are drawn too.** `khmer-motifs.tsx` holds the baisei
(បាយសី) offering cone as tiers of folded banana leaves in a footed pahn, the
couple illustrated in a white koh with gold sash and in sbai with a ceremonial
headpiece, peony-and-foliage corner sprays, hanging canopy beads, and the oval
cartouche used on formal cards.

**The honour line is the paper-to-digital upgrade.** A printed Cambodian card
leaves a ruled blank where the family writes the guest's name, and pre-prints
"លោក លោកស្រី អ្នកនាង កញ្ញា" underneath. Theabka renders exactly that — and when
the guest arrives through their personal link, their name is already in it.

**Khmer ornament is drawn, not clip-art.** `khmer-ornaments.tsx` holds the
Angkor Wat profile, the temple pediment (ហោជាង), the romduol, a naga
balustrade, lotus friezes and kbach corner curls — all line art on
`currentColor`, so any palette can tint them. `patterns.tsx` holds five
seamless background tiles (kbach phka, romduol, lotus lattice, kbach curl,
temple) as inline SVG `<pattern>` rather than data-URIs, so they can inherit a
palette token. Pattern opacity is tied to the ornament level: a motif that
competes with the couple's names has stopped being a background.

**It behaves like an _e_-invitation, not a photo of one.** A sealed envelope
with a wax seal that the guest taps to open, sections that rise into view as
they scroll, a slow Ken Burns drift on the cover, romduol petals falling over
the card, a swipeable gallery with a lightbox. All of it is off by default for
anyone whose phone asks to reduce motion, and the entrance states are applied
only after mount — so with JavaScript disabled the whole invitation is still
there, just still.

**Container queries, not viewport queries,** inside the invitation — that is why
the builder's phone preview is accurate rather than a scaled-down desktop
layout.

**Khmer is a first-class script.** Khmer numerals and month names, a longer
line-height, and a rule that stops Tailwind tracking utilities from splitting
Khmer consonant clusters from their subscripts. Compact money (`$18.5k`) is
suppressed in Khmer, where the Latin suffix is not idiomatic.

**Mock data is generated, not hand-written,** from a seeded PRNG so server and
client render identically. Names, family groups, relationships and gift sizes
are correlated — a guest in "Meas family" mostly has the surname Meas, a
colleague is never a grandparent, and the large early envelopes come from close
relatives and the parents' business circle.

**Charts are hand-drawn SVG.** No charting dependency. Part-to-whole status uses
one stacked bar rather than a pie, and category breakdowns use sorted horizontal
bars, which stay readable on a phone.

## Swapping in a real backend

All mutations go through `components/providers/data-provider.tsx`. Replacing the
action bodies with API calls does not change the component tree.

## Deploying to Vercel

This repository is ready to import as a Next.js project; no `vercel.json` or
environment variables are required for the current frontend-only version.

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, select **Add New → Project**, then import the repository.
3. Keep the detected **Next.js** framework preset and the repository root as
   the Root Directory.
4. Leave the default commands in place: `npm install` and `npm run build`.
5. Click **Deploy**. Add a custom domain later from **Project Settings → Domains**.

The production build requires outbound access to Google Fonts, which Vercel
provides during builds. The app currently uses seeded client-side mock data, so
changes made in a deployed session are not shared with other visitors or saved
after a refresh. Connect the data provider to a real backend before using it
for live events.

## Note on tooling

`.claude/launch.json` is a local dev-preview config and can be deleted.
