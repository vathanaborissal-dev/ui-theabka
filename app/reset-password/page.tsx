import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata = { title: "Choose a new password" }

export default function ResetPasswordPage() {
  // useSearchParams needs a Suspense boundary — the token comes from the URL.
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
