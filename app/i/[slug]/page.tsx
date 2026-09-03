import { PublicInvitation } from "@/components/invitation/public-invitation"
import { getPublicInvitation } from "@/lib/events"
import { fetchInvitedGuest } from "@/lib/guests"
import { openGraphImage } from "@/lib/uploads"
import type { InvitationEvent } from "@/lib/types"

async function loadInvitation(slug: string): Promise<InvitationEvent | null> {
  try {
    return await getPublicInvitation(slug)
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps<"/i/[slug]">) {
  const { slug } = await params
  const event = await loadInvitation(slug)
  if (!event) return { title: "Invitation" }

  // Khmer first where there is no English title — a Khmer-only invitation
  // should not preview as a blank heading.
  const title = event.title.en || event.title.km
  const description = event.description.en || event.description.km

  // 1200x630 is what link previews crop to. Handing over the original lets
  // each platform crop it themselves, usually straight through the couple.
  const cover = event.coverPhoto ? openGraphImage(event.coverPhoto) : undefined

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: cover
        ? [{ url: cover, width: 1200, height: 630, alt: title }]
        : undefined,
    },
    twitter: {
      // Without this the image is shown as a small square thumbnail, if at all.
      card: cover ? "summary_large_image" : "summary",
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  }
}

export default async function PublicInvitationPage({
  params,
  searchParams,
}: PageProps<"/i/[slug]">) {
  const { slug } = await params
  const { g } = await searchParams
  const token = typeof g === "string" ? g : undefined

  // Both server-side, so a guest opening their own link sees their name in the
  // first paint rather than a flash of the anonymous card.
  const [event, guest] = await Promise.all([
    loadInvitation(slug),
    token ? fetchInvitedGuest(slug, token) : Promise.resolve(null),
  ])

  return <PublicInvitation event={event} slug={slug} token={token} guest={guest} />
}
