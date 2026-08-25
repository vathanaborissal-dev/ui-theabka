import type { InvitationDesign, OrnamentLevel } from "@/lib/types"
import type { PatternId } from "@/components/invitation/patterns"

/**
 * Resolves a template's decorative settings from the design, falling back to
 * the template's own default. Keeps the "how ornate is this?" decision in one
 * place instead of scattering `design.ornamentLevel === "rich"` through JSX.
 */
export function useOrnaments(design: InvitationDesign, fallback: OrnamentLevel = "subtle") {
  const level: OrnamentLevel = design.ornamentLevel ?? fallback
  const pattern = (design.patternId ?? "none") as PatternId

  return {
    level,
    pattern: level === "none" ? ("none" as PatternId) : pattern,
    patternOpacity: level === "rich" ? 0.09 : 0.05,
    showCorners: level === "rich",
    showArch: level !== "none",
    showBorders: level !== "none",
    sectionOrnament: (level === "rich" ? "frieze" : level === "subtle" ? "lotus" : "rule") as
      | "frieze"
      | "lotus"
      | "rule",
  }
}
