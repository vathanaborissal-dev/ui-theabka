"use client"

import * as React from "react"
import { ArrowRight, Check } from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { Brand } from "@/components/app-shell/brand"
import { LanguageToggle, ThemeMenu } from "@/components/app-shell/appearance-menu"
import { KbachDivider } from "@/components/invitation/ornaments"
import { FlowerGarland, LotusFrieze } from "@/components/invitation/khmer-ornaments"
import { PatternBackground } from "@/components/invitation/patterns"
import { InvitationCardStack } from "@/components/marketing/invitation-card-stack"
import { LedgerPreview } from "@/components/marketing/ledger-preview"
import { TemplateSwatches, TEMPLATE_COUNT } from "@/components/marketing/template-swatches"
import { useLocale } from "@/components/providers/locale-provider"
import { formatNumber } from "@/lib/format"
import type { Locale } from "@/lib/types"
import { cn } from "@/lib/utils"

const copy = {
  en: {
    nav: { templates: "Templates", pricing: "Pricing", signIn: "Sign in" },
    headline: "Keep the printed card. Add everything it can’t carry.",
    sub: "A QR on your invitation opens a Khmer invitation your guests can reply to in three taps. You get the headcount, the door list, and a gift book that adds itself up.",
    cta: "Start your event",
    ctaClosing: "Create your event",
    demo: "See a live invitation",
    specs: [
      `${TEMPLATE_COUNT} templates`,
      "Khmer & English",
      "No app for guests",
    ],

    flowTitle: "From the printer to the last envelope",
    flow: [
      { title: "Design the invitation", body: "Pick a template, set your Khmer wording and photos, and preview it exactly as a guest will see it." },
      { title: "Print the QR on your card", body: "Hand your designer one code. The physical invitation your family expects stays exactly as it is." },
      { title: "Guests scan and reply", body: "Three taps: coming, how many, which side. No app to install and no account to make." },
      { title: "Run the day", body: "Check guests in at the door, record envelopes as they are opened, and watch gifts against costs." },
    ],

    templatesTitle: `${TEMPLATE_COUNT} cards, not one template with your names dropped in.`,
    templatesBody:
      "Each has its own palette, Khmer display face and ornament — from a carved temple card to a single photograph on ivory. The three couples choose most often come first.",
    templatesCta: "Browse the templates",

    dayTitle: "Then comes the day itself",
    dayLead:
      "A Cambodian wedding is paid for by the envelopes that arrive on the night. Theabka records them as they are opened — dollars or riel, either side of the family — and puts the running total next to what the day is costing you.",
    dayItems: [
      { title: "Guest list", body: "Hundreds of names, grouped by family and by side, with search and bulk actions." },
      { title: "Check-in", body: "Mark arrivals at the door from a phone. Your headcount updates as they walk in." },
      { title: "Expenses", body: "Venue, catering, decoration and the rest, against what the gifts actually covered." },
      { title: "Planner", body: "Tasks and dates, up to the final number the caterer needs." },
    ],

    pricingTitle: "Priced per event, not per month",
    pricingBody: "You are planning one wedding, not renting software. Pay once, keep it until the last thank-you is written.",
    plans: [
      { name: "Free", price: "$0", note: "Invitation & RSVP", features: ["One digital invitation", "QR code & sharing", "Up to 50 guests", "RSVP collection"] },
      { name: "Premium", price: "$9", note: "per event", featured: true, features: ["Everything in Free", "All premium templates", "Unlimited guests", "Guest management & check-in", "Personal guest links"] },
      { name: "Complete", price: "$25", note: "per event", features: ["Everything in Premium", "Gift & envelope tracking", "Expense tracking & balance", "Planner & timeline", "Export to spreadsheet"] },
    ],
    popular: "Most popular",

    closingTitle: "Set it up before the cards go to the printer",
    closingBody: "Two minutes to create the event. Your QR is ready to hand to the designer the same afternoon.",
    footerNote: "Made in Cambodia, for Cambodian families.",
  },

  km: {
    nav: { templates: "គំរូធៀប", pricing: "តម្លៃ", signIn: "ចូលប្រើ" },
    headline: "រក្សាធៀបក្រដាសទុក។ បន្ថែមអ្វីដែលធៀបផ្ទុកមិនបាន។",
    sub: "កូដ QR លើធៀបរបស់អ្នកបើកធៀបជាភាសាខ្មែរ ដែលភ្ញៀវឆ្លើយតបបានក្នុងការចុចបីដង។ អ្នកទទួលបានចំនួនភ្ញៀវ បញ្ជីទទួលភ្ញៀវ និងសៀវភៅចំណងដៃដែលបូកសរុបដោយខ្លួនឯង។",
    cta: "ចាប់ផ្តើមកម្មវិធីរបស់អ្នក",
    ctaClosing: "បង្កើតកម្មវិធី",
    demo: "មើលធៀបគំរូ",
    specs: [
      `គំរូធៀប ${formatNumber(TEMPLATE_COUNT, "km")}`,
      "ខ្មែរ និងអង់គ្លេស",
      "ភ្ញៀវមិនត្រូវការកម្មវិធី",
    ],

    flowTitle: "ពីរោងពុម្ព រហូតដល់ស្រោមចុងក្រោយ",
    flow: [
      { title: "រចនាធៀប", body: "ជ្រើសរើសគំរូ បញ្ចូលអក្សរខ្មែរ និងរូបភាព រួចមើលលទ្ធផលដូចភ្ញៀវឃើញពិតប្រាកដ។" },
      { title: "បោះពុម្ពកូដ QR លើធៀប", body: "ប្រគល់កូដមួយទៅអ្នករចនា។ ធៀបក្រដាសតាមប្រពៃណីនៅដដែល។" },
      { title: "ភ្ញៀវស្កេន និងឆ្លើយតប", body: "ចុចបីដង៖ មក ប៉ុន្មាននាក់ ខាងណា។ មិនត្រូវដំឡើងកម្មវិធី ឬបង្កើតគណនីទេ។" },
      { title: "គ្រប់គ្រងថ្ងៃពិធី", body: "សម្គាល់ភ្ញៀវមកដល់ កត់ត្រាចំណងដៃពេលបើកស្រោម និងមើលធៀបនឹងចំណាយ។" },
    ],

    templatesTitle: `គំរូធៀប ${formatNumber(TEMPLATE_COUNT, "km")} ផ្សេងៗគ្នា មិនមែនគំរូតែមួយប្តូរឈ្មោះទេ។`,
    templatesBody:
      "គំរូនីមួយៗមានពណ៌ អក្សរខ្មែរ និងក្បាច់រៀងៗខ្លួន — ចាប់ពីធៀបប្រាសាទចម្លាក់ រហូតដល់រូបថតតែមួយលើក្រដាសពណ៌ភ្លុក។ គំរូបីដែលគេជ្រើសរើសច្រើនជាងគេ ស្ថិតនៅដំបូង។",
    templatesCta: "មើលគំរូធៀបទាំងអស់",

    dayTitle: "បន្ទាប់មកគឺថ្ងៃពិធី",
    dayLead:
      "ពិធីមង្គលការខ្មែរ ត្រូវបានចំណាយដោយស្រោមដែលមកដល់នៅយប់នោះ។ Theabka កត់ត្រាពេលបើកស្រោម — ជាដុល្លារ ឬរៀល ទាំងសងខាង — ហើយដាក់លទ្ធផលសរុបជាប់នឹងចំណាយរបស់អ្នក។",
    dayItems: [
      { title: "បញ្ជីភ្ញៀវ", body: "ឈ្មោះរាប់រយ ចាត់តាមគ្រួសារ និងតាមខាង ព្រមទាំងស្វែងរក និងធ្វើជាក្រុម។" },
      { title: "ទទួលភ្ញៀវ", body: "សម្គាល់ការមកដល់នៅមាត់ទ្វារតាមទូរស័ព្ទ។ ចំនួនភ្ញៀវប្តូរភ្លាមៗ។" },
      { title: "ចំណាយ", body: "សាល អាហារ ការតុបតែង និងផ្សេងៗ ធៀបនឹងចំណងដៃដែលទទួលបាន។" },
      { title: "ផែនការ", body: "កិច្ចការ និងកាលកំណត់ រហូតដល់ចំនួនចុងក្រោយសម្រាប់អ្នកចម្អិន។" },
    ],

    pricingTitle: "គិតថ្លៃតាមកម្មវិធី មិនមែនតាមខែ",
    pricingBody: "អ្នករៀបចំពិធីមួយ មិនមែនជួលកម្មវិធីទេ។ បង់ម្តង ប្រើរហូតដល់ចប់ពិធី។",
    plans: [
      { name: "ឥតគិតថ្លៃ", price: "$0", note: "ធៀប និងការឆ្លើយតប", features: ["ធៀបឌីជីថលមួយ", "កូដ QR និងការចែករំលែក", "ភ្ញៀវរហូតដល់ ៥០ នាក់", "ប្រមូលការឆ្លើយតប"] },
      { name: "ពិសេស", price: "$9", note: "ក្នុងមួយកម្មវិធី", featured: true, features: ["រួមបញ្ចូលកញ្ចប់ឥតគិតថ្លៃ", "គំរូធៀបទាំងអស់", "ភ្ញៀវគ្មានដែនកំណត់", "គ្រប់គ្រងភ្ញៀវ និងសម្គាល់ការមកដល់", "តំណផ្ទាល់ខ្លួនសម្រាប់ភ្ញៀវ"] },
      { name: "ពេញលេញ", price: "$25", note: "ក្នុងមួយកម្មវិធី", features: ["រួមបញ្ចូលកញ្ចប់ពិសេស", "តាមដានចំណងដៃ", "តាមដានចំណាយ និងតុល្យភាព", "ផែនការ និងកាលវិភាគ", "នាំចេញជាឯកសារ"] },
    ],
    popular: "ពេញនិយម",

    closingTitle: "រៀបចំមុនពេលនាំធៀបទៅរោងពុម្ព",
    closingBody: "ពីរនាទីដើម្បីបង្កើតកម្មវិធី។ កូដ QR របស់អ្នករួចរាល់ ប្រគល់ជូនអ្នករចនាបាននៅរសៀលនោះតែម្តង។",
    footerNote: "ផលិតនៅកម្ពុជា សម្រាប់គ្រួសារខ្មែរ។",
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

      <SiteHeader c={c} locale={locale} />

      <main id="main">
        <Hero c={c} locale={locale} />
        <Flow c={c} locale={locale} />
        <Templates c={c} locale={locale} />
        <TheDay c={c} locale={locale} />
        <Pricing c={c} locale={locale} />
        <Closing c={c} locale={locale} />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Brand href="/" />
          <p className="text-xs text-muted-foreground">{c.footerNote}</p>
        </div>
      </footer>
    </div>
  )
}

