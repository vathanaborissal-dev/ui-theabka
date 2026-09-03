"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { NamePlate } from "./gold-ornaments"
import { BilingualHeading } from "./sections/bilingual-heading"
import type { InvitationDesign, InvitationEvent } from "@/lib/types"

/**
 * What is written on the outside of a filmed envelope.
 *
 * The three things a sealed envelope carries and nothing else: whose wedding it
 * is, the invitation line, and — the reason a personal link exists — the name
 * of the person holding it. Everything else waits until it is open.
 */
export function EnvelopeGreeting({
  event,
  guestName,
  design,
}: {
  event: InvitationEvent
  guestName?: string
  design: InvitationDesign
}) {
  const { t } = useLocale()

  return (
    <>
      <div className="[--inv-accent:theme(colors.white)]">
        <BilingualHeading value={event.title} size="lead" className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]" />
        <BilingualHeading
          value={design.honourLabel ?? { km: t("public.honour"), en: "Invitation" }}
          className="mt-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
        />
      </div>

      <NamePlate plateId={design.namePlateId ?? "emerald"} className="mb-16">
        <p
          className="text-[clamp(0.9375rem,4.4cqi,1.125rem)] leading-snug text-balance"
          style={{ fontFamily: "var(--inv-font-display)" }}
        >
          {guestName || t("public.honourGeneric")}
        </p>
      </NamePlate>
    </>
  )
}
