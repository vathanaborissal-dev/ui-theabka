import { ShareView } from "@/components/share/share-view"

export default async function SharePage({ params }: PageProps<"/events/[eventId]/share">) {
  const { eventId } = await params
  return <ShareView eventId={eventId} />
}
