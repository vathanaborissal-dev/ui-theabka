import { api } from "@/lib/api-client"

/**
 * Connecting an account to the Telegram bot.
 *
 * Separate from `lib/telegram.ts`, which builds the t.me links used to send
 * invitations to guests. That one is about reaching other people; this is
 * about the planner's own phone.
 */
export type TelegramStatus = {
  /** False when the server has no bot token — the card says so rather than pretending. */
  configured: boolean
  botUsername: string
  connected: boolean
  username: string | null
  displayName: string | null
  connectedAt: string | null
}

export function getTelegramStatus(): Promise<TelegramStatus> {
  return api.get<TelegramStatus>("/api/telegram/status")
}

/**
 * Mints a connect link.
 *
 * The code inside it is shown once and stored only as a hash, so there is no
 * way to ask for the same one again — a lost link is replaced, not recovered.
 */
export function createTelegramLink(): Promise<{ url: string; botUsername: string }> {
  return api.post<{ url: string; botUsername: string }>("/api/telegram/link")
}

export function disconnectTelegram(): Promise<void> {
  return api.delete<void>("/api/telegram/link")
}
