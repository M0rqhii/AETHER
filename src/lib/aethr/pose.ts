/**
 * The deterministic scene pose.
 *
 * `computePose(p)` is a pure function: same progress in, same pose out, with no
 * accumulated state anywhere. That single property is what makes reverse scroll,
 * fast flinging and mid-page refresh all correct by construction (spec §129, §132,
 * §173, §192) — nothing has to "play back" to reach the right pose.
 */
import { PHASE, TOTAL_SCROLL, chapter, local, slice, clamp01, type Range } from './chapters'
import { CROWN, DOCK, PRODUCT } from './constants'
import { easeInOutCubic, easeInOutQuad, easeOutCubic, lerp, smoothstep, smootherstep, clamp } from './math'
import { getThermalState, thermalProgressAt, formatTemp } from './thermal'
import type { OledContent } from './oled'

const TAU = Math.PI * 2
const DEG = Math.PI / 180
const P = PHASE

export interface Pose {
  /* Product root */
  yaw: number
  tiltX: number
  tiltZ: number
  /**
   * Metres of clearance added under the product.
   *
   * Every tilt pivots about the product's centre, so the corner that swings down
   * ends up below the table — the underside inspection in particular buried the
   * base in the floor. Lifting by exactly what the tilt costs keeps the lowest
   * point of the silhouette on the ground instead.
   */
  hover: number

  /* Crown */
  crownAttached: boolean
  crownLift: number
  crownSpin: number
  crownTiltX: number
  crownTiltY: number
  /**
   * 0 = directly over the mouth, 1 = unscrewed and set aside, leaning.
   *
   * A crown hovering on the bottle's own axis sits in the path of anything poured
   * in, and the fill chapters read as the water coming out of the underside of the
   * cap. Only the fills use this; the Smart Crown chapters present the crown on
   * the axis on purpose.
   */
  crownAside: number
  /** World transform for the crown holder while it is detached (docking). */
  crownFreeY: number
  crownFreeYaw: number

  /* Body */
  bodyVisible: boolean
  /** 0 = canonical body, 1 = thermal cutaway. Crossfaded, never hard-swapped. */
  cutaway: number
  peel: number
  vacuumOpacity: number

  /* Liquid */
  liquidLevel: number
  pourIn: number
  pourOut: number
  steam: number

  /* Crown exploded */
  explode: number
  activeCallout: string | null

  /* Dock */
  dockVisible: boolean
  dockReveal: number
  statusRing: number
  fieldViz: number
  ghostDock: number

  /* Display */
  oled: OledContent
  oledBrightness: number

  /* Effects */
  heatRays: number
  /** Full-screen black, used only where a cut is unavoidable (spec §181). */
  blackout: number
  /** Physics owns the product transform while this is true. */
  physics: boolean
}

export function createPose(): Pose {
  return {
    yaw: 0,
    tiltX: 0,
    tiltZ: 0,
    hover: 0,
    crownAttached: true,
    crownLift: 0,
    crownSpin: 0,
    crownTiltX: 0,
    crownTiltY: 0,
    crownAside: 0,
    crownFreeY: 0,
    crownFreeYaw: 0,
    bodyVisible: true,
    cutaway: 0,
    peel: 0,
    vacuumOpacity: 0,
    liquidLevel: 0,
    pourIn: 0,
    pourOut: 0,
    steam: 0,
    explode: 0,
    activeCallout: null,
    dockVisible: false,
    dockReveal: 0,
    statusRing: 0,
    fieldViz: 0,
    ghostDock: 0,
    oled: { main: '' },
    oledBrightness: 0,
    heatRays: 0,
    blackout: 0,
    physics: false,
  }
}

/* --------------------------------------------------------------------------
   Crown thread — spec §27: rotation and lift are linked to the thread pitch,
   there is a beat when the thread releases, then the crown lifts free.
   -------------------------------------------------------------------------- */

/** Thread travel before the crown is free (Internal_Thread spans 11 mm). */
const THREAD_LIFT = 0.011
const PAUSE_END = CROWN.threadRelease + 0.06

