# AETHR ONE — COMPLETE IMPLEMENTATION SPEC
## Master design, interaction, 3D, motion, UI, copy and implementation guide

**Project:** AETHR ONE  
**Brand:** AETHR  
**Product:** AETHR ONE  
**Accessory:** AETHR CHARGE  
**Type:** Premium fictional interactive product experience  
**Target:** Next.js + React Three Fiber + Three.js + GSAP + Rapier  
**Deployment:** Vercel  
**Primary goal:** A high-end, cinematic, scroll-directed 3D product website suitable for a premium portfolio/showcase.

---

# 1. PURPOSE OF THIS DOCUMENT

This document is the **single execution source of truth** for the AETHR ONE website. It describes the visual direction, brand language, page structure, exact colors, typography, iconography, spacing, 3D model usage, camera behavior, lighting, materials, OLED, Smart Crown, thermal storytelling, HOT/COLD sequences, timer, AETHR CHARGE, materials configurator, engraving, drop test, responsive behavior, accessibility, performance, code architecture, implementation order and QA.

The website must not be treated as a collection of independent blocks. The intended experience is:

> **One continuous product story controlled by scroll.**

The user should feel that they are moving through a cinematic product launch rather than reading a traditional landing page.

---

# 2. CORE PRODUCT IDEA

## Brand
**AETHR**

## Product
**AETHR ONE**

## Product category
**Precision Thermal Vessel**

## Primary tagline
> **Temperature. Engineered.**

## Positioning

AETHR ONE is presented as a fictional premium thermal vessel combining:

- high-end industrial design,
- vacuum thermal engineering,
- integrated temperature sensing,
- an OLED Smart Crown,
- wireless / inductive charging,
- premium materials,
- extreme attention to detail.

The visual language must suggest:

- precision,
- restraint,
- confidence,
- engineering,
- tactility,
- luxury.

Avoid:

- cyberpunk,
- aggressive neon,
- gaming aesthetics,
- colorful SaaS gradients,
- cartoon motion,
- excessive glassmorphism,
- unnecessary UI clutter.

---

# 3. PRIMARY USER IMPRESSION

After the first 15–20 seconds:

> “This looks like a real premium product launch.”

After Smart Crown exploded:

> “This product appears engineered, not decorated.”

After thermal architecture:

> “I understand how it works.”

After AETHR CHARGE:

> “The ecosystem feels complete.”

At the end:

> “This could genuinely be a €249 premium product.”

---

# 4. SOURCE ASSETS

Primary package:

`AETHR_ONE_FINAL_MASTER_PACKAGE`

Main product model:

`01_MODELS/AETHR_ONE_FINAL_CANONICAL.glb`

AETHR CHARGE:

`01_MODELS/dock/AETHR_CHARGE_FINAL.glb`

Reference Smart Crown poses:

`01_MODELS/poses/`

Final thermal reference:

`01_MODELS/thermal/THERMAL_PEEL_CUTAWAY.glb`

Thermal assembled reference:

`01_MODELS/thermal/THERMAL_CUTAWAY_ASSEMBLED.glb`

Documentation:

`05_DOCUMENTATION/`

Implementation helpers:

`06_IMPLEMENTATION/`

The canonical model should be used for the actual production sequence whenever possible. Reference GLBs should be used to understand target poses and offsets, not as a reason to reload an entirely separate model every few seconds.

---

# 5. PRIMARY INTERACTION PRINCIPLE

> **Scroll directs the product.**

Scroll controls:

- camera position,
- camera target,
- product rotation,
- Smart Crown unscrewing,
- Smart Crown exploded view,
- thermal cutaway,
- water fill,
- heat visualization,
- time compression,
- AETHR CHARGE docking,
- light state,
- text visibility,
- callout progression.

Do not build this as a standard long landing page where every section is static text next to a fixed model.

---

# 6. TECHNICAL STACK

Recommended:

- Next.js
- App Router
- React
- TypeScript
- React Three Fiber
- Three.js
- `@react-three/drei`
- GSAP
- ScrollTrigger
- `@react-three/rapier`
- `@react-three/postprocessing`
- Zustand only if the global experience state becomes complex

Do not add a heavy UI component framework. Build custom UI.

---

# 7. RECOMMENDED CODE ORGANIZATION

```text
src/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ globals.css
│
├─ components/
│  ├─ experience/
│  │  ├─ AethrExperience.tsx
│  │  ├─ ExperienceCanvas.tsx
│  │  ├─ ProductModel.tsx
│  │  ├─ AethrCharge.tsx
│  │  ├─ CameraRig.tsx
│  │  ├─ LightingRig.tsx
│  │  ├─ OledDisplay.tsx
│  │  ├─ CrownExploded.tsx
│  │  ├─ ThermalCutaway.tsx
│  │  ├─ LiquidSystem.tsx
│  │  ├─ SteamSystem.tsx
│  │  ├─ HeatParticles.tsx
│  │  ├─ DropTest.tsx
│  │  └─ MaterialController.tsx
│  │
│  ├─ ui/
│  │  ├─ Navbar.tsx
│  │  ├─ ChapterIndicator.tsx
│  │  ├─ LoadingScreen.tsx
│  │  ├─ Callout.tsx
│  │  ├─ CalloutConnector.tsx
│  │  ├─ ThermalTimer.tsx
│  │  ├─ MaterialSelector.tsx
│  │  ├─ EngravingConfigurator.tsx
│  │  ├─ SoundToggle.tsx
│  │  ├─ CursorHint.tsx
│  │  └─ FinalConfigurator.tsx
│  │
│  └─ sections/
│     ├─ RevealSection.tsx
│     ├─ CrownSection.tsx
│     ├─ ThermalSection.tsx
│     ├─ ChargeSection.tsx
│     ├─ MaterialsSection.tsx
│     └─ FinaleSection.tsx
│
├─ hooks/
│  ├─ useExperienceProgress.ts
│  ├─ useProjectedAnchor.ts
│  ├─ useReducedMotion.ts
│  ├─ useAdaptiveQuality.ts
│  └─ useOled.ts
│
├─ lib/
│  └─ aethr/
│     ├─ nodes.ts
│     ├─ chapters.ts
│     ├─ materials.ts
│     ├─ lighting.ts
│     ├─ camera.ts
│     ├─ thermal.ts
│     ├─ copy.ts
│     └─ constants.ts
│
└─ public/
   └─ models/
      └─ aethr/
```

---

# 8. BRAND COLOR SYSTEM

## Core backgrounds

```css
--bg-000: #050607;
--bg-050: #070809;
--bg-100: #0A0B0C;
--bg-200: #101214;
```

Main Canvas background:

`#070809`

Use `#050607` for the darkest cinematic chapters.

## Text

```css
--text-primary: #F3F3F0;
--text-secondary: rgba(243,243,240,0.58);
--text-tertiary: rgba(243,243,240,0.34);
--text-disabled: rgba(243,243,240,0.20);
```

## Lines

```css
--line-strong: rgba(255,255,255,0.20);
--line-default: rgba(255,255,255,0.11);
--line-soft: rgba(255,255,255,0.06);
```

## HOT

```css
--hot-main: #D98C53;
--hot-bright: #F0B06D;
--hot-soft: rgba(217,140,83,0.18);
```

HOT is mainly a **lighting state**, not a red UI theme.

## COLD

```css
--cold-main: #7D9FB8;
--cold-bright: #A6C5D8;
--cold-soft: rgba(125,159,184,0.16);
```

COLD is mainly a subtle steel-blue reflection state.

## LOW-E

```css
--lowe-main: #B67A3A;
--lowe-bright: #D4A066;
```

## CHARGING

```css
--charge-main: #E8F2F7;
--charge-soft: rgba(232,242,247,0.18);
```

No cyan neon halo.

---

# 9. FINAL PRODUCT MATERIAL PRESETS

These are starting points, not fixed truth. Final appearance depends on HDR/environment.

## RAW

```js
{
  color: "#8E8F8D",
  metalness: 1.0,
  roughness: 0.29,
  anisotropy: 0.75
}
```

Neutral, slightly warm brushed titanium.

## OBSIDIAN

```js
{
  color: "#17191B",
  metalness: 0.95,
  roughness: 0.33,
  anisotropy: 0.68
}
```

Dark graphite; must still reflect light.

## FROST

```js
{
  color: "#B8BDBE",
  metalness: 1.0,
  roughness: 0.27,
  anisotropy: 0.72
}
```

## SAND

```js
{
  color: "#9B8D78",
  metalness: 0.92,
  roughness: 0.34,
  anisotropy: 0.62
}
```

