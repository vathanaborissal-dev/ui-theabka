"use client"

import {
  ArrowRight,
  Check,
  Coins,
  ListChecks,
  QrCode,
  Receipt,
  Sparkles,
  Users,
} from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { Photo } from "@/components/shared/photo"
import { Brand } from "@/components/app-shell/brand"
import { LanguageToggle, ThemeMenu } from "@/components/app-shell/appearance-menu"
import { KbachDivider } from "@/components/invitation/ornaments"
import { useLocale } from "@/components/providers/locale-provider"
import { cn } from "@/lib/utils"

const copy = {
  en: {
    eyebrow: "For Cambodian weddings & ceremonies",
    headline: "Your invitation, your guests, your gifts — in one place.",
    sub: "Print the QR on your card. Guests scan it, see a beautiful invitation in Khmer or English, and reply. You watch the numbers come in.",
    cta: "Start your event",
    demo: "See a live invitation",
    flowTitle: "How it works",
    flow: [
      { title: "Design the invitation", body: "Pick a template, add your photos and Khmer wording. Preview as you go." },
      { title: "Print the QR on your card", body: "Keep the physical invitation your family expects. The QR carries everything else." },
      { title: "Guests scan and reply", body: "No app, no account. Three taps and you have their answer and headcount." },
      { title: "Track the day", body: "Check guests in, record envelopes, and see gifts against expenses as it happens." },
    ],
    featuresTitle: "Built for how Cambodian weddings actually run",
    features: [
      { icon: Users, title: "Guest lists that scale", body: "Hundreds of invitations, grouped by family and by side. Search, filter, bulk actions." },
      { icon: Coins, title: "Cash gift tracking", body: "Record envelopes as they are opened, in dollars or riel. Totals and averages update live." },
      { icon: Receipt, title: "Expenses and balance", body: "Venue, catering, decoration and the rest — against what the gifts actually covered." },
      { icon: QrCode, title: "QR on printed cards", body: "The digital invitation complements the physical one instead of replacing it." },
      { icon: ListChecks, title: "A planner that fits", body: "Tasks and dates for the ceremony, the vendors and the final headcount." },
      { icon: Sparkles, title: "Khmer and English", body: "Every guest-facing screen is bilingual, with proper Khmer typography." },
    ],
    pricingTitle: "Simple pricing, per event",
    plans: [
      { name: "Free", price: "$0", note: "Invitation & RSVP", features: ["One digital invitation", "QR code & sharing", "Up to 50 guests", "RSVP collection"] },
      { name: "Premium", price: "$9", note: "per event", featured: true, features: ["Everything in Free", "All premium templates", "Unlimited guests", "Guest management & check-in", "Personal guest links"] },
      { name: "Complete", price: "$25", note: "per event", features: ["Everything in Premium", "Gift & envelope tracking", "Expense tracking & balance", "Planner & timeline", "Export to spreadsheet"] },
    ],
    closingTitle: "Ready when you are",
    closingBody: "Set up your event in two minutes. Nothing to install, and your guests never need an account.",
  },
  km: {
    eyebrow: "សម្រាប់ពិធីមង្គលការ និងពិធីបុណ្យខ្មែរ",
    headline: "ធៀប ភ្ញៀវ និងចំណងដៃ — នៅកន្លែងតែមួយ។",
    sub: "បោះពុម្ពកូដ QR លើធៀបរបស់អ្នក។ ភ្ញៀវស្កេន មើលធៀបដ៏ស្រស់ស្អាតជាភាសាខ្មែរ ឬអង់គ្លេស រួចឆ្លើយតប។ អ្នកឃើញលទ្ធផលភ្លាមៗ។",
    cta: "ចាប់ផ្តើមកម្មវិធីរបស់អ្នក",
    demo: "មើលធៀបគំរូ",
    flowTitle: "របៀបប្រើប្រាស់",
    flow: [
      { title: "រចនាធៀប", body: "ជ្រើសរើសគំរូ បញ្ចូលរូបភាព និងអក្សរខ្មែរ។ មើលលទ្ធផលភ្លាមៗ។" },
      { title: "បោះពុម្ពកូដ QR លើធៀប", body: "រក្សាធៀបក្រដាសតាមប្រពៃណី។ កូដ QR នាំយកព័ត៌មានផ្សេងៗទៀត។" },
      { title: "ភ្ញៀវស្កេន និងឆ្លើយតប", body: "មិនត្រូវការកម្មវិធី ឬគណនី។ ចុចបីដងជាបានចម្លើយ និងចំនួនភ្ញៀវ។" },
      { title: "តាមដានថ្ងៃពិធី", body: "សម្គាល់ភ្ញៀវមកដល់ កត់ត្រាចំណងដៃ និងមើលតុល្យភាពជាមួយចំណាយ។" },
    ],
    featuresTitle: "រៀបចំតាមរបៀបនៃពិធីមង្គលការខ្មែរពិតប្រាកដ",
    features: [
      { icon: Users, title: "បញ្ជីភ្ញៀវធំៗ", body: "ធៀបរាប់រយ ចាត់តាមគ្រួសារ និងតាមខាង។ ស្វែងរក ត្រង និងធ្វើជាក្រុម។" },
      { icon: Coins, title: "តាមដានចំណងដៃ", body: "កត់ត្រានៅពេលបើកស្រោម ជាដុល្លារ ឬរៀល។ សរុបភ្លាមៗ។" },
      { icon: Receipt, title: "ចំណាយ និងតុល្យភាព", body: "សាល អាហារ ការតុបតែង ធៀបនឹងចំណងដៃដែលទទួលបាន។" },
      { icon: QrCode, title: "កូដ QR លើធៀបក្រដាស", body: "ធៀបឌីជីថលបំពេញបន្ថែម មិនមែនជំនួសធៀបក្រដាសទេ។" },
      { icon: ListChecks, title: "ផែនការសមស្រប", body: "កិច្ចការ និងកាលកំណត់សម្រាប់ពិធី អ្នកផ្គត់ផ្គង់ និងចំនួនភ្ញៀវចុងក្រោយ។" },
      { icon: Sparkles, title: "ខ្មែរ និងអង់គ្លេស", body: "គ្រប់ទំព័រសម្រាប់ភ្ញៀវមានពីរភាសា ជាមួយអក្សរខ្មែរត្រឹមត្រូវ។" },
    ],
    pricingTitle: "តម្លៃសាមញ្ញ ក្នុងមួយកម្មវិធី",
    plans: [
      { name: "ឥតគិតថ្លៃ", price: "$0", note: "ធៀប និងការឆ្លើយតប", features: ["ធៀបឌីជីថលមួយ", "កូដ QR និងការចែករំលែក", "ភ្ញៀវរហូតដល់ ៥០ នាក់", "ប្រមូលការឆ្លើយតប"] },
      { name: "ពិសេស", price: "$9", note: "ក្នុងមួយកម្មវិធី", featured: true, features: ["រួមបញ្ចូលកញ្ចប់ឥតគិតថ្លៃ", "គំរូធៀបទាំងអស់", "ភ្ញៀវគ្មានដែនកំណត់", "គ្រប់គ្រងភ្ញៀវ និងសម្គាល់ការមកដល់", "តំណផ្ទាល់ខ្លួនសម្រាប់ភ្ញៀវ"] },
      { name: "ពេញលេញ", price: "$25", note: "ក្នុងមួយកម្មវិធី", features: ["រួមបញ្ចូលកញ្ចប់ពិសេស", "តាមដានចំណងដៃ", "តាមដានចំណាយ និងតុល្យភាព", "ផែនការ និងកាលវិភាគ", "នាំចេញជាឯកសារ"] },
    ],
    closingTitle: "ត្រៀមរួចរាល់នៅពេលអ្នកចង់",
    closingBody: "រៀបចំកម្មវិធីក្នុងរយៈពេលពីរនាទី។ មិនត្រូវដំឡើងអ្វីទេ ហើយភ្ញៀវមិនចាំបាច់មានគណនី។",
  },
}

