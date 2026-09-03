"use client"

import * as React from "react"
import Link from "next/link"
import { MailCheck } from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell, FormNotice } from "./auth-shell"
import { useLocale } from "@/components/providers/locale-provider"
import { looksLikeEmail, requestPasswordReset } from "@/lib/auth"

const copy = {
  en: {
    title: "Reset your password",
    subtitle: "Enter your email and we’ll send you a link to set a new one.",
    email: "Email",
    submit: "Send reset link",
    submitting: "Sending…",
    back: "Back to sign in",
    sentTitle: "Check your email",
    sentBody:
      "If an account exists for that address, a reset link is on its way. The link expires in one hour.",
    errEmail: "Enter a valid email address",
  },
  km: {
    title: "កំណត់ពាក្យសម្ងាត់ឡើងវិញ",
    subtitle: "បញ្ចូលអ៊ីមែល នោះយើងនឹងផ្ញើតំណសម្រាប់កំណត់ថ្មី។",
    email: "អ៊ីមែល",
    submit: "ផ្ញើតំណ",
    submitting: "កំពុងផ្ញើ…",
    back: "ត្រឡប់ទៅការចូលប្រើ",
    sentTitle: "សូមពិនិត្យអ៊ីមែល",
    sentBody: "ប្រសិនបើមានគណនីសម្រាប់អាសយដ្ឋាននេះ តំណនឹងត្រូវផ្ញើទៅ។ តំណនេះផុតកំណត់ក្នុងមួយម៉ោង។",
    errEmail: "សូមបញ្ចូលអ៊ីមែលឱ្យបានត្រឹមត្រូវ",
  },
}

export function ForgotPasswordForm() {
  const { locale } = useLocale()
  const c = copy[locale]

  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState<string>()
  const [pending, setPending] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [formError, setFormError] = React.useState<string>()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!looksLikeEmail(email)) {
      setError(c.errEmail)
      return
    }
    setError(undefined)
    setPending(true)
    const result = await requestPasswordReset({ email: email.trim() })
    setPending(false)
    if (!result.ok) {
      setFormError(result.message)
      return
    }
    // Always the same confirmation, whether or not the address is registered —
    // otherwise this page becomes a way to test which emails have accounts.
    setSent(true)
  }

  const backLink = (
    <p className="text-muted-foreground">
      <Link
        href="/login"
        className="font-medium text-primary underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {c.back}
      </Link>
    </p>
  )

  if (sent) {
    return (
      <AuthShell title={c.sentTitle} subtitle={c.sentBody} footer={backLink}>
        <div className="flex items-center gap-3 rounded-[var(--card-radius)] border border-success/40 bg-success/8 px-4 py-3">
          <MailCheck className="size-5 shrink-0 text-success" aria-hidden="true" />
          <p className="text-sm text-foreground">{email.trim()}</p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title={c.title} subtitle={c.subtitle} footer={backLink}>
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
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "email-error" : undefined}
            placeholder="you@example.com"
          />
          {error ? (
            <p id="email-error" className="text-xs text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? <BrandSpinner label="" /> : null}
          {pending ? c.submitting : c.submit}
        </Button>
      </form>
    </AuthShell>
  )
}
