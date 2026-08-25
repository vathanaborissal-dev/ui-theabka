import { DashboardView } from "@/components/dashboard/dashboard-view"

export default async function EventDashboardPage({ params }: PageProps<"/events/[eventId]">) {
  const { eventId } = await params
  return <DashboardView eventId={eventId} />
}
