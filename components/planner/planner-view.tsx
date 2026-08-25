"use client"

import * as React from "react"
import { ListChecks, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { useData, useEventData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { daysUntil, formatDate, formatNumber } from "@/lib/format"
import { taskStats } from "@/lib/stats"
import { cn } from "@/lib/utils"
import type { Task, TaskCategory } from "@/lib/types"

const CATEGORIES: TaskCategory[] = [
  "venue",
  "guests",
  "ceremony",
  "vendors",
  "attire",
  "logistics",
  "other",
]

const categoryLabels: Record<TaskCategory, { en: string; km: string }> = {
  venue: { en: "Venue", km: "ទីកន្លែង" },
  guests: { en: "Guests", km: "ភ្ញៀវ" },
  ceremony: { en: "Ceremony", km: "ពិធី" },
  vendors: { en: "Vendors", km: "អ្នកផ្គត់ផ្គង់" },
  attire: { en: "Attire", km: "សម្លៀកបំពាក់" },
  logistics: { en: "Logistics", km: "ការរៀបចំ" },
  other: { en: "Other", km: "ផ្សេងៗ" },
}

type Bucket = "overdue" | "week" | "later" | "done"

export function PlannerView({ eventId }: { eventId: string }) {
  const { event, tasks } = useEventData(eventId)
  const { addTask, updateTask, removeTask } = useData()
  const { t, L, locale } = useLocale()

  const [draft, setDraft] = React.useState("")
  const [draftCategory, setDraftCategory] = React.useState<TaskCategory>("other")
  const [draftDate, setDraftDate] = React.useState("")

  if (!event) return null

  const stats = taskStats(tasks)

  const buckets: Record<Bucket, Task[]> = { overdue: [], week: [], later: [], done: [] }
  for (const task of tasks) {
    if (task.done) {
      buckets.done.push(task)
      continue
    }
    const days = task.dueDate ? daysUntil(task.dueDate) : null
    if (days !== null && days < 0) buckets.overdue.push(task)
    else if (days !== null && days <= 7) buckets.week.push(task)
    else buckets.later.push(task)
  }
  for (const key of Object.keys(buckets) as Bucket[]) {
    buckets[key].sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const title = draft.trim()
    if (!title || !event) return
    addTask({
      id: `tk_${Date.now()}`,
      eventId: event.id,
      title: { en: title, km: title },
      category: draftCategory,
      dueDate: draftDate || undefined,
      done: false,
    })
    setDraft("")
    setDraftDate("")
  }

  const sections: Array<{ key: Bucket; label: string; tone?: string }> = [
    { key: "overdue", label: t("planner.overdue"), tone: "text-destructive" },
    { key: "week", label: t("planner.thisWeek"), tone: "text-warning-foreground dark:text-warning" },
    { key: "later", label: t("planner.later") },
    { key: "done", label: t("planner.completed") },
  ]

  return (
    <div className="space-y-5">
      <PageHeader title={t("planner.title")} description={t("planner.subtitle")} />

      <section className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card p-5 shadow-(--shadow-card)">
        <div className="flex items-baseline gap-2">
          <span className="display tnum text-3xl">{formatNumber(stats.done, locale)}</span>
          <span className="text-sm text-muted-foreground">
            {t("common.of")} {formatNumber(stats.total, locale)} {t("planner.progress")}
          </span>
        </div>
        <div className="min-w-40 flex-1">
          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={Math.round(stats.progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("planner.progress")}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${stats.progress * 100}%` }}
            />
          </div>
        </div>
        {buckets.overdue.length > 0 ? (
          <p className="text-sm font-medium text-destructive">
            {formatNumber(buckets.overdue.length, locale)} {t("planner.overdue").toLowerCase()}
          </p>
        ) : null}
      </section>

      <form
        onSubmit={submit}
        className="flex flex-wrap gap-2 rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card p-3 shadow-(--shadow-card)"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("planner.addTask")}
          aria-label={t("planner.addTask")}
          className="min-w-40 flex-1"
        />
        <Select
          value={draftCategory}
          onValueChange={(v) => setDraftCategory((v as TaskCategory) ?? "other")}
          items={CATEGORIES.map((c) => ({ value: c, label: categoryLabels[c][locale] }))}
        >
          <SelectTrigger aria-label={t("expenses.category")} className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {categoryLabels[c][locale]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={draftDate}
          onChange={(e) => setDraftDate(e.target.value)}
          aria-label={t("expenses.dueDate")}
          className="w-40"
        />
        <Button type="submit" disabled={!draft.trim()}>
          <Plus />
          {t("action.add")}
        </Button>
      </form>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={t("planner.empty.title")}
          description={t("planner.empty.body")}
        />
      ) : (
        <div className="space-y-5">
          {sections.map((section) => {
            const items = buckets[section.key]
            if (items.length === 0) return null
            return (
              <section key={section.key}>
                <h2 className={cn("eyebrow mb-2 px-1", section.tone ?? "text-muted-foreground")}>
                  {section.label}
                  <span className="ml-2 font-normal text-muted-foreground">
                    {formatNumber(items.length, locale)}
                  </span>
                </h2>

                <ul className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
                  {items.map((task) => {
                    const days = task.dueDate ? daysUntil(task.dueDate) : null
                    return (
                      <li
                        key={task.id}
                        className="group flex items-start gap-3 border-b border-border/60 px-4 py-3 last:border-0"
                      >
                        <Checkbox
                          className="mt-0.5"
                          checked={task.done}
                          onCheckedChange={(checked) =>
                            updateTask(task.id, { done: Boolean(checked) })
                          }
                          aria-label={L(task.title)}
                          id={`task-${task.id}`}
                        />
                        <label
                          htmlFor={`task-${task.id}`}
                          className="min-w-0 flex-1 cursor-pointer"
                        >
                          <span
                            className={cn(
                              "block text-sm",
                              task.done && "text-muted-foreground line-through"
                            )}
                          >
                            {L(task.title)}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                            <span className="rounded-full bg-muted px-1.5 py-0.5">
                              {categoryLabels[task.category][locale]}
                            </span>
                            {task.dueDate ? (
                              <span
                                className={cn(
                                  !task.done && days !== null && days < 0 && "font-medium text-destructive"
                                )}
                              >
                                {formatDate(task.dueDate, locale, "medium")}
                              </span>
                            ) : (
                              <span>{t("planner.noDueDate")}</span>
                            )}
                            {task.note ? <span className="truncate">· {task.note}</span> : null}
                          </span>
                        </label>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                          onClick={() => removeTask(task.id)}
                          aria-label={`${t("action.delete")} — ${L(task.title)}`}
                        >
                          <Trash2 />
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
