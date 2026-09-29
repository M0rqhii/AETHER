'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { ASSETS, CROWN, CROWN_EXPLODE_OFFSETS, PRODUCT } from '@/lib/aethr/constants'
import { CROWN_CALLOUT_TARGETS, HIDE_ON_LOAD, N } from '@/lib/aethr/nodes'
import { prepareModel } from '@/lib/aethr/prepare'
import { EXPLODE_PART_PROGRESS } from '@/lib/aethr/pose'
import { registerAnchor } from '@/lib/aethr/anchors'
import { OLED_PRESETS } from '@/lib/aethr/oled'
import { useResources } from './ResourceProvider'
import { usePose } from './PoseProvider'
import { useExperience } from '@/state/experience'
import { EngravingPatch } from './EngravingPatch'
import { physicsControl } from './physicsControl'
import { sceneRefs } from './sceneRefs'

/**
 * Body meshes replaced by the thermal cutaway during that chapter.
 *
 * The shoulder and the neck sleeve are on the list because the cutaway's own outer
 * layer models both — it runs full diameter to the shoulder and necks in to the
 * mouth exactly as the shell does. Leaving the canonical pair on gives two sets of
 * coincident surfaces right under the crown, which z-fight.
 */
const THERMAL_STACK = [
  N.body.outerShell,
  N.body.shoulder,
  N.body.neckSleeve,
  N.body.innerVessel,
  N.body.reflectiveLayer,
  N.body.reflectiveShoulder,
  N.body.vacuum,
  N.body.vacuumBottom,
  N.body.liquid,
] as const

/**
 * Meshes the emphasis system must not touch.
 *
 * Emphasis works by cloning a mesh's material so it can be dimmed on its own. For
 * the display that is both meaningless — you do not dim a screen to de-emphasise
 * it — and actively harmful: the clone is a dead copy that no longer receives the
 * canvas texture or the brightness the story drives.
 */
const NO_EMPHASIS = new Set<string>([N.crown.oledPanel, N.crown.oledEdge, N.crown.oledDemoGlyphs])

/** An empty child at the geometric centre of a mesh — a stable connector anchor. */
function createAnchor(mesh: THREE.Mesh): THREE.Object3D {
  const anchor = new THREE.Object3D()
  mesh.geometry.computeBoundingBox()
  mesh.geometry.boundingBox?.getCenter(anchor.position)
  mesh.add(anchor)
  return anchor
}

