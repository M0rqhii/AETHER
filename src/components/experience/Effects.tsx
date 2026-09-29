'use client'

import { useRef } from 'react'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useExperience } from '@/state/experience'
import { flags } from '@/lib/aethr/debugFlags'

/**
 * Postprocessing, deliberately thin and — above all — *structurally fixed*.
 *
 * The effect chain is decided once, when the canvas mounts, and never changes
 * again. Adding or removing a pass mid-scroll forces the composer to rebuild and
 * its shaders to recompile, which reads as the page locking up for a moment at
 * the same few places every time. An earlier version did exactly that by mounting
 * depth of field around the macro shots.
 *
 * Depth of field is gone for the reason it was gated before: measured on a real
 * GPU it doubled the cost of the shots it appeared in. Spec §78 makes that call —
 * "Use DOF only if performance allows" — and a scroll that never hitches is worth
 * more than a defocused background in two frames.
 */
export function Effects() {
  const quality = useExperience((s) => s.quality)

  // Frozen at mount: adaptive quality moves pixel ratio and shadow resolution,
  // never the shape of this chain.
  const initial = useRef(quality)

  if (!flags.fx || initial.current === 'low') return null

  return (
    <EffectComposer multisampling={initial.current === 'high' && flags.ms ? 4 : 0} enableNormalPass={false}>
      {/* Threshold sits above the tone-mapped white point so only genuinely
          emissive surfaces — the OLED and the dock's status ring — bloom. A hot
          specular on a chamfer must never turn into a floating white ball. */}
      {flags.bloom ? (
        <Bloom
          intensity={0.16}
          luminanceThreshold={1.18}
          luminanceSmoothing={0.12}
          mipmapBlur
          radius={0.62}
          blendFunction={BlendFunction.SCREEN}
        />
      ) : (
        <></>
      )}
      {/* Grain is what separates "filmed" from "rendered".
          A perfectly clean render of a black studio reads as CGI precisely because
          it is clean — real footage of a dark set carries sensor noise, and its
          absence is the tell. Kept very low and overlaid, so it lives in the
          mid-tones and never speckles the highlights. */}
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.34} />

      {/* Deeper and tighter than a neutral vignette: the frame should fall away at
          the edges the way a fast lens does, which is also what keeps the eye on
          the product in a wide, mostly empty shot. */}
      <Vignette offset={0.24} darkness={0.72} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  )
}