type Copy = (typeof copy)["en"]

/**
 * The header sits on the hero's own parchment until the page moves, so the
 * first screen reads as one sheet rather than a bar bolted above a banner. The
 * hairline and blur arrive only once there is content behind it to separate.
 */
function SiteHeader({ c, locale }: { c: Copy; locale: Locale }) {
  const [lifted, setLifted] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        // A step above the z-30 the app's other sticky headers use, so page
        // content can never tie it and win on DOM order — which is how the
        // hero's card deck ended up scrolling over the bar. Still below the
        // z-50 that dialogs and the skip link occupy.
        "sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300",
        lifted
          ? "border-b border-border/70 bg-background/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Brand href="/" />

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <a
            href="#templates"
            className="hidden rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:inline-block"
          >
            {c.nav.templates}
          </a>
          <a
            href="#pricing"
            className="hidden rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:inline-block"
          >
            {c.nav.pricing}
          </a>
          <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-border md:block" />

          <LanguageToggle />
          <ThemeMenu />
          <ButtonLink href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            {c.nav.signIn}
          </ButtonLink>
          <ButtonLink href="/signup" size="sm">
            {locale === "km" ? "ចាប់ផ្តើម" : "Get started"}
          </ButtonLink>
        </nav>
      </div>
    </header>
  )
}

