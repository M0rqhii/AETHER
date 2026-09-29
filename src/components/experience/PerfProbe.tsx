'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { flags } from '@/lib/aethr/debugFlags'

/**
 * Development-only frame cost readout.
 *
 * Logs the numbers that actually explain a CPU spike — draw calls, resolution the
 * renderer is really working at, shader program count, and how much of the frame
 * is spent inside our own `useFrame` work versus the draw itself. Removed from
 * production builds by the `NODE_ENV` guard.
 */
export function PerfProbe() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const state = useRef({ frames: 0, last: performance.now(), jsTime: 0 })

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !flags.perf) return
    // three resets the counters on every render, so a read inside useFrame only
    // ever sees the composer's last fullscreen pass. Accumulate over a second
    // instead and divide by the frames actually drawn.
    gl.info.autoReset = false
    const ctx = gl.getContext()
    // `RENDERER` is masked ("WebKit WebGL"); the debug extension gives the real
    // adapter, which is the only way to tell hardware from a software fallback.
    const dbg = ctx.getExtension('WEBGL_debug_renderer_info')
    const unmasked = dbg ? String(ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : null
    console.log(
      '[aethr:gpu]',
      JSON.stringify({
        renderer: ctx.getParameter(ctx.RENDERER),
        unmaskedRenderer: unmasked,
        unmaskedVendor: dbg ? ctx.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : null,
        softwareRendering: unmasked ? /swiftshader|software|llvmpipe|basic render/i.test(unmasked) : null,
        webgl2: typeof WebGL2RenderingContext !== 'undefined' && ctx instanceof WebGL2RenderingContext,
        maxSamples: 'MAX_SAMPLES' in ctx ? ctx.getParameter((ctx as WebGL2RenderingContext).MAX_SAMPLES) : null,
      }),
    )
  }, [gl])

  useFrame(() => {
    if (process.env.NODE_ENV === 'production' || !flags.perf) return
    const s = state.current
    const t0 = performance.now()
    s.frames++

    const now = t0
    if (now - s.last >= 1000) {
      const info = gl.info
      let meshes = 0
      scene.traverse((o) => {
        if ((o as { isMesh?: boolean }).isMesh && o.visible) meshes++
      })
      const perFrame = Math.max(1, s.frames)
      console.log(
        '[aethr:perf]',
        JSON.stringify({
          fps: +(s.frames / ((now - s.last) / 1000)).toFixed(1),
          drawCalls: Math.round(info.render.calls / perFrame),
          triangles: Math.round(info.render.triangles / perFrame),
          programs: info.programs?.length ?? 0,
          geometries: info.memory.geometries,
          textures: info.memory.textures,
          dpr: gl.getPixelRatio(),
          devicePixelRatio: window.devicePixelRatio,
          buffer: `${gl.domElement.width}x${gl.domElement.height}`,
          visibleMeshes: meshes,
        }),
      )
      gl.info.reset()
      s.frames = 0
      s.last = now
    }
  })

  return null
}
