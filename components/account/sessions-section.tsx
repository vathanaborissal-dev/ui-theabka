"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {Laptop,
  LogOut,
  MonitorSmartphone,
  Smartphone,
  Tablet} from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocale } from "@/components/providers/locale-provider"
import { formatRelative } from "@/lib/format"
import { listSessions, revokeSession, signOutEverywhere, type Session } from "@/lib/auth"
import { cn } from "@/lib/utils"

/**
 * The devices signed in to this account.
 *
 * The point of the screen is recognising a device you do not remember using,
 * so each row leans on the two things that identify one to a person — what it
 * is, and when it was last used — rather than on anything technical.
 *
 * The current device is labelled and cannot be revoked from here. Signing
 * yourself out through a list of other people's devices is a confusing way to
 * end a session; there is a deliberate control for that below.
 */
export function SessionsSection({ t }: { t: (key: string) => string }) {
  const router = useRouter()
  const { locale } = useLocale()

  const [sessions, setSessions] = React.useState<Session[] | null>(null)
  const [failed, setFailed] = React.useState(false)
  const [revoking, setRevoking] = React.useState<string>()
  const [confirmAll, setConfirmAll] = React.useState(false)
  const [reloadToken, setReloadToken] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    void listSessions()
      .then((loaded) => {
        if (!cancelled) setSessions(loaded)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  async function revoke(session: Session) {
    setRevoking(session.id)
    try {
      await revokeSession(session.id)
      setSessions((current) => current?.filter((s) => s.id !== session.id) ?? null)
      toast.success(t("account.deviceRevoked"))
    } catch {
      toast.error(t("account.deviceRevokeFailed"))
      setReloadToken((n) => n + 1)
    } finally {
      setRevoking(undefined)
    }
  }

  const others = sessions?.filter((s) => !s.current) ?? []

  return (
    <>
      <div className="space-y-3">
        {failed ? (
          <p className="text-sm text-muted-foreground">{t("account.devicesFailed")}</p>
        ) : sessions === null ? (
          <div className="space-y-2" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-[var(--card-radius)] bg-muted/50" />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-[var(--card-radius)] border border-border">
            {sessions.map((session) => (
              <li
                key={session.id}
                className={cn(
                  "flex items-center gap-3 p-3.5",
                  session.current && "bg-primary/[0.03]"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    session.current
                      ? "bg-primary/12 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                  aria-hidden="true"
                >
                  <DeviceIcon device={session.device} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
                    <span className="truncate">{session.device}</span>
                    {session.current ? (
                      <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[0.6875rem] font-medium text-primary">
                        {t("account.thisDevice")}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {session.current
                      ? t("account.activeNow")
                      : `${t("account.lastActive")} ${formatRelative(session.lastActive, locale)}`}
                  </p>
                </div>

                {/* Signing yourself out through a list of other devices reads
                    as a mistake, so the current row has no revoke button. */}
                {session.current ? null : (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={revoking === session.id}
                    onClick={() => void revoke(session)}
                  >
                    {revoking === session.id ? (
                      <BrandSpinner />
                    ) : null}
                    {t("account.signOutDevice")}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-muted-foreground">{t("account.devicesNote")}</p>
          <Button
            variant="outline"
            size="sm"
            disabled={sessions === null}
            onClick={() => setConfirmAll(true)}
          >
            <LogOut />
            {others.length > 0
              ? t("account.signOutEverywhere")
              : t("account.signOutThisDevice")}
          </Button>
        </div>
      </div>

      {/* This one ends the current session too, so it is confirmed rather than
          fired from a single tap next to per-device buttons. */}
      <Dialog open={confirmAll} onOpenChange={setConfirmAll}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("account.signOutEverywhere")}</DialogTitle>
            <DialogDescription>{t("account.signOutEverywhereHelp")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmAll(false)}>
              {t("action.cancel")}
            </Button>
            <Button
              onClick={() => {
                void signOutEverywhere().finally(() => router.push("/login"))
              }}
            >
              <LogOut />
              {t("account.signOutEverywhere")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/** A shape people recognise faster than the words next to it. */
function DeviceIcon({ device }: { device: string }) {
  const name = device.toLowerCase()
  if (name.includes("iphone") || name.includes("android")) {
    return <Smartphone className="size-4" />
  }
  if (name.includes("ipad") || name.includes("tablet")) {
    return <Tablet className="size-4" />
  }
  if (name.includes("mac") || name.includes("windows") || name.includes("linux")) {
    return <Laptop className="size-4" />
  }
  return <MonitorSmartphone className="size-4" />
}
