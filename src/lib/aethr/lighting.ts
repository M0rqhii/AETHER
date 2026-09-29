/**
 * Named light states (spec §97) sampled along the same progress axis as the camera.
 *
 * The rig is a studio: a large soft key that produces the long reflection down the
 * cylinder, a cooler fill, a rim that lifts the product off the black background,
 * and one travelling reflection card. Colour temperature carries the narrative —
 * COLD and HOT are lighting states, not UI themes.
 */
import * as THREE from 'three'
import { PHASE, chapter } from './chapters'
import { easeInOutCubic, clamp } from './math'

export interface LightState {
  background: string
  /** Multiplier on the studio environment. */
  envIntensity: number
  ambient: number
  key: { pos: readonly [number, number, number]; intensity: number; color: string }
  fill: { pos: readonly [number, number, number]; intensity: number; color: string }
  rim: { pos: readonly [number, number, number]; intensity: number; color: string }
  /** The travelling reflection card — the thing that makes brushed metal readable. */
  sweep: { intensity: number; color: string }
  /** 0–1 presence of the studio floor and its contact shadow. */
  floor: number
}

const STATES = {
  /** Almost nothing: a rim and a single moving card find the silhouette.
      The opening shot is a *reveal*, so most of the body stays in shadow and the
      edge does the work. At an ambient of 0.04 with a soft key on top the product
      came up as an evenly lit grey cylinder — a catalogue photograph, not a first
      frame. Ambient and key are pulled down further and the rim pushed up, which
      carves the silhouette out of the black instead of describing it. */
  darkReveal: {
    background: '#040506',
    envIntensity: 0.2,
    ambient: 0.018,
    key: { pos: [0.55, 0.62, 0.5], intensity: 0.55, color: '#fdf8f2' },
    fill: { pos: [-0.6, 0.3, 0.34], intensity: 0.12, color: '#cdd9e2' },
    rim: { pos: [-0.35, 0.5, -0.75], intensity: 3.8, color: '#eef4f8' },
    sweep: { intensity: 5.8, color: '#ffffff' },
    floor: 0.28,
  },
  studio: {
    background: '#070809',
    envIntensity: 1.0,
    ambient: 0.1,
    key: { pos: [0.62, 0.7, 0.55], intensity: 2.0, color: '#fdf9f4' },
    fill: { pos: [-0.7, 0.32, 0.42], intensity: 0.8, color: '#cbd8e3' },
    rim: { pos: [-0.4, 0.58, -0.78], intensity: 1.7, color: '#e9eff3' },
    sweep: { intensity: 2.4, color: '#ffffff' },
    floor: 0.8,
  },
  /** Technical, even, readable — used for both exploded views. */
  technical: {
    background: '#08090b',
    envIntensity: 1.15,
    ambient: 0.16,
    key: { pos: [0.55, 0.8, 0.6], intensity: 3.2, color: '#fbf9f6' },
    fill: { pos: [-0.65, 0.42, 0.5], intensity: 1.35, color: '#d3dce4' },
    rim: { pos: [-0.3, 0.66, -0.7], intensity: 2.4, color: '#e6ecf1' },
    sweep: { intensity: 1.6, color: '#ffffff' },
    floor: 0.55,
  },
  cold: {
    background: '#060809',
    envIntensity: 0.95,
    ambient: 0.1,
    key: { pos: [0.6, 0.7, 0.55], intensity: 2.6, color: '#eef5fb' },
    fill: { pos: [-0.7, 0.34, 0.42], intensity: 1.15, color: '#7d9fb8' },
    rim: { pos: [-0.4, 0.56, -0.76], intensity: 2.4, color: '#a6c5d8' },
    sweep: { intensity: 2.6, color: '#dfeaf2' },
    floor: 0.9,
  },
  hot: {
    background: '#080706',
    envIntensity: 1.0,
    ambient: 0.11,
    key: { pos: [0.62, 0.66, 0.52], intensity: 3.0, color: '#f0b06d' },
    fill: { pos: [-0.68, 0.34, 0.44], intensity: 0.8, color: '#c4cdd6' },
    rim: { pos: [-0.38, 0.54, -0.76], intensity: 2.4, color: '#d98c53' },
    sweep: { intensity: 2.8, color: '#ffe4c4' },
    floor: 0.9,
  },
  /** Neutral enough to read the layers, warm enough to remember it holds heat. */
  thermal: {
    background: '#08090a',
    envIntensity: 1.1,
    ambient: 0.15,
    key: { pos: [0.5, 0.74, 0.62], intensity: 3.0, color: '#f8eee2' },
    fill: { pos: [-0.62, 0.4, 0.5], intensity: 1.25, color: '#c8d3dc' },
    rim: { pos: [-0.34, 0.6, -0.72], intensity: 2.6, color: '#e3d8cc' },
    sweep: { intensity: 1.8, color: '#ffffff' },
    floor: 0.5,
  },
  charging: {
    background: '#060708',
    envIntensity: 1.05,
    ambient: 0.1,
    key: { pos: [0.5, 0.55, 0.48], intensity: 2.7, color: '#e8f2f7' },
    fill: { pos: [-0.55, 0.26, 0.4], intensity: 1.0, color: '#dfe9ef' },
    rim: { pos: [-0.3, 0.34, -0.6], intensity: 2.2, color: '#eef5f9' },
    sweep: { intensity: 2.2, color: '#ffffff' },
    floor: 1.0,
  },
  /** Colour-accurate: the finishes have to be judged against each other.
      Key and sweep are pulled well below the other hero states because this is the
      one chapter that ends *inside* the highlight — at macro distance a hotter rig
      flattens a third of the frame to paper white and takes the grain with it
      (spec §191). */
  materials: {
    background: '#08090a',
    envIntensity: 1.25,
    ambient: 0.14,
    key: { pos: [0.6, 0.7, 0.58], intensity: 2.6, color: '#ffffff' },
    fill: { pos: [-0.68, 0.36, 0.46], intensity: 1.3, color: '#e4eaef' },
    rim: { pos: [-0.4, 0.58, -0.78], intensity: 2.2, color: '#f2f6f8' },
    sweep: { intensity: 2.2, color: '#ffffff' },
    floor: 1.0,
  },
  finale: {
    background: '#050607',
    envIntensity: 0.92,
    ambient: 0.07,
    key: { pos: [0.66, 0.74, 0.5], intensity: 3.1, color: '#fdfaf6' },
    fill: { pos: [-0.72, 0.3, 0.38], intensity: 0.7, color: '#c6d2dc' },
    rim: { pos: [-0.42, 0.6, -0.8], intensity: 2.7, color: '#eef3f6' },
    sweep: { intensity: 4.2, color: '#ffffff' },
    floor: 0.85,
  },
} satisfies Record<string, LightState>

