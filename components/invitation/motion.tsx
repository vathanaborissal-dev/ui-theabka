"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { EntranceId } from "@/lib/types"

/**
 * Honours the OS "reduce motion" setting. Read as an external store so the
 * first client render already has the right answer.
 */
/**
 * False during SSR and on the hydrating render, true afterwards. Lets a
 * component render its "before JS" output first without a setState-in-effect.
 */
const neverChanges = () => () => {}
export function useHasMounted() {
  return React.useSyncExternalStore(
    neverChanges,
    () => true,
    () => false
  )
}

export function useReducedMotion() {
  const subscribe = React.useCallback((onChange: () => void) => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  )
}

const entranceClass: Record<Exclude<EntranceId, "none">, string> = {
  fade: "inv-enter-fade",
  rise: "inv-enter-rise",
  zoom: "inv-enter-zoom",
  unfold: "inv-enter-unfold",
}

/**
 * Reveals its children when they scroll into view.
 *
 * Two things matter here. Content starts *visible* and is only hidden once we
 * know an observer will fire, so a guest with JavaScript disabled — or a
 * crawler generating a link preview — still sees the whole invitation. And when
 * the guest prefers reduced motion, nothing is hidden or animated at all.
 */
export function Reveal({
  children,
  entrance = "rise",
  delay = 0,
  className,
}: {
  children: React.ReactNode
  entrance?: EntranceId
  /** Milliseconds, for staggering siblings. */
  delay?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = React.useState(false)

  const active = entrance !== "none" && !reduced
  // Arming only after mount means the hidden state is never part of the server
  // HTML — the content is there first, then we take it away to animate it in.
  const armed = useHasMounted() && active

  React.useEffect(() => {
    if (!active || !armed) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [active, armed])

  return (
    <div
      ref={ref}
      className={cn(
        className,
        active && armed && entranceClass[entrance as Exclude<EntranceId, "none">],
        active && armed && !shown && "inv-enter-idle",
        active && armed && shown && "inv-enter-shown"
      )}
      style={delay && active ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
