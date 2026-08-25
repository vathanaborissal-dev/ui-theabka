import { PlannerView } from "@/components/planner/planner-view"

export default async function PlannerPage({ params }: PageProps<"/events/[eventId]/planner">) {
  const { eventId } = await params
  return <PlannerView eventId={eventId} />
}
