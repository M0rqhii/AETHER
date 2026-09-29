'use client'

import { ArrowDown } from 'lucide-react'
import { PHASE, chapter, sub } from '@/lib/aethr/chapters'
import { BRAND, TITLES } from '@/lib/aethr/copy'
import { ScrollReveal } from './ScrollReveal'

const P = PHASE

/** Three words, three light states, one at a time (spec §41). */
function WordStack({ words, range, className }: { words: readonly string[]; range: readonly [number, number]; className?: string }) {
  const [a, b] = range
  const step = (b - a) / words.length
  return (
    <div className={`stack ${className ?? ''}`}>
      {words.map((word, i) => (
        <ScrollReveal
          key={word}
          range={[a + step * i, a + step * (i + 1.02)]}
          fadeIn={0.3}
          fadeOut={0.3}
          rise={22}
          className="stack__word display"
        >
          {word}
        </ScrollReveal>
      ))}
    </div>
  )
}

/**
 * All scroll-driven typography.
 *
 * Every block is present in the DOM for screen readers and search engines; only
 * opacity and a few pixels of travel are animated (spec §113, §163).
 */
export function Titles() {
  return (
    <div className="titles" aria-hidden="false">
      {/* 01 — Reveal ---------------------------------------------------- */}
      {/* The landing frame is authored, not empty. Every block here opens at zero
          progress, so the first viewport carries the name, the category, the line
          and a way in before a single pixel has been scrolled; the staggered entry
          is a one-shot intro on load (`hero--intro`) rather than something the
          reader has to scroll to earn. Scroll then drives only the exit. */}
      <div className="titles__center">
        <div className="hero hero--intro">
          <h1 className="hero__wordmark display">
            <ScrollReveal as="span" range={[0, P.heroPush[1]]} fadeOut={0.3} rise={0}>
              {BRAND.name}
            </ScrollReveal>
            <ScrollReveal as="span" range={[0, P.heroPush[1]]} fadeOut={0.3} rise={0} className="hero__one">
              One
            </ScrollReveal>
          </h1>
          <ScrollReveal range={[0, P.heroPush[1]]} fadeOut={0.34} rise={0} className="hero__meta">
            <p className="mono">{BRAND.category}</p>
            <p className="hero__tagline">{BRAND.tagline}</p>
          </ScrollReveal>
        </div>
      </div>

      {/* Scroll hint (spec §24) */}
      <ScrollReveal
        range={[0, chapter('inspection').start + 0.006]}
        fadeOut={0.4}
        rise={0}
        className="scroll-hint mono hero--intro"
      >
        <span>Scroll to explore</span>
        <ArrowDown size={16} strokeWidth={1.6} aria-hidden="true" />
      </ScrollReveal>

      {/* 02 — Inspection ------------------------------------------------ */}
      <ScrollReveal range={P.inspectMaterial} fadeIn={0.24} fadeOut={0.3} className="corner corner--bottom-left">
        <h2 className="heading">{TITLES.material}</h2>
        <p className="body-copy">{TITLES.materialSub}</p>
      </ScrollReveal>

      <ScrollReveal range={P.inspectMonogram} fadeIn={0.28} fadeOut={0.32} className="corner corner--bottom-left">
        <p className="mono mono--dim">AETHR ONE / A01</p>
      </ScrollReveal>

      <ScrollReveal range={P.inspectUnderside} fadeIn={0.28} fadeOut={0.34} className="corner corner--bottom-left">
        <p className="mono mono--dim">750 ML · Precision base · Anti-slip ring</p>
      </ScrollReveal>

      {/* 03 — Smart Crown ----------------------------------------------- */}
      <ScrollReveal range={[P.crownIntro[0], P.crownUnscrew[0] + 0.004]} fadeIn={0.26} fadeOut={0.3} className="corner corner--left">
        <h2 className="heading">{TITLES.crown}</h2>
        <p className="body-copy">{TITLES.crownSub}</p>
      </ScrollReveal>

      <div className="titles__center">
        <ScrollReveal range={P.crownInside} fadeIn={0.26} fadeOut={0.3} className="statement display">
          {TITLES.inside}
        </ScrollReveal>
      </div>

      {/* 04 — Crown architecture ---------------------------------------- */}
      <ScrollReveal range={[P.explodeIntro[0], P.calloutOled[0] + 0.004]} fadeIn={0.24} fadeOut={0.3} className="corner corner--top-left">
        <h2 className="heading heading--lg">{TITLES.crownArchitecture}</h2>
      </ScrollReveal>

      {/* 05 — Thermal intro --------------------------------------------- */}
      <div className="titles__center">
        <WordStack words={TITLES.thermalWords} range={P.thermalWords} />
      </div>

      <ScrollReveal range={P.coldHold} fadeIn={0.26} fadeOut={0.3} className="corner corner--left">
        <h2 className="heading heading--lg">{TITLES.coldHold}</h2>
        <p className="mono mono--dim">{TITLES.coldHoldSub}</p>
      </ScrollReveal>

      {/* 07 — Thermal architecture --------------------------------------- */}
      <ScrollReveal range={[P.thermalIntro[0], P.thermalPeel[1]]} fadeIn={0.22} fadeOut={0.3} className="corner corner--top-left">
        <h2 className="heading heading--lg">{TITLES.thermalArchitecture}</h2>
      </ScrollReveal>

      <div className="titles__center">
        <WordStack words={TITLES.layers} range={P.thermalLayers} className="stack--tight" />
      </div>

      {/* 08 — Time compression ------------------------------------------- */}
      <div className="titles__center">
        <ScrollReveal range={P.timeStillHot} fadeIn={0.26} fadeOut={0.3} className="statement statement--xl display">
          {TITLES.stillHot}
        </ScrollReveal>
      </div>

      {/* 09 — AETHR CHARGE ------------------------------------------------ */}
      <ScrollReveal range={[P.chargeReveal[0], P.chargeDock[0] + 0.006]} fadeIn={0.24} fadeOut={0.32} className="corner corner--top-left">
        <h2 className="heading heading--lg">{TITLES.charge}</h2>
        <p className="mono mono--dim">{TITLES.chargeSub}</p>
      </ScrollReveal>

      <ScrollReveal range={P.chargeUsbC} fadeIn={0.3} fadeOut={0.34} className="corner corner--bottom-left">
        <p className="mono mono--dim">USB-C input</p>
      </ScrollReveal>

      <div className="titles__center">
        <WordStack words={TITLES.chargeConclusion} range={P.chargeConclusion} className="stack--tight" />
      </div>

      {/* 10 — Materials --------------------------------------------------- */}
      <ScrollReveal range={[P.materialsIntro[0], P.materialsSelect[0] + 0.008]} fadeIn={0.26} fadeOut={0.34} className="corner corner--top">
        <h2 className="heading heading--lg">{TITLES.materials}</h2>
      </ScrollReveal>

      <ScrollReveal range={P.materialsMacro} fadeIn={0.26} fadeOut={0.3} className="corner corner--bottom-left">
        <h2 className="heading">{TITLES.materialMacro}</h2>
      </ScrollReveal>

      {/* 11 — Personalization --------------------------------------------- */}
      <ScrollReveal range={[P.engravingIntro[0], P.engraving[0] + 0.008]} fadeIn={0.26} fadeOut={0.34} className="corner corner--top-left">
        <h2 className="heading heading--lg">{TITLES.personalization}</h2>
      </ScrollReveal>

      <div className="titles__center">
        <ScrollReveal range={P.grabIt} fadeIn={0.3} fadeOut={0.3} className="statement statement--xl display">
          {TITLES.grab}
        </ScrollReveal>
      </div>

      {/* 12 — Drop test ---------------------------------------------------- */}
      <div className="titles__center">
        <ScrollReveal range={P.dropIntro} fadeIn={0.3} fadeOut={0.3} className="statement statement--xl display">
          {TITLES.drop}
        </ScrollReveal>
      </div>

      {/* 13 — Finale ------------------------------------------------------- */}
      <ScrollReveal range={sub('finale', 0.26, 1)} fadeIn={0.18} fadeOut={0.02} className="finale">
        <h2 className="finale__wordmark display">{BRAND.product}</h2>
        <p className="finale__tagline">{BRAND.tagline}</p>
      </ScrollReveal>
    </div>
  )
}
