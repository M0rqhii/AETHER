'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { applyFraming, createCameraSample, sampleCamera } from '@/lib/aethr/camera'
import { PHASE, local, chapter } from '@/lib/aethr/chapters'
import { damp, clamp } from '@/lib/aethr/math'
import { PRODUCT } from '@/lib/aethr/constants'
import { scroll, useExperience } from '@/state/experience'
import { usePose } from './PoseProvider'

/** Pointer-driven look-around, active only in the "Grab it." chapter (spec §82). */
export const dragOffset = { yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 }

/**
 * The single camera controller (spec §125). Every framing comes from the shot
 * table; damping only smooths the last few millimetres so fast scrolling never
 * queues or overshoots.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const isMobile = useExperience((s) => s.isMobile)
  const reducedMotion = useExperience((s) => s.reducedMotion)
  const { pose, progress } = usePose()

  const sample = useMemo(createCameraSample, [])
  const current = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 30 })
  const primed = useRef(false)
  const snapToken = useRef(-1)

  // A refresh mid-page must not fly the camera in from the first shot.
  useEffect(() => {
    primed.current = false
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta)
    const p = progress.value

    sampleCamera(p, sample)

    if (reducedMotion) {
      // Keep the framing, drop the travel: sit further back and level out the
      // extremes so nothing swings past the viewer (spec §111).
      sample.position.y = THREE.MathUtils.lerp(sample.position.y, PRODUCT.center, 0.35)
      sample.target.y = THREE.MathUtils.lerp(sample.target.y, PRODUCT.center, 0.35)
    }

    if (isMobile) {
      // Desktop shots bias the product sideways to leave room for a card on the
      // right. On phones the card drops to the bottom, so that offset would just
      // push the product off the edge — slide the whole shot back to centre
      // without changing the angle it is seen from (spec §108).
      const dx = sample.target.x * 0.85
      sample.target.x -= dx
      sample.position.x -= dx
    }

    const aspect = size.width / Math.max(1, size.height)
    // Phones get a touch more air so the product never kisses the safe area.
    applyFraming(sample, aspect, isMobile ? 1.12 : 1)

    // Snap on the first frame and on every instant progress adoption; glide otherwise.
    const snapped = scroll.snapToken !== snapToken.current
    if ((!primed.current && scroll.primed) || snapped) {
      snapToken.current = scroll.snapToken
      current.current.pos.copy(sample.position)
      current.current.target.copy(sample.target)
      current.current.fov = sample.fov
      primed.current = true
    } else {
      // Light damping: the shot table already carries the easing. It still has to
      // absorb the step a wheel notch puts into progress, so it sits low enough to
      // round off a hard change of direction between two shots.
      const l = reducedMotion ? 40 : 8
      current.current.pos.x = damp(current.current.pos.x, sample.position.x, l, dt)
      current.current.pos.y = damp(current.current.pos.y, sample.position.y, l, dt)
      current.current.pos.z = damp(current.current.pos.z, sample.position.z, l, dt)
      current.current.target.x = damp(current.current.target.x, sample.target.x, l, dt)
      current.current.target.y = damp(current.current.target.y, sample.target.y, l, dt)
      current.current.target.z = damp(current.current.target.z, sample.target.z, l, dt)
      current.current.fov = damp(current.current.fov, sample.fov, l, dt)
    }

    camera.position.copy(current.current.pos)

    // User look-around: a bounded orbit around the framed target, damped so a
    // flick can never produce an unrealistic angular velocity (spec §82).
    const grabbable = p >= PHASE.grabIt[0] && p < chapter('drop').end
    if (!grabbable) {
      dragOffset.targetYaw = 0
      dragOffset.targetPitch = 0
    }
    dragOffset.yaw = damp(dragOffset.yaw, dragOffset.targetYaw, 6, dt)
    dragOffset.pitch = damp(dragOffset.pitch, dragOffset.targetPitch, 6, dt)

    if (Math.abs(dragOffset.yaw) > 1e-4 || Math.abs(dragOffset.pitch) > 1e-4) {
      const offset = camera.position.clone().sub(current.current.target)
      const spherical = new THREE.Spherical().setFromVector3(offset)
      spherical.theta += dragOffset.yaw
      spherical.phi = clamp(spherical.phi - dragOffset.pitch, 0.25, Math.PI - 0.25)
      camera.position.copy(current.current.target).add(new THREE.Vector3().setFromSpherical(spherical))
    }

    camera.lookAt(current.current.target)

    if (Math.abs(camera.fov - current.current.fov) > 0.001) {
      camera.fov = current.current.fov
      camera.updateProjectionMatrix()
    }

    // Physics owns the bottle during the drop; nudge the camera to keep it framed.
    if (pose.physics) {
      camera.lookAt(current.current.target)
    }
  })

  return null
}

/** Local progress helper re-exported for scene components. */
export { local }
