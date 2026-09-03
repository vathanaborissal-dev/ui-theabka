"use client"

import * as React from "react"
import { useLocale } from "@/components/providers/locale-provider"
import { imageSrcSet } from "@/lib/uploads"
import { cn } from "@/lib/utils"

type Currency = "usd" | "khr"

/**
 * The KHQR block — how a guest sends chong dai without an envelope.
 *
 * Cambodian bank apps scan one QR per currency, so this is a two-way switch
 * rather than a single code: a guest sending riel cannot use a dollar QR. When
 * the couple has supplied only one, the switch disappears rather than offering
 * a tab that leads nowhere.
 */
export function GiftQr({ usd, khr }: { usd?: string; khr?: string }) {
  const { t } = useLocale()
  const available = ([usd && "usd", khr && "khr"] as (Currency | undefined)[]).filter(
    Boolean
  ) as Currency[]
  const [currency, setCurrency] = React.useState<Currency>(available[0] ?? "usd")

  if (available.length === 0) return null

  const active = available.includes(currency) ? currency : available[0]
  const src = active === "usd" ? usd : khr

  return (
    <div className="flex flex-col items-center gap-4">
      {available.length === 2 ? (
        <div
          role="tablist"
          aria-label={t("public.giftTitle")}
          className="inline-flex rounded-full border border-(--inv-border) bg-(--inv-surface) p-1"
        >
          {available.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active === id}
              onClick={() => setCurrency(id)}
              className={cn(
                "min-h-9 rounded-full px-5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40",
                active === id
                  ? "bg-(--inv-accent) text-(--inv-accent-contrast)"
                  : "text-(--inv-muted) hover:text-(--inv-fg)"
              )}
            >
              {id === "usd" ? t("public.giftUsd") : t("public.giftKhr")}
            </button>
          ))}
        </div>
      ) : null}

      {src ? (
        <div className="rounded-2xl border border-(--inv-gold)/40 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            {...imageSrcSet(src, { sizes: "220px", crop: "fit" })}
            alt={
              active === "usd"
                ? `${t("public.giftTitle")} — ${t("public.giftUsd")}`
                : `${t("public.giftTitle")} — ${t("public.giftKhr")}`
            }
            className="size-[220px] object-contain"
            loading="lazy"
          />
        </div>
      ) : null}

      <p className="text-xs text-(--inv-muted)">{t("public.giftScanHint")}</p>
    </div>
  )
}
