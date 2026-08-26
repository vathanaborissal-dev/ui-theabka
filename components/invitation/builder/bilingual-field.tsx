"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { LocalizedText } from "@/lib/types"

/**
 * One field, two languages. A small EN/ខ្មែរ switch beats two stacked inputs:
 * it keeps the form short and makes it obvious that a translation is expected.
 * The inactive language shows a dot when it already has content.
 */
export function BilingualField({
  label,
  id,
  value,
  onChange,
  multiline,
  rows = 3,
  placeholder,
}: {
  label: string
  id: string
  value: LocalizedText
  onChange: (next: LocalizedText) => void
  multiline?: boolean
  rows?: number
  placeholder?: { en: string; km: string }
}) {
  const [lang, setLang] = React.useState<"en" | "km">("en")
  const Control = multiline ? Textarea : Input

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`${id}-${lang}`}>{label}</Label>
        <div
          className="inline-flex items-center rounded-full bg-muted p-0.5"
          role="group"
          aria-label={`${label}: language`}
        >
          {(["en", "km"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
              lang={code}
              className={cn(
                "relative rounded-full px-2 py-0.5 text-[0.6875rem] font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                lang === code
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {code === "en" ? "EN" : "ខ្មែរ"}
              {value[code]?.trim() && lang !== code ? (
                <span
                  className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-success"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <Control
        id={`${id}-${lang}`}
        key={lang}
        lang={lang}
        rows={multiline ? rows : undefined}
        value={value[lang]}
        placeholder={placeholder?.[lang]}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange({ ...value, [lang]: e.target.value })
        }
        className={lang === "km" ? "lang-km" : undefined}
      />
    </div>
  )
}
