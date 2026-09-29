/**
 * Camera choreography.
 *
 * One ordered table of keys, sampled as a pure function of global progress
 * (spec §96 — no camera tweens scattered across components). Positions are
 * interpolated in spherical coordinates *around the look-at target*, so every
 * move reads as a deliberate orbit and the camera never cuts through the product
 * on its way from one side to the other.
 */
import * as THREE from 'three'
import { PHASE, chapter } from './chapters'
import { BODY_GONE, createDropletSample, dropletAt, dropletProgress } from './droplet'
import { clamp } from './math'

export interface CameraKey {
  /** Global normalized progress at which this framing is exactly reached. */
  at: number
  pos: readonly [number, number, number]
  target: readonly [number, number, number]
  fov?: number
  /** Minimum horizontal extent to keep in frame; widens the shot on narrow viewports. */
  fitWidth?: number
}

const P = PHASE
const end = (id: Parameters<typeof chapter>[0]) => chapter(id).end

/** A point inside a phase, as a fraction of it. */
const at = (r: readonly [number, number], f: number) => r[0] + (r[1] - r[0]) * f

/**
 * A framing that is reached early in a phase and then held.
 *
 * Callouts need the camera to settle and stay put while the card is readable
 * (spec §134). A single key at the end of the window would mean the camera is
 * still drifting the whole time the user is reading.
 */
function hold(
  range: readonly [number, number],
  settleAt: number,
  shot: Omit<CameraKey, 'at'>,
): CameraKey[] {
  return [
    { at: at(range, settleAt), ...shot },
    { at: range[1], ...shot },
  ]
}

/**
 * A framing that rides the falling drop.
 *
 * The offset is from the drop itself, sampled from the same function the drop
 * uses, so the two cannot drift apart. Tight enough that the bottle is already
 * outside the frame before it is switched off — which is what lets the vessel
 * disappear mid-fall without a visible pop.
 */
const _drop = createDropletSample()
function followDrop(
  t: number,
  offset: readonly [number, number, number],
  fov: number,
): CameraKey {
  const d = dropletAt(t, _drop)
  return {
    at: dropletProgress(t),
    pos: [d.x + offset[0], d.y + offset[1], d.z + offset[2]],
    target: [d.x, d.y, d.z],
    fov,
  }
}

/**
 * The full shot list. Y is height above the table, +Z is the face carrying the
 * AETHR monogram, so the default camera always sees the mark.
 */
