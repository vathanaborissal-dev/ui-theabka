"use client"

import * as React from "react"
import { Palette, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TimePicker } from "@/components/ui/time-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { Panel } from "@/components/shared/panel"
import { BilingualField } from "@/components/invitation/builder/bilingual-field"
import { APP_THEMES } from "@/lib/themes"
import { useData, useEventData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { useTheme } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Currency } from "@/lib/types"

export function SettingsView({ eventId }: { eventId: string }) {
  const { event } = useEventData(eventId)
  const { updateEvent } = useData()
  const { t, locale } = useLocale()
  const { theme, setTheme } = useTheme()

  if (!event) return null

  return (
    <div className="space-y-5">
      <PageHeader title={t("nav.settings")} description="Event details, labels and appearance." />

      <Panel title="Event details">
        <div className="space-y-5">
          <BilingualField
            id="set-title"
            label="Event name"
            value={event.title}
            onChange={(title) => updateEvent(event.id, { title })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="set-date">Date &amp; time</Label>
              <div className="flex gap-2">
                <DatePicker
                  id="set-date"
                  className="flex-1"
                  value={event.date.slice(0, 10)}
                  onChange={(date) =>
                    updateEvent(event.id, { date: `${date}T${event.date.slice(11, 16)}:00+07:00` })
                  }
                />
                <TimePicker
                  aria-label="Time"
                  className="w-32"
                  value={event.date.slice(11, 16)}
                  onChange={(value) =>
                    updateEvent(event.id, { date: `${event.date.slice(0, 10)}T${value}:00+07:00` })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="set-slug">Public link</Label>
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 text-sm text-muted-foreground">/i/</span>
                <Input
                  id="set-slug"
                  value={event.slug}
                  onChange={(e) =>
                    updateEvent(event.id, {
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Venue">
        <div className="space-y-5">
          <BilingualField
            id="set-venue"
            label="Venue name"
            value={event.venue.name}
            onChange={(name) => updateEvent(event.id, { venue: { ...event.venue, name } })}
          />
          <BilingualField
            id="set-address"
            label="Address"
            value={event.venue.address}
            onChange={(address) => updateEvent(event.id, { venue: { ...event.venue, address } })}
            multiline
            rows={2}
          />
          <div className="space-y-1.5">
            <Label htmlFor="set-map">Google Maps link</Label>
            <Input
              id="set-map"
              value={event.venue.mapUrl ?? ""}
              placeholder="https://maps.google.com/…"
              onChange={(e) =>
                updateEvent(event.id, { venue: { ...event.venue, mapUrl: e.target.value } })
              }
            />
          </div>
        </div>
      </Panel>

      <Panel title="Guest list labels">
        <p className="mb-4 text-sm text-muted-foreground">
          How the two sides of the guest list are named throughout the app.
        </p>
        <div className="space-y-5">
          <BilingualField
            id="set-side-a"
            label="First side"
            value={event.sides.a}
            onChange={(a) => updateEvent(event.id, { sides: { ...event.sides, a } })}
          />
          <BilingualField
            id="set-side-b"
            label="Second side"
            value={event.sides.b}
            onChange={(b) => updateEvent(event.id, { sides: { ...event.sides, b } })}
          />
          <div className="space-y-1.5 sm:max-w-48">
            <Label htmlFor="set-currency">Currency</Label>
            <Select
              value={event.currency}
              onValueChange={(v) => updateEvent(event.id, { currency: (v as Currency) ?? "USD" })}
              items={[
                { value: "USD", label: "US Dollar ($)" },
                { value: "KHR", label: "Riel (៛)" },
              ]}
            >
              <SelectTrigger id="set-currency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">US Dollar ($)</SelectItem>
                <SelectItem value="KHR">Riel (៛)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Panel>

      <Panel title={t("common.theme")}>
        <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Palette className="size-4" aria-hidden="true" />
          Changes how the dashboard looks for you. Guests always see your invitation design.
        </p>
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
      </Panel>

      <Panel title="Danger zone">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Delete this event</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Removes the invitation, guest list, gifts and expenses. This cannot be undone.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => toast.error("Deleting events is disabled in this preview")}
          >
            <Trash2 />
            {t("action.delete")}
          </Button>
        </div>
      </Panel>
    </div>
  )
}
