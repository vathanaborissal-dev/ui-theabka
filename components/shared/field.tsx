"use client"

import { Label } from "@/components/ui/label"
import { useLocale } from "@/components/providers/locale-provider"

/**
 * Label + control + hint/error, with consistent spacing and wiring. Every form
 * control in the app goes through this so required/optional marks and error
 * announcements behave the same everywhere.
 */
export function Field({
  label,
  htmlFor,
  children,
  error,
  optional,
  required,
  hint,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
  error?: string
  optional?: boolean
  required?: boolean
  hint?: string
}) {
  const { t } = useLocale()

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor}>
          {label}
          {required ? (
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          ) : null}
        </Label>
        {optional ? (
          <span className="text-xs text-muted-foreground">{t("common.optional")}</span>
        ) : null}
      </div>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
