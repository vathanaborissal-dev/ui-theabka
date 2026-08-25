/**
 * Khmer decorative elements, drawn from the "kbach" motif vocabulary used on
 * printed wedding cards. Kept geometric and light — the brief asks for
 * culturally appropriate, not stereotyped.
 */

export function KbachDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M0 12h62" opacity="0.5" />
      <path d="M138 12h62" opacity="0.5" />
      <path d="M100 3c4.2 5.4 4.2 12.6 0 18-4.2-5.4-4.2-12.6 0-18Z" />
      <path d="M100 12c5.4-4.2 12.6-4.2 18 0-5.4 4.2-12.6 4.2-18 0Z" />
      <path d="M100 12c-5.4-4.2-12.6-4.2-18 0 5.4 4.2 12.6 4.2 18 0Z" />
      <circle cx="126" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="74" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * Corner flourish for the Bopha frame: a double L-rule that overlaps the card
 * border, finished with a lotus tip pointing inwards.
 */
export function KbachCorner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
    >
      <path d="M1 40V9a8 8 0 0 1 8-8h31" />
      <path d="M9 40V15a6 6 0 0 1 6-6h25" opacity="0.4" />
      <path d="M40 1v8M1 40h8" opacity="0.4" />
      <g transform="translate(40 40)">
        <path d="M0-9c2.6 3.6 2.6 7.2 0 10.8C-2.6-1.8-2.6-5.4 0-9Z" fill="currentColor" stroke="none" opacity="0.85" />
        <path d="M0 1.8c3.6-2.6 7.2-2.6 10.8 0C7.2 4.4 3.6 4.4 0 1.8Z" fill="currentColor" stroke="none" opacity="0.55" />
        <path d="M0 1.8c-3.6-2.6-7.2-2.6-10.8 0C-7.2 4.4-3.6 4.4 0 1.8Z" fill="currentColor" stroke="none" opacity="0.55" />
      </g>
    </svg>
  )
}

/** A single lotus, used as a section marker. */
export function LotusMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16 4c3.3 4.6 3.3 9.1 0 13.7-3.3-4.6-3.3-9.1 0-13.7Z" opacity="0.9" />
      <path d="M16 17.7c4.6-3.3 9.1-3.3 13.7 0-4.6 3.3-9.1 3.3-13.7 0Z" opacity="0.6" />
      <path d="M16 17.7c-4.6-3.3-9.1-3.3-13.7 0 4.6 3.3 9.1 3.3 13.7 0Z" opacity="0.6" />
      <path d="M16 17.7c3.3 4.6 3.3 8.2 0 11.3-3.3-3.1-3.3-6.7 0-11.3Z" opacity="0.35" />
    </svg>
  )
}

