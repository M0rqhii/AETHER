# AETHR CHARGE — PRODUCT / 3D SPEC

## Purpose
Dedicated magnetic inductive charging dock for the AETHR ONE Smart Crown.

## Dimensions
- diameter: 86 mm
- height: ~12.6 mm
- designed around the 76 mm Smart Crown
- shallow premium puck silhouette

## Exterior
- titanium/aluminum-look housing
- flush black ceramic top
- precision metal top bezel
- extremely subtle status-light ring
- rear USB-C input
- rubber anti-slip underside
- almost no visible branding

## Internal stack
1. Top ceramic surface
2. Magnetic centering ring
3. Ferrite shield
4. Multi-turn copper charging coil
5. Control board + charging electronics
6. Bottom plate / anti-slip ring

## Important GLB nodes
- `AETHR_CHARGE`
- `Dock_Shell_Group`
- `Dock_Electronics_Group`
- `Dock_Housing`
- `Top_Surface`
- `Top_Bezel`
- `Status_Light_Ring`
- `Magnetic_Ring`
- `Ferrite_Shield`
- `Charging_Coil`
- `Control_Board`
- `Control_ICs`
- `USB_C_Shell`
- `USB_C_Insert`
- `Bottom_Plate`
- `AntiSlip_Ring`

## Models
- `01_MODELS/dock/AETHR_CHARGE_FINAL.glb`
- `01_MODELS/dock/AETHR_CHARGE_EXPLODED.glb`
- `01_MODELS/dock/AETHR_CHARGE_DOCKED_CROWN.glb`

`AETHR_CHARGE_DOCKED_CROWN.glb` is a reference scene that shows the Smart Crown physically seated on the dock.

## Website behavior
1. The final hot-water droplet falls toward the bottom of frame.
2. Match cut / morph into the circular charging puck.
3. Camera pulls back to reveal AETHR CHARGE.
4. Smart Crown descends from above.
5. Magnetic centering gives a tiny final snap.
6. Crown lands with a precise click.
7. `Status_Light_Ring` performs one restrained pulse / sweep.
8. Crown OLED shows `68%`.
9. Camera moves low, almost table-level, to emphasize the extremely thin dock.
10. Optional mini exploded/translucent reveal aligns:
   - Crown `Charging_Coil`
   - Dock `Charging_Coil`
11. A subtle field visualization bridges both coils.
12. Deep-dive callouts explain battery and inductive charging.
13. Finish on:
   `60 DAYS.`
   `ONE CHARGE.`

## Material direction
Do not use the GLB fallback materials as final web materials.

Final:
- shell: same precision titanium language as AETHR ONE
- top: near-black matte ceramic / glass-ceramic
- status ring: invisible when off
- coil: real copper
- USB-C: dark and discreet

## Lighting
Mostly dark premium studio.
The puck should initially emerge through reflections, not by turning on a giant glow.

Charging state:
- clean cool white light
- subtle OLED bloom
- subtle status ring
- no cyan neon halo


## Refined USB-C

The rear USB-C input is a modeled close-up detail, not a placeholder.

Final connector nodes:
- `USB_C_Group`
- `USB_C_Bezel`
- `USB_C_InnerShell`
- `USB_C_Cavity`
- `USB_C_Throat`
- `USB_C_Tongue`
- `USB_C_Contacts`

Visual direction:
- thin rounded titanium bezel
- recessed-looking dark connector throat
- separate central tongue
- visible gold contact fingers
- port remains visually subordinate to the dock

Reference images:
- `04_REFERENCES/AETHR_CHARGE_USB_C_REAR_PREVIEW.png`
- `04_REFERENCES/AETHR_CHARGE_USB_C_CLOSEUP.png`