export const CAMERA_KEYS: CameraKey[] = [
  /* 01 — Reveal: far, low and dark, then a slow push in (spec §23, §24) */
  /* The product has to *own* the first frame. At 1.24 m with a 30° lens it filled
     under half the height of a 16:9 window, leaving a small grey cylinder in a very
     large void — read as under-scaled rather than as restraint. Closer and longer
     puts it at the height of the frame, and the longer lens flattens the
     perspective, which is how product film shoots a hero. */
  { at: 0, pos: [0.115, 0.2, 0.78], target: [0, 0.152, 0], fov: 24 },
  { at: P.revealSweep[1], pos: [0.086, 0.19, 0.71], target: [0, 0.15, 0], fov: 25 },
  { at: P.revealTitleOne[1], pos: [0.03, 0.176, 0.66], target: [0, 0.148, 0], fov: 26 },
  { at: end('reveal'), pos: [0.0, 0.157, 0.795], target: [0, 0.146, 0], fov: 29 },

  /* 02 — Inspection: material, monogram macro, underside (spec §25) */
  { at: P.inspectMaterial[1], pos: [0.145, 0.172, 0.745], target: [0, 0.145, 0] },
  { at: P.inspectMonogram[1], pos: [0.028, 0.062, 0.243], target: [0, 0.034, 0.028], fov: 26 },
  { at: P.inspectUnderside[1], pos: [0.105, -0.152, 0.42], target: [0, 0.028, 0], fov: 30 },
  { at: end('inspection'), pos: [0.024, 0.163, 0.8], target: [0, 0.145, 0] },

  /* 03 — Smart Crown (spec §26–§29) */
  // High enough to read the black glass top, not so high it becomes a plan view.
  { at: P.crownIntro[1], pos: [0.066, 0.382, 0.179], target: [0, 0.272, 0], fov: 28 },
  { at: P.crownUnscrew[1], pos: [0.092, 0.362, 0.3], target: [0, 0.302, 0] },
  { at: P.crownSense[1], pos: [0.116, 0.268, 0.176], target: [0.01, 0.318, 0], fov: 26 },
  { at: P.crownInside[1], pos: [0.058, 0.348, 0.118], target: [0, 0.246, 0], fov: 34 },

  /* 04 — Crown architecture. Product sits left; cards live on the right (spec §184) */
  // The housing lifts clear, so the stack now runs from 319 mm to 462 mm.
  // Targets track each part's real height in that ladder.
  { at: P.explodeIntro[1], pos: [0.238, 0.483, 0.295], target: [0.035, 0.391, 0], fov: 30 },
  ...hold(P.calloutOled, 0.35, { pos: [0.172, 0.457, 0.2], target: [0.035, 0.395, 0], fov: 27 }),
  ...hold(P.calloutCore, 0.35, { pos: [0.172, 0.442, 0.2], target: [0.035, 0.38, 0], fov: 27 }),
  ...hold(P.calloutPower, 0.35, { pos: [0.172, 0.432, 0.2], target: [0.035, 0.37, 0], fov: 27 }),
  ...hold(P.calloutInductive, 0.35, { pos: [0.172, 0.422, 0.2], target: [0.035, 0.36, 0], fov: 26 }),
  ...hold(P.calloutSense, 0.35, { pos: [0.147, 0.372, 0.168], target: [0.032, 0.32, 0], fov: 24 }),
  { at: P.crownReassemble[1], pos: [0.232, 0.475, 0.319], target: [0.012, 0.375, 0], fov: 29 },
  { at: end('crownExploded'), pos: [0.06, 0.308, 0.252], target: [0, 0.272, 0], fov: 30 },

  /* 05 — Cold (spec §41, §42) */
  { at: P.thermalWords[1], pos: [0.0, 0.202, 0.96], target: [0, 0.145, 0] },
  { at: P.coldFill[1], pos: [0.098, 0.342, 0.362], target: [0, 0.222, 0], fov: 30 },
  { at: end('cold'), pos: [0.058, 0.19, 0.79], target: [0, 0.145, 0] },

  /* 06 — Hot (spec §45, §46) */
  { at: P.hotDrain[1], pos: [0.142, 0.2, 0.63], target: [0.02, 0.158, 0] },
  { at: P.hotFill[1], pos: [0.1, 0.334, 0.352], target: [0, 0.226, 0] },
  { at: P.hotSeal[1], pos: [0.05, 0.302, 0.3], target: [0, 0.256, 0] },
  { at: end('hot'), pos: [0.04, 0.182, 0.73], target: [0, 0.145, 0] },

  /* 07 — Thermal architecture (spec §50–§59).
     The wedges peel along +X, so the camera swings round to roughly 40° of
     azimuth: seen head-on the layers are edge-on slivers, and the whole point is
     that they read as nested curved shells. Distance fits the full 259 mm body. */
  { at: P.thermalIntro[1], pos: [0.22, 0.2, 0.56], target: [0, 0.14, 0] },
  { at: P.thermalPeel[1], pos: [0.468, 0.247, 0.498], target: [0.05, 0.132, 0], fitWidth: 0.3 },
  ...hold(P.thermalWater, 0.4, { pos: [0.4, 0.234, 0.452], target: [0.02, 0.13, 0], fitWidth: 0.26 }),
  ...hold(P.thermalInner, 0.4, { pos: [0.43, 0.239, 0.452], target: [0.05, 0.135, 0], fitWidth: 0.26 }),
  ...hold(P.thermalLowE, 0.4, { pos: [0.445, 0.239, 0.452], target: [0.065, 0.135, 0], fitWidth: 0.26 }),
  ...hold(P.thermalVacuum, 0.4, { pos: [0.46, 0.239, 0.452], target: [0.08, 0.135, 0], fitWidth: 0.26 }),
  ...hold(P.thermalShell, 0.4, { pos: [0.475, 0.239, 0.452], target: [0.095, 0.135, 0], fitWidth: 0.26 }),
  { at: P.thermalWide[1], pos: [0.544, 0.268, 0.588], target: [0.05, 0.132, 0], fitWidth: 0.34 },
  { at: end('thermal'), pos: [0.04, 0.184, 0.81], target: [0, 0.145, 0] },

  /* 08 — Time compression, open, pour (spec §61–§63) */
  { at: P.timeCompress[1], pos: [0.022, 0.204, 1.06], target: [0, 0.145, 0] },
  { at: P.timeStillHot[1], pos: [0.0, 0.196, 0.93], target: [0, 0.145, 0] },
  { at: P.timeOpen[1], pos: [0.082, 0.318, 0.242], target: [0, 0.274, 0], fov: 28 },
  { at: P.timeDrop[0], pos: [0.162, 0.198, 0.58], target: [0.03, 0.148, 0], fov: 30 },

  /* 08 → 09 — the match cut, carried by the drop alone (spec §63, §64).
     Three keys on the drop instead of one jump to the dock: the camera closes in
     while the drop is still beside the bottle, goes down with it through the
     moment the vessel is switched off, then eases back as it lands on the puck. */
  followDrop(BODY_GONE, [0.0345, 0.023, 0.108], 26),
  followDrop(0.72, [0.026, 0.032, 0.104], 27),
  { at: P.chargeMatchCut[1], pos: [0.0, 0.092, 0.128], target: [0, 0.006, 0], fov: 30 },
  { at: P.chargeReveal[1], pos: [0.098, 0.076, 0.172], target: [0, 0.008, 0] },
  { at: P.chargeDock[1], pos: [0.132, 0.086, 0.192], target: [0, 0.031, 0] },
  { at: P.chargeSeated[1], pos: [0.158, 0.023, 0.192], target: [0, 0.018, 0], fov: 28 },
  ...hold(P.chargeCoils, 0.4, { pos: [0.148, 0.056, 0.168], target: [0, 0.023, 0], fov: 27 }),
  ...hold(P.chargeBattery, 0.4, { pos: [0.128, 0.076, 0.152], target: [0, 0.036, 0], fov: 26 }),
  { at: P.chargeUsbC[1], pos: [0.046, 0.031, -0.118], target: [0, 0.006, -0.043], fov: 20 },
  { at: end('charge'), pos: [0.122, 0.092, 0.222], target: [0, 0.021, 0], fov: 30 },

  /* 10 — Materials (spec §74–§78) */
  { at: P.materialsIntro[1], pos: [0.022, 0.178, 0.87], target: [0, 0.152, 0], fov: 30 },
  { at: P.materialsSelect[1], pos: [0.048, 0.176, 0.85], target: [0, 0.152, 0] },
  /* A macro is a macro: 105 mm from the axis is 67 mm from the shell, which puts
     about 21 mm of titanium across the frame rather than the whole 76 mm body. The
     look-at is swung 10° off the axis so the silhouette lands at roughly four
     fifths of the width — the finish selector needs a strip of background to stand
     on, and behind the product it had none. */
  { at: end('materials'), pos: [0.0602, 0.16, 0.086], target: [0.02, 0.158, -0.011], fov: 18 },

  /* 11 — Personalization: product left, configurator right (spec §79) */
  // Far enough back that the mark reads in context, product left of the panel.
  { at: P.engraving[1], pos: [0.122, 0.192, 0.714], target: [0.055, 0.148, 0], fov: 30 },
  { at: end('personalization'), pos: [0.06, 0.172, 0.73], target: [0, 0.145, 0] },

  /* 12 — Drop test (spec §83) */
  { at: P.dropIntro[1], pos: [0.104, 0.242, 0.96], target: [0, 0.122, 0], fov: 32 },
  { at: end('drop'), pos: [0.184, 0.302, 1.06], target: [0, 0.1, 0], fov: 32 },

  /* 13 — Finale: back to the language of the opening (spec §88).
     The last two shots sit the product lower and smaller in frame, so the
     wordmark above and the price and CTA below both have clear air. */
  { at: P.finaleReturn[1], pos: [0.062, 0.192, 0.9], target: [0, 0.145, 0], fov: 30 },
  { at: P.finaleTitle[1], pos: [0.03, 0.226, 1.04], target: [0, 0.192, 0] },
  { at: 1, pos: [0.02, 0.24, 1.12], target: [0, 0.205, 0] },
]