export type LightStateId = keyof typeof STATES

const P = PHASE
const end = (id: Parameters<typeof chapter>[0]) => chapter(id).end

/** Where each state is fully reached. Interpolated in between. */
const LIGHT_KEYS: Array<{ at: number; state: LightStateId }> = [
  { at: 0, state: 'darkReveal' },
  { at: P.revealTitleAethr[0], state: 'darkReveal' },
  { at: end('reveal'), state: 'studio' },
  { at: end('inspection'), state: 'studio' },
  { at: P.crownIntro[1], state: 'studio' },
  { at: P.explodeIntro[1], state: 'technical' },
  { at: P.crownRescrew[0], state: 'technical' },
  { at: end('crownExploded'), state: 'studio' },
  { at: P.thermalWords[1], state: 'studio' },
  { at: P.coldFill[1], state: 'cold' },
  { at: end('cold'), state: 'cold' },
  { at: P.hotFill[1], state: 'hot' },
  { at: end('hot'), state: 'hot' },
  { at: P.thermalPeel[1], state: 'thermal' },
  { at: P.thermalWide[1], state: 'thermal' },
  { at: end('thermal'), state: 'studio' },
  { at: P.timeCompress[1], state: 'hot' },
  { at: P.timeOpen[1], state: 'hot' },
  { at: P.chargeMatchCut[1], state: 'charging' },
  { at: end('charge'), state: 'charging' },
  { at: P.materialsIntro[1], state: 'materials' },
  { at: end('personalization'), state: 'materials' },
  { at: P.dropIntro[1], state: 'studio' },
  { at: end('drop'), state: 'studio' },
  { at: P.finaleTitle[0], state: 'finale' },
  { at: 1, state: 'finale' },
]