function Hero({ c, locale }: { c: Copy; locale: Locale }) {
  return (
    <section className="relative overflow-hidden">
      {/* Decorated paper, not a white canvas — but kept faint enough that the
          headline never competes with it. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-b from-accent/35 via-background to-background" />
        <PatternBackground
          pattern="phka"
          scale={1.15}
          opacity={0.05}
          className="text-primary [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
        />
      </div>

      <div className="mx-auto grid max-w-6xl gap-14 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-center lg:gap-16 lg:pt-16 lg:pb-28">
        <div className="max-w-xl">
          <h1
            lang={locale}
            className="display text-[2.5rem] text-balance sm:text-[3.25rem] lg:text-[3.75rem]"
          >
            {c.headline}
          </h1>

          <p lang={locale} className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {c.sub}
          </p>

          {/* Stacked buttons of different widths read as ragged on a phone,
              so below `sm` they take the full measure instead of wrapping. */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

          {/* Three checkable facts beat one more adjective. */}
          <ul className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/70 pt-5 text-sm text-muted-foreground">
            {c.specs.map((spec) => (
              <li key={spec} className="flex items-center gap-1.5">
                <Check className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
                {spec}
              </li>
            ))}
          </ul>
        </div>

        <InvitationCardStack locale={locale} />
      </div>
    </section>
  )
}

/**
 * Four steps threaded on a single gold rule, the way a printed order of
 * ceremony sets them out. Numbered circles in a bare grid say "wireframe"; the
 * rule is what makes it read as one continuous run from printer to reception.
 */
function Flow({ c, locale }: { c: Copy; locale: Locale }) {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-col items-center text-center">
          <h2 lang={locale} className="display max-w-lg text-2xl text-balance sm:text-3xl">
            {c.flowTitle}
          </h2>
          <LotusFrieze className="mt-5 h-4 w-40 text-gold" />
        </div>

        <ol className="relative mt-12 grid gap-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* The thread. Drawn only where the steps sit side by side. */}
          <span
            aria-hidden="true"
            className="absolute top-[0.9rem] right-8 left-8 hidden h-px bg-linear-to-r from-transparent via-gold/45 to-transparent lg:block"
          />

          {c.flow.map((item, i) => (
            <li key={item.title} className="relative">
              <span className="display tnum flex size-7 items-center justify-center rounded-full bg-background text-sm text-gold ring-1 ring-gold/45 lg:mx-auto">
                {i + 1}
              </span>
              <h3 lang={locale} className="mt-4 font-medium lg:text-center">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground lg:text-center">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Templates({ c, locale }: { c: Copy; locale: Locale }) {
  return (
    <section id="templates" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
          <h2 lang={locale} className="display text-2xl text-balance sm:text-[2rem]">
            {c.templatesTitle}
          </h2>
          {/* Nudged onto the heading's first baseline rather than its box top,
              which is what a cap-height column of body copy needs to look set
              beside a display line rather than floated above it. */}
          <div className="lg:pt-1.5">
            <p lang={locale} className="text-sm leading-relaxed text-muted-foreground">
              {c.templatesBody}
            </p>
            <ButtonLink href="/events/new" variant="outline" className="mt-5">
              {c.templatesCta}
              <ArrowRight />
            </ButtonLink>
          </div>
        </div>

        <div className="mt-11">
          <TemplateSwatches locale={locale} />
        </div>
      </div>
    </section>
  )
}

/**
 * Deliberately not a six-card icon grid. The gift book is the one thing here
 * that no imported wedding app does, so it gets the weight of a panel and the
 * lead paragraph, and the four supporting tools sit beside it as a ruled list.
 */
function TheDay({ c, locale }: { c: Copy; locale: Locale }) {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 lang={locale} className="display text-2xl text-balance sm:text-[2rem]">
              {c.dayTitle}
            </h2>
            <KbachDivider className="mt-5 h-4 w-36 text-gold" />
            <p lang={locale} className="mt-6 leading-relaxed text-muted-foreground">
              {c.dayLead}
            </p>

            <div className="mt-8">
              <LedgerPreview locale={locale} />
            </div>
          </div>

          <ul className="divide-y divide-border lg:mt-2">
            {c.dayItems.map((item) => (
              <li key={item.title} className="py-5 first:pt-0">
                <h3 lang={locale} className="font-medium">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/**
 * One price list rather than three floating cards. The recommended tier is
 * marked with a warmer ground and a gold rule along its top edge — the way a
 * printed list marks a line — instead of a coloured ring around a box.
 */
function Pricing({ c, locale }: { c: Copy; locale: Locale }) {
  return (
    <section id="pricing" className="scroll-mt-20">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="max-w-lg">
          <h2 lang={locale} className="display text-2xl sm:text-[2rem]">
            {c.pricingTitle}
          </h2>
          <p lang={locale} className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {c.pricingBody}
          </p>
        </div>

        <ul className="mt-11 grid overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card) lg:grid-cols-3">
          {c.plans.map((plan) => {
            const featured = "featured" in plan && plan.featured
            return (
              <li
                key={plan.name}
                className={cn(
                  "relative flex flex-col border-border p-7 not-last:border-b lg:not-last:border-r lg:not-last:border-b-0",
                  featured && "bg-accent/30"
                )}
              >
                {featured ? (
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-gold" />
                ) : null}

                {/*
                 * Once the tiers sit side by side, the badge has to occupy a
                 * row in every column: letting it push only the featured one
                 * down knocks the three prices off a shared baseline, which is
                 * the comparison this block exists to make easy. Stacked on a
                 * phone there is nothing to align, so the spacer is dropped
                 * rather than left as a band of empty card.
                 */}
                <span
                  // `lang` so the global script rule drops `.eyebrow`'s
                  // tracking on the Khmer label; letter-spacing splits Khmer
                  // consonant clusters from their subscripts.
                  lang={locale}
                  className={cn(
                    "eyebrow mb-4 self-start text-gold",
                    !featured && "hidden lg:invisible lg:block"
                  )}
                  aria-hidden={!featured}
                >
                  {c.popular}
                </span>

                <h3 lang={locale} className="text-sm font-medium text-muted-foreground">{plan.name}</h3>
                <p className="display tnum mt-2 text-4xl">{plan.price}</p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.note}</p>

                <ul className="mt-6 flex-1 space-y-2.5 border-t border-border/70 pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden="true" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <ButtonLink
                  href="/events/new"
                  className="mt-7"
                  variant={featured ? "default" : "outline"}
                >
                  {c.cta}
                </ButtonLink>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function Closing({ c, locale }: { c: Copy; locale: Locale }) {
  return (
    <section className="px-4 pb-16 sm:px-6 lg:pb-24">
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[calc(var(--card-radius)*1.5)] bg-primary px-6 py-16 text-center text-primary-foreground lg:py-20">
        <PatternBackground
          pattern="kbach"
          scale={1.1}
          opacity={0.07}
          className="text-primary-foreground"
        />

        <div className="relative mx-auto max-w-xl">
          <FlowerGarland className="mx-auto h-9 w-56 text-primary-foreground/70" />

          <h2 lang={locale} className="display mt-6 text-2xl text-balance sm:text-[2rem]">
            {c.closingTitle}
          </h2>
          <p lang={locale} className="mt-4 leading-relaxed text-primary-foreground/75">
            {c.closingBody}
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink
              href="/events/new"
              size="xl"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/85"
            >
              {c.ctaClosing}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href="/i/rithy-and-sreyneang"
              size="xl"
              variant="ghost"
              target="_blank"
              className="text-primary-foreground hover:bg-primary-foreground/12 hover:text-primary-foreground"
            >
              {c.demo}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
