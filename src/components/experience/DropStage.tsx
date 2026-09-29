'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { CuboidCollider, CylinderCollider, Physics, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { PRODUCT } from '@/lib/aethr/constants'
import { CHAPTERS } from '@/lib/aethr/chapters'
import { clamp, easeInOutCubic } from '@/lib/aethr/math'
import { useExperience } from '@/state/experience'
import { physicsControl } from './physicsControl'

const REST = new THREE.Vector3(0, 0, 0)
const UPRIGHT = new THREE.Quaternion()
const _plane = new THREE.Plane()
const _hit = new THREE.Vector3()
const _normal = new THREE.Vector3()
const _prev = new THREE.Vector3()
const _vel = new THREE.Vector3()
const _pos = new THREE.Vector3()
const _rot = new THREE.Quaternion()

/** How long the bottle takes to right itself and walk home after a reset. */
const RESTORE_SECONDS = 0.9

/**
 * The drop test.
 *
 * Everywhere else the product is driven by scripted transforms; here a rigid body
 * takes over, and hands control back cleanly on reset (spec §83–§87, §156).
 * The bottle is a solid titanium object: heavy, high friction, almost no restitution.
 */
export function DropStage({ children }: { children: React.ReactNode }) {
  const camera = useThree((s) => s.camera)

  const chapterIndex = useExperience((s) => s.chapterIndex)
  const dropResetToken = useExperience((s) => s.dropResetToken)
  const setDropReleased = useExperience((s) => s.setDropReleased)
  const setDropSettled = useExperience((s) => s.setDropSettled)
  const setCursorLabel = useExperience((s) => s.setCursorLabel)

  const inDrop = CHAPTERS[chapterIndex]?.id === 'drop'
  const body = useRef<RapierRigidBody>(null)
  const [dynamic, setDynamic] = useState(false)
  const dragging = useRef(false)
  const grabOffset = useRef(new THREE.Vector3())
  const stillFor = useRef(0)

  /* ---- Reset: back to the scripted pose (spec §87) ------------------------
     Not a cut. Snapping the body home and hiding it behind a black frame is what
     made the reset read as the bottle teleporting; instead the kinematic body
     rights itself and walks back, and only hands control to the script once it has
     actually arrived. */
  const restoring = useRef<{ t: number; from: THREE.Vector3; fromQ: THREE.Quaternion } | null>(null)

  useEffect(() => {
    const rb = body.current
    setDynamic(false)
    dragging.current = false
    stillFor.current = 0
    if (!rb) return
    rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
    rb.setAngvel({ x: 0, y: 0, z: 0 }, true)

    const t = rb.translation()
    const r = rb.rotation()
    if (Math.hypot(t.x, t.y, t.z) < 1e-4 && Math.abs(r.w) > 0.9999) {
      restoring.current = null
      physicsControl.active = false
      return
    }

    physicsControl.active = true
    restoring.current = {
      t: 0,
      from: new THREE.Vector3(t.x, t.y, t.z),
      fromQ: new THREE.Quaternion(r.x, r.y, r.z, r.w),
    }
  }, [dropResetToken])

  /* ---- Leaving the chapter also returns the product ----------------------- */
  useEffect(() => {
    if (inDrop) return
    setDynamic(false)
    physicsControl.active = false
    // Scrolling out of the chapter is a cut anyway; no point walking home for it.
    restoring.current = null
    setDropReleased(false)
    setDropSettled(false)
    const rb = body.current
    if (rb) {
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      rb.setAngvel({ x: 0, y: 0, z: 0 }, true)
      rb.setTranslation(REST, true)
      rb.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
    }
  }, [inDrop, setDropReleased, setDropSettled])

  /* ---- Grab, reposition, release ------------------------------------------ */
  const pointerPlaneHit = useCallback(
    (event: { ray: THREE.Ray }) => {
      camera.getWorldDirection(_normal)
      const rb = body.current
      const origin = rb ? rb.translation() : { x: 0, y: PRODUCT.center, z: 0 }
      _plane.setFromNormalAndCoplanarPoint(_normal, new THREE.Vector3(origin.x, origin.y + PRODUCT.center, origin.z))
      return event.ray.intersectPlane(_plane, _hit) ? _hit : null
    },
    [camera],
  )

  const onPointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!inDrop) return
      const rb = body.current
      if (!rb) return
      event.stopPropagation()
      ;(event.target as Element | null)?.setPointerCapture?.(event.pointerId)

      const hit = pointerPlaneHit(event)
      const t = rb.translation()
      if (hit) grabOffset.current.set(t.x - hit.x, t.y - hit.y, t.z - hit.z)

      dragging.current = true
      stillFor.current = 0
      setDropSettled(false)
      setDynamic(false)
      physicsControl.active = true
      _prev.set(t.x, t.y, t.z)
      setCursorLabel('Throw')
    },
    [inDrop, pointerPlaneHit, setDropSettled, setCursorLabel],
  )

  const onPointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!dragging.current) return
      const rb = body.current
      if (!rb) return
      const hit = pointerPlaneHit(event)
      if (!hit) return
      const next = {
        x: clamp(hit.x + grabOffset.current.x, -0.32, 0.32),
        y: clamp(hit.y + grabOffset.current.y, 0.0, 0.5),
        z: clamp(hit.z + grabOffset.current.z, -0.28, 0.28),
      }
      rb.setNextKinematicTranslation(next)
    },
    [pointerPlaneHit],
  )

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    const rb = body.current
    if (!rb) return

    // Carry the throw over, clamped so a flick can never produce a silly launch.
    const t = rb.translation()
    _vel.set(t.x - _prev.x, t.y - _prev.y, t.z - _prev.z).multiplyScalar(16)
    if (_vel.length() > 2.2) _vel.setLength(2.2)

    setDynamic(true)
    physicsControl.active = true
    setDropReleased(true)
    rb.setLinvel({ x: _vel.x, y: _vel.y, z: _vel.z }, true)
    rb.setAngvel({ x: _vel.z * 5, y: 0.6, z: -_vel.x * 5 }, true)
    setCursorLabel(null)
  }, [setDropReleased, setCursorLabel])

  useEffect(() => {
    const up = () => onPointerUp()
    window.addEventListener('pointerup', up)
    return () => window.removeEventListener('pointerup', up)
  }, [onPointerUp])

  /* ---- Settling, and the walk home after a reset -------------------------- */
  useFrame((_, delta) => {
    const rb = body.current
    if (!rb) return

    const back = restoring.current
    if (back) {
      back.t = Math.min(1, back.t + delta / RESTORE_SECONDS)
      const e = easeInOutCubic(back.t)
      _pos.copy(back.from).lerp(REST, e)
      _rot.copy(back.fromQ).slerp(UPRIGHT, e)
      rb.setNextKinematicTranslation(_pos)
      rb.setNextKinematicRotation(_rot)
      if (back.t >= 1) {
        restoring.current = null
        // Only now does the scripted pose take over, with the body already there.
        physicsControl.active = false
      }
      return
    }

    if (!dynamic) return

    /* Off the set — put it back in the air over the middle.
       The walls stop a throw from leaving sideways, but a hard enough flick can
       still clear them, and a bottle that leaves the frame never comes back: it
       just stops existing. Dropping it in from above the centre keeps the toy
       playable without a reset, and reads as part of the test rather than as a
       recovery. */
    const at = rb.translation()
    if (Math.abs(at.x) > 0.55 || Math.abs(at.z) > 0.55 || at.y > 1.2 || at.y < -0.4) {
      rb.setTranslation({ x: 0, y: 0.62, z: 0 }, true)
      rb.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      rb.setAngvel({ x: 0, y: 0.8, z: 0 }, true)
      stillFor.current = 0
      return
    }

    const t = rb.translation()
    _prev.set(t.x, t.y, t.z)

    const lv = rb.linvel()
    const av = rb.angvel()
    const still = Math.hypot(lv.x, lv.y, lv.z) < 0.06 && Math.hypot(av.x, av.y, av.z) < 0.25

    stillFor.current = still ? stillFor.current + delta : 0
    if (stillFor.current > 0.45) setDropSettled(true)
  })

  return (
    /* Never paused.
     *
     * With the world paused, the library stops writing the body's transform onto
     * its group — so resetting the body had no effect on screen and the bottle
     * stayed lying down for the rest of the page, including the finale. Two bodies
     * and a floor cost nothing to keep stepping, and the body type is what
     * actually decides whether the product is under physics or under the script. */
    <Physics paused={false} gravity={[0, -9.81, 0]} timeStep="vary">
      <RigidBody
        ref={body}
        type={dynamic ? 'dynamic' : 'kinematicPosition'}
        colliders={false}
        canSleep
        linearDamping={0.06}
        angularDamping={0.22}
      >
        {/* Titanium, not plastic: heavy, grippy and barely elastic (spec §84). */}
        <CylinderCollider
          args={[PRODUCT.center, PRODUCT.radius]}
          position={[0, PRODUCT.center, 0]}
          density={900}
          restitution={0.12}
          friction={0.9}
        />
        <group onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
          {children}
        </group>
      </RigidBody>

      {/* Floor plus invisible walls so the bottle cannot leave the set.
          They used to be 300 mm high, which a hard throw clears — the bottle then
          sailed past them and landed somewhere off camera, reading as though it had
          simply vanished. A metre is above anything the clamped release velocity
          can reach, and the walls are pulled in to the edge of the lit floor. */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[2, 0.05, 2]} position={[0, -0.05, 0]} friction={0.95} restitution={0.05} />
        <CuboidCollider args={[0.02, 1, 2]} position={[0.42, 1, 0]} restitution={0.2} />
        <CuboidCollider args={[0.02, 1, 2]} position={[-0.42, 1, 0]} restitution={0.2} />
        <CuboidCollider args={[2, 1, 0.02]} position={[0, 1, -0.38]} restitution={0.2} />
        <CuboidCollider args={[2, 1, 0.02]} position={[0, 1, 0.4]} restitution={0.2} />
      </RigidBody>
    </Physics>
  )
}
