// AETHR ONE node map for the canonical GLB.
export const AETHR = {
  root: 'AETHR_ONE',
  body: {
    group: 'Body_Group',
    outerShell: 'Outer_Shell',
    innerVessel: 'Inner_Vessel',
    reflectiveLayer: 'Thermal_Reflective_Layer',
    reflectiveShoulder: 'Thermal_Reflective_Shoulder',
    vacuum: 'Vacuum_Visualization',
    vacuumBottom: 'Vacuum_Bottom_Visualization',
    liquid: 'Liquid_Volume',
    externalThread: 'External_Thread',
    mouthLip: 'Mouth_Lip',
  },
  crown: {
    group: 'Crown_Group',
    electronics: 'Crown_Electronics_Group',
    shell: 'Crown_Shell',
    glass: 'Crown_Glass',
    oled: 'OLED_Panel',
    oledDemo: 'OLED_Glyphs_72',
    pcb: 'PCB_Main',
    battery: 'LiPo_Pouch',
    chargingCoil: 'Charging_Coil',
    senseWindow: 'AETHR_Sense_Window',
    senseModule: 'AETHR_Sense_Module',
  },
}

export function applyAethrDefaults(nodes) {
  for (const key of [
    'Vacuum_Visualization',
    'Vacuum_Bottom_Visualization',
    'Liquid_Volume',
    'OLED_Glyphs_72',
  ]) {
    if (nodes[key]) nodes[key].visible = false
  }
}