Warm champagne titanium. Do not make it gold.

---

# 10. TYPOGRAPHY

Recommended:

- **Geist Sans** — display, body, UI
- **Geist Mono** — temperature, timer, chapter indexes, measurements, technical metadata

Desktop type scale:

```css
--display-xl: clamp(88px, 12vw, 220px);
--display-lg: clamp(64px, 8vw, 150px);
--display-md: clamp(48px, 6vw, 110px);
--heading-xl: clamp(42px, 5vw, 84px);
--heading-lg: clamp(32px, 3.5vw, 60px);
--heading-md: clamp(26px, 2.3vw, 40px);
--body-lg: 18px;
--body-md: 15px;
--body-sm: 13px;
--micro: 11px;
```

Display text:

```css
font-weight: 500;
letter-spacing: -0.045em;
line-height: 0.88;
```

Technical labels:

```css
font-family: Geist Mono;
font-size: 11px;
letter-spacing: 0.08em;
text-transform: uppercase;
```

---

# 11. SPACING

Use an 8 px base grid.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
--space-8: 64px;
--space-9: 96px;
--space-10: 128px;
```

Desktop page safe area:

```css
padding-inline: clamp(24px, 4vw, 72px);
```

Mobile:

```css
padding-inline: 18px;
```

---

# 12. ICON SYSTEM

Use **Lucide React**.

Icon rules:

- stroke only,
- 1.5–1.75 px stroke,
- mostly 16–18 px,
- no colored emoji,
- no giant icon circles,
- no decorative filled glyphs.

Recommended mapping:

| Use | Lucide icon |
|---|---|
| Menu | `Menu` |
| Close | `X` |
| Sound on | `Volume2` |
| Sound off | `VolumeX` |
| Replay/reset | `RotateCcw` |
| Scroll | `ArrowDown` |
| Configure | `SlidersHorizontal` |
| Engraving | `PenLine` |
| Charge | `BatteryCharging` |
| Temperature | `Thermometer` |
| External | `ArrowUpRight` |
| Bag | `ShoppingBag` |
| Add | `Plus` |
| Remove | `Minus` |
| Confirm | `Check` |
| Information | `Info` |

Every icon-only control must have `aria-label`.

---

# 13. BUTTONS

Primary:

```css
height: 48px;
padding: 0 22px;
border-radius: 999px;
background: #F2F2EF;
color: #090A0B;
border: 1px solid rgba(255,255,255,0.20);
font-size: 13px;
font-weight: 600;
letter-spacing: 0.02em;
```

Hover:

- scale max 1.015,
- slightly brighter,
- no giant glow.

Secondary:

```css
background: transparent;
border: 1px solid rgba(255,255,255,0.14);
color: #F3F3F0;
```

---

# 14. NAVBAR

Desktop:

- fixed,
- 64 px height,
- transparent,
- `AETHR` left,
- `ONE`, `TECHNOLOGY`, `MATERIALS`, `CONFIGURE` right.

Do not place navbar inside a large rounded capsule.

When background becomes visually busy:

`rgba(5,6,7,0.45)` + subtle backdrop blur.

Mobile:

- AETHR left,
- `Menu` icon right,
- dark full-screen menu.

---

# 15. CHAPTER INDICATOR

Desktop only.

Fixed right side, vertically centered.

Example:

```text
01
02
03
04
05
—
12
```

Active chapter: 100% opacity.  
Inactive: 20–30%.  
Font: Geist Mono, 10 px.

---

# 16. CUSTOM CURSOR

Desktop only.

Default:

5–6 px dot, `rgba(255,255,255,.72)`.

Interactive states:

- product interaction → `DRAG`
- drop test → `THROW`
- configurator → `SELECT`

No giant animated circle following the mouse.

---

# 17. LOADING SCREEN

Full viewport, `#050607`.

Center:

`AETHR`

Below:

`INITIALIZING EXPERIENCE`

Progress:

`00 → 100`

Visual:

thin circular ring inspired by Smart Crown.

At 100:

ring becomes:

`--°`

Hold 250–400 ms, then fade to first scene.

Progress must be based on actual critical asset loading, not a fake timeout.

---

# 18. MAIN CANVAS

```css
position: fixed;
inset: 0;
width: 100vw;
height: 100vh;
```

Use one main Canvas.

Do not create separate permanent canvases for each chapter.

---

# 19. CAMERA BASELINE

Perspective camera.

Starting FOV:

`30°`

Near:

`0.01`

Far:

`100`

Motion style:

- slow,
- cinematic,
- controlled,
- physically believable.

Primary easing:

- `power2.inOut`
- `power3.inOut`

Never use bounce or elastic for the product.

---

# 20. LIGHTING BASELINE

Studio rig:

1. **Key** — large soft source for long cylinder reflections.
2. **Fill** — weaker, slightly cooler.
3. **Rim** — product separation from black background.
4. **Moving reflection light/card** — reveal, 360, material macro, finale.
5. Environment map / HDR for physically plausible metal.

Only one or very few lights should cast shadows.

Shadows should be soft.

---

# 21. POSTPROCESSING

Use carefully:

- tone mapping,
- subtle vignette,
- small OLED bloom,
- charging glow,
- selective macro DOF.

Avoid:

- global bloom,
- chromatic aberration,
- constant distortion,
- heavy film grain.

Premium means restraint.

---

# 22. MOTION LANGUAGE

The bottle is a heavy precision object.

Never animate it like lightweight plastic.

Use:

- slow starts,
- smooth deceleration,
- deliberate pauses,
- controlled camera movement.

Do not animate every visible element simply because it is possible.

---

# 23. SCENE 01 — REVEAL

## Goal

Introduce the object with light before explaining it.

## Initial state

- background almost black,
- bottle centered,
- bottle already in scene,
- only a faint silhouette.

## Scroll 0–25%

A narrow rim appears on one edge.

## Scroll 25–55%

A soft rectangular reflection travels across the body.

This is the first moment the brushed material becomes understandable.

## Scroll 55–75%

Large title:

`AETHR`

## Scroll 75–100%

Title transitions to / is joined by:

`ONE`

Below:

`Precision Thermal Vessel`

Tagline:

`Temperature. Engineered.`

Bottle rotates only 10–15°.

No continuous spin.

---

# 24. SCENE 02 — HERO PRODUCT SHOT

Typography fades.

Camera moves slightly closer.

OLED activates:

`--°`

Hold approximately 700 ms.

OLED fades completely into the black crown glass.

Small lower-center hint:

`SCROLL TO EXPLORE`

with Lucide `ArrowDown`.

Opacity around 0.5.

---

# 25. SCENE 03 — PRODUCT INSPECTION

## Phase A — material

Bottle rotates about 180°.

Moving light follows.

Text:

`RAW TITANIUM`

Sub:

`Precision brushed finish.`

## Phase B — brand detail

Camera lowers.

Show AETHR monogram.

Small technical label only:

`AETHR ONE / A01`

## Phase C — underside

Bottle tilts 25–30°.

Camera moves below.

Show:

- bottom plate,
- anti-slip ring,
- underside form.

Then return to upright.

Do not perform a full “e-commerce 360 spin.”

---

# 26. SCENE 04 — SMART CROWN INTRO

Camera travels upward.

Smart Crown occupies roughly 35–45% of viewport height.

OLED:

`72°`

Subline:

`READY`

Text:

`SMART CROWN`

Description:

`Temperature sensing. Hidden until needed.`

After approximately one second, OLED fades off.

---

# 27. SCENE 05 — UNSCREW

Animate entire:

`Crown_Group`

Use roughly:

```text
rotation.z: 0 → 4π
position along bottle axis: 0 → +75–90 mm
```

Rotation and translation must appear linked to the thread pitch.

When the thread releases:

- small pause,
- then final lift.

Pause equivalent:

120–180 ms.

No bounce.

---

# 28. SCENE 06 — AETHR SENSE

Tilt Crown approximately:

- X: 10–18°,
- Y: 5–10°.

Camera moves to see underside.

Highlight:

`AETHR_Sense_Window`

Callout:

```text
AETHR SENSE

Contactless thermal sensing
No exposed probe
```

Connector must originate from real projected 3D position.

---

# 29. SCENE 07 — LOOK INSIDE

Crown moves away from opening.

Bottle tilts toward camera.

Camera path:

1. over `Mouth_Lip`,
2. reveal `External_Thread`,
3. show inner metal,
4. move slightly inside.

Use macro lighting on steel.

Text:

`NOTHING BETWEEN YOU AND THE VESSEL.`

