'use client'

import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { BRAND } from '@/lib/aethr/copy'
import { useExperience } from '@/state/experience'

const RADIUS = 46
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Loading screen — spec §17.
 *
 * The counter tracks real asset loading through three's loading manager; the last
 * step waits for the scene to actually mount, so 100 means ready rather than
 * "the fetch finished". At 100 the ring resolves into the idle OLED reading and
 * holds briefly before handing over.
 */
export function LoadingScreen() {
  const { progress, errors } = useProgress()
  const loaded = useExperience((s) => s.loaded)
  const failed = useExperience((s) => s.failed)
  const setLoadProgress = useExperience((s) => s.setLoadProgress)

  const [display, setDisplay] = useState(0)
  const [complete, setComplete] = useState(false)
  const [gone, setGone] = useState(false)
  const raf = useRef(0)

  // Ease the counter so it never jitters backwards on a cached reload.
  useEffect(() => {
    const target = loaded ? 100 : Math.min(progress, 97)
    const tick = () => {
      setDisplay((current) => {
        const next = current + (target - current) * 0.14
        return Math.abs(target - next) < 0.4 ? target : next
      })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [progress, loaded])

  useEffect(() => {
    setLoadProgress(display)
  }, [display, setLoadProgress])

  useEffect(() => {
    if (!loaded || display < 99.5) return
    // Hold on the idle reading, then hand over to the first scene (spec §17).
    const a = window.setTimeout(() => setComplete(true), 320)
    const b = window.setTimeout(() => setGone(true), 1180)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
    }
  }, [loaded, display])

  if (gone || failed) return null

  const value = Math.round(display)
  const dash = CIRCUMFERENCE * (1 - value / 100)

  return (
    <div className={`loader ${complete ? 'loader--out' : ''}`} role="status" aria-live="polite">
      <div className="loader__inner">
        <p className="loader__brand display">{BRAND.name}</p>

        <div className="loader__ring">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r={RADIUS} className="loader__track" />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              className="loader__value"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dash}
            />
          </svg>
          <span className="loader__count mono">{complete ? '--°' : String(value).padStart(2, '0')}</span>
        </div>

        <p className="loader__label mono">
          {errors.length > 0 ? '3D experience unavailable' : 'Initializing experience'}
        </p>
        <span className="sr-only">{`Loading ${value} percent`}</span>
      </div>
    </div>
  )
}
