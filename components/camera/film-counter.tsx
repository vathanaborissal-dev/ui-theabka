"use client"

import { cn } from "@/lib/utils"

/**
 * Shots left, drawn as frames of film rather than a number.
 *
 * A counter that reads "7" is information; a strip that visibly empties as the
 * evening goes on is the reason people frame their shots instead of spraying
 * them. Above a dozen or so the strip stops being readable, so it becomes a
 * number and keeps the last few frames.
 */
export function FilmCounter({
  left,
  total,
  tone = "onDark",
  className,
}: {
  left: number
  total: number
  /**
   * Where it is sitting.
   *
   * The same strip appears over a live viewfinder and on the couple's ivory
   * card, and gold on black is not the same gold on ivory — on the card it
   * takes the invitation's own colours instead of a dark pill.
   */
  tone?: "onDark" | "onCard"
  className?: string
}) {
  const onCard = tone === "onCard"
  const pill = onCard
    ? "border border-(--inv-border) bg-(--inv-bg)"
    : "bg-black/55 backdrop-blur-sm"
  const spent = onCard ? "bg-(--inv-border)" : "bg-white/25"
  // The card's gold on both grounds. A stock amber over the viewfinder looked
  // like a different product's chrome sitting on the couple's camera.
  const unspent = "bg-(--inv-gold)"

  if (total > 12) {
    return (
      <div
        className={cn(
          "rounded-full px-3 py-1 font-mono text-sm tabular-nums",
          pill,
          onCard ? "text-(--inv-fg)" : "text-white",
          className
        )}
      >
        {left}
        <span className="opacity-60">/{total}</span>
      </div>
    )
  }

  return (
    <div
      className={cn("flex items-center gap-1 rounded-full px-2.5 py-1.5", pill, className)}
      // The strip is decoration; the count is the fact.
      role="img"
      aria-label={`${left} of ${total} photos left`}
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-3.5 w-2 rounded-[1px] transition-colors duration-300",
            index < left ? unspent : spent
          )}
        />
      ))}
    </div>
  )
}
