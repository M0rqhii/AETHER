# AETHR ONE — WEBSITE MASTER BRIEF

## Idea nadrzędna

Strona nie ma być klasycznym landingiem z szeregiem sekcji.
Ma być **interaktywną premierą produktu**, w której scroll reżyseruje jeden
ciągły świat 3D.

Główna zasada:

> Scroll nie przewija strony. Scroll reżyseruje produkt.

Canvas 3D przez większość doświadczenia pozostaje fixed / sticky.
Rozdziały scrolla sterują:
- kamerą,
- modelem,
- transformacjami node'ów,
- światłem,
- materiałami,
- OLED-em,
- calloutami HTML,
- particles / heat-flow,
- timerem testu.

---

## Visual language

### Charakter
- premium
- precision engineering
- industrial luxury
- quiet technology
- bez cyberpunku
- bez gamingowego RGB
- bez agresywnych neonów

### Tło
Prawie czarne:
- #070809
- #0A0B0C

### Tekst
- główny: złamana biel
- drugorzędny: 45–55% opacity

### Akcenty narracyjne
- COLD: subtelne chłodne stalowe światło
- HOT: bursztynowe / ciepłe refleksy
- LOW-E: złoto-miedziany refleks
- CHARGING: czysta biel / chłodny glow

---

# SCENY

## 00 — INITIALIZATION

Czarny ekran.

Tekst:
`AETHR`
`INITIALIZING EXPERIENCE`

Wskaźnik 00–100, najlepiej w formie okręgu przypominającego Smart Crown.

Po 100:
`--°`

Fade do właściwej sceny.

---

## 01 — REVEAL

Termos jest już w scenie, ale niemal niewidoczny.

Scroll:
1. softbox ujawnia kontur,
2. drugi refleks pokazuje brushed titanium,
3. model wykonuje subtelne 10–15° ruchu.

Tekst:
`AETHR`
`ONE`

Podtytuł:
`Precision Thermal Vessel`

Hasło:
`Temperature. Engineered.`

Ruch ma być wolny i ciężki.

---

## 02 — HERO PRODUCT SHOT

Tekst znika.
Kamera przybliża produkt.

OLED:
`--°`
następnie wygaszenie.

Małe:
`SCROLL TO EXPLORE`

---

## 03 — PRODUCT INSPECTION / 360°

Nie zwykły obrót na osi.

Faza A:
- obrót ok. 180°
- moving light sweep
- tekst `RAW TITANIUM`

Faza B:
- dalsze 100–140°
- macro monogramu AETHR

Faza C:
- termos pochyla się 25–30°
- kamera schodzi pod produkt
- pokazanie spodu
- delikatne oznaczenia AETHR ONE / 750 ML / A01

Potem powrót do pionu.

---

## 04 — SMART CROWN INTRO

Kamera przesuwa się w górę.
Crown wypełnia większą część ekranu.

OLED:
`72°`
`READY`

Po chwili gaśnie.

Tekst:
`SMART CROWN`

Opis:
`Temperature sensing. Hidden until needed.`

---

## 05 — UNSCREW

Animować cały `Crown_Group`.

Sekwencja:
- obrót ok. 2 pełnych obrotów,
- zsynchronizowany ruch do góry,
- mikro-pauza po wyjściu z gwintu,
- uniesienie ok. 70–90 mm.

Bez bounce / elastic.

---

## 06 — AETHR SENSE INSPECTION

Crown przechyla się.
Kamera pokazuje jego spód.

Callout:
`AETHR SENSE`
`Contactless thermal sensing`
`No exposed probe`

Sensor ma być dyskretnym czarnym/szafirowym punktem.

---

## 07 — INSIDE INSPECTION

Crown zostaje obok.
Termos przechyla się w stronę kamery.

Kamera:
- ponad rant,
- pokazanie gwintu,
- wejście kilka cm do środka,
- odbicia na Inner Vessel.

Tekst:
`NOTHING BETWEEN YOU AND THE VESSEL.`

Potem wyjazd kamery.

---

## 08 — SMART CROWN EXPLODED

Tekst:
`A SYSTEM IN 43 MILLIMETERS`

Kolejność rozsuwania:
1. Crown Glass
2. OLED
3. Display Flex
4. PCB / AETHR Core
5. Li-Po
6. Charging Coil
7. AETHR Sense

Nie wszystko jednocześnie.
Ruch lekko nakładać w czasie.

---

## 09 — CALLOUT SYSTEM

Callouty mają być jednym powtarzalnym UI systemem.

Karta:
- numer 01/02/03...
- nazwa
- 2–3 parametry
- jedno krótkie zdanie

Linia 1 px prowadzi od dokładnego anchor point 3D do karty HTML.
Pozycję anchoru liczyć:
`worldPosition -> Vector3.project(camera) -> screen coordinates`

