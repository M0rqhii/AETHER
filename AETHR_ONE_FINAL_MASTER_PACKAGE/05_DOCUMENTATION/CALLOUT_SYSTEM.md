# AETHR ONE — CALLOUT SYSTEM

## Zasada
Jedna aktywna część na raz.

Nie pokazywać dziesięciu linii i dziesięciu kart jednocześnie.

## Card
- index: 01 / 02 / 03
- title
- 2–3 technical facts
- max jedno krótkie zdanie
- subtelne transparentne tło / glass
- bardzo delikatny border

## Connector
- 1 px
- mały punkt przy części 3D
- animacja przez stroke-dashoffset
- punkt startowy wynika z anchoru 3D

## 3D -> screen
Na każdej klatce:
1. pobrać `object.getWorldPosition(anchor)`
2. `anchor.project(camera)`
3. przeliczyć NDC do pikseli viewportu
4. ustawić koniec SVG line / HTML connector

## Active state
Aktywna część:
- pełniejsze światło
- 2–3 mm dodatkowego offsetu
- pozostałe części lekko przygaszone

## Smart Crown callouts
1. SMART OLED
2. AETHR CORE
3. POWER CELL
4. INDUCTIVE POWER
5. AETHR SENSE

## Thermal callouts
1. INNER VESSEL
2. LOW-E SURFACE
3. VACUUM CORE
4. TITANIUM SHELL

WATER nie wymaga karty; może mieć wyłącznie temperaturę.
