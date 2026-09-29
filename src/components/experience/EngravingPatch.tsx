'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { PRODUCT } from '@/lib/aethr/constants'
import { chapter } from '@/lib/aethr/chapters'
import { damp } from '@/lib/aethr/math'
import { useResources } from './ResourceProvider'
import { usePose } from './PoseProvider'
import { useExperience } from '@/state/experience'

/**
 * The engraving.
 *
 * A cylindrical patch sharing the body's radius sits a tenth of a millimetre proud
 * of the shell, so the mark curves with the surface exactly. Spec §81 asks for an
 * etch, not print: a darker, duller, slightly indented area — never white ink.
 */
export function EngravingPatch() {
  const { engraving } = useResources()
  const { progress } = usePose()
  const text = useExperience((s) => s.config.engraving)
  const mode = useExperience((s) => s.config.engravingMode)

  const material = useRef<THREE.MeshPhysicalMaterial>(null)
  const group = useRef<THREE.Group>(null)
  const opacity = useRef(0)

  const geometry = useMemo(
    () =>
      new THREE.CylinderGeometry(
        PRODUCT.radius + 0.0001,
        PRODUCT.radius + 0.0001,
        0.086,
        64,
        1,
        true,
        // Centred on +Z, the face the default camera sees.
        -0.62,
        1.24,
      ),
    [],
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  // Debounced so a fast typist does not regenerate a 512² normal map per keystroke.
  useEffect(() => {
    const id = window.setTimeout(() => engraving.draw(text, mode), 140)
    return () => window.clearTimeout(id)
  }, [text, mode, engraving])

  useFrame((_, delta) => {
    const g = group.current
    const m = material.current
    if (!g || !m) return

    const engraved = mode !== 'none' && text.trim().length > 0
    // The mark exists from the moment it is entered and stays for the finale.
    const inScope = progress.value >= chapter('personalization').start - 0.02
    const target = engraved && inScope ? 1 : 0

    opacity.current = damp(opacity.current, target, 7, Math.min(0.05, delta))
    m.opacity = opacity.current
    g.visible = opacity.current > 0.01
  })

  return (
    <group ref={group} visible={false}>
      <mesh geometry={geometry} position={[0, PRODUCT.center - 0.008, 0]} renderOrder={2}>
        <meshPhysicalMaterial
          ref={material}
          map={engraving.map}
          normalMap={engraving.normalMap}
          normalScale={new THREE.Vector2(0.85, 0.85)}
          transparent
          opacity={0}
          depthWrite={false}
          metalness={0.82}
          roughness={0.62}
          envMapIntensity={0.45}
          polygonOffset
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  )
}
