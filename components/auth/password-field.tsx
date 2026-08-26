"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/components/providers/locale-provider"
import { cn } from "@/lib/utils"

/**
 * Password entry with a reveal toggle.
 *
 * The toggle is a real button rather than a checkbox so screen readers
 * announce the state change, and it is outside the input's padding so it never
 * overlaps typed text.
 */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  hint,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  autoComplete: "current-password" | "new-password"
  hint?: string
}) {
  const { locale } = useLocale()
  const [visible, setVisible] = React.useState(false)
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn("pr-11", error && "border-destructive")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={
            visible
              ? locale === "km" ? "លាក់ពាក្យសម្ងាត់" : "Hide password"
              : locale === "km" ? "បង្ហាញពាក្យសម្ងាត់" : "Show password"
          }
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
