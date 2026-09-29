'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { PRODUCT } from '@/lib/aethr/constants'
import { mulberry32 } from '@/lib/aethr/math'
import { useResources } from './ResourceProvider'
import { usePose } from './PoseProvider'
import { useExperience } from '@/state/experience'
import { sceneRefs } from './sceneRefs'

const _world = new THREE.Vector3()

/* ==========================================================================
   Steam — spec §47: subtle, slow, never a plume
   ========================================================================== */

function useParticleGeometry(count: number, seed: number) {
  return useMemo(() => {
    const rand = mulberry32(seed)
    const geometry = new THREE.BufferGeometry()
    const position = new Float32Array(count * 3)
    const seeds = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      position[i * 3] = 0
      position[i * 3 + 1] = 0
      position[i * 3 + 2] = 0
      seeds[i * 3] = rand()
      seeds[i * 3 + 1] = rand()
      seeds[i * 3 + 2] = rand()
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3))
    // Particles are placed in the vertex shader; culling by the empty box would hide them.
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1)
    return geometry
  }, [count, seed])
}

export function SteamSystem() {
  const { sprite } = useResources()
  const { pose } = usePose()
  const quality = useExperience((s) => s.quality)

  const count = quality === 'high' ? 84 : quality === 'medium' ? 48 : 24
  const geometry = useParticleGeometry(count, 1337)
  const points = useRef<THREE.Points>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uMap: { value: sprite },
      uSize: { value: 1 },
    }),
    [sprite],
  )

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        /* Steam, not a spray of dots.
           The sprites used to come out under 4 px across, so what read on screen
           was a handful of specks rising in a line. Smoke is the opposite: a few
           large, very faint puffs that overlap, expand as they rise and drift apart
           — so the size is up roughly fortyfold, the per-particle opacity is down
           to match, and each puff wanders on its own. */
        vertexShader: /* glsl */ `
          attribute vec3 aSeed;
          uniform float uTime;
          uniform float uSize;
          varying float vFade;
          void main() {
            float life = fract(aSeed.x + uTime * (0.055 + aSeed.y * 0.045));
            float rise = life * 0.17;
            // Two drifts at different rates, so the column curls instead of marching.
            float drift = sin((life * 3.1) + aSeed.z * 6.28) * 0.026 * life;
            float sway = cos((life * 2.3) + aSeed.x * 6.28) * 0.021 * life;
            vec3 p = vec3(
              (aSeed.x - 0.5) * 0.03 + drift,
              rise,
              (aSeed.z - 0.5) * 0.03 + sway
            );
            // In from the surface, out as it thins into the air — a long tail, so
            // the puffs are dissolving for most of their life rather than blinking.
            vFade = smoothstep(0.0, 0.22, life) * (1.0 - smoothstep(0.3, 1.0, life));
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            // Expands as it cools: a puff roughly 8 mm across at the mouth, 35 mm
            // by the time it leaves.
            gl_PointSize = (680.0 + life * 2400.0) * uSize / -mv.z * 0.02;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uMap;
          uniform float uOpacity;
          varying float vFade;
          void main() {
            vec4 tex = texture2D(uMap, gl_PointCoord);
            gl_FragColor = vec4(vec3(0.92, 0.94, 0.95), tex.a * vFade * uOpacity);
          }
        `,
      }),
    [uniforms],
  )

  useEffect(() => {
    return () => {
      material.dispose()
      geometry.dispose()
    }
  }, [material, geometry])

  useFrame((state, delta) => {
    uniforms.uTime.value += delta
    // Faint per puff: they overlap heavily now, and the read comes from the mass.
    uniforms.uOpacity.value = pose.steam * 0.1
    uniforms.uSize.value = state.size.height / 900

    const p = points.current
    if (!p) return
    p.visible = pose.steam > 0.01
    if (!p.visible) return

    // Steam belongs to the opening, wherever the bottle currently is.
    if (sceneRefs.mouth) {
      sceneRefs.mouth.getWorldPosition(_world)
      p.position.copy(_world)
    } else {
      p.position.set(0, PRODUCT.bodyTop, 0)
    }
  })

  return <points ref={points} geometry={geometry} material={material} visible={false} frustumCulled={false} />
}

/* ==========================================================================
   Low-E heat rays — spec §55: a handful of designed rays, never a particle storm
   ========================================================================== */