export function Landing() {
  const { locale } = useLocale()
  const c = copy[locale]

  return (
    <div className="min-h-svh bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Brand href="/" />
          <nav className="ml-auto flex items-center gap-2">
            <LanguageToggle />
            <ThemeMenu />
            <ButtonLink href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
              {locale === "km" ? "ចូលប្រើ" : "Sign in"}
            </ButtonLink>
            <ButtonLink href="/signup" size="sm">
              {c.cta}
            </ButtonLink>
          </nav>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="relative border-b border-border">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-24">
            <div>
              <p className="eyebrow text-primary">{c.eyebrow}</p>
              <h1 className="display mt-4 text-[2.25rem] leading-[1.1] text-balance sm:text-5xl lg:text-[3.5rem]">
                {c.headline}
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                {c.sub}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/events/new" size="xl">
                  {c.cta}
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink
                  href="/i/rithy-and-sreyneang"
                  size="xl"
                  variant="outline"
                  target="_blank"
                >
                  {c.demo}
                </ButtonLink>
              </div>
              <KbachDivider className="mt-10 h-5 w-48 text-gold" />
            </div>

            {/* A phone showing the real invitation, not an abstract illustration. */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="rounded-[2.25rem] border border-border bg-card p-3 shadow-2xl shadow-foreground/8">
                <div className="overflow-hidden rounded-[1.6rem] bg-[oklch(0.973_0.013_84)]">
                  <div className="flex flex-col items-center border border-[oklch(0.68_0.1_76)]/40 p-6 text-center">
                    <p className="text-[0.625rem] tracking-[0.24em] text-[oklch(0.5_0.03_45)] uppercase">
                      Wedding
                    </p>
                    <p
                      className="mt-5 text-2xl text-[oklch(0.235_0.025_40)]"
                      style={{ fontFamily: "var(--font-moul), serif" }}
                      lang="km"
                    >
                      សុខ រិទ្ធី
                    </p>
                    <p className="my-2 text-lg text-[oklch(0.68_0.1_76)]">&amp;</p>
                    <p
                      className="text-2xl text-[oklch(0.235_0.025_40)]"
                      style={{ fontFamily: "var(--font-moul), serif" }}
                      lang="km"
                    >
                      មាស ស្រីនាង
                    </p>
                    <KbachDivider className="mt-5 h-4 w-32 text-[oklch(0.68_0.1_76)]" />
                    <p className="mt-4 text-sm text-[oklch(0.235_0.025_40)]">17 October 2026</p>
                    <p className="mt-0.5 text-xs text-[oklch(0.5_0.03_45)]">
                      Diamond Island, Phnom Penh
                    </p>
                  </div>
                  <Photo
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=70"
                    alt=""
                    seed={1}
                    rounded={false}
                    className="aspect-4/3 w-full"
                  />
                </div>
              </div>

              <div className="absolute -bottom-4 -left-5 hidden rounded-[var(--card-radius)] border border-border bg-card px-4 py-3 shadow-lg sm:block">
                <p className="text-xs text-muted-foreground">{locale === "km" ? "បានបញ្ជាក់" : "Confirmed"}</p>
                <p className="display tnum text-xl text-success">248</p>
              </div>
            </div>
          </div>
        </section>

        {/* Flow */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
            <h2 className="display text-center text-2xl sm:text-3xl">{c.flowTitle}</h2>
            <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {c.flow.map((item, i) => (
                <li key={item.title} className="relative">
                  <span className="display flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm text-primary">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-medium">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border bg-muted/25">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
            <h2 className="display max-w-2xl text-2xl text-balance sm:text-3xl">
              {c.featuresTitle}
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {c.features.map((feature) => {
                const Icon = feature.icon
                return (
                  <li
                    key={feature.title}
                    className="rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card p-5 shadow-(--shadow-card)"
                  >
                    <Icon className="size-5 text-primary" aria-hidden="true" />
                    <h3 className="mt-3.5 font-medium">{feature.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {feature.body}
                    </p>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-b border-border">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:py-20">
            <h2 className="display text-center text-2xl sm:text-3xl">{c.pricingTitle}</h2>
            <ul className="mt-10 grid gap-4 lg:grid-cols-3">
              {c.plans.map((plan) => (
                <li
                  key={plan.name}
                  className={cn(
                    "flex flex-col rounded-[var(--card-radius)] border bg-card p-6",
                    "featured" in plan && plan.featured
                      ? "border-primary shadow-lg ring-1 ring-primary"
                      : "border-[var(--card-border-color)] shadow-(--shadow-card)"
                  )}
                >
                  {"featured" in plan && plan.featured ? (
                    <span className="eyebrow mb-3 self-start rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                      {locale === "km" ? "ពេញនិយម" : "Most popular"}
                    </span>
                  ) : null}
                  <h3 className="text-sm font-medium text-muted-foreground">{plan.name}</h3>
                  <p className="display mt-1.5 text-3xl">{plan.price}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{plan.note}</p>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check
                          className="mt-0.5 size-3.5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <ButtonLink
                    href="/events/new"
                    className="mt-6"
                    variant={"featured" in plan && plan.featured ? "default" : "outline"}
                  >
                    {c.cta}
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing */}
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-24">
          <h2 className="display text-2xl text-balance sm:text-3xl">{c.closingTitle}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {c.closingBody}
          </p>
          <ButtonLink href="/events/new" size="xl" className="mt-7">
            {c.cta}
            <ArrowRight />
          </ButtonLink>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Brand href="/" />
          <p className="text-xs text-muted-foreground">
            {locale === "km"
              ? "ផលិតនៅកម្ពុជា សម្រាប់គ្រួសារខ្មែរ។"
              : "Made in Cambodia, for Cambodian families."}
          </p>
        </div>
      </footer>
    </div>
  )
}
