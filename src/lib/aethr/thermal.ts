/**
 * The live thermal test.
 *
 * `getThermalState` is a pure mapping from progress to (seconds, °C) with no side
 * effects, which is exactly what makes the timer reverse correctly when the user
 * scrolls back (spec §49, §139).
 */
import { PHASE, type Range, local } from './chapters'
import { sampleKeyframes, smoothstep } from './math'

/** Spec §49 keyframes: [progress, seconds] and [progress, °C]. */
const TIME_KEYS = [
  [0.0, 0],
  [0.2, 60 * 60],
  [0.45, 4 * 3600],
  [0.65, 9 * 3600],
  [0.8, 12 * 3600],
  [0.92, 18 * 3600],
  [1.0, 24 * 3600],
] as const

const TEMP_KEYS = [
  [0.0, 96],
  [0.2, 94],
  [0.45, 91],
  [0.65, 80],
  [0.8, 75],
  [0.92, 65],
  [1.0, 58],
] as const

export interface ThermalState {
  seconds: number
  temperature: number
}

export function getThermalState(progress: number): ThermalState {
  return {
    seconds: sampleKeyframes(TIME_KEYS, progress),
    temperature: sampleKeyframes(TEMP_KEYS, progress),
  }
}

/**
 * The test runs from the instant the crown seals the bottle (spec §46) until the
 * end of time compression, then freezes at 24:00:00 / 58 °C while the bottle is
 * opened and poured (spec §62).
 */
export const THERMAL_TEST: Range = [PHASE.hotSeal[1], PHASE.timeCompress[1]]

/** Overlay stays up from sealing until the match cut into AETHR CHARGE. */
export const THERMAL_OVERLAY: Range = [PHASE.hotSeal[0], PHASE.chargeMatchCut[1]]

export function thermalProgressAt(p: number): number {
  return local(p, THERMAL_TEST)
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`
}

export function formatTemp(celsius: number): string {
  return `${Math.round(celsius)}°C`
}

/**
 * Core water temperature shown during the thermal-architecture chapter (spec §52).
 * Slightly ahead of the shell reading, which is the point of the whole story.
 */
export function coreTemperatureAt(p: number): number {
  return getThermalState(thermalProgressAt(p)).temperature
}

/** Opacity of the heat-flow visualisation: strongest while the low-E callout runs. */
export function heatFlowIntensity(p: number): number {
  const rise = smoothstep(local(p, PHASE.thermalWater))
  const fall = 1 - smoothstep(local(p, PHASE.thermalShell))
  return rise * fall
}