// Guard against a mis-ordered table silently producing a broken timeline.
if (process.env.NODE_ENV !== 'production') {
  for (let i = 1; i < CAMERA_KEYS.length; i++) {
    if (CAMERA_KEYS[i].at < CAMERA_KEYS[i - 1].at) {
      throw new Error(`CAMERA_KEYS out of order at index ${i} (${CAMERA_KEYS[i].at})`)
    }
  }
}

export interface CameraSample {
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
  fitWidth: number
}

/* --------------------------------------------------------------------------
   Continuous interpolation across the whole shot list
   --------------------------------------------------------------------------

   Easing every segment independently is what made the camera hesitate. An
   ease-in-out takes the velocity to zero at *both* ends of a move, so a run of
   keys that was meant to read as one long travelling shot came out as a series of
   little lunges with a full stop at every waypoint — measured at nineteen points
   where the camera reversed direction outright, and a hundredfold spread between
   its slowest and fastest moments.

   The tracks are interpolated with a monotone cubic (PCHIP) instead. It is
   continuous in velocity, so the camera carries its speed through a waypoint and
   only comes to rest where the shot list actually asks it to — which the `hold`
   pairs already say, by repeating a framing. Being monotone, it also cannot
   overshoot: no dipping inside the product between two close framings, which a
   plain Catmull-Rom would do. */

