"use client"

import * as React from "react"
import {
  CalendarDays,
  Check,
  Copy,
  ExternalLink,
  Link2,
  MapPin,
  Palette,
  TriangleAlert,
  Trash2,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TimePicker } from "@/components/ui/time-picker"
import { PageHeader } from "@/components/shared/page-header"
import { BilingualField } from "@/components/invitation/builder/bilingual-field"
import { APP_THEMES } from "@/lib/themes"
import { useData, useEventData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { useTheme } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Currency } from "@/lib/types"

/** The rail's entries and the sections they point at, in page order. */
const SECTIONS = [
  { id: "details", labelKey: "settings.details", icon: CalendarDays },
  { id: "link", labelKey: "settings.link", icon: Link2 },
  { id: "venue", labelKey: "public.venueTitle", icon: MapPin },
  { id: "labels", labelKey: "settings.labels", icon: Users },
  { id: "theme", labelKey: "common.theme", icon: Palette },
  { id: "danger", labelKey: "settings.danger", icon: TriangleAlert },
] as const

/**
 * Sticky index of the page.
 *
 * A settings screen is a set of unrelated groups, not a document — the reader
 * arrives wanting one of them. The rail turns that into a single click and,
 * with the scroll-spy, doubles as a "you are here" for a page long enough to
 * lose your place in.
 */
