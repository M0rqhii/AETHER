'use client'

/**
 * 3D → screen anchoring for callout connectors (spec §33, §170).
 *
 * Scene components publish an Object3D per callout id; the overlay publishes the
 * SVG/DOM nodes to drive. One projection pass per frame writes attributes directly
 * — no React state, no per-frame layout thrash beyond the single active card.
 */
import * as THREE from 'three'

export interface ConnectorRefs {
  dot: SVGCircleElement | null
  line: SVGPathElement | null
  card: HTMLElement | null
}

const anchors = new Map<string, THREE.Object3D>()
const connectors = new Map<string, ConnectorRefs>()

export function registerAnchor(id: string, object: THREE.Object3D | null) {
  if (object) anchors.set(id, object)
  else anchors.delete(id)
}

export function registerConnector(id: string, refs: ConnectorRefs | null) {
  if (refs) connectors.set(id, refs)
  else connectors.delete(id)
}

const _world = new THREE.Vector3()

/**
 * The active card's box, measured only when it can actually have changed.
 *
 * `getBoundingClientRect` forces the browser to flush layout. Calling it inside
 * the render loop makes every frame wait on a synchronous reflow, which shows up
 * as jitter exactly while a callout is on screen. The card is fixed-position and
 * only moves on resize or when a different callout becomes active, so one
 * measurement per change is enough.
 */
let cachedRect: { id: string; left: number; right: number; middle: number } | null = null

export function invalidateConnectorLayout() {
  cachedRect = null
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', invalidateConnectorLayout, { passive: true })
}

/**
 * Projects the active anchor and redraws its connector.
 * `activeId` is the only callout on screen at a time (spec §32).
 */
export function updateConnectors(
  activeId: string | null,
  camera: THREE.Camera,
  width: number,
  height: number,
) {
  for (const [id, refs] of connectors) {
    const on = id === activeId
    if (!on) {
      if (refs.line) refs.line.style.opacity = '0'
      if (refs.dot) refs.dot.style.opacity = '0'
      continue
    }

    const anchor = anchors.get(id)
    if (!anchor || !refs.card) continue

    anchor.getWorldPosition(_world)
    _world.project(camera)

    // Behind the camera, or far outside the frame: hide the line rather than
    // drawing something nonsensical across the screen.
    const offscreen = _world.z > 1 || Math.abs(_world.x) > 1.4 || Math.abs(_world.y) > 1.4
    const x = (_world.x * 0.5 + 0.5) * width
    const y = (-_world.y * 0.5 + 0.5) * height

    if (refs.dot) {
      refs.dot.setAttribute('cx', x.toFixed(1))
      refs.dot.setAttribute('cy', y.toFixed(1))
      refs.dot.style.opacity = offscreen ? '0' : '1'
    }

    if (refs.line) {
      if (!cachedRect || cachedRect.id !== id) {
        const r = refs.card.getBoundingClientRect()
        cachedRect = { id, left: r.left, right: r.right, middle: r.top + r.height / 2 }
      }
      // Attach to whichever vertical edge of the card faces the anchor.
      const attachX = x < (cachedRect.left + cachedRect.right) / 2 ? cachedRect.left : cachedRect.right
      const attachY = cachedRect.middle
      // A single elbow keeps the line technical rather than decorative.
      const midX = attachX + (x - attachX) * 0.42
      refs.line.setAttribute('d', `M ${x.toFixed(1)} ${y.toFixed(1)} L ${midX.toFixed(1)} ${y.toFixed(1)} L ${midX.toFixed(1)} ${attachY.toFixed(1)} L ${attachX.toFixed(1)} ${attachY.toFixed(1)}`)
      refs.line.style.opacity = offscreen ? '0' : '1'
    }
  }
}

export function clearAnchors() {
  anchors.clear()
  connectors.clear()
  cachedRect = null
}
