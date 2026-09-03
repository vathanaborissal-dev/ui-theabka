"use client"

import * as React from "react"
import { useLocale } from "@/components/providers/locale-provider"
import { fetchWishes, type Wish } from "@/lib/guests"
import { formatDate } from "@/lib/format"
import { useRsvpTarget } from "@/components/invitation/rsvp-context"
import { KbachDivider } from "@/components/invitation/ornaments"

/**
 * The wall of messages guests left with their reply.
 *
 * On a printed invitation this has no equivalent; it is the part of a Cambodian
 * e-invitation people actually come back to, because seeing who else is coming
 * is half the reason to open the link twice. It reads from the replies the RSVP
 * form already collects, so nobody has to write a message twice.
 *
 * It loads after paint rather than server-side: the wall grows all week, and a
 * guest arriving from a chat link should see the card immediately rather than
 * wait on a list that is not why they opened it.
 */
/** Shown in the builder preview only, so the couple can judge the layout. */
const SAMPLE_WISHES: Wish[] = [
  { name: "លោក ចន្ទ សុខរស្មី", message: "សូមអបអរសាទរ!" },
  { name: "Sok Vichea", message: "Congratulations — see you on the day!" },
  { name: "ម៉ាលី សុភា", message: "ចាំជួបគ្នានៅថ្ងៃកម្មវិធី!" },
]

export function InvitationWishes({ limit = 30 }: { limit?: number }) {
  const { t, locale } = useLocale()
  const target = useRsvpTarget()
  const slug = target?.slug
  const [loaded, setLoaded] = React.useState<Wish[] | null>(null)

  React.useEffect(() => {
    if (!slug) return
    let cancelled = false
    void fetchWishes(slug, limit)
      .then((list) => {
        if (!cancelled) setLoaded(list)
      })
      // A wall that fails to load is not worth an error message on someone's
      // wedding invitation; it simply does not appear.
      .catch(() => {
        if (!cancelled) setLoaded([])
      })
    return () => {
      cancelled = true
    }
  }, [slug, limit])

  // No slug means the builder preview, which has no invitation to read from and
  // must not call the public API. Sample messages show the couple the layout.
  const wishes = slug ? loaded : SAMPLE_WISHES

  if (wishes === null) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-(--inv-fg)/5" />
        ))}
      </div>
    )
  }

  if (wishes.length === 0) {
    return (
      <p className="text-center text-sm text-(--inv-muted)">{t("public.wishesEmpty")}</p>
    )
  }

  return (
    <div>
      {/* Capped in height rather than paged: the wall is atmosphere, and a
          "next page" control would make it feel like a task. */}
      <ul className="max-h-[26rem] space-y-3 overflow-y-auto pr-1">
        {wishes.map((wish, i) => (
          <li
            key={`${wish.name}-${i}`}
            className="rounded-lg border border-(--inv-border) bg-(--inv-surface)/70 px-4 py-3 text-center"
          >
            <p
              className="text-base text-(--inv-fg)"
              style={{ fontFamily: "var(--inv-font-display)" }}
            >
              {wish.name}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-(--inv-muted)">
              &ldquo;{wish.message}&rdquo;
            </p>
            {wish.respondedAt ? (
              <p className="mt-1.5 text-[0.6875rem] text-(--inv-muted)/70">
                {formatDate(wish.respondedAt, locale, "short")}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      <KbachDivider className="mx-auto mt-5 h-4 w-32 text-(--inv-gold)" />
    </div>
  )
}
