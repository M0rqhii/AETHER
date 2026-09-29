/**
 * Hard numbers measured from the canonical GLB, not guessed.
 *
 * Source model: AETHR_ONE_FINAL_CANONICAL.glb — trimesh export, **Z-up**, metres.
 * The experience root is rotated -90° about X so the product stands Y-up in world
 * space, with the base of the bottle at world y = 0.
 *
 *   local (x, y, z)  ->  world (x, z, -y)
 *
 * A consequence worth remembering: the AETHR monogram sits on the model's -Y face,
 * which becomes world +Z — i.e. it faces the default camera.
 */

/** Everything below is in metres, matching the GLB. */
export const PRODUCT = {
  /** Outer body radius (76 mm diameter). */
  radius: 0.038,
  /** Full closed height, crown included. */
  height: 0.2864,
  /** Top of the mouth lip — where the body ends. */
  bodyTop: 0.2585,
  /** Bottom of the anti-slip ring. */
  baseBottom: -0.0011,
  /** Half height, used as the default camera target. */
  center: 0.1432,
} as const

export const CROWN = {
  /** Crown_Group rest translation along the model axis (local +Z). */
  restZ: 0.2434,
  /** Crown height on its own. */
  height: 0.043,
  /** Crown-local Z of the OLED panel plane. */
  oledZ: 0.0414,
  /** Crown-local Z of the AETHR Sense sapphire window (underside). */
  senseZ: 0.0005,
  /** Crown-local Z of the inductive charging coil. */
  coilZ: 0.0245,
  /** Crown-local Z of the Li-Po pouch centre. */
  batteryZ: 0.0285,
  /** OLED panel radius — used to generate planar UVs. */
  oledRadius: 0.028,

  /** Lift applied when fully unscrewed. Matches poses/AETHR_ONE_OPEN.glb (+76 mm). */
  unscrewLift: 0.076,
  /** Two full turns, as specified. */
  unscrewTurns: 2,
  /** Fraction of the unscrew progress spent on the threaded portion. */
  threadRelease: 0.68,

  /** How far the crown swings off the axis once it is free, and how far it leans. */
  asideOffset: 0.105,
  asideTilt: (26 * Math.PI) / 180,
} as const

/** World-space Y of a crown-local Z once the crown sits at rest on the bottle. */
export const crownWorldY = (localZ: number) => CROWN.restZ + localZ

export const DOCK = {
  /** AETHR CHARGE — 86 mm diameter, 12.5 mm tall. */
  radius: 0.043,
  height: 0.0125,
  /** Top ceramic surface height. */
  topSurfaceZ: 0.0116,
  /** Status light ring height and radius. */
  ringZ: 0.0113,
  ringRadius: 0.04,
  /** Dock-local Z of the dock charging coil. */
  coilZ: 0.007,
  /** Crown_Group Z when seated, from dock/AETHR_CHARGE_DOCKED_CROWN.glb. */
  crownSeatZ: 0.0118,
  /** Where the dock lives in world space during the charging chapter. */
  worldY: 0,
} as const

/**
 * Smart Crown exploded offsets along the model axis, in metres.
 *
 * The reference pose in poses/SMART_CROWN_EXPLODED.glb moves the housing and the
 * cell by the same 35 mm, so every internal stays sealed inside the shell and the
 * callouts point at a wall of metal. These offsets keep the reference's spirit —
 * a precise diagram, small readable distances — but lift the housing clear above
 * the whole stack, the way a cap actually comes off, and fan the internals below
 * it in true assembly order. Nothing ends up inside anything else.
 *
 * Values are chosen against each part's own geometry so no two ever overlap:
 * the shell occupies 0–43 mm of its own space, so it starts at 100 mm; the tallest
 * internal (the glass) tops out at 83 mm.
 */
export const CROWN_EXPLODE_OFFSETS: Record<string, number> = {
  // Bottom of the stack — the sensing face stays where it is.
  AETHR_Sense_Window: 0,
  AETHR_Sense_Bezel: 0,
  AETHR_Sense_Plate: 0,
  AETHR_Sense_Module: 0.002,
  Seal: 0.008,
  Internal_Thread: 0.012,
  // Charging chain.
  Charge_Controller: 0.01,
  Charge_Controller_IC: 0.01,
  Charging_Ferrite: 0.016,
  Charging_Coil: 0.016,
  // Cell.
  LiPo_Pouch: 0.022,
  LiPo_FoilFace: 0.022,
  LiPo_EdgeSeal: 0.022,
  LiPo_FoldedSeam: 0.022,
  LiPo_NegativeTab: 0.022,
  LiPo_PositiveTab: 0.022,
  LiPo_TabInsulator: 0.022,
  LiPo_TechMarking: 0.022,
  // Logic and display.
  PCB_Main: 0.026,
  PCB_ICs: 0.026,
  PCB_Passives: 0.026,
  PCB_Traces: 0.026,
  Display_Flex: 0.03,
  Display_Flex_Traces: 0.03,
  OLED_Panel: 0.034,
  OLED_Edge: 0.034,
  Crown_Glass: 0.04,
  // The housing lifts clear of everything.
  Crown_Shell: 0.1,
}

/**
 * Thermal peel offsets along model +X, in metres.
 * Read from thermal/THERMAL_PEEL_CUTAWAY.glb relative to THERMAL_CUTAWAY_ASSEMBLED.glb.
 * The wedges fan out in exactly the approved order: water, inner, low-E, vacuum, shell.
 */
/*
 * Spread roughly 1.9× the exported spacing. At 13 mm apart the five layers read as
 * one dark slab with seams in it — the whole point of the chapter is that you can
 * count them, and that needs air between each one.
 */
export const THERMAL_PEEL_OFFSETS: Record<string, number> = {
  Liquid_Wedge: 0.034,
  Inner_Wedge: 0.059,
  Reflective_Wedge: 0.084,
  Vacuum_Wedge: 0.109,
  Outer_Wedge: 0.134,
}

export const COLORS = {
  bg000: '#050607',
  bg050: '#070809',
  bg100: '#0a0b0c',
  bg200: '#101214',
  textPrimary: '#f3f3f0',
  hotMain: '#d98c53',
  hotBright: '#f0b06d',
  coldMain: '#7d9fb8',
  coldBright: '#a6c5d8',
  loweMain: '#b67a3a',
  loweBright: '#d4a066',
  chargeMain: '#e8f2f7',
} as const

export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 } as const

export const ASSETS = {
  product: '/models/aethr/aethr-one.glb',
  dock: '/models/aethr/aethr-charge.glb',
  thermal: '/models/aethr/thermal-cutaway.glb',
  draco: '/draco/',
  render: '/aethr-one-render.png',
} as const

/** Fictional-product price, shown in the finale and the configurator. */
export const PRICE_EUR = 249
