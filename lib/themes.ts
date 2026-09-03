import { DEFAULT_FONT, FONT_STORAGE_KEY } from "@/lib/app-fonts"

/**
 * App themes. Each theme is a full visual personality — palette, display face,
 * corner radius and surface treatment — defined in `app/globals.css` under a
 * `[data-theme]` selector. Adding a theme means adding a block there and an
 * entry here.
 */
export const APP_THEMES = [
  {
    id: "angkor",
    name: { en: "Angkor", km: "អង្គរ" },
    description: {
      en: "Warm parchment, garnet and antique gold. Ceremonial.",
      km: "ក្រដាសពណ៌ត្នោត ត្បូងទទឹម និងមាស។ ពិធីបុណ្យ។",
    },
    swatch: ["oklch(0.435 0.128 20)", "oklch(0.7 0.105 76)", "oklch(0.957 0.012 80)"],
  },
  {
    id: "lotus",
    name: { en: "Lotus", km: "ឈូក" },
    description: {
      en: "Blush tones, rounded forms, soft shadows. Romantic.",
      km: "ពណ៌ផ្កាឈូក ទន់ភ្លន់ និងស្រទន់។",
    },
    swatch: ["oklch(0.555 0.132 8)", "oklch(0.935 0.032 10)", "oklch(0.72 0.09 60)"],
  },
  {
    id: "studio",
    name: { en: "Studio", km: "ស្ទូឌីយោ" },
    description: {
      en: "Cool neutrals, hairline rules, square corners. Editorial.",
      km: "ពណ៌អព្យាក្រឹត បន្ទាត់ស្តើង ជ្រុងចតុកោណ។",
    },
    swatch: ["oklch(0.21 0.008 265)", "oklch(0.912 0.004 265)", "oklch(0.45 0.11 255)"],
  },
] as const

export type AppThemeId = (typeof APP_THEMES)[number]["id"]
export type ThemeMode = "light" | "dark" | "system"

export const DEFAULT_THEME: AppThemeId = "angkor"
export const THEME_STORAGE_KEY = "theabka.theme"
export const MODE_STORAGE_KEY = "theabka.mode"

/**
 * Runs before first paint so the stored theme, mode and typeface are applied
 * without a flash. Kept as a string because it must be inlined into <head>.
 *
 * The font matters here as much as the colours: applied a frame late, the
 * whole page reflows as the metrics change, which is more jarring than a
 * colour swap.
 */
export const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('${THEME_STORAGE_KEY}') || '${DEFAULT_THEME}';
    var m = localStorage.getItem('${MODE_STORAGE_KEY}') || 'light';
    var f = localStorage.getItem('${FONT_STORAGE_KEY}') || '${DEFAULT_FONT}';
    var el = document.documentElement;
    el.setAttribute('data-theme', t);
    el.setAttribute('data-font', f);
    var dark = m === 'dark' || (m === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    el.classList.toggle('dark', dark);
    el.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`.trim()
