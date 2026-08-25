import { createPersistedStore } from "@/lib/persisted-store"

/** Sidebar collapsed state, remembered between visits. */
export const sidebarStore = createPersistedStore<"expanded" | "collapsed">(
  "theabka.sidebar",
  "expanded",
  (value) => value === "expanded" || value === "collapsed"
)
