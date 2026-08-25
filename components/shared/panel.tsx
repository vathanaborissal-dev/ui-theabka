import { cn } from "@/lib/utils"

/** Titled surface used for the secondary sections on management pages. */
export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)",
        className
      )}
    >
      <header
        data-print="hide"
        className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-3.5"
      >
        <h2 className="display text-base">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}
