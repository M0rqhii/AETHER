/**
 * The scroll spine.
 *
 * One master normalized progress `p ∈ [0,1]` drives the entire experience. Every
 * scene state is a *pure function* of `p`, which is what makes reverse scroll,
 * fling-scrolling and mid-page refresh all behave (spec §172, §173, §192).
 *
 * Chapter lengths follow spec §94; the resulting normalized boundaries land close
 * to the rhythm sketched in §95, which §95 explicitly allows to be tuned.
 */

export type ChapterId =
  | 'reveal'
  | 'inspection'
  | 'crown'
  | 'crownExploded'
  | 'cold'
  | 'hot'
  | 'thermal'
  | 'time'
  | 'charge'
  | 'materials'
  | 'personalization'
  | 'drop'
  | 'finale'

export interface Chapter {
  id: ChapterId
  /** Shown in the right-hand chapter indicator. */
  label: string
  /** Virtual scroll length in CSS pixels. */
  scroll: number
  /** Normalized global range. */
  start: number
  end: number
}

/**
 * Chapter lengths are *derived*, not felt out by hand.
 *
 * Each one is the sum of what its beats need, and a beat needs scroll for one of
 * three reasons:
 *
 *   1. the camera has ground to cover — priced at a fixed ~34 mm of camera travel
 *      per 100 px of scroll, so a long move buys proportionally more scroll than a
 *      short one and the camera holds one speed across the whole film;
 *   2. the reader has something to do — copy to read, a callout to take in, a
 *      configurator to use — priced at what the content needs, camera ignored;
 *   3. the scene has something to play — a stream running, the bottle tipping, the
 *      cutaway closing — priced so no visible transition undercuts one beat.
 *
 * Whichever is largest wins; they are not added.
 *
 * This is the thing that was wrong before: the shot list and this table were
 * authored independently, so nothing tied how far the camera flew to how much
 * scroll it was given. The spread ran from 1.5 to 99.6 mm per notch of the wheel
 * — a sixty-fold swing — and it read exactly like it sounds: the camera would
 * sit still for nine notches through a callout hold and then cross three bottle
 * heights in eight. Retuning by eye could not fix it, because the two tables
 * were never compared to each other.
 *
 * So: do not hand-edit these numbers to fix a pacing complaint. Change the shot
 * that is too long, or the copy that needs more room, and re-derive. Editing the
 * total here just re-breaks the coupling.
 */
const RAW: Array<[ChapterId, string, number]> = [
  ['reveal', 'Reveal', 1433],
  ['inspection', 'Inspection', 2296],
  ['crown', 'Smart Crown', 1763],
  // Five equal callouts plus a reassembly that lands the chapter.
  ['crownExploded', 'Crown Architecture', 4047],
  ['cold', 'Cold', 2469],
  // The drain is the busiest scene beat on the page — tilt over, stream out, level
  // down, tilt back — and priced on camera alone it had 354 px for all four.
  ['hot', 'Hot', 2183],
  ['thermal', 'Thermal Architecture', 4798],
  // Opening after 24 hours, the pour, and the drop that carries the cut all live
  // here; at 1900 they ran into each other.
  ['time', '24 Hours', 2901],
  ['charge', 'AETHR Charge', 3503],
  // Two ~790 mm flights (in from the puck, down to the macro) inside one short
  // chapter. Priced at the standard rate that is simply what it costs.
  ['materials', 'Materials', 2441],
  ['personalization', 'Personalization', 1824],
  ['drop', 'Drop Test', 1346],
  ['finale', 'Finale', 1250],
]

/**
 * Global pacing — the length of the film, in scroll.
 *
 * The lengths above are relative to one another; this is the single number that
 * decides how much scroll any one move is given. Raising it stretches every
 * animation on the page over proportionally more travel without touching a single
 * easing curve or phase boundary: normalized progress is unchanged, there is
 * simply more scrolling behind it, so nothing has to be re-timed and nothing can
 * fall out of step. It is also the only lever that makes a move *last* longer —
 * every scene state is a pure function of progress, so there is no clock to slow.
 *
 * Note that this is the *only* honest way to change the page's length. The per
 * chapter numbers above are derived from camera distance and reading time, so
 * trimming one of those to "make it shorter" either speeds the camera up in that
 * one chapter or takes copy off the screen before it has been read. Raising or
 * lowering PACE moves everything together and preserves both.
 *
 * 2.6 puts the page at ~82 000 px, a little over six screens per chapter.
 */
const PACE = 2.6

const SCROLL = RAW.map(([, , px]) => Math.round(px * PACE))

export const TOTAL_SCROLL = SCROLL.reduce((sum, px) => sum + px, 0)

export const CHAPTERS: Chapter[] = (() => {
  let cursor = 0
  return RAW.map(([id, label], i) => {
    const start = cursor / TOTAL_SCROLL
    cursor += SCROLL[i]
    return { id, label, scroll: SCROLL[i], start, end: cursor / TOTAL_SCROLL }
  })
})()

