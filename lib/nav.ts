import {
  BadgeCheck,
  Camera,
  Coins,
  LayoutDashboard,
  ListChecks,
  Mail,
  Receipt,
  Settings,
  Share2,
  Users,
} from "lucide-react"
import type { DictKey } from "@/lib/i18n/dictionary"

export type NavItem = {
  /** Path suffix appended to /events/[eventId]. "" is the dashboard. */
  segment: string
  labelKey: DictKey
  icon: typeof Users
  /** Shown in the phone tab bar. */
  primary?: boolean
}

export type NavGroup = {
  labelKey?: DictKey
  items: NavItem[]
}

export const eventNav: NavGroup[] = [
  {
    items: [
      { segment: "", labelKey: "nav.dashboard", icon: LayoutDashboard, primary: true },
      { segment: "invitation", labelKey: "nav.invitation", icon: Mail, primary: true },
      { segment: "share", labelKey: "nav.share", icon: Share2 },
    ],
  },
  {
    labelKey: "nav.manage",
    items: [
      { segment: "guests", labelKey: "nav.guests", icon: Users, primary: true },
      { segment: "check-in", labelKey: "nav.checkIn", icon: BadgeCheck },
      { segment: "camera", labelKey: "nav.camera", icon: Camera },
      { segment: "planner", labelKey: "nav.planner", icon: ListChecks },
    ],
  },
  {
    labelKey: "nav.money",
    items: [
      { segment: "gifts", labelKey: "nav.gifts", icon: Coins, primary: true },
      { segment: "expenses", labelKey: "nav.expenses", icon: Receipt },
    ],
  },
]

export const eventFooterNav: NavItem[] = [
  { segment: "settings", labelKey: "nav.settings", icon: Settings },
]

export const allEventNavItems = [...eventNav.flatMap((g) => g.items), ...eventFooterNav]

export function eventHref(eventId: string, segment: string) {
  return segment ? `/events/${eventId}/${segment}` : `/events/${eventId}`
}
