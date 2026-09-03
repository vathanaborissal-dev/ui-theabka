import { AuthGuard } from "@/components/auth/auth-guard"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminShell } from "@/components/admin/admin-shell"

export const metadata = {
  /* An operator's area, not a public one — and not one to leave in an index. */
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </AuthGuard>
  )
}
