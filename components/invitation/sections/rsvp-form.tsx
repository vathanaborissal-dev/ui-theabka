"use client"

import * as React from "react"
import { Check, Loader2, X } from "lucide-react"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { EventRecord } from "@/lib/types"

type Answer = "yes" | "no"
type Phase = "idle" | "submitting" | "done"

/**
 * The guest-facing RSVP. Optimised for someone who just scanned a QR code on a
 * printed card: three taps, large targets, no account, no scrolling back up.
 */
export function InvitationRsvpForm({
  event,
  guestName,
}: {
  event: EventRecord
  /** Pre-filled when the guest arrives via a personal link. */
  guestName?: string
}) {
  const { t, locale } = useLocale()

  const [answer, setAnswer] = React.useState<Answer | null>(null)
  const [name, setName] = React.useState(guestName ?? "")
  const [seats, setSeats] = React.useState(2)
  const [message, setMessage] = React.useState("")
  const [phase, setPhase] = React.useState<Phase>("idle")
  const [error, setError] = React.useState<string>()

  const liveRef = React.useRef<HTMLDivElement>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(locale === "km" ? "សូមបញ្ចូលឈ្មោះរបស់អ្នក" : "Please enter your name")
      return
    }
    setError(undefined)
    setPhase("submitting")
    // Stands in for the API call.
    await new Promise((resolve) => setTimeout(resolve, 700))
    setPhase("done")
  }

  if (phase === "done") {
    return (
      <div
        className="mx-auto max-w-md rounded-xl border border-(--inv-border) bg-(--inv-surface) p-8 text-center"
        role="status"
      >
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-(--inv-accent) text-(--inv-accent-contrast)">
          {answer === "no" ? <X className="size-5" /> : <Check className="size-5" />}
        </span>
        <p
          className="text-2xl text-(--inv-fg)"
          style={{ fontFamily: "var(--inv-font-display)" }}
        >
          {t("public.thankYou")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-(--inv-muted)">
          {t(answer === "no" ? "public.rsvpDeclined" : "public.rsvpConfirmed")}
        </p>
        <button
          type="button"
          onClick={() => {
            setPhase("idle")
            setAnswer(null)
          }}
          className="mt-5 text-sm text-(--inv-accent) underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
        >
          {t("public.changeReply")}
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-md rounded-xl border border-(--inv-border) bg-(--inv-surface) p-6 @xl:p-8"
    >
      {event.design.rsvpDeadline ? (
        <p className="mb-5 text-center text-sm text-(--inv-muted)">
          {t("public.rsvpSubtitle")} {formatDate(event.design.rsvpDeadline, locale, "long")}
        </p>
      ) : null}

      <fieldset>
        <legend className="sr-only">{t("public.rsvpTitle")}</legend>
        <div className="grid grid-cols-2 gap-3">
          <RsvpChoice
            selected={answer === "yes"}
            onSelect={() => setAnswer("yes")}
            label={t("public.rsvpYes")}
            icon={<Check className="size-4" aria-hidden="true" />}
          />
          <RsvpChoice
            selected={answer === "no"}
            onSelect={() => setAnswer("no")}
            label={t("public.rsvpNo")}
            icon={<X className="size-4" aria-hidden="true" />}
          />
        </div>
      </fieldset>

      {answer ? (
        <div className="mt-6 space-y-4" ref={liveRef}>
          <div className="space-y-1.5">
            <label htmlFor="rsvp-name" className="block text-sm font-medium text-(--inv-fg)">
              {t("public.yourName")}
            </label>
            <input
              id="rsvp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "rsvp-name-error" : undefined}
              className="h-11 w-full rounded-lg border border-(--inv-border) bg-(--inv-bg) px-3.5 text-base text-(--inv-fg) outline-none placeholder:text-(--inv-muted)/60 focus-visible:border-(--inv-accent) focus-visible:ring-3 focus-visible:ring-(--inv-accent)/25"
            />
            {error ? (
              <p id="rsvp-name-error" role="alert" className="text-xs font-medium text-red-600">
                {error}
              </p>
            ) : null}
          </div>

          {answer === "yes" ? (
            <div className="space-y-1.5">
              <label htmlFor="rsvp-seats" className="block text-sm font-medium text-(--inv-fg)">
                {t("public.howMany")}
              </label>
              <div className="flex items-center gap-2">
                <StepButton
                  onClick={() => setSeats((s) => Math.max(1, s - 1))}
                  label="−"
                  disabled={seats <= 1}
                />
                <input
                  id="rsvp-seats"
                  type="number"
                  min={1}
                  max={20}
                  inputMode="numeric"
                  value={seats}
                  onChange={(e) => setSeats(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                  className="tnum h-11 w-20 rounded-lg border border-(--inv-border) bg-(--inv-bg) text-center text-base text-(--inv-fg) outline-none focus-visible:border-(--inv-accent) focus-visible:ring-3 focus-visible:ring-(--inv-accent)/25"
                />
                <StepButton
                  onClick={() => setSeats((s) => Math.min(20, s + 1))}
                  label="+"
                  disabled={seats >= 20}
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="rsvp-message" className="block text-sm font-medium text-(--inv-fg)">
              {t("public.messageToCouple")}
              <span className="ml-1.5 font-normal text-(--inv-muted)">
                ({t("common.optional")})
              </span>
            </label>
            <textarea
              id="rsvp-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-lg border border-(--inv-border) bg-(--inv-bg) px-3.5 py-2.5 text-base text-(--inv-fg) outline-none placeholder:text-(--inv-muted)/60 focus-visible:border-(--inv-accent) focus-visible:ring-3 focus-visible:ring-(--inv-accent)/25"
            />
          </div>

          <button
            type="submit"
            disabled={phase === "submitting"}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-(--inv-accent) text-base font-medium text-(--inv-accent-contrast) transition-opacity outline-none hover:opacity-90 focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40 disabled:opacity-70"
          >
            {phase === "submitting" ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t("common.loading")}…
              </>
            ) : (
              t("public.sendRsvp")
            )}
          </button>
        </div>
      ) : null}
    </form>
  )
}

function RsvpChoice({
  selected,
  onSelect,
  label,
  icon,
}: {
  selected: boolean
  onSelect: () => void
  label: string
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border-2 px-3 py-4 text-center text-sm leading-snug font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40",
        selected
          ? "border-(--inv-accent) bg-(--inv-accent) text-(--inv-accent-contrast)"
          : "border-(--inv-border) text-(--inv-fg) hover:border-(--inv-accent)/50"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function StepButton({
  onClick,
  label,
  disabled,
}: {
  onClick: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label === "+" ? "Add one" : "Remove one"}
      className="flex size-11 items-center justify-center rounded-lg border border-(--inv-border) text-lg text-(--inv-fg) transition-colors outline-none hover:bg-(--inv-bg) focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40 disabled:opacity-40"
    >
      {label}
    </button>
  )
}
