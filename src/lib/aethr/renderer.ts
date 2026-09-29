'use client'

/**
 * What is actually going to draw this scene.
 *
 * A browser that has fallen back to software rasterisation (Windows' "Microsoft
 * Basic Render Driver", SwiftShader, llvmpipe) will run a scene like this at a
 * couple of frames a second no matter how it is authored — the CPU is doing the
 * GPU's job. Detecting it up front lets the experience open in its cheapest mode
 * immediately, instead of crawling while adaptive quality works it out.
 */
export interface RendererInfo {
  webgl: boolean
  renderer: string
  software: boolean
}

const SOFTWARE = /swiftshader|basic render|llvmpipe|softpipe|software|microsoft basic/i

let cached: RendererInfo | null = null

export function detectRenderer(): RendererInfo {
  if (cached) return cached
  if (typeof document === 'undefined') return { webgl: true, renderer: '', software: false }

  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) {
      cached = { webgl: false, renderer: '', software: true }
      return cached
    }
    const debug = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER))
    // Release the probe context rather than leaving it to the GC — browsers cap
    // the number of live WebGL contexts, and the real canvas needs one.
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    cached = { webgl: true, renderer, software: SOFTWARE.test(renderer) }
    return cached
  } catch {
    cached = { webgl: false, renderer: '', software: true }
    return cached
  }
}
