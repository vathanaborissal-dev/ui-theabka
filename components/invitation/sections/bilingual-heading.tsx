"use client"

import { cn } from "@/lib/utils"
import type { LocalizedText } from "@/lib/types"

/**
 * A heading in both languages at once.
 *
 * Every other template shows one language and hides the other, because the
 * guest picked one. This kind of card shows both together on purpose: the Khmer
 * line is the formal wording and the English beneath it is a courtesy to
 * relatives who read Latin script, and a family sending one link to both wants
 * neither half to be a click away.
 *
 * The two scripts get different faces because they are doing different jobs —
 * Moul carries the ceremony, the script hand is a caption under it — so a
 * single font at two sizes would flatten the distinction the design is making.
 */
export function BilingualHeading({
  value,
  className,
  size = "section",
}: {
  value: LocalizedText | undefined
  className?: string
  /** "section" for a heading, "lead" for the card's own title. */
  size?: "section" | "lead"
}) {
  const km = value?.km?.trim()
  const en = value?.en?.trim()
  if (!km && !en) return null

  return (
    <div className={cn("text-center", className)}>
      {km ? (
        <p
          lang="km"
          className={cn(
            "leading-relaxed text-(--inv-accent)",
            size === "lead"
              ? "text-[clamp(1.375rem,7cqi,1.875rem)]"
              : "text-[clamp(1.0625rem,5cqi,1.25rem)]"
          )}
          style={{ fontFamily: "var(--font-khmer-display-stack)" }}
        >
          {km}
        </p>
      ) : null}
      {en ? (
        <p
          lang="en"
          className={cn(
            "mt-1 leading-snug text-(--inv-accent)/75",
            size === "lead" ? "text-[clamp(1.125rem,5.5cqi,1.5rem)]" : "text-[clamp(0.9375rem,4.2cqi,1.125rem)]"
          )}
          style={{ fontFamily: "var(--font-latin-script)" }}
        >
          {en}
        </p>
      ) : null}
    </div>
  )
}
