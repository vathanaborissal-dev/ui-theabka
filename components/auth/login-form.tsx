"use client"

import * as React from "react"
import Link from "next/link"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordField } from "./password-field"
import { AuthShell, FormNotice } from "./auth-shell"
import { useLocale } from "@/components/providers/locale-provider"
import { looksLikeEmail, signIn } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"

const copy = {
  en: {
    title: "Welcome back",
    subtitle: "Sign in to your events, guest lists and gifts.",
    email: "Email",
    password: "Password",
    forgot: "Forgot password?",
    submit: "Sign in",
    submitting: "Signing in…",
    noAccount: "New to Theabka?",
    signUp: "Create an account",
    errEmail: "Enter a valid email address",
    errPassword: "Enter your password",
  },
  km: {
    title: "សូមស្វាគមន៍ត្រឡប់មកវិញ",
    subtitle: "ចូលប្រើកម្មវិធី បញ្ជីភ្ញៀវ និងចំណងដៃរបស់អ្នក។",
    email: "អ៊ីមែល",
    password: "ពាក្យសម្ងាត់",
    forgot: "ភ្លេចពាក្យសម្ងាត់?",
    submit: "ចូលប្រើ",
    submitting: "កំពុងចូល…",
    noAccount: "ទើបប្រើ Theabka?",
    signUp: "បង្កើតគណនី",
    errEmail: "សូមបញ្ចូលអ៊ីមែលឱ្យបានត្រឹមត្រូវ",
    errPassword: "សូមបញ្ចូលពាក្យសម្ងាត់",
  },
}

export function LoginForm() {
  const { locale } = useLocale()
  const c = copy[locale]

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})
  const [pending, setPending] = React.useState(false)
  const [formError, setFormError] = React.useState<string>()
  const router = useRouter()
  const { establishSession } = useAuth()

  function destinationAfterSignIn() {
    const requested = new URLSearchParams(window.location.search).get("next")
    return requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/events"
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!looksLikeEmail(email)) next.email = c.errEmail
    if (password.length === 0) next.password = c.errPassword
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setPending(true)
    setFormError(undefined)
    const result = await signIn({ email: email.trim(), password })
    setPending(false)

    if (result.ok) {
      establishSession(result.user)
      router.replace(destinationAfterSignIn())
      return
    }
    setErrors(result.fieldErrors ?? {})
    setFormError(result.message)
  }

  return (
    <AuthShell
      title={c.title}
      subtitle={c.subtitle}
      footer={
        <p className="text-muted-foreground">
          {c.noAccount}{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {c.signUp}
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {formError ? <FormNotice message={formError} /> : null}

        <div className="space-y-1.5">
          <Label htmlFor="email">{c.email}</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
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

        <div className="space-y-1.5">
          <PasswordField
            id="password"
            label={c.password}
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete="current-password"
          />
          <p className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline underline-offset-4 transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {c.forgot}
            </Link>
          </p>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? <BrandSpinner label="" /> : null}
          {pending ? c.submitting : c.submit}
        </Button>
      </form>
    </AuthShell>
  )
}
