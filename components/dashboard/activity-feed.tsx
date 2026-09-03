"use client"

import { Coins, ListChecks, Mail, Receipt, Share2, UserPlus } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { useLocale } from "@/components/providers/locale-provider"
import { formatRelative } from "@/lib/format"
import type { Activity, ActivityKind } from "@/lib/types"

const icons: Record<ActivityKind, typeof Mail> = {
  rsvp: Mail,
  gift: Coins,
  guest: UserPlus,
  task: ListChecks,
  expense: Receipt,
  share: Share2,
}

export function ActivityFeed({ activity }: { activity: Activity[] }) {
  const { t, L, locale } = useLocale()
  const items = activity.slice(0, 7)

  return (
    <section className="rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
      <header className="border-b border-border/70 p-5">
        <h2 className="display text-base">{t("dash.recentActivity")}</h2>
      </header>

      {items.length === 0 ? (
        <div className="p-5">
          <EmptyState compact icon={Mail} mascotMotion="idle" title={t("dash.noActivity")} />
        </div>
      ) : (
        <ol className="p-5">
          {items.map((item, i) => {
            const Icon = icons[item.kind]
            const isLast = i === items.length - 1
            return (
              <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
                {!isLast ? (
                  <span
                    className="absolute top-7 bottom-0 left-[0.6875rem] w-px bg-border"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="relative z-10 mt-0.5 flex size-[1.375rem] shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-4 ring-card">
                  <Icon className="size-3" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-foreground">{L(item.message)}</span>
                  <time
                    dateTime={item.at}
                    className="mt-0.5 block text-xs text-muted-foreground"
                  >
                    {formatRelative(item.at, locale)}
                  </time>
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
