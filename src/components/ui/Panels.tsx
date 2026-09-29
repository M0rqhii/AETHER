'use client'

import { useRef, type RefObject } from 'react'
import { PenLine, RotateCcw } from 'lucide-react'
import { PHASE, chapter, local, type Range } from '@/lib/aethr/chapters'
import { FINISHES, FINISH_IDS, type FinishId } from '@/lib/aethr/materials'
import { formatClock, formatTemp, getThermalState, thermalProgressAt, THERMAL_OVERLAY } from '@/lib/aethr/thermal'
import { TITLES } from '@/lib/aethr/copy'
import { clamp, smoothstep } from '@/lib/aethr/math'
import { useProgressEffect } from '@/hooks/useProgressEffect'
import { useExperience } from '@/state/experience'
import { ScrollReveal } from './ScrollReveal'
import type { EngravingMode } from '@/lib/aethr/textures'

/* ==========================================================================
   Live thermal test — spec §48, §49
   ========================================================================== */

/**
 * The two windows where the reading *is* the shot rather than an annotation on
 * someone else's: the moment the hot fill is sealed, and the 24-hour compression.
 */
const HERO_WINDOWS: Array<[string, Range]> = [
  ['seal', [PHASE.hotSeal[1], chapter('hot').end]],
  ['compress', [PHASE.timeCompress[0], PHASE.timeStillHot[0]]],
]

/** Writes the live reading into two nodes, touching them only when it changes. */
function useReadout(temp: RefObject<HTMLElement | null>, clock: RefObject<HTMLElement | null>) {
  const lastTemp = useRef('')
  const lastClock = useRef('')

  useProgressEffect((p) => {
    const state = getThermalState(thermalProgressAt(p))
    const d = formatTemp(state.temperature)
    if (d !== lastTemp.current && temp.current) {
      lastTemp.current = d
      temp.current.textContent = d
    }
    const c = formatClock(state.seconds)
    if (c !== lastClock.current && clock.current) {
      lastClock.current = c
      clock.current.textContent = c
    }
  }, [])
}

export function ThermalTimer() {
  const root = useRef<HTMLDivElement>(null)
  const clock = useRef<HTMLParagraphElement>(null)
  const temp = useRef<HTMLParagraphElement>(null)
  const visible = useRef(false)

  useReadout(temp, clock)

  useProgressEffect((p) => {
    const el = root.current
    if (!el) return

    const t = local(p, THERMAL_OVERLAY)
    let opacity = t <= 0 || t >= 1 ? 0 : smoothstep(clamp(t / 0.06)) * (1 - smoothstep(clamp((t - 0.9) / 0.1)))

    // Hands over to the centred readout rather than being on screen twice.
    for (const [, range] of HERO_WINDOWS) {
      const h = local(p, [range[0] - 0.004, range[1] + 0.004])
      if (h > 0 && h < 1) opacity *= 1 - smoothstep(clamp(h / 0.12)) * (1 - smoothstep(clamp((h - 0.88) / 0.12)))
    }

    const on = opacity > 0.01
    if (on !== visible.current) {
      visible.current = on
      el.style.visibility = on ? 'visible' : 'hidden'
    }
    if (on) el.style.opacity = opacity.toFixed(3)
  }, [])

  return (
    <div ref={root} className="thermal-timer" style={{ opacity: 0, visibility: 'hidden' }}>
      <p className="mono mono--dim">Live thermal test</p>
      <p ref={temp} className="thermal-timer__temp">
        96°C
      </p>
      <p ref={clock} className="thermal-timer__clock mono">
        00:00:00
      </p>
    </div>
  )
}

/**
 * The centred reading.
 *
 * A separate block rather than a class on the corner timer: switching a class
 * moved it from one side of the screen to the other and changed its type size in
 * a single frame, which read as the number teleporting in. As its own block it
 * gets the same fade-and-rise every other headline on the page gets.
 */
function ThermalHero({ range }: { range: Range }) {
  const clock = useRef<HTMLParagraphElement>(null)
  const temp = useRef<HTMLParagraphElement>(null)
  useReadout(temp, clock)

  return (
    <ScrollReveal range={range} fadeIn={0.22} fadeOut={0.24} rise={26} className="thermal-hero">
      <p className="mono mono--dim">Live thermal test</p>
      <p ref={temp} className="thermal-hero__temp">
        96°C
      </p>
      <p ref={clock} className="thermal-hero__clock mono">
        00:00:00
      </p>
    </ScrollReveal>
  )
}

