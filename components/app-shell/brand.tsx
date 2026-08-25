import Link from "next/link"
import { cn } from "@/lib/utils"

/** The mark: a stylised lotus bud drawn from the Khmer "kbach" motif. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7", className)} fill="none">
      <path d="M16 3.5c3.3 4.6 3.3 9.1 0 13.7-3.3-4.6-3.3-9.1 0-13.7Z" className="fill-primary" />
      <path d="M16 17.2c4.6-3.3 9.1-3.3 13.7 0-4.6 3.3-9.1 3.3-13.7 0Z" className="fill-primary/55" />
      <path d="M16 17.2c-4.6-3.3-9.1-3.3-13.7 0 4.6 3.3 9.1 3.3 13.7 0Z" className="fill-primary/55" />
      <path d="M16 17.2c3.3 4.6 3.3 8.2 0 11.3-3.3-3.1-3.3-6.7 0-11.3Z" className="fill-gold" />
      <circle cx="16" cy="17.2" r="1.9" className="fill-background" />
    </svg>
  )
}

export function Brand({
  href = "/events",
  className,
  showWordmark = true,
}: {
  href?: string
  className?: string
  showWordmark?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <BrandMark />
      {showWordmark ? (
        <span className="display text-lg tracking-tight text-foreground">Theabka</span>
      ) : (
        <span className="sr-only">Theabka</span>
      )}
    </Link>
  )
}
