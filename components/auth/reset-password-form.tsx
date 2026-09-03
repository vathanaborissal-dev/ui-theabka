"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { TriangleAlert } from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { Button } from "@/components/ui/button"
import { MascotMotion } from "@/components/brand/mascot"
import { useLocale } from "@/components/providers/locale-provider"
import { MIN_PASSWORD_LENGTH, checkResetToken, resetPassword } from "@/lib/auth"
import { AuthShell, FormNotice } from "./auth-shell"
import { PasswordField } from "./password-field"

const COPY = {
  en: {
    title: "Choose a new password",
    subtitle: "This link works once. Pick something you have not used here before.",
    password: "New password",
    hint: `At least ${MIN_PASSWORD_LENGTH} characters.`,
    submit: "Save new password",
    checking: "Checking your link…",
    expiredTitle: "That link has expired",
    expiredBody:
      "Reset links last 30 minutes and work once. Ask for a fresh one and it will arrive in a moment.",
    askAgain: "Request a new link",
    doneTitle: "Password changed",
    doneBody:
      "You have been signed out everywhere else. Sign in with your new password to carry on.",
    signIn: "Sign in",
    tooShort: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
  },
  km: {
    title: "ជ្រើសរើសពាក្យសម្ងាត់ថ្មី",
    subtitle: "តំណនេះប្រើបានតែម្តង។ សូមជ្រើសរើសពាក្យសម្ងាត់ដែលមិនធ្លាប់ប្រើ។",
    password: "ពាក្យសម្ងាត់ថ្មី",
    hint: `យ៉ាងតិច ${MIN_PASSWORD_LENGTH} តួអក្សរ។`,
    submit: "រក្សាទុកពាក្យសម្ងាត់ថ្មី",
    checking: "កំពុងពិនិត្យតំណរបស់អ្នក…",
    expiredTitle: "តំណនេះផុតកំណត់ហើយ",
    expiredBody: "តំណមានសុពលភាព ៣០ នាទី និងប្រើបានតែម្តង។ សូមស្នើសុំតំណថ្មី។",
    askAgain: "ស្នើសុំតំណថ្មី",
    doneTitle: "បានប្តូរពាក្យសម្ងាត់",
    doneBody: "អ្នកត្រូវបានចេញពីគ្រប់ឧបករណ៍ផ្សេង។ សូមចូលដោយពាក្យសម្ងាត់ថ្មី។",
    signIn: "ចូលគណនី",
    tooShort: `សូមប្រើយ៉ាងតិច ${MIN_PASSWORD_LENGTH} តួអក្សរ។`,
  },
} as const

/**
 * Spending a reset link.
 *
 * The link is checked before the form is shown. Letting someone type a new
 * password and only then hearing the link expired is a small cruelty, and they
 * arrive here having already forgotten one password today.
 */
export function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { locale } = useLocale()
  const c = COPY[locale]

  const token = params.get("token") ?? ""

  // Tagged with the token it answered, so "checking" is derived rather than
  // set at the top of an effect — the same shape as the summary hooks.
  const [checked, setChecked] = React.useState<{ token: string; valid: boolean } | null>(null)
  const [overrideInvalid, setOverrideInvalid] = React.useState(false)
  const [password, setPassword] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string>()
  const [formError, setFormError] = React.useState<string>()
  const [done, setDone] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    // An absent token is settled without asking the server.
    const check = token ? checkResetToken(token) : Promise.resolve(false)
    void check.then((ok) => {
      if (!cancelled) setChecked({ token, valid: ok })
    })
    return () => {
      cancelled = true
    }
  }, [token])

  const settled = checked?.token === token
  const valid = settled ? checked.valid && !overrideInvalid : null

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(c.tooShort)
      return
    }
    setError(undefined)
    setFormError(undefined)
    setPending(true)

    const result = await resetPassword({ token, newPassword: password })

    setPending(false)
    if (!result.ok) {
      // A link that expired between loading the page and submitting lands
      // here, so the message has to carry rather than the optimistic state.
      setFormError(result.message)
      setOverrideInvalid(true)
      return
    }
    setDone(true)
  }

  const backToLogin = (
    <p className="text-muted-foreground">
      <Link
        href="/login"
        className="font-medium text-primary underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {c.signIn}
      </Link>
    </p>
  )

  if (done) {
    return (
      <AuthShell title={c.doneTitle} subtitle={c.doneBody} footer={backToLogin}>
        <div className="flex flex-col items-center gap-4 rounded-[var(--card-radius)] border border-success/40 bg-success/8 px-4 py-6">
          <MascotMotion motion="happy" size={88} />
          <Button onClick={() => router.push("/login")}>{c.signIn}</Button>
        </div>
      </AuthShell>
    )
  }

  if (valid === null) {
    return (
      <AuthShell title={c.title} subtitle={c.checking}>
        <div className="flex justify-center py-6">
          <MascotMotion motion="thinking" size={72} />
        </div>
      </AuthShell>
    )
  }

  if (!valid) {
    return (
      <AuthShell title={c.expiredTitle} subtitle={c.expiredBody} footer={backToLogin}>
        <div className="space-y-4">
          {formError ? <FormNotice message={formError} /> : null}
          <div className="flex items-center gap-3 rounded-[var(--card-radius)] border border-warning/40 bg-warning/8 px-4 py-3">
            <TriangleAlert className="size-5 shrink-0 text-warning" aria-hidden="true" />
            <Button
              variant="outline"
              className="ml-auto"
              onClick={() => router.push("/forgot-password")}
            >
              {c.askAgain}
            </Button>
          </div>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title={c.title} subtitle={c.subtitle} footer={backToLogin}>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {formError ? <FormNotice message={formError} /> : null}

        <PasswordField
          id="reset-password"
          label={c.password}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint={c.hint}
          error={error}
        />

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <BrandSpinner /> : null}
          {c.submit}
        </Button>
      </form>
    </AuthShell>
  )
}