Aktywna część:
- pełniejsze światło,
- delikatny offset 2–3 mm,
- pozostałe elementy lekko wygaszone.

Pokazywać **jeden callout na raz**.

---

## 10 — SMART OLED CALLOUT

`01`
`SMART OLED`

Parametry:
`2.2" Circular OLED`
`High contrast`
`Touch activated`

Opis:
`Invisible when idle. Instant thermal feedback when needed.`

Krótka preview animacja:
`72° -> 4° -> 96° -> --°`

---

## 11 — AETHR CORE

`02`
`AETHR CORE`

`Ultra-low-power control architecture`
`Integrated sensing + display management`

Nie wymyślać konkretnego modelu procesora.

---

## 12 — POWER CELL TEASER

`03`
`POWER CELL`

`Rechargeable Li-Po`
`Optimized for ultra-low standby consumption.`

Tu **nie** podawać jeszcze:
- 60 days,
- 45 min,
- pełnej narracji ładowania.

Zostawić to na AETHR CHARGE.

---

## 13 — INDUCTIVE POWER TEASER

`04`
`INDUCTIVE POWER`

`Sealed inductive charging`
`Zero exposed ports.`

Tylko teaser.

---

## 14 — AETHR SENSE CALLOUT

`05`
`AETHR SENSE`

`Contactless thermal sensing`
`Target ±0.5°C`
`No exposed probe.`

Macro sensora.

---

## 15 — CROWN REASSEMBLY

Callouty znikają.

Kolejność powrotu:
Sense -> coil -> battery -> PCB -> OLED -> glass.

`click`

Crown wraca nad termos.
Łapie gwint.
Zakręca się.

OLED:
`--°`

---

## 16 — THERMAL PERFORMANCE

Duża typografia, jedno słowo na ruch światła:
`COLD.`
`HOT.`
`HELD.`

---

## 17 — COLD TEST

Crown się odkręca.
Zimna woda wpada do termosu.

Liquid helper rośnie od dołu.

Opcjonalnie 2–3 kostki lodu.

Crown wraca.

OLED:
`4°C`
`COLD`

Światło robi się chłodniejsze.

Tekst:
`24 HOURS.`
`COLD, HELD.`

Krótka scena.

---

## 18 — COLD -> HOT TRANSITION

Crown się odkręca.
Termos przechyla się.
Zimna woda wypływa.

Powrót do pionu.
Zmiana temperatury oświetlenia na cieplejszą.

---

## 19 — HOT FILL

Gorąca woda.
Subtelna para przy strumieniu.

Liquid helper rośnie.

Crown się zakręca.

OLED:
`96°C`
`HOT`

W tym momencie uruchamia się timer.

---

## 20 — LIVE THERMAL TEST

Stały, subtelny overlay:

`LIVE THERMAL TEST`
`00:00:00`
`96°C`

Timer jest mapowany na scroll progress.
Przy scrollu wstecz również się cofa.

Nie musi odpowiadać realnemu czasowi oglądania.

---

## 21 — THERMAL ARCHITECTURE

Tekst:
`BUILT AGAINST HEAT LOSS`

Kamera zbliża się do body.

Nie switchować nagle modelu.
Cutaway ma wyglądać jak naturalne odsłonięcie warstw.

---

## 22 — PEEL CUTAWAY

Docelowa kolejność prezentacyjna:
1. WATER
2. INNER VESSEL
3. LOW-E SURFACE
4. VACUUM CORE
5. OUTER SHELL

To ma być precyzyjne rozwarstwienie, nie eksplozja.

Finalna poza referencyjna:
`01_MODELS/thermal/THERMAL_PEEL_CUTAWAY.glb`

---

## 23 — WATER

Nie trzeba opisywać „water”.

Można pokazać:
`CORE TEMPERATURE`
`94°C`

Subtelne heat-flow particles.

---

## 24 — INNER VESSEL

Callout:
`01 — INNER VESSEL`

`18/8 Stainless Steel`
`Food-safe`
`Taste-neutral`

Opis:
`The only surface your drink touches.`

---

## 25 — LOW-E SURFACE

To ma wyglądać jak ultracienki coating.

Callout:
`02 — LOW-E SURFACE`

`Low-emissivity reflective coating`

Opis:
`Reflects radiant heat back toward the vessel.`

Animacja:
pomarańczowa energia -> powierzchnia -> subtelne odbicie.

---

## 26 — VACUUM CORE

Vacuum jest pustą przestrzenią.

Nie robić niebieskiej „rury”.
Tylko:
- subtelny volume helper,
- outline,
- delikatne particles.

Callout:
`03 — VACUUM CORE`

`Near-zero convection`

Opis:
`Removing air eliminates one of the primary paths of heat transfer.`

