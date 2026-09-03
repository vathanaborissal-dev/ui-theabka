import type { CSSProperties } from "react"

/**
 * Drawing a QR onto a printable image, themed to the couple's own invitation.
 *
 * Everything here composes onto a canvas by hand rather than screenshotting
 * the DOM. A DOM-rasterising library would carry its own font and CSS quirks,
 * and the things being drawn — a QR, a couple of motifs, a few lines of type —
 * are exactly what a canvas does well. It also means the output can be five
 * times the size it appears on screen, which is what "print this on a wall"
 * needs.
 *
 * The QR itself comes from the SVG already on the page: it is pure `<path>`
 * data with no external references, so serialising it and drawing it keeps the
 * canvas untainted and the code crisp at any size. The two ornaments below are
 * drawn the same way — small, self-contained SVGs baked at their target size
 * before rasterising — copied from the same kbach vocabulary the invitation
 * itself uses (`components/invitation/ornaments.tsx`, `KbachDivider` and
 * `LotusMark`), so a card exported from here reads as the same object rather
 * than a generic export tacked on beside it.
 */

/**
 * Rasterises an on-page QR `<svg>` at the size it will be drawn.
 *
 * The on-page QR is coloured with the invitation's own `var(--inv-fg)` /
 * `var(--inv-bg)` so it matches what surrounds it on screen. Serialised
 * standalone into a data URI it has no document to resolve those custom
 * properties against — an orphaned SVG's `fill` would compute to black —
 * so they are swapped here for the same resolved colours the rest of this
 * export already draws with.
 */
async function qrImage(
  elementId: string,
  size: number,
  colors: { fg: string; bg: string }
): Promise<HTMLImageElement | null> {
  const el = document.getElementById(elementId)
  if (!el) return null

  const clone = el.cloneNode(true) as SVGElement
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  clone.setAttribute("width", String(size))
  clone.setAttribute("height", String(size))

  const markup = new XMLSerializer()
    .serializeToString(clone)
    .replaceAll("var(--inv-fg)", colors.fg)
    .replaceAll("var(--inv-bg)", colors.bg)

  return svgImage(markup)
}

/** Rasterises a standalone SVG string — used for the two motifs below. */
async function svgImage(markup: string): Promise<HTMLImageElement | null> {
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })
}

/** The lotus-and-rule divider that sits under a section heading on the card. */
function kbachDividerSvg(color: string, width: number, height: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 200 24" fill="none" stroke="${color}" stroke-width="1">
    <path d="M0 12h62" opacity="0.5"/>
    <path d="M138 12h62" opacity="0.5"/>
    <path d="M100 3c4.2 5.4 4.2 12.6 0 18-4.2-5.4-4.2-12.6 0-18Z"/>
    <path d="M100 12c5.4-4.2 12.6-4.2 18 0-5.4 4.2-12.6 4.2-18 0Z"/>
    <path d="M100 12c-5.4-4.2-12.6-4.2-18 0 5.4 4.2 12.6 4.2 18 0Z"/>
    <circle cx="126" cy="12" r="1.4" fill="${color}" stroke="none"/>
    <circle cx="74" cy="12" r="1.4" fill="${color}" stroke="none"/>
  </svg>`
}

/**
 * The Theabka arch mark, for the credit line at the foot of an export.
 *
 * The lotus motifs above belong to the couple's invitation; this one is the
 * product's, so it is kept small, muted and out of the way rather than
 * competing with their names. The viewBox is offset by the same 8.5 the app's
 * `BrandMark` uses: the delivered path is drawn low in its square, and a
 * credit line that sits visibly below its own text reads as a mistake.
 */
function brandMarkSvg(ink: string, seal: string, size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 8.5 100 100">
    <path d="M25 87 V47 Q50 13 75 47 V87 Z" fill="none" stroke="${ink}" stroke-width="10" stroke-linejoin="round"/>
    <circle cx="50" cy="62" r="7.5" fill="${seal}"/>
  </svg>`
}

