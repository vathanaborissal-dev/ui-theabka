"use client"

import { Check, Monitor, Moon, Palette, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocale } from "@/components/providers/locale-provider"
import { useTheme } from "@/components/providers/theme-provider"
import { APP_THEMES, type ThemeMode } from "@/lib/themes"
import {
  APP_FONTS,
  FONT_CATEGORY_LABELS,
  type AppFont,
  type AppFontCategory,
  type AppFontId,
} from "@/lib/app-fonts"
import { cn } from "@/lib/utils"

const modeIcons: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

/**
 * Theme family + light/dark, without the surrounding menu. Split out so the
 * same controls can sit in their own dropdown or nested inside the profile
 * menu, rather than being duplicated.
 */
export function ThemeMenuItems() {
  const { theme, setTheme, mode, setMode } = useTheme()
  const { t, locale } = useLocale()

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel>{t("common.theme")}</DropdownMenuLabel>
        {APP_THEMES.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => setTheme(item.id)}
            className="items-start gap-2.5 py-2"
          >
            <span className="mt-0.5 flex shrink-0 gap-0.5" aria-hidden="true">
              {item.swatch.map((color, i) => (
                <span
                  key={i}
                  className="size-3 rounded-full ring-1 ring-black/10"
                  style={{ background: color }}
                />
              ))}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="font-medium">{item.name[locale]}</span>
                {theme === item.id ? <Check className="size-3.5 text-primary" /> : null}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                {item.description[locale]}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel>Typeface</DropdownMenuLabel>
        <div className="p-1 pt-0">
          <FontSelect />
        </div>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel>{t("common.appearance")}</DropdownMenuLabel>
        <div className="flex gap-1 p-1">
          {(["light", "dark", "system"] as ThemeMode[]).map((m) => {
            const Icon = modeIcons[m]
            const active = mode === m
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={active}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "border-primary/40 bg-primary/8 text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {t(`common.${m}`)}
              </button>
            )
          })}
        </div>
      </DropdownMenuGroup>
    </>
  )
}

/**
 * The face the interface is set in.
 *
 * A select rather than a menu: two dozen options is a list to scan and pick
 * from, not a set of commands, and a select gives the keyboard behaviour
 * (type-ahead, a scrolling listbox, the current value shown on the trigger)
 * that a stack of menu items would have to imitate badly.
 *
 * Every row is drawn in the font it selects, because a list of names tells
 * you nothing about what you are choosing — seeing the difference is the
 * whole point of the control.
 */
export function FontSelect({ className }: { className?: string }) {
  const { font, setFont } = useTheme()

  const groups = APP_FONTS.reduce<Record<string, AppFont[]>>((acc, item) => {
    ;(acc[item.category] ??= []).push(item)
    return acc
  }, {})

  return (
    <Select
      value={font}
      onValueChange={(value) => {
        if (value) setFont(value as AppFontId)
      }}
      items={APP_FONTS.map((item) => ({ value: item.id, label: item.name }))}
    >
      <SelectTrigger size="sm" aria-label="Typeface" className={cn("w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      {/* Anchored to the trigger rather than to the selected item: the list is
          long enough to be scrolled, and aligning it to the current choice
          would drop it over the menu it was opened from. */}
      <SelectContent alignItemWithTrigger={false} align="start" className="max-h-72">
        {(Object.keys(groups) as AppFontCategory[]).map((category) => (
          <SelectGroup key={category}>
            <SelectLabel>{FONT_CATEGORY_LABELS[category]}</SelectLabel>
            {groups[category].map((item) => (
              <SelectItem
                key={item.id}
                value={item.id}
                // The serif options change headings only, so previewing them
                // in the display stack is what the reader will actually get.
                style={{
                  fontFamily: item.category === "serif" ? item.display : (item.ui ?? undefined),
                }}
              >
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Theme family + light/dark, in one menu. */
export function ThemeMenu({ align = "end" }: { align?: "start" | "center" | "end" }) {
  const { t } = useLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={t("common.appearance")}>
            <Palette />
          </Button>
        }
      />
      <DropdownMenuContent align={align} className="w-64">
        <ThemeMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Two languages only, so a toggle beats a menu. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale()

  return (
    <div
      className={cn("inline-flex items-center rounded-full bg-muted p-0.5", className)}
      role="group"
      aria-label={t("common.language")}
    >
      {(["en", "km"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          lang={code}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            locale === code
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {code === "en" ? "EN" : "ខ្មែរ"}
        </button>
      ))}
    </div>
  )
}
