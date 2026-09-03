import type { Metadata, Viewport } from "next"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CommandPaletteProvider } from "@/components/providers/command-palette-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { DataProvider } from "@/components/providers/data-provider"
import { LocaleProvider } from "@/components/providers/locale-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { DEFAULT_THEME, themeInitScript } from "@/lib/themes"
import { DEFAULT_FONT, appFontCss } from "@/lib/app-fonts"
import { fontVariables } from "@/lib/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Theabka — Cambodian wedding & event platform",
    template: "%s · Theabka",
  },
  description:
    "Design your invitation, collect RSVPs from a QR code, and keep track of guests, gifts and expenses — built for Cambodian weddings and ceremonies.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfaf4" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1512" },
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      data-font={DEFAULT_FONT}
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: appFontCss() }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>
              <DataProvider>
              <CommandPaletteProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </CommandPaletteProvider>
              </DataProvider>
            </AuthProvider>
            <Toaster position="top-center" />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
