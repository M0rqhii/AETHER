'use client'

import { useRef } from 'react'
import { blackoutAt } from '@/lib/aethr/pose'
import { useProgressEffect } from '@/hooks/useProgressEffect'
import { ChapterIndicator, Cursor, Navbar } from './Chrome'
import { Titles } from './Titles'
import { Callouts } from './Callouts'
import { CoreTemperature, DropPanel, EngravingPanel, MaterialSelector, ThermalHeroes, ThermalTimer } from './Panels'
import { CartDrawer, Configurator, FictionBadge, FinaleCta, SiteFooter } from './Commerce'

/** Matches the scene's single scripted cut so DOM and canvas dim together. */
function Blackout() {
  const ref = useRef<HTMLDivElement>(null)
  const on = useRef(false)

  useProgressEffect((p) => {
    const el = ref.current
    if (!el) return
    const v = blackoutAt(p)
    const visible = v > 0.002
    if (visible !== on.current) {
      on.current = visible
      el.style.visibility = visible ? 'visible' : 'hidden'
    }
    if (visible) el.style.opacity = v.toFixed(3)
  }, [])

  return <div ref={ref} className="blackout" aria-hidden="true" style={{ opacity: 0, visibility: 'hidden' }} />
}

/** Every piece of DOM that sits above the canvas. */
export function Overlay() {
  return (
    <div className="overlay-root">
      <Navbar />
      <ChapterIndicator />

      <Titles />
      <Callouts />

      <ThermalTimer />
      <ThermalHeroes />
      <CoreTemperature />
      <MaterialSelector />
      <EngravingPanel />
      <DropPanel />

      <FinaleCta />
      <SiteFooter />
      <FictionBadge />

      <Configurator />
      <CartDrawer />

      <Blackout />
      <Cursor />
    </div>
  )
}
