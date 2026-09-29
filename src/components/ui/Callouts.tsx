'use client'

import { useEffect, useRef } from 'react'
import { registerConnector } from '@/lib/aethr/anchors'
import { CHARGE_CALLOUTS, CROWN_CALLOUTS, THERMAL_CALLOUTS, type CalloutCopy } from '@/lib/aethr/copy'
import { useExperience } from '@/state/experience'

const ALL: CalloutCopy[] = [...CROWN_CALLOUTS, ...THERMAL_CALLOUTS, ...CHARGE_CALLOUTS]

function Callout({ copy, active }: { copy: CalloutCopy; active: boolean }) {
  const card = useRef<HTMLElement>(null)
  const dot = useRef<SVGCircleElement>(null)
  const line = useRef<SVGPathElement>(null)

  useEffect(() => {
    registerConnector(copy.id, { card: card.current, dot: dot.current, line: line.current })
    return () => registerConnector(copy.id, null)
  }, [copy.id])

  return (
    <>
      {/* The connector is drawn from the real projected 3D anchor every frame. */}
      <svg className="callout-svg" aria-hidden="true">
        <path ref={line} className="callout-svg__line" fill="none" />
        <circle ref={dot} className="callout-svg__dot" r="3.5" />
      </svg>

      <article ref={card} className={`callout ${active ? 'is-active' : ''}`} aria-hidden={!active}>
        <p className="callout__index mono">{copy.index}</p>
        <h3 className="callout__title">{copy.title}</h3>
        <ul className="callout__facts">
          {copy.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
        {copy.description && <p className="callout__description">{copy.description}</p>}
      </article>
    </>
  )
}

/**
 * One active callout at a time (spec §32). Cards live on the right on desktop,
 * where the camera has already composed the product to the left (spec §184); on
 * phones they drop to a bottom card and the connector is allowed to disappear
 * rather than scribble across the screen (spec §109).
 */
export function Callouts() {
  const activeCallout = useExperience((s) => s.activeCallout)

  return (
    <div className="callouts">
      {ALL.map((copy) => (
        <Callout key={copy.id} copy={copy} active={copy.id === activeCallout} />
      ))}
    </div>
  )
}