Particles próbujące przejść przez vacuum mogą zanikać.

---

## 27 — OUTER SHELL

Callout:
`04 — TITANIUM SHELL`

`Precision titanium body`
`Brushed anisotropic finish`

Moving light sweep po materiale.

---

## 28 — THERMAL SYSTEM WIDE SHOT

Wszystkie warstwy czytelne.

Callouty znikają.

Duży tekst:
`FIVE LAYERS.`
`ONE PURPOSE.`

następnie:
`HOLD THE TEMPERATURE.`

Timer nadal działa.

---

## 29 — THERMAL REASSEMBLY

Warstwy wracają na miejsce.
Cutaway się zamyka.
Termos znowu jest monolitem.

Timer nie znika.

---

## 30 — TIME COMPRESSION

Kamera odjeżdża.
Termos stoi spokojnie.

Light rig symuluje przejście dnia.

Przykładowy storytelling:
04:13 -> 06:00 -> 09:00 -> 12:00 -> 18:00 -> 24:00

Temperatura:
91 -> 86 -> 80 -> 75 -> 65 -> 58°C

Na 24:00:
`STILL HOT.`
`58°C`

---

## 31 — OPEN AFTER 24H

Crown powoli się odkręca.
Subtelna para.

Timer:
`24:00:00`
`58°C`

---

## 32 — POUR OUT

Termos przechyla się.
Woda wypływa.
Kamera podąża za ostatnią kroplą.

---

## 33 — MATCH CUT TO AETHR CHARGE

Ostatnia kropla / jej okrągła forma przechodzi w charging puck.

Tekst:
`AETHR CHARGE`

Camera pull-out.

---

## 34 — CHARGING

Crown opada na puck.

Magnetyczny:
`click`

OLED:
`68%`

Subtelny charging ring.

Tekst:
`POWER WITHOUT PORTS`

---

## 35 — CHARGING DEEP DIVE

Mini exploded / translucent Crown.

Podświetlać tylko:
- battery,
- charging coil.

### Battery
`SEALED Li-Po POWER CELL`
`UP TO 60 DAYS`
`Ultra-low standby`

### Coil
`MAGNETIC INDUCTIVE CHARGING`
`0–100% ≈45 MIN`
`No exposed electrical contacts`

Duży tekst:
`60 DAYS.`
`ONE CHARGE.`

---

## 36 — MATERIALS

Tekst:
`MAKE IT YOURS`

Swatche:
- RAW
- OBSIDIAN
- FROST
- SAND

Zmiana materiału płynna, nie instant.

Light rig może się lekko zmieniać dla każdego materiału.

---

## 37 — MATERIAL MACRO

Macro brushed surface.

Tekst:
`ANISOTROPIC BRUSHED FINISH`

Moving light sweep.

---

## 38 — PERSONALIZATION

Tekst:
`YOURS, PRECISELY.`

UI:
`ENGRAVING`
input

Tryby:
- Vertical
- Minimal
- Monogram

Tekst wpisany przez usera pojawia się na modelu.

---

## 39 — INTERACTIVE PRODUCT

Tekst:
`GRAB IT.`

Cursor:
`DRAG`

Użytkownik może obracać produktem.

---

## 40 — DROP TEST

Tekst:
`DROP IT.`

Rapier Physics:
- gravity
- rotation
- contact
- bounce
- metal impact sound

Po zatrzymaniu:
`IMPACT TEST`
`PASSED`

Nie używać fikcyjnej normy MIL-STD.

---

## 41 — FINAL HERO

Wracamy do estetyki intro.

Ciemność.
Produkt centralnie.
Moving light sweep.

Tekst:
`AETHR ONE`

`Temperature. Engineered.`

Dane:
`750 ML`
`RAW TITANIUM`
`€249`

---

## 42 — CTA

`CONFIGURE YOURS`

Drugorzędne:
`EXPLORE AGAIN`

---

## 43 — FIKCYJNY CONFIGURATOR / E-COMMERCE

- AETHR ONE
- Finish
- Engraving
- Quantity
- €249
- `ADD TO BAG`

Checkout nie musi działać.

---

## 44 — FOOTER

`AETHR`
`THERMAL SYSTEMS`

`COPENHAGEN`
`MMXXVI`

Linki:
Technology / Materials / Warranty / Support

Na samym dole:
`A fictional product experience.`

---

# RYTM

Nie może być ciągłego bombardowania efektami.

Rytm:
- reveal: mocny
- 360: spokojny
- Crown exploded: mocny
- COLD: krótki
- HOT: mocny
- Thermal architecture: techniczny/spokojny
- time compression: mocny
- charging: elegancki
- materials: spokojny
- drop test: zabawa
- final hero: monumentalny i spokojny

To jest klucz do wyglądu premium.