Do not fly deeply into the bottle. Keep camera movement comfortable and believable.

---

# 30. SCENE 08 — CROWN EXPLODED INTRO

Crown moves into an engineering presentation pose.

Title:

`A SYSTEM IN 43 MILLIMETERS`

Leave enough negative space for callout cards.

Camera should use a clean 3/4 angle.

---

# 31. SMART CROWN EXPLODED ORDER

Sequence:

1. `Crown_Glass`
2. `OLED_Panel`
3. `Display_Flex`
4. `PCB_Main` + details
5. `LiPo_Pouch`
6. `Charging_Coil`
7. `AETHR_Sense`

Suggested overlap:

```text
Glass      0.00–0.20
OLED       0.10–0.30
Flex       0.20–0.40
PCB        0.30–0.50
Battery    0.45–0.65
Coil       0.60–0.80
Sense      0.75–1.00
```

Do not make the elements fly far away.

This is a precision exploded diagram, not an explosion.

---

# 32. CALLOUT SYSTEM

One active callout at a time.

Desktop card:

- width 300–360 px,
- padding 20–24 px,
- radius 10–14 px,
- background `rgba(9,10,11,.72)`,
- border `1px solid rgba(255,255,255,.10)`,
- backdrop blur 10–14 px.

Structure:

```text
01

SMART OLED

2.2" Circular OLED
High contrast
Touch activated

Invisible when idle.
Instant thermal feedback when needed.
```

Index:

Geist Mono.

Technical metadata:

Geist Mono or small Geist Sans.

Description:

normal sans.

---

# 33. CALLOUT CONNECTOR

SVG overlay.

Line:

1 px.

Color:

`rgba(255,255,255,.42)`

Anchor point circle:

4 px.

Each frame:

1. `object.getWorldPosition(...)`
2. `.project(camera)`
3. NDC → screen pixels
4. update SVG connector.

Do not manually hardcode line positions.

The line must remain attached while camera moves.

---

# 34. CALLOUT ACTIVE STATE

Active component:

- receives slightly more light,
- optional 2–3 mm additional separation,
- full opacity.

Inactive components:

- remain visible,
- reduce visual emphasis to roughly 45–65%.

Do not make everything except active component disappear.

---

# 35. CROWN CALLOUT 01 — SMART OLED

Title:

`SMART OLED`

Metadata:

```text
2.2" Circular OLED
High contrast
Touch activated
```

Description:

`Invisible when idle. Instant thermal feedback when needed.`

OLED quick preview:

`72° → 4° → 96° → --°`

Transitions should be smooth and short.

---

# 36. CROWN CALLOUT 02 — AETHR CORE

Title:

`AETHR CORE`

Metadata:

```text
Ultra-low-power control architecture
Integrated sensing + display management
```

Highlight:

- `PCB_Main`
- `PCB_ICs`
- `PCB_Traces`
- `PCB_Passives`

Do not invent a processor model.

---

# 37. CROWN CALLOUT 03 — POWER CELL

Title:

`POWER CELL`

Metadata:

`Rechargeable Li-Po`

Description:

`Optimized for ultra-low standby consumption.`

Important:

Do **not** show “60 days” here.

Do **not** show “45 min charging” here.

Save those for AETHR CHARGE.

---

# 38. CROWN CALLOUT 04 — INDUCTIVE POWER

Title:

`INDUCTIVE POWER`

Metadata:

`Sealed inductive charging`

Description:

`Zero exposed ports.`

Highlight Crown `Charging_Coil`.

---

# 39. CROWN CALLOUT 05 — AETHR SENSE

Title:

`AETHR SENSE`

Metadata:

```text
Contactless thermal sensing
Target ±0.5°C
No exposed probe
```

Use macro framing.

---

# 40. CROWN REASSEMBLY

Reverse order:

1. Sense
2. Coil
3. Battery
4. PCB
5. OLED
6. Glass

End with tiny precision `click`.

Move Crown above bottle.

Align with thread.

Reverse unscrew.

OLED:

`--°`

Then off.

---

# 41. THERMAL PERFORMANCE INTRO

Give visual rest.

Large words appear sequentially:

`COLD.`

`HOT.`

`HELD.`

Each word corresponds to a subtle light-state shift.

Do not add a huge paragraph.

---

# 42. COLD FILL

Sequence:

1. Crown opens.
2. Cold liquid stream appears.
3. `Liquid_Volume` becomes visible.
4. Fill rises from bottom.
5. Optional 2–3 ice cubes.
6. Crown closes.
7. OLED displays:

```text
4°C
COLD
```

Lighting becomes slightly cooler.

Text:

`24 HOURS.`

Sub:

`COLD, HELD.`

Keep this scene shorter than HOT.

---

# 43. LIQUID IMPLEMENTATION

`Liquid_Volume` is a helper.

Recommended fill techniques:

- shader clipping plane,
- scale + position compensation,
- custom liquid mesh state.

Liquid should:

- remain mostly colorless,
- use refraction / transparency,
- react to lighting,
- avoid looking like blue acrylic.

COLD can have cool highlights without making liquid blue.

HOT can have warm reflections without making liquid red.

---

# 44. COLD LIGHT STATE

Adjust:

- fill light slightly toward steel blue,
- environment intensity,
- reflection temperature.

Do not change the entire background to blue.

---

# 45. COLD → HOT TRANSITION

1. Crown opens.
2. Bottle tilts.
3. Cold water pours out.
4. Liquid level lowers.
5. Bottle returns upright.
6. Lighting moves cool → neutral → warm.

---

# 46. HOT FILL

1. Crown opens.
2. Hot water stream enters.
3. Small steam system activates.
4. Liquid fills.
5. Crown closes.
6. OLED:

```text
96°C
HOT
```

**Thermal timer begins at the exact moment Crown seals the bottle.**

---

# 47. STEAM

Steam must be subtle.

Use:

- low opacity particles,
- soft sprites,
- 10–60 particles depending device,
- slow upward drift,
- slight turbulence.

No locomotive plume.

No dense fog.

---

# 48. LIVE THERMAL TEST OVERLAY

Suggested layout:

```text
LIVE THERMAL TEST

00:00:00
96°C
```

Use Geist Mono.

Place:

top-right below navbar or lower-right based on current composition.

No large opaque card.

Temperature may be 22–28 px.

Time 12–14 px.

Label 10–11 px.

---

# 49. TIMER LOGIC

Timer is scroll-driven, not wall-clock-driven.

Example keyframes:

```text
0.00 → 00:00 → 96°C
0.20 → 01:00 → 94°C
0.45 → 04:00 → 91°C
0.65 → 09:00 → 80°C
0.80 → 12:00 → 75°C
0.92 → 18:00 → 65°C
1.00 → 24:00 → 58°C
```

Interpolate between keyframes.

Scroll backwards must reverse time and temperature.

---

# 50. THERMAL ARCHITECTURE INTRO

Title:

`BUILT AGAINST HEAT LOSS`

Camera moves closer to body.

Cutaway begins.

Preferred:

runtime clipping / reveal.

Fallback:

controlled crossfade to thermal reference model if runtime clipping becomes unreliable.

No hard instant model replacement.

---

# 51. FINAL THERMAL STORY ORDER

Use exactly:

1. WATER
2. INNER VESSEL
3. LOW-E SURFACE
4. VACUUM CORE
5. OUTER SHELL

Reference:

`THERMAL_PEEL_CUTAWAY.glb`

Do not return to old “multiple full cylinders next to each other” concept.

---

# 52. WATER LAYER

Do not show a large callout saying “Water.”

Show:

```text
CORE TEMPERATURE
94°C
```

Start subtle heat-flow visualization.

---

# 53. INNER VESSEL

Callout:

`01 — INNER VESSEL`

Metadata:

```text
18/8 Stainless Steel
Food-safe
Taste-neutral
```

Description:

`The only surface your drink touches.`

Material should be clean stainless steel, a little more polished than outer titanium.

---

# 54. LOW-E SURFACE

Callout:

`02 — LOW-E SURFACE`

Metadata:

`Low-emissivity reflective coating`

Description:

`Reflects radiant heat back toward the vessel.`

Visual requirement:

**very thin coating.**

It must not look like a thick orange tube.

Material:

- highly metallic,
- lower roughness,
- champagne/copper reflection,
- thin.

---

# 55. LOW-E HEAT EFFECT

Use only a few designed heat rays.

Example:

3–8 rays.

Warm orange / amber.

Direction:

`inner vessel → low-E surface → reflected inward`

No particle storm.

---

# 56. VACUUM CORE

Callout:

