# AETHR ONE — FINAL MASTER PACKAGE

To jest finalna paczka robocza projektu fikcyjnego produktu premium **AETHR ONE**,
przygotowana pod showcase WWW w Next.js / React Three Fiber / Three.js / GSAP,
hostowany docelowo na Vercelu.

## Najważniejszy plik

`01_MODELS/AETHR_ONE_FINAL_CANONICAL.glb`

To jest **kanoniczny model**, od którego należy zaczynać implementację strony.
Zawiera:
- finalną monolityczną bryłę 76 mm,
- Smart Crown,
- OLED,
- AETHR Sense bez wystającej sondy,
- PCB i elektronikę,
- realistyczniejszy pouch Li-Po,
- cewkę indukcyjną,
- inner vessel,
- low-E / reflective layer,
- helper próżni,
- helper cieczy.

### Parametry pliku
- geometrie: 45
- trójkąty: 85620
- jednostki GLB: metry
- docelowa wysokość produktu: ok. 286 mm
- docelowa średnica: 76 mm

## Ważne: helpery runtime

Po załadowaniu głównego GLB w Three.js należy domyślnie ukryć:

- `Vacuum_Visualization`
- `Vacuum_Bottom_Visualization`
- `Liquid_Volume`
- `OLED_Glyphs_72`

Są to elementy przeznaczone do animacji / storytellingu.
OLED ma być finalnie sterowany dynamicznie przez CanvasTexture lub osobny shader.

## Katalogi

### 01_MODELS
Główna geometria i reference poses.

### 02_CAD
STEP:
- body + układ termiczny,
- Smart Crown / elektronika.

### 03_STL_COMPONENTS
Osobne komponenty do inspekcji i ewentualnej dalszej obróbki.

### 04_REFERENCES
Zatwierdzony kierunek wizualny i podglądy kluczowych exploded views.

### 05_DOCUMENTATION
Pełny brief produktu, teksty strony, timeline, materiały, node map.

### 06_IMPLEMENTATION
Gotowe notatki i pomocnicze pliki JS do startu implementacji R3F/GSAP.

## Których plików używać do czego

| Cel | Plik |
|---|---|
| normalna strona / główny model | `AETHR_ONE_FINAL_CANONICAL.glb` |
| otwieranie korka – pozycja referencyjna | `poses/AETHR_ONE_OPEN.glb` |
| inspekcja spodu korka | `poses/AETHR_ONE_INSPECTION.glb` |
| pełny exploded | `poses/AETHR_ONE_FULL_EXPLODED.glb` |
| Smart Crown exploded | `poses/SMART_CROWN_EXPLODED.glb` |
| finalny thermal reveal | `thermal/THERMAL_PEEL_CUTAWAY.glb` |
| thermal pose przed rozsunięciem | `thermal/THERMAL_CUTAWAY_ASSEMBLED.glb` |

Reference poses są **referencjami transformacji**, a nie modelami, między którymi należy przełączać
w produkcyjnej stronie. Docelowo najlepiej animować node'y głównego GLB.

## Status projektu

Model jest modelem **koncepcyjnym / showcase**, a nie zwalidowaną dokumentacją produkcyjną.
Parametry marketingowe w dokumentacji (czas utrzymywania temperatury, czas pracy baterii,
dokładność sensora itd.) są założeniami fikcyjnego produktu i służą narracji strony.


## AETHR CHARGE

Finalny model magnetycznego docka został dodany do paczki.

Główne pliki:
- `01_MODELS/dock/AETHR_CHARGE_FINAL.glb`
- `01_MODELS/dock/AETHR_CHARGE_EXPLODED.glb`
- `01_MODELS/dock/AETHR_CHARGE_DOCKED_CROWN.glb`

CAD:
- `02_CAD/AETHR_CHARGE_FINAL.step`

Dokumentacja:
- `05_DOCUMENTATION/AETHR_CHARGE_SPEC.md`
- `05_DOCUMENTATION/AETHR_CHARGE_IMPLEMENTATION.md`

Dock powinien być używany jako osobny asset w tej samej scenie R3F co AETHR ONE.
