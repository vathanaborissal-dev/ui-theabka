"use client"

import * as React from "react"
import type { InvitationDesign } from "@/lib/types"

/**
 * Makes the resolved design available to the shared invitation sections.
 *
 * Without this, every template would have to thread `entrance`, `photoFrame`
 * and `galleryLayout` down into every section it renders — seven templates ×
 * six sections of prop drilling for settings none of them actually decide.
 */
const DesignContext = React.createContext<InvitationDesign | null>(null)
const MotionContext = React.createContext(false)

export function DesignProvider({
  design,
  motionEnabled = false,
  children,
}: {
  design: InvitationDesign
  /** Motion is reserved for the customer-facing invitation. */
  motionEnabled?: boolean
  children: React.ReactNode
}) {
  return (
    <DesignContext.Provider value={design}>
      <MotionContext.Provider value={motionEnabled}>{children}</MotionContext.Provider>
    </DesignContext.Provider>
  )
}

export function useDesign() {
  const design = React.useContext(DesignContext)
  if (!design) throw new Error("useDesign must be used inside <DesignProvider>")
  return design
}

export function useInvitationMotionEnabled() {
  return React.useContext(MotionContext)
}
