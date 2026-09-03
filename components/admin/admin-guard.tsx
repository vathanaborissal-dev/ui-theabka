"use client"

import { ShieldOff } from "lucide-react"

import { ButtonLink } from "@/components/ui/button-link"
import { useAuth } from "@/components/providers/auth-provider"
import { useLocale } from "@/components/providers/locale-provider"

/**
 * Hides the portal from a signed-in planner who typed the URL.
 *
 * This is courtesy, not security: every `/api/admin` request is refused by
 * Spring Security regardless of what this component decides, so a planner who
 * defeated it would see four empty pages and a row of 403s. It exists so the
 * refusal reads as a sentence rather than as four broken screens.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { t } = useLocale()

  if (user && user.role !== "ADMIN") {
    return (
      <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center px-6 text-center">
        <ShieldOff className="size-8 text-muted-foreground" aria-hidden="true" />
        <h1 className="display mt-4 text-xl">{t("admin.notYourPage")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("admin.notAdminPlanner").replace("%s", user.email)}
        </p>
        <ButtonLink href="/events" className="mt-6">
          {t("admin.backToEvents")}
        </ButtonLink>
      </div>
    )
  }

  return children
}
