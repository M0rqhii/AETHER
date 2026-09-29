'use client'

import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { chapterIndexAt, PHASE, within } from '@/lib/aethr/chapters'
import { updateConnectors } from '@/lib/aethr/anchors'
import { useExperience } from '@/state/experience'
import { usePose } from './PoseProvider'

/**
 * Bridges the continuous scene to the discrete UI.
 *
 * Store writes happen only when a value actually changes, so scrolling never
 * triggers a React render unless the chapter, callout or cursor really moved
 * (spec §169). Also owns the one projection pass for callout connectors (§170).
 */
export function Director({ onReady }: { onReady?: () => void }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const { pose, progress } = usePose()

  /** Rendered-frame counter, so QA tooling can wait for real frames rather than a clock. */
  const stats = useMemo(() => ({ frames: 0 }), [])

  const setChapterIndex = useExperience((s) => s.setChapterIndex)
  const setActiveCallout = useExperience((s) => s.setActiveCallout)
  const setCursorLabel = useExperience((s) => s.setCursorLabel)

  const scene = useThree((s) => s.scene)

  // Reaching this effect means every suspended resource in the scene resolved.
  useEffect(() => {
    onReady?.()
  }, [onReady])

  // Dev-only handle for visual QA tooling. Stripped from production builds.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    ;(window as unknown as { __aethrScene?: unknown }).__aethrScene = { scene, camera, pose, progress, stats }
  }, [scene, camera, pose, progress, stats])

  useFrame(() => {
    const p = progress.value
    stats.frames++

    setChapterIndex(chapterIndexAt(p))
    setActiveCallout(pose.activeCallout)

    const dragging = within(p, PHASE.grabIt) || within(p, PHASE.dropIntro)
    const throwing = within(p, PHASE.dropActive)
    setCursorLabel(throwing ? 'Throw' : dragging ? 'Drag' : null)

    updateConnectors(pose.activeCallout, camera, size.width, size.height)
  })

  return null
}
