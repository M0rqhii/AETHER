'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useExperience, type Quality } from '@/state/experience'
import { flags } from '@/lib/aethr/debugFlags'

const ORDER: Quality[] = ['low', 'medium', 'high']

/**
 * Spec §162: step only on *sustained* evidence, never on one bad frame.
 *
 * The bar is deliberately low and the streak long. Stepping down lowers the pixel
 * ratio, and on a HiDPI screen that is plainly visible — the material macro comes
 * up crisp and then, a few seconds in, softens. Since the step is permanent for
 * the session, it has to be reserved for a machine that genuinely cannot keep up,
 * not for the two-second dip a shader compile causes.
 */
const WINDOW_MS = 2000
const DROP_BELOW = 20
const DROP_STREAK = 5

/**
 * Adaptive quality.
 *
 * Steps **down only**, and only touches settings that are cheap to change —
 * pixel ratio and shadow resolution. It deliberately never steps back up and
 * never restructures the render pipeline.
 *
 * The reason is the failure it replaces: an earlier version also raised quality
 * again, which on a machine hovering near the threshold produced a loop —
 * measure slow, tear down the composer, measure fast, build it back, stall,
 * repeat. Every rebuild recompiles shaders, so the page hitched at seemingly
 * random moments. Losing a little sharpness permanently is a far better trade
 * than a scroll that periodically freezes.
 */
export function useAdaptiveQuality() {
  const quality = useExperience((s) => s.quality)
  const setQuality = useExperience((s) => s.setQuality)

  const state = useRef({ frames: 0, since: 0, slow: 0 })
  const current = useRef(quality)
  current.current = quality

  useFrame(() => {
    if (!flags.fx) return
    const s = state.current
    const now = performance.now()
    if (s.since === 0) {
      s.since = now
      return
    }
    s.frames++
    if (now - s.since < WINDOW_MS) return

    const fps = (s.frames / (now - s.since)) * 1000
    s.frames = 0
    s.since = now

    if (fps >= DROP_BELOW) {
      s.slow = 0
      return
    }

    s.slow++
    const index = ORDER.indexOf(current.current)
    if (s.slow >= DROP_STREAK && index > 0) {
      s.slow = 0
      setQuality(ORDER[index - 1])
    }
  })
}
