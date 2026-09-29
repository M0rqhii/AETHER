'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { ASSETS, CROWN, DOCK } from '@/lib/aethr/constants'
import { DOCK_N } from '@/lib/aethr/nodes'
import { prepareModel } from '@/lib/aethr/prepare'
import { registerAnchor } from '@/lib/aethr/anchors'
import { damp } from '@/lib/aethr/math'
import { useResources } from './ResourceProvider'
import { usePose } from './PoseProvider'
import { InductionField } from './InductionField'

/** Shell parts that ghost away so the coil stack can be read (spec §70). */
const GHOSTABLE = [
  DOCK_N.housing,
  DOCK_N.topSurface,
  DOCK_N.topBezel,
  DOCK_N.bottomPlate,
  DOCK_N.antiSlipRing,
  DOCK_N.magneticRing,
]

export function AethrCharge() {
  const { scene } = useGLTF(ASSETS.dock, ASSETS.draco)
  const { materials } = useResources()
  const { pose } = usePose()

  const model = useMemo(() => prepareModel(scene, materials), [scene, materials])
  const root = useRef<THREE.Group>(null)
  const ghost = useRef(0)

  /** Own material instances so ghosting never touches the product's materials. */
  const ghostMats = useMemo(() => {
    const out: THREE.MeshStandardMaterial[] = []
    for (const name of GHOSTABLE) {
      const mesh = model.nodes.get(name) as THREE.Mesh | undefined
      if (!mesh?.isMesh) continue
      const clone = (mesh.material as THREE.MeshStandardMaterial).clone()
      clone.transparent = true
      mesh.material = clone
      out.push(clone)
    }
    return out
  }, [model])

  useEffect(() => () => ghostMats.forEach((m) => m.dispose()), [ghostMats])

  useEffect(() => {
    const coil = model.nodes.get(DOCK_N.coil) as THREE.Mesh | undefined
    if (!coil?.isMesh) return
    const anchor = new THREE.Object3D()
    coil.geometry.computeBoundingBox()
    coil.geometry.boundingBox?.getCenter(anchor.position)
    coil.add(anchor)
    registerAnchor('coil', anchor)
    return () => {
      registerAnchor('coil', null)
      anchor.removeFromParent()
    }
  }, [model])

  const statusRing = model.nodes.get(DOCK_N.statusRing) as THREE.Mesh | undefined

  useFrame((_, delta) => {
    const g = root.current
    if (!g) return

    g.visible = pose.dockVisible
    if (!pose.dockVisible) return

    // The puck emerges through its own reflections rather than a glow (spec §66).
    g.scale.setScalar(0.94 + 0.06 * pose.dockReveal)

    ghost.current = damp(ghost.current, pose.ghostDock, 8, Math.min(0.05, delta))
    const opacity = 1 - ghost.current * 0.8
    for (const m of ghostMats) {
      m.opacity = opacity
      m.depthWrite = opacity > 0.92
    }

    if (statusRing) {
      const m = statusRing.material as THREE.MeshBasicMaterial
      m.opacity = pose.statusRing
      statusRing.visible = pose.statusRing > 0.005
    }

    materials.statusRing.opacity = pose.statusRing
  })

  return (
    <group ref={root} visible={false} name="aethr-charge" position={[0, DOCK.worldY, 0]}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={model.scene} />
      </group>
      <InductionField from={DOCK.coilZ} to={DOCK.crownSeatZ + CROWN.coilZ} />
    </group>
  )
}

useGLTF.preload(ASSETS.dock, ASSETS.draco)