export function crownUnscrew(t: number): { lift: number; spin: number } {
  const threaded = clamp01(t / CROWN.threadRelease)
  const free = easeInOutQuad(clamp01((t - PAUSE_END) / (1 - PAUSE_END)))
  return {
    // Linear while threaded: a screw thread has constant pitch.
    lift: threaded * THREAD_LIFT + free * (CROWN.unscrewLift - THREAD_LIFT),
    spin: -threaded * CROWN.unscrewTurns * TAU,
  }
}

/* --------------------------------------------------------------------------
   Crown exploded — spec §31: overlapping windows, a diagram not an explosion.
   -------------------------------------------------------------------------- */

const EXPLODE_WINDOWS: Array<[string, number, number]> = [
  // The housing comes off first — everything else is hidden until it does.
  ['Crown_Shell', 0.0, 0.28],
  ['Crown_Glass', 0.12, 0.36],
  ['OLED_Panel', 0.2, 0.44],
  ['OLED_Edge', 0.2, 0.44],
  ['OLED_Glyphs_72', 0.2, 0.44],
  ['Display_Flex', 0.28, 0.52],
  ['Display_Flex_Traces', 0.28, 0.52],
  ['PCB_Main', 0.36, 0.6],
  ['PCB_ICs', 0.36, 0.6],
  ['PCB_Passives', 0.36, 0.6],
  ['PCB_Traces', 0.36, 0.6],
  ['LiPo_Pouch', 0.44, 0.68],
  ['LiPo_FoilFace', 0.44, 0.68],
  ['LiPo_EdgeSeal', 0.44, 0.68],
  ['LiPo_FoldedSeam', 0.44, 0.68],
  ['LiPo_NegativeTab', 0.44, 0.68],
  ['LiPo_PositiveTab', 0.44, 0.68],
  ['LiPo_TabInsulator', 0.44, 0.68],
  ['LiPo_TechMarking', 0.44, 0.68],
  ['Charging_Coil', 0.52, 0.76],
  ['Charging_Ferrite', 0.52, 0.76],
  ['Charge_Controller', 0.6, 0.84],
  ['Charge_Controller_IC', 0.6, 0.84],
  ['Internal_Thread', 0.66, 0.9],
  ['Seal', 0.72, 0.94],
  ['AETHR_Sense_Module', 0.78, 1.0],
]

/** Per-part 0→1 given the master exploded progress. */
export const EXPLODE_PART_PROGRESS = new Map<string, (m: number) => number>(
  EXPLODE_WINDOWS.map(([name, a, b]) => [name, (m: number) => smootherstep(clamp01((m - a) / (b - a)))]),
)

/* --------------------------------------------------------------------------
   Fill level
   -------------------------------------------------------------------------- */

const COLD_LEVEL = 0.6
const HOT_LEVEL = 0.68

function fillLevel(p: number): number {
  if (p < P.coldFill[0]) return 0
  if (p < P.coldFill[1]) return easeInOutQuad(local(p, P.coldFill)) * COLD_LEVEL
  if (p < P.hotDrain[0]) return COLD_LEVEL
  if (p < P.hotDrain[1]) return COLD_LEVEL * (1 - easeInOutQuad(local(p, P.hotDrain)))
  if (p < P.hotFill[0]) return 0
  if (p < P.hotFill[1]) return easeInOutQuad(local(p, P.hotFill)) * HOT_LEVEL
  if (p < P.timePour[0]) return HOT_LEVEL
  if (p < P.timePour[1]) return HOT_LEVEL * (1 - easeInOutCubic(local(p, P.timePour)))
  return 0
}

/* --------------------------------------------------------------------------
   OLED — spec §98
   -------------------------------------------------------------------------- */

/** A short pulse: up, hold, down. `rise`/`fall` are fractions of the window. */
function pulse(t: number, rise = 0.18, fall = 0.28): number {
  if (t <= 0 || t >= 1) return 0
  if (t < rise) return smoothstep(t / rise)
  if (t > 1 - fall) return 1 - smoothstep((t - (1 - fall)) / fall)
  return 1
}

