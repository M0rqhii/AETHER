# AETHR ONE — THREE.JS MATERIALS & LIGHTING

## Najważniejsza zasada

Kolor z GLB NIE jest finalnym wyglądem produktu.
GLB dostarcza geometrię i hierarchy.

Finalny look ma powstać w Three.js:
- MeshPhysicalMaterial
- environment map / HDRI
- anisotropy
- roughness
- moving studio lights
- postprocessing

---

# RAW TITANIUM

Docelowo:
- lekko ciepłe srebro
- metalness ~1
- roughness ~0.24–0.34
- anisotropy wyraźna, ale nie ekstremalna
- pionowa brushed texture / procedural normal/roughness

Nie używać:
- płaskiego szarego koloru
- fioletowych przypadkowych refleksów
- bardzo mlecznych highlightów

## Environment
Premium dark studio HDRI lub własny light-card rig.

Najważniejsze są odbicia dużych jasnych prostokątów jak softboxy.

---

# MATERIAL PRESETS

## RAW
Neutral warm titanium.

## OBSIDIAN
Very dark graphite metal.
Nie absolutna czerń — nadal musi odbijać światło.

## FROST
Jaśniejsze, chłodniejsze srebro.

## SAND
Ciepły champagne titanium.
Bez złotego / luksusowego kiczu.

---

# CROWN GLASS

- near-black
- low roughness
- subtelne odbicia
- OLED pod szkłem
- ekran po wygaszeniu praktycznie znika

---

# OLED

Dynamiczny.
Nie wypalać tekstu na stałe.

Opcje:
1. CanvasTexture na osobnym mesh `OLED_Panel`
2. render target
3. shader

Stany:
- --°
- 72°
- 4°C
- COLD
- 96°C
- HOT
- 68%
- 100%

---

# LIQUID

`Liquid_Volume` jest helperem.

Finalny shader powinien:
- być transparentny,
- mieć subtelną refrakcję,
- nie wyglądać jak niebieski plastik,
- przy HOT korzystać raczej z ciepłego światła niż czerwonego koloru wody,
- przy COLD może dostać chłodne refleksy.

---

# LOW-E SURFACE

Bardzo cienki wizualny coating.
Nie gruba pomarańczowa rura.

Kolor widoczny głównie przez refleks:
- champagne / copper hint
- metallic
- low roughness

W normalnym zamkniętym produkcie nie powinien być widoczny.

---

# VACUUM

Vacuum = pusta przestrzeń.

`Vacuum_Visualization` domyślnie:
`visible = false`

Podczas thermal reveal:
- bardzo niska opacity / additive effect
- outline / subtle particles
- nie traktować jako materialnego elementu konstrukcji

---

# LIGHT RIG

Minimum:

## Key
Duży AreaLight / softbox.
Najważniejszy dla powierzchni cylindra.

## Fill
Słabszy, chłodniejszy.

## Rim
Za produktem dla separacji od czerni.

## Moving Light Card
Animowany refleks podczas:
- reveal
- 360
- material macro
- final hero

---

# COLD STATE
- cooler environment
- steel-blue reflections
- bez robienia całego backgroundu na niebiesko

# HOT STATE
- warm amber key / rim
- subtle warm particles
- bez czerwonego gamingowego tła

# CHARGING
- clean cool whites
- minimalistyczny glow OLED

---

# SHADOWS

Cienie:
- miękkie
- kontaktowe
- oszczędne

Nie robić bardzo czarnych, ostrych cieni.

Dla performance:
- desktop: sensowne shadow maps / contact shadows
- mobile: uproszczenie lub baked-ish contact shadow

---

# POSTPROCESSING

Subtelnie:
- tone mapping
- vignette bardzo delikatna
- bloom tylko dla OLED / charging / wybranych particles
- depth of field tylko w wybranych macro shots

Unikać:
- ciężkiego bloom wszędzie
- chromatic aberration bez powodu
- przesadnego noise / film grain