interface Track {
  at: number[]
  v: number[]
  m: number[]
}

/** Tangents that never overshoot: flat where the data turns, smooth elsewhere. */
function buildTrack(at: number[], v: number[]): Track {
  const n = v.length
  const m = new Array<number>(n).fill(0)
  const d = new Array<number>(n - 1).fill(0)

  for (let i = 0; i < n - 1; i++) {
    const h = at[i + 1] - at[i]
    d[i] = h > 0 ? (v[i + 1] - v[i]) / h : 0
  }

  m[0] = d[0] ?? 0
  m[n - 1] = d[n - 2] ?? 0
  for (let i = 1; i < n - 1; i++) {
    // A sign change, or a flat run, is a genuine stop — a held framing.
    if (d[i - 1] * d[i] <= 0) {
      m[i] = 0
      continue
    }
    const h0 = at[i] - at[i - 1]
    const h1 = at[i + 1] - at[i]
    const w0 = 2 * h1 + h0
    const w1 = h1 + 2 * h0
    m[i] = (w0 + w1) / (w0 / d[i - 1] + w1 / d[i])
  }

  return { at, v, m }
}

function evalTrack(track: Track, i: number, s: number, h: number): number {
  const { v, m } = track
  const s2 = s * s
  const s3 = s2 * s
  const h00 = 2 * s3 - 3 * s2 + 1
  const h10 = s3 - 2 * s2 + s
  const h01 = -2 * s3 + 3 * s2
  const h11 = s3 - s2
  return h00 * v[i] + h10 * h * m[i] + h01 * v[i + 1] + h11 * h * m[i + 1]
}

