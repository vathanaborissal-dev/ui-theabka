import { ExpensesView } from "@/components/expenses/expenses-view"

export default async function ExpensesPage({
  params,
  searchParams,
}: PageProps<"/events/[eventId]/expenses">) {
  const { eventId } = await params
  const { new: create } = await searchParams
  // See the guests page: remount so ?new= applies when already here.
  return <ExpensesView key={String(create ?? "")} eventId={eventId} openNew={create === "1"} />
}
