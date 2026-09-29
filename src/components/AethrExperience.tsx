'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { TOTAL_SCROLL } from '@/lib/aethr/chapters'
import { useEnvironment } from '@/hooks/useEnvironment'
import { useScrollDriver } from '@/hooks/useScrollDriver'
import { useExperience } from '@/state/experience'
import { detectRenderer, type RendererInfo } from '@/lib/aethr/renderer'
import { Overlay } from './ui/Overlay'
import { LoadingScreen } from './ui/LoadingScreen'
import { StaticFallback } from './ui/StaticFallback'

/**
 * The WebGL scene lives in its own chunk. R3F, postprocessing and Rapier (whose
 * inlined wasm alone is ~800 kB gzipped) plus the module-level `useGLTF.preload`
 * calls only load once the renderer check has picked the 3D path — visitors on the
 * static fallback never download them, and the loader paints before they arrive.
 * The loader's `useProgress` store stays in the main chunk, so it is already
 * listening when the chunk starts fetching the models.
 *
 * A chunk that fails to download is handled like a WebGL failure: the static
 * experience takes over instead of the page going blank.
 */
const ExperienceCanvas = dynamic(
  () =>
    import('./experience/ExperienceCanvas')
      .then((m) => m.ExperienceCanvas)
      .catch((error: unknown) => {
        console.error('[aethr] 3D experience failed to load', error)
        useExperience.getState().setFailed(true)
        return () => null
      }),
  { ssr: false },
)

export function AethrExperience() {
  useEnvironment()

  // State, not a ref: the driver must re-run the moment the spacer actually
  // enters the DOM, which happens a render after the renderer check resolves.
  const [spacer, setSpacer] = useState<HTMLDivElement | null>(null)
  useScrollDriver(spacer)

  const failed = useExperience((s) => s.failed)
  const force3d = useExperience((s) => s.force3d)
  const setForce3d = useExperience((s) => s.setForce3d)
  const [renderer, setRenderer] = useState<RendererInfo | null>(null)

  useEffect(() => {
    setRenderer(detectRenderer())
    if (new URLSearchParams(window.location.search).get('force3d') === '1') setForce3d(true)
  }, [setForce3d])

  // Wait one tick before committing to a fallback so the check runs client-side.
  if (renderer === null) return null

  /**
   * A browser rendering without the GPU takes this scene at a few frames a second
   * and pins a CPU core doing it. Running it anyway would be a worse experience
   * than the static page, which carries the whole product story — so that is what
   * loads, with the choice left to the visitor (spec §112).
   */
  if (!renderer.webgl || failed || (renderer.software && !force3d)) {
    return (
      <StaticFallback
        reason={!renderer.webgl ? 'webgl' : failed ? 'error' : 'software'}
        rendererName={renderer.renderer}
        onForce3d={renderer.software && renderer.webgl ? () => setForce3d(true) : undefined}
      />
    )
  }

  return (
    <>
      {/* The only tall element on the page. Everything else is fixed; this is
          what the scrollbar actually measures (spec §94). */}
      <div
        ref={setSpacer}
        className="scroll-spacer"
        style={{ height: `calc(${TOTAL_SCROLL}px + 100vh)` }}
        aria-hidden="true"
      />

      <ExperienceCanvas />
      <Overlay />
      <LoadingScreen />
    </>
  )
}
