'use client'

import { useCallback } from 'react'
import { Preload } from '@react-three/drei'
import { useExperience } from '@/state/experience'
import { flags } from '@/lib/aethr/debugFlags'
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality'
import { PoseProvider } from './PoseProvider'
import { ResourceProvider } from './ResourceProvider'
import { StudioEnvironment } from './StudioEnvironment'
import { LightingRig } from './LightingRig'
import { CameraRig } from './CameraRig'
import { StudioFloor } from './StudioFloor'
import { ProductModel } from './ProductModel'
import { ThermalCutaway } from './ThermalCutaway'
import { AethrCharge } from './AethrCharge'
import { LiquidStreams } from './LiquidStreams'
import { HeatRays, SteamSystem, VacuumMotes } from './Atmospherics'
import { DropStage } from './DropStage'
import { Director } from './Director'
import { Effects } from './Effects'
import { PerfProbe } from './PerfProbe'
import { ShaderWarmup } from './ShaderWarmup'

/**
 * Everything inside the single Canvas (spec §18: one canvas for the whole story).
 */
export function Scene() {
  const quality = useExperience((s) => s.quality)
  const setLoaded = useExperience((s) => s.setLoaded)
  useAdaptiveQuality()

  const handleReady = useCallback(() => setLoaded(true), [setLoaded])

  return (
    <ResourceProvider>
      <PoseProvider>
        {flags.environment && <StudioEnvironment resolution={quality === 'high' ? 256 : 128} />}
        <LightingRig />
        <CameraRig />
        <StudioFloor />

        <DropStage>
          <ProductModel />
        </DropStage>

        <ThermalCutaway />
        <AethrCharge />

        <LiquidStreams />
        <SteamSystem />
        <HeatRays />
        <VacuumMotes />

        <Director onReady={handleReady} />
        <Effects />
        {process.env.NODE_ENV !== 'production' && <PerfProbe />}

        <Preload all />
        <ShaderWarmup />
      </PoseProvider>
    </ResourceProvider>
  )
}
