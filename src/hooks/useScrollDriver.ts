'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollTarget } from '@/lib/aethr/ticker'
import { CHAPTERS, PHASE } from '@/lib/aethr/chapters'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Maps the document scrollbar onto global normalized progress.
 *
 * ScrollTrigger owns measurement and refresh; the deterministic scene state is
 * derived from `self.progress` alone, so flinging, dragging the scrollbar and
 * reloading mid-page all land on exactly the same pose (spec §124, §172, §173).
 */
export function useScrollDriver(el: HTMLElement | null) {
  useEffect(() => {
    // Takes the element itself, not a ref: the spacer only mounts once the
    // renderer check has resolved, and an effect keyed on a ref object would have
    // already run — and bailed — while `ref.current` was still null.
    if (!el) return

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        scrollTarget.progress = self.progress
      },
      onRefresh: (self) => {
        // Resize must not throw away the reader's position (spec §171).
        scrollTarget.progress = self.progress
        scrollTarget.immediate = true
      },
    })

    // Fonts settling changes layout height; re-measure once they land.
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {})

    // Development-only bridge so visual QA can land on an exact chapter without
    // waiting out the scroll damping. Stripped from production builds.
    if (process.env.NODE_ENV !== 'production') {
      ;(window as unknown as { __aethr?: unknown }).__aethr = {
        seek(p: number) {
          const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
          window.scrollTo({ top: p * max, behavior: 'auto' })
          // Flush ScrollTrigger first, then assert the exact value — otherwise its
          // own update lands afterwards and overwrites the requested position.
          ScrollTrigger.update()
          scrollTarget.progress = p
          scrollTarget.immediate = true
        },
        get progress() {
          return scrollTarget.progress
        },
        /** Lets QA tooling land in the middle of a phase instead of guessing numbers. */
        phases: PHASE,
        chapters: CHAPTERS,
      }
    }

    return () => {
      trigger.kill()
    }
  }, [el])
}

/** Scrolls to a normalized progress value. Used by nav links and "explore again". */
export function scrollToProgress(p: number, opts: { instant?: boolean } = {}) {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  window.scrollTo({ top: Math.max(0, Math.min(max, p * max)), behavior: opts.instant ? 'auto' : 'smooth' })
}