/**
 * How much scroll one perceived beat is given, in CSS pixels.
 *
 * A beat is any change the reader reads as a single event: a stream switching on,
 * the display waking, the status ring answering the crown seating. All of them get
 * the same travel, wherever they sit and however long the surrounding phase is.
 *
 * Expressing rise and fall as a *fraction of the phase* — which is what this file
 * did throughout — is what made the page feel arrhythmic. The very same
 * `pulse(t, 0.1, 0.18)` is 105 px inside the hot fill and three times that inside
 * a longer phase, so identical-looking code produced events running at wildly
 * different speeds. Measured across every visible transition on the page, the
 * spread between the slowest and the fastest was 207:1, and the water switched on
 * in half a notch of the wheel while the layers beside it took three.
 *
 * 520 px of ramp is what lands a beat on the ~300 px of *visible* travel the page
 * had already settled into on its own — a smoothstep spends its ends imperceptibly
 * slowly, so only the middle ~57% of the ramp reads as movement. The number is
 * therefore the rhythm the film was already mostly keeping, not a new one imposed
 * on it, and it is a floor: beats authored slower than this keep their own pace.
 */
const BEAT_PX = 520

/**
 * A pulse whose rise and fall are measured in scroll, not in fractions of the
 * window it sits in. Use this instead of `pulse` for anything the reader sees
 * switch on or off; reach for the raw `pulse` only when the shape genuinely has
 * to scale with its phase.
 */
function pulsePx(p: number, range: Range, rise = 0.18, fall = 0.28, minPx = BEAT_PX): number {
  const spanPx = (range[1] - range[0]) * TOTAL_SCROLL
  if (spanPx <= 0) return 0
  // The authored fractions keep their meaning; they are only lifted where the
  // window is short enough that they would undercut a beat.
  const floor = minPx / spanPx
  let r = Math.max(rise, floor)
  let f = Math.max(fall, floor)
  const sum = r + f
  if (sum > 1) {
    r /= sum
    f /= sum
  }
  return pulse(local(p, range), r, f)
}

function oledAt(p: number): { content: OledContent; brightness: number } {
  // Charging percentage — held from the moment the crown seats.
  if (p >= P.chargeSeated[0]) {
    const t = local(p, [P.chargeSeated[0], chapter('charge').end])
    return { content: { main: '68%', arc: 0.68 }, brightness: p > chapter('charge').end ? 1 - local(p, [chapter('charge').end, chapter('materials').start + 0.004]) : smoothstep(t * 6) }
  }

  // After 24 hours: the display confirms what the overlay has been counting.
  if (p >= P.timeOpen[0] && p < P.timePour[1]) {
    const temp = getThermalState(thermalProgressAt(p)).temperature
    return { content: { main: formatTemp(temp), sub: 'Hot' }, brightness: pulsePx(p, [P.timeOpen[0], P.timePour[1]], 0.12, 0.4) }
  }

  // Hot seal → the whole thermal story runs with the display dark under glass.
  if (p >= P.hotSeal[0] && p < P.hotSettle[1]) {
    return { content: { main: '96°C', sub: 'Hot' }, brightness: pulsePx(p, [P.hotSeal[0], P.hotSettle[1]], 0.14, 0.34) }
  }

  if (p >= P.coldClose[0] && p < P.coldHold[1]) {
    return { content: { main: '4°C', sub: 'Cold' }, brightness: pulsePx(p, [P.coldClose[0], P.coldHold[1]], 0.16, 0.3) }
  }

  // Reassembled: a last idle reading, then the screen disappears into the glass.
  if (p >= P.crownRescrew[0]) {
    return { content: { main: '--°' }, brightness: pulsePx(p, [P.crownRescrew[0], chapter('crownExploded').end], 0.2, 0.45) }
  }

  // Callout 01 preview cycle — spec §35: 72° → 4° → 96° → --°
  if (p >= P.calloutOled[0] && p < P.calloutOled[1]) {
    const t = local(p, P.calloutOled)
    const steps: OledContent[] = [{ main: '72°' }, { main: '4°C' }, { main: '96°C' }, { main: '--°' }]
    const i = Math.min(steps.length - 1, Math.floor(t * steps.length))
    // Ramped both ways, not switched: entering this window used to slam the panel
    // to full brightness in one frame, and leaving it cut to black just as hard.
    return { content: steps[i], brightness: pulsePx(p, P.calloutOled) }
  }

  // Smart Crown intro: 72° / READY, then it fades (spec §26).
  if (p >= P.crownIntro[0] && p < P.crownUnscrew[0] + 0.002) {
    return { content: { main: '72°', sub: 'Ready' }, brightness: pulsePx(p, [P.crownIntro[0], P.crownUnscrew[0]], 0.18, 0.36) }
  }

  // Hero shot: a single idle flash (spec §24).
  if (p >= P.heroOled[0] && p < P.heroOled[1] + 0.004) {
    return { content: { main: '--°' }, brightness: pulsePx(p, [P.heroOled[0], P.heroOled[1] + 0.004], 0.22, 0.4) }
  }

  return { content: { main: '' }, brightness: 0 }
}

