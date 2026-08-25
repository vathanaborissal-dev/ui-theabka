import Link from "next/link"
import type { VariantProps } from "class-variance-authority"
import { Button, buttonVariants } from "@/components/ui/button"

type ButtonLinkProps = VariantProps<typeof buttonVariants> & {
  href: React.ComponentProps<typeof Link>["href"]
  children?: React.ReactNode
  className?: string
  target?: string
  rel?: string
  prefetch?: boolean
  title?: string
  "aria-label"?: string
}

/**
 * A button that navigates. Base UI asserts when a button renders as something
 * other than <button>, so the `nativeButton={false}` opt-out lives here once
 * instead of at every call site.
 */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  target,
  rel,
  prefetch,
  ...props
}: ButtonLinkProps) {
  return (
    <Button
      nativeButton={false}
      variant={variant}
      size={size}
      className={className}
      render={
        <Link
          href={href}
          target={target}
          rel={target === "_blank" ? (rel ?? "noreferrer") : rel}
          prefetch={prefetch}
        />
      }
      {...props}
    >
      {children}
    </Button>
  )
}
