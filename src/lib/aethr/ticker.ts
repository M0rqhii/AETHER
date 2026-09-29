'use client'

/**
 * The single rAF loop that advances global progress and drives every
 * progress-reactive piece of DOM.
 *
 * Overlay elements never re-render on scroll — they subscribe here and write
 * styles directly on their own refs (spec §169, §170).
 */
import { scroll } from '@/state/experience'
import { damp } from './math'

export type Reactor = (progress: number, dt: number) => void

const reactors = new Set<Reactor>()
let rafId = 0
let last = 0

/**
 * Written by the scroll driver; `scroll.progress` chases it.
 *
 * `smoothing` is the exponential rate of that chase: 6 puts the time constant at
 * roughly 165 ms, enough that a notched wheel or a trackpad flick arrives as one
 * continuous move rather than as a series of steps, and short enough that the
 * product never feels detached from the scrollbar.
 */
export const scrollTarget = { progress: 0, immediate: true, smoothing: 6 }

function frame(now: number) {
  const dt = last === 0 ? 1 / 60 : Math.min(0.05, (now - last) / 1000)
  last = now

  if (scrollTarget.immediate) {
    // Deep-link or refresh mid-page: adopt the pose without a visible slide.
    scroll.velocity = 0
    scroll.progress = scrollTarget.progress
    scrollTarget.immediate = false
    scroll.primed = true
    scroll.snapToken++
  } else {
    const next = damp(scroll.progress, scrollTarget.progress, scrollTarget.smoothing, dt)
    scroll.velocity = (next - scroll.progress) / dt
    scroll.progress = next
  }

  for (const r of reactors) r(scroll.progress, dt)
  rafId = requestAnimationFrame(frame)
}

export function addReactor(fn: Reactor): () => void {
  reactors.add(fn)
  if (rafId === 0) {
    last = 0
    rafId = requestAnimationFrame(frame)
  }
  // Run once immediately so first paint already matches the current scroll.
  fn(scroll.progress, 1 / 60)
  return () => {
    reactors.delete(fn)
    if (reactors.size === 0 && rafId !== 0) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }
}
