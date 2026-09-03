"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Brand } from "@/components/app-shell/brand"
import { LanguageToggle, ThemeMenu } from "@/components/app-shell/appearance-menu"
import { KbachDivider } from "@/components/invitation/ornaments"
import { Motif } from "@/components/invitation/motif"
import { useLocale } from "@/components/providers/locale-provider"

/**
 * Two-panel frame shared by every account screen: the form on the left, a
 * quiet branded panel on the right that only appears when there is room for
 * it. The panel is decoration — nothing needed to complete the form lives
 * there, so nothing is lost on a phone.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  const { locale } = useLocale()

  return (
    <div className="flex min-h-svh flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
      {/* Form column */}
      <div className="flex flex-1 flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center gap-3">
          <Brand href="/" />
          <div className="ml-auto flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeMenu />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {locale === "km" ? "ត្រឡប់ក្រោយ" : "Back"}
            </Link>

            <h1 className="display text-2xl text-foreground sm:text-[1.75rem]">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>

            <div className="mt-8">{children}</div>

            {footer ? <div className="mt-8 text-sm">{footer}</div> : null}
          </div>
        </main>
      </div>

      {/* Brand panel — hidden until there is width to spare. */}
      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden border-l border-border bg-linear-to-b from-primary/8 via-background to-gold/10 lg:flex lg:flex-col lg:items-center lg:justify-center"
      >
        <div className="px-12 text-center">
          <span className="mx-auto flex justify-center text-primary">
            <Motif assetId="khmer-unalom" fallback={null} className="h-16 w-12" />
          </span>
          <KbachDivider className="mx-auto mt-8 h-5 w-40 text-gold" />
          <p className="display mt-8 text-2xl leading-snug text-foreground">
            {locale === "km"
              ? "រៀបចំពិធីមង្គលការឱ្យមានរបៀបរៀបរយ"
              : "Every guest, every gift, every detail — in one place."}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {locale === "km"
              ? "ធៀបអេឡិចត្រូនិក បញ្ជីភ្ញៀវ និងចំណងដៃ សម្រាប់ពិធីខ្មែរ។"
              : "Digital invitations, guest lists and gift tracking, built for Cambodian ceremonies."}
          </p>
        </div>
      </aside>
    </div>
  )
}

/** Server-reported failure, shown above the form it belongs to. */
export function FormNotice({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-[var(--card-radius)] border border-destructive/40 bg-destructive/8 px-4 py-3 text-sm text-foreground"
    >
      {message}
    </div>
  )
}
