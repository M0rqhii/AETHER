'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { ASSETS, PRODUCT, THERMAL_PEEL_OFFSETS } from '@/lib/aethr/constants'
import { THERMAL_N } from '@/lib/aethr/nodes'
import { prepareModel } from '@/lib/aethr/prepare'
import { registerAnchor } from '@/lib/aethr/anchors'
import { smootherstep } from '@/lib/aethr/math'
import { clamp01 } from '@/lib/aethr/chapters'
import { useResources } from './ResourceProvider'
import { usePose } from './PoseProvider'

/**
 * Peel windows.
 *
 * The outer wedge has to clear first — nothing inside is visible until it does —
 * with each layer following at a stagger. Final offsets come straight from
 * THERMAL_PEEL_CUTAWAY.glb, so the spread reproduces the approved reference.
 * Spec §51 lists the *narrative* order; the callouts follow it, the motion cannot.
 */
const PEEL_WINDOWS: Array<[string, number, number]> = [
  [THERMAL_N.wedge.outer, 0.0, 0.6],
  [THERMAL_N.wedge.vacuum, 0.1, 0.7],
  [THERMAL_N.wedge.reflective, 0.2, 0.8],
  [THERMAL_N.wedge.inner, 0.3, 0.9],
  [THERMAL_N.wedge.liquid, 0.4, 1.0],
]

/** Each wedge is fitted to the layer it was cut out of. */
const WEDGE_OF: Record<string, string> = {
  [THERMAL_N.wedge.outer]: THERMAL_N.main.outer,
  [THERMAL_N.wedge.vacuum]: THERMAL_N.main.vacuum,
  [THERMAL_N.wedge.reflective]: THERMAL_N.main.reflective,
  [THERMAL_N.wedge.inner]: THERMAL_N.main.inner,
}

/** Callout id → the layer meshes it highlights. */
const LAYER_MESHES: Record<string, string[]> = {
  inner: [THERMAL_N.wedge.inner, THERMAL_N.main.inner],
  lowe: [THERMAL_N.wedge.reflective, THERMAL_N.main.reflective],
  vacuum: [THERMAL_N.wedge.vacuum, THERMAL_N.main.vacuum],
  shell: [THERMAL_N.wedge.outer, THERMAL_N.main.outer],
}

/**
 * The vacuum is drawn by a hand-written shader, not a lit material, so there is
 * nothing for the emphasis system to dim — and cloning it would only strand the
 * clone's uniforms. Its presence is already entirely story-driven.
 */
const NO_EMPHASIS = new Set<string>([THERMAL_N.main.vacuum, THERMAL_N.wedge.vacuum])

/** Axial extent of a mesh's own geometry, in model space. */
function zSpan(mesh: THREE.Mesh | undefined): [number, number] | null {
  if (!mesh?.isMesh) return null
  mesh.geometry.computeBoundingBox()
  const bb = mesh.geometry.boundingBox
  return bb ? [bb.min.z, bb.max.z] : null
}

/**
 * How far up a layer still runs at its full diameter.
 *
 * The shell and the inner vessel both neck in below the mouth, and that step is
 * modelled in the layer itself. A wedge is a plain curved plate with no such step,
 * so it has to be fitted against the straight section alone — matched to the whole
 * extent it would stand proud of the neck instead of filling the notch.
 */
function fullDiameterTop(mesh: THREE.Mesh | undefined): number | null {
  if (!mesh?.isMesh) return null
  const pos = mesh.geometry.getAttribute('position') as THREE.BufferAttribute
  let rMax = 0
  for (let i = 0; i < pos.count; i++) rMax = Math.max(rMax, Math.hypot(pos.getX(i), pos.getY(i)))
  if (rMax <= 0) return null

  const wall = rMax * 0.995
  let top = -Infinity
  for (let i = 0; i < pos.count; i++) {
    if (Math.hypot(pos.getX(i), pos.getY(i)) < wall) continue
    top = Math.max(top, pos.getZ(i))
  }
  return Number.isFinite(top) ? top : null
}

