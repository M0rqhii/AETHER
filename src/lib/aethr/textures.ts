/**
 * Procedural textures. Everything here is generated in the browser — the project
 * ships no image assets for the 3D scene, which keeps the payload at the GLBs and
 * lets the brushed finish be tuned numerically.
 */
import * as THREE from 'three'
import { clamp, mulberry32 } from './math'

/* --------------------------------------------------------------------------
   Seamless periodic value noise
   -------------------------------------------------------------------------- */

function periodicNoise2D(seed: number, periodX: number, periodY: number) {
  const rand = mulberry32(seed)
  const grid = new Float32Array(periodX * periodY)
  for (let i = 0; i < grid.length; i++) grid[i] = rand()

  const fade = (t: number) => t * t * (3 - 2 * t)

  return (u: number, v: number) => {
    const fx = u * periodX
    const fy = v * periodY
    const x0 = Math.floor(fx)
    const y0 = Math.floor(fy)
    const tx = fade(fx - x0)
    const ty = fade(fy - y0)
    const xa = ((x0 % periodX) + periodX) % periodX
    const xb = (xa + 1) % periodX
    const ya = ((y0 % periodY) + periodY) % periodY
    const yb = (ya + 1) % periodY
    const v00 = grid[ya * periodX + xa]
    const v10 = grid[ya * periodX + xb]
    const v01 = grid[yb * periodX + xa]
    const v11 = grid[yb * periodX + xb]
    const a = v00 + (v10 - v00) * tx
    const b = v01 + (v11 - v01) * tx
    return a + (b - a) * ty
  }
}

/**
 * Anisotropic brushed-metal height field.
 *
 * High frequency around the circumference, very low frequency along the axis —
 * which reads as fine vertical grooves once wrapped onto the body. Primes keep the
 * octaves from lining up into a visible repeat while staying exactly periodic, so
 * the texture is seamless around the cylinder.
 */
function brushedHeight() {
  const octaves = [
    { n: periodicNoise2D(11, 271, 3), a: 0.46 },
    { n: periodicNoise2D(29, 719, 7), a: 0.32 },
    { n: periodicNoise2D(47, 1487, 13), a: 0.22 },
  ]
  return (u: number, v: number) => {
    let sum = 0
    for (const o of octaves) sum += o.n(u, v) * o.a
    return sum
  }
}

/**
 * Resolution is set by the tightest shot in the film, not by a round number.
 *
 * The material macro puts the lens ~34 mm from the shell, where a screen pixel
 * covers roughly 15 µm of titanium. Wrapped once around the 239 mm circumference,
 * 4096 texels give a 58 µm texel — fine enough that the grain reads as grain
 * rather than as a soft smear. The axial direction carries almost no detail by
 * design (the noise periods along V are 3, 7 and 13), so it stays cheap.
 */
const BRUSH_W = 4096
const BRUSH_H = 192

export interface BrushedMaps {
  normalMap: THREE.DataTexture
  roughnessMap: THREE.DataTexture
  dispose: () => void
}

/**
 * Builds the brushed normal + roughness pair. Generated once and shared by every
 * titanium surface; the finish presets only change colour/roughness/anisotropy.
 */
