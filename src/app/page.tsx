import { AethrExperience } from '@/components/AethrExperience'
import { BRAND, CROWN_CALLOUTS, FICTION_NOTICE, THERMAL_CALLOUTS } from '@/lib/aethr/copy'

/**
 * The whole site is one continuous scroll-directed scene (spec §5).
 *
 * The block below is rendered for crawlers and assistive technology that never
 * reach the WebGL layer — the same story, in plain markup.
 */
export default function Page() {
  return (
    <>
      <AethrExperience />

      <div className="sr-only">
        <h1>{`${BRAND.product} — ${BRAND.tagline}`}</h1>
        <p>{BRAND.category}</p>
        <h2>Smart Crown</h2>
        <ul>
          {CROWN_CALLOUTS.map((c) => (
            <li key={c.id}>
              <h3>{c.title}</h3>
              <p>{c.facts.join('. ')}</p>
              {c.description && <p>{c.description}</p>}
            </li>
          ))}
        </ul>
        <h2>Thermal architecture</h2>
        <ul>
          {THERMAL_CALLOUTS.map((c) => (
            <li key={c.id}>
              <h3>{c.title}</h3>
              <p>{c.facts.join('. ')}</p>
              {c.description && <p>{c.description}</p>}
            </li>
          ))}
        </ul>
        <p>{FICTION_NOTICE}</p>
      </div>
    </>
  )
}
