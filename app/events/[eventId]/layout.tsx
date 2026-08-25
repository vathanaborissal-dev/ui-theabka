import { EventShell } from "@/components/app-shell/event-shell"

export default async function EventLayout({ children, params }: LayoutProps<"/events/[eventId]">) {
  const { eventId } = await params
  return <EventShell eventId={eventId}>{children}</EventShell>
}
