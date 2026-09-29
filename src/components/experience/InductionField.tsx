'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { usePose } from './PoseProvider'

/**
 * Inductive coupling, drawn as an explanatory diagram rather than an effect.
 *
 * Four elliptical field curves bridge the dock coil and the crown coil, with a
 * slow flowing offset and additive blending under 0.2 opacity. Spec §71 is explicit:
 * no arcs, no lightning, nothing that reads as electrical discharge.
 */
export function InductionField({ from, to }: { from: number; to: number }) {
  const { pose } = usePose()
  const group = useRef<THREE.Group>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 0 } }), [])

  const curves = useMemo(() => {
    const midY = (from + to) / 2
    const ry = (to - from) / 2 + 0.008
    const built: Array<{ geometry: THREE.BufferGeometry; rotation: number }> = []

    // Four loops at two radii, in two perpendicular planes — enough to read as a
    // field, few enough to stay restrained.
    const radii = [0.014, 0.027]
    const planes = [0, Math.PI / 2]

    for (const plane of planes) {
      for (const rx of radii) {
        const pts: number[] = []
        const ts: number[] = []
        const SEGMENTS = 96
        for (let i = 0; i <= SEGMENTS; i++) {
          const a = (i / SEGMENTS) * Math.PI * 2
          pts.push(Math.cos(a) * rx, midY + Math.sin(a) * ry * (rx / 0.027), 0)
          ts.push(i / SEGMENTS)
        }
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
        geometry.setAttribute('aT', new THREE.Float32BufferAttribute(ts, 1))
        built.push({ geometry, rotation: plane })
      }
    }
    return built
  }, [from, to])

  useEffect(() => () => curves.forEach((c) => c.geometry.dispose()), [curves])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
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
            // A slow travelling band, never a pulse or a spark.
            float flow = 0.35 + 0.65 * smoothstep(0.0, 1.0, sin((vT * 6.2831) - uTime * 1.15) * 0.5 + 0.5);
            gl_FragColor = vec4(vec3(0.91, 0.95, 0.98), flow * uOpacity);
          }
        `,
      }),
    [uniforms],
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
    uniforms.uOpacity.value = pose.fieldViz * 0.19
    if (group.current) group.current.visible = pose.fieldViz > 0.01
  })

  // Built once — creating Line objects during render would leak one per frame.
  const lines = useMemo(
    () =>
      curves.map((c) => {
        const line = new THREE.Line(c.geometry, material)
        line.rotation.y = c.rotation
        line.frustumCulled = false
        return line
      }),
    [curves, material],
  )

  return (
    <group ref={group} visible={false}>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  )
}
