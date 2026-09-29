/**
 * Node names, verified against the actual GLB scene graphs rather than the docs.
 * (05_DOCUMENTATION/NODE_MAP.json lists `USB_C_Shell` / `USB_C_Insert`, which do
 * not exist in the shipped dock model — the refined connector nodes below do.)
 */

export const N = {
  root: 'AETHR_ONE',
  bodyGroup: 'Body_Group',
  crownGroup: 'Crown_Group',
  crownElectronics: 'Crown_Electronics_Group',
  branding: 'Branding',

  body: {
    outerShell: 'Outer_Shell',
    bottomPlate: 'Bottom_Plate',
    antiSlipRing: 'AntiSlip_Ring',
    shoulder: 'Body_Shoulder',
    innerVessel: 'Inner_Vessel',
    neckSleeve: 'Neck_Sleeve',
    mouthLip: 'Mouth_Lip',
    externalThread: 'External_Thread',
    reflectiveLayer: 'Thermal_Reflective_Layer',
    reflectiveShoulder: 'Thermal_Reflective_Shoulder',
    thermalBridge: 'Thermal_Bridge_Neck',
    vacuumGetter: 'Vacuum_Getter',
    vacuum: 'Vacuum_Visualization',
    vacuumBottom: 'Vacuum_Bottom_Visualization',
    liquid: 'Liquid_Volume',
  },

  crown: {
    shell: 'Crown_Shell',
    glass: 'Crown_Glass',
    internalThread: 'Internal_Thread',
    seal: 'Seal',
    oledPanel: 'OLED_Panel',
    oledEdge: 'OLED_Edge',
    oledDemoGlyphs: 'OLED_Glyphs_72',
    displayFlex: 'Display_Flex',
    displayFlexTraces: 'Display_Flex_Traces',
    pcbMain: 'PCB_Main',
    pcbIcs: 'PCB_ICs',
    pcbPassives: 'PCB_Passives',
    pcbTraces: 'PCB_Traces',
    battery: 'LiPo_Pouch',
    batteryFace: 'LiPo_FoilFace',
    ferrite: 'Charging_Ferrite',
    coil: 'Charging_Coil',
    chargeController: 'Charge_Controller',
    sensePlate: 'AETHR_Sense_Plate',
    senseBezel: 'AETHR_Sense_Bezel',
    senseWindow: 'AETHR_Sense_Window',
    senseModule: 'AETHR_Sense_Module',
  },

  monogram: 'AETHR_Monogram',
} as const

export const DOCK_N = {
  root: 'AETHR_CHARGE',
  shellGroup: 'Dock_Shell_Group',
  electronicsGroup: 'Dock_Electronics_Group',
  housing: 'Dock_Housing',
  topSurface: 'Top_Surface',
  topBezel: 'Top_Bezel',
  statusRing: 'Status_Light_Ring',
  magneticRing: 'Magnetic_Ring',
  ferrite: 'Ferrite_Shield',
  coil: 'Charging_Coil',
  controlBoard: 'Control_Board',
  controlIcs: 'Control_ICs',
  bottomPlate: 'Bottom_Plate',
  antiSlipRing: 'AntiSlip_Ring',
  undersideMark: 'Underside_Mark_Plate',
  monogram: 'AETHR_Monogram',
  usbGroup: 'USB_C_Group',
  usbBezel: 'USB_C_Bezel',
  usbInnerShell: 'USB_C_InnerShell',
  usbCavity: 'USB_C_Cavity',
  usbThroat: 'USB_C_Throat',
  usbTongue: 'USB_C_Tongue',
  usbContacts: 'USB_C_Contacts',
} as const

export const THERMAL_N = {
  root: 'AETHR_THERMAL_CUTAWAY',
  main: {
    outer: 'Outer_Main',
    vacuum: 'Vacuum_Main',
    reflective: 'Reflective_Main',
    inner: 'Inner_Main',
    liquid: 'Liquid_Main',
  },
  wedge: {
    outer: 'Outer_Wedge',
    vacuum: 'Vacuum_Wedge',
    reflective: 'Reflective_Wedge',
    inner: 'Inner_Wedge',
    liquid: 'Liquid_Wedge',
  },
} as const

/** Storytelling helpers that must start hidden (spec §100, §121). */
export const HIDE_ON_LOAD = [
  N.body.vacuum,
  N.body.vacuumBottom,
  N.body.liquid,
  N.crown.oledDemoGlyphs,
] as const

/** Meshes that make up the exterior titanium surface and follow the finish preset. */
export const FINISH_MESHES = [
  N.body.outerShell,
  N.body.bottomPlate,
  N.body.shoulder,
  N.body.neckSleeve,
  N.crown.shell,
  N.crown.sensePlate,
] as const

/** Grouped nodes each Smart Crown callout highlights. */
export const CROWN_CALLOUT_TARGETS: Record<string, readonly string[]> = {
  oled: [N.crown.oledPanel, N.crown.oledEdge],
  core: [N.crown.pcbMain, N.crown.pcbIcs, N.crown.pcbTraces, N.crown.pcbPassives],
  power: [N.crown.battery, N.crown.batteryFace, 'LiPo_EdgeSeal', 'LiPo_FoldedSeam', 'LiPo_TechMarking'],
  inductive: [N.crown.coil, N.crown.ferrite],
  sense: [N.crown.senseWindow, N.crown.senseBezel, N.crown.senseModule],
}
