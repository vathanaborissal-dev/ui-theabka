"use client"

import * as React from "react"
import type { Locale } from "@/lib/types"
import type { InvSectionId } from "@/components/invitation/sections/common"

/**
 * Keeps the preview showing whatever the couple is currently editing.
 *
 * The editor is a long column of fields and the preview is a long card, and
 * without this they scroll independently: you change the gift note and the
 * preview is still showing the cover, so you have to hunt for the effect of
 * your own edit. Focusing a field brings its part of the card into view, and
 * switching a field to Khmer switches the preview to Khmer, because the reason
 * to type in Khmer is to see how the Khmer reads.
 */
type PreviewFocusValue = {
  /** Bring a section of the card into view. */
  focus: (section: InvSectionId) => void
  /** Show the preview in this language. */
  showLocale: (locale: Locale) => void
}

const PreviewFocusContext = React.createContext<PreviewFocusValue | null>(null)

export function PreviewFocusProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: PreviewFocusValue
}) {
  return <PreviewFocusContext.Provider value={value}>{children}</PreviewFocusContext.Provider>
}

/** Null outside the builder, so the fields work anywhere without a provider. */
export function usePreviewFocus() {
  return React.useContext(PreviewFocusContext)
}

/**
 * Props to spread onto a field so focusing it moves the preview.
 *
 * `onFocusCapture` rather than `onFocus`: the listener sits on a wrapper, and
 * focus does not bubble — its capturing phase is the only way a parent hears
 * about a child input being focused.
 */
export function useSectionFocus(section?: InvSectionId) {
  const preview = usePreviewFocus()
  return React.useMemo(() => {
    if (!preview || !section) return {}
    return { onFocusCapture: () => preview.focus(section) }
  }, [preview, section])
}

/**
 * Scrolls the preview to a section.
 *
 * Lives here rather than in the builder so the lookup and the "not in this
 * template" case are described once. A template that does not label its
 * sections simply does not move, which is the right way to fail: jumping to
 * the wrong part of the card would be worse than staying put.
 */
export function scrollPreviewTo(
  container: HTMLElement | null,
  section: InvSectionId
): boolean {
  if (!container) return false
  const target = container.querySelector<HTMLElement>(`[data-inv-section="${section}"]`)
  if (!target) return false

  const containerTop = container.getBoundingClientRect().top
  const targetTop = target.getBoundingClientRect().top
  container.scrollTo({
    // A little headroom, so the section heading is not flush against the
    // top edge of the phone frame.
    top: container.scrollTop + (targetTop - containerTop) - 24,
    behavior: "smooth",
  })
  return true
}