/** The single-lotus section marker, used here as a small quiet anchor. */
function lotusMarkSvg(color: string, width: number, height: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 32 32" fill="${color}">
    <path d="M16 4c3.3 4.6 3.3 9.1 0 13.7-3.3-4.6-3.3-9.1 0-13.7Z" opacity="0.9"/>
    <path d="M16 17.7c4.6-3.3 9.1-3.3 13.7 0-4.6 3.3-9.1 3.3-13.7 0Z" opacity="0.6"/>
    <path d="M16 17.7c-4.6-3.3-9.1-3.3-13.7 0 4.6 3.3 9.1 3.3 13.7 0Z" opacity="0.6"/>
    <path d="M16 17.7c3.3 4.6 3.3 8.2 0 11.3-3.3-3.1-3.3-6.7 0-11.3Z" opacity="0.35"/>
  </svg>`
}

function download(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }, "image/png")
}

/**
 * Wraps text to a width, in canvas rather than in CSS.
 *
 * Khmer does not break on spaces, so a long Khmer line would otherwise run off
 * the edge: when a single "word" is wider than the line, it is broken by
 * character instead.
 */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = lines.length ? `${lines[lines.length - 1]} ${word}` : word
    if (lines.length && ctx.measureText(candidate).width <= maxWidth) {
      lines[lines.length - 1] = candidate
      continue
    }
    if (ctx.measureText(word).width <= maxWidth) {
      lines.push(word)
      continue
    }
    let chunk = ""
    for (const char of word) {
      if (ctx.measureText(chunk + char).width > maxWidth && chunk) {
        lines.push(chunk)
        chunk = char
      } else {
        chunk += char
      }
    }
    if (chunk) lines.push(chunk)
  }
  return lines
}

/**
 * Draws text with letter-spacing, left to right from `x`.
 *
 * Canvas's own `letterSpacing` property is still inconsistent across engines,
 * and an eyebrow is the one line here where the tracking is the point — an
 * uppercase label set solid reads as a mistake, not a choice.
 */
function drawTracked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  let cursor = x
  for (const char of text) {
    ctx.fillText(char, cursor, y)
    cursor += ctx.measureText(char).width + spacing
  }
}

/** Total width of a tracked run, for centring it before drawing. */
function trackedWidth(ctx: CanvasRenderingContext2D, text: string, spacing: number): number {
  const chars = [...text]
  const letters = chars.reduce((sum, char) => sum + ctx.measureText(char).width, 0)
  return letters + spacing * Math.max(0, chars.length - 1)
}

/** Four small corner brackets around a square plate — a quiet frame cue. */
function drawCornerTicks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  tick: number,
  color: string,
  lineWidth: number
) {
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineCap = "round"
  const corners: [number, number, number, number][] = [
    [x, y, 1, 1],
    [x + size, y, -1, 1],
    [x, y + size, 1, -1],
    [x + size, y + size, -1, -1],
  ]
  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath()
    ctx.moveTo(cx + dx * tick, cy)
    ctx.lineTo(cx, cy)
    ctx.lineTo(cx, cy + dy * tick)
    ctx.stroke()
  }
}

/** A filled rounded rectangle, drawn by hand rather than relying on `roundRect` support. */
function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
  ctx.fill()
}

/**
 * "▢ Theabka" — the mark and the wordmark, drawn as one credit.
 *
 * Muted rather than in brand garnet: this sheet belongs to the couple, and a
 * full-strength logo on it would be the product talking over their names. The
 * wordmark is live text in Quicksand for the same reason the app's is — the
 * delivered wordmark files carry `<text>` rather than outlines, so drawing
 * them as an image would fall back to whatever face the canvas had.
 */
async function drawBrandCredit(
  ctx: CanvasRenderingContext2D,
  {
    x,
    y,
    size,
    theme,
    align,
  }: {
    x: number
    y: number
    size: number
    theme: ResolvedTheme
    align: "left" | "centre"
  }
) {
  const gap = Math.round(size * 0.36)
  const font = `700 ${size}px ${theme.fontBrand}`

  const previousAlign = ctx.textAlign
  const previousBaseline = ctx.textBaseline
  ctx.textAlign = "left"
  ctx.textBaseline = "top"
  ctx.font = font
  const wordWidth = ctx.measureText("Theabka").width
  const total = size + gap + wordWidth
  const left = align === "centre" ? x - total / 2 : x

  const mark = await svgImage(brandMarkSvg(theme.muted, theme.gold, size))
  if (mark) ctx.drawImage(mark, left, y, size, size)

  ctx.fillStyle = theme.muted
  ctx.font = font
  ctx.fillText("Theabka", left + size + gap, y + Math.round(size * 0.08))
  ctx.textAlign = previousAlign
  ctx.textBaseline = previousBaseline
}

export type PosterCopy = {
  /** Small line above the title, e.g. "Will you join us?" */
  eyebrow?: string
  title: string
  /** Date and time, or any second line. */
  subtitle?: string
  /** The instruction under the QR, e.g. "Scan to take photos". */
  caption?: string
  /** Printed small at the very bottom, e.g. the link itself. */
  footnote?: string
}

type ResolvedTheme = {
  bg: string
  surface: string
  fg: string
  muted: string
  accent: string
  gold: string
  border: string
  fontDisplay: string
  fontBody: string
  /** Quicksand, the wordmark's own face — see `components/app-shell/brand.tsx`. */
  fontBrand: string
}

/** What an export looks like with no invitation to match — plain, not undesigned. */
const FALLBACK_THEME: ResolvedTheme = {
  bg: "#ffffff",
  surface: "#ffffff",
  fg: "#1c1917",
  muted: "#6b6257",
  accent: "#7a2e2e",
  gold: "#b08e4f",
  border: "#e6e0d4",
  fontDisplay: 'Georgia, "Noto Serif Khmer", serif',
  fontBody: "ui-sans-serif, system-ui, sans-serif",
  fontBrand: '"Trebuchet MS", ui-sans-serif, sans-serif',
}

/**
 * Resolves the invitation's theme — the same `--inv-*` custom properties the
 * card itself renders with (see `lib/invitation/theme.ts`) — into concrete
 * values a canvas can use.
 *
 * `ctx.fillStyle` cannot follow a `var()`, and a couple's own colour override
 * is exactly that under the hood: `color-mix(in oklab, ${textColor} 78%,
 * var(--inv-bg))`. A hidden, briefly-mounted element gets the browser to
 * resolve that the same way it would for anything actually on screen, rather
 * than re-implementing colour-mix and the font-pairing fallback chain here.
 */
async function resolveTheme(theme?: CSSProperties): Promise<ResolvedTheme> {
  if (!theme || typeof document === "undefined") return FALLBACK_THEME
  if (document.fonts?.ready) await document.fonts.ready

  const probe = document.createElement("div")
  probe.style.position = "fixed"
  probe.style.top = "-9999px"
  probe.style.left = "-9999px"
  probe.style.pointerEvents = "none"
  for (const [key, value] of Object.entries(theme)) {
    if (key.startsWith("--") && typeof value === "string") probe.style.setProperty(key, value)
  }
  document.body.appendChild(probe)

  const read = (key: string) => getComputedStyle(probe).getPropertyValue(key).trim()
  const bg = read("--inv-bg")
  probe.style.fontFamily = "var(--inv-font-display)"
  const fontDisplay = getComputedStyle(probe).fontFamily
  probe.style.fontFamily = "var(--inv-font-body)"
  const fontBody = getComputedStyle(probe).fontFamily
  probe.style.fontFamily = "var(--font-quicksand)"
  const fontBrand = getComputedStyle(probe).fontFamily

  const resolved: ResolvedTheme = {
    bg: bg || FALLBACK_THEME.bg,
    surface: read("--inv-surface") || bg || FALLBACK_THEME.surface,
    fg: read("--inv-fg") || FALLBACK_THEME.fg,
    muted: read("--inv-muted") || FALLBACK_THEME.muted,
    accent: read("--inv-accent") || FALLBACK_THEME.accent,
    gold: read("--inv-gold") || FALLBACK_THEME.gold,
    border: read("--inv-border") || FALLBACK_THEME.border,
    fontDisplay: fontDisplay || FALLBACK_THEME.fontDisplay,
    fontBody: fontBody || FALLBACK_THEME.fontBody,
    fontBrand: fontBrand || FALLBACK_THEME.fontBrand,
  }

  probe.remove()
  return resolved
}

/**
 * A tall poster: one big QR, the couple's names, and one instruction — now
 * dressed the way the invitation itself is, in its own palette and type,
 * with the same lotus-and-rule motifs the card uses as section markers.
 *
 * A4 proportions at 300dpi-ish, so it prints sharp at that size and still
 * looks right blown up to a roll-up banner — the QR is vector-sourced, and the
 * type is drawn at the output size rather than scaled up from the screen.
 */
export async function exportQrPoster({
  qrElementId,
  filename,
  copy,
  theme,
  width = 2480,
}: {
  qrElementId: string
  filename: string
  copy: PosterCopy
  /** The invitation's own theme — `invitationTheme(event.design, locale)`. */
  theme?: CSSProperties
  /** Output width in pixels. Default is A4 at 300dpi. */
  width?: number
}): Promise<boolean> {
  const t = await resolveTheme(theme)
  const height = Math.round(width * Math.SQRT2)
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return false

  ctx.fillStyle = t.bg
  ctx.fillRect(0, 0, width, height)

  // A double rule, inset — the frame a printed invitation actually uses,
  // rather than the single hairline a generic export would settle for.
  const margin = Math.round(width * 0.06)
  const rule = Math.max(2, Math.round(width * 0.0014))
  ctx.strokeStyle = t.gold
  ctx.lineWidth = rule
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2)
  ctx.strokeStyle = t.border
  ctx.lineWidth = Math.max(1, Math.round(rule * 0.7))
  const innerMargin = margin + Math.round(width * 0.012)
  ctx.strokeRect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2)

  const centre = width / 2
  const contentWidth = width - margin * 4.4
  ctx.textAlign = "center"

  // The lotus marker the invitation itself uses to open a section — placed
  // here for the same reason, rather than starting cold on a line of type.
  const markSize = Math.round(width * 0.05)
  const mark = await svgImage(lotusMarkSvg(t.gold, markSize, markSize))
  let y = Math.round(height * 0.1)
  if (mark) {
    ctx.drawImage(mark, centre - markSize / 2, y, markSize, markSize)
    y += markSize + Math.round(width * 0.032)
  }

  if (copy.eyebrow) {
    ctx.fillStyle = t.accent
    const eyebrowSize = Math.round(width * 0.026)
    ctx.font = `${eyebrowSize}px ${t.fontBody}`
    const label = copy.eyebrow.toUpperCase()
    const spacing = eyebrowSize * 0.14
    drawTracked(ctx, label, centre - trackedWidth(ctx, label, spacing) / 2, y, spacing)
    y += Math.round(width * 0.05)
  }

  ctx.fillStyle = t.fg
  let titleSize = Math.round(width * 0.062)
  const minPosterTitle = Math.round(width * 0.04)
  let titleLines: string[] = []
  for (;;) {
    ctx.font = `${titleSize}px ${t.fontDisplay}`
    titleLines = wrap(ctx, copy.title, contentWidth)
    if (titleLines.length <= 3 || titleSize <= minPosterTitle) break
    titleSize -= Math.max(1, Math.round(width * 0.002))
  }
  for (const line of titleLines) {
    ctx.fillText(line, centre, y)
    y += Math.round(titleSize * 1.22)
  }

  // The same divider the card uses under a heading, not a plain gap.
  y += Math.round(width * 0.012)
  const dividerWidth = Math.round(width * 0.24)
  const dividerHeight = Math.round(dividerWidth * 0.12)
  const divider = await svgImage(kbachDividerSvg(t.gold, dividerWidth, dividerHeight))
  if (divider) {
    ctx.drawImage(divider, centre - dividerWidth / 2, y, dividerWidth, dividerHeight)
    y += dividerHeight + Math.round(width * 0.03)
  }

  if (copy.subtitle) {
    ctx.fillStyle = t.muted
    ctx.font = `${Math.round(width * 0.03)}px ${t.fontBody}`
    for (const line of wrap(ctx, copy.subtitle, contentWidth)) {
      ctx.fillText(line, centre, y)
      y += Math.round(width * 0.042)
    }
  }

  // The QR, as large as the sheet allows — this is the part people walk up to.
  //
  // Floored rather than fixed: a title that wraps to three lines used to run
  // straight into the plate, because the type flowed down from the top while
  // the QR sat at a hard 42% of the sheet.
  const qrSize = Math.round(width * 0.52)

  // Measure the bottom stack before placing the plate, so the QR can be pulled
  // up when the type above it has run long rather than pushing the caption
  // through the footnote.
  const captionSize = Math.round(width * 0.038)
  ctx.font = `600 ${captionSize}px ${t.fontBody}`
  const captionLines = copy.caption ? wrap(ctx, copy.caption, contentWidth) : []
  const bottomReserve =
    Math.round(width * 0.078) +
    captionLines.length * Math.round(captionSize * 1.35) +
    Math.round(width * 0.1)
  const maxQrTop = height - innerMargin - qrSize - bottomReserve

  /*
   * Prefer 42% of the sheet; never sit on the title; give way at the bottom
   * when both cannot hold. Clearing the title wins the tie because the space
   * under the plate is margin, while the space above it has words in it.
   */
  const qrTop = Math.max(
    Math.round(y + width * 0.04),
    Math.min(Math.round(height * 0.42), maxQrTop)
  )
  const image = await qrImage(qrElementId, qrSize, { fg: t.fg, bg: t.surface })
  if (!image) return false

  // A faint watermark, the size a folded card's own would be, sitting behind
  // the plate — a printed premium card carries one line like this, not a flat
  // field of white.
  const watermarkSize = Math.round(width * 0.5)
  const watermark = await svgImage(lotusMarkSvg(t.gold, watermarkSize, watermarkSize))
  if (watermark) {
    ctx.globalAlpha = 0.05
    ctx.drawImage(
      watermark,
      centre - watermarkSize / 2,
      qrTop + qrSize / 2 - watermarkSize / 2,
      watermarkSize,
      watermarkSize
    )
    ctx.globalAlpha = 1
  }

  // A bedded plate with a gold ring and quiet corner ticks — scanners want
  // contrast, and the ticks read as a frame rather than a sticker.
  const bed = qrSize + Math.round(width * 0.05)
  const bedLeft = centre - bed / 2
  const bedTop = qrTop - (bed - qrSize) / 2
  ctx.fillStyle = t.surface
  ctx.fillRect(bedLeft, bedTop, bed, bed)
  ctx.strokeStyle = t.gold
  ctx.lineWidth = Math.max(1, Math.round(width * 0.0012))
  ctx.strokeRect(bedLeft, bedTop, bed, bed)
  drawCornerTicks(
    ctx,
    bedLeft - Math.round(width * 0.012),
    bedTop - Math.round(width * 0.012),
    bed + Math.round(width * 0.024),
    Math.round(width * 0.028),
    t.gold,
    Math.max(1, Math.round(width * 0.0018))
  )
  ctx.drawImage(image, centre - qrSize / 2, qrTop, qrSize, qrSize)

  y = qrTop + qrSize + Math.round(width * 0.078)

  if (captionLines.length) {
    ctx.fillStyle = t.accent
    ctx.font = `600 ${captionSize}px ${t.fontBody}`
    for (const line of captionLines) {
      ctx.fillText(line, centre, y)
      y += Math.round(captionSize * 1.35)
    }
  }

  const brandSize = Math.round(width * 0.028)
  const footBaseline = height - innerMargin - Math.round(width * 0.05)

  if (copy.footnote) {
    ctx.fillStyle = t.muted
    ctx.font = `${Math.round(width * 0.022)}px ui-monospace, monospace`
    ctx.fillText(copy.footnote, centre, footBaseline)
  }

  await drawBrandCredit(ctx, {
    x: centre,
    y: footBaseline + Math.round(width * 0.014),
    size: brandSize,
    theme: t,
    align: "centre",
  })

  download(canvas, filename)
  return true
}

/**
 * The small card that goes inside an envelope: QR on the left, the details
 * beside it, mounted like a real card rather than printed flat on a sheet.
 * Landscape, because that is how it sits in the hand.
 */
export async function exportInsertCard({
  qrElementId,
  filename,
  copy,
  theme,
  width = 1650,
}: {
  qrElementId: string
  filename: string
  copy: PosterCopy
  /** The invitation's own theme — `invitationTheme(event.design, locale)`. */
  theme?: CSSProperties
  width?: number
}): Promise<boolean> {
  const t = await resolveTheme(theme)
  const height = Math.round(width * 0.62)
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return false

  ctx.fillStyle = t.bg
  ctx.fillRect(0, 0, width, height)

  const margin = Math.round(width * 0.03)
  const rule = Math.max(2, Math.round(width * 0.0018))
  ctx.strokeStyle = t.gold
  ctx.lineWidth = rule
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2)

  // A mounted card, not a flat sheet — the surface panel sits a shade off the
  // ground colour exactly the way the invitation's own card does.
  const panelInset = margin + Math.round(width * 0.014)
  ctx.fillStyle = t.surface
  fillRoundedRect(
    ctx,
    panelInset,
    panelInset,
    width - panelInset * 2,
    height - panelInset * 2,
    Math.round(width * 0.012)
  )

  const contentMargin = panelInset + Math.round(width * 0.032)
  const qrSize = Math.round((height - panelInset * 2) * 0.52)
  const qrLeft = contentMargin
  const qrTop = Math.round((height - qrSize) / 2)
  const image = await qrImage(qrElementId, qrSize, { fg: t.fg, bg: t.bg })
  if (!image) return false

  ctx.fillStyle = t.bg
  ctx.fillRect(qrLeft, qrTop, qrSize, qrSize)
  ctx.strokeStyle = t.gold
  ctx.lineWidth = Math.max(1, Math.round(width * 0.0016))
  ctx.strokeRect(qrLeft, qrTop, qrSize, qrSize)
  drawCornerTicks(
    ctx,
    qrLeft - Math.round(width * 0.014),
    qrTop - Math.round(width * 0.014),
    qrSize + Math.round(width * 0.028),
    Math.round(width * 0.026),
    t.gold,
    Math.max(1, Math.round(width * 0.002))
  )
  ctx.drawImage(image, qrLeft, qrTop, qrSize, qrSize)

  const textLeft = qrLeft + qrSize + Math.round(width * 0.075)
  const textWidth = width - textLeft - contentMargin
  ctx.textAlign = "left"
  /*
   * Top-aligned for the whole column.
   *
   * With an alphabetic baseline every measurement here has to carry an ascent
   * correction, which is what let the caption drift out of the flow in the
   * first place. Measuring from the top makes a line's height and its advance
   * the same number, so the block below can be measured before it is drawn.
   */
  ctx.textBaseline = "top"

  /*
   * Fit the title to the column rather than letting it wrap forever.
   *
   * Two lines is the honest ceiling for a card this size; a third would push
   * the date and the instruction off the panel. Long names shrink instead —
   * "The Wedding of Rithy & Sreyneang" is a perfectly ordinary title and it
   * does not fit on one line at the full size.
   */
  const maxTitleSize = Math.round(width * 0.05)
  const minTitleSize = Math.round(width * 0.032)
  let titleSize = maxTitleSize
  let titleLines: string[] = []
  for (;;) {
    ctx.font = `${titleSize}px ${t.fontDisplay}`
    titleLines = wrap(ctx, copy.title, textWidth)
    if (titleLines.length <= 2 || titleSize <= minTitleSize) break
    titleSize -= Math.max(1, Math.round(width * 0.002))
  }

  const eyebrowSize = Math.round(width * 0.024)
  const subtitleSize = Math.round(width * 0.026)
  const captionSize = Math.round(width * 0.024)
  const brandSize = Math.round(width * 0.026)

  const titleAdvance = Math.round(titleSize * 1.2)
  const subtitleAdvance = Math.round(width * 0.036)
  const dividerWidth = Math.round(width * 0.13)
  const dividerHeight = Math.round(dividerWidth * 0.12)

  let subtitleLines: string[] = []
  if (copy.subtitle) {
    ctx.font = `${subtitleSize}px ${t.fontBody}`
    subtitleLines = wrap(ctx, copy.subtitle, textWidth)
  }

  const captionMarkSize = Math.round(width * 0.022)
  let captionLines: string[] = []
  if (copy.caption) {
    ctx.font = `600 ${captionSize}px ${t.fontBody}`
    captionLines = wrap(
      ctx,
      copy.caption,
      textWidth - captionMarkSize - Math.round(width * 0.012)
    )
  }
  const captionAdvance = Math.round(captionSize * 1.3)

  // Measure the whole column, then centre it against the QR beside it. Every
  // block below advances the same `y`, so nothing can be placed on top of
  // anything else however the title wraps.
  const gapAfterEyebrow = Math.round(width * 0.02)
  const gapBeforeDivider = Math.round(width * 0.012)
  const gapAfterDivider = Math.round(width * 0.022)
  const gapBeforeCaption = Math.round(width * 0.03)
  const gapBeforeBrand = Math.round(width * 0.034)

  let blockHeight = 0
  if (copy.eyebrow) blockHeight += eyebrowSize + gapAfterEyebrow
  blockHeight += titleLines.length * titleAdvance
  blockHeight += gapBeforeDivider + dividerHeight + gapAfterDivider
  if (subtitleLines.length) blockHeight += subtitleLines.length * subtitleAdvance
  if (captionLines.length) blockHeight += gapBeforeCaption + captionLines.length * captionAdvance
  blockHeight += gapBeforeBrand + brandSize

  const panelTop = panelInset
  const panelHeight = height - panelInset * 2
  let y = Math.max(panelTop + Math.round(width * 0.03), panelTop + (panelHeight - blockHeight) / 2)

  if (copy.eyebrow) {
    ctx.fillStyle = t.accent
    ctx.font = `${eyebrowSize}px ${t.fontBody}`
    drawTracked(ctx, copy.eyebrow.toUpperCase(), textLeft, y, eyebrowSize * 0.14)
    y += eyebrowSize + gapAfterEyebrow
  }

  ctx.fillStyle = t.fg
  ctx.font = `${titleSize}px ${t.fontDisplay}`
  for (const line of titleLines) {
    ctx.fillText(line, textLeft, y)
    y += titleAdvance
  }

  y += gapBeforeDivider
  const divider = await svgImage(kbachDividerSvg(t.gold, dividerWidth, dividerHeight))
  if (divider) ctx.drawImage(divider, textLeft, y, dividerWidth, dividerHeight)
  y += dividerHeight + gapAfterDivider

  if (subtitleLines.length) {
    ctx.fillStyle = t.muted
    ctx.font = `${subtitleSize}px ${t.fontBody}`
    for (const line of subtitleLines) {
      ctx.fillText(line, textLeft, y)
      y += subtitleAdvance
    }
  }

  if (captionLines.length) {
    y += gapBeforeCaption
    const mark = await svgImage(lotusMarkSvg(t.gold, captionMarkSize, captionMarkSize))
    let captionLeft = textLeft
    if (mark) {
      ctx.drawImage(mark, textLeft, y + Math.round(captionSize * 0.1), captionMarkSize, captionMarkSize)
      captionLeft = textLeft + captionMarkSize + Math.round(width * 0.012)
    }
    ctx.fillStyle = t.accent
    ctx.font = `600 ${captionSize}px ${t.fontBody}`
    for (const line of captionLines) {
      ctx.fillText(line, captionLeft, y)
      y += captionAdvance
    }
  }

  // Who made the card, at the size a credit should be.
  y += gapBeforeBrand
  await drawBrandCredit(ctx, { x: textLeft, y, size: brandSize, theme: t, align: "left" })

  ctx.textBaseline = "alphabetic"

  download(canvas, filename)
  return true
}
