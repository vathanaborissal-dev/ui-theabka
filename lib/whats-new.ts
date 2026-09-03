import { Camera, LayoutGrid, PanelsTopLeft, ReceiptText, Send, type LucideIcon } from "lucide-react"
import type { LocalizedText } from "@/lib/types"

export type WhatsNewRelease = {
  /** A unique sortable release id. It also resets the unread badge. */
  id: string
  date: LocalizedText
  items: ReadonlyArray<{
    icon: LucideIcon
    title: LocalizedText
    description: LocalizedText
  }>
}

/**
 * To publish an update, add one release at the top of this list. Keep both
 * languages beside each other so the announcement is ready for every user.
 * The first release is always treated as the latest and receives a fresh
 * unread state automatically.
 */
export const WHATS_NEW_RELEASES: readonly [WhatsNewRelease, ...WhatsNewRelease[]] = [
  {
    id: "2026-09-01-event-layouts",
    date: {
      en: "September 2026",
      km: "ខែកញ្ញា ២០២៦",
    },
    items: [
      {
        icon: LayoutGrid,
        title: {
          en: "Flexible event layouts",
          km: "ទម្រង់បង្ហាញកម្មវិធីច្រើនជម្រើស",
        },
        description: {
          en: "Switch between visual cards, a compact grid, and a detailed list on the Events page.",
          km: "ប្តូររវាងកាតរូបភាព ក្រឡាតូច និងបញ្ជីលម្អិតនៅទំព័រកម្មវិធី។",
        },
      },
    ],
  },
  {
    id: "2026-09-01-receipts",
    date: {
      en: "September 2026",
      km: "ខែកញ្ញា ២០២៦",
    },
    items: [
      {
        icon: ReceiptText,
        title: {
          en: "Receipt attachments",
          km: "ការភ្ជាប់បង្កាន់ដៃ",
        },
        description: {
          en: "Add a receipt or invoice photo to an expense and keep it with your payment record.",
          km: "បន្ថែមរូបភាពបង្កាន់ដៃ ឬវិក្កយបត្រទៅក្នុងចំណាយ ហើយរក្សាទុកជាមួយកំណត់ត្រាទូទាត់។",
        },
      },
    ],
  },
  {
    id: "2026-09-01",
    date: {
      en: "September 2026",
      km: "ខែកញ្ញា ២០២៦",
    },
    items: [
      {
        icon: Send,
        title: {
          en: "Telegram invitations",
          km: "ផ្ញើធៀបតាម Telegram",
        },
        description: {
          en: "Message selected guests, contact one guest, or share a Telegram group link.",
          km: "ផ្ញើសារទៅភ្ញៀវដែលបានជ្រើស ទាក់ទងភ្ញៀវម្នាក់ ឬចែករំលែកតំណក្រុម Telegram។",
        },
      },
      {
        icon: PanelsTopLeft,
        title: {
          en: "Smarter invitation preview",
          km: "ការមើលធៀបជាមុនកាន់តែឆ្លាត",
        },
        description: {
          en: "The invitation preview now follows the field you are editing.",
          km: "ការមើលធៀបជាមុនឥឡូវរំកិលតាមផ្នែកដែលអ្នកកំពុងកែ។",
        },
      },
      {
        icon: Camera,
        title: {
          en: "Faster camera setup",
          km: "រៀបចំកាមេរ៉ាបានលឿនជាងមុន",
        },
        description: {
          en: "Camera settings now load with clear skeleton previews.",
          km: "ការកំណត់កាមេរ៉ាឥឡូវបង្ហាញទម្រង់ផ្ទុកជាមុនយ៉ាងច្បាស់។",
        },
      },
    ],
  },
]

export const LATEST_WHATS_NEW_RELEASE = WHATS_NEW_RELEASES[0]
