# Motif assets — what to drop in here

Anything you put in these folders is picked up by the invitation builder and
offered to users as a choice. Until a file exists, the app falls back to the
hand-drawn SVG motifs already in `components/invitation/`, so nothing breaks
while this folder is empty.

---

## Format, in order of preference

| | Format | Why |
|---|---|---|
| **Best** | `.svg` | Scales to any size, tiny, and if it is single-colour I can re-tint it to match every palette automatically. |
| Good | `.png` with transparency | Works everywhere. Export at **3× the display size** (see each section). |
| Also fine | `.webp` with transparency | Smaller than PNG. |
| Avoid | `.jpg` | No transparency — it will show a white box over the card. |

**If you have a choice, send SVG.** A single-colour SVG is worth several
coloured PNGs to me, because one file then works on the sandstone card, the
indigo card and the dark card without you exporting three versions.

### Before exporting SVG
- Convert text to outlines (otherwise Khmer fonts break on other machines).
- Flatten to one layer, remove hidden/off-canvas objects.
- Crop the artboard tight to the artwork — no surrounding whitespace.

---

## What I want, most useful first

### 1. `couple/` — the couple in traditional dress ⭐ highest value

The single biggest upgrade. My hand-drawn pair is serviceable but an
illustrator's version is much better, and it is the first thing a guest sees.

Cambodian weddings change costume several times across the day, so **variants
are a feature, not waste** — I will let couples pick which one appears.

- `couple--gold.svg` — classic gold sampot / sbai (the most common)
- `couple--white.svg` — white and gold, for the morning ceremony
- `couple--red.svg` — red and gold
- `couple--green.svg`, `couple--blue.svg` — other ceremony changes
- `couple--seated.svg` — seated at the ceremony table (as in your line-art reference)
- `couple--silhouette.svg` — single-colour silhouette, for the minimal templates

Display size ≈ 260px tall → **PNG at 800px tall**. Transparent background.
Full body, feet included, roughly centred.

### 2. `frames/` — kbach borders and corners

Dense filigree is slow to draw by hand and this is where the formal cards get
their authority.

- `corner--ornate.svg` — one top-left corner; I mirror it to the other three
- `corner--floral.svg`
- `border--full.svg` — a complete rectangular frame, portrait, hollow centre
- `arch--gold.svg` — the pointed/rounded arch outline
- `photo-frame--gold.svg` — ornate surround with a transparent hollow centre

Display ≈ 120px corner / full-page border → **PNG at 400px / 2400px tall**.

### 2a. `crests/` — standalone top and bottom ornaments

Only place ornaments here when they are intended to sit above or below the
invitation content as a crest. Corners and complete borders belong in
`frames/`, so they do not appear in the crest picker.

- `crest--top.svg` — centred ornament for the top of a card
- `crest--bottom.svg` — centred ornament for the bottom of a card

### 3. `offerings/` — ceremonial objects

- `baisei.svg` — the banana-leaf offering cone (I have a drawn one; a real one would be better)
- `phka-sla.svg` — betel-flower arrangement
- `tray.svg` — the footed offering tray (*pahn*)
- `popil.svg` — the popil candle holder
- `fruit-tray.svg` — the procession fruit trays

Display ≈ 100–140px tall → **PNG at 420px**.

### 4. `florals/` — sprays and garlands

- `spray--corner-left.svg` — a corner cluster; I mirror for the right
- `garland--horizontal.svg` — a wide swag
- `romduol.svg` — single bloom of the national flower
- `jasmine.svg`, `orchid.svg`, `lotus.svg`
- `leaves--sprig.svg`

Display ≈ 160px → **PNG at 500px**.

### 5. `patterns/` — seamless background tiles

**Must tile seamlessly** — left edge meets right, top meets bottom.

- `kbach-phka.svg`, `lotus-lattice.svg`, `temple.svg`, `damask.svg`
- Square tiles, 200–600px. Low contrast — these sit *behind* the couple's names.

### 6. `dividers/` — horizontal rules

- `divider--kbach.svg`, `divider--floral.svg`, `divider--lotus.svg`
- Wide and short, e.g. 600×60. Single colour ideally.

### 7. `seals/` — the envelope wax seal

- `seal--monogram.svg`, `seal--lotus.svg`
- Square, circular artwork.

---

## Naming

`kebab-case`, with `--` before a variant:

```
couple--gold.svg
corner--ornate.svg
spray--corner-left.svg
```

## Licensing — please read

This is built to become a real product, so the source matters. For each file,
tell me where it came from and add a line to `credits.json` in this folder:

- **Fine**: you drew it, you commissioned it, you bought a commercial licence
  (Vectorkh, Freepik Premium, Vecteezy Pro, Adobe Stock), or it is CC0 /
  public domain.
- **Not fine**: pulled from a Google Images search, or a "free" download whose
  licence forbids commercial or redistributable use.

Your reference image was watermarked **Vectorkh.com** — those are sold under a
licence. If you have bought them, they are perfect and this is exactly what I
want. If not, a licence there is inexpensive and the safest route.

I would rather ship my hand-drawn motifs than ship something that has to be
torn out later.
