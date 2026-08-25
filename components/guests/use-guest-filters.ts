"use client"

import * as React from "react"
import type { Guest, RsvpStatus, SideKey } from "@/lib/types"

export type GroupBy = "none" | "side" | "family" | "rsvp"
export type SortKey = "name" | "seats" | "gift" | "recent"

export type GuestFilters = {
  query: string
  rsvp: RsvpStatus | "all"
  side: SideKey | "all"
  family: string | "all"
  onlyWithGift: boolean
}

export const emptyFilters: GuestFilters = {
  query: "",
  rsvp: "all",
  side: "all",
  family: "all",
  onlyWithGift: false,
}

export function useGuestFilters(guests: Guest[], initial?: Partial<GuestFilters>) {
  const [filters, setFilters] = React.useState<GuestFilters>({ ...emptyFilters, ...initial })
  const [groupBy, setGroupBy] = React.useState<GroupBy>("none")
  const [sort, setSort] = React.useState<SortKey>("name")

  const families = React.useMemo(() => {
    const set = new Set<string>()
    for (const g of guests) if (g.family) set.add(g.family)
    return [...set].sort()
  }, [guests])

  const filtered = React.useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    const rows = guests.filter((g) => {
      if (filters.rsvp !== "all" && g.rsvp !== filters.rsvp) return false
      if (filters.side !== "all" && g.side !== filters.side) return false
      if (filters.family !== "all" && g.family !== filters.family) return false
      if (filters.onlyWithGift && !g.gift) return false
      if (!q) return true
      return (
        g.name.toLowerCase().includes(q) ||
        (g.nameKm?.toLowerCase().includes(q) ?? false) ||
        (g.phone?.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ?? false) ||
        (g.family?.toLowerCase().includes(q) ?? false) ||
        (g.relationship?.toLowerCase().includes(q) ?? false)
      )
    })

    const sorted = [...rows]
    switch (sort) {
      case "seats":
        sorted.sort((a, b) => b.partySize - a.partySize || a.name.localeCompare(b.name))
        break
      case "gift":
        sorted.sort((a, b) => (b.gift?.amount ?? -1) - (a.gift?.amount ?? -1))
        break
      case "recent":
        sorted.sort((a, b) => (b.respondedAt ?? "").localeCompare(a.respondedAt ?? ""))
        break
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
    return sorted
  }, [guests, filters, sort])

  const isFiltered =
    filters.query !== "" ||
    filters.rsvp !== "all" ||
    filters.side !== "all" ||
    filters.family !== "all" ||
    filters.onlyWithGift

  return {
    filters,
    setFilters,
    groupBy,
    setGroupBy,
    sort,
    setSort,
    families,
    filtered,
    isFiltered,
    reset: () => setFilters(emptyFilters),
  }
}

/** Splits the visible rows into labelled groups for the table. */
export function groupGuests(
  guests: Guest[],
  groupBy: GroupBy,
  labels: { sides: Record<SideKey, string>; rsvp: Record<RsvpStatus, string>; noFamily: string }
): Array<{ key: string; label: string; guests: Guest[] }> {
  if (groupBy === "none") return [{ key: "all", label: "", guests }]

  const map = new Map<string, { label: string; guests: Guest[] }>()
  for (const g of guests) {
    let key: string
    let label: string
    if (groupBy === "side") {
      key = g.side
      label = labels.sides[g.side]
    } else if (groupBy === "rsvp") {
      key = g.rsvp
      label = labels.rsvp[g.rsvp]
    } else {
      key = g.family ?? "__none"
      label = g.family ?? labels.noFamily
    }
    const entry = map.get(key) ?? { label, guests: [] }
    entry.guests.push(g)
    map.set(key, entry)
  }

  return [...map.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.guests.length - a.guests.length)
}
