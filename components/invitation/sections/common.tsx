"use client"

import { Phone, Send } from "lucide-react"
import { useLocale } from "@/components/providers/locale-provider"
import { useDesign, useInvitationMotionEnabled } from "@/components/invitation/design-context"
import { Reveal } from "@/components/invitation/motion"
import { InvitationGallery } from "@/components/invitation/gallery"
import { KbachDivider, LotusMark } from "@/components/invitation/ornaments"
import { LotusFrieze, Romduol } from "@/components/invitation/khmer-ornaments"
import { MotifRule } from "@/components/invitation/motif"
import { cn } from "@/lib/utils"
import type { ContactPerson, EventRecord } from "@/lib/types"

/** Section shell shared by every template. Templates vary the heading treatment. */
export function InvSection({
  title,
  children,
  className,
  ornament = "none",
  align = "center",
  id,
}: {
  title?: string
  children: React.ReactNode
  className?: string
  ornament?: "none" | "kbach" | "lotus" | "rule" | "frieze" | "romduol"
  /** Ranged-left headings give the formal and editorial templates their voice. */
  align?: "center" | "left"
  id?: string
}) {
  const { entrance = "rise", dividerMotifId } = useDesign()
  const motionEnabled = useInvitationMotionEnabled()

  return (
    <section
      id={id}
      data-align={align}
      data-ornament={ornament}
      className={cn("inv-section px-6 py-12 @xl:py-16", className)}
    >
      <Reveal entrance={motionEnabled ? entrance : "none"}>
      {title ? (
        <header
          className={cn(
            "inv-section-header mb-8",
            align === "left" ? "text-left" : "text-center"
          )}
        >
          {ornament === "lotus" ? (
            <LotusMark className={cn("mb-3 size-5 text-(--inv-gold)", align === "center" && "mx-auto")} />
          ) : null}
          {ornament === "romduol" ? (
            <Romduol className={cn("mb-3 size-7 text-(--inv-gold)", align === "center" && "mx-auto")} />
          ) : null}
          <h2
            className="inv-section-title text-(--inv-accent)"
            style={{ fontFamily: "var(--inv-font-display)" }}
          >
            {title}
          </h2>
          {ornament === "kbach" ? (
            <MotifRule
              assetId={dividerMotifId}
              className={cn("mt-3", align === "left" && "mx-0")}
              fallback={
                <KbachDivider
                  className={cn("mt-3 h-4 w-40 text-(--inv-gold)", align === "center" && "mx-auto")}
                />
              }
            />
          ) : null}
          {ornament === "frieze" ? (
            <MotifRule
              assetId={dividerMotifId}
              className={cn("mt-3", align === "left" && "mx-0")}
              fallback={
                <LotusFrieze
                  className={cn("mt-3 h-4 w-48 text-(--inv-gold)", align === "center" && "mx-auto")}
                />
              }
            />
          ) : null}
          {ornament === "rule" ? (
            <span
              className={cn(
                "mt-3 block h-px w-12 bg-(--inv-accent)/40",
                align === "center" && "mx-auto"
              )}
              aria-hidden="true"
            />
          ) : null}
        </header>
      ) : null}
      <div className="inv-section-body">{children}</div>
      </Reveal>
    </section>
  )
}

/** Kept as the name templates already call; the arrangement comes from the design. */
export function GalleryStrip({ photos }: { photos: string[] }) {
  const { galleryLayout = "grid", photoFrame = "rounded" } = useDesign()
  return <InvitationGallery photos={photos} layout={galleryLayout} frame={photoFrame} />
}

export function GiftNote({ note }: { note?: { en: string; km: string } }) {
  const { L } = useLocale()
  if (!note) return null
  return (
    <p className="mx-auto max-w-md text-center text-sm leading-relaxed text-(--inv-muted)">
      {L(note)}
    </p>
  )
}

export function ContactList({ contacts }: { contacts: ContactPerson[] }) {
  const { L } = useLocale()
  if (contacts.length === 0) return null

  return (
    <ul className="mx-auto flex max-w-lg flex-col gap-3 @xl:flex-row @xl:justify-center">
      {contacts.map((contact) => (
        <li
          key={contact.id}
          className="flex-1 rounded-lg border border-(--inv-border) bg-(--inv-surface) p-4 text-center"
        >
          <p className="font-medium text-(--inv-fg)">{L(contact.name)}</p>
          <p className="mt-0.5 text-sm text-(--inv-muted)">{L(contact.role)}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <a
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-(--inv-border) px-3 py-1.5 text-sm text-(--inv-fg) transition-colors outline-none hover:border-(--inv-accent) hover:text-(--inv-accent) focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              <span className="tnum">{contact.phone}</span>
            </a>
            {contact.telegram ? (
              <a
                href={`https://t.me/${contact.telegram}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Telegram: ${L(contact.name)}`}
                className="inline-flex size-8 items-center justify-center rounded-full border border-(--inv-border) text-(--inv-fg) transition-colors outline-none hover:border-(--inv-accent) hover:text-(--inv-accent) focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
              >
                <Send className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

export function InvitationFooter({ event }: { event: EventRecord }) {
  const { L } = useLocale()
  return (
    <footer className="border-t border-(--inv-border) px-6 py-10 text-center">
      <LotusMark className="mx-auto mb-3 size-6 text-(--inv-gold)" />
      <p
        className="text-lg text-(--inv-fg)"
        style={{ fontFamily: "var(--inv-font-display)" }}
      >
        {event.hosts.map((h) => L(h.name)).join(" & ")}
      </p>
      <p className="mt-4 text-xs text-(--inv-muted)/70">Made with Theabka</p>
    </footer>
  )
}

/** Adds a calendar link without a library — a data: .ics the browser downloads. */
export function AddToCalendar({ event }: { event: EventRecord }) {
  const { t, L } = useLocale()
  const start = new Date(event.date)
  const end = new Date(start.getTime() + 5 * 60 * 60 * 1000)
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${L(event.title)}`,
    `LOCATION:${L(event.venue.name)}, ${L(event.venue.address)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n")

  return (
    <a
      href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`}
      download={`${event.slug}.ics`}
      className="inline-flex min-h-11 items-center gap-2 px-2 py-2.5 text-sm text-(--inv-accent) underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
    >
      {t("public.addToCalendar")}
    </a>
  )
}
