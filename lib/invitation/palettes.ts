/**
 * Invitation palettes.
 *
 * These are independent of the dashboard theme: a couple can run the admin in
 * dark mode and still hand out an ivory invitation. Every value is emitted as a
 * CSS custom property scoped to the invitation root.
 */
export type InvitationPalette = {
  id: string
  name: { en: string; km: string }
  /** Three-colour chip shown in the picker. */
  swatch: [string, string, string]
  vars: {
    "--inv-bg": string
    "--inv-surface": string
    "--inv-fg": string
    "--inv-muted": string
    "--inv-accent": string
    "--inv-accent-contrast": string
    "--inv-gold": string
    "--inv-border": string
  }
}

export const PALETTES: InvitationPalette[] = [
  {
    id: "garnet-gold",
    name: { en: "Garnet & Gold", km: "ត្បូងទទឹម និងមាស" },
    swatch: ["oklch(0.42 0.13 22)", "oklch(0.7 0.1 76)", "oklch(0.975 0.012 84)"],
    vars: {
      "--inv-bg": "oklch(0.973 0.013 84)",
      "--inv-surface": "oklch(0.995 0.006 84)",
      "--inv-fg": "oklch(0.235 0.025 40)",
      "--inv-muted": "oklch(0.5 0.03 45)",
      "--inv-accent": "oklch(0.42 0.13 22)",
      "--inv-accent-contrast": "oklch(0.985 0.01 84)",
      "--inv-gold": "oklch(0.68 0.1 76)",
      "--inv-border": "oklch(0.88 0.022 76)",
    },
  },
  {
    id: "sand",
    name: { en: "Sand", km: "ខ្សាច់" },
    swatch: ["oklch(0.36 0.02 60)", "oklch(0.72 0.05 70)", "oklch(0.968 0.009 75)"],
    vars: {
      "--inv-bg": "oklch(0.968 0.009 75)",
      "--inv-surface": "oklch(0.992 0.005 75)",
      "--inv-fg": "oklch(0.245 0.014 60)",
      "--inv-muted": "oklch(0.52 0.018 60)",
      "--inv-accent": "oklch(0.36 0.022 60)",
      "--inv-accent-contrast": "oklch(0.98 0.006 75)",
      "--inv-gold": "oklch(0.66 0.058 70)",
      "--inv-border": "oklch(0.885 0.012 70)",
    },
  },
  {
    id: "sage",
    name: { en: "Sage", km: "បៃតងស្រាល" },
    swatch: ["oklch(0.4 0.058 155)", "oklch(0.72 0.06 140)", "oklch(0.972 0.012 145)"],
    vars: {
      "--inv-bg": "oklch(0.972 0.012 145)",
      "--inv-surface": "oklch(0.994 0.005 145)",
      "--inv-fg": "oklch(0.235 0.022 155)",
      "--inv-muted": "oklch(0.49 0.028 155)",
      "--inv-accent": "oklch(0.4 0.058 155)",
      "--inv-accent-contrast": "oklch(0.985 0.008 145)",
      "--inv-gold": "oklch(0.68 0.075 95)",
      "--inv-border": "oklch(0.885 0.018 145)",
    },
  },
  {
    id: "blush",
    name: { en: "Blush", km: "ផ្កាឈូក" },
    swatch: ["oklch(0.52 0.11 10)", "oklch(0.87 0.05 10)", "oklch(0.982 0.008 15)"],
    vars: {
      "--inv-bg": "oklch(0.982 0.008 15)",
      "--inv-surface": "oklch(1 0.003 15)",
      "--inv-fg": "oklch(0.255 0.03 350)",
      "--inv-muted": "oklch(0.52 0.035 350)",
      "--inv-accent": "oklch(0.52 0.11 10)",
      "--inv-accent-contrast": "oklch(0.99 0.006 15)",
      "--inv-gold": "oklch(0.72 0.07 55)",
      "--inv-border": "oklch(0.9 0.018 10)",
    },
  },
  {
    id: "midnight",
    name: { en: "Midnight", km: "រាត្រី" },
    swatch: ["oklch(0.78 0.1 80)", "oklch(0.28 0.03 265)", "oklch(0.18 0.022 265)"],
    vars: {
      "--inv-bg": "oklch(0.175 0.022 265)",
      "--inv-surface": "oklch(0.225 0.026 265)",
      "--inv-fg": "oklch(0.955 0.008 80)",
      "--inv-muted": "oklch(0.73 0.018 265)",
      "--inv-accent": "oklch(0.79 0.1 80)",
      "--inv-accent-contrast": "oklch(0.18 0.022 265)",
      "--inv-gold": "oklch(0.82 0.095 82)",
      "--inv-border": "oklch(0.33 0.026 265)",
    },
  },
  {
    id: "sandstone",
    name: { en: "Sandstone", km: "ថ្មភក់" },
    swatch: ["oklch(0.44 0.055 55)", "oklch(0.7 0.085 68)", "oklch(0.955 0.016 72)"],
    vars: {
      "--inv-bg": "oklch(0.955 0.016 72)",
      "--inv-surface": "oklch(0.982 0.01 72)",
      "--inv-fg": "oklch(0.265 0.028 50)",
      "--inv-muted": "oklch(0.505 0.032 52)",
      "--inv-accent": "oklch(0.44 0.055 48)",
      "--inv-accent-contrast": "oklch(0.975 0.012 72)",
      "--inv-gold": "oklch(0.7 0.085 68)",
      "--inv-border": "oklch(0.865 0.024 68)",
    },
  },
  {
    id: "temple-night",
    name: { en: "Temple night", km: "ប្រាសាទរាត្រី" },
    swatch: ["oklch(0.8 0.11 82)", "oklch(0.3 0.035 60)", "oklch(0.19 0.025 55)"],
    vars: {
      "--inv-bg": "oklch(0.185 0.025 55)",
      "--inv-surface": "oklch(0.238 0.03 55)",
      "--inv-fg": "oklch(0.955 0.014 78)",
      "--inv-muted": "oklch(0.735 0.028 70)",
      "--inv-accent": "oklch(0.805 0.11 82)",
      "--inv-accent-contrast": "oklch(0.19 0.025 55)",
      "--inv-gold": "oklch(0.84 0.1 84)",
      "--inv-border": "oklch(0.345 0.035 58)",
    },
  },
  {
    id: "saffron",
    name: { en: "Saffron", km: "ពណ៌លឿងស្វាយ" },
    swatch: ["oklch(0.52 0.15 55)", "oklch(0.78 0.13 72)", "oklch(0.975 0.018 80)"],
    vars: {
      "--inv-bg": "oklch(0.975 0.018 80)",
      "--inv-surface": "oklch(0.995 0.01 80)",
      "--inv-fg": "oklch(0.255 0.032 48)",
      "--inv-muted": "oklch(0.505 0.038 52)",
      "--inv-accent": "oklch(0.52 0.15 52)",
      "--inv-accent-contrast": "oklch(0.985 0.014 80)",
      "--inv-gold": "oklch(0.755 0.125 74)",
      "--inv-border": "oklch(0.885 0.03 74)",
    },
  },
  {
    id: "jade",
    name: { en: "Jade & gold", km: "បៃតង និងមាស" },
    swatch: ["oklch(0.38 0.07 168)", "oklch(0.72 0.1 90)", "oklch(0.965 0.014 160)"],
    vars: {
      "--inv-bg": "oklch(0.965 0.014 160)",
      "--inv-surface": "oklch(0.99 0.007 160)",
      "--inv-fg": "oklch(0.23 0.03 168)",
      "--inv-muted": "oklch(0.48 0.032 168)",
      "--inv-accent": "oklch(0.38 0.07 168)",
      "--inv-accent-contrast": "oklch(0.98 0.01 160)",
      "--inv-gold": "oklch(0.72 0.1 90)",
      "--inv-border": "oklch(0.875 0.022 160)",
    },
  },
  {
    id: "royal",
    name: { en: "Royal indigo", km: "ខៀវព្រះរាជា" },
    swatch: ["oklch(0.35 0.11 275)", "oklch(0.75 0.11 85)", "oklch(0.968 0.012 275)"],
    vars: {
      "--inv-bg": "oklch(0.968 0.012 275)",
      "--inv-surface": "oklch(0.992 0.006 275)",
      "--inv-fg": "oklch(0.235 0.045 275)",
      "--inv-muted": "oklch(0.49 0.045 275)",
      "--inv-accent": "oklch(0.35 0.11 275)",
      "--inv-accent-contrast": "oklch(0.985 0.008 275)",
      "--inv-gold": "oklch(0.75 0.11 85)",
      "--inv-border": "oklch(0.875 0.024 275)",
    },
  },
  {
    id: "indigo-gold",
    name: { en: "Indigo & gold", km: "ខៀវខ្មៅ និងមាស" },
    swatch: ["oklch(0.32 0.14 282)", "oklch(0.74 0.11 85)", "oklch(0.985 0.004 280)"],
    vars: {
      "--inv-bg": "oklch(0.985 0.004 280)",
      "--inv-surface": "oklch(1 0.002 280)",
      "--inv-fg": "oklch(0.24 0.05 282)",
      "--inv-muted": "oklch(0.48 0.045 282)",
      "--inv-accent": "oklch(0.32 0.14 282)",
      "--inv-accent-contrast": "oklch(0.985 0.006 280)",
      "--inv-gold": "oklch(0.72 0.11 85)",
      "--inv-border": "oklch(0.88 0.025 282)",
    },
  },
  {
    id: "pastel-dawn",
    name: { en: "Pastel dawn", km: "ព្រឹកព្រាង" },
    swatch: ["oklch(0.62 0.09 320)", "oklch(0.78 0.1 78)", "oklch(0.975 0.014 320)"],
    vars: {
      "--inv-bg": "oklch(0.976 0.014 320)",
      "--inv-surface": "oklch(0.995 0.006 320)",
      "--inv-fg": "oklch(0.3 0.04 320)",
      "--inv-muted": "oklch(0.52 0.035 320)",
      "--inv-accent": "oklch(0.58 0.085 322)",
      "--inv-accent-contrast": "oklch(0.99 0.006 320)",
      "--inv-gold": "oklch(0.75 0.105 80)",
      "--inv-border": "oklch(0.9 0.022 320)",
    },
  },
  {
    id: "ivory",
    name: { en: "Ivory", km: "ភ្លឺស" },
    swatch: ["oklch(0.28 0.005 265)", "oklch(0.72 0.006 265)", "oklch(0.99 0 0)"],
    vars: {
      "--inv-bg": "oklch(0.99 0 0)",
      "--inv-surface": "oklch(1 0 0)",
      "--inv-fg": "oklch(0.2 0.005 265)",
      "--inv-muted": "oklch(0.5 0.006 265)",
      "--inv-accent": "oklch(0.28 0.006 265)",
      "--inv-accent-contrast": "oklch(0.99 0 0)",
      "--inv-gold": "oklch(0.62 0.02 265)",
      "--inv-border": "oklch(0.9 0.003 265)",
    },
  },
]

export function getPalette(id: string) {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0]
}

/** Turns a palette into an inline style object for the invitation root. */
export function paletteStyle(id: string): React.CSSProperties {
  return getPalette(id).vars as unknown as React.CSSProperties
}
