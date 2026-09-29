'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { PHASE, local } from '@/lib/aethr/chapters'
import { PRODUCT } from '@/lib/aethr/constants'
import { createDropletSample, dropletAt, DROPLET_WINDOW, DROP_RADIUS } from '@/lib/aethr/droplet'
import { usePose } from './PoseProvider'
import { sceneRefs } from './sceneRefs'

const _world = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _axis = new THREE.Vector3()
const _down = new THREE.Vector3(0, -1, 0)
const _lip = new THREE.Vector3()

/** Mouth lip radius, from Mouth_Lip in the canonical GLB. */
const LIP_RADIUS = 0.0306

/**
 * The lowest point of the mouth's rim, in world space.
 *
 * A stream dropped from the centre of a *tilted* mouth falls straight through the
 * shell — the mouth overhangs the body, so the water has to leave from the low
 * side of the lip and fall clear of it. With the bottle upright this collapses
 * back to the centre, which is exactly right for a stream going in.
 */
function lipPoint(out: THREE.Vector3, mouth: THREE.Object3D | null): THREE.Vector3 {
  if (!mouth) return out.set(0, PRODUCT.bodyTop, 0)
  mouth.getWorldPosition(out)
  mouth.getWorldQuaternion(_quat)
  _axis.set(0, 0, 1).applyQuaternion(_quat)
  // Down with the bottle's own axis projected out of it: the rim's downhill.
  _lip.copy(_down).addScaledVector(_axis, -_down.dot(_axis))
  if (_lip.lengthSq() < 1e-6) return out
  return out.addScaledVector(_lip.normalize(), LIP_RADIUS)
}

/**
 * Water in motion.
 *
 * Streams and the final droplet are separate from the container's fill level
 * (spec §136), so the level can be scrubbed backwards without the pour having to
 * "play". Colourless and refractive-looking rather than blue (spec §43).
 */
function streamMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uWarm: { value: 0 } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - world.xyz);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uOpacity;
      uniform float uWarm;
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        // Bright at the silhouette, near-invisible face-on: reads as clear water.
        float fresnel = pow(1.0 - abs(dot(normalize(vNormalW), normalize(vViewDir))), 2.0);
        float flow = 0.5 + 0.5 * sin(vUv.y * 46.0 - uTime * 7.5);
        float taper = smoothstep(0.0, 0.08, vUv.y) * (1.0 - smoothstep(0.72, 1.0, vUv.y));
        vec3 tint = mix(vec3(0.90, 0.94, 0.96), vec3(0.98, 0.93, 0.86), uWarm);
        float a = (0.10 + fresnel * 0.62 + flow * 0.08) * taper * uOpacity;
        gl_FragColor = vec4(tint, a);
      }
    `,
  })
}

export function LiquidStreams() {
  const { pose, progress } = usePose()

  const inflow = useRef<THREE.Mesh>(null)
  const outflow = useRef<THREE.Mesh>(null)
  const droplet = useRef<THREE.Mesh>(null)

  const inMat = useMemo(streamMaterial, [])
  const outMat = useMemo(streamMaterial, [])
  const drop = useMemo(createDropletSample, [])

  // Long enough that the top runs out of frame: the water arrives from above the
  // shot, not from a point in mid-air just over the bottle.
  const inGeo = useMemo(() => new THREE.CylinderGeometry(0.0028, 0.0038, 0.46, 14, 1, true), [])
  const outGeo = useMemo(() => new THREE.CylinderGeometry(0.0034, 0.0022, 0.34, 14, 1, true), [])
  const dropGeo = useMemo(() => new THREE.SphereGeometry(DROP_RADIUS, 32, 24), [])

  /* Water, not a pearl.
     A lit sphere in an even studio comes out an even grey disc, which at a fifth
     of the frame reads as a bead, not a drop. What makes water legible against a
     dark set is that it is invisible face-on and bright at the silhouette, with a
     single hard specular. That is cheap to state directly and needs no second
     scene render, which real transmission would (see LIQUID_HELPER). */
  const dropMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uOpacity: { value: 1 } },
        transparent: true,
        depthWrite: false,
        vertexShader: /* glsl */ `
          varying vec3 vNormalW;
          varying vec3 vViewDir;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vNormalW = normalize(mat3(modelMatrix) * normal);
            vViewDir = normalize(cameraPosition - world.xyz);
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uOpacity;
          varying vec3 vNormalW;
          varying vec3 vViewDir;
          void main() {
            vec3 n = normalize(vNormalW);
            vec3 v = normalize(vViewDir);
            float rim = pow(1.0 - abs(dot(n, v)), 2.6);
            // Roughly the studio key, so the drop is lit from where everything else is.
            vec3 l = normalize(vec3(0.6, 0.7, 0.55));
            float spec = pow(max(dot(reflect(-v, n), l), 0.0), 200.0);
            float a = (0.04 + rim * 0.82 + spec * 1.6) * uOpacity;
            gl_FragColor = vec4(mix(vec3(0.85, 0.90, 0.94), vec3(1.0), spec), clamp(a, 0.0, 1.0));
          }
        `,
      }),
    [],
  )

  useEffect(
    () => () => {
      inMat.dispose()
      outMat.dispose()
      inGeo.dispose()
      outGeo.dispose()
      dropGeo.dispose()
      dropMat.dispose()
    },
    [inMat, outMat, inGeo, outGeo, dropGeo, dropMat],
  )

  useFrame((_, delta) => {
    const p = progress.value
    inMat.uniforms.uTime.value += delta
    outMat.uniforms.uTime.value += delta

    // Warm tint only for the hot fill and the 24-hour pour.
    const warm = p >= PHASE.hotOpen[0] ? 1 : 0
    inMat.uniforms.uWarm.value = warm
    outMat.uniforms.uWarm.value = warm

    lipPoint(_world, sceneRefs.mouth)

    const inMesh = inflow.current
    if (inMesh) {
      inMesh.visible = pose.pourIn > 0.01
      inMat.uniforms.uOpacity.value = pose.pourIn
      // Falls vertically into the mouth, wherever the mouth happens to be.
      inMesh.position.set(_world.x, _world.y + 0.23, _world.z)
    }

    const outMesh = outflow.current
    if (outMesh) {
      outMesh.visible = pose.pourOut > 0.01
      outMat.uniforms.uOpacity.value = pose.pourOut
      // The pour *grows* out of the mouth rather than switching on at full length:
      // the column extends downward from the lip as the flow builds. Anchored at
      // the top, so the water leaves the bottle instead of appearing mid-air.
      const grow = Math.max(0.001, Math.min(1, pose.pourOut * 1.35))
      outMesh.scale.y = grow
      // Hangs from the low side of the lip, so it never crosses the tilted shell.
      outMesh.position.set(_world.x, _world.y - 0.17 * grow, _world.z)
    }

    // The hero drop that carries the cut onto the dock (spec §63, §64). Its whole
    // path lives in `droplet.ts`, because the camera has to sample the same
    // function to ride down with it.
    const d = droplet.current
    if (d) {
      const t = local(p, DROPLET_WINDOW)
      const alive = t > 0.0005 && t < 0.9995
      d.visible = alive
      if (alive) {
        const s = dropletAt(t, drop)
        d.position.set(s.x, s.y, s.z)
        // Landing spreads it sideways as it loses height — a drop, not a marble.
        const spread = 1 + s.flatten * 0.85
        d.scale.set(s.scale * spread, s.scale * (1 - s.flatten * 0.78), s.scale * spread)
        dropMat.uniforms.uOpacity.value = s.opacity
      }
    }
  })

  return (
    <>
      <mesh ref={inflow} geometry={inGeo} material={inMat} visible={false} />
      <mesh ref={outflow} geometry={outGeo} material={outMat} visible={false} />
      <mesh ref={droplet} geometry={dropGeo} material={dropMat} visible={false} />
    </>
  )
}
