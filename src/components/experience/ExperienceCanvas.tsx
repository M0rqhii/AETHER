'use client'

import { Component, Suspense, type ReactNode } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { useExperience } from '@/state/experience'
import { detectRenderer } from '@/lib/aethr/renderer'
import { Scene } from './Scene'

/** A failure inside R3F must never take the page with it (spec §167). */
class WebGLBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    // Surfaced for debugging; the user only ever sees the static fallback.
    console.error('[aethr] 3D experience failed', error)
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function ExperienceCanvas() {
  const quality = useExperience((s) => s.quality)
  const setFailed = useExperience((s) => s.setFailed)

  // Spec §103: clamp DPR rather than trusting whatever the device reports.
  // Software rasterisation is fill-rate bound above all else, so it is the one
  // case worth rendering below 1:1 and letting the browser scale up.
  const software = detectRenderer().software
  // A step down must cost sharpness, not legibility: 1.75 still resolves the
  // brushed grain in the material macro, where 1.5 visibly softened it.
  const dpr: [number, number] = software
    ? [0.6, 0.75]
    : quality === 'high'
      ? [1, 2]
      : quality === 'medium'
        ? [1, 1.75]
        : [1, 1.25]

  return (
    <div className="canvas-root" aria-hidden="true">
      <WebGLBoundary onError={() => setFailed(true)}>
        <Canvas
          dpr={dpr}
          shadows="soft"
          gl={{
            // The composer does its own multisampling; canvas AA would be wasted.
            antialias: false,
            alpha: false,
            stencil: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
          }}
          camera={{ fov: 30, near: 0.01, far: 100, position: [0.17, 0.245, 1.24] }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            // Well under 1. Brushed titanium under a studio rig clips to white on
            // the chamfers long before the shadows are in any danger, and a clipped
            // highlight is what makes a render read as CGI rather than product
            // photography (spec §191).
            gl.toneMappingExposure = 0.88
          }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </WebGLBoundary>
    </div>
  )
}