export function createBrushedMaps(repeatY = 6): BrushedMaps {
  const height = brushedHeight()

  // Sample the height field once; both maps derive from it.
  const h = new Float32Array(BRUSH_W * BRUSH_H)
  for (let y = 0; y < BRUSH_H; y++) {
    for (let x = 0; x < BRUSH_W; x++) {
      h[y * BRUSH_W + x] = height(x / BRUSH_W, y / BRUSH_H)
    }
  }

  const at = (x: number, y: number) => h[(((y % BRUSH_H) + BRUSH_H) % BRUSH_H) * BRUSH_W + (((x % BRUSH_W) + BRUSH_W) % BRUSH_W)]

  const normalData = new Uint8Array(BRUSH_W * BRUSH_H * 4)
  const roughData = new Uint8Array(BRUSH_W * BRUSH_H * 4)

  // Grooves are shallow: enough to break the highlight, never enough to look hammered.
  const strength = 14
  for (let y = 0; y < BRUSH_H; y++) {
    for (let x = 0; x < BRUSH_W; x++) {
      const i = (y * BRUSH_W + x) * 4

      const dx = (at(x + 1, y) - at(x - 1, y)) * strength
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength * 0.25
      const len = Math.hypot(-dx, -dy, 1)
      normalData[i] = ((-dx / len) * 0.5 + 0.5) * 255
      normalData[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255
      normalData[i + 2] = (1 / len) * 0.5 * 255 + 127.5
      normalData[i + 3] = 255

      // Multiplied against the preset roughness, so centre on 1.0.
      const r = clamp(1 + (at(x, y) - 0.5) * 0.62, 0.6, 1.5) / 1.5
      const b = r * 255
      roughData[i] = b
      roughData[i + 1] = b
      roughData[i + 2] = b
      roughData[i + 3] = 255
    }
  }

  const make = (data: Uint8Array, srgb: boolean) => {
    const t = new THREE.DataTexture(data, BRUSH_W, BRUSH_H, THREE.RGBAFormat)
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(1, repeatY)
    t.minFilter = THREE.LinearMipmapLinearFilter
    t.magFilter = THREE.LinearFilter
    t.generateMipmaps = true
    // The grain is only ever seen at a glancing angle down a cylinder, which is
    // exactly the case isotropic filtering blurs away.
    t.anisotropy = 16
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
    t.needsUpdate = true
    return t
  }

  const normalMap = make(normalData, false)
  const roughnessMap = make(roughData, false)

  return {
    normalMap,
    roughnessMap,
    dispose: () => {
      normalMap.dispose()
      roughnessMap.dispose()
    },
  }
}

/* --------------------------------------------------------------------------
   Soft particle sprite — steam, heat, vacuum motes
   -------------------------------------------------------------------------- */

export function createSoftSprite(size = 64): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4)
  const c = (size - 1) / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - c, y - c) / c
      // Squared falloff keeps the core soft; no hard sprite edge.
      const a = Math.pow(clamp(1 - d), 2.4)
      const i = (y * size + x) * 4
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = a * 255
    }
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.magFilter = THREE.LinearFilter
  t.generateMipmaps = true
  t.needsUpdate = true
  return t
}

/* --------------------------------------------------------------------------
   Radial fade — keeps the studio floor from ever reaching a horizon
   -------------------------------------------------------------------------- */

/**
 * Alpha mask that is solid at the centre and gone by the rim.
 *
 * The camera sits close to table height for much of the experience, so a plain
 * disc is seen at grazing incidence, where Fresnel drives even a near-black
 * dielectric to mirror the environment — the floor turns into a bright horizon.
 * Fading it out well before its edge keeps the studio infinite and dark.
 */
export function createRadialFade(size = 256, solid = 0.12, edge = 0.46): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4)
  const c = (size - 1) / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - c, y - c) / c
      const t = clamp((d - solid) / (edge - solid))
      const a = Math.pow(1 - t * t * (3 - 2 * t), 1.6)
      const i = (y * size + x) * 4
      data[i] = data[i + 1] = data[i + 2] = a * 255
      data[i + 3] = a * 255
    }
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.magFilter = THREE.LinearFilter
  t.generateMipmaps = true
  t.needsUpdate = true
  return t
}

/* --------------------------------------------------------------------------
   Fonts for canvas-drawn textures
   -------------------------------------------------------------------------- */

let cachedFonts: { sans: string; mono: string } | null = null

