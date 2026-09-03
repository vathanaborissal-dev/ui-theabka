import {
  MascotMotion,
  type MascotMotion as MascotMotionName,
} from "@/components/brand/mascot"
import { cn } from "@/lib/utils"

/**
 * Compact, character-led feedback for user-triggered work.
 *
 * Buttons and inline action rows use Thiep because these waits are caused by
 * something the person just asked the app to do. Route and data loading keep
 * their content-shaped skeletons, and navigation hints use a neutral dot
 * treatment, so the two loading languages never compete on one surface.
 */
export function BrandSpinner({
  className,
  label = "Loading",
  motion = "loading",
  size = 24,
}: {
  className?: string
  /** Announced to screen readers. Pass null-ish text only when a sibling already says it. */
  label?: string
  motion?: MascotMotionName
  size?: number
}) {
  const announced = Boolean(label)

  return (
    <span
      role={announced ? "status" : undefined}
      aria-label={announced ? label : undefined}
      aria-hidden={announced ? undefined : true}
      className={cn("inline-grid shrink-0 place-items-center", className)}
      style={{ minWidth: size }}
    >
      <MascotMotion motion={motion} size={size} />
    </span>
  )
}
