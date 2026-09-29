'use client'

import Image from 'next/image'
import { ASSETS, PRICE_EUR } from '@/lib/aethr/constants'
import { BRAND, CROWN_CALLOUTS, FICTION_NOTICE, FOOTER, THERMAL_CALLOUTS } from '@/lib/aethr/copy'
import { FINISHES, FINISH_IDS } from '@/lib/aethr/materials'

/**
 * The no-WebGL path — spec §112, §166.
 *
 * Not an apology screen: the approved render, the full technology story and a
 * working call to action. Nobody is ever left looking at a black rectangle.
 */
export interface StaticFallbackProps {
  reason: 'webgl' | 'error' | 'software'
  /** The adapter string, shown so the cause is checkable rather than mysterious. */
  rendererName?: string
  /** Offered only when the 3D path exists but would run badly. */
  onForce3d?: () => void
}

const HEADLINE: Record<StaticFallbackProps['reason'], string> = {
  webgl: '3D experience unavailable',
  error: '3D experience unavailable',
  software: 'Showing the static experience',
}

export function StaticFallback({ reason, rendererName, onForce3d }: StaticFallbackProps) {
  return (
    <main className="static">
      {reason === 'software' && (
        <aside className="static__notice">
          <p>
            This browser is rendering without graphics acceleration, so the interactive 3D version would run at a few
            frames a second and keep a CPU core busy doing it. The full product story is below.
          </p>
          <p className="mono mono--dim">
            Turning on hardware acceleration in your browser settings restores the interactive version.
            {rendererName ? ` Current renderer: ${rendererName}.` : ''}
          </p>
          {onForce3d && (
            <button className="btn btn--secondary btn--sm" onClick={onForce3d}>
              Load it anyway
            </button>
          )}
        </aside>
      )}

      <header className="static__hero">
        <p className="mono mono--dim">{HEADLINE[reason]}</p>
        <h1 className="display static__title">{BRAND.product}</h1>
        <p className="static__category mono">{BRAND.category}</p>
        <p className="static__tagline">{BRAND.tagline}</p>
        <Image
          src={ASSETS.render}
          alt="AETHR ONE precision thermal vessel in raw brushed titanium"
          width={1080}
          height={1440}
          className="static__image"
          priority
        />
      </header>

      <section className="static__section">
        <h2 className="heading">Smart Crown</h2>
        <div className="static__grid">
          {CROWN_CALLOUTS.map((c) => (
            <article key={c.id}>
              <p className="mono mono--dim">{c.index}</p>
              <h3>{c.title}</h3>
              <ul>
                {c.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {c.description && <p>{c.description}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="static__section">
        <h2 className="heading">Thermal architecture</h2>
        <div className="static__grid">
          {THERMAL_CALLOUTS.map((c) => (
            <article key={c.id}>
              <p className="mono mono--dim">{c.index}</p>
              <h3>{c.title}</h3>
              <ul>
                {c.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {c.description && <p>{c.description}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="static__section">
        <h2 className="heading">Finishes</h2>
        <ul className="static__finishes">
          {FINISH_IDS.map((id) => (
            <li key={id}>
              <span className="finish-select__swatch" style={{ background: FINISHES[id].swatch }} aria-hidden="true" />
              <span className="mono">{id}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="static__cta">
        <p className="static__price">{`€${PRICE_EUR}`}</p>
        <a className="btn btn--primary" href="#top">
          Configure yours
        </a>
      </section>

      <footer className="static__footer">
        <p className="display">{FOOTER.brand}</p>
        <p className="mono mono--dim">{FOOTER.division}</p>
        <p className="mono mono--dim">{FOOTER.place}</p>
        <p className="mono">{FOOTER.notice}</p>
        <p className="static__legal">{FICTION_NOTICE}</p>
      </footer>
    </main>
  )
}