`03 — VACUUM CORE`

Metadata:

`Near-zero convection`

Description:

`Removing air eliminates one of the primary paths of heat transfer.`

Important:

Vacuum is **empty space**, not a physical blue layer.

Use `Vacuum_Visualization` only as a storytelling helper.

---

# 57. VACUUM VISUALIZATION

During this callout only:

- low opacity,
- faint outline,
- very subtle internal particles,
- optional soft cool tint.

Heat particles trying to move outward should:

- slow,
- fade,
- disappear across the gap.

Do not represent this as literal scientific simulation.

---

# 58. OUTER SHELL

Callout:

`04 — TITANIUM SHELL`

Metadata:

```text
Precision titanium body
Brushed anisotropic finish
```

Perform a moving light sweep across the outer surface.

---

# 59. THERMAL WIDE SHOT

Show all layers together.

Hide individual callout cards.

Large text:

`FIVE LAYERS.`

Then:

`ONE PURPOSE.`

Then:

`HOLD THE TEMPERATURE.`

Timer continues in corner.

---

# 60. THERMAL REASSEMBLY

Reverse peel.

Close cutaway.

Return full monolithic bottle.

Timer remains visible.

---

# 61. TIME COMPRESSION

Camera pulls back.

Bottle stays almost motionless.

Lighting slowly shifts to communicate passing time.

Timer accelerates through:

- 04:00,
- 06:00,
- 09:00,
- 12:00,
- 18:00,
- 24:00.

End:

```text
24:00:00
58°C
```

Large text:

`STILL HOT.`

---

# 62. OPEN AFTER 24 HOURS

Crown slowly unscrews.

When released:

small steam plume.

Timer freezes:

`24:00:00`

Temperature:

`58°C`

Use macro close-up.

---

# 63. POUR OUT

Bottle tilts.

Liquid pours out.

Camera follows last droplet.

Use the final droplet as the visual transition into AETHR CHARGE.

---

# 64. MATCH CUT TO AETHR CHARGE

Transition concept:

1. final droplet moves toward camera / lower frame,
2. circular silhouette grows,
3. shallow blur / focus transition,
4. circle becomes the top surface of AETHR CHARGE,
5. camera pulls back,
6. dock is revealed by reflection.

Text:

`AETHR CHARGE`

Do not hard-cut to a totally different scene if avoidable.

---

# 65. AETHR CHARGE PRODUCT MODEL

Use:

`01_MODELS/dock/AETHR_CHARGE_FINAL.glb`

Key physical direction:

- diameter ~86 mm,
- height ~12.6 mm,
- extremely low-profile puck,
- titanium/aluminum-like housing,
- near-black ceramic top,
- subtle status-light ring,
- magnetic centering,
- rear USB-C,
- anti-slip underside.

The dock belongs to the same industrial design family as AETHR ONE.

---

# 66. AETHR CHARGE LIGHTING

Start nearly dark.

Reveal the puck through:

- narrow top reflection,
- thin rim,
- subtle top-surface reflection.

Do not reveal it with a bright cyan glow.

Charging state is clean cool white.

---

# 67. CROWN DOCKING

Smart Crown moves independently from bottle.

Docking sequence:

1. Crown moves above puck.
2. Descends slowly.
3. Last 3–5 mm gain a tiny magnetic “capture” acceleration.
4. Crown rotates 1–3° to perfect alignment.
5. Precise click.
6. Status light ring pulses once.
7. OLED shows `68%`.

No bounce after contact.

Reference:

`AETHR_CHARGE_DOCKED_CROWN.glb`

---

# 68. STATUS LIGHT RING

Node:

`Status_Light_Ring`

Default:

off.

On docking:

- 350–600 ms restrained pulse,
- or one soft circular sweep.

Then:

- 0–20% intensity.

Do not make it permanently neon.

---

# 69. USB-C PORT

USB-C is a secondary precision detail, not a hero.

Use refined nodes:

- `USB_C_Group`
- `USB_C_Bezel`
- `USB_C_InnerShell`
- `USB_C_Cavity`
- `USB_C_Throat`
- `USB_C_Tongue`
- `USB_C_Contacts`

Optional:

brief rear 3/4 orbit.

If labeled:

`USB-C INPUT`

No large feature card.

The port should reward close inspection.

---

# 70. CHARGING DEEP DIVE

After Crown docks:

- slightly separate / ghost outer surfaces,
- emphasize Crown `Charging_Coil`,
- emphasize Dock `Charging_Coil`,
- align both visually,
- reveal field visualization.

Do not explode every dock component unless composition benefits.

Focus on:

**coil ↔ coil** and **battery**.

---

# 71. INDUCTION FIELD VISUALIZATION

Do not show electrical lightning.

Use:

- 3–5 elliptical field curves,
- pale cool white / very subtle blue-white,
- opacity under ~0.2,
- additive blending,
- slow flowing shader offset.

The effect should look like an explanatory premium diagram.

---

# 72. BATTERY DEEP DIVE

Now reveal the parameter saved earlier.

Callout:

`SEALED Li-Po POWER CELL`

Large statement:

`UP TO 60 DAYS`

Sub:

`Ultra-low standby`

This is the correct point for battery-life storytelling.

---

# 73. CHARGING COIL DEEP DIVE

Callout:

`MAGNETIC INDUCTIVE CHARGING`

Metadata:

```text
0–100% ≈45 MIN
No exposed electrical contacts
```

Large scene conclusion:

`60 DAYS.`

Then:

`ONE CHARGE.`

---

# 74. MATERIALS CHAPTER

Title:

`MAKE IT YOURS`

Bottle returns to a clean center studio state.

Material selector appears.

Options:

- RAW
- OBSIDIAN
- FROST
- SAND

---

# 75. MATERIAL SELECTOR UI

Desktop:

bottom-center.

Minimal controls.

Example:

```text
● RAW     ● OBSIDIAN     ● FROST     ● SAND
```

Each item contains:

- small circular swatch,
- uppercase label.

Active:

- brighter border,
- full text opacity.

Inactive:

- 40–55% text opacity.

Do not place selector in a large glass card.

---

# 76. MATERIAL TRANSITION

Never reload the GLB.

Interpolate material properties:

- color,
- roughness,
- anisotropy,
- optionally environment intensity.

Duration:

500–800 ms.

Use smooth easing.

Do not flash between materials.

---

# 77. RAW MATERIAL QUALITY REQUIREMENT

The default GLB material is not final.

Final RAW must include:

- `MeshPhysicalMaterial`,
- high metalness,
- directional anisotropy,
- physically plausible environment reflections,
- fine brushed roughness / normal information,
- studio light cards.

Reject any result that looks:

- gray plastic,
- milky,
- purple,
- like CAD viewport default.

---

# 78. MATERIAL MACRO

Camera moves extremely close to side wall.

Title:

`ANISOTROPIC BRUSHED FINISH`

A long reflection moves vertically / diagonally.

The user should see subtle directional microstructure.

Use DOF only if performance allows.

---

# 79. PERSONALIZATION CHAPTER

Title:

`YOURS, PRECISELY.`

Bottle shifts left.

Configurator appears right on desktop.

Mobile:

bottom control panel.

---

# 80. ENGRAVING CONTROLS

Label:

`ENGRAVING`

Text input.

Max:

12–16 characters.

Modes:

- Vertical
- Minimal
- Monogram

Use a small segmented control.

No font selector with dozens of fonts.

Premium configurator means deliberate limitations.

---

# 81. ENGRAVING APPEARANCE

Engraving must not look printed.

Prefer:

- decal / texture,
- subtle normal indentation,
- darker roughness,
- slight reduction in local reflectivity.

Do not use bright white text.

---

# 82. INTERACTIVE PRODUCT CHAPTER

Title:

`GRAB IT.`

Enable controlled pointer interaction.

Cursor label:

`DRAG`

Use damping.

Prevent unrealistic angular velocities.

No permanent OrbitControls through the entire website; enable only where appropriate.

---

# 83. DROP TEST CHAPTER

Title:

`DROP IT.`

Enable Rapier rigid-body behavior.

The user can:

- grab,
- reposition,
- release.

Bottle:

- falls,
- rotates,
- hits the ground,
- bounces slightly,
- settles.

---

# 84. DROP TEST FLOOR

Floor should be visually simple:

dark matte surface.

Not a laboratory grid.

Use enough friction to stop the bottle naturally.

Tune restitution to avoid rubber-like bouncing.

---

# 85. DROP TEST SOUND

Optional audio state must already be enabled by user.

Use a restrained metal impact sample.

Do not use:

