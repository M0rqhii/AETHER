'use client'

import { useEffect } from 'react'
import { BREAKPOINTS } from '@/lib/aethr/constants'
import { useExperience, restoreSoundPreference, type Quality } from '@/state/experience'
import { scrollTarget } from '@/lib/aethr/ticker'
import { detectRenderer } from '@/lib/aethr/renderer'

/** Conservative first guess; `useAdaptiveQuality` corrects it from measured frames. */
function initialQuality(isMobile: boolean): Quality {
  if (typeof navigator === 'undefined') return 'high'
  // A software rasteriser will never keep up with this scene. Open in the cheapest
  // mode straight away rather than spending the first seconds at 2 fps.
  if (detectRenderer().software) return 'low'
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  if (isMobile) return cores <= 4 || memory <= 4 ? 'low' : 'medium'
  return cores <= 4 || memory <= 4 ? 'medium' : 'high'
}

/** Detects viewport class, pointer type and motion preference, and keeps them live. */
export function useEnvironment() {
  const setEnvironment = useExperience((s) => s.setEnvironment)
  const setQuality = useExperience((s) => s.setQuality)

  useEffect(() => {
    const mqMobile = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`)
    const mqCoarse = window.matchMedia('(pointer: coarse)')
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const apply = () => {
      const isMobile = mqMobile.matches
      const reducedMotion = mqMotion.matches
      setEnvironment({ isMobile, isCoarsePointer: mqCoarse.matches, reducedMotion })
      // Reduced motion means the product should track scroll exactly, with no
      // extra glide of its own (spec §111).
      // Tight enough that the product tracks the scrollbar rather than trailing
      // it — the glide should read as weight, not as lag.
      scrollTarget.smoothing = reducedMotion ? 1e4 : isMobile ? 18 : 15
      setQuality(initialQuality(isMobile))
    }

    apply()
    mqMobile.addEventListener('change', apply)
    mqCoarse.addEventListener('change', apply)
    mqMotion.addEventListener('change', apply)
    restoreSoundPreference()

    return () => {
      mqMobile.removeEventListener('change', apply)
      mqCoarse.removeEventListener('change', apply)
      mqMotion.removeEventListener('change', apply)
    }
  }, [setEnvironment, setQuality])
}
