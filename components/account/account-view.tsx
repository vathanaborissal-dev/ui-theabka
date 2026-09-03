"use client"

import * as React from "react"
import Link from "next/link"
import {ArrowLeft, KeyRound, Send, ShieldCheck, UserRound} from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordField } from "@/components/auth/password-field"
import { useAuth } from "@/components/providers/auth-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { MIN_PASSWORD_LENGTH, changePassword, updateAccount } from "@/lib/auth"
import { SessionsSection } from "./sessions-section"
import { TelegramSection } from "./telegram-section"

/**
 * The planner's own account.
 *
 * Split into three sections because they carry different weight: a name is a
 * label, an email is the way back into the account, and a password change ends
 * every other session. Grouping them into one form would put a field that
 * signs out your phone next to one that fixes a typo.
 */
export function AccountView() {
  const { user, reload } = useAuth()
  const { t } = useLocale()

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        {/*
          This page sits outside the event shell, so it has no sidebar and no
          breadcrumb — without an explicit way back, the only exit is the
          browser button. Events is where people came from.
        */}
        <Link
          href="/events"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("nav.allEvents")}
        </Link>

        <div className="space-y-5">
          <header className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/12 text-lg font-semibold text-primary"
            >
              {initials(user?.name)}
            </span>
            <div className="min-w-0">
              <h1 className="display truncate text-2xl sm:text-3xl">
                {user?.name ?? t("account.title")}
              </h1>
              <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </header>

          {/* Keyed on the account so the fields re-seed if it changes. */}
          <ProfileSection key={user?.id} onSaved={reload} />
          <PasswordSection />
          <Section
            icon={Send}
            title="Telegram"
            description="Get a message when a guest replies, and check numbers from your phone."
          >
            <TelegramSection />
          </Section>
          <Section
            icon={ShieldCheck}
            title={t("account.sessions")}
            description={t("account.sessionsHelp")}
          >
            <SessionsSection t={t as (key: string) => string} />
          </Section>
        </div>
      </div>
    </div>
  )
}

/** Same rule as the sidebar avatar, so the same person looks the same. */
function initials(name: string | undefined) {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?"
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
      <header className="flex items-start gap-3 border-b border-border/70 p-5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="display text-base">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  )
}

function ProfileSection({ onSaved }: { onSaved: () => Promise<void> }) {
  const { user } = useAuth()
  const { t } = useLocale()
  const [name, setName] = React.useState(user?.name ?? "")
  const [email, setEmail] = React.useState(user?.email ?? "")
  const [password, setPassword] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string>()

  // The address is the login identifier, so moving it needs the password.
  // Asking for it only once it actually changes keeps a name edit to one field.
  const emailChanged = email.trim().toLowerCase() !== (user?.email ?? "").toLowerCase()
  const nameChanged = name.trim() !== (user?.name ?? "")
  const dirty = emailChanged || nameChanged

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (saving || !dirty) return
    setSaving(true)
    setError(undefined)

    const result = await updateAccount({
      name: nameChanged ? name.trim() : undefined,
      email: emailChanged ? email.trim() : undefined,
      currentPassword: emailChanged ? password : undefined,
    })

    setSaving(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setPassword("")
    await onSaved()
    toast.success(t("account.saved"))
  }

  return (
    <Section
      icon={UserRound}
      title={t("account.profile")}
      description={t("account.profileHelp")}
    >
      <form onSubmit={save} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="acc-name">{t("account.name")}</Label>
          <Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="acc-email">{t("account.email")}</Label>
          <Input
            id="acc-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {emailChanged ? (
          <div className="rounded-[var(--card-radius)] border border-border bg-muted/30 p-3">
            <PasswordField
              id="acc-confirm"
              label={t("account.confirmPassword")}
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              hint={t("account.emailHelp")}
            />
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving || !dirty || (emailChanged && !password)}>
            {saving ? <BrandSpinner /> : null}
            {t("action.save")}
          </Button>
        </div>
      </form>
    </Section>
  )
}

function PasswordSection() {
  const { t } = useLocale()
  const [current, setCurrent] = React.useState("")
  const [next, setNext] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string>()

  const tooShort = next.length > 0 && next.length < MIN_PASSWORD_LENGTH

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (saving || !current || !next || tooShort) return
    setSaving(true)
    setError(undefined)

    const result = await changePassword({ currentPassword: current, newPassword: next })

    setSaving(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setCurrent("")
    setNext("")
    toast.success(t("account.passwordChanged"))
  }

  return (
    <Section
      icon={KeyRound}
      title={t("account.password")}
      description={t("account.passwordHelp")}
    >
      <form onSubmit={save} className="space-y-4">
        <PasswordField
          id="acc-current"
          label={t("account.currentPassword")}
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
        />

        <PasswordField
          id="acc-new"
          label={t("account.newPassword")}
          value={next}
          onChange={setNext}
          autoComplete="new-password"
          hint={t("account.passwordRule")}
          error={tooShort ? t("account.passwordRule") : undefined}
        />

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving || !current || !next || tooShort}>
            {saving ? <BrandSpinner /> : null}
            {t("account.changePassword")}
          </Button>
        </div>
      </form>
    </Section>
  )
}
