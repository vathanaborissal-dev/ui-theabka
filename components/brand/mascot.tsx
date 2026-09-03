import { cn } from "@/lib/utils"

/**
 * Thiep, the mascot.
 *
 * Product UI only. The design team's rule, and the right one: a couple's
 * invitation is theirs, and a platform's cartoon standing in the corner of it
 * would be the product talking over the people using it. Nothing under `/i/`
 * or `/c/` should import this.
 *
 * Served from `public/brand` as `<img>` rather than inlined: the animated
 * files carry their own CSS keyframes and animate perfectly well in an image,
 * and keeping them as files means the design team can redraw one without a
 * code change.
 */

/** Stills. */
export type MascotPose =
  | "default"
  | "wave"
  | "happy"
  | "sleeping"
  | "qr"
  | "holding-card"
  | "reverse"
  | "avatar"

/** Loops. Each has a still that stands in when motion is unwelcome. */
export type MascotMotion =
  | "loading"
  | "loading-reverse"
  | "pushing"
  | "happy"
  | "thinking"
  | "waving"
  | "idle"

const POSE_FILE: Record<MascotPose, string> = {
  default: "thiep",
  wave: "thiep-wave",
  happy: "thiep-happy",
  sleeping: "thiep-sleeping",
  qr: "thiep-qr",
  "holding-card": "thiep-holding-card",
  reverse: "thiep-reverse",
  avatar: "thiep-avatar",
}

/**
 * What each loop falls back to when the reader has asked for less motion.
 *
 * A still, never a frozen loop — the README is explicit, and a paused
 * animation tends to land on a half-finished pose.
 */
const MOTION_STILL: Record<MascotMotion, MascotPose> = {
  loading: "default",
  "loading-reverse": "reverse",
  pushing: "holding-card",
  happy: "happy",
  thinking: "default",
  waving: "wave",
  idle: "sleeping",
}

/** Below this the mascot stops reading as a character; use the mark instead. */
const MIN_SIZE = 28

/**
 * The loading drawing was composed with a little more negative space and is
 * the one approved exception for compact controls. At 24px it still reads as
 * Thiep, while the other actions need the regular 28px floor.
 */
const MIN_MOTION_SIZE: Partial<Record<MascotMotion, number>> = {
  loading: 24,
  "loading-reverse": 24,
}

function Img({
  src,
  size,
  alt,
  className,
}: {
  src: string
  size: number
  alt: string
  className?: string
}) {
  /*
   * A plain <img>, deliberately. The animated files carry their own keyframes
   * and only keep running when the browser treats them as an image document;
   * next/image would rasterise them and the animation would stop.
   */
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      height={size}
      className={cn("select-none", className)}
      style={{ height: size, width: "auto" }}
      draggable={false}
    />
  )
}

/**
 * A still pose.
 *
 * `alt` defaults to empty: the mascot is nearly always decoration beside text
 * that already says what is happening, and a screen reader announcing "Thiep
 * waving" before every empty state is noise. Pass one where it genuinely
 * carries meaning.
 */
export function Mascot({
  pose = "default",
  size = 96,
  alt = "",
  className,
}: {
  pose?: MascotPose
  size?: number
  alt?: string
  className?: string
}) {
  return (
    <Img
      src={`/brand/mascot/${POSE_FILE[pose]}.svg`}
      size={Math.max(size, MIN_SIZE)}
      alt={alt}
      className={className}
    />
  )
}

/**
 * Motions the design team drew a second time for dark grounds.
 *
 * Only `loading` has one. The standard mascot is a parchment-filled body, so
 * on a dark surface it reads as a bright solid blob; the reverse cut is an
 * outline and sits far better. The others have no reverse and are used on
 * light surfaces, so they are left alone rather than approximated.
 */
const MOTION_ON_DARK: Partial<Record<MascotMotion, MascotMotion>> = {
  loading: "loading-reverse",
}

/** One motion plus the still that replaces it when motion is unwelcome. */
function MotionPair({
  motion,
  size,
  alt,
  className,
}: {
  motion: MascotMotion
  size: number
  alt: string
  className?: string
}) {
  return (
    <>
      <Img
        src={`/brand/mascot/animated/${motion}.svg`}
        size={size}
        alt={alt}
        className={cn(
          "mascot-motion motion-reduce:hidden",
          `mascot-motion--${motion}`,
          className
        )}
      />
      <Img
        src={`/brand/mascot/${POSE_FILE[MOTION_STILL[motion]]}.svg`}
        size={size}
        alt={alt}
        className={cn("hidden motion-reduce:block", className)}
      />
    </>
  )
}

/**
 * An animated pose.
 *
 * Both the reduced-motion swap and the dark-ground swap are done in CSS rather
 * than JavaScript so they are right on the very first paint — a hook would
 * render the wrong one once and then replace it, which is exactly the flash
 * those settings exist to prevent. The wrappers use `contents` so neither swap
 * introduces a box that could disturb the layout around it.
 */
export function MascotMotion({
  motion = "loading",
  size = 96,
  alt = "",
  className,
}: {
  motion?: MascotMotion
  size?: number
  alt?: string
  className?: string
}) {
  const guarded = Math.max(size, MIN_MOTION_SIZE[motion] ?? MIN_SIZE)
  const onDark = MOTION_ON_DARK[motion]

  if (!onDark) {
    return <MotionPair motion={motion} size={guarded} alt={alt} className={className} />
  }

  return (
    <>
      <span className="contents dark:hidden">
        <MotionPair motion={motion} size={guarded} alt={alt} className={className} />
      </span>
      <span className="hidden dark:contents">
        <MotionPair motion={onDark} size={guarded} alt={alt} className={className} />
      </span>
    </>
  )
}
