"use client"

import * as React from "react"
import { ArrowRight, Megaphone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useLocale } from "@/components/providers/locale-provider"
import { createPersistedStore } from "@/lib/persisted-store"
import { LATEST_WHATS_NEW_RELEASE, WHATS_NEW_RELEASES } from "@/lib/whats-new"
import { cn } from "@/lib/utils"

const whatsNewSeenStore = createPersistedStore<"new" | "seen">(
  `theabka.whatsNew.${LATEST_WHATS_NEW_RELEASE.id}`,
  "new",
  (value) => value === "new" || value === "seen"
)

export function WhatsNewCard({ collapsed = false }: { collapsed?: boolean }) {
  const { t, L } = useLocale()
  const [open, setOpen] = React.useState(false)
  const status = React.useSyncExternalStore(
    whatsNewSeenStore.subscribe,
    whatsNewSeenStore.getSnapshot,
    whatsNewSeenStore.getServerSnapshot
  )
  const isNew = status === "new"

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next && isNew) whatsNewSeenStore.set("seen")
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label={t("whatsNew.title")}
            className={cn(
              "group relative outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              collapsed
                ? "flex size-9 items-center justify-center rounded-[var(--btn-radius)] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                : "w-full rounded-[var(--card-radius)] border border-sidebar-border bg-card p-3 text-left shadow-(--shadow-card) hover:border-primary/25 hover:bg-sidebar-accent/45"
            )}
          />
        }
      >
        {collapsed ? (
          <>
            <Megaphone className="size-4" aria-hidden="true" />
            {isNew ? (
              <span
                className="absolute top-0.5 right-0.5 size-2 rounded-full bg-primary ring-2 ring-sidebar"
                aria-hidden="true"
              />
            ) : null}
          </>
        ) : (
          <>
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Megaphone className="size-4 text-primary" aria-hidden="true" />
                {t("whatsNew.title")}
              </span>
              {isNew ? <Badge className="h-4 px-1.5 text-[0.625rem]">{t("whatsNew.new")}</Badge> : null}
            </span>
            <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
              {t("whatsNew.cardDescription")}
            </span>
            <span className="mt-2.5 flex items-center gap-1 text-xs font-medium text-primary">
              {t("whatsNew.viewUpdates")}
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </>
        )}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 pt-5 pb-4">
          <div className="mb-3 flex size-9 items-center justify-center rounded-[var(--btn-radius)] bg-primary/10 text-primary">
            <Megaphone className="size-4" aria-hidden="true" />
          </div>
          <SheetTitle className="text-lg">{t("whatsNew.title")}</SheetTitle>
          <SheetDescription>{t("whatsNew.sheetDescription")}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-8">
            {WHATS_NEW_RELEASES.map((release, releaseIndex) => (
              <section key={release.id}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-foreground">
                    {releaseIndex === 0 ? t("whatsNew.latest") : L(release.date)}
                  </h2>
                  {releaseIndex === 0 ? (
                    <span className="text-xs text-muted-foreground">{L(release.date)}</span>
                  ) : null}
                </div>

                <ul className="space-y-6">
                  {release.items.map(({ icon: Icon, title, description }) => (
                    <li key={`${release.id}-${title.en}`} className="flex gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-[var(--btn-radius)] bg-muted text-primary">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <h3 className="text-sm font-medium text-foreground">{L(title)}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {L(description)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
