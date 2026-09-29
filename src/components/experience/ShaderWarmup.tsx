'use client'

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useExperience } from '@/state/experience'

/**
 * Compiles every shader variant up front, behind the loading screen.
 *
 * Three compiles a material the first time it is actually drawn. In a
 * scroll-driven film that means the thermal cutaway, the dock and the dimmed
 * material clones used by callouts each compile the moment they first appear —
 * which lands as a hard hitch at the same points of the page, every time.
 *
 * `compile` walks the whole scene, not just what is visible, so one pass here
 * covers everything that will later fade in. It runs again after a quality step,
 * because turning the shadow map off changes the shader defines.
 */
export function ShaderWarmup() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const quality = useExperience((s) => s.quality)
  const pending = useRef(0)

  useEffect(() => {
    // One frame of delay so components that build materials in their own effects
    // (the emphasis clones, in particular) have already done so.
    const id = window.requestAnimationFrame(() => {
      const renderer = gl as typeof gl & {
        compileAsync?: (scene: unknown, camera: unknown) => Promise<unknown>
      }
      if (typeof renderer.compileAsync === 'function') {
        renderer.compileAsync(scene, camera)?.catch(() => {})
      } else {
        gl.compile(scene, camera)
      }
    })
    pending.current = id
    return () => window.cancelAnimationFrame(id)
  }, [gl, scene, camera, quality])

  return null
}