export function HeatRays() {
  const { pose } = usePose()
  const group = useRef<THREE.Group>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 0 } }), [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          attribute float aT;
          varying float vT;
          void main() {
            vT = aT;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uOpacity;
          varying float vT;
          void main() {
            // A short pulse of radiant heat travelling out and reflecting back in.
            float head = fract(uTime * 0.42 + vT * 0.15);
            float band = smoothstep(0.12, 0.0, abs(vT - head));
            float base = 0.16 * (1.0 - abs(vT - 0.5) * 1.2);
            gl_FragColor = vec4(vec3(0.84, 0.55, 0.26), (band * 0.85 + base) * uOpacity);
          }
        `,
      }),
    [uniforms],
  )

  /**
   * Authored trajectories, not a simulation (spec §143): each ray leaves the inner
   * vessel, meets the low-E coating and turns back toward the water.
   */
  const lines = useMemo(() => {
    const rand = mulberry32(7)
    const built: THREE.Line[] = []
    const rInner = 0.0335
    const rCoating = 0.0342

    for (let i = 0; i < 6; i++) {
      const y = 0.05 + (i / 5) * 0.15
      // Kept in the +X quadrant, where the cutaway notch actually exposes the layers.
      const a = -0.55 + rand() * 1.1
      const pts: number[] = []
      const ts: number[] = []
      const SEG = 40
      for (let s = 0; s <= SEG; s++) {
        const t = s / SEG
        // Out to the coating, then reflected back inward.
        const r = t < 0.5 ? rInner + (rCoating - rInner) * (t * 2) : rCoating - (rCoating - rInner) * ((t - 0.5) * 2)
        const spread = (t < 0.5 ? t : 1 - t) * 0.05
        const angle = a + (t - 0.5) * 0.24
        pts.push(Math.sin(angle) * r, y + spread * 0.4, Math.cos(angle) * r)
        ts.push(t)
      }
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
      geometry.setAttribute('aT', new THREE.Float32BufferAttribute(ts, 1))
      const line = new THREE.Line(geometry, material)
      line.frustumCulled = false
      // Rays sit in the notch, which faces +X once the wedges peel away.
      line.rotation.y = Math.PI / 2
      built.push(line)
    }
    return built
  }, [material])

  useEffect(
    () => () => {
      lines.forEach((l) => l.geometry.dispose())
      material.dispose()
    },
    [lines, material],
  )

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
    uniforms.uOpacity.value = pose.heatRays
    if (group.current) group.current.visible = pose.heatRays > 0.01
  })

  return (
    <group ref={group} visible={false}>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  )
}

/* ==========================================================================
   Vacuum motes — spec §57: heat trying to cross the gap, slowing and fading
   ========================================================================== */

export function VacuumMotes() {
  const { sprite } = useResources()
  const { pose } = usePose()
  const geometry = useParticleGeometry(40, 991)
  const points = useRef<THREE.Points>(null)

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOpacity: { value: 0 }, uMap: { value: sprite } }),
    [sprite],
  )

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          attribute vec3 aSeed;
          uniform float uTime;
          varying float vFade;
          void main() {
            float life = fract(aSeed.y + uTime * 0.16);
            // Radial drift across the gap that stalls before it reaches the shell.
            float r = 0.0342 + life * 0.0016;
            float angle = aSeed.x * 6.2831;
            float y = 0.02 + aSeed.z * 0.2;
            vec3 p = vec3(sin(angle) * r, y, cos(angle) * r);
            vFade = smoothstep(0.0, 0.2, life) * (1.0 - smoothstep(0.3, 0.9, life));
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = 26.0 / -mv.z * 0.02;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uMap;
          uniform float uOpacity;
          varying float vFade;
          void main() {
            vec4 tex = texture2D(uMap, gl_PointCoord);
            gl_FragColor = vec4(vec3(0.72, 0.82, 0.9), tex.a * vFade * uOpacity);
          }
        `,
      }),
    [uniforms],
  )

  useEffect(
    () => () => {
      material.dispose()
      geometry.dispose()
    },
    [material, geometry],
  )

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
    uniforms.uOpacity.value = pose.vacuumOpacity * 1.4
    if (points.current) points.current.visible = pose.vacuumOpacity > 0.01
  })

  return <points ref={points} geometry={geometry} material={material} visible={false} frustumCulled={false} />
}
