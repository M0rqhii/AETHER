/** Every string the experience shows. Spec §115, §116 and 05_DOCUMENTATION/COPY_DECK.md. */

export const BRAND = {
  name: 'AETHR',
  product: 'AETHR ONE',
  category: 'Precision Thermal Vessel',
  tagline: 'Temperature. Engineered.',
  accessory: 'AETHR CHARGE',
} as const

export const NAV = [
  { label: 'One', chapter: 'reveal' },
  { label: 'Technology', chapter: 'thermal' },
  { label: 'Materials', chapter: 'materials' },
  { label: 'Configure', chapter: 'finale' },
] as const

export interface CalloutCopy {
  id: string
  index: string
  title: string
  facts: string[]
  description?: string
}

/** Spec §35–§39 — Smart Crown, in scroll order. */
export const CROWN_CALLOUTS: CalloutCopy[] = [
  {
    id: 'oled',
    index: '01',
    title: 'Smart OLED',
    facts: ['2.2" Circular OLED', 'High contrast', 'Touch activated'],
    description: 'Invisible when idle. Instant thermal feedback when needed.',
  },
  {
    id: 'core',
    index: '02',
    title: 'AETHR Core',
    facts: ['Ultra-low-power control architecture', 'Integrated sensing + display management'],
  },
  {
    id: 'power',
    index: '03',
    title: 'Power Cell',
    facts: ['Rechargeable Li-Po'],
    description: 'Optimized for ultra-low standby consumption.',
  },
  {
    id: 'inductive',
    index: '04',
    title: 'Inductive Power',
    facts: ['Sealed inductive charging'],
    description: 'Zero exposed ports.',
  },
  {
    id: 'sense',
    index: '05',
    title: 'AETHR Sense',
    facts: ['Contactless thermal sensing', 'Target ±0.5°C', 'No exposed probe'],
  },
]

/** Spec §53–§58 — thermal architecture. Water gets a readout, not a card (§52). */
export const THERMAL_CALLOUTS: CalloutCopy[] = [
  {
    id: 'inner',
    index: '01',
    title: 'Inner Vessel',
    facts: ['18/8 Stainless Steel', 'Food-safe', 'Taste-neutral'],
    description: 'The only surface your drink touches.',
  },
  {
    id: 'lowe',
    index: '02',
    title: 'Low-E Surface',
    facts: ['Low-emissivity reflective coating'],
    description: 'Reflects radiant heat back toward the vessel.',
  },
  {
    id: 'vacuum',
    index: '03',
    title: 'Vacuum Core',
    facts: ['Near-zero convection'],
    description: 'Removing air eliminates one of the primary paths of heat transfer.',
  },
  {
    id: 'shell',
    index: '04',
    title: 'Titanium Shell',
    facts: ['Precision titanium body', 'Brushed anisotropic finish'],
  },
]

/** Spec §72, §73 — revealed only in the AETHR CHARGE chapter. */
export const CHARGE_CALLOUTS: CalloutCopy[] = [
  {
    id: 'battery',
    index: '01',
    title: 'Sealed Li-Po Power Cell',
    facts: ['Up to 60 days', 'Ultra-low standby'],
  },
  {
    id: 'coil',
    index: '02',
    title: 'Magnetic Inductive Charging',
    facts: ['0–100% ≈45 min', 'No exposed electrical contacts'],
  },
]

export const TITLES = {
  material: 'Raw Titanium',
  materialSub: 'Precision brushed finish.',
  crown: 'Smart Crown',
  crownSub: 'Temperature sensing. Hidden until needed.',
  inside: 'Nothing between you and the vessel.',
  crownArchitecture: 'A system in 43 millimetres',
  thermalWords: ['Cold.', 'Hot.', 'Held.'],
  coldHold: '24 Hours.',
  coldHoldSub: 'Cold, held.',
  thermalArchitecture: 'Built against heat loss',
  layers: ['Five layers.', 'One purpose.', 'Hold the temperature.'],
  stillHot: 'Still hot.',
  charge: 'AETHR Charge',
  chargeSub: 'Power without ports',
  chargeConclusion: ['60 days.', 'One charge.'],
  materials: 'Make it yours',
  materialMacro: 'Anisotropic brushed finish',
  personalization: 'Yours, precisely.',
  grab: 'Grab it.',
  drop: 'Drop it.',
  impact: 'Impact test',
  impactResult: 'Passed',
} as const

export const FOOTER = {
  brand: 'AETHR',
  division: 'Thermal Systems',
  links: ['Technology', 'Materials', 'Warranty', 'Support'],
  place: 'Copenhagen — MMXXVI',
  notice: 'A fictional product experience.',
} as const

export const FICTION_NOTICE =
  'AETHR, AETHR ONE and AETHR CHARGE are fictional concepts created for portfolio purposes. Quoted figures are storytelling specifications, not validated test results.'
