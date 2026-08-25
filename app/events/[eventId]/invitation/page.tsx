import { InvitationBuilder } from "@/components/invitation/builder/builder-view"

export default async function InvitationPage({ params }: PageProps<"/events/[eventId]/invitation">) {
  const { eventId } = await params
  return <InvitationBuilder eventId={eventId} />
}
