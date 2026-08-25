import { SettingsView } from "@/components/events/settings-view"

export default async function SettingsPage({ params }: PageProps<"/events/[eventId]/settings">) {
  const { eventId } = await params
  return <SettingsView eventId={eventId} />
}
