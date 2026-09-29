'use client'

import { useEffect, useRef } from 'react'
import { Menu, ShoppingBag, Volume2, VolumeX, X } from 'lucide-react'
import { CHAPTERS, chapter, type ChapterId } from '@/lib/aethr/chapters'
import { BRAND, NAV } from '@/lib/aethr/copy'
import { useProgressEffect } from '@/hooks/useProgressEffect'
import { scrollToProgress } from '@/hooks/useScrollDriver'
import { useExperience } from '@/state/experience'

/* ==========================================================================
   Navbar — spec §14
   ========================================================================== */

export function Navbar() {
  const menuOpen = useExperience((s) => s.menuOpen)
  const toggleMenu = useExperience((s) => s.toggleMenu)
  const soundEnabled = useExperience((s) => s.soundEnabled)
  const toggleSound = useExperience((s) => s.toggleSound)
  const toggleCart = useExperience((s) => s.toggleCart)
  const bagCount = useExperience((s) => s.bagCount)
  const nav = useRef<HTMLElement>(null)
  const scrolled = useRef(false)

  // Only picks up a background once the scene behind it gets busy (spec §14).
  useProgressEffect((p) => {
    const on = p > 0.015
    if (on === scrolled.current) return
    scrolled.current = on
    nav.current?.classList.toggle('navbar--solid', on)
  }, [])

  const go = (id: string) => {
    toggleMenu(false)
    scrollToProgress(chapter(id as ChapterId).start + 0.004)
  }

  return (
    <>
      <nav ref={nav} className="navbar" aria-label="Primary">
        <button className="navbar__brand" onClick={() => scrollToProgress(0, { instant: false })}>
          {BRAND.name}
        </button>

        <ul className="navbar__links">
          {NAV.map((item) => (
            <li key={item.label}>
              <button onClick={() => go(item.chapter)}>{item.label}</button>
            </li>
          ))}
        </ul>

        <div className="navbar__actions">
          <button
            className="icon-btn"
            onClick={() => toggleSound()}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? <Volume2 size={17} strokeWidth={1.6} /> : <VolumeX size={17} strokeWidth={1.6} />}
          </button>

          <button className="icon-btn icon-btn--bag" onClick={() => toggleCart(true)} aria-label={`Bag, ${bagCount} items`}>
            <ShoppingBag size={17} strokeWidth={1.6} />
            {bagCount > 0 && <span className="icon-btn__badge">{bagCount}</span>}
          </button>

          <button className="icon-btn navbar__menu" onClick={() => toggleMenu(true)} aria-label="Open menu" aria-expanded={menuOpen}>
            <Menu size={18} strokeWidth={1.6} />
          </button>
        </div>
      </nav>

      {/* Mobile menu — spec §187: full screen, restrained, no animation circus. */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" hidden={!menuOpen}>
        <button className="icon-btn mobile-menu__close" onClick={() => toggleMenu(false)} aria-label="Close menu">
          <X size={20} strokeWidth={1.6} />
        </button>
        <ul>
          {NAV.map((item) => (
            <li key={item.label}>
              <button onClick={() => go(item.chapter)}>{item.label}</button>
            </li>
          ))}
        </ul>
        <p className="mono mono--dim">{BRAND.tagline}</p>
      </div>
    </>
  )
}

/* ==========================================================================
   Chapter indicator — spec §15, desktop only
   ========================================================================== */

export function ChapterIndicator() {
  const chapterIndex = useExperience((s) => s.chapterIndex)

  return (
    <nav className="chapters" aria-label="Chapters">
      <ol>
        {CHAPTERS.map((c, i) => (
          <li key={c.id}>
            <button
              className={i === chapterIndex ? 'is-active' : undefined}
              onClick={() => scrollToProgress(c.start + 0.004)}
              aria-current={i === chapterIndex ? 'true' : undefined}
            >
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="chapters__label">{c.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* ==========================================================================
   Cursor — spec §16, desktop only, a dot with an occasional label
   ========================================================================== */

export function Cursor() {
  const label = useExperience((s) => s.cursorLabel)
  const isCoarse = useExperience((s) => s.isCoarsePointer)
  const dot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isCoarse) return
    document.body.dataset.customCursor = 'on'
    const move = (e: PointerEvent) => {
      const el = dot.current
      if (el) el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      delete document.body.dataset.customCursor
    }
  }, [isCoarse])

  if (isCoarse) return null

  return (
    <div ref={dot} className="cursor" aria-hidden="true">
      <span className="cursor__dot" />
      {label && <span className="cursor__label mono">{label}</span>}
    </div>
  )
}