/** Unwrapped so an orbit never takes the long way round, and stays continuous. */
function unwrap(angles: number[]): number[] {
  const out = [angles[0]]
  for (let i = 1; i < angles.length; i++) {
    let d = angles[i] - angles[i - 1]
    while (d > Math.PI) d -= Math.PI * 2
    while (d < -Math.PI) d += Math.PI * 2
    out.push(out[i - 1] + d)
  }
  return out
}

const TRACKS = (() => {
  const at = CAMERA_KEYS.map((k) => k.at)
  const tx: number[] = []
  const ty: number[] = []
  const tz: number[] = []
  const r: number[] = []
  const theta: number[] = []
  const phi: number[] = []
  const fov: number[] = []
  const fit: number[] = []

  let lastFov = 30
  for (const k of CAMERA_KEYS) {
    tx.push(k.target[0])
    ty.push(k.target[1])
    tz.push(k.target[2])

    const ox = k.pos[0] - k.target[0]
    const oy = k.pos[1] - k.target[1]
    const oz = k.pos[2] - k.target[2]
    const rad = Math.hypot(ox, oy, oz)
    r.push(rad)
    theta.push(Math.atan2(ox, oz))
    phi.push(rad === 0 ? Math.PI / 2 : Math.acos(clamp(oy / rad, -1, 1)))

    lastFov = k.fov ?? lastFov
    fov.push(lastFov)
    fit.push(k.fitWidth ?? 0)
  }

  return {
    at,
    tx: buildTrack(at, tx),
    ty: buildTrack(at, ty),
    tz: buildTrack(at, tz),
    r: buildTrack(at, r),
    theta: buildTrack(at, unwrap(theta)),
    phi: buildTrack(at, phi),
    fov: buildTrack(at, fov),
    fit: buildTrack(at, fit),
  }
})()

export function sampleCamera(p: number, out: CameraSample): CameraSample {
  const at = TRACKS.at
  let i = 0
  while (i < at.length - 2 && p > at[i + 1]) i++

  const h = at[i + 1] - at[i]
  const s = h <= 0 ? 1 : clamp((p - at[i]) / h)

  out.target.set(evalTrack(TRACKS.tx, i, s, h), evalTrack(TRACKS.ty, i, s, h), evalTrack(TRACKS.tz, i, s, h))

  const r = Math.max(0.001, evalTrack(TRACKS.r, i, s, h))
  const theta = evalTrack(TRACKS.theta, i, s, h)
  const phi = evalTrack(TRACKS.phi, i, s, h)
  const sinPhi = Math.sin(phi)

  out.position.set(
    out.target.x + r * sinPhi * Math.sin(theta),
    out.target.y + r * Math.cos(phi),
    out.target.z + r * sinPhi * Math.cos(theta),
  )

  out.fov = evalTrack(TRACKS.fov, i, s, h)
  out.fitWidth = Math.max(0, evalTrack(TRACKS.fit, i, s, h))

  return out
}

export function createCameraSample(): CameraSample {
  return { position: new THREE.Vector3(), target: new THREE.Vector3(), fov: 30, fitWidth: 0 }
}

/**
 * Pushes the camera back until `fitWidth` fits horizontally. Portrait phones and
 * the widest thermal shots are the cases that need it (spec §107, §110).
 */
const _dir = new THREE.Vector3()

export function applyFraming(sample: CameraSample, aspect: number, distanceScale: number) {
  const dir = _dir.copy(sample.position).sub(sample.target)
  let dist = dir.length() * distanceScale

  if (sample.fitWidth > 0) {
    const halfFov = (sample.fov * Math.PI) / 360
    const needed = sample.fitWidth / (2 * Math.tan(halfFov) * Math.max(aspect, 0.35))
    dist = Math.max(dist, needed)
  }

  sample.position.copy(dir.normalize().multiplyScalar(dist).add(sample.target))
}
