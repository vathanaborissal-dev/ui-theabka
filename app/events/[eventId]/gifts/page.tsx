import { GiftsView } from "@/components/gifts/gifts-view"

export default async function GiftsPage({ params }: PageProps<"/events/[eventId]/gifts">) {
  const { eventId } = await params
  return <GiftsView eventId={eventId} />
}
