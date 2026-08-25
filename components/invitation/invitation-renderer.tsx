"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { getPalette } from "@/lib/invitation/palettes"
import { getFontPairing } from "@/lib/invitation/fonts"
import { getTemplate } from "@/lib/invitation/templates"
import { cn } from "@/lib/utils"
import { DesignProvider } from "./design-context"
import { AmbientLayer } from "./ambient"
import { EnvelopeIntro } from "./envelope-intro"
import { BaiseiTemplate } from "./templates/baisei"
import { SbaiTemplate } from "./templates/sbai"
import { ReachnyTemplate } from "./templates/reachny"
import { AngkorTemplate } from "./templates/angkor"
import { BophaTemplate } from "./templates/bopha"
import { RomduolTemplate } from "./templates/romduol"
import { NagaTemplate } from "./templates/naga"
import { ChanTemplate } from "./templates/chan"
import { KravanTemplate } from "./templates/kravan"
import { SilaTemplate } from "./templates/sila"
import type { TemplateProps } from "./templates/types"

const registry = {
  baisei: BaiseiTemplate,
  sbai: SbaiTemplate,
  reachny: ReachnyTemplate,
  angkor: AngkorTemplate,
  bopha: BophaTemplate,
  romduol: RomduolTemplate,
  naga: NagaTemplate,
  chan: ChanTemplate,
  kravan: KravanTemplate,
  sila: SilaTemplate,
} as const

/**
 * Applies the chosen palette and typefaces as CSS custom properties, then hands
 * off to the template. Templates read only `--inv-*`, so changing a palette or
 * a type pairing never requires touching a template.
 */
export function InvitationRenderer({
  event,
  guestName,
  preview,
  replayKey,
  motionEnabled = false,
}: TemplateProps & { replayKey?: number; motionEnabled?: boolean }) {
  const { locale } = useLocale()
  const template = getTemplate(event.design.templateId)
  const palette = getPalette(event.design.paletteId)
  const fonts = getFontPairing(event.design.fontPairingId ?? template.defaultFontPairingId)
  const Template = registry[template.id]

  const style = {
    ...palette.vars,
    "--inv-font-display": fonts.display,
    "--inv-font-display-km": fonts.displayKhmer,
    "--inv-font-body": fonts.body,
    fontFamily: fonts.body,
  } as React.CSSProperties

  const design = event.design

  return (
    // `lang` drives Khmer line-height and letter-spacing correctness, and tells
    // screen readers which language to pronounce.
    <div
      style={style}
      className={cn("inv-root @container", !motionEnabled && "inv-static")}
      lang={locale}
    >
      <DesignProvider design={design} motionEnabled={motionEnabled}>
        <Template event={event} guestName={guestName} preview={preview} />
        <AmbientLayer effect={design.ambient ?? "none"} enabled={motionEnabled} />
        <EnvelopeIntro
          event={event}
          guestName={guestName}
          enabled={motionEnabled && Boolean(design.envelopeIntro)}
          replayKey={replayKey}
        />
      </DesignProvider>
    </div>
  )
}
