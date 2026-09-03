/**
 * Sending an invitation over Telegram, and the one choice it forces.
 *
 * Telegram offers two useful links for invitations:
 *
 *   t.me/share/url?url=…&text=…   carries the whole message and asks the sender which chat it
 *                                 goes to.
 *   t.me/+<phone>?text=…          opens one specific person's chat with a
 *                                 draft ready to send.
 *
 * Nothing can press Send on the couple's behalf. A bot may only write to people
 * who have already started a conversation with it, which makes a bot a poor
 * fit for the first invitation.
 *
 * Prefer the phone link when a number exists. The generic share link is the
 * fallback when Telegram cannot resolve a number or the guest has no number.
 *
 * SMS is the odd one out and worth remembering: `sms:` takes a number *and* a
 * body, so it is the only link here that does the whole job in one press.
 */

/** Cambodia. Local numbers are written 0XX XXX XXX and dial as +855 XX XXX XXX. */
const DEFAULT_COUNTRY_CODE = "855"

/**
 * A phone number as Telegram wants it: digits only, with a country code and no
 * leading plus.
 *
 * Returns null when there is nothing usable, so a caller can tell "no number"
 * apart from "a number I mangled into something that dials a stranger".
 */
export function toInternational(phone?: string, countryCode = DEFAULT_COUNTRY_CODE): string | null {
  if (!phone) return null

  const digits = phone.replace(/[^\d+]/g, "")
  if (!digits) return null

  // Already international, however it was written.
  if (digits.startsWith("+")) return digits.slice(1) || null
  if (digits.startsWith("00")) return digits.slice(2) || null
  if (digits.startsWith(countryCode) && digits.length > countryCode.length + 5) return digits

  // A local number: the trunk zero is dropped when the country code goes on.
  const local = digits.startsWith("0") ? digits.slice(1) : digits
  if (local.length < 6) return null
  return `${countryCode}${local}`
}

/** Opens a specific chat by number, with an optional message ready to send. */
export function telegramChatLink(phone?: string, draftText?: string): string | null {
  const number = toInternational(phone)
  if (!number) return null
  return draftText
    ? `https://t.me/+${number}?text=${encodeURIComponent(draftText)}`
    : `https://t.me/+${number}`
}

/** Opens Telegram's own share sheet with the message ready, recipient unchosen. */
export function telegramShareLink(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
}

/** Opens Telegram's native group-creation flow. */
export function telegramNewGroupLink(): string {
  return "tg://new/group"
}

/**
 * Accepts Telegram's private invite links and public group usernames.
 *
 * Telegram does not expose enough information to a normal website to prove
 * that a public username belongs to a group rather than a person, so the UI
 * still asks the organizer to paste the link from the group's Invite Links
 * screen.
 */
export function normalizeTelegramGroupLink(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const candidate = trimmed.startsWith("@")
    ? `https://t.me/${trimmed.slice(1)}`
    : /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`

  try {
    const url = new URL(candidate)
    const host = url.hostname.toLowerCase()
    if (!["t.me", "telegram.me", "telegram.dog"].includes(host)) return null

    const path = url.pathname.replace(/\/+$/, "")
    const privateInvite = /^\/(?:\+[A-Za-z0-9_-]+|joinchat\/[A-Za-z0-9_-]+)$/.test(path)
    const publicUsername = /^\/[A-Za-z][A-Za-z0-9_]{4,31}$/.test(path)
    if (!privateInvite && !publicUsername) return null

    return `https://${host}${path}`
  } catch {
    return null
  }
}

/**
 * What gets pasted into the chat.
 *
 * The guest's own link, not the event's: it carries their token, so the card
 * greets them by name and their reply is recorded against the right row.
 */
export function invitationMessage({
  greeting,
  title,
  when,
  url,
}: {
  greeting: string
  title: string
  when: string
  url?: string
}): string {
  return [greeting, `${title}\n${when}`, url].filter(Boolean).join("\n\n")
}

/**
 * A text message to one number, body included.
 *
 * Two separators exist in the wild — iOS wants `&body=` after a `?`, older
 * Android wanted `?body=`. `?body=` is understood by both current platforms.
 */
export function smsLink(phone: string | undefined, body: string): string | null {
  const number = toInternational(phone)
  return number ? `sms:+${number}?body=${encodeURIComponent(body)}` : null
}