/**
 * The one cut in the whole film.
 *
 * Leaving the dock and returning to the studio is the single transition camera and
 * light cannot carry, so it passes through black (spec §181). Exported so the DOM
 * overlay can dim in lockstep with the scene.
 */
export function blackoutAt(p: number): number {
  return 1 - clamp(Math.abs(p - chapter('materials').start) / 0.007)
}

/* --------------------------------------------------------------------------
   The pose
   -------------------------------------------------------------------------- */

export function computePose(p: number, out: Pose): Pose {
  /* ---- Product rotation -------------------------------------------------- */
  // Reveal turns the product barely 12° — the light does the work (spec §23).
  const revealYaw = smootherstep(local(p, [0, chapter('reveal').end])) * 12 * DEG

  // Inspection: 190° to read the material, then round to 360° so the monogram
  // faces the camera again for its macro (spec §25 phase A/B).
  const inspectA = easeInOutQuad(local(p, P.inspectMaterial)) * 190 * DEG
  const inspectB = easeInOutCubic(local(p, [P.inspectMonogram[0], P.inspectMonogram[1]])) * (360 - 190) * DEG
  const inspectYaw = p < P.inspectMaterial[0] ? 0 : inspectA + inspectB

  // A slow drift while the finishes are compared keeps the highlight alive.
  const materialsYaw = easeInOutQuad(local(p, [chapter('materials').start, chapter('materials').end])) * 26 * DEG

  out.yaw = revealYaw + inspectYaw + materialsYaw

  // Underside inspection tips the top away so the base faces the camera (§25 C).
  const undersideIn = easeInOutCubic(local(p, P.inspectUnderside))
  const undersideOut = easeInOutCubic(local(p, P.inspectRecover))
  // Looking into the mouth tips the opening toward the camera (§29).
  const insideTilt = easeInOutCubic(local(p, P.crownInside)) * (1 - easeInOutCubic(local(p, [P.explodeIntro[0], P.explodeIntro[1]])))

  out.tiltX = -28 * DEG * (undersideIn - undersideOut) + 14 * DEG * insideTilt

  // Pours tip the bottle sideways so the stream stays clear of the lens.
  const drainTilt = Math.sin(Math.PI * local(p, P.hotDrain))
  const pourTilt =
    easeInOutCubic(local(p, slice(P.timePour, 0, 0.55))) * (1 - easeInOutQuad(local(p, slice(P.timePour, 0.82, 1))))
  out.tiltZ = -34 * DEG * drainTilt - 42 * DEG * pourTilt

  /* Clearance. Tilting about the centre swings the lower corner of the silhouette
     below the table; this is exactly how far it drops, so the product skims the
     floor instead of sinking into it. Physics owns the transform during the drop
     test, so it is excluded there. */
  const tilt = Math.max(Math.abs(out.tiltX), Math.abs(out.tiltZ))
  out.hover =
    tilt < 1e-4
      ? 0
      : PRODUCT.center * (1 - Math.cos(tilt)) + PRODUCT.radius * Math.sin(tilt) - PRODUCT.baseBottom

  /* ---- Crown ------------------------------------------------------------- */
  const openT = local(p, P.crownUnscrew)
  const rescrewT = local(p, P.crownRescrew)
  const reopenT = local(p, P.timeOpen)

  let unscrew = 0
  // Set aside only where the mouth has to be clear: the fills and the pour. The
  // Smart Crown chapters lift it straight up the axis on purpose.
  let aside = 0
  if (p >= P.crownUnscrew[0] && p < P.crownRescrew[0]) unscrew = openT
  else if (p >= P.crownRescrew[0] && p < chapter('crownExploded').end) unscrew = 1 - rescrewT
  else if (p >= P.coldOpen[0] && p < P.coldClose[1]) {
    // Cold fill: open, pour in, close.
    unscrew = Math.min(easeInOutQuad(local(p, P.coldOpen)), 1 - easeInOutQuad(local(p, P.coldClose)))
    aside = unscrew
  } else if (p >= P.hotOpen[0] && p < P.hotSeal[1]) {
    unscrew = Math.min(easeInOutQuad(local(p, P.hotOpen)), 1 - easeInOutQuad(local(p, P.hotSeal)))
    aside = unscrew
  } else if (p >= P.timeOpen[0] && p < chapter('materials').start) {
    // Opening after 24 hours. Bounded at the chapter break: the crown spends the
    // charging chapter on the dock and is back on the bottle for the studio
    // chapters, so without an upper bound it would stay unscrewed to the end.
    unscrew = easeInOutQuad(reopenT)
    aside = unscrew
  }

  const { lift, spin } = crownUnscrew(clamp01(unscrew))
  out.crownLift = lift
  out.crownSpin = spin
  /* Strictly after the lift. The crown has to be clear of the mouth *before* it
     starts travelling sideways — overlapped, its skirt swept through the neck on
     the way out. `crownUnscrew` finishes the free lift at 1, so the swing only
     begins in the last fifth of it. */
  out.crownAside = easeInOutCubic(clamp01((clamp01(aside) - 0.8) / 0.2))

  // Presentation tilt for the AETHR Sense macro, matching the reference pose.
  const senseT = local(p, P.crownSense)
  const senseHold = senseT * (1 - easeInOutQuad(local(p, slice(P.crownInside, 0, 0.5))))
  out.crownTiltX = 19 * DEG * easeInOutCubic(senseHold)
  out.crownTiltY = -3.4 * DEG * easeInOutCubic(senseHold)

  /* ---- Crown docking (spec §67, §150) ------------------------------------ */
  const dockingActive = p >= P.chargeMatchCut[1] && p < chapter('materials').start
  out.crownAttached = !dockingActive

  if (dockingActive) {
    const t = local(p, P.chargeDock)
    // Descent, then a tiny magnetic capture over the last few millimetres.
    const approach = 1 - easeInOutCubic(clamp01(t / 0.86))
    const capture = 1 - easeOutCubic(clamp01((t - 0.86) / 0.14))
    const height = approach * 0.09 + capture * 0.004
    out.crownFreeY = DOCK.crownSeatZ - CROWN.restZ + height
    // A 2.4° rotational correction as the magnets align it.
    out.crownFreeYaw = 2.4 * DEG * clamp01(1 - t / 0.94)
  }

  /* ---- Status ring: one restrained pulse on seating (spec §68) ------------ */
  out.statusRing = dockingActive
    ? pulsePx(p, [P.chargeDock[1] - 0.004, P.chargeSeated[1]], 0.1, 0.5) * 0.9 + (p > P.chargeSeated[0] ? 0.14 : 0)
    : 0

  /* ---- Body and thermal cutaway ------------------------------------------ */
  // Close the layers first, stand the cutaway down second. Overlapped, the swap
  // back to the canonical body happened while the wedges were still half out.
  out.cutaway = smoothstep(local(p, P.thermalCutIn)) * (1 - smoothstep(local(p, P.thermalReassemble)))
  out.peel = easeInOutCubic(local(p, P.thermalPeel)) * (1 - easeInOutCubic(local(p, P.thermalClose)))
  out.vacuumOpacity = pulsePx(p, [P.thermalVacuum[0] - 0.004, P.thermalShell[0] + 0.004], 0.2, 0.3) * 0.85
  out.heatRays = smoothstep(local(p, P.thermalWater)) * (1 - smoothstep(local(p, P.thermalShell)))

  // The bottle leaves the moment the match cut starts. Letting it linger while the
  // camera is already down at the dock made it look as though the whole bottle
  // landed on the puck and then vanished.
  out.bodyVisible = p < P.chargeMatchCut[0] || p >= chapter('materials').start

  /* ---- Liquid, steam, streams -------------------------------------------- */
  out.liquidLevel = fillLevel(p)
  out.pourIn = pulsePx(p, P.coldFill, 0.12, 0.2) + pulsePx(p, P.hotFill, 0.1, 0.18)
  // Long rises: water starts as a trickle and builds, rather than switching on.
  out.pourOut = pulsePx(p, P.hotDrain, 0.3, 0.28) + pulsePx(p, slice(P.timePour, 0, 0.72), 0.3, 0.34)
  // Steam only where it is earned: the hot fill, and the reopening after 24 h.
  out.steam = pulsePx(p, P.hotFill, 0.16, 0.3) * 0.9 + pulsePx(p, [P.timeOpen[0] + 0.004, P.timePour[0]], 0.24, 0.4) * 0.6

  /* ---- Crown exploded ---------------------------------------------------- */
  const explodeIn = easeInOutCubic(local(p, P.explode))
  const explodeOut = easeInOutCubic(local(p, P.crownReassemble))
  out.explode = clamp(explodeIn - explodeOut)

  out.activeCallout =
    p >= P.calloutOled[0] && p < P.calloutCore[0]
      ? 'oled'
      : p < P.calloutPower[0] && p >= P.calloutCore[0]
        ? 'core'
        : p < P.calloutInductive[0] && p >= P.calloutPower[0]
          ? 'power'
          : p < P.calloutSense[0] && p >= P.calloutInductive[0]
            ? 'inductive'
            : p < P.crownReassemble[0] && p >= P.calloutSense[0]
              ? 'sense'
              : p >= P.thermalInner[0] && p < P.thermalLowE[0]
                ? 'inner'
                : p >= P.thermalLowE[0] && p < P.thermalVacuum[0]
                  ? 'lowe'
                  : p >= P.thermalVacuum[0] && p < P.thermalShell[0]
                    ? 'vacuum'
                    : p >= P.thermalShell[0] && p < P.thermalWide[0]
                      ? 'shell'
                      : p >= P.chargeBattery[0] && p < P.chargeUsbC[0]
                        ? 'battery'
                        : p >= P.chargeCoils[0] && p < P.chargeBattery[0]
                          ? 'coil'
                          : null

  /* ---- Dock -------------------------------------------------------------- */
  out.dockVisible = p >= P.chargeMatchCut[0] && p < chapter('materials').start
  out.dockReveal = smoothstep(local(p, P.chargeMatchCut))
  // Only while the crown is actually on the puck. Otherwise the field curves hang
  // in mid-air bridging one coil to nothing — which is exactly what showed when
  // the drop test left the product elsewhere.
  out.fieldViz = dockingActive ? pulsePx(p, [P.chargeCoils[0], P.chargeUsbC[0]], 0.18, 0.28) : 0
  out.ghostDock = smoothstep(local(p, [P.chargeCoils[0], P.chargeCoils[0] + 0.006])) * (1 - smoothstep(local(p, [P.chargeUsbC[0] - 0.006, P.chargeUsbC[0]])))

  /* ---- Display ----------------------------------------------------------- */
  const oled = oledAt(p)
  out.oled = oled.content
  out.oledBrightness = clamp(oled.brightness)

  /* ---- Cuts -------------------------------------------------------------- */
  out.blackout = blackoutAt(p)

  out.physics = p >= P.dropActive[0] && p < chapter('finale').start

  return out
}

/** Lerp helper re-exported for scene code that mixes pose values. */
export { lerp }
