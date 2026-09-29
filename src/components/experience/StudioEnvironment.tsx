'use client'

import { Environment, Lightformer } from '@react-three/drei'
import { memo } from 'react'

/**
 * A studio built from light cards rather than a downloaded HDRI.
 *
 * Brushed metal is legible only when it has large, clean rectangles to reflect
 * (MATERIALS_LIGHTING.md). Tall narrow softboxes separated by darkness give the
 * cylinder the long vertical highlights the approved render shows, and keep the
 * whole thing self-contained — no CDN, no external asset.
 *
 * Baked once (`frames={1}`); the *moving* reflection is a real light in the rig.
 */
export const StudioEnvironment = memo(function StudioEnvironment({ resolution = 256 }: { resolution?: number }) {
  return (
    <Environment resolution={resolution} frames={1} background={false}>
      <color attach="background" args={['#040506']} />

      {/* Key softbox — the dominant vertical reflection down the body. Kept well
          under the clipping point: on a metal at roughness ~0.33 a brighter card
          stops reading as brushed and becomes a mirrored strip lamp. */}
      {/* Wide, not bright. A narrow card gives a hot strip-light reflection; a
          broad one gives the soft vertical gradient the approved render shows,
          which is what makes the finish read as satin rather than chrome. */}
      <Lightformer
        form="rect"
        intensity={1.7}
        color="#fffaf3"
        position={[3.4, 1.6, 2.6]}
        rotation={[0, -0.62, 0]}
        scale={[3.6, 7, 1]}
      />
      {/* Narrow companion strip — reads as a second edge on the cylinder. */}
      <Lightformer
        form="rect"
        intensity={1.15}
        color="#ffffff"
        position={[2.2, 0.4, 3.6]}
        rotation={[0, -0.3, 0]}
        scale={[0.5, 6, 1]}
      />
      {/* Cool fill on the opposite side, well below the key. */}
      <Lightformer
        form="rect"
        intensity={1.35}
        color="#c9d8e4"
        position={[-3.6, 0.9, 1.8]}
        rotation={[0, 1.0, 0]}
        scale={[1.5, 6.5, 1]}
      />
      {/* Rim from behind — separation from the near-black background. */}
      <Lightformer
        form="rect"
        intensity={2.3}
        color="#eef4f8"
        position={[-1.6, 1.8, -3.8]}
        rotation={[0, 2.9, 0]}
        scale={[1.1, 5.5, 1]}
      />
      {/* Soft overhead wash so the crown glass and top chamfer are never dead —
          restrained, or the polished top rim clips to white. */}
      <Lightformer
        form="circle"
        intensity={0.5}
        color="#ffffff"
        position={[0, 5.2, 0.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[4, 4, 1]}
      />
      {/* Dark floor bounce keeps the underside from going pure black. */}
      <Lightformer
        form="rect"
        intensity={0.32}
        color="#7e8a94"
        position={[0, -3.2, 0.8]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[8, 8, 1]}
      />
    </Environment>
  )
})
