/**
 * The last drop.
 *
 * It is the only thing on screen for the whole transition out of the studio and
 * onto the dock (spec §63, §64), so its path is defined once, here, as a pure
 * function of its own progress — the camera samples the same function to follow
 * it, which is the only way the two can stay in step.
 */
import { PHASE, local, clamp01 } from './chapters'
import { PRODUCT, DOCK } from './constants'
import { clamp, smoothstep, smootherstep } from './math'

/**
 * Bottle tilt at full pour. Must stay equal to the `-42°` in `computePose`'s
 * `out.tiltZ` — the drop leaves the lip, so it has to know where the lip is.
 */
export const POUR_TILT = (42 * Math.PI) / 180

/** Mouth lip radius, from Mouth_Lip in the canonical GLB. */
const LIP_RADIUS = 0.0306

/**
 * The drop is the hero of the cut, so it is larger than a real one — but only
 * just. It fills about a fifth of the frame at the tightest shot; any bigger and
 * it stops reading as water and starts reading as a sphere.
 */
export const DROP_RADIUS = 0.0045

const axisX = Math.sin(POUR_TILT)
const axisY = Math.cos(POUR_TILT)
const reach = PRODUCT.bodyTop - PRODUCT.center

/**
 * Where the drop separates: the lowest point of the tilted lip, not the centre of
 * the mouth. Taken from the tilt rather than from the live mouth transform, so the
 * launch point stays put while the bottle rights itself underneath it.
 */
const LAUNCH_X = axisX * reach + axisY * LIP_RADIUS

/**
 * Length of the pour hanging off the lip, from `LiquidStreams`.
 *
 * The drop is the *end* of that stream, not a second object leaving the bottle
 * alongside it — starting it at the lip put two separate things in the air at
 * once. It separates from the bottom of the falling water instead.
 */
const STREAM_DROP = 0.34

const LAUNCH_Y = PRODUCT.center + axisY * reach - axisX * LIP_RADIUS - STREAM_DROP

/** It comes to rest on the ceramic, not inside it. */
const LAND_Y = DOCK.topSurfaceZ + DROP_RADIUS * 1.15

/** Lip to puck: the tail of the pour plus the whole match cut. */
export const DROPLET_WINDOW: readonly [number, number] = [PHASE.timeDrop[0], PHASE.chargeMatchCut[1]]

/**
 * Where in the fall the bottle is switched off.
 *
 * The drop cannot start crossing back towards the axis before this — the dock and
 * the bottle stand in the same place, so any earlier and it would travel straight
 * through the shell, which is exactly what it used to do.
 */
export const BODY_GONE = local(PHASE.chargeMatchCut[0], DROPLET_WINDOW)

export interface DropletSample {
  x: number
  y: number
  z: number
  scale: number
  /** 0 = a sphere in flight, 1 = spread flat on the ceramic. */
  flatten: number
  opacity: number
}

export const createDropletSample = (): DropletSample => ({
  x: 0,
  y: 0,
  z: 0,
  scale: 1,
  flatten: 0,
  opacity: 1,
})

/** Position and appearance at `t ∈ [0,1]` of the fall. */
export function dropletAt(t: number, out: DropletSample): DropletSample {
  const k = clamp01(t)

  // Gravity: barely moving as it separates, fastest as it arrives.
  const land = smoothstep(clamp01((k - 0.93) / 0.07))
  out.y = LAUNCH_Y + (LAND_Y - LAUNCH_Y) * k * k - land * DROP_RADIUS * 0.85

  // Out past the overhang first, then in to the axis once the bottle has gone.
  const clear = LAUNCH_X + 0.028 * smoothstep(clamp01(k / 0.2))
  const converge = smootherstep(clamp01((k - BODY_GONE) / (0.94 - BODY_GONE)))
  out.x = clear * (1 - converge)
  out.z = 0

  // It spreads into the ceramic rather than simply switching off.
  out.scale = clamp(1 + smoothstep(k) * 0.28, 0.05, 2)
  out.flatten = land
  out.opacity = 1 - land * land

  return out
}

/** Global progress at a given point of the fall — used to place camera keys. */
export const dropletProgress = (t: number) =>
  DROPLET_WINDOW[0] + (DROPLET_WINDOW[1] - DROPLET_WINDOW[0]) * t
