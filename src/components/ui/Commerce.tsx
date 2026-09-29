'use client'

import { Check, Minus, Plus, ShoppingBag, SlidersHorizontal, X } from 'lucide-react'
import { PHASE, chapter, sub } from '@/lib/aethr/chapters'
import { BRAND, FICTION_NOTICE, FOOTER } from '@/lib/aethr/copy'
import { FINISHES, FINISH_IDS } from '@/lib/aethr/materials'
import { PRICE_EUR } from '@/lib/aethr/constants'
import { scrollToProgress } from '@/hooks/useScrollDriver'
import { useExperience } from '@/state/experience'
import { ScrollReveal } from './ScrollReveal'

const euro = (n: number) => `€${n.toLocaleString('en-IE')}`

/* ==========================================================================
   Final hero metadata + CTA — spec §88, §89
   ========================================================================== */

export function FinaleCta() {
  const finish = useExperience((s) => s.config.finish)
  const toggleConfigurator = useExperience((s) => s.toggleConfigurator)

  return (
    <ScrollReveal range={sub('finale', 0.5, 1)} fadeIn={0.14} fadeOut={0.02} rise={16} className="finale-cta">
      <ul className="finale-cta__meta mono">
        <li>750 ml</li>
        <li>{FINISHES[finish].label} titanium</li>
        <li>{euro(PRICE_EUR)}</li>
      </ul>
      <div className="finale-cta__buttons">
        <button className="btn btn--primary" onClick={() => toggleConfigurator(true)}>
          <SlidersHorizontal size={15} strokeWidth={1.7} aria-hidden="true" />
          Configure yours
        </button>
        <button className="btn btn--secondary" onClick={() => scrollToProgress(0)}>
          Explore again
        </button>
      </div>
    </ScrollReveal>
  )
}

/* ==========================================================================
   Configurator — spec §90
   ========================================================================== */

export function Configurator() {
  const open = useExperience((s) => s.configuratorOpen)
  const toggle = useExperience((s) => s.toggleConfigurator)
  const config = useExperience((s) => s.config)
  const setFinish = useExperience((s) => s.setFinish)
  const setEngraving = useExperience((s) => s.setEngraving)
  const setQuantity = useExperience((s) => s.setQuantity)
  const addToBag = useExperience((s) => s.addToBag)

  return (
    <div className={`sheet ${open ? 'sheet--open' : ''}`} role="dialog" aria-modal="true" aria-label="Configure AETHR ONE" hidden={!open}>
      <div className="sheet__inner">
        <header>
          <p className="mono mono--dim">Configure</p>
          <button className="icon-btn" onClick={() => toggle(false)} aria-label="Close configurator">
            <X size={19} strokeWidth={1.6} />
          </button>
        </header>

        <h2 className="sheet__product">{BRAND.product}</h2>
        <p className="mono mono--dim">{BRAND.category}</p>

        <section>
          <h3 className="mono mono--dim">Finish</h3>
          <div className="sheet__finishes">
            {FINISH_IDS.map((id) => (
              <button
                key={id}
                onClick={() => setFinish(id)}
                className={config.finish === id ? 'is-active' : undefined}
                aria-pressed={config.finish === id}
              >
                <span className="finish-select__swatch" style={{ background: FINISHES[id].swatch }} aria-hidden="true" />
                <span className="mono">{id}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mono mono--dim">Engraving</h3>
          <input
            type="text"
            value={config.engraving}
            maxLength={16}
            placeholder="None"
            aria-label="Engraving text"
            onChange={(e) => setEngraving(e.target.value)}
          />
        </section>

        <section>
          <h3 className="mono mono--dim">Quantity</h3>
          <div className="stepper">
            <button onClick={() => setQuantity(config.quantity - 1)} aria-label="Decrease quantity" disabled={config.quantity <= 1}>
              <Minus size={15} strokeWidth={1.8} />
            </button>
            <span aria-live="polite">{config.quantity}</span>
            <button onClick={() => setQuantity(config.quantity + 1)} aria-label="Increase quantity">
              <Plus size={15} strokeWidth={1.8} />
            </button>
          </div>
        </section>

        <footer>
          <p className="sheet__price">{euro(PRICE_EUR * config.quantity)}</p>
          <button className="btn btn--primary" onClick={addToBag}>
            <ShoppingBag size={15} strokeWidth={1.7} aria-hidden="true" />
            Add to bag
          </button>
        </footer>

        <p className="sheet__notice">{FICTION_NOTICE}</p>
      </div>
    </div>
  )
}

/* ==========================================================================
   Cart drawer — spec §91
   ========================================================================== */

export function CartDrawer() {
  const open = useExperience((s) => s.cartOpen)
  const toggle = useExperience((s) => s.toggleCart)
  const config = useExperience((s) => s.config)
  const bagCount = useExperience((s) => s.bagCount)

  return (
    <div className={`drawer ${open ? 'drawer--open' : ''}`} role="dialog" aria-modal="true" aria-label="Bag" hidden={!open}>
      <header>
        <p className="mono mono--dim">Bag</p>
        <button className="icon-btn" onClick={() => toggle(false)} aria-label="Close bag">
          <X size={19} strokeWidth={1.6} />
        </button>
      </header>

      {bagCount === 0 ? (
        <p className="drawer__empty">Your bag is empty.</p>
      ) : (
        <>
          <div className="drawer__item">
            <div className="drawer__thumb" style={{ background: FINISHES[config.finish].swatch }} aria-hidden="true">
              <span className="mono">A</span>
            </div>
            <div>
              <p className="drawer__name">{BRAND.product}</p>
              <p className="mono mono--dim">{FINISHES[config.finish].label} · 750 ml</p>
              {config.engraving && config.engravingMode !== 'none' && (
                <p className="mono mono--dim">Engraved “{config.engraving}”</p>
              )}
              <p className="mono mono--dim">Qty {bagCount}</p>
            </div>
            <p className="drawer__price">{euro(PRICE_EUR * bagCount)}</p>
          </div>

          <button className="btn btn--primary drawer__checkout" disabled>
            <Check size={15} strokeWidth={1.7} aria-hidden="true" />
            Checkout
          </button>
        </>
      )}

      <p className="drawer__notice">Demo experience — no purchase will be processed.</p>
    </div>
  )
}

/* ==========================================================================
   Footer — spec §92. The fictional-product line is required for deployment.
   ========================================================================== */

export function SiteFooter() {
  return (
    <ScrollReveal range={sub('finale', 0.72, 1)} fadeIn={0.2} fadeOut={0.02} rise={12} className="site-footer" as="footer">
      <div className="site-footer__brand">
        <p className="display">{FOOTER.brand}</p>
        <p className="mono mono--dim">{FOOTER.division}</p>
      </div>
      <ul className="site-footer__links mono">
        {FOOTER.links.map((link) => (
          <li key={link}>
            <button type="button">{link}</button>
          </li>
        ))}
      </ul>
      <div className="site-footer__legal">
        <p className="mono mono--dim">{FOOTER.place}</p>
        <p className="mono">{FOOTER.notice}</p>
      </div>
    </ScrollReveal>
  )
}

/**
 * States the fiction up front, then gets out of the way — the footer carries it
 * again at the end (spec §200), so it never competes for attention mid-story.
 */
export function FictionBadge() {
  return (
    <ScrollReveal
      range={[PHASE.heroOled[0], chapter('inspection').start + 0.012]}
      fadeIn={0.16}
      fadeOut={0.3}
      rise={0}
      className="fiction-badge mono"
    >
      A fictional product experience
    </ScrollReveal>
  )
}