- explosion,
- glass smash,
- exaggerated crash.

---

# 86. DROP TEST RESULT

After bottle settles:

```text
IMPACT TEST
PASSED
```

Button:

`RESET TEST`

Icon:

Lucide `RotateCcw`.

Do not invent a MIL-STD certification.

---

# 87. DROP RESET

Avoid visible teleport.

Options:

1. fade/motion blur → reset transform → fade in,
2. scripted lift back to initial pose,
3. transition through black.

Then disable physics and restore scripted experience transforms.

---

# 88. FINAL HERO

Return to the visual language of the opening.

Dark studio.

Bottle central.

Slow moving reflection.

Large:

`AETHR ONE`

Tagline:

`Temperature. Engineered.`

Metadata:

```text
750 ML
RAW TITANIUM
€249
```

If user selected another material, metadata can reflect selected finish.

---

# 89. FINAL CTA

Primary:

`CONFIGURE YOURS`

Secondary:

`EXPLORE AGAIN`

Primary:

light background.

Secondary:

outline.

Replay should return experience to top in a controlled way.

---

# 90. FINAL CONFIGURATOR

Full-screen or large drawer.

Fields:

## Product
AETHR ONE

## Finish
RAW / OBSIDIAN / FROST / SAND

## Engraving
None / Custom

## Quantity
minus / count / plus

## Price
€249

CTA:

`ADD TO BAG`

The product is fictional; do not create a real checkout requirement.

---

# 91. CART DRAWER

Recommended width:

380–420 px desktop.

Background:

`#0A0B0C`

Contents:

- product miniature,
- finish,
- engraving,
- quantity,
- price.

CTA:

`CHECKOUT`

Below:

`Demo experience — no purchase will be processed.`

---

# 92. FOOTER

Minimal.

Example:

```text
AETHR
THERMAL SYSTEMS

Technology
Materials
Warranty
Support

COPENHAGEN — MMXXVI
```

Final small line:

`A fictional product experience.`

This line is required for public deployment.

---

# 93. SOUND SYSTEM

Default:

off.

Navbar control:

- `VolumeX` off,
- `Volume2` on.

Never autoplay sound without user action.

Sound set:

- Crown thread,
- Crown click,
- water pour,
- subtle steam ambience,
- magnetic charging click,
- metal impact.

If high-quality sound assets are unavailable, the site must still work perfectly silently.

---

# 94. SCROLL DISTANCES

Recommended chapter lengths:

| Chapter | Virtual scroll |
|---|---:|
| Reveal | 1200 px |
| Inspection | 1800 px |
| Crown opening + inside | 1600 px |
| Crown exploded + callouts | 3200 px |
| Cold | 1200 px |
| Hot | 1200 px |
| Thermal architecture | 3600 px |
| Time compression | 1800 px |
| Charging | 2600 px |
| Materials | 1800 px |
| Personalization | 1500 px |
| Drop test | 1500 px |
| Finale | 1200 px |

Target total:

~23–25k virtual scroll pixels.

Use pinned chapters / ScrollTrigger. Do not create 25k px of meaningless blank markup.

---

# 95. GLOBAL NORMALIZED PROGRESS

Suggested normalized master timeline:

```text
0.000–0.055 Reveal
0.055–0.125 Inspection
0.125–0.180 Smart Crown
0.180–0.315 Crown exploded
0.315–0.350 Crown reassembly
0.350–0.405 Cold
0.405–0.455 Hot
0.455–0.640 Thermal
0.640–0.685 Thermal reassembly
0.685–0.750 Time compression
0.750–0.785 Open / pour
0.785–0.865 AETHR Charge
0.865–0.915 Materials
0.915–0.950 Personalization
0.950–0.980 Drop test
0.980–1.000 Finale
```

These values can be tuned, but maintain the overall rhythm.

---

# 96. CAMERA STATE SYSTEM

Centralize camera states.

Example:

```ts
type CameraState =
  | "reveal"
  | "hero"
  | "inspection"
  | "bottom"
  | "crown"
  | "sense"
  | "inside"
  | "crownExploded"
  | "thermal"
  | "thermalWide"
  | "charge"
  | "chargeMacro"
  | "materialMacro"
  | "drop"
  | "finale"
```

Store:

- position,
- target,
- FOV,
- optional roll.

Do not scatter magic camera numbers across multiple components.

---

# 97. LIGHT STATE SYSTEM

Centralize:

```ts
type LightState =
  | "darkReveal"
  | "studio"
  | "cold"
  | "hot"
  | "thermal"
  | "charging"
  | "materials"
  | "finale"
```

Each state defines:

- key position,
- key intensity,
- key color,
- fill position,
- fill intensity,
- fill color,
- rim,
- environment intensity,
- background tint.

Interpolate between states.

---

# 98. OLED STATE SYSTEM

```ts
type OledState =
  | "off"
  | "idle"
  | "ready"
  | "cold"
  | "hot"
  | "charge"
```

Values:

```text
off    → black
idle   → --°
ready  → 72° / READY
cold   → 4°C / COLD
hot    → 96°C / HOT
charge → 68%
```

OLED should use a dynamic CanvasTexture / render texture, not baked static geometry.

---

# 99. OLED VISUAL STYLE

Background:

near black.

Main numeric:

off-white.

Subline:

~65% white.

No blue LED styling.

Bloom:

minimal.

When off:

screen should blend into black glass.

---

# 100. MAIN MODEL DEFAULTS

After GLB load:

```js
Vacuum_Visualization.visible = false
Vacuum_Bottom_Visualization.visible = false
Liquid_Volume.visible = false
OLED_Glyphs_72.visible = false
```

Use dynamic OLED instead.

---

# 101. NODE RESPONSIBILITY

Whole Crown open / close:

`Crown_Group`

Crown exploded:

children inside Crown.

Thermal story:

- `Inner_Vessel`
- `Thermal_Reflective_Layer`
- `Vacuum_Visualization`
- `Liquid_Volume`
- `Outer_Shell`

Do not break hierarchy unnecessarily.

---

# 102. PERFORMANCE TARGETS

Desktop:

target 60 FPS.

Acceptable:

45–60 FPS.

Mobile:

target 30–60 FPS.

A 3D showcase at 10–20 FPS is not acceptable.

---

# 103. DPR STRATEGY

Desktop:

clamp roughly 1–2.

Mobile:

1–1.5.

Adaptive quality may lower DPR when sustained performance is poor.

Do not run 3× DPR simply because a device reports it.

---

# 104. PARTICLE BUDGET

Steam:

prefer <100 visible.

Heat:

prefer <100.

Induction:

curves/shader preferred over particle cloud.

Do not use thousands of particles for decorative effect.

---

# 105. SHADOW BUDGET

Prefer one main shadow-casting light.

Other decorative lights:

no shadow.

Use soft contact shadow.

Reduce shadow resolution on mobile.

---

# 106. ASSET OPTIMIZATION

Consider:

- Meshopt,
- Draco,
- KTX2,
- optimized environment map,
- compressed textures.

Preserve node separation required for animation.

Do not blindly merge everything.

---

# 107. MOBILE BREAKPOINTS

Suggested:

```css
640px
768px
1024px
1280px
1536px
```

Primary mobile design target:

390–430 px width.

---

# 108. MOBILE ADAPTATIONS

Mobile must remain premium.

Changes:

- hide chapter indicator,
- reduce exploded distances,
- move callouts to bottom,
- reduce particles,
- reduce shadow quality,
- avoid heavy DOF,
- use shorter camera travel,
- simplify drop test,
- preserve key 3D narrative.

Do not replace mobile with a static boring landing page.

---

# 109. MOBILE CALLOUT STYLE

Bottom card.

Margin:

16–18 px.

Width:

viewport minus 32–36 px.

Connector:

optional on very small screen.

If connector becomes visually messy:

- keep active-node highlight,
- omit line,
- maintain label.

---

# 110. ULTRAWIDE

Test at:

2560×1080 / 3440×1440-like aspect ratios.

Do not let callout cards drift too far from model.

Use max-width layout anchors.

Camera should not be simply zoomed out excessively.

---

# 111. REDUCED MOTION

Respect:

`prefers-reduced-motion`.

Reduced mode:

- limit camera travel,
- reduce large rotations,
- disable dramatic parallax,
- show stable product poses,
- keep callout copy,
- keep configurator functional,
- timer may update discretely.

Do not block content.

---

# 112. WEBGL FALLBACK

If WebGL fails:

show:

- approved static render,
- AETHR ONE,
- tagline,
- concise technology overview,
- materials,
- CTA,
- fictional product notice.

