# AETHR ONE — FINAL PRODUCT SPEC

## Marka
**AETHR**

## Produkt
**AETHR ONE**

## Kategoria
Precision Thermal Vessel

## Hasło
**Temperature. Engineered.**

## Pozycjonowanie
Fikcyjny produkt premium klasy €249. Estetyka:
precision engineering / industrial luxury / quiet technology.

## Forma
- wysokość: 286 mm
- średnica: 76 mm
- pojemność narracyjna: 750 ml
- korek: 42,6 mm wysokości
- korek ma tę samą średnicę co body
- wizualna szczelina body/crown: ok. 0,6 mm
- brak widocznego zwężenia przy zamkniętym korku
- po zamknięciu produkt ma wyglądać jak jeden monolityczny blok

## Wykończenie bazowe
**RAW TITANIUM**
- szczotkowany tytanowy look
- kierunkowy brushed finish
- anisotropic reflections
- satynowy metal
- finalny materiał tworzyć w Three.js; kolor w GLB jest tylko fallbackiem

## Smart Crown
- flush black glass
- okrągły OLED
- ekran niewidoczny po wygaszeniu
- podstawowy odczyt: temperatura
- stany: `--°`, `4°C`, `COLD`, `96°C`, `HOT`, poziom ładowania
- sensor temperatury: **AETHR Sense**
- brak długiej, wystającej sondy
- małe szafirowe / czarne okno sensora w spodzie korka

## Smart Crown — warstwy
1. black glass
2. thin OLED
3. display flex
4. AETHR Core / PCB
5. Li-Po pouch battery
6. ferrite shield
7. induction charging coil
8. charge controller
9. AETHR Sense

## Body — układ termiczny
Od środka:
1. liquid
2. inner vessel
3. low-emissivity reflective surface
4. vacuum gap
5. outer titanium shell

Low-E należy pokazywać jako **ultracienki coating / surface**, nie jako grubą osobną rurę.
Vacuum jest pustą przestrzenią; nie należy przedstawiać go jako fizycznej niebieskiej warstwy.
Kolor / glow służy wyłącznie czytelności animacji.

## Ładowanie
**AETHR CHARGE**
- magnetyczny / indukcyjny puck
- zero portów w Crown
- Crown odkładany osobno na ładowarkę
- USB-C może znajdować się w samym pucku, nie w termosie

## Kolory
- RAW
- OBSIDIAN
- FROST
- SAND

## Personalizacja
Minimalny grawer:
- vertical
- minimal
- monogram

## Parametry storytellingowe — fikcyjne, niezwalidowane
Te wartości można wykorzystać w showcase, ale należy traktować je jako założenia fikcyjnej marki:
- OLED: 2.2" circular OLED
- AETHR Sense: target ±0.5°C
- bateria: storytelling `up to 60 days`
- ładowanie: storytelling `0–100% ~45 min`
- test HOT: start 96°C
- po 24 h: narracyjnie ok. 58°C
- COLD: storytelling `up to 24 hours`

Nie przedstawiać tych parametrów jako certyfikowanych wyników realnego produktu.
