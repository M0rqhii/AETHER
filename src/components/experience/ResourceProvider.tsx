'use client'

import { createContext, useContext, useEffect, useMemo } from 'react'
import { createMaterials, EmphasisController, FinishAnimator, type MaterialSet } from '@/lib/aethr/materials'
import { createOledDisplay, type OledDisplay } from '@/lib/aethr/oled'
import { createEngravingTexture, createSoftSprite, type EngravingTexture } from '@/lib/aethr/textures'
import type * as THREE from 'three'

interface Resources {
  materials: MaterialSet
  oled: OledDisplay
  engraving: EngravingTexture
  sprite: THREE.DataTexture
  emphasis: EmphasisController
  finish: FinishAnimator
}

const ResourceContext = createContext<Resources | null>(null)

export function useResources(): Resources {
  const ctx = useContext(ResourceContext)
  if (!ctx) throw new Error('useResources must be used inside <ResourceProvider>')
  return ctx
}

/**
 * Owns every GPU resource that outlives a single component: materials, the OLED
 * canvas, the engraving canvas, the particle sprite. Created once and disposed on
 * unmount (spec §168).
 */
export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const resources = useMemo<Resources>(() => {
    const materials = createMaterials()
    const oled = createOledDisplay()

    // Wired here, in the memo, not in an effect. Child effects run before the
    // parent's, and one of them clones these materials for callout dimming — a
    // map attached later never reaches the clone, which is why the display stayed
    // dark no matter what drove it.
    materials.oledPanel.emissiveMap = oled.texture
    materials.oledPanel.needsUpdate = true

    return {
      materials,
      oled,
      engraving: createEngravingTexture(),
      sprite: createSoftSprite(),
      emphasis: new EmphasisController(),
      finish: new FinishAnimator(materials.titanium, materials.polished, 'RAW'),
    }
    // Built once for the life of the canvas: adaptive quality changes the render
    // path, never the materials, so nothing here needs rebuilding.
  }, [])

  useEffect(() => {
    return () => {
      resources.materials.dispose()
      resources.oled.dispose()
      resources.engraving.dispose()
      resources.sprite.dispose()
      resources.emphasis.dispose()
    }
  }, [resources])

  return <ResourceContext.Provider value={resources}>{children}</ResourceContext.Provider>
}
