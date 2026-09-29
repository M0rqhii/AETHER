'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { createLightSample, sampleLighting, sweepAngle } from '@/lib/aethr/lighting'
import { PRODUCT } from '@/lib/aethr/constants'
import { flags } from '@/lib/aethr/debugFlags'
import { usePose } from './PoseProvider'
import { useExperience } from '@/state/experience'

RectAreaLightUniformsLib.init()

/**
 * The reflection card, pushed out past the floor.
 *
 * Three's area-light integral returns black for any point behind the plane of the
 * card — a hard edge, not a falloff. At the old 460 mm the card's plane cut
 * straight across the visible floor, and the light it threw ended in a clean
 * straight line that read as a rendering seam. The floor's alpha reaches zero at
 * 830 mm, so a card beyond that puts the edge where there is no longer a floor to
 * draw it on. Distance and size are scaled together, which leaves the card the
 * same angular size from the product — the reflection down the body is unchanged.
 */
const SWEEP_RADIUS = 1.25
const SWEEP_SCALE = SWEEP_RADIUS / 0.46
const SWEEP_WIDTH = 0.11 * SWEEP_SCALE
const SWEEP_HEIGHT = 0.66 * SWEEP_SCALE

/**
 * Key, fill, rim, ambient and the travelling reflection card — all interpolated
 * from the named light states (spec §20, §97, §123). Only the key casts a shadow.
 */
export function LightingRig() {
  const scene = useThree((s) => s.scene)
  const quality = useExperience((s) => s.quality)
  const { progress } = usePose()

  const sample = useMemo(createLightSample, [])
  const key = useRef<THREE.DirectionalLight>(null)
  const fill = useRef<THREE.DirectionalLight>(null)
  const rim = useRef<THREE.DirectionalLight>(null)
  const ambient = useRef<THREE.AmbientLight>(null)
  const sweep = useRef<THREE.RectAreaLight>(null)

  // The frustum below is more than twice as wide as it was, so the map has to grow
  // with it or the shadow loses the edge that makes it read as contact.
  const shadowSize = quality === 'high' ? 2048 : quality === 'medium' ? 1024 : 512

  // The background colour belongs to the scene, not to a mesh.
  useEffect(() => {
    const previous = scene.background
    scene.background = new THREE.Color('#070809')
    return () => {
      scene.background = previous
    }
  }, [scene])

  useFrame(() => {
    sampleLighting(progress.value, sample)

    if (scene.background instanceof THREE.Color) scene.background.copy(sample.background)
    scene.environmentIntensity = sample.envIntensity

    if (ambient.current) ambient.current.intensity = sample.ambient

    if (key.current) {
      key.current.position.copy(sample.keyPos)
      key.current.intensity = sample.keyIntensity
      key.current.color.copy(sample.keyColor)
    }
    if (fill.current) {
      fill.current.position.copy(sample.fillPos)
      fill.current.intensity = sample.fillIntensity
      fill.current.color.copy(sample.fillColor)
    }
    if (rim.current) {
      rim.current.position.copy(sample.rimPos)
      rim.current.intensity = sample.rimIntensity
      rim.current.color.copy(sample.rimColor)
    }

    if (sweep.current) {
      // A tall card orbiting the product: this is what makes the anisotropic
      // finish readable as it travels across the body.
      const a = sweepAngle(progress.value)
      sweep.current.position.set(Math.sin(a) * SWEEP_RADIUS, PRODUCT.center + 0.06, Math.cos(a) * SWEEP_RADIUS)
      sweep.current.lookAt(0, PRODUCT.center, 0)
      sweep.current.intensity = sample.sweepIntensity
      sweep.current.color.copy(sample.sweepColor)
    }
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={0.1} />

      <directionalLight
        ref={key}
        castShadow={quality !== 'low' && flags.shadows}
        intensity={2.9}
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
        shadow-bias={-0.0006}
        shadow-normalBias={0.006}
        shadow-camera-near={0.05}
        shadow-camera-far={3}
        /* Wide enough for the whole cast, not just the product.
           At ±0.22 the shadow ran out of the map partway along the floor and ended
           in a straight vertical edge — a rectangle of darkness with a corner in
           it. Tilted or lifted poses put even more of the cast outside. */
        shadow-camera-left={-0.5}
        shadow-camera-right={0.5}
        shadow-camera-top={0.62}
        shadow-camera-bottom={-0.34}
        shadow-radius={4}
      />
      <directionalLight ref={fill} intensity={0.85} />
      <directionalLight ref={rim} intensity={3.1} />

      {/* Moving reflection card — no shadow, purely specular (spec §20 item 4). */}
      {flags.rectAreaLight && (
        <rectAreaLight ref={sweep} width={SWEEP_WIDTH} height={SWEEP_HEIGHT} intensity={3} />
      )}
    </>
  )
}
