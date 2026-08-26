/**
 * The signed-in planner.
 *
 * Placeholder seed data, in the same fictional register as the guest lists —
 * there is no auth yet, so the profile menu reads from here. Swap this for the
 * real session once accounts land; nothing else needs to change.
 */
export type Account = {
  name: string
  nameKm?: string
  email: string
}

export const currentAccount: Account = {
  name: "Chan Dara",
  nameKm: "ចាន់ ដារា",
  email: "chan.dara@example.com",
}

/** Initials for the avatar, e.g. "Chan Dara" → "CD". */
export function accountInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return (parts[0][0] + (parts.at(-1)?.[0] ?? "")).toUpperCase()
}
