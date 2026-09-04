"use client"

import { formatMoney, formatNumber } from "@/lib/format"
import type { Currency, Locale } from "@/lib/types"

type Entry = {
  name: { en: string; km: string }
  side: "groom" | "bride"
  amount: number
  currency: Currency
}

/**
 * A sample page of the gift book, at the moment the envelopes are being
 * opened. Amounts and the dollar/riel mix are drawn from what a mid-size
 * Phnom Penh reception actually looks like, because a ledger of round $100s
 * would read as placeholder text.
 */
const ENTRIES: Entry[] = [
  { name: { en: "Sok Dara & family", km: "សុខ ដារា និងគ្រួសារ" }, side: "groom", amount: 200, currency: "USD" },
  { name: { en: "Chan Sopheak", km: "ចាន់ សុភ័ក្រ" }, side: "bride", amount: 400000, currency: "KHR" },
  { name: { en: "Ly Vannak", km: "លី វណ្ណៈ" }, side: "groom", amount: 100, currency: "USD" },
  { name: { en: "Meas Chanthy", km: "មាស ចាន់ធី" }, side: "bride", amount: 50, currency: "USD" },
]

export function LedgerPreview({ locale }: { locale: Locale }) {
  return (
    <div className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
      <div className="flex items-baseline justify-between gap-3 border-b border-border px-5 py-3.5">
        <p className="text-sm font-medium">
          {locale === "km" ? "ចំណងដៃ" : "Gift book"}
          {locale === "km" ? null : (
            <span className="ml-2 text-muted-foreground" lang="km">
              ចំណងដៃ
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {locale === "km" ? "កំពុងបើកស្រោម" : "Opening envelopes"}
        </p>
      </div>

      <ul className="divide-y divide-border">
        {ENTRIES.map((entry) => (
          <li key={entry.name.en} className="flex items-center gap-3 px-5 py-2.5">
            <span
              aria-hidden="true"
              className={
                "size-1.5 shrink-0 rounded-full " +
                (entry.side === "groom" ? "bg-primary" : "bg-gold")
              }
            />
            <span
              className="min-w-0 flex-1 truncate text-sm"
              lang={locale === "km" ? "km" : undefined}
            >
              {locale === "km" ? entry.name.km : entry.name.en}
            </span>
            <span className="tnum shrink-0 text-sm font-medium">
              {formatMoney(entry.amount, entry.currency, locale)}
            </span>
          </li>
        ))}
      </ul>

      {/*
       * The running total is the reason the book exists, so it sits on its own
       * ground rather than as one more row. Riel entries are converted at the
       * rate the app uses elsewhere; the count is what the couple is actually
       * watching.
       */}
      <div className="flex items-baseline justify-between gap-3 border-t border-border bg-muted/40 px-5 py-3.5">
        <div>
          <p className="text-xs text-muted-foreground">
            {locale === "km" ? "សរុបរហូតមកដល់ពេលនេះ" : "Total so far"}
          </p>
          <p className="display tnum mt-0.5 text-2xl">{formatMoney(18450, "USD", locale)}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {locale === "km"
            ? `${formatNumber(163, locale)} ស្រោម`
            : `${formatNumber(163, locale)} envelopes`}
        </p>
      </div>
    </div>
  )
}
