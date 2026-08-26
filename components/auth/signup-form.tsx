"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordField } from "./password-field"
import { AuthShell, NotConfiguredNotice } from "./auth-shell"
import { useLocale } from "@/components/providers/locale-provider"
import { looksLikeEmail, signUp, MIN_PASSWORD_LENGTH } from "@/lib/auth"

const copy = {
  en: {
    title: "Create your account",
    subtitle: "Start your first event — the invitation, the guest list and the gifts.",
    name: "Your name",
    email: "Email",
    password: "Password",
    hint: `At least ${MIN_PASSWORD_LENGTH} characters`,
    submit: "Create account",
    submitting: "Creating…",
    have: "Already have an account?",
    signIn: "Sign in",
    terms: "By creating an account you agree to our terms and privacy policy.",
    errName: "Enter your name",
    errEmail: "Enter a valid email address",
    errPassword: `Use at least ${MIN_PASSWORD_LENGTH} characters`,
  },
  km: {
    title: "បង្កើតគណនីរបស់អ្នក",
    subtitle: "ចាប់ផ្តើមកម្មវិធីដំបូង — ធៀប បញ្ជីភ្ញៀវ និងចំណងដៃ។",
    name: "ឈ្មោះរបស់អ្នក",
    email: "អ៊ីមែល",
    password: "ពាក្យសម្ងាត់",
    hint: `យ៉ាងតិច ${MIN_PASSWORD_LENGTH} តួអក្សរ`,
    submit: "បង្កើតគណនី",
    submitting: "កំពុងបង្កើត…",
    have: "មានគណនីរួចហើយ?",
    signIn: "ចូលប្រើ",
    terms: "ការបង្កើតគណនី មានន័យថាអ្នកយល់ព្រមតាមលក្ខខណ្ឌ និងគោលការណ៍ភាពឯកជន។",
    errName: "សូមបញ្ចូលឈ្មោះ",
    errEmail: "សូមបញ្ចូលអ៊ីមែលឱ្យបានត្រឹមត្រូវ",
    errPassword: `សូមប្រើយ៉ាងតិច ${MIN_PASSWORD_LENGTH} តួអក្សរ`,
  },
}

export function SignupForm() {
  const { locale } = useLocale()
  const c = copy[locale]

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [pending, setPending] = React.useState(false)
  const [notConfigured, setNotConfigured] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = c.errName
    if (!looksLikeEmail(email)) next.email = c.errEmail
    if (password.length < MIN_PASSWORD_LENGTH) next.password = c.errPassword
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setPending(true)
    const result = await signUp({ name: name.trim(), email: email.trim(), password })
    setPending(false)
    if (!result.ok && result.reason === "not-configured") setNotConfigured(true)
  }

  return (
    <AuthShell
      title={c.title}
      subtitle={c.subtitle}
      footer={
        <p className="text-muted-foreground">
          {c.have}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {c.signIn}
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {notConfigured ? <NotConfiguredNotice /> : null}

        <div className="space-y-1.5">
          <Label htmlFor="name">{c.name}</Label>
          <Input
            id="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            placeholder="Chan Dara"
          />
          {errors.name ? (
            <p id="name-error" className="text-xs text-destructive">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{c.email}</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="you@example.com"
          />
          {errors.email ? (
            <p id="email-error" className="text-xs text-destructive">
              {errors.email}
            </p>
          ) : null}
        </div>

        <PasswordField
          id="password"
          label={c.password}
          value={password}
          onChange={setPassword}
          error={errors.password}
          hint={c.hint}
          autoComplete="new-password"
        />

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? c.submitting : c.submit}
        </Button>

        <p className="text-xs leading-relaxed text-muted-foreground">{c.terms}</p>
      </form>
    </AuthShell>
  )
}