const BY_ID = new Map(CHAPTERS.map((c) => [c.id, c]))

export const chapter = (id: ChapterId): Chapter => {
  const c = BY_ID.get(id)
  if (!c) throw new Error(`Unknown chapter: ${id}`)
  return c
}

export type Range = readonly [number, number]

/** A sub-range of a chapter expressed in global normalized progress. */
export function sub(id: ChapterId, from: number, to: number): Range {
  const c = chapter(id)
  const span = c.end - c.start
  return [c.start + span * from, c.start + span * to]
}

/**
 * An interior slice of an existing range, addressed by fraction.
 *
 * Always use this instead of arithmetic on a range's endpoints: phases are only
 * a couple of hundredths of global progress wide, so subtracting something like
 * `0.15` silently inverts the range and pins the value at 1 forever.
 */
export function slice(range: Range, from: number, to: number): Range {
  const span = range[1] - range[0]
  return [range[0] + span * from, range[0] + span * to]
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** Local 0→1 progress inside a range, clamped at both ends. */
export function local(p: number, range: Range): number {
  const [a, b] = range
  return b === a ? (p >= b ? 1 : 0) : clamp01((p - a) / (b - a))
}

/** True while `p` sits inside the range (with an optional bleed on each side). */
export function within(p: number, range: Range, bleed = 0): boolean {
  return p >= range[0] - bleed && p <= range[1] + bleed
}

export function chapterAt(p: number): Chapter {
  for (let i = 0; i < CHAPTERS.length; i++) {
    if (p < CHAPTERS[i].end) return CHAPTERS[i]
  }
  return CHAPTERS[CHAPTERS.length - 1]
}

export function chapterIndexAt(p: number): number {
  for (let i = 0; i < CHAPTERS.length; i++) {
    if (p < CHAPTERS[i].end) return i
  }
  return CHAPTERS.length - 1
}

/* --------------------------------------------------------------------------
   Named phases. Every scene reads from here rather than hard-coding numbers,
   so the whole timeline can be re-timed from one file.
   -------------------------------------------------------------------------- */
/**
 * Phase boundaries, derived alongside the chapter lengths above.
 *
 * These fractions are an output, not a set of preferences. Each one lands where
 * it does because the beat before it was priced — a camera beat at the standard
 * ~34 mm per 100 px, a reader beat at what its copy or interaction needs. So a
 * phase being "short" here is not an oversight: it means the camera has little
 * ground to cover there and there is nothing on screen to read.
 *
 * What is still authored by hand, and must stay that way, are the *relationships*
 * — which beats overlap, which must not, and which must be equal. Those are
 * called out below and are the constraints a re-derivation has to respect.
 */
export const PHASE = {
  /* 01 — Reveal (spec §23, §24) */
  revealRim: sub('reveal', 0.0, 0.201),
  revealSweep: sub('reveal', 0.201, 0.443),
  revealTitleAethr: sub('reveal', 0.338, 0.548),
  /* The wordmark's second half overlaps the first: it reads as one line arriving,
     not two. It must not start before revealTitleAethr is legible. */
  revealTitleOne: sub('reveal', 0.49, 0.758),
  heroPush: sub('reveal', 0.739, 1.0),
  heroOled: sub('reveal', 0.799, 0.98),

  /* 02 — Inspection (spec §25) */
  inspectMaterial: sub('inspection', 0.0, 0.224),
  inspectMonogram: sub('inspection', 0.211, 0.54),
  inspectUnderside: sub('inspection', 0.505, 0.696),
  inspectRecover: sub('inspection', 0.686, 1.0),

  /* 03 — Smart Crown (spec §26–§29) */
  crownIntro: sub('crown', 0.0, 0.505),
  crownUnscrew: sub('crown', 0.463, 0.627),
  crownSense: sub('crown', 0.627, 0.749),
  crownInside: sub('crown', 0.749, 1.0),

  /* 04 — Crown architecture (spec §30–§40) */
  explodeIntro: sub('crownExploded', 0.0, 0.122),
  explode: sub('crownExploded', 0.046, 0.179),
  /* INVARIANT — the five callouts are exactly the same length. They are five
     instances of one idea, so any one of them getting less scroll than its
     neighbours reads as the page hurrying past that part. Deriving them from
     camera distance alone does not give this (the shots sit millimetres apart and
     the entry flight is longer than the steps between), so the derived spans are
     overridden with an equal split of the combined range. They also have to stay
     end-to-end: each places a camera key a third of the way into itself, so an
     overlap puts that key behind its predecessor's and the shot table stops being
     monotonic. */
  calloutOled: sub('crownExploded', 0.169, 0.301),
  calloutCore: sub('crownExploded', 0.301, 0.433),
  calloutPower: sub('crownExploded', 0.433, 0.565),
  calloutInductive: sub('crownExploded', 0.565, 0.697),
  calloutSense: sub('crownExploded', 0.697, 0.829),
  /* Reassembly and the screw-down are the beat the chapter lands on. */
  crownReassemble: sub('crownExploded', 0.829, 0.901),
  crownRescrew: sub('crownExploded', 0.888, 1.0),

  /* 05 — Cold (spec §41, §42) */
  thermalWords: sub('cold', 0.0, 0.374),
  coldOpen: sub('cold', 0.33, 0.502),
  coldFill: sub('cold', 0.481, 0.694),
  coldClose: sub('cold', 0.673, 0.83),
  coldHold: sub('cold', 0.813, 1.0),

  /* 06 — Hot (spec §45, §46)
     Opened once, at the top. The chapter used to drain a sealed bottle and only
     then unscrew it, which is not a thing that can happen. */
  hotOpen: sub('hot', 0.0, 0.146),
  hotDrain: sub('hot', 0.146, 0.354),
  hotFill: sub('hot', 0.368, 0.552),
  /* The crown coming down and threading home is the chapter's closing gesture. */
  hotSeal: sub('hot', 0.552, 0.711),
  hotSettle: sub('hot', 0.698, 1.0),

  /* 07 — Thermal architecture (spec §50–§60) */
  thermalIntro: sub('thermal', 0.0, 0.072),
  thermalCutIn: sub('thermal', 0.043, 0.121),
  thermalPeel: sub('thermal', 0.108, 0.205),
  thermalWater: sub('thermal', 0.193, 0.322),
  thermalInner: sub('thermal', 0.322, 0.439),
  thermalLowE: sub('thermal', 0.439, 0.556),
  thermalVacuum: sub('thermal', 0.556, 0.673),
  thermalShell: sub('thermal', 0.653, 0.791),
  thermalWide: sub('thermal', 0.791, 0.838),
  /**
   * The three-word summary starts only once the last callout card has had time to
   * clear. Overlapped, the headline arrived on top of a card that was still on
   * screen, and the two read as one collision.
   */
  thermalLayers: sub('thermal', 0.826, 0.986),
  /**
   * The wedges travel back in first and the cutaway only stands down once they
   * have arrived. Overlapped, the swap fired while the layers were still half a
   * centimetre apart, and the assembly appeared to snap together in one frame.
   */
  thermalClose: sub('thermal', 0.826, 0.959),
  thermalReassemble: sub('thermal', 0.959, 1.0),

  /* 08 — Time compression / open / pour (spec §61–§63) */
  timeCompress: sub('time', 0.0, 0.225),
  timeStillHot: sub('time', 0.214, 0.385),
  timeOpen: sub('time', 0.365, 0.703),
  timePour: sub('time', 0.667, 1.0),
  /**
   * The last drop separates from the tail of the stream and keeps falling well
   * into the next chapter. It starts late on purpose: appearing while the pour is
   * still in full flow, it read as a second, unrelated object.
   */
  timeDrop: sub('time', 0.897, 1.0),

  /* 09 — AETHR CHARGE (spec §64–§73)
     chargeMatchCut is pinned, not derived: the camera rides the falling drop and
     its keys come from the droplet's own physics, so this span has to keep the
     timing the drop already has. */
  chargeMatchCut: sub('charge', 0.0, 0.155),
  chargeReveal: sub('charge', 0.126, 0.287),
  /** The crown's descent onto the puck — the chapter's one piece of choreography. */
  chargeDock: sub('charge', 0.287, 0.362),
  chargeSeated: sub('charge', 0.355, 0.432),
  chargeCoils: sub('charge', 0.432, 0.593),
  chargeBattery: sub('charge', 0.569, 0.759),
  chargeUsbC: sub('charge', 0.759, 0.868),
  chargeConclusion: sub('charge', 0.846, 1.0),

  /* 10 — Materials (spec §74–§78) */
  materialsIntro: sub('materials', 0.0, 0.367),
  materialsSelect: sub('materials', 0.286, 0.635),
  materialsMacro: sub('materials', 0.624, 1.0),

  /* 11 — Personalization (spec §79–§82) */
  engravingIntro: sub('personalization', 0.0, 0.21),
  engraving: sub('personalization', 0.168, 0.736),
  grabIt: sub('personalization', 0.715, 1.0),

  /* 12 — Drop test (spec §83–§87) */
  dropIntro: sub('drop', 0.0, 0.357),
  dropActive: sub('drop', 0.302, 1.0),

  /* 13 — Finale (spec §88, §89) */
  finaleReturn: sub('finale', 0.0, 0.277),
  finaleTitle: sub('finale', 0.244, 0.585),
  finaleCta: sub('finale', 0.537, 1.0),
} as const

export type PhaseId = keyof typeof PHASE