Never leave the user on a black screen.

---

# 113. ACCESSIBILITY

Use semantic HTML.

Requirements:

- real buttons,
- real links,
- focus states,
- ARIA labels for icon controls,
- keyboard support for material selection,
- keyboard support for configurator,
- callout text exists in DOM,
- reduced motion,
- useful fallback.

---

# 114. SEO

Title:

`AETHR ONE — Temperature. Engineered.`

Description:

`A fictional interactive premium thermal vessel experience built around precision engineering, smart sensing and advanced thermal design.`

OpenGraph image:

approved product render.

Do not present the fictional product as real inventory.

---

# 115. BRAND COPY STYLE

Short.

Precise.

Confident.

Good:

`Temperature. Engineered.`

Good:

`A SYSTEM IN 43 MILLIMETERS`

Bad:

`Experience the revolutionary next generation future of hydration.`

Avoid filler language.

---

# 116. FINAL COPY DECK

## Hero
`AETHR ONE`

`Precision Thermal Vessel`

`Temperature. Engineered.`

## Material inspection
`RAW TITANIUM`

`Precision brushed finish.`

## Smart Crown
`SMART CROWN`

`Temperature sensing. Hidden until needed.`

## Interior
`NOTHING BETWEEN YOU AND THE VESSEL.`

## Crown architecture
`A SYSTEM IN 43 MILLIMETERS`

## Thermal intro
`COLD.`

`HOT.`

`HELD.`

## Thermal architecture
`BUILT AGAINST HEAT LOSS`

## Layer conclusion
`FIVE LAYERS.`

`ONE PURPOSE.`

`HOLD THE TEMPERATURE.`

## 24 h
`STILL HOT.`

## Charge
`AETHR CHARGE`

`POWER WITHOUT PORTS`

`60 DAYS.`

`ONE CHARGE.`

## Materials
`MAKE IT YOURS`

## Personalization
`YOURS, PRECISELY.`

## Interaction
`GRAB IT.`

`DROP IT.`

## Finale
`AETHR ONE`

`Temperature. Engineered.`

---

# 117. IMPLEMENTATION ORDER — PHASE 1: REPOSITORY AUDIT

Before writing visual code:

1. inspect `package.json`,
2. identify framework and package manager,
3. inspect App Router / Pages Router,
4. inspect TypeScript config,
5. inspect existing CSS strategy,
6. inspect repository file structure,
7. inspect AETHR master package,
8. inspect all canonical GLB nodes,
9. verify dock model exists,
10. verify thermal references exist,
11. verify reference renders exist,
12. identify whether the repo already contains Three.js/R3F,
13. decide where assets will be copied into `public/`,
14. document any incompatibilities before implementation.

Do not begin by guessing model structure.

---

# 118. PHASE 2: FOUNDATION

Build:

- root page,
- fonts,
- global CSS variables,
- reset styles,
- fixed Canvas,
- DOM overlay root,
- navbar,
- sound toggle placeholder,
- chapter indicator,
- loader,
- responsive safe area.

At this stage:

model can still be basic.

Goal:

clean application shell.

---

# 119. PHASE 3: ASSET PIPELINE

Copy canonical assets into a predictable public location, for example:

```text
public/models/aethr/AETHR_ONE_FINAL_CANONICAL.glb
public/models/aethr/AETHR_CHARGE_FINAL.glb
```

Keep reference models if useful:

```text
public/models/aethr/reference/
```

Preload canonical bottle and dock.

Do not fetch from developer filesystem paths at runtime.

---

# 120. PHASE 4: CANONICAL MODEL VALIDATION

Load AETHR ONE.

Verify:

- scale,
- orientation,
- body height,
- Crown position,
- node naming,
- materials,
- no missing textures,
- helper visibility.

Log or inspect nodes once in development.

Remove development logs before production.

---

# 121. PHASE 5: HELPER NODE DEFAULTS

Immediately set:

```js
nodes.Vacuum_Visualization.visible = false
nodes.Vacuum_Bottom_Visualization.visible = false
nodes.Liquid_Volume.visible = false
nodes.OLED_Glyphs_72.visible = false
```

Cache original transforms for all animated nodes.

Never rely on mutated values as the only source of original pose.

---

# 122. PHASE 6: RAW MATERIAL FIRST

Before building dozens of animations, make RAW look premium.

Tune:

- metalness,
- roughness,
- anisotropy,
- environment,
- normal map / directional roughness,
- reflection cards.

Acceptance test:

A static screenshot of RAW must already look convincingly premium.

If it still looks like gray plastic, do not proceed and hide it with animation.

---

# 123. PHASE 7: LIGHTING RIG

Implement:

- key,
- fill,
- rim,
- environment,
- moving reflection.

Create named presets.

Verify:

- good silhouette,
- good surface reflection,
- no purple/magenta accidental cast,
- black Crown readable,
- body does not disappear into background.

---

# 124. PHASE 8: SCROLL ARCHITECTURE

Implement ScrollTrigger chapter system.

Test before complex scene work:

- scroll down,
- scroll up,
- resize,
- browser refresh,
- jumping to anchor,
- slow trackpad,
- fast mouse wheel.

Timeline must remain stable.

---

# 125. PHASE 9: CAMERA RIG

Create one camera controller.

Centralize camera states.

Do not create independent camera tweens in every UI component.

Use interpolation from current state to target state.

---

# 126. PHASE 10: REVEAL

Implement:

- darkness,
- moving light,
- title timing,
- product subtle rotation,
- hero close-up,
- OLED idle flash.

Polish this fully before moving on.

The first 5 seconds define perceived quality of the entire project.

---

# 127. PHASE 11: PRODUCT INSPECTION

Implement:

- controlled rotation,
- RAW label,
- lower-body macro,
- underside tilt,
- recovery to vertical.

Check all screen sizes.

---

# 128. PHASE 12: DYNAMIC OLED

Build dynamic CanvasTexture.

Update only when content changes.

Do not redraw 60 times per second when value is static.

Support:

- off,
- --°,
- 72°,
- READY,
- 4°C,
- COLD,
- 96°C,
- HOT,
- 68%,
- 100%.

Verify texture orientation on model.

---

# 129. PHASE 13: CROWN UNSCREW

Animate `Crown_Group`.

Use original local transform as base.

Create utility like:

```ts
setCrownUnscrew(progress)
```

where `progress` 0–1 deterministically computes rotation and lift.

Prefer deterministic progress mapping over chained stateful mutations.

This makes reverse scroll reliable.

---

# 130. PHASE 14: SENSE INSPECTION

Add:

- Crown presentation tilt,
- camera move,
- sensor highlight,
- first callout connector.

Use this as first real test of projected 3D anchors.

---

# 131. PHASE 15: INSIDE CAMERA

Implement carefully.

Add collision-like minimum distance to prevent camera entering geometry accidentally.

Test:

- desktop,
- ultrawide,
- mobile.

Avoid clipping through neck.

---

# 132. PHASE 16: CROWN EXPLODED

Cache rest transforms.

Implement per-part target offsets.

Create normalized helper:

```ts
setCrownExplodedProgress(progress)
```

Every part computes its local progress from master progress.

Do not create separate uncontrolled GSAP timelines for each mesh if it makes reverse logic fragile.

---

# 133. PHASE 17: GENERIC CALLOUT COMPONENT

Build reusable component.

Inputs:

```ts
{
  index,
  title,
  facts,
  description,
  anchorObject,
  preferredSide,
  visible,
  active
}
```

Output:

- card,
- connector,
- projected anchor.

Reuse across Crown and Thermal.

---

# 134. PHASE 18: CROWN CALLOUT TIMELINE

Order:

1. OLED
2. CORE
3. POWER CELL
4. INDUCTIVE POWER
5. AETHR SENSE

Give each enough scroll space.

Do not rapidly cycle labels.

User must have time to understand each.

---

# 135. PHASE 19: CROWN REASSEMBLY

Reverse exploded.

Return Crown to thread.

Verify no transform drift.

The exact final transform must equal original closed pose.

---

# 136. PHASE 20: LIQUID SYSTEM

Implement liquid volume independently of pour stream.

Components:

- container liquid level,
- incoming stream,
- outgoing stream,
- optional droplets.

Keep separate controls:

```ts
setFillLevel(0..1)
setPourState(...)
```

---

# 137. PHASE 21: COLD

Build:

- open,
- fill,
- close,
- OLED,
- cold light,
- text.

Keep scene concise.

---

# 138. PHASE 22: HOT

Build:

- empty cold,
- warm light transition,
- hot fill,
- steam,
- close,
- OLED HOT,
- timer start.

Ensure thermal timer becomes part of persistent overlay state.

---

# 139. PHASE 23: TIMER ENGINE

Create a pure mapping function:

```ts
getThermalState(progress): {
  seconds,
  temperature
}
```

No side effects.

This guarantees reverse scroll works.

Format:

`HH:MM:SS`

Temperature:

whole °C or one decimal only if visually useful.

---

# 140. PHASE 24: THERMAL CUTAWAY

First attempt:

runtime clipping / reveal.

If unacceptable:

use dedicated thermal reference model with carefully matched world transform and crossfade.

Do not sacrifice visual quality just to preserve technical purity.

---

# 141. PHASE 25: THERMAL PEEL

Final presentation:

water closest to inner content side.

Then:

- Inner Vessel,
- Low-E,
- Vacuum,
- Outer Shell.

Do not recreate the rejected order.

Use small, readable offsets.

---

# 142. PHASE 26: THERMAL CALLOUTS

Use same callout UI as Crown.

Sequence:

1. Inner Vessel
2. Low-E Surface
3. Vacuum Core
4. Titanium Shell

Water uses temperature readout, not callout card.

---

# 143. PHASE 27: HEAT VISUALIZATION

Build a small reusable heat effect.

Do not attempt CFD.

Use authored trajectories.

States:

- outgoing,
- reflected,
- stopped/faded.

LOW-E:

reflection.

Vacuum:

fade.

---

# 144. PHASE 28: THERMAL REASSEMBLY

Return exact transforms.

Hide helper vacuum.

Close clipping.

Restore normal material state.

Keep timer active.

---

# 145. PHASE 29: TIME COMPRESSION

Map local progress into later thermal timer range.

Animate light state slowly.

Avoid excessive model motion.

This chapter works because the product is calm while time changes.

---

# 146. PHASE 30: STEAM AFTER 24H

Steam appears only after Crown opens.

Use a smaller system than during hot fill.

Goal:

“still warm/hot,” not “boiling violently.”

---

# 147. PHASE 31: POUR / MATCH CUT

Implement pour first.

Then build transition to dock.

Do not attempt elaborate morph until both source and destination scenes look correct independently.

---

# 148. PHASE 32: AETHR CHARGE MODEL

Load dock in same Canvas.

Verify:

- correct scale relative to Crown,
- ceramic top,
- light ring,
- refined USB-C,
- dock height.

Place outside frame until charging chapter.

---

# 149. PHASE 33: DOCK MATERIALS

Replace fallback materials.

Dock housing:

same family as RAW titanium.

Top:

near-black ceramic.

USB-C bezel:

polished metal.

USB-C cavity:

deep black.

Contacts:

subtle gold.

Status ring:

invisible when off.

---

# 150. PHASE 34: DOCKING

Build deterministic:

```ts
setDockingProgress(progress)
```

Crown:

- approaches,
- tiny magnetic correction,
- lands.

Status ring:

trigger based on progress range, not uncontrolled timeout if tied to scroll.

OLED:

charge percentage.

---

# 151. PHASE 35: CHARGING DEEP DIVE

Highlight:

- Crown coil,
- dock coil,
- Crown battery.

Use the rest only as supporting geometry.

Add field effect.

Add battery and charge callouts.

---

# 152. PHASE 36: USB-C MICRO DETAIL

Optional short orbit.

Make sure refined port is visible and correctly shaded.

Do not stop the whole story for USB-C.

This is a reward detail.

---

# 153. PHASE 37: MATERIAL CONFIGURATOR

Implement material presets as state.

Do not duplicate model.

Material state should persist to final hero and configurator.

---

# 154. PHASE 38: ENGRAVING

Implement live input.

Debounce texture regeneration if needed.

Do not rerender entire React tree on every keystroke if avoidable.

---

# 155. PHASE 39: USER DRAG

Enable controlled interaction only in relevant chapter.

Disable scroll-conflicting gestures carefully.

Touch:

avoid trapping vertical page scroll unnecessarily.

---

# 156. PHASE 40: DROP TEST

Move from scripted transforms to physics in a controlled handoff.

Before enabling:

store target reset state.

After reset:

disable rigid body behavior / restore scripted transform.

---

# 157. PHASE 41: FINAL HERO

Use selected material and engraving state.

Return camera and lighting to highest-quality final composition.

Show price and CTA.

---

# 158. PHASE 42: CONFIGURATOR / CART

UI should use normal React/DOM.

Do not implement checkout unless required.

The fictional nature must remain clear.

---

# 159. PHASE 43: MOBILE PASS

Do not postpone mobile until after everything is “finished.”

Perform dedicated pass:

- every camera state,
- every callout,
- every large title,
- every control,
- loading,
- thermal timer,
- configurator.

---

# 160. PHASE 44: REDUCED MOTION PASS

Test browser reduced-motion setting.

Make sure content is still understandable.

---

# 161. PHASE 45: PERFORMANCE PASS

Measure actual frame rate and frame cost.

Do not optimize by intuition only.

Inspect:

- GPU time,
- draw calls,
- texture memory,
- shadow maps,
- React renders,
- particle count,
- postprocessing cost.

---

# 162. ADAPTIVE QUALITY

Optional but useful.

Quality levels:

## High
- DPR up to 2,
- full shadow,
- particles,
- DOF macro.

## Medium
- DPR ~1.5,
- lower shadow,
- fewer particles,
- no heavy DOF.

## Low
- DPR ~1,
- simple contact shadow,
- minimal particles,
- reduced postprocessing.

Change only after sustained performance evidence.

---

# 163. CSS TRANSITION RULES

UI transitions:

150–350 ms.

Large title reveals:

500–900 ms.

Product motion:

longer and tied to scroll.

Never apply `transition: all`.

Specify properties.

---

# 164. UI HOVER RULES

Buttons:

small scale / opacity.

Material swatch:

small border intensity.

Navbar links:

opacity / underline line.

No dramatic 20 px translations.

---

# 165. FOCUS STATES

Keyboard focus:

visible 2 px outline or custom high-contrast ring.

Do not remove outline without replacement.

---

# 166. LOADING FAILURE STATE

If GLB fails:

show static fallback.

Text:

`3D EXPERIENCE UNAVAILABLE`

Then normal product copy.

Do not expose raw error stack.

---

# 167. ERROR BOUNDARY

Wrap WebGL experience in an error boundary.

A failure in R3F must not destroy the entire page.

---

# 168. MEMORY / DISPOSAL

Dispose temporary materials / render targets.

Avoid recreating:

- CanvasTexture,
- vectors,
- geometries,
- particle materials

inside React render unnecessarily.

Memoize static assets.

---

# 169. FRAME LOOP DISCIPLINE

Use `useFrame` only where continuous updates are truly necessary:

- projected anchors,
- active shader animations,
- interaction,
- camera smoothing.

Static UI should not trigger per-frame React state updates.

Use refs.

---

# 170. CALL OUT PROJECTION PERFORMANCE

Do not `setState` 60 times/sec for every connector.

Prefer:

- refs,
- CSS custom properties,
- direct style transforms,
- one centralized projection loop.

---

# 171. RESIZE

On resize:

- recalculate viewport-related callout layout,
- maintain camera framing,
- recalculate safe areas,
- do not reset experience to top.

---

# 172. REFRESH MID-PAGE

If possible, restoring page at mid-scroll should not show a completely wrong 3D pose.

On initialization:

derive scene state from current scroll position after assets load.

---

# 173. FAST SCROLLING

User may fling trackpad rapidly.

Animations must not queue endlessly.

GSAP scrub / deterministic progress is preferred.

Avoid event-driven animations that must finish before next one starts.

---

# 174. TOUCH GESTURES

During drag chapter:

distinguish horizontal object drag from vertical page scroll.

Use a movement threshold.

Do not make mobile page impossible to scroll.

---

# 175. AUDIO UX

Sound toggle:

top-right or navbar.

State must persist during session.

Optionally store in localStorage.

Default off.

---

# 176. CONFIGURATOR STATE

Suggested shape:

```ts
type ConfigState = {
  finish: "RAW" | "OBSIDIAN" | "FROST" | "SAND"
  engraving: string
  engravingMode: "none" | "vertical" | "minimal" | "monogram"
  quantity: number
}
```

Do not let quantity fall below 1.

---

# 177. MATERIAL SWATCH COLORS

UI swatches approximate appearance:

```css
RAW      #8E8F8D
OBSIDIAN #1A1C1E
FROST    #C0C4C4
SAND     #9B8D78
```