export function ThermalCutaway() {
  const { scene } = useGLTF(ASSETS.thermal, ASSETS.draco)
  const { materials, emphasis } = useResources()
  const { pose } = usePose()

  const model = useMemo(() => prepareModel(scene, materials), [scene, materials])
  const root = useRef<THREE.Group>(null)
  const tilt = useRef<THREE.Group>(null)

  const rig = useMemo(() => {
    const mesh = (name: string) => model.nodes.get(name) as THREE.Mesh | undefined

    /* The wedges were exported shorter than the layers they came out of — the outer
       one stops 4 mm below the shoulder — so at rest the notch showed a slot of
       empty space just under the crown. Each is stretched onto the straight part of
       its own layer, which for the shell and the vessel stops where they neck in. */
    for (const [wedgeName, mainName] of Object.entries(WEDGE_OF)) {
      const w = mesh(wedgeName)
      const main = mesh(mainName)
      const wz = zSpan(w)
      const mz = zSpan(main)
      const top = fullDiameterTop(main)
      if (!w || !wz || !mz || top === null || wz[1] <= wz[0]) continue
      const s = (top - mz[0]) / (wz[1] - wz[0])
      w.scale.z = s
      w.position.z = mz[0] - wz[0] * s
    }

    const wedges = PEEL_WINDOWS.map(([name, a, b]) => {
      const obj = model.nodes.get(name)
      const restX = model.rest.get(name)?.position.x ?? 0
      return { obj, restX, offset: THERMAL_PEEL_OFFSETS[name] ?? 0, a, b }
    }).filter((w) => w.obj)

    const liquids = [THERMAL_N.main.liquid, THERMAL_N.wedge.liquid]
      .map((n) => ({ obj: mesh(n), restZ: model.rest.get(n)?.position.z ?? 0 }))
      .filter((l) => l.obj)

    // The vacuum shader fades along the layer's own axis; give it the real extent.
    const vz = zSpan(mesh(THERMAL_N.main.vacuum))
    if (vz) materials.vacuum.uniforms.uRange.value.set(vz[0], vz[1])

    return { wedges, liquids }
  }, [model, materials])

  /* Emphasis instances + connector anchors for the four thermal callouts */
  useEffect(() => {
    const created: THREE.Object3D[] = []

    for (const [id, names] of Object.entries(LAYER_MESHES)) {
      names.forEach((name, i) => {
        const mesh = model.nodes.get(name) as THREE.Mesh | undefined
        if (!mesh?.isMesh) return
        if (!NO_EMPHASIS.has(name)) emphasis.register(mesh)
        if (i === 0) {
          const anchor = new THREE.Object3D()
          mesh.geometry.computeBoundingBox()
          mesh.geometry.boundingBox?.getCenter(anchor.position)
          mesh.add(anchor)
          created.push(anchor)
          registerAnchor(id, anchor)
        }
      })
    }

    return () => {
      for (const a of created) a.removeFromParent()
      for (const id of Object.keys(LAYER_MESHES)) registerAnchor(id, null)
    }
  }, [model, emphasis])

  useFrame(() => {
    const g = root.current
    if (!g) return

    const on = pose.cutaway >= 0.5
    g.visible = on
    if (!on) return

    // The cutaway stands in for the body, so it has to be turned exactly as the
    // body is turned. Leaving it at zero yaw meant the swap spun the product a
    // dozen degrees on the spot — the "jump" that read as the base twisting.
    g.rotation.set(0, pose.yaw, 0)
    if (tilt.current) tilt.current.rotation.set(pose.tiltX, 0, pose.tiltZ)

    for (const w of rig.wedges) {
      const t = smootherstep(clamp01((pose.peel - w.a) / (w.b - w.a)))
      w.obj!.position.x = w.restX + t * w.offset
    }

    for (const l of rig.liquids) {
      const level = pose.liquidLevel
      l.obj!.visible = level > 0.004
      l.obj!.scale.z = Math.max(0.0001, level)
      l.obj!.position.z = l.restZ + 0.008 * (1 - level)
    }

    // Vacuum is empty space: it only shows while its own callout is on screen.
    materials.vacuum.uniforms.uOpacity.value = pose.vacuumOpacity
    materials.vacuum.visible = pose.vacuumOpacity > 0.01

    if (pose.activeCallout && LAYER_MESHES[pose.activeCallout]) {
      emphasis.setAll(0.55)
      for (const name of LAYER_MESHES[pose.activeCallout]) {
        const mesh = model.nodes.get(name) as THREE.Mesh | undefined
        if (mesh?.isMesh) emphasis.setTarget(mesh, 1)
      }
    }
  })

  return (
    <group ref={root} visible={false} name="aethr-thermal">
      <group ref={tilt} position={[0, PRODUCT.center, 0]}>
        <group position={[0, -PRODUCT.center, 0]}>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <primitive object={model.scene} />
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload(ASSETS.thermal, ASSETS.draco)
