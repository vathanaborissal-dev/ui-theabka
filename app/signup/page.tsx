import type { Metadata } from "next"
import { SignupForm } from "@/components/auth/signup-form"
import { GuestGuard } from "@/components/auth/guest-guard"

export const metadata: Metadata = { title: "Create account" }

export default function SignupPage() {
  return (
    <GuestGuard>
      <SignupForm />
    </GuestGuard>
  )
}