/** Reads the hashed family names next/font injected, with sane fallbacks. */
export function uiFonts() {
  if (cachedFonts) return cachedFonts
  const fallbackSans = 'system-ui, sans-serif'
  const fallbackMono = 'ui-monospace, monospace'
  if (typeof window === 'undefined') return { sans: fallbackSans, mono: fallbackMono }
  const style = getComputedStyle(document.documentElement)
  const sans = style.getPropertyValue('--font-geist-sans').trim()
  const mono = style.getPropertyValue('--font-geist-mono').trim()
  cachedFonts = {
    sans: sans ? `${sans}, ${fallbackSans}` : fallbackSans,
    mono: mono ? `${mono}, ${fallbackMono}` : fallbackMono,
  }
  return cachedFonts
}

/* --------------------------------------------------------------------------
   Engraving — spec §81: etched, never printed
   -------------------------------------------------------------------------- */

export type EngravingMode = 'none' | 'vertical' | 'minimal' | 'monogram'

const ENGRAVE_SIZE = 512

export interface EngravingTexture {
  map: THREE.CanvasTexture
  normalMap: THREE.CanvasTexture
  draw: (text: string, mode: EngravingMode) => void
  dispose: () => void
}

export function createEngravingTexture(): EngravingTexture {
  const mask = document.createElement('canvas')
  mask.width = mask.height = ENGRAVE_SIZE
  const mctx = mask.getContext('2d')!

  const normal = document.createElement('canvas')
  normal.width = normal.height = ENGRAVE_SIZE
  const nctx = normal.getContext('2d')!

  const map = new THREE.CanvasTexture(mask)
  map.colorSpace = THREE.SRGBColorSpace
  const normalMap = new THREE.CanvasTexture(normal)

  function draw(text: string, mode: EngravingMode) {
    const { sans, mono } = uiFonts()
    const S = ENGRAVE_SIZE
    mctx.clearRect(0, 0, S, S)

    const clean = text.trim().slice(0, 16)
    if (mode !== 'none' && clean.length > 0) {
      mctx.save()
      mctx.translate(S / 2, S / 2)
      mctx.textAlign = 'center'
      mctx.textBaseline = 'middle'
      // Etched titanium reads as a slightly darker, duller mark — never white ink.
      mctx.fillStyle = 'rgba(26,28,30,0.94)'

      if (mode === 'vertical') {
        mctx.rotate(Math.PI / 2)
        mctx.font = `500 ${Math.round(S * 0.1)}px ${mono}`
        mctx.letterSpacing = `${Math.round(S * 0.03)}px`
        mctx.fillText(clean.toUpperCase(), 0, 0)
      } else if (mode === 'monogram') {
        mctx.font = `500 ${Math.round(S * 0.34)}px ${sans}`
        mctx.fillText(clean.slice(0, 2).toUpperCase(), 0, 0)
      } else {
        mctx.font = `500 ${Math.round(S * 0.13)}px ${sans}`
        mctx.letterSpacing = `${Math.round(S * 0.012)}px`
        mctx.fillText(clean, 0, 0)
      }
      mctx.restore()
    }

    // Derive a shallow indentation normal map from the mask's alpha.
    const src = mctx.getImageData(0, 0, S, S)
    const dst = nctx.createImageData(S, S)
    const alpha = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= S || y >= S) return 0
      return src.data[(y * S + x) * 4 + 3] / 255
    }
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const dx = (alpha(x + 1, y) - alpha(x - 1, y)) * 2.2
        const dy = (alpha(x, y + 1) - alpha(x, y - 1)) * 2.2
        const len = Math.hypot(dx, dy, 1)
        const i = (y * S + x) * 4
        dst.data[i] = (dx / len) * 0.5 * 255 + 127.5
        dst.data[i + 1] = (dy / len) * 0.5 * 255 + 127.5
        dst.data[i + 2] = (1 / len) * 0.5 * 255 + 127.5
        dst.data[i + 3] = 255
      }
    }
    nctx.putImageData(dst, 0, 0)

    map.needsUpdate = true
    normalMap.needsUpdate = true
  }

  draw('', 'none')

  return {
    map,
    normalMap,
    draw,
    dispose: () => {
      map.dispose()
      normalMap.dispose()
    },
  }
}
