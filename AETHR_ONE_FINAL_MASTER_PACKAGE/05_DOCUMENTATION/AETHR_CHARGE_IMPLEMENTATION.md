# AETHR CHARGE — IMPLEMENTATION NOTES

## Load as a second product asset
Recommended:
```ts
useGLTF('/models/aethr/AETHR_CHARGE_FINAL.glb')
```

Keep the dock in the same main R3F Canvas as AETHR ONE.

Do not create another permanent Canvas.

## Default state
Before the charging chapter:
- dock can be below frame or invisible
- `Status_Light_Ring` should be dark/off
- Smart Crown is attached to the bottle

## Match cut
At the end of the thermal pour:
- track the final water droplet toward a circular screen-space target
- crossfade / blur / scale into the dock top
- bring the dock to its final world transform while camera pulls out

The exact transition may be artistic; it should feel continuous, not like a hard scene change.

## Crown docking
Animate the existing AETHR ONE `Crown_Group`, or a duplicate/reference Crown only if the architecture makes that cleaner.

Preferred visual:
- Crown descends above the puck
- final 3–5 mm movement accelerates very slightly as if magnets capture it
- small rotational correction of ~1–3°
- final click
- no bounce

## Status ring
`Status_Light_Ring`:
- off by default
- one restrained pulse / circular sweep when Crown seats
- then very low intensity or off

## Coil alignment
Reference:
`01_MODELS/dock/AETHR_CHARGE_DOCKED_CROWN.glb`

For deep dive:
- lightly ghost / fade non-relevant dock parts
- highlight Dock `Charging_Coil`
- highlight Crown `Charging_Coil`
- visualize the inductive field with a restrained shader / particles / thin field curves

Do not depict literal electricity arcing between coils.

## Callouts

### Dock coil
`MAGNETIC INDUCTIVE CHARGING`
`0–100% ≈45 MIN`
`No exposed electrical contacts`

### Crown battery
`SEALED Li-Po POWER CELL`
`UP TO 60 DAYS`
`Ultra-low standby`

## USB-C
USB-C is on the dock, not on the Crown.

The connector is now fully modeled. For a rear orbit / macro shot use:
- `USB_C_Bezel`
- `USB_C_InnerShell`
- `USB_C_Cavity`
- `USB_C_Tongue`
- `USB_C_Contacts`

It should remain a secondary precision detail, not become the visual hero of the charging chapter.

## Mobile
Simplify:
- no full dock exploded if performance is tight
- still show Crown docking, OLED %, and coil alignment graphic
