# AETHR ONE — ANIMATION / SCROLL TIMELINE

## Założenie techniczne
Jedna główna scena R3F.
GSAP + ScrollTrigger steruje globalnym progress.
Reference GLB-y służą jako cele / wzorce transformacji.

## Zalecany scroll distance

| Chapter | Scroll |
|---|---:|
| Initialization / Reveal | 1200 px |
| 360 inspection | 1800 px |
| Crown opening + inside | 1600 px |
| Crown exploded + callouts | 3200 px |
| Cold | 1200 px |
| Hot fill | 1200 px |
| Thermal architecture | 3600 px |
| Time compression | 1800 px |
| Charging | 2600 px |
| Materials | 1800 px |
| Personalization | 1500 px |
| Drop test | 1500 px |
| Finale | 1200 px |

Łącznie orientacyjnie: ~23–25 tys. px wirtualnego scrolla.

---

# PROGRESS MAP 0.00–1.00

## 0.000–0.055 — Reveal
- model w ciemności
- light sweep
- AETHR / ONE
- camera push-in

## 0.055–0.125 — Product inspection
- Y rotation
- light orbit
- camera underside
- powrót do pionu

## 0.125–0.180 — Smart Crown
- camera move up
- OLED 72°
- fade OLED
- Crown unscrew
- Crown lift
- tilt Crown for AETHR Sense
- body tilt + look inside

## 0.180–0.315 — Crown exploded
- Glass
- OLED
- Flex
- PCB
- Li-Po
- Coil
- Sense

Sequential callouts:
0.205 OLED
0.230 Core
0.255 Battery
0.280 Inductive
0.305 Sense

## 0.315–0.350 — Crown reassembly
- reverse exploded
- Crown align
- lower
- screw
- OLED --°

## 0.350–0.405 — Cold
- unscrew
- fill Liquid_Volume
- close
- OLED 4°C
- COLD
- empty

## 0.405–0.455 — Hot fill
- warm light state
- fill hot water
- steam particles
- screw Crown
- OLED 96°C / HOT
- thermal timer starts

## 0.455–0.640 — Thermal architecture
- timer continues
- camera macro
- clipping / cutaway reveal
- peel sequence
- inner vessel callout
- low-E callout
- vacuum callout
- outer shell callout
- wide five-layer shot

## 0.640–0.685 — Thermal reassembly
- reverse peel
- close cutaway
- product monolithic again

## 0.685–0.750 — Time compression
- day light transition
- timer accelerates to 24:00
- temperature maps to 58°C
- STILL HOT

## 0.750–0.785 — Open / pour
- Crown unscrew
- steam
- pour
- camera follows last droplet

## 0.785–0.865 — AETHR Charge
- droplet match cut -> puck
- Crown lands
- charging OLED
- battery / coil mini exploded
- 60 DAYS / ONE CHARGE

## 0.865–0.915 — Materials
- RAW -> OBSIDIAN -> FROST -> SAND
- macro material shot

## 0.915–0.950 — Personalization
- engraving UI
- dynamic decal/text texture

## 0.950–0.980 — Drop test
- release scripted camera
- enable Rapier rigid body
- grab / throw / impact
- RESET

## 0.980–1.000 — Finale
- reset product pose
- final studio light
- AETHR ONE
- CTA

---

# Crown unscrew

Animate `Crown_Group`:
- `rotation.z`: ~0 -> 4π
- `position.z`: 0 -> +0.075 to +0.09 m

Ruch powinien wyglądać ciężko i precyzyjnie.
Nie używać bounce.

---

# Crown exploded

W produkcji najlepiej zapisać start transforms przy loadzie:

```js
const rest = {
  OLED_Panel: nodes.OLED_Panel.position.clone(),
  PCB_Main: nodes.PCB_Main.position.clone(),
  LiPo_Pouch: nodes.LiPo_Pouch.position.clone(),
  Charging_Coil: nodes.Charging_Coil.position.clone(),
  AETHR_Sense_Window: nodes.AETHR_Sense_Window.position.clone(),
}
```

Następnie sterować offsetem przez normalized progress.

---

# Thermal peel

Finalna kolejność:
1. Liquid
2. Inner Vessel
3. Low-E
4. Vacuum
5. Outer Shell

Reference:
`01_MODELS/thermal/THERMAL_PEEL_CUTAWAY.glb`

W głównej stronie lepiej animować node'y / clipping niż przełączać całe modele.

---

# Timer mapping

Przykładowa funkcja storytellingowa:
- progress 0.00: 00:00 / 96°C
- 0.20: 01:00 / 94°C
- 0.45: 04:00 / 91°C
- 0.65: 09:00 / 80°C
- 0.80: 12:00 / 75°C
- 0.92: 18:00 / 65°C
- 1.00: 24:00 / 58°C

Warto użyć nieliniowego easing czasu, nie liniowego real-time.

---

# Kamera

Ruch:
- slow
- cinematic
- power2.inOut / power3.inOut
- żadnego elastic / bounce

Przy exploded:
- camera 3/4
- lekko z góry
- miejsce z boku na callout DOM

---

# Światło

Light state jest częścią timeline:
- reveal: ciemny, ruchomy softbox
- cold: chłodny fill
- hot: ciepły amber key
- thermal: neutral studio + warm energy particles
- charging: clean cool white
- materials: neutral color-accurate
- finale: dramatyczny premium studio