export function ProductModel() {
  const { scene } = useGLTF(ASSETS.product, ASSETS.draco)
  const { materials, oled, emphasis, finish } = useResources()
  const { pose } = usePose()
  const configFinish = useExperience((s) => s.config.finish)

  const model = useMemo(() => prepareModel(scene, materials, HIDE_ON_LOAD), [scene, materials])

  const productRoot = useRef<THREE.Group>(null)
  const productTilt = useRef<THREE.Group>(null)
  const productInner = useRef<THREE.Group>(null)
  const crownRoot = useRef<THREE.Group>(null)
  const crownTilt = useRef<THREE.Group>(null)

  const crownGroup = model.nodes.get(N.crownGroup) as THREE.Group | undefined

  /* ---- Cached node handles, resolved once -------------------------------- */
  const rig = useMemo(() => {
    const get = (name: string) => model.nodes.get(name)
    const explodable: Array<{ obj: THREE.Object3D; restZ: number; offset: number; step: (m: number) => number }> = []

    for (const [name, offset] of Object.entries(CROWN_EXPLODE_OFFSETS)) {
      const obj = get(name)
      const rest = model.rest.get(name)
      const step = EXPLODE_PART_PROGRESS.get(name)
      if (obj && rest && step) explodable.push({ obj, restZ: rest.position.z, offset, step })
    }

    return {
      explodable,
      liquid: get(N.body.liquid) as THREE.Mesh | undefined,
      liquidRestZ: model.rest.get(N.body.liquid)?.position.z ?? 0,
      thermalStack: THERMAL_STACK.map(get).filter(Boolean) as THREE.Object3D[],
      bodyGroup: get(N.bodyGroup),
      branding: get(N.branding),
      crownRestX: model.rest.get(N.crownGroup)?.position.x ?? 0,
      crownRestZ: model.rest.get(N.crownGroup)?.position.z ?? CROWN.restZ,
    }
  }, [model])

  /* ---- Emphasis + callout anchors ---------------------------------------- */
  useEffect(() => {
    const anchors: Array<[string, THREE.Object3D]> = []

    for (const [id, names] of Object.entries(CROWN_CALLOUT_TARGETS)) {
      for (const name of names) {
        const mesh = model.nodes.get(name) as THREE.Mesh | undefined
        if (!mesh?.isMesh) continue
        if (!NO_EMPHASIS.has(name)) emphasis.register(mesh)
        if (!anchors.find(([a]) => a === id)) {
          const anchor = createAnchor(mesh)
          anchors.push([id, anchor])
          registerAnchor(id, anchor)
        }
      }
    }

    // Everything else in the crown dims with the group, so the active part reads.
    for (const name of Object.keys(CROWN_EXPLODE_OFFSETS)) {
      if (NO_EMPHASIS.has(name)) continue
      const mesh = model.nodes.get(name) as THREE.Mesh | undefined
      if (mesh?.isMesh) emphasis.register(mesh)
    }

    // The charging chapter points at the same cell under a different label.
    const battery = anchors.find(([id]) => id === 'power')?.[1]
    if (battery) registerAnchor('battery', battery)

    // Streams and steam need to know where the opening currently is, and the
    // induction field needs the crown coil — both move under other components.
    const mouth = new THREE.Object3D()
    mouth.position.set(0, 0, PRODUCT.bodyTop)
    const bodyGroup = model.nodes.get(N.bodyGroup)
    bodyGroup?.add(mouth)
    sceneRefs.mouth = mouth
    sceneRefs.crownCoil = model.nodes.get(N.crown.coil) ?? null

    return () => {
      for (const [id, anchor] of anchors) {
        registerAnchor(id, null)
        anchor.removeFromParent()
      }
      registerAnchor('battery', null)
      mouth.removeFromParent()
      sceneRefs.mouth = null
      sceneRefs.crownCoil = null
    }
  }, [model, emphasis])

  /* ---- Finish selection --------------------------------------------------- */
  useEffect(() => {
    finish.set(configFinish)
  }, [configFinish, finish])

  /* ---- Per-frame pose ----------------------------------------------------- */
  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta)

    finish.update(dt)
    emphasis.update(dt)

    /* Product root — physics takes the wheel during the drop test */
    const root = productRoot.current
    const tilt = productTilt.current
    if (root && tilt) {
      if (physicsControl.active) {
        // The rigid body carries the orientation; leaving a scripted rotation here
        // as well would double-apply it.
        root.rotation.set(0, 0, 0)
        root.position.y = 0
        tilt.rotation.set(0, 0, 0)
      } else {
        root.rotation.set(0, pose.yaw, 0)
        root.position.y = pose.hover
        tilt.rotation.set(pose.tiltX, 0, pose.tiltZ)
      }
    }

    /* Crown holder: welded to the body until it flies to the dock */
    const cRoot = crownRoot.current
    const cTilt = crownTilt.current
    if (cRoot && cTilt && root && tilt) {
      if (pose.crownAttached) {
        cRoot.position.copy(root.position)
        cRoot.rotation.copy(root.rotation)
        cRoot.scale.copy(root.scale)
        cTilt.rotation.copy(tilt.rotation)
      } else {
        cRoot.position.set(0, pose.crownFreeY, 0)
        cRoot.rotation.set(0, pose.crownFreeYaw, 0)
        cTilt.rotation.set(0, 0, 0)
      }
    }

    /* Crown unscrew and presentation tilt (local to the crown).
       The model's local +Z is the bottle's axis, so the aside move is a plain
       translation in local X plus a lean about local Y — it reads as the cap being
       lifted off and rested beside the mouth rather than hovering over it. */
    if (crownGroup) {
      // Both the lift and the aside move are *relative to the bottle*. Once the
      // crown detaches to fly to the dock its holder places it in world space, so
      // they have to stop — left on, the offset carried straight over and parked
      // the crown in the corner of the docking shot.
      const aside = pose.crownAttached ? pose.crownAside : 0
      crownGroup.position.x = rig.crownRestX + aside * CROWN.asideOffset
      // Set aside, it also comes back down: a cap that both rises 76 mm and swings
      // 105 mm out ends up floating, rather than resting beside the mouth.
      crownGroup.position.z =
        rig.crownRestZ + (pose.crownAttached ? pose.crownLift * (1 - 0.55 * aside) : 0)
      crownGroup.rotation.set(pose.crownTiltX, pose.crownTiltY + aside * CROWN.asideTilt, pose.crownSpin)
    }

    /* Exploded view — every part derives its own offset from the master value */
    for (const part of rig.explodable) {
      part.obj.position.z = part.restZ + part.step(pose.explode) * part.offset
    }


    /* Liquid: grows from the bottom of the vessel */
    if (rig.liquid) {
      const level = pose.liquidLevel
      rig.liquid.visible = level > 0.004
      rig.liquid.scale.z = Math.max(0.0001, level)
      // Compensate so the surface rises while the base stays put.
      rig.liquid.position.z = rig.liquidRestZ + 0.006 * (1 - level)
    }

    /* Thermal cutaway takes over the body stack */
    // The cutaway carries its own inner stack, so the canonical one steps aside.
    // The vacuum helpers stay hidden throughout — the cutaway owns that story.
    const swapped = pose.cutaway >= 0.5
    for (const obj of rig.thermalStack) {
      if (obj === rig.liquid) obj.visible = !swapped && pose.liquidLevel > 0.004
      else if (obj.name.startsWith('Vacuum')) obj.visible = false
      else obj.visible = !swapped
    }

    if (rig.bodyGroup) rig.bodyGroup.visible = pose.bodyVisible
    // The mark stays on through the cutaway: the cutaway's outer layer is the same
    // shell at the same radius, and the notch is a quarter turn away from it, so
    // hiding the monogram only made it vanish partway through the chapter.
    if (rig.branding) rig.branding.visible = pose.bodyVisible

    /* Display */
    oled.set(pose.oled.main ? pose.oled : OLED_PRESETS.off)
    // Driven well past 1 so the reading survives the tinted glass above it and
    // still crosses the bloom threshold.
    materials.oledPanel.emissiveIntensity = pose.oledBrightness * 4.2

    /* Callout emphasis (spec §34) */
    if (pose.activeCallout && CROWN_CALLOUT_TARGETS[pose.activeCallout]) {
      emphasis.setAll(0.52)
      for (const name of CROWN_CALLOUT_TARGETS[pose.activeCallout]) {
        const mesh = model.nodes.get(name) as THREE.Mesh | undefined
        if (mesh?.isMesh) emphasis.setTarget(mesh, 1)
      }
    } else {
      emphasis.setAll(1)
    }
  })

  if (!crownGroup) return null

  return (
    <>
      {/* Body. The tilt pivots about the product's centre, not its base, so the
          underside and pour moves read as the object being turned in space. */}
      <group ref={productRoot} name="aethr-product">
        <group ref={productTilt} position={[0, PRODUCT.center, 0]}>
          <group ref={productInner} position={[0, -PRODUCT.center, 0]}>
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <primitive object={model.scene} />
            </group>
            <EngravingPatch />
          </group>
        </group>
      </group>

      {/* Smart Crown — an independent actor that mirrors the body until it docks. */}
      <group ref={crownRoot} name="aethr-crown">
        <group ref={crownTilt} position={[0, PRODUCT.center, 0]}>
          <group position={[0, -PRODUCT.center, 0]}>
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <primitive object={crownGroup} />
            </group>
          </group>
        </group>
      </group>
    </>
  )
}

useGLTF.preload(ASSETS.product, ASSETS.draco)
