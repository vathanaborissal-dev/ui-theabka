"use client"

import { ArrowRight, CheckCircle2, Circle } from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { EmptyState } from "@/components/shared/empty-state"
import { ListChecks } from "lucide-react"
import { useData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { daysUntil, formatDate, formatNumber } from "@/lib/format"
import { taskStats } from "@/lib/stats"
import { cn } from "@/lib/utils"
import type { EventRecord, Task } from "@/lib/types"

export function NextUpPanel({ event, tasks }: { event: EventRecord; tasks: Task[] }) {
  const { t, L, locale } = useLocale()
  const { updateTask } = useData()
  const stats = taskStats(tasks)

  const upcoming = tasks
    .filter((task) => !task.done)
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"))
    .slice(0, 5)

  return (
    <section className="rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
      <header className="flex items-start justify-between gap-3 border-b border-border/70 p-5">
        <div>
          <h2 className="display text-base">{t("dash.upcomingTasks")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatNumber(stats.done, locale)}/{formatNumber(stats.total, locale)}{" "}
            {t("planner.progress")}
          </p>
        </div>
        <ButtonLink href={`/events/${event.id}/planner`} variant="ghost" size="sm">
          {t("nav.planner")}
          <ArrowRight />
        </ButtonLink>
      </header>

      {upcoming.length === 0 ? (
        <div className="p-5">
          <EmptyState
            compact
            icon={ListChecks}
            title={t("planner.empty.title")}
            description={t("planner.empty.body")}
          />
        </div>
      ) : (
        <ul className="divide-y divide-border/70">
          {upcoming.map((task) => {
            const days = task.dueDate ? daysUntil(task.dueDate) : null
            const overdue = days !== null && days < 0
            const soon = days !== null && days >= 0 && days <= 7

            return (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => updateTask(task.id, { done: true })}
                  className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
                >
                  <span className="mt-0.5 text-muted-foreground/50 transition-colors group-hover:text-primary">
                    <Circle className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-foreground">{L(task.title)}</span>
                    {task.dueDate ? (
                      <span
                        className={cn(
                          "mt-0.5 block text-xs",
                          overdue
                            ? "font-medium text-destructive"
                            : soon
                              ? "text-warning-foreground dark:text-warning"
                              : "text-muted-foreground"
                        )}
                      >
                        {overdue ? t("planner.overdue") : t("planner.dueOn")}{" "}
                        {formatDate(task.dueDate, locale, "medium")}
                      </span>
                    ) : null}
                  </span>
                  <span className="sr-only">{t("action.done")}</span>
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-transparent" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
