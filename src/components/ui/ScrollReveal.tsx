'use client'

import { createElement, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'
import type { Range } from '@/lib/aethr/chapters'
import { local } from '@/lib/aethr/chapters'
import { clamp, smoothstep } from '@/lib/aethr/math'
import { useProgressEffect } from '@/hooks/useProgressEffect'

interface ScrollRevealProps {
  /** Global progress window in which this block is on screen. */
  range: Range
  /** Fraction of the window spent fading in / out. */
  fadeIn?: number
  fadeOut?: number
  /** Vertical travel in pixels; the spec keeps text motion small and slow. */
  rise?: number
  className?: string
  style?: CSSProperties
  as?: ElementType
  children: ReactNode
}

/**
 * Scroll-driven visibility for overlay copy.
 *
 * Writes opacity and transform straight onto its own node from the shared ticker —
 * no React state, so a full page of headlines costs nothing per frame (spec §170).
 * `visibility` is toggled too, so hidden text leaves the compositor alone and stays
 * out of the accessibility tree.
 */
export function ScrollReveal({
  range,
  fadeIn = 0.22,
  fadeOut = 0.26,
  rise = 18,
  className,
  style,
  as: Tag = 'div',
  children,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null)
  // Seeded to match the inline style below, not to its opposite. Starting at `true`
  // happened to work only because every block used to be invisible on the first
  // tick: the mismatch is what wrote the first `visibility`. A block that is
  // visible from zero progress found no mismatch and stayed hidden for good.
  const shown = useRef(false)

  useProgressEffect((p) => {
    const el = ref.current
    if (!el) return

    // A window that runs to the end of the page has nothing to fade out into.
    // `local` saturates at 1 on the last pixel of scroll, which blanked the finale
    // wordmark, the price and CTA and the whole footer at exactly the moment they
    // are meant to be sitting still and readable.
    const holdsToEnd = range[1] >= 1
    // The mirror of that at the top: a window opening at zero is the *landing*
    // state, not something to be scrolled into. Faded in from nothing it left the
    // first viewport as a bare product in a void until the reader had scrolled a
    // thousand pixels — the one frame a visitor is guaranteed to see, unauthored.
    const holdsFromStart = range[0] <= 0
    const t = local(p, range)
    const inAmount = holdsFromStart ? 1 : smoothstep(clamp(t / fadeIn))
    const outAmount = holdsToEnd ? 1 : 1 - smoothstep(clamp((t - (1 - fadeOut)) / fadeOut))
    const opacity = (t <= 0 && !holdsFromStart) || (t >= 1 && !holdsToEnd) ? 0 : inAmount * outAmount

    const visible = opacity > 0.004
    if (visible !== shown.current) {
      shown.current = visible
      el.style.visibility = visible ? 'visible' : 'hidden'
      el.setAttribute('aria-hidden', visible ? 'false' : 'true')
    }
    if (!visible) return

    el.style.opacity = opacity.toFixed(3)
    // The individual `translate` property, not `transform`: many of these blocks
    // are centred with `transform: translate(-50%, -50%)` in CSS, and writing
    // `transform` here would wipe that out and shift them off-centre.
    el.style.translate = `0 ${((1 - inAmount) * rise).toFixed(2)}px`
  }, [range[0], range[1], fadeIn, fadeOut, rise])

  // `createElement` keeps the polymorphic `as` prop honest without fighting the
  // union of every intrinsic element's props.
  return createElement(
    Tag,
    {
      ref,
      className,
      style: { opacity: 0, visibility: 'hidden', translate: '0 0', ...style },
      'aria-hidden': 'true',
    },
    children,
  )
}
