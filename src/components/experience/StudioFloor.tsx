'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { createLightSample, sampleLighting } from '@/lib/aethr/lighting'
import { createRadialFade } from '@/lib/aethr/textures'
import { PRODUCT } from '@/lib/aethr/constants'
import { usePose } from './PoseProvider'

/**
 * The dark surface the product stands on, plus the pool of contact darkening
 * where it meets that surface.
 *
 * The floor fades to nothing well before its rim: at these camera heights it is
 * seen at grazing incidence, where Fresnel would otherwise turn even a black
 * dielectric into a bright mirrored horizon.
 *
 * The contact pool is a single textured quad rather than a rendered contact
 * shadow. drei's `ContactShadows` re-renders the whole scene into a depth target
 * every frame — measured here as a second pass of ~85k triangles, roughly
 * doubling the geometry cost of the page — to produce a soft pool under a
 * cylinder that a radial gradient reproduces exactly. The long cast shadow, which
 * is the one you actually read, still comes from the key light's shadow map.
 */
export function StudioFloor() {
  const { progress, pose } = usePose()
  const sample = useMemo(createLightSample, [])
  const fade = useMemo(() => createRadialFade(), [])
  const pool = useMemo(() => createRadialFade(128, 0.0, 0.5), [])

  const material = useRef<THREE.MeshStandardMaterial>(null)
  const poolMaterial = useRef<THREE.MeshBasicMaterial>(null)
  const poolMesh = useRef<THREE.Mesh>(null)

  useEffect(
    () => () => {
      fade.dispose()
      pool.dispose()
    },
    [fade, pool],
  )

  useFrame(() => {
    sampleLighting(progress.value, sample)

    const m = material.current
    if (m) m.opacity = sample.floor

    const pm = poolMaterial.current
    const mesh = poolMesh.current
    if (pm && mesh) {
      // The pool belongs to the base of the product, and softens as the product
      // tilts away from the surface or lifts off it.
      const upright = Math.cos(pose.tiltX) * Math.cos(pose.tiltZ)
      const lifted = 1 - Math.min(1, pose.hover / 0.05)
      pm.opacity = sample.floor * 0.55 * Math.max(0, upright) * (0.35 + 0.65 * lifted)
      mesh.visible = pm.opacity > 0.01

      /* Point it where the light actually is.
         The pool used to stretch along a fixed axis by the key light's X alone, so
         as the rig swung round the fake contact shadow stayed put while the real
         cast shadow moved — two shadows from two different suns. Spinning the quad
         to face directly away from the key, and lengthening it by the light's
         elevation, keeps the two on the same story.
         Local +Y maps to world -Z once the quad is laid flat, so the in-plane spin
         needed to aim it away from the key is atan2(keyX, keyZ). */
      const kx = sample.keyPos.x
      const kz = sample.keyPos.z
      const horiz = Math.hypot(kx, kz)
      mesh.rotation.set(-Math.PI / 2, 0, Math.atan2(kx, kz))

      // A low light throws a long shadow; a high one throws almost none.
      const stretch = 1 + Math.min(2.2, horiz / Math.max(0.2, sample.keyPos.y)) * 0.55
      mesh.scale.set(1, stretch, 1)

      // Shifted along that same direction so the pool trails the base.
      const away = horiz > 1e-4 ? (PRODUCT.radius * 1.1 * (stretch - 1)) / horiz : 0
      mesh.position.set(-kx * away, 0.0004, -kz * away)
    }
  })

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.0012, 0]} receiveShadow>
        <circleGeometry args={[1.8, 64]} />
        <meshStandardMaterial
          ref={material}
          color="#050607"
          alphaMap={fade}
          transparent
          opacity={1}
          depthWrite={false}
          roughness={0.98}
          metalness={0}
          // Zero, not merely low: even a rough dielectric mirrors the environment
          // at the grazing angles this camera works at, and that is what turned
          // the floor into a bright horizon in the first place.
          envMapIntensity={0}
        />
      </mesh>

      <mesh ref={poolMesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0004, 0]} renderOrder={1}>
        <planeGeometry args={[PRODUCT.radius * 5.2, PRODUCT.radius * 5.2]} />
        <meshBasicMaterial
          ref={poolMaterial}
          color="#000000"
          alphaMap={pool}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}