function SettingsNav({ active }: { active: string }) {
  const { t } = useLocale()
  return (
    <nav aria-label={t("nav.settings")} className="hidden lg:block">
      <ul className="sticky top-20 space-y-0.5">
        {SECTIONS.map((section) => {
          const Icon = section.icon
          const current = active === section.id
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={current ? "true" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-[var(--btn-radius)] px-2.5 py-2 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  current
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  section.id === "danger" && "text-destructive/80 hover:text-destructive"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{t(section.labelKey)}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * One settings group, as a card the rail can target.
 *
 * `scroll-mt` keeps the heading clear of the sticky top bar when jumped to —
 * without it an anchor lands with the title hidden behind the chrome.
 */
function SettingsSection({
  id,
  title,
  description,
  icon: Icon,
  children,
  tone = "default",
}: {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  tone?: "default" | "danger"
}) {
  return (
    <section
      id={id}
      data-settings-section={id}
      className={cn(
        "scroll-mt-20 rounded-[var(--card-radius)] border bg-card shadow-(--shadow-card)",
        tone === "danger"
          ? "border-destructive/30 bg-destructive/4"
          : "border-[var(--card-border-color)]"
      )}
    >
      <header className="flex items-start gap-3 border-b border-border/70 px-5 py-4">
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
            tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h2
            className={cn(
              "display text-base",
              tone === "danger" ? "text-destructive" : "text-foreground"
            )}
          >
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </header>
      {/* Capped measure: controls stay readable rather than full-bleed. */}
      <div className="max-w-2xl space-y-5 p-5">{children}</div>
    </section>
  )
}

/** Highlights whichever section is currently nearest the top of the viewport. */
function useActiveSection() {
  const [active, setActive] = React.useState<string>(SECTIONS[0].id)

  React.useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (n): n is HTMLElement => n !== null
    )
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Several sections can be on screen at once; the topmost visible one
        // is the one the reader is actually in.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-80px 0px -55% 0px" }
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return active
}

/**
 * Every field here writes on change, which is friendlier than a save button but
 * leaves the reader with no idea whether anything happened. This confirms it.
 */
function SavedIndicator({ token }: { token: number }) {
  const { t } = useLocale()
  const [visible, setVisible] = React.useState(false)
  const first = React.useRef(true)

  React.useEffect(() => {
    // Skip the mount pass: nothing has been edited yet.
    if (first.current) {
      first.current = false
      return
    }
    setVisible(true)
    const id = window.setTimeout(() => setVisible(false), 2000)
    return () => window.clearTimeout(id)
  }, [token])

  return (
    <p
      aria-live="polite"
      className={cn(
        "flex items-center gap-1.5 text-xs transition-opacity duration-200",
        visible ? "text-success opacity-100" : "text-muted-foreground opacity-70"
      )}
    >
      {visible ? (
        <>
          <Check className="size-3.5" aria-hidden="true" />
          {t("settings.saved")}
        </>
      ) : (
        t("settings.autosaves")
      )}
    </p>
  )
}

export function SettingsView({ eventId }: { eventId: string }) {
  const { event } = useEventData(eventId)
  const { updateEvent } = useData()
  const { t, locale } = useLocale()
  const { theme, setTheme } = useTheme()

  // Bumped on every edit so the indicator knows something landed.
  const [savedToken, setSavedToken] = React.useState(0)
  const [copied, setCopied] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const active = useActiveSection()

  // window is absent during SSR, so the origin arrives on the client.
  const origin = React.useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  )

  if (!event) return null

  const save = (patch: Parameters<typeof updateEvent>[1]) => {
    updateEvent(event.id, patch)
    setSavedToken((n) => n + 1)
  }

  const publicUrl = `${origin}/i/${event.slug}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      toast.success(t("action.copied"))
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy — please copy the link manually")
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={t("nav.settings")} description={t("settings.subtitle")} />
        <SavedIndicator token={savedToken} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:gap-10">
        <SettingsNav active={active} />
        <div className="min-w-0 space-y-5 pb-10">

      <SettingsSection
        id="details"
        icon={CalendarDays}
        title={t("settings.details")}
        description={t("settings.detailsHelp")}
      >
        <BilingualField
          id="set-title"
          label={t("settings.eventName")}
          value={event.title}
          onChange={(title) => save({ title })}
        />

        <div className="space-y-1.5">
          <Label htmlFor="set-date">{t("settings.dateTime")}</Label>
          <div className="flex gap-2">
            <DatePicker
              id="set-date"
              className="flex-1"
              value={event.date.slice(0, 10)}
              onChange={(date) =>
                save({ date: `${date}T${event.date.slice(11, 16)}:00+07:00` })
              }
            />
            <TimePicker
              aria-label={t("settings.time")}
              className="w-36"
              value={event.date.slice(11, 16)}
              onChange={(value) =>
                save({ date: `${event.date.slice(0, 10)}T${value}:00+07:00` })
              }
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        id="link"
        icon={Link2}
        title={t("settings.link")}
        description={t("settings.linkHelp")}
      >
        <div className="space-y-1.5">
          <Label htmlFor="set-slug">{t("settings.slug")}</Label>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm text-muted-foreground">/i/</span>
            <Input
              id="set-slug"
              className="max-w-xs"
              value={event.slug}
              onChange={(e) =>
                save({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
              }
            />
          </div>
        </div>

        {/* The address guests will actually receive, rather than a bare slug. */}
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--card-radius)] border border-border bg-muted/40 px-3 py-2.5">
          <p className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
            {publicUrl || `/i/${event.slug}`}
          </p>
          <Button variant="ghost" size="sm" onClick={copyLink}>
            {copied ? <Check /> : <Copy />}
            {t("action.copy")}
          </Button>
          <ButtonLink href={`/i/${event.slug}`} target="_blank" variant="ghost" size="sm">
            <ExternalLink />
            {t("inv.preview")}
          </ButtonLink>
        </div>
      </SettingsSection>

      <SettingsSection
        id="venue"
        icon={MapPin}
        title={t("public.venueTitle")}
        description={t("settings.venueHelp")}
      >
        <BilingualField
          id="set-venue"
          label={t("settings.venueName")}
          value={event.venue.name}
          onChange={(name) => save({ venue: { ...event.venue, name } })}
        />
        <BilingualField
          id="set-address"
          label={t("settings.address")}
          value={event.venue.address}
          onChange={(address) => save({ venue: { ...event.venue, address } })}
          multiline
          rows={2}
        />
        <div className="space-y-1.5">
          <Label htmlFor="set-map">{t("settings.mapLink")}</Label>
          <Input
            id="set-map"
            value={event.venue.mapUrl ?? ""}
            placeholder="https://maps.google.com/…"
            onChange={(e) => save({ venue: { ...event.venue, mapUrl: e.target.value } })}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        id="labels"
        icon={Users}
        title={t("settings.labels")}
        description={t("settings.labelsHelp")}
      >
        <BilingualField
          id="set-side-a"
          label={t("settings.sideA")}
          value={event.sides.a}
          onChange={(a) => save({ sides: { ...event.sides, a } })}
        />
        <BilingualField
          id="set-side-b"
          label={t("settings.sideB")}
          value={event.sides.b}
          onChange={(b) => save({ sides: { ...event.sides, b } })}
        />
        <div className="space-y-1.5">
          <Label htmlFor="set-currency">{t("settings.currency")}</Label>
          <Select
            value={event.currency}
            onValueChange={(v) => save({ currency: (v as Currency) ?? "USD" })}
            items={[
              { value: "USD", label: "US Dollar ($)" },
              { value: "KHR", label: "Riel (៛)" },
            ]}
          >
            <SelectTrigger id="set-currency" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">US Dollar ($)</SelectItem>
              <SelectItem value="KHR">Riel (៛)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsSection>

      <SettingsSection
        id="theme"
        icon={Palette}
        title={t("common.theme")}
        description={t("settings.themeHelp")}
      >
        <ul className="grid gap-3 sm:grid-cols-3">
          {APP_THEMES.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setTheme(item.id)}
                aria-pressed={theme === item.id}
                className={cn(
                  "w-full rounded-[var(--card-radius)] border p-4 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  theme === item.id
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-foreground/25"
                )}
              >
                <span className="flex gap-1" aria-hidden="true">
                  {item.swatch.map((color, i) => (
                    <span
                      key={i}
                      className="size-5 rounded-full ring-1 ring-black/10"
                      style={{ background: color }}
                    />
                  ))}
                </span>
                <span className="mt-2.5 block text-sm font-medium">{item.name[locale]}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {item.description[locale]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </SettingsSection>

      {/* Kept last, so it is never the thing you reach for next. */}
      <SettingsSection
        id="danger"
        icon={TriangleAlert}
        tone="danger"
        title={t("settings.danger")}
        description={t("settings.deleteHelp")}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">{t("settings.deleteEvent")}</p>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 />
            {t("action.delete")}
          </Button>
        </div>
      </SettingsSection>

      </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("settings.deleteEvent")}</DialogTitle>
            <DialogDescription>{t("settings.deleteHelp")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2">
            <DialogClose
              render={<Button variant="ghost">{t("action.cancel")}</Button>}
            />
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmDelete(false)
                toast.error(t("settings.deleteDisabled"))
              }}
            >
              <Trash2 />
              {t("action.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
