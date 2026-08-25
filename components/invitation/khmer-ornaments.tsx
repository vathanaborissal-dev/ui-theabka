"use client"

/* ---------------------------------------------------------------------------
 * Khmer decorative vocabulary.
 *
 * Drawn from motifs that actually appear on Cambodian temples and printed
 * wedding cards — kbach phka (ក្បាច់ផ្កា, flower patterns), the romduol
 * (រំដួល, the national flower), naga serpents, the lotus, and the temple
 * pediment. Everything is line art on `currentColor` so a template can tint an
 * ornament with any palette token, and every piece is decorative: none of it
 * carries meaning a screen reader needs.
 * ------------------------------------------------------------------------- */

/** The Angkor Wat profile: five prasat towers over the gallery terraces. */
export function AngkorSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 112" aria-hidden="true" className={className} fill="currentColor">
      {/* Outer towers */}
      <path d="M34 82c0-16 2-28 10-36 8 8 10 20 10 36Z" opacity="0.85" />
      <path d="M186 82c0-16 2-28 10-36 8 8 10 20 10 36Z" opacity="0.85" />
      {/* Flanking towers */}
      <path d="M67 82c0-20 2-38 13-52 11 14 13 32 13 52Z" opacity="0.92" />
      <path d="M147 82c0-20 2-38 13-52 11 14 13 32 13 52Z" opacity="0.92" />
      {/* Central prasat */}
      <path d="M103 82c0-24 3-48 17-74 14 26 17 50 17 74Z" />
      {/* Finials */}
      <circle cx="120" cy="6" r="2.4" />
      <circle cx="80" cy="28" r="1.8" opacity="0.92" />
      <circle cx="160" cy="28" r="1.8" opacity="0.92" />
      {/* Gallery roof, wall and terraces */}
      <path d="M18 82h204l-7 7H25Z" opacity="0.9" />
      <path d="M25 89h190v9H25Z" opacity="0.75" />
      <path d="M12 98h216l-5 7H17Z" opacity="0.9" />
      {/* Causeway */}
      <path d="M100 105h40v7h-40Z" opacity="0.6" />
    </svg>
  )
}

/**
 * Khmer temple pediment (ហោជាង) — the flame-tipped arch over a doorway.
 * Used to frame the couple's names the way a lintel frames a temple entrance.
 */
export function PedimentArch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 96"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M8 94C8 52 52 14 130 8c78 6 122 44 122 86" />
      <path d="M28 94C28 58 68 27 130 22c62 5 102 36 102 72" opacity="0.45" />
      {/* Flame finial at the apex, large enough to read at card size */}
      <path
        d="M130 10c-7-8-6-17 0-25 6 8 7 17 0 25Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M130 10c-3-4-3-8 0-12 3 4 3 8 0 12Z" fill="var(--inv-bg)" stroke="none" />
      {/* Four flame curls climbing each shoulder */}
      {[
        "M52 66c-12-3-18-13-14-23 9 4 15 12 14 23Z",
        "M96 30c-11-1-18-10-15-19 8 2 15 10 15 19Z",
        "M208 66c12-3 18-13 14-23-9 4-15 12-14 23Z",
        "M164 30c11-1 18-10 15-19-8 2-15 10-15 19Z",
      ].map((d, i) => (
        <path key={i} d={d} fill="currentColor" stroke="none" opacity="0.6" />
      ))}
    </svg>
  )
}

/** Romduol (រំដួល) — Cambodia's national flower: three outer, three inner petals. */
export function Romduol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className} fill="currentColor">
      <g transform="translate(20 20)">
        {[0, 120, 240].map((angle) => (
          <path
            key={`outer-${angle}`}
            transform={`rotate(${angle})`}
            d="M0 0C-7-4-9-11 0-17 9-11 7-4 0 0Z"
          />
        ))}
        {[60, 180, 300].map((angle) => (
          <path
            key={`inner-${angle}`}
            transform={`rotate(${angle})`}
            d="M0 0C-5-3-6-8 0-12 6-8 5-3 0 0Z"
            opacity="0.6"
          />
        ))}
        <circle r="2.2" opacity="0.9" />
      </g>
    </svg>
  )
}

/** A naga (នាគ) balustrade, repeating left to right as a border. */
export function NagaBorder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 32"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M4 20c14-14 28 14 42 0s28 14 42 0 28 14 42 0 28 14 42 0 28 14 42 0" />
      {/* Dorsal fins along the crests */}
      {[25, 67, 109, 151, 193].map((x) => (
        <path key={x} d={`M${x} 13l4-8 4 8Z`} fill="currentColor" stroke="none" opacity="0.7" />
      ))}
      {/* Scales */}
      {[46, 88, 130, 172, 214].map((x) => (
        <circle key={x} cx={x} cy="20" r="1.6" fill="currentColor" stroke="none" opacity="0.55" />
      ))}
    </svg>
  )
}

/** A frieze of lotus-bud arches, as carved along temple galleries. */
export function LotusFrieze({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 26"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M0 22h240" opacity="0.45" />
      {[0, 40, 80, 120, 160, 200].map((x) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <path d="M2 22C2 10 10 4 20 3c10 1 18 7 18 19" opacity="0.7" />
          <path d="M20 19c-3-4-3-8 0-12 3 4 3 8 0 12Z" fill="currentColor" stroke="none" />
        </g>
      ))}
    </svg>
  )
}

/** A garland of romduol blooms and leaves, for the floral templates. */
export function FlowerGarland({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 44"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      <path d="M4 22c32-16 56 16 88 0s56-16 88 0 24 16 56 0" opacity="0.5" />

      {/* Three fat petals read as a bloom at this size; five thin ones read as
          a star, which is what a smaller flower was doing here before. */}
      {[
        { x: 40, y: 14, r: -18, s: 1 },
        { x: 92, y: 27, r: 12, s: 0.82 },
        { x: 148, y: 14, r: -8, s: 0.95 },
        { x: 202, y: 26, r: 20, s: 0.8 },
      ].map((bloom) => (
        <g
          key={bloom.x}
          transform={`translate(${bloom.x} ${bloom.y}) rotate(${bloom.r}) scale(${bloom.s})`}
          fill="currentColor"
          stroke="none"
        >
          {[0, 120, 240].map((angle) => (
            <path key={angle} transform={`rotate(${angle})`} d="M0 0C-6-3-7-9 0-13 7-9 6-3 0 0Z" />
          ))}
          <circle r="1.9" opacity="0.55" />
        </g>
      ))}

      {/* Leaves tucked along the stem */}
      {[
        { x: 66, y: 24, r: 30 },
        { x: 120, y: 18, r: -30 },
        { x: 175, y: 24, r: 25 },
      ].map((leaf) => (
        <path
          key={leaf.x}
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r})`}
          d="M0 0C-7-2-10-8-8-13c5 1 9 6 8 13Z"
          fill="currentColor"
          stroke="none"
          opacity="0.42"
        />
      ))}
    </svg>
  )
}

/** Square corner piece built from an interlocking kbach curl. */
export function KbachCornerRich({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      <path d="M2 62V14a12 12 0 0 1 12-12h48" />
      <path d="M11 62V20a9 9 0 0 1 9-9h42" opacity="0.45" />
      <path d="M24 54c0-16 10-26 26-27" opacity="0.7" />
      <path d="M50 27c-9 1-14 6-14 13s5 11 11 10 9-6 8-12" />
      <path d="M55 39c5 0 9 4 9 9" opacity="0.6" />
      <path d="M62 2c-5 4-6 9-3 13" opacity="0.5" />
      <circle cx="47" cy="37" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}
