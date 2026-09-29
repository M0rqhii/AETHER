/**
 * The Smart Crown display.
 *
 * A CanvasTexture redrawn only when the rendered content actually changes
 * (spec §128) — never once per frame. Brightness is a separate, continuously
 * animatable value applied through emissive intensity, so the screen can fade
 * into the black glass without touching the texture.
 */
import * as THREE from 'three'
import { uiFonts } from './textures'

export type OledState = 'off' | 'idle' | 'ready' | 'cold' | 'hot' | 'charge'

export interface OledContent {
  main: string
  sub?: string
  /** 0–1, draws the thin charge arc. Only used by the charge state. */
  arc?: number
}

export const OLED_PRESETS: Record<OledState, OledContent> = {
  off: { main: '' },
  idle: { main: '--°' },
  ready: { main: '72°', sub: 'Ready' },
  cold: { main: '4°C', sub: 'Cold' },
  hot: { main: '96°C', sub: 'Hot' },
  charge: { main: '68%', arc: 0.68 },
}

const SIZE = 512

export interface OledDisplay {
  texture: THREE.CanvasTexture
  /** Redraws only when the content differs from what is already on the canvas. */
  set: (content: OledContent) => void
  dispose: () => void
}

export function createOledDisplay(): OledDisplay {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  // The panel disc is generated with planar UVs whose V runs opposite the canvas.
  texture.flipY = false

  let last = ''

  function draw(c: OledContent) {
    const { sans, mono } = uiFonts()
    const r = SIZE / 2

    // Near-black OLED substrate: when the screen is off it is indistinguishable
    // from the crown glass above it (spec §99).
    ctx.clearRect(0, 0, SIZE, SIZE)
    ctx.fillStyle = '#040506'
    ctx.beginPath()
    ctx.arc(r, r, r, 0, Math.PI * 2)
    ctx.fill()

    if (!c.main) {
      texture.needsUpdate = true
      return
    }

    ctx.save()
    ctx.translate(r, r)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const hasSub = Boolean(c.sub)
    ctx.fillStyle = '#f4f6f7'
    ctx.font = `500 ${Math.round(SIZE * 0.23)}px ${sans}`
    ctx.letterSpacing = `${Math.round(SIZE * -0.008)}px`
    ctx.fillText(c.main, 0, hasSub ? -SIZE * 0.035 : 0)

    if (c.sub) {
      ctx.fillStyle = 'rgba(244,246,247,0.65)'
      ctx.font = `500 ${Math.round(SIZE * 0.058)}px ${mono}`
      ctx.letterSpacing = `${Math.round(SIZE * 0.018)}px`
      ctx.fillText(c.sub.toUpperCase(), 0, SIZE * 0.13)
    }

    if (typeof c.arc === 'number') {
      const ar = r * 0.82
      ctx.lineWidth = SIZE * 0.012
      ctx.lineCap = 'round'
      ctx.strokeStyle = 'rgba(244,246,247,0.14)'
      ctx.beginPath()
      ctx.arc(0, 0, ar, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = 'rgba(244,246,247,0.82)'
      ctx.beginPath()
      ctx.arc(0, 0, ar, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * c.arc)
      ctx.stroke()
    }

    ctx.restore()
    texture.needsUpdate = true
  }

  draw({ main: '' })

  return {
    texture,
    set(content) {
      const key = `${content.main}|${content.sub ?? ''}|${content.arc ?? ''}`
      if (key === last) return
      last = key
      draw(content)
    },
    dispose: () => texture.dispose(),
  }
}