Remember: the real 3D appearance is not just the swatch HEX.

---

# 178. CARD RADIUS POLICY

Use:

8–14 px.

Avoid excessive 24–40 px “SaaS card” rounding.

The physical product itself is already rounded; UI should stay precise.

---

# 179. GLASSMORPHISM POLICY

Only use subtle translucency for:

- callout cards,
- temporary technical overlays.

Do not put every section inside glass rectangles.

---

# 180. GRADIENT POLICY

Avoid decorative gradients.

Allowed:

- light falloff,
- subtle black opacity fades,
- vignette,
- environmental light.

No colorful hero gradient backgrounds.

---

# 181. SECTION TRANSITIONS

Use:

- camera motion,
- light motion,
- product motion,
- black fades only when necessary.

Do not use completely unrelated transition effects per section.

The entire site must share one motion language.

---

# 182. INFORMATION DENSITY

Never show:

- timer,
- 3 callouts,
- giant headline,
- navbar,
- material selector,
- cursor label

all competing at once.

Use hierarchy.

One dominant message per moment.

---

# 183. RHYTHM

Desired rhythm:

1. Reveal — strong.
2. Inspection — calm.
3. Crown exploded — strong/technical.
4. Cold — short.
5. Hot — strong.
6. Thermal — slow/educational.
7. Time compression — dramatic.
8. Charging — elegant.
9. Materials — calm.
10. Personalization — interactive.
11. Drop test — playful.
12. Finale — monumental/calm.

Do not maintain “maximum wow” continuously.

---

# 184. DESKTOP COMPOSITION

When callout card is left:

move product slightly right.

When card is right:

move product slightly left.

Do not let card cover the product.

Use camera composition rather than CSS overlay hacks when possible.

---

# 185. SAFE TEXT WIDTH

Large display:

can span wide.

Body:

max ~420 px.

Callout description:

max ~300 px.

Avoid long full-width paragraphs.

---

# 186. MOBILE DISPLAY TYPE

Large title:

`clamp(48px, 18vw, 82px)`

Keep line-height tight.

Avoid words clipping off-screen.

---

# 187. MOBILE NAV

Full-screen menu:

background `#070809`.

Links large but restrained:

28–36 px.

Close icon top-right.

No hamburger animation circus.

---

# 188. CONFIGURATOR MOBILE

Use bottom sheet / full screen.

Material selector horizontally scrollable only if needed.

Engraving input full width.

---

# 189. FINAL FOOTER MOBILE

Stack:

AETHR

links

COPENHAGEN — MMXXVI

fictional notice.

Keep generous spacing.

---

# 190. VISUAL QA — PRODUCT

Reject build if:

- titanium looks plastic,
- Crown seam is too obvious,
- Crown looks narrower than body,
- OLED floats above glass,
- sensor looks like a probe,
- battery is a gray random block,
- thermal layers intersect,
- vacuum looks like a blue physical tube,
- liquid floats outside vessel,
- dock looks like a generic disc,
- USB-C looks like a rectangle sticker.

---

# 191. VISUAL QA — LIGHTING

Reject build if:

- product has purple/pink accidental highlights,
- black Crown disappears entirely,
- no directionality in brushed metal,
- highlights clip to white everywhere,
- shadows are sharp and game-like,
- background is visibly blue/cyan.

---

# 192. MOTION QA

Verify:

- reverse scroll works,
- no transform drift,
- Crown returns exactly closed,
- thermal layers return exactly,
- timer reverses,
- camera does not jump,
- fast scroll does not queue animations,
- no bounce / elastic in core sequences.

---

# 193. UI QA

Verify:

- icon consistency,
- no random icon library mixing,
- no text clipping,
- no callout overlap,
- correct focus states,
- buttons not excessively rounded,
- no generic “template” appearance.

---

# 194. FUNCTIONAL QA

Run:

- local dev,
- production build,
- production preview if available.

Check:

- TypeScript,
- lint if configured,
- console,
- network,
- missing assets,
- hydration,
- memory leaks.

---

# 195. REQUIRED BUILD CHECK

Final project must pass the repository’s production build command.

Typical:

```bash
npm run build
```

or equivalent package manager command.

Do not declare completion if build fails.

---

# 196. TARGET TEST DEVICES / VIEWPORTS

At minimum:

- 1366×768
- 1440×900
- 1920×1080
- 2560×1080
- 2560×1440
- 390×844
- 430×932

Also resize continuously between widths.

---

# 197. FINAL DEFINITION OF DONE

The experience is only “done” when all of the following are true:

1. loader works from actual asset progress,
2. reveal is cinematic,
3. RAW material looks premium,
4. product inspection works,
5. underside view works,
6. OLED is dynamic,
7. Smart Crown unscrews realistically,
8. AETHR Sense is shown,
9. interior inspection works,
10. Crown exploded works,
11. OLED callout works,
12. Core callout works,
13. battery teaser works,
14. coil teaser works,
15. Sense callout works,
16. Crown reassembles precisely,
17. COLD sequence works,
18. HOT sequence works,
19. timer starts at sealing,
20. timer reverses with scroll,
21. thermal cutaway works,
22. water order is correct,
23. Inner Vessel callout works,
24. Low-E looks like coating,
25. Vacuum looks like empty space,
26. titanium shell callout works,
27. thermal reassembly works,
28. timer reaches 24h / 58°C storytelling state,
29. steam-after-24h works,
30. pour works,
31. match cut to dock works,
32. AETHR CHARGE is correctly modeled,
33. Crown docks magnetically,
34. status ring works,
35. charging OLED works,
36. battery deep dive works,
37. coil field visualization works,
38. refined USB-C is visible when inspected,
39. material selector works,
40. all four finishes look credible,
41. material macro works,
42. engraving works,
43. drag interaction works,
44. drop test works,
45. reset works,
46. final hero uses selected configuration,
47. configurator works,
48. fictional product notice exists,
49. desktop works,
50. mobile works,
51. ultrawide works,
52. reduced motion works,
53. WebGL fallback works,
54. no critical console errors,
55. production build passes,
56. performance is acceptable.

---

# 198. FINAL CREATIVE RULE

Whenever a design decision is unclear, choose the option that is:

- simpler,
- quieter,
- more precise,
- more physically plausible,
- more product-focused.

Do not add an effect because it is technically possible.

The product remains the hero.

> **AETHR ONE should feel engineered before it feels animated.**

---

# 199. EXECUTION PRIORITY

When time or performance forces tradeoffs, protect quality in this order:

1. product geometry,
2. product material,
3. lighting,
4. camera,
5. core motion,
6. technical storytelling,
7. typography,
8. callout clarity,
9. performance,
10. decorative effects.

Simplify decoration before simplifying the product story.

---

# 200. FICTIONAL PRODUCT NOTICE

AETHR, AETHR ONE and AETHR CHARGE are fictional concepts created for portfolio/showcase purposes.

Values such as:

- €249 price,
- 60-day battery life,
- ~45-minute charge time,
- 24-hour thermal performance,
- ±0.5°C sensing target,
- 2.2" OLED,
- specific material claims,

are storytelling specifications, not validated commercial test results.

The public site must include:

> **A fictional product experience.**

---

# 201. AGENT EXECUTION INSTRUCTION

If this file is provided to an AI coding agent, the agent should:

1. read this document completely,
2. inspect the local master asset package,
3. inspect the actual repository,
4. inspect model nodes before coding,
5. build the experience in the implementation order above,
6. make sensible decisions without stopping for trivial questions,
7. use reference poses as references rather than blindly switching models,
8. keep the canonical GLB as the core asset,
9. continuously run and validate the application,
10. finish with production build and QA.

The agent must not stop after creating:

- only a hero,
- only a spinning model,
- only a few static sections,
- only a proof of concept.

The requested output is the **complete AETHR ONE product experience** described in this specification.

---

# 202. FINAL REPORT REQUIRED FROM IMPLEMENTING AGENT

After completion, report:

1. what was built,
2. final tech stack,
3. location of main experience code,
4. location of camera timeline,
5. location of material presets,
6. location of OLED logic,
7. location of thermal timer logic,
8. location of AETHR CHARGE logic,
9. location of drop-test logic,
10. asset optimization performed,
11. responsive adaptations,
12. accessibility adaptations,
13. performance simplifications,
14. commands to run locally,
15. production build command,
16. whether production build passed,
17. any remaining TODOs.

Do not produce this report until actual implementation and build validation are complete.

---

# END OF MASTER SPECIFICATION

**AETHR ONE**  
**Temperature. Engineered.**
