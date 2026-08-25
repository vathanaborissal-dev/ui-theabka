import { ButtonLink } from "@/components/ui/button-link"
import { BrandMark } from "@/components/app-shell/brand"

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <BrandMark className="size-10" />
      <h1 className="display text-2xl">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The link may be out of date. If you were sent an invitation, please check with the family
        who invited you.
      </p>
      <ButtonLink href="/" className="mt-2">
        Go to Theabka
      </ButtonLink>
    </main>
  )
}
