import { LocaleProvider } from "@/components/providers/locale-provider"
import { GuestCamera } from "@/components/camera/guest-camera"
import { getPublicInvitation } from "@/lib/events"
import type { InvitationDesign } from "@/lib/types"

export const metadata = {
  title: "Camera",
  /*
   * Kept out of search results. This is a QR on a table, not a page anyone
   * should arrive at from a search — and a camera link that circulates beyond
   * the room is a camera anyone can put anything into.
   */
  robots: { index: false, follow: false },
}

/**
 * The couple's design, so the camera wears their card rather than a generic
 * dark screen.
 *
 * Fetched here rather than added to the camera's own endpoint: the invitation
 * already serves exactly this, both are public and both require the event to be
 * published, so there is nothing to gain from a second copy of the design that
 * could disagree with the first. A failure is not fatal — the camera falls back
 * to defaults and still takes photos.
 */
async function loadDesign(slug: string): Promise<InvitationDesign | null> {
  try {
    return (await getPublicInvitation(slug)).design
  } catch {
    return null
  }
}

/**
 * The disposable camera, addressed by the same slug as the invitation:
 * /i/<slug> is the card, /c/<slug> is the camera on the table.
 *
 * A guest arriving from their own invitation link carries `?g=`, which names
 * their roll from the guest list instead of asking them to type it. Everyone
 * else scans the poster and gets an anonymous roll, which is fine.
 */
export default async function CameraPage({ params, searchParams }: PageProps<"/c/[slug]">) {
  const { slug } = await params
  const { g } = await searchParams
  const guestToken = typeof g === "string" ? g : undefined

  const design = await loadDesign(slug)

  /*
   * English first here, unlike the invitation.
   *
   * The card is a formal Khmer document and opens in Khmer; the camera is a
   * utility that a mixed room picks up off a table — including the guests who
   * travelled — and the toggle is on every screen for anyone who would rather
   * read it in Khmer. Not persisted, so a guest switching the camera does not
   * also switch the couple's dashboard.
   */
  return (
    <LocaleProvider initialLocale="en" persist={false}>
      <GuestCamera slug={slug} guestToken={guestToken} design={design} />
    </LocaleProvider>
  )
}
