import { PublicInvitation } from "@/components/invitation/public-invitation"
import { seedEvents } from "@/lib/data/seed"

export function generateStaticParams() {
  return seedEvents.map((event) => ({ slug: event.slug }))
}

export async function generateMetadata({ params }: PageProps<"/i/[slug]">) {
  const { slug } = await params
  const event = seedEvents.find((e) => e.slug === slug)
  if (!event) return { title: "Invitation" }

  return {
    title: event.title.en,
    description: event.description.en,
    openGraph: {
      title: event.title.en,
      description: event.description.en,
      images: event.coverPhoto ? [event.coverPhoto] : undefined,
    },
  }
}

export default async function PublicInvitationPage({
  params,
  searchParams,
}: PageProps<"/i/[slug]">) {
  const { slug } = await params
  const { g } = await searchParams
  return <PublicInvitation slug={slug} guestToken={typeof g === "string" ? g : undefined} />
}
