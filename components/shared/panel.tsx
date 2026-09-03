import { cn } from "@/lib/utils"

/**
 * Titled surface used for the secondary sections on management pages.
 *
 * The header stacks a title over an optional line of description, with any
 * action pinned to the right of both. A panel whose title needs a sentence to
 * explain it is common enough on the platform pages that leaving it out
 * pushed that sentence into the body, where it read as content rather than as
 * a caption.
 */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  /**
   * For a panel sharing a row with a taller one, where the content should
   * fill the leftover height rather than leaving it blank underneath.
   */
  bodyClassName?: string
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)",
        className
      )}
    >
      <header
        data-print="hide"
        className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-3.5"
      >
        <div className="min-w-0 space-y-0.5">
          <h2 className="display text-base leading-none">{title}</h2>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  )
}