export interface LightSample {
  background: THREE.Color
  envIntensity: number
  ambient: number
  keyPos: THREE.Vector3
  keyIntensity: number
  keyColor: THREE.Color
  fillPos: THREE.Vector3
  fillIntensity: number
  fillColor: THREE.Color
  rimPos: THREE.Vector3
  rimIntensity: number
  rimColor: THREE.Color
  sweepIntensity: number
  sweepColor: THREE.Color
  floor: number
}

export function createLightSample(): LightSample {
  return {
    background: new THREE.Color(),
    envIntensity: 1,
    ambient: 0.1,
    keyPos: new THREE.Vector3(),
    keyIntensity: 1,
    keyColor: new THREE.Color(),
    fillPos: new THREE.Vector3(),
    fillIntensity: 1,
    fillColor: new THREE.Color(),
    rimPos: new THREE.Vector3(),
    rimIntensity: 1,
    rimColor: new THREE.Color(),
    sweepIntensity: 1,
    sweepColor: new THREE.Color(),
    floor: 1,
  }
}

const _cA = new THREE.Color()
const _cB = new THREE.Color()

const lerpV = (out: THREE.Vector3, a: readonly [number, number, number], b: readonly [number, number, number], t: number) =>
  out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)

const lerpC = (out: THREE.Color, a: string, b: string, t: number) => out.copy(_cA.set(a)).lerp(_cB.set(b), t)

const mix = (a: number, b: number, t: number) => a + (b - a) * t

export function sampleLighting(p: number, out: LightSample): LightSample {
  let i = 1
  while (i < LIGHT_KEYS.length - 1 && p > LIGHT_KEYS[i].at) i++
  const k0 = LIGHT_KEYS[i - 1]
  const k1 = LIGHT_KEYS[i]
  const span = k1.at - k0.at
  // Matches the camera's easing, so a change of light and a change of framing that
  // share a boundary also share a shape.
  const t = easeInOutCubic(span <= 0 ? 1 : clamp((p - k0.at) / span))

  const a = STATES[k0.state]
  const b = STATES[k1.state]

  lerpC(out.background, a.background, b.background, t)
  out.envIntensity = mix(a.envIntensity, b.envIntensity, t)
  out.ambient = mix(a.ambient, b.ambient, t)

  lerpV(out.keyPos, a.key.pos, b.key.pos, t)
  out.keyIntensity = mix(a.key.intensity, b.key.intensity, t)
  lerpC(out.keyColor, a.key.color, b.key.color, t)

  lerpV(out.fillPos, a.fill.pos, b.fill.pos, t)
  out.fillIntensity = mix(a.fill.intensity, b.fill.intensity, t)
  lerpC(out.fillColor, a.fill.color, b.fill.color, t)

  lerpV(out.rimPos, a.rim.pos, b.rim.pos, t)
  out.rimIntensity = mix(a.rim.intensity, b.rim.intensity, t)
  lerpC(out.rimColor, a.rim.color, b.rim.color, t)

  out.sweepIntensity = mix(a.sweep.intensity, b.sweep.intensity, t)
  lerpC(out.sweepColor, a.sweep.color, b.sweep.color, t)
  out.floor = mix(a.floor, b.floor, t)

  return out
}

/**
 * Angle of the travelling reflection card. It sweeps during the moments the spec
 * calls out — reveal, inspection, material macro and finale — and rests elsewhere.
 */
export function sweepAngle(p: number): number {
  const arcs: Array<[number, number, number, number]> = [
    // [from, to, startAngle, endAngle]
    [0, chapter('reveal').end, -1.5, 0.75],
    [chapter('inspection').start, chapter('inspection').end, 0.75, 3.6],
    [chapter('materials').start, chapter('materials').end, -0.6, 1.9],
    [chapter('finale').start, 1, -1.2, 0.9],
  ]
  for (const [from, to, a0, a1] of arcs) {
    if (p >= from && p <= to) {
      return a0 + (a1 - a0) * clamp((p - from) / (to - from))
    }
  }
  // Between arcs, hold a pleasant three-quarter position.
  return 0.9
}

