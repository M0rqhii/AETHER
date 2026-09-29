# AETHR ONE — IMPLEMENTATION GUIDE

## Stack
- Next.js
- React
- React Three Fiber
- Three.js
- GSAP
- ScrollTrigger
- Rapier
- postprocessing

Deploy:
- Vercel

## Architektura
Jedna główna `<Canvas>` scena.
DOM content / callouts nad canvasem.

Przykład:
```tsx
<main>
  <ExperienceCanvas />
  <OverlayUI />
  <ScrollChapters />
</main>
```

Canvas:
- fixed
- full viewport
- pointer events zależnie od chaptera

## Loading
Preload:
- canonical GLB
- HDR environment
- kluczowe tekstury

Lazy load:
- cięższe postprocessy
- drop-test audio
- opcjonalne assets mobile

## Canonical model
Load:
`/models/AETHR_ONE_FINAL_CANONICAL.glb`

Po loadzie:
- cache starting transforms
- ukryj helpery
- podmień materiały
- podmień OLED na dynamiczny

## Helper defaults
```js
nodes.Vacuum_Visualization.visible = false
nodes.Vacuum_Bottom_Visualization.visible = false
nodes.Liquid_Volume.visible = false
nodes.OLED_Glyphs_72.visible = false
```

## Smart Crown
Animować parent:
`Crown_Group`

Dzięki temu cała elektronika i glass jadą razem przy unscrew.

## Exploded Crown
Dopiero po odkręceniu animować dzieci / electronics.

## Thermal
Nie przełączać brutalnie całego GLB.

Preferowane:
- runtime clipping plane
- podświetlanie node'ów
- helper vacuum
- helper liquid
- transform offsets zgodne z `THERMAL_PEEL_CUTAWAY.glb`

Jeżeli runtime clipping okaże się zbyt problematyczny:
użyć osobnego thermal GLB jako dedykowanej sceny / crossfade.

## Scroll
Każdy chapter posiada własny pinned section i timeline.
Globalny stan chaptera steruje:
- camera state
- model state
- light state
- DOM state

## Dynamic OLED
Najprościej:
- canvas 512x512
- CanvasTexture
- update tylko gdy zmienia się wartość

Nie renderować nowego canvasu co frame bez potrzeby.

## Callout anchors
Anchor można zdefiniować:
- jako world position środka mesha,
- albo jako mały niewidoczny Object3D dodany runtime.

Projection:
```js
const p = new THREE.Vector3()
object.getWorldPosition(p)
p.project(camera)

const x = (p.x * 0.5 + 0.5) * width
const y = (-p.y * 0.5 + 0.5) * height
```

## Materials
Nie polegać na fallback material z GLB.
Patrz `MATERIALS_LIGHTING.md`.

## Drop test
W normalnych scenach model nie powinien być rigid body.

Dopiero chapter DROP:
- kopia / rigid wrapper
- Rapier dynamic body
- drag joint / pointer impulse
- collision audio

Po RESET wrócić do scripted transform mode.

## Responsive
Desktop:
pełne doświadczenie.

Mobile:
- DPR clamp
- mniej particles
- mniej shadow resolution
- skrócone callouty
- callout cards na dole
- brak ciężkiego DOF
- uproszczony drop test
- opcjonalny device orientation subtle parallax

## Accessibility
- respektować `prefers-reduced-motion`
- alternatywny statyczny product view
- callouty dostępne tekstowo w DOM
- CTA nie może wymagać WebGL interakcji
- nie blokować całej strony, jeśli WebGL nie wystartuje

## Performance targets
Orientacyjnie:
- canonical GLB najlepiej utrzymać możliwie mały po kompresji
- Draco / Meshopt
- KTX2 dla tekstur
- lazy-load sekcji
- unikaj nadmiernej liczby dynamicznych shadow-casting lights
- clamp DPR na high-density mobile
