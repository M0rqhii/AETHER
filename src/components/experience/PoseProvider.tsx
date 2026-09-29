'use client'

import { createContext, useContext, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { computePose, createPose, type Pose } from '@/lib/aethr/pose'
import { scroll } from '@/state/experience'

interface PoseContextValue {
  pose: Pose
  /** Boxed so consumers can read the live value without re-rendering. */
  progress: { value: number }
}

const PoseContext = createContext<PoseContextValue | null>(null)

export function usePose(): PoseContextValue {
  const ctx = useContext(PoseContext)
  if (!ctx) throw new Error('usePose must be used inside <PoseProvider>')
  return ctx
}

/**
 * Computes the scene pose exactly once per frame, ahead of every consumer.
 *
 * The negative render priority keeps R3F's automatic render loop intact while
 * guaranteeing this runs before any component that reads the pose.
 */
export function PoseProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<PoseContextValue>(() => ({ pose: createPose(), progress: { value: 0 } }), [])

  useFrame(() => {
    value.progress.value = scroll.progress
    computePose(scroll.progress, value.pose)
  }, -100)

  return <PoseContext.Provider value={value}>{children}</PoseContext.Provider>
}
