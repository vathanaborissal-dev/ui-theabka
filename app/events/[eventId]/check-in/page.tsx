import { CheckInView } from "@/components/check-in/check-in-view"

export default async function CheckInPage({ params }: PageProps<"/events/[eventId]/check-in">) {
  const { eventId } = await params
  return <CheckInView eventId={eventId} />
}