export function ThermalHeroes() {
  return (
    <>
      {HERO_WINDOWS.map(([id, range]) => (
        <ThermalHero key={id} range={range} />
      ))}
    </>
  )
}

/** Water needs a reading, not a card (spec §52). */
export function CoreTemperature() {
  const value = useRef<HTMLSpanElement>(null)
  const last = useRef('')

  useProgressEffect((p) => {
    const state = getThermalState(thermalProgressAt(p))
    const text = formatTemp(state.temperature)
    if (text !== last.current && value.current) {
      last.current = text
      value.current.textContent = text
    }
  }, [])

  return (
    <ScrollReveal range={PHASE.thermalWater} fadeIn={0.26} fadeOut={0.3} className="core-temp">
      <p className="mono mono--dim">Core temperature</p>
      <p className="core-temp__value">
        <span ref={value}>94°C</span>
      </p>
    </ScrollReveal>
  )
}

/* ==========================================================================
   Material selector — spec §75
   ========================================================================== */

export function MaterialSelector() {
  const finish = useExperience((s) => s.config.finish)
  const setFinish = useExperience((s) => s.setFinish)

  return (
    <ScrollReveal
      range={[PHASE.materialsSelect[0], chapter('personalization').end]}
      fadeIn={0.08}
      fadeOut={0.06}
      rise={12}
      className="finish-select"
    >
      <fieldset>
        <legend className="sr-only">Finish</legend>
        {FINISH_IDS.map((id: FinishId) => (
          <label key={id} className={finish === id ? 'is-active' : undefined}>
            <input
              type="radio"
              name="finish"
              value={id}
              checked={finish === id}
              onChange={() => setFinish(id)}
              className="sr-only"
            />
            <span className="finish-select__swatch" style={{ background: FINISHES[id].swatch }} aria-hidden="true" />
            <span className="mono">{id}</span>
          </label>
        ))}
      </fieldset>
    </ScrollReveal>
  )
}

/* ==========================================================================
   Engraving — spec §80, §81
   ========================================================================== */

const MODES: Array<{ id: EngravingMode; label: string }> = [
  { id: 'vertical', label: 'Vertical' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'monogram', label: 'Monogram' },
]

export function EngravingPanel() {
  const engraving = useExperience((s) => s.config.engraving)
  const mode = useExperience((s) => s.config.engravingMode)
  const setEngraving = useExperience((s) => s.setEngraving)
  const setEngravingMode = useExperience((s) => s.setEngravingMode)

  return (
    <ScrollReveal range={PHASE.engraving} fadeIn={0.12} fadeOut={0.12} rise={14} className="engraving">
      <p className="mono mono--dim">
        <PenLine size={13} strokeWidth={1.6} aria-hidden="true" /> Engraving
      </p>

      <input
        type="text"
        value={engraving}
        maxLength={16}
        placeholder="Your mark"
        aria-label="Engraving text, up to 16 characters"
        onChange={(e) => setEngraving(e.target.value)}
      />

      <div className="segmented" role="group" aria-label="Engraving style">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setEngravingMode(m.id)}
            className={mode === m.id ? 'is-active' : undefined}
            aria-pressed={mode === m.id}
          >
            {m.label}
          </button>
        ))}
      </div>

      <p className="engraving__note mono mono--dim">Etched, not printed. Up to 16 characters.</p>
    </ScrollReveal>
  )
}

/* ==========================================================================
   Drop test — spec §86, §87
   ========================================================================== */

export function DropPanel() {
  const settled = useExperience((s) => s.dropSettled)
  const released = useExperience((s) => s.dropReleased)
  const resetDrop = useExperience((s) => s.resetDrop)

  // No blackout: the bottle now rights itself and travels back under its own
  // steam, which is worth watching. Cutting to black and teleporting it was the
  // reason the reset read as the product blinking into place (spec §87 option 2).
  return (
    <>
      <ScrollReveal range={PHASE.dropActive} fadeIn={0.06} fadeOut={0.06} rise={12} className="drop-panel">
        {settled ? (
          <>
            <p className="mono mono--dim">{TITLES.impact}</p>
            <p className="drop-panel__result">{TITLES.impactResult}</p>
            <button className="btn btn--secondary btn--sm" onClick={resetDrop}>
              <RotateCcw size={14} strokeWidth={1.7} aria-hidden="true" />
              Reset test
            </button>
          </>
        ) : (
          <p className="mono mono--dim">{released ? 'Impact in progress' : 'Drag the vessel, then let go'}</p>
        )}
      </ScrollReveal>
    </>
  )
}

