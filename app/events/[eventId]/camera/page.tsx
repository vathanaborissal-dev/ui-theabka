import { CameraView } from "@/components/camera/camera-view"

export default async function CameraPage({ params }: PageProps<"/events/[eventId]/camera">) {
  const { eventId } = await params
  return <CameraView eventId={eventId} />
}
