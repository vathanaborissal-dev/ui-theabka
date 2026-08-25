"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Cake, Check, Flower2, GraduationCap, Heart, HeartHandshake, Home, PartyPopper, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Brand } from "@/components/app-shell/brand"
import { BilingualField } from "@/components/invitation/builder/bilingual-field"
import { useData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { getTemplate, templatesFor } from "@/lib/invitation/templates"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { EventRecord, EventType, LocalizedText } from "@/lib/types"

const EVENT_TYPES: Array<{ type: EventType; icon: typeof Heart }> = [
  { type: "wedding", icon: Heart },
  { type: "engagement", icon: HeartHandshake },
  { type: "birthday", icon: Cake },
  { type: "housewarming", icon: Home },
  { type: "funeral", icon: Flower2 },
  { type: "graduation", icon: GraduationCap },
  { type: "baby", icon: Sparkles },
  { type: "other", icon: PartyPopper },
]

/** Sensible side labels per event type, so the guest list reads naturally. */
function defaultSides(type: EventType): EventRecord["sides"] {
  if (type === "wedding" || type === "engagement") {
    return {
      a: { en: "Groom's side", km: "ខាងកូនប្រុស" },
      b: { en: "Bride's side", km: "ខាងកូនស្រី" },
    }
  }
  if (type === "funeral") {
    return {
      a: { en: "Family", km: "ក្រុមគ្រួសារ" },
      b: { en: "Community", km: "សហគមន៍" },
    }
  }
  return {
    a: { en: "Host's guests", km: "ភ្ញៀវម្ចាស់ពិធី" },
    b: { en: "Family", km: "ក្រុមគ្រួសារ" },
  }
}

const STEPS = ["type", "details", "where", "hosts"] as const
type Step = (typeof STEPS)[number]

export function CreateEventWizard() {
  const router = useRouter()
  const { createEvent } = useData()
  const { t, locale } = useLocale()

  const [step, setStep] = React.useState<Step>("type")
  const [type, setType] = React.useState<EventType>("wedding")
  const [title, setTitle] = React.useState<LocalizedText>({ en: "", km: "" })
  const [date, setDate] = React.useState("")
  const [time, setTime] = React.useState("17:00")
  const [venueName, setVenueName] = React.useState<LocalizedText>({ en: "", km: "" })
  const [venueAddress, setVenueAddress] = React.useState<LocalizedText>({ en: "", km: "" })
  const [hostA, setHostA] = React.useState("")
  const [hostB, setHostB] = React.useState("")
  const [contactPhone, setContactPhone] = React.useState("")
  const [description, setDescription] = React.useState("")

  const index = STEPS.indexOf(step)
  const isCouple = type === "wedding" || type === "engagement"

  const canContinue = {
    type: true,
    details: Boolean(title.en.trim() || title.km.trim()) && Boolean(date),
    where: Boolean(venueName.en.trim() || venueName.km.trim()),
    hosts: Boolean(hostA.trim()),
  }[step]

  function next() {
    if (index < STEPS.length - 1) setStep(STEPS[index + 1])
    else create()
  }

  function create() {
    const slug =
      (title.en || title.km)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 48) || `event-${Date.now()}`

    const template = getTemplate(templatesFor(type)[0].id)
    const id = `evt_${Date.now()}`

    const event: EventRecord = {
      id,
      slug: `${slug}-${String(Date.now()).slice(-4)}`,
      type,
      status: "draft",
      title,
      date: `${date}T${time}:00+07:00`,
      timezone: "Asia/Phnom_Penh",
      venue: { name: venueName, address: venueAddress },
      hosts: [
        {
          id: `${id}_h1`,
          name: { en: hostA, km: hostA },
          role: isCouple
            ? { en: "Groom", km: "កូនប្រុស" }
            : { en: "Host", km: "ម្ចាស់ពិធី" },
          side: "a",
        },
        ...(hostB.trim()
          ? [
              {
                id: `${id}_h2`,
                name: { en: hostB, km: hostB },
                role: isCouple
                  ? { en: "Bride", km: "កូនស្រី" }
                  : { en: "Host", km: "ម្ចាស់ពិធី" },
                side: "b" as const,
              },
            ]
          : []),
      ],
      contacts: contactPhone.trim()
        ? [
            {
              id: `${id}_c1`,
              name: { en: hostA, km: hostA },
              role: { en: "Host", km: "ម្ចាស់ពិធី" },
              phone: contactPhone.trim(),
            },
          ]
        : [],
      schedule: [],
      description: { en: description, km: description },
      sides: defaultSides(type),
      currency: "USD",
      coverPhoto: "",
      design: {
        templateId: template.id,
        paletteId: template.defaultPalette,
        greeting: { en: "", km: "" },
        message: { en: description, km: description },
        gallery: [],
        showRsvp: true,
        showGallery: false,
        showSchedule: true,
        showMap: true,
        showGiftInfo: type === "wedding",
      },
      createdAt: new Date().toISOString(),
    }

    createEvent(event)
    toast.success("Event created — now design your invitation")
    router.push(`/events/${id}/invitation`)
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4 sm:px-6">
          <Brand />
          <ButtonLink href="/events" variant="ghost" size="sm" className="ml-auto">
            {t("action.cancel")}
          </ButtonLink>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
        <ol className="mb-8 flex items-center gap-2" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= index ? "bg-primary" : "bg-muted"
                )}
              />
              <span className="sr-only">
                {i < index ? "Completed" : i === index ? "Current step" : "Upcoming"}
              </span>
            </li>
          ))}
        </ol>

        {step === "type" ? (
          <StepShell
            title="What are you planning?"
            description="This sets up the right guest fields, invitation templates and wording."
          >
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {EVENT_TYPES.map(({ type: value, icon: Icon }) => {
                const selected = type === value
                return (
                  <li key={value}>
                    <button
                      type="button"
                      onClick={() => setType(value)}
                      aria-pressed={selected}
                      className={cn(
                        "flex w-full flex-col items-center gap-2 rounded-[var(--card-radius)] border px-3 py-5 text-center text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        selected
                          ? "border-primary bg-primary/8 text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                      )}
                    >
                      <Icon
                        className={cn("size-5", selected ? "text-primary" : "text-muted-foreground")}
                        aria-hidden="true"
                      />
                      {t(`event.type.${value}`)}
                    </button>
                  </li>
                )
              })}
            </ul>
          </StepShell>
        ) : null}

        {step === "details" ? (
          <StepShell
            title="The basics"
            description="You can change any of this later."
          >
            <BilingualField
              id="ev-title"
              label="Event name"
              value={title}
              onChange={setTitle}
              placeholder={{
                en: "The Wedding of Rithy & Sreyneang",
                km: "ពិធីមង្គលការ រិទ្ធី និង ស្រីនាង",
              }}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ev-date">Date</Label>
                <Input
                  id="ev-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ev-time">Start time</Label>
                <Input
                  id="ev-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-desc">
                A short message for your guests
                <span className="ml-1.5 font-normal text-muted-foreground">
                  ({t("common.optional")})
                </span>
              </Label>
              <Textarea
                id="ev-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="We would be honoured by your presence…"
              />
            </div>
          </StepShell>
        ) : null}

        {step === "where" ? (
          <StepShell title="Where is it?" description="Guests see this on the invitation, with directions.">
            <BilingualField
              id="ev-venue"
              label="Venue name"
              value={venueName}
              onChange={setVenueName}
              placeholder={{
                en: "Diamond Island Convention Centre",
                km: "មជ្ឈមណ្ឌលសន្និបាតកោះពេជ្រ",
              }}
            />
            <BilingualField
              id="ev-address"
              label="Address"
              value={venueAddress}
              onChange={setVenueAddress}
              multiline
              rows={2}
              placeholder={{
                en: "Koh Pich, Tonle Bassac, Phnom Penh",
                km: "កោះពេជ្រ សង្កាត់ទន្លេបាសាក់ ភ្នំពេញ",
              }}
            />
          </StepShell>
        ) : null}

        {step === "hosts" ? (
          <StepShell
            title={isCouple ? "Who is getting married?" : "Who is hosting?"}
            description="These names appear largest on the invitation."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ev-host-a">{isCouple ? "Groom" : "Host"}</Label>
                <Input
                  id="ev-host-a"
                  value={hostA}
                  onChange={(e) => setHostA(e.target.value)}
                  placeholder="Sok Rithy"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ev-host-b">
                  {isCouple ? "Bride" : "Co-host"}
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    ({t("common.optional")})
                  </span>
                </Label>
                <Input
                  id="ev-host-b"
                  value={hostB}
                  onChange={(e) => setHostB(e.target.value)}
                  placeholder="Meas Sreyneang"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-phone">
                Contact phone
                <span className="ml-1.5 font-normal text-muted-foreground">
                  ({t("common.optional")})
                </span>
              </Label>
              <Input
                id="ev-phone"
                type="tel"
                inputMode="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="012 345 678"
              />
              <p className="text-xs text-muted-foreground">
                Guests can call or message this number from the invitation.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-[var(--card-radius)] border border-border bg-muted/30 p-4">
              <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Your guest list will be grouped as{" "}
                <strong className="font-medium text-foreground">
                  {defaultSides(type).a[locale]}
                </strong>{" "}
                and{" "}
                <strong className="font-medium text-foreground">
                  {defaultSides(type).b[locale]}
                </strong>
                . You can rename these later.
              </p>
            </div>
          </StepShell>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setStep(STEPS[Math.max(0, index - 1)])}
            disabled={index === 0}
          >
            <ArrowLeft />
            {t("action.back")}
          </Button>
          <Button size="lg" onClick={next} disabled={!canContinue}>
            {index === STEPS.length - 1 ? (
              <>
                <Check />
                {t("action.createEvent")}
              </>
            ) : (
              <>
                {t("action.continue")}
                <ArrowRight />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}

function StepShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="display text-2xl sm:text-3xl">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  )
}
