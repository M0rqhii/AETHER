Masz dostęp do całego lokalnego folderu tego projektu i możesz bezpośrednio tworzyć, usuwać i modyfikować w nim pliki.

Twoim zadaniem jest ZBUDOWANIE KOMPLETNEJ, PRODUKCYJNEJ, BARDZO WYSOKIEJ JAKOŚCI INTERAKTYWNEJ STRONY SHOWCASE dla fikcyjnej marki premium AETHR i produktu AETHR ONE.

Nie chcę makiety, proof-of-conceptu ani kilku sekcji demonstracyjnych.
Masz stworzyć pełne, spójne doświadczenie WWW gotowe do uruchomienia i wdrożenia na Vercel.

======================================================================
0. NAJPIERW PRZECZYTAJ PLIKOWĄ DOKUMENTACJĘ
======================================================================

W katalogu projektu znajduje się rozpakowany folder:

AETHR_ONE_FINAL_MASTER_PACKAGE

Zanim zaczniesz pisać kod, dokładnie przejrzyj jego strukturę i przeczytaj przede wszystkim:

AETHR_ONE_FINAL_MASTER_PACKAGE/README_FIRST.md

AETHR_ONE_FINAL_MASTER_PACKAGE/05_DOCUMENTATION/FINAL_PRODUCT_SPEC.md
AETHR_ONE_FINAL_MASTER_PACKAGE/05_DOCUMENTATION/WEBSITE_MASTER_BRIEF.md
AETHR_ONE_FINAL_MASTER_PACKAGE/05_DOCUMENTATION/COPY_DECK.md
AETHR_ONE_FINAL_MASTER_PACKAGE/05_DOCUMENTATION/ANIMATION_TIMELINE.md
AETHR_ONE_FINAL_MASTER_PACKAGE/05_DOCUMENTATION/MATERIALS_LIGHTING.md
AETHR_ONE_FINAL_MASTER_PACKAGE/05_DOCUMENTATION/CALLOUT_SYSTEM.md
AETHR_ONE_FINAL_MASTER_PACKAGE/05_DOCUMENTATION/THREEJS_IMPLEMENTATION.md
AETHR_ONE_FINAL_MASTER_PACKAGE/05_DOCUMENTATION/NODE_MAP.json
AETHR_ONE_FINAL_MASTER_PACKAGE/05_DOCUMENTATION/FICTIONAL_PRODUCT_NOTICE.md

oraz:

AETHR_ONE_FINAL_MASTER_PACKAGE/06_IMPLEMENTATION/aethrNodeMap.js
AETHR_ONE_FINAL_MASTER_PACKAGE/06_IMPLEMENTATION/materialPresets.js
AETHR_ONE_FINAL_MASTER_PACKAGE/06_IMPLEMENTATION/chapterPlan.js
AETHR_ONE_FINAL_MASTER_PACKAGE/06_IMPLEMENTATION/oledTexture.js

Przejrzyj również wszystkie modele GLB w:

AETHR_ONE_FINAL_MASTER_PACKAGE/01_MODELS/

oraz grafiki referencyjne:

AETHR_ONE_FINAL_MASTER_PACKAGE/04_REFERENCES/

Dokumentację traktuj jako SOURCE OF TRUTH dla produktu, storytellingu, animacji i nazewnictwa node'ów.

Nie zaczynaj od zgadywania, jak wygląda model.
Najpierw go przeanalizuj.

======================================================================
1. CEL PROJEKTU
======================================================================

Strona ma wyglądać jak interaktywna premiera ekstremalnie dopracowanego produktu premium.

To NIE ma być:

- klasyczny landing page,
- sklep Shopify,
- kilka sekcji ze zdjęciem produktu,
- model 3D obracający się bez celu,
- generyczna strona SaaS,
- neonowy cyberpunk,
- gaming,
- strona pełna przypadkowych gradientów.

Docelowy charakter:

precision engineering
industrial luxury
quiet technology
high-end product launch
premium product storytelling

Inspiracyjnie można myśleć o poziomie:
Apple product page / Leica / Bang & Olufsen / high-end automotive product presentation / Awwwards-level WebGL experience,

ale NIE kopiuj żadnej istniejącej marki ani witryny.

AETHR musi mieć własny język.

Najważniejsza zasada UX:

SCROLL NIE PRZEWIJA ZWYKŁEJ STRONY.
SCROLL REŻYSERUJE PRODUKT.

Przez większość strony użytkownik ma mieć wrażenie przebywania w jednej ciągłej scenie 3D, a kolejne fragmenty scrolla zmieniają:

- pozycję kamery,
- orientację termosu,
- pozycję części,
- oświetlenie,
- OLED,
- materiały,
- cutaway,
- wodę,
- parę,
- callouty,
- timer,
- otoczenie.

Strona ma przypominać interaktywny film produktowy sterowany przez użytkownika.

======================================================================
2. TECHNOLOGIE
======================================================================

Jeżeli istniejący projekt ma już sensowny stack, dopasuj się do niego.

Jeżeli repo jest praktycznie puste, użyj:

- Next.js, aktualna stabilna wersja
- App Router
- React
- TypeScript
- React Three Fiber
- Three.js
- @react-three/drei
- GSAP
- GSAP ScrollTrigger
- @react-three/rapier
- postprocessing / @react-three/postprocessing tam, gdzie ma to sens

Projekt musi być bez problemu deployowalny na Vercel.

Jeżeli w repo istnieje lockfile:
- zachowaj obecny package manager.

Jeżeli nie ma:
- użyj npm.

Nie wprowadzaj ciężkich frameworków tylko dlatego, że istnieją.

======================================================================
3. ORGANIZACJA KODU
======================================================================

Kod ma być modularny.

Nie twórz jednego pliku page.tsx mającego 3000 linii.

Przykładowa struktura może wyglądać mniej więcej:

src/
  app/
  components/
    experience/
      AethrExperience.tsx
      Scene.tsx
      ProductModel.tsx
      CameraRig.tsx
      LightingRig.tsx
      OledDisplay.tsx
      ThermalSystem.tsx
      CrownExploded.tsx
      DropTest.tsx
    ui/
      Navbar.tsx
      LoadingScreen.tsx
      Callout.tsx
      ThermalTimer.tsx
      MaterialSelector.tsx
      EngravingConfigurator.tsx
      ChapterIndicator.tsx
  hooks/
  lib/
    aethr/
      nodes.ts
      materials.ts
      timeline.ts
      thermal.ts
      oled.ts
  styles/

Nie musisz dokładnie kopiować tej struktury, ale zachowaj podobny poziom separacji odpowiedzialności.

======================================================================
4. ASSETY
======================================================================

Główny model:

AETHR_ONE_FINAL_MASTER_PACKAGE/01_MODELS/AETHR_ONE_FINAL_CANONICAL.glb

Ten model ma być podstawowym modelem produkcyjnym.

Skopiuj potrzebne assety do właściwego katalogu public/, np.:

public/models/aethr/

Nie ładuj modeli z lokalnej ścieżki developerskiej.

Reference poses:

AETHR_ONE_FINAL_MASTER_PACKAGE/01_MODELS/poses/

oraz:

AETHR_ONE_FINAL_MASTER_PACKAGE/01_MODELS/thermal/

służą przede wszystkim jako wzorce tego, jak części powinny się rozkładać.

Preferowany sposób produkcyjny:

JEDEN KANONICZNY GLB + runtime animation poszczególnych node'ów.

Nie rób brutalnego:
model1.glb -> model2.glb -> model3.glb

przy każdej scenie, jeżeli da się tego uniknąć.

======================================================================
5. WAŻNE NODE'Y
======================================================================

Przeczytaj NODE_MAP.json.

Najważniejsze między innymi:

AETHR_ONE

Body_Group

Crown_Group

Crown_Electronics_Group

Outer_Shell

Inner_Vessel

External_Thread

Mouth_Lip

Thermal_Reflective_Layer

Vacuum_Visualization

Vacuum_Bottom_Visualization

Liquid_Volume

Crown_Shell

Crown_Glass

OLED_Panel

OLED_Glyphs_72

PCB_Main

PCB_ICs

PCB_Passives

PCB_Traces

LiPo_Pouch

Charging_Coil

AETHR_Sense_Window

AETHR_Sense_Module

Crown_Group jest parentem całego korka.

Podczas odkręcania całego korka animuj Crown_Group, a nie każdą część osobno.

Dopiero przy Smart Crown exploded animuj jego dzieci.

======================================================================
6. DOMYŚLNY STAN MODELU
======================================================================

Po załadowaniu głównego modelu:

Vacuum_Visualization.visible = false
Vacuum_Bottom_Visualization.visible = false
Liquid_Volume.visible = false
OLED_Glyphs_72.visible = false

OLED ma być dynamiczny.

Nie używaj statycznego 72° z modelu jako finalnego ekranu.

Zrób CanvasTexture albo podobne rozwiązanie.

OLED ma obsługiwać między innymi:

--°
72°
READY
4°C
COLD
96°C
HOT
68%
100%

Ekran po wygaszeniu powinien praktycznie znikać w czarnym szkle.

======================================================================
7. GLOBALNY DESIGN
======================================================================

Background:

praktycznie czarny.

Bazowe wartości możesz ustawić w pobliżu:

#070809
#0A0B0C

Główny tekst:
off-white.

Drugorzędny tekst:
45–60% opacity.

Nie rób całej strony w blue/cyan glow.

Kolor powinien wynikać z aktualnej sceny:

COLD:
bardzo subtelne chłodne stalowo-niebieskie światło.

HOT:
cieplejszy amber / tungsten.

LOW-E:
delikatny copper/gold reflection.

CHARGING:
czysta chłodna biel.

======================================================================
8. TYPOGRAFIA
======================================================================

Typografia bardzo duża i oszczędna.

Duże hasła mogą zajmować znaczną część viewportu.

Przykładowo:

AETHR
ONE

COLD.

HOT.

HELD.

FIVE LAYERS.
ONE PURPOSE.

60 DAYS.
ONE CHARGE.

Nie twórz ścian tekstu.

Strona ma oddychać.

Tekst techniczny:
mały, precyzyjny, minimalistyczny.

======================================================================
9. NAVBAR
======================================================================

Minimalistyczny.

Lewa:
AETHR

Prawa / środek:
ONE
TECHNOLOGY
MATERIALS

CTA:
CONFIGURE

Navbar może dyskretnie zanikać podczas najbardziej filmowych fragmentów i wracać później.

Nie może dominować.

======================================================================
10. LOADING SCREEN
======================================================================

Zrób faktyczny loader assetów.

Czarny ekran.

AETHR

INITIALIZING EXPERIENCE

procent:
00 -> 100

Możesz wykorzystać okrąg przypominający Smart Crown.

Po 100:

--°

i transition do pierwszej sceny.

Loader nie może być sztucznym timeoutem.
Powinien reagować na faktyczny loading kluczowych assetów.

======================================================================
11. SCENA 01 — REVEAL
======================================================================

Początkowo termos prawie znika w ciemności.

Nie ustawiaj go od początku jako jasno oświetlonego produktu na środku.

Scroll ujawnia go światłem.

Etapy:

1.
ciemność

2.
pierwszy moving softbox pokazuje kontur

3.
drugi refleks przechodzi po brushed titanium

4.
model delikatnie obraca się o około 10–15°

Tekst:

AETHR

następnie:

ONE

Pod:

Precision Thermal Vessel

Hasło:

Temperature. Engineered.

Ruch:
wolny,
ciężki,
precyzyjny.

======================================================================
12. HERO PRODUCT SHOT
======================================================================

Po reveal typografia odchodzi.

Produkt zostaje w centrum.

Kamera trochę podjeżdża.

OLED:

--°

i wygasa.

Małe:

SCROLL TO EXPLORE

======================================================================
13. PRODUCT INSPECTION / 360
======================================================================

Nie rób automatycznego "spin 360" jak w viewerze produktu.

Ma być wyreżyserowana inspekcja.

Faza 1:
około 180° obrotu.

Light sweep pokazuje strukturę metalu.

Tekst:

RAW TITANIUM

Precision brushed finish.

Faza 2:
dalszy obrót.
Pokaż subtelny branding przy dole.

Faza 3:
produkt pochyla się o około 25–30°.

Kamera schodzi lekko pod niego.

Pokaż spód.

Może być widoczny tekst techniczny produktu.

Potem płynny powrót do pionu.

======================================================================
14. SMART CROWN INTRO
======================================================================

Kamera przechodzi ku górze termosu.

Crown staje się głównym elementem kadru.

OLED:

72°

READY

Po chwili wygasa.

Tekst:

SMART CROWN

Temperature sensing.
Hidden until needed.

======================================================================
15. ODKRĘCANIE KORKA
======================================================================

Animuj Crown_Group.

Ma wykonać około 2 pełnych obrotów.

Synchronizuj:

rotation.z
+
position wzdłuż osi

tak żeby wyglądało jak prawdziwy gwint.

Po wyjściu z gwintu:
krótka mikro-pauza.

Potem korek unosi się około 70–90 mm.

Bez bounce.

Bez elastic.

Bez kreskówkowego zachowania.

======================================================================
16. AETHR SENSE
======================================================================

Korek przechyla się.

Kamera pokazuje spód.

Pokaż centralny AETHR Sense.

Callout:

AETHR SENSE

Contactless thermal sensing

No exposed probe

Linia powinna być zakotwiczona do faktycznego punktu 3D.

======================================================================
17. ZAGLĄDANIE DO ŚRODKA TERMOSU
======================================================================

Crown pozostaje obok.

Termos lekko pochyla się do kamery.

Kamera:
- przechodzi ponad szyjkę,
- pokazuje rant,
- pokazuje gwint,
- zagląda do Inner Vessel,
- wjeżdża delikatnie do środka.

Nie przesadzaj z odległością.

Ma dać efekt:
"naprawdę zaglądam do środka".

Tekst:

NOTHING BETWEEN YOU AND THE VESSEL.

Potem kamera wyjeżdża.

======================================================================
18. SMART CROWN EXPLODED
======================================================================

Tekst:

A SYSTEM IN 43 MILLIMETERS

Crown ustawia się w pozycji prezentacyjnej.

Rozkładaj po kolei:

1. Crown Glass
2. OLED
3. Display Flex
4. PCB / AETHR Core
5. Li-Po Battery
6. Charging Coil
7. AETHR Sense

Nie wysuwaj wszystkiego jednocześnie.

Animacje części mogą częściowo nakładać się w czasie.

Eksplozja ma być czysta i techniczna.

Nie robimy "wybuchu części".

======================================================================
19. CALLOUT SYSTEM
======================================================================

Callouty mają być spójnym komponentem strony.

Pokazuj JEDEN aktywny callout naraz.

Struktura:

01
SMART OLED

2.2" Circular OLED
High contrast
Touch activated

Invisible when idle.
Instant thermal feedback when needed.

Linia connector:
bardzo cienka,
np. 1 px.

Na końcu przy części:
mały punkt.

Linia powinna poruszać się razem z modelem i kamerą.

Nie ustawiaj jej na sztywno w CSS.

Przelicz world position 3D do screen position.

Aktywna część:
- pełniejsze oświetlenie,
- może wysunąć się dodatkowo 2–3 mm,
- pozostałe części delikatnie przygaszone.

======================================================================
20. SMART OLED CALLOUT
======================================================================

01 — SMART OLED

2.2" Circular OLED
High contrast
Touch activated

Invisible when idle.
Instant thermal feedback when needed.

Na OLED możesz szybko pokazać:

72°
4°
96°
--°

======================================================================
21. AETHR CORE
======================================================================

02 — AETHR CORE

Ultra-low-power control architecture

Integrated sensing + display management

Podświetl PCB i komponenty.

======================================================================
22. POWER CELL
======================================================================

03 — POWER CELL

Rechargeable Li-Po

Optimized for ultra-low standby consumption.

WAŻNE:

TUTAJ NIE pokazuj jeszcze:

60 DAYS

ani:

45 MIN CHARGE.

To będzie później w dedykowanej sekcji AETHR CHARGE.

======================================================================
23. INDUCTIVE POWER
======================================================================

04 — INDUCTIVE POWER

Sealed inductive charging

Zero exposed ports.

Tylko teaser.

Podświetl miedzianą coil.

======================================================================
24. AETHR SENSE CALLOUT
======================================================================

05 — AETHR SENSE

Contactless thermal sensing

Target ±0.5°C

No exposed probe.

Macro na sensor.

======================================================================
25. CROWN REASSEMBLY
======================================================================

Callout znika.

Elementy wracają w odwrotnej kolejności.

Sense
Coil
Battery
PCB
OLED
Glass

Crown kompletny.

OLED:
--°

Korek wraca nad termos.

Zakręca się.

Produkt znowu wygląda jak monolit.

======================================================================
26. THERMAL PERFORMANCE INTRO
======================================================================

Duże słowa:

COLD.

HOT.

HELD.

Każde pojawia się wraz z niewielką zmianą oświetlenia.

======================================================================
27. COLD FILL
======================================================================

Korek się odkręca.

Z góry wpływa zimna woda.

Liquid_Volume zaczyna rosnąć od dołu.

Możesz dodać kilka kostek lodu, jeżeli nie będą kosztowne performance'owo.

Korek wraca.

OLED:

4°C

COLD

Otoczenie:
subtelnie chłodniejsze.

Tekst:

24 HOURS.

COLD, HELD.

Nie przeciągaj tej sceny.

======================================================================
28. COLD -> HOT
======================================================================

Crown ponownie się odkręca.

Termos przechyla się.

Woda zostaje wylana.

Powrót do pionu.

Light rig przechodzi od cool do warm.

======================================================================
29. HOT FILL
======================================================================

Gorąca woda wpływa do termosu.

Dodaj subtelną parę.

Nie rób wielkiej chmury.

Liquid_Volume rośnie.

Crown zakręca termos.

OLED:

96°C

HOT

DOKŁADNIE W TYM MOMENCIE STARTUJE TIMER.

======================================================================
30. LIVE THERMAL TEST
======================================================================

Subtelny overlay:

LIVE THERMAL TEST

00:00:00

96°C

Od tego momentu timer jest widoczny przez całą thermal story.

WAŻNE:

Timer NIE ma działać na Date.now().

Ma być przypięty do progressu scrolla.

Scroll w dół:
czas leci.

Scroll w górę:
czas się cofa.

To samo temperatura.

======================================================================
31. THERMAL ARCHITECTURE
======================================================================

Tekst:

BUILT AGAINST HEAT LOSS

Kamera zbliża się do body.

Zaczyna się cutaway.

Nie rób brutalnego przeskoku do innego modelu.

Jeżeli to możliwe:
użyj runtime clipping plane.

Jeżeli runtime clipping będzie wizualnie niestabilny lub bardzo skomplikowany:
możesz wykorzystać dedykowany thermal reference GLB i zrobić odpowiednio dopracowany crossfade.

Finalny reference:

AETHR_ONE_FINAL_MASTER_PACKAGE/01_MODELS/thermal/THERMAL_PEEL_CUTAWAY.glb

======================================================================
32. PEEL CUTAWAY
======================================================================

WAŻNE:
ostatnia ustalona poprawna kolejność prezentacyjna:

WATER
INNER VESSEL
LOW-E SURFACE
VACUUM
OUTER SHELL

Nie używaj starej kolejności.

Poszczególne wycięte fragmenty mają się delikatnie odsuwać.

Nie więcej niż potrzeba.

Ma wyglądać jak high-end engineering visualization.

======================================================================
33. WATER
======================================================================

Woda nie potrzebuje rozbudowanego calloutu.

Można pokazać:

CORE TEMPERATURE

94°C

Dodaj bardzo subtelną wizualizację energii cieplnej.

======================================================================
34. INNER VESSEL
======================================================================

01 — INNER VESSEL

18/8 Stainless Steel

Food-safe

Taste-neutral

The only surface your drink touches.

Aktywna warstwa jasno oświetlona.

Pozostałe przygaszone.

======================================================================
35. LOW-E SURFACE
======================================================================

WAŻNE:

To NIE jest gruba pomarańczowa rura.

To ma wyglądać jak bardzo cienki reflective coating na Inner Vessel.

Tekst:

02 — LOW-E SURFACE

Low-emissivity reflective coating

Reflects radiant heat back toward the vessel.

Możesz zrobić delikatną animację energii:

heat ray ->
surface ->
reflection <-

======================================================================
36. VACUUM CORE
======================================================================

WAŻNE:

Vacuum nie jest fizyczną niebieską warstwą.

To PUSTA PRZESTRZEŃ.

Helper można ujawnić tylko delikatnie:

- transparentność,
- subtelny outline,
- niewielkie particles.

Callout:

03 — VACUUM CORE

Near-zero convection

Removing air eliminates one of the primary paths of heat transfer.

Możesz pokazać particles próbujące przejść przez vacuum i zanikające.

======================================================================
37. OUTER SHELL
======================================================================

04 — TITANIUM SHELL

Precision titanium body

Brushed anisotropic finish

Zrób ładny moving light sweep.

======================================================================
38. THERMAL SYSTEM WIDE SHOT
======================================================================

Na chwilę pokazujemy cały system.

Callouty znikają.

Duża typografia:

FIVE LAYERS.

ONE PURPOSE.

następnie:

HOLD THE TEMPERATURE.

Timer nadal działa.

======================================================================
39. THERMAL REASSEMBLY
======================================================================

Warstwy wracają.

Cutaway się zamyka.

Termos znowu staje się pełnym monolitem.

Timer nadal działa.

======================================================================
40. TIME COMPRESSION
======================================================================

Produkt spokojny.

Camera pull-out.

Light state delikatnie symuluje przejście dnia.

Timer przyspiesza.

Docelowy storytelling:

00:00     96°C
01:00     94°C
04:00     91°C
09:00     80°C
12:00     75°C
18:00     65°C
24:00     58°C

Nie musi to być matematycznie liniowe.

Na końcu:

24:00:00

58°C

STILL HOT.

======================================================================
41. OPEN AFTER 24H
======================================================================

Crown powoli się odkręca.

Po otwarciu:
subtelna para.

Nie lokomotywa.

Timer zatrzymuje się:

24:00:00
58°C

======================================================================
42. POUR
======================================================================

Termos przechyla się.

Woda wypływa.

Kamera może śledzić ostatnią kroplę.

======================================================================
43. MATCH CUT -> AETHR CHARGE
======================================================================

Okrągła kropla w transition przechodzi w charging puck.

To powinien być bardzo efektowny, ale czysty transition.

Tekst:

AETHR CHARGE

Camera pull-out.

======================================================================
44. CHARGING
======================================================================

Smart Crown opada na puck.

Subtelny magnetic click.

OLED:

68%

Charging ring.

Tekst:

POWER WITHOUT PORTS

======================================================================
45. CHARGING DEEP DIVE
======================================================================

Teraz wracamy do elektroniki.

Ale podświetlamy przede wszystkim:

Battery
Charging Coil

Bateria:

SEALED Li-Po POWER CELL

UP TO 60 DAYS

Ultra-low standby

Coil:

MAGNETIC INDUCTIVE CHARGING

0–100% ≈45 MIN

No exposed electrical contacts

Duży tekst:

60 DAYS.

ONE CHARGE.

======================================================================
46. MATERIALS
======================================================================

Tekst:

MAKE IT YOURS

Cztery warianty:

RAW
OBSIDIAN
FROST
SAND

Zmiana materiału:
płynna.

Nie instant.

Nie przeładowuj modelu.

Interpoluj parametry materiału.

======================================================================
47. FINALNE MATERIAŁY
======================================================================

WAŻNE:

Nie polegaj na szarym materiale zapisanym w GLB.

To jest tylko fallback.

Finalny RAW TITANIUM ma wyglądać jak prawdziwy brushed metal.

Użyj:

MeshPhysicalMaterial

metalness blisko 1

roughness około 0.25–0.35

anisotropy

subtelna kierunkowa brushed normal / roughness texture lub proceduralny efekt

HDR/environment

moving studio light cards

Materiał nie może wyglądać:

- plastikowo,
- mlecznie,
- fioletowo,
- jak default CAD renderer.

======================================================================
48. MATERIAL PRESETS
======================================================================

RAW:
neutralny lekko ciepły titanium.

OBSIDIAN:
ciemny grafit, ale nie absolutna czarna dziura.

FROST:
jasne chłodne srebro.

SAND:
ciepły champagne titanium.

Nie rób:
czerwonego,
zielonego,
gamingowego niebieskiego.

======================================================================
49. MATERIAL MACRO
======================================================================

Kamera robi macro powierzchni.

Tekst:

ANISOTROPIC BRUSHED FINISH

Moving light pokazuje kierunkową strukturę metalu.

======================================================================
50. PERSONALIZATION
======================================================================

Tekst:

YOURS, PRECISELY.

UI po prawej lub zależnie od layoutu:

ENGRAVING

Input.

Tryby:

Vertical
Minimal
Monogram

Wpisany tekst powinien pojawić się na produkcie w czasie rzeczywistym.

Nie dawaj 20 fontów.

Premium = ograniczona, świadoma konfiguracja.

======================================================================
51. PRODUCT INTERACTION
======================================================================

Tekst:

GRAB IT.

Na desktop:
cursor może zmienić się na:

DRAG

Użytkownik może złapać termos i obrócić.

Interaction musi być płynny.

======================================================================
52. DROP TEST
======================================================================

Tekst:

DROP IT.

W tym rozdziale włącz fizykę Rapier.

Użytkownik może:
- złapać termos,
- przesunąć,
- puścić / rzucić.

Produkt:
- spada,
- obraca się,
- uderza w podłoże,
- odbija się.

Dodaj subtelny metaliczny impact sound.

Po zatrzymaniu:

IMPACT TEST

PASSED

Nie twórz fikcyjnego MIL-STD.

Dodaj:

RESET TEST

Po reset model ma elegancko wrócić do scripted mode.

======================================================================
53. FINAL HERO
======================================================================

Powrót do języka wizualnego początku.

Ciemna scena.

Produkt centralnie.

Piękny moving light sweep.

Tekst:

AETHR ONE

Temperature. Engineered.

750 ML

RAW TITANIUM

€249

======================================================================
54. CTA
======================================================================

Primary:

CONFIGURE YOURS

Secondary:

EXPLORE AGAIN

======================================================================
55. CONFIGURATOR / FAKE E-COMMERCE
======================================================================

Nie musi prowadzić do realnej płatności.

Ma jednak wyglądać jak działający premium configurator.

Produkt:
AETHR ONE

Finish:
RAW / OBSIDIAN / FROST / SAND

Engraving:
None / Custom

Quantity

Price:
€249

CTA:

ADD TO BAG

Możesz zrobić elegancki cart drawer.

======================================================================
56. FOOTER
======================================================================

AETHR
THERMAL SYSTEMS

COPENHAGEN
MMXXVI

Technology
Materials
Warranty
Support

Na samym dole małym tekstem:

A fictional product experience.

To jest ważne, bo produkt jest fikcyjny.

======================================================================
57. OŚWIETLENIE
======================================================================

Światło nie może być statyczne przez całą stronę.

Zaprojektuj light states.

REVEAL:
ciemny,
moving softbox.

360:
neutralny premium studio.

COLD:
chłodniejszy fill.

HOT:
cieplejszy amber key.

THERMAL:
neutral studio + ciepłe energy particles.

CHARGING:
clean cool white.

MATERIALS:
neutralne światło wiernie pokazujące materiał.

FINALE:
najbardziej filmowe premium studio lighting.

Cienie:
miękkie.

Nie rób ostrych czarnych cieni.

======================================================================
58. POSTPROCESSING
======================================================================

Używaj bardzo oszczędnie.

Można:

- tone mapping,
- subtelny bloom OLED,
- delikatny bloom charging,
- bardzo subtelny vignette,
- DOF tylko w wybranych macro shots.

Nie używaj:

- wszędzie bloom,
- agresywnej chromatic aberration,
- ciągłego distortion,
- ogromnego film grain.

Premium = restraint.

======================================================================
59. SCROLL / GSAP
======================================================================

Skorzystaj z dokumentu ANIMATION_TIMELINE.md.

Orientacyjna długość doświadczenia:
około 23–25 tys. px wirtualnego scrolla.

Nie rób fizycznie 25 tys. px pustego DOM.

Używaj pinned chapters i ScrollTrigger.

Timeline ma być płynnie odwracalny.

Scroll w górę powinien cofać:
- ruch kamery,
- exploded view,
- timer,
- temperaturę,
- światło,
- pozycje części.

Nie twórz animacji, które działają dobrze tylko w dół.

======================================================================
60. KAMERA
======================================================================

Kamera jest jednym z najważniejszych elementów strony.

Nie ograniczaj wszystkiego do obracania modelu.

Animuj:
- position,
- lookAt target,
- FOV tam, gdzie uzasadnione,
- macro,
- underside,
- top-down,
- 3/4 engineering view.

Ruch:
slow,
cinematic,
controlled.

Preferuj:
power2.inOut
power3.inOut

Nie:
bounce
elastic

======================================================================
61. CALLOUTY 3D -> DOM
======================================================================

Punkty connectorów muszą być wyliczane na podstawie faktycznych obiektów 3D.

Schemat:

object.getWorldPosition()
project(camera)
NDC -> viewport pixels

Linie możesz zrobić w SVG overlay.

Callout cards jako HTML/React.

Kiedy kamera się rusza, linia musi nadal trafiać dokładnie w część.

======================================================================
62. KURSOR
======================================================================

Desktop:

normalnie:
subtelny mały pointer / dot.

Interakcja:
DRAG

Drop test:
THROW

Konfigurator:
SELECT

Nie rób ogromnego custom cursor circle śledzącego wszystko przez całą stronę.

======================================================================
63. AUDIO
======================================================================

Audio opcjonalne.

Domyślnie:
SOUND OFF.

User może włączyć.

Dźwięki:
- thread korka,
- klik zakręcenia,
- nalewanie,
- para,
- charging puck,
- impact.

Jeżeli nie masz dobrych assetów audio, nie blokuj przez to wykonania projektu.
Możesz przygotować strukturę i graceful fallback.

Nie autoplay audio bez zgody usera.

======================================================================
64. DESKTOP
======================================================================

Desktop ma być wersją bez kompromisów.

Priorytet:
1920×1080,
1440p,
typowe notebooki 1366/1440.

Przetestuj ultrawide.

Nie pozwól, żeby layout się rozjeżdżał przy 21:9.

======================================================================
65. MOBILE
======================================================================

Mobile ma nadal być premium, ale nie musi wykonywać 100% desktopowej choreografii.

Na mobile:

- niższy DPR,
- mniej particles,
- prostsze shadows,
- bez ciężkiego DOF,
- callouty mogą być na dole ekranu zamiast po bokach,
- krótsze exploded distances,
- touch rotation,
- drop test może być uproszczony,
- device orientation tylko jeżeli jest subtelne i nie powoduje problemów.

Nie rób osobnej brzydkiej "mobile fallback page".

======================================================================
66. PREFERS-REDUCED-MOTION
======================================================================

Obsłuż prefers-reduced-motion.

W takim trybie:
- ogranicz intensywne camera moves,
- pokaż stabilniejsze product views,
- nie blokuj dostępu do contentu,
- callouty i dane pozostają dostępne.

======================================================================
67. WEBGL FALLBACK
======================================================================

Jeżeli WebGL nie wystartuje:
strona nadal powinna pokazać:
- branding,
- podstawową prezentację produktu,
- tekst,
- CTA.

Nie zostawiaj usera z czarnym ekranem.

======================================================================
68. PERFORMANCE
======================================================================

To jest bardzo ważne.

Nie chcę strony "WOW" działającej w 9 FPS.

Zadbaj o:

- lazy loading,
- preload tylko potrzebnych assetów,
- Meshopt / Draco tam, gdzie warto,
- KTX2 jeżeli wprowadzisz cięższe tekstury,
- rozsądny DPR clamp,
- unikanie bezsensownego rerenderowania Reacta,
- useFrame tylko tam, gdzie potrzebne,
- unikanie tworzenia nowych Vector3 w każdej klatce bez potrzeby,
- ograniczenie liczby shadow-casting lights,
- właściwe dispose,
- dynamiczne wyłączanie efektów niewidocznych,
- możliwość degradacji jakości.

CanvasTexture OLED aktualizuj tylko, gdy zmienia się tekst.

======================================================================
69. RESPONSYWNOŚĆ FPS
======================================================================

Możesz dodać prostą adaptive quality strategy.

Jeżeli FPS stale spada:
- zmniejsz DPR,
- ogranicz particles,
- wyłącz cięższy DOF,
- uprość shadows.

Nie obniżaj jakości od razu wszystkim.

======================================================================
70. ACCESSIBILITY
======================================================================

- semantyczny DOM,
- buttons prawdziwymi buttonami,
- odpowiedni contrast,
- keyboard focus,
- aria-label tam gdzie potrzebne,
- reduced motion,
- textual fallback dla calloutów,
- konfigurator dostępny również bez interakcji 3D.

======================================================================
71. SEO / META
======================================================================

Ustaw sensowne metadata.

Title np.:

AETHR ONE — Temperature. Engineered.

Description:
premium fictional interactive product experience.

OpenGraph może używać zatwierdzonego renderu z:
AETHR_ONE_FINAL_MASTER_PACKAGE/04_REFERENCES/

Nie indeksuj tego jako realnego sklepu z prawdziwą dostępnością produktu.

======================================================================
72. COPY
======================================================================

Używaj COPY_DECK.md jako source of truth.

Copy ma być po angielsku.

Nie przepisuj tekstów na korporacyjny marketing bullshit.

Zachowaj krótkie zdania.

======================================================================
73. CZEGO NIE ROBIĆ
======================================================================

NIE:

- generuj zwykłej landing page,
- rób przypadkowych gradientów,
- dawaj wszędzie glow,
- używaj jaskrawego cyan,
- używaj ogromnych border radius na wszystkim,
- rób glassmorphismu wszędzie,
- animuj każdego elementu dla samego animowania,
- używaj bounce,
- przesadzaj z parallax,
- rób wymyślonych certyfikatów,
- używaj defaultowego szarego materiału GLB jako finalnego,
- rób modelu wyglądającego jak plastik,
- pokazuj 10 calloutów jednocześnie,
- twórz osobnych 15 canvasów,
- reloaduj GLB co sekcję,
- pozwól Reactowi renderować wszystko co klatkę,
- zatrzymuj scroll na długo bez uzasadnienia,
- rób fatalnego mobile,
- twórz fake loading tylko na timeout,
- zostawiaj placeholderów lorem ipsum.

======================================================================
74. IMPLEMENTACJA KROK PO KROKU
======================================================================

Nie próbuj robić wszystkiego chaotycznie naraz.

Pracuj w tej kolejności:

ETAP 1
Przeanalizuj repo i wszystkie assety AETHR.

ETAP 2
Zbuduj foundation:
- Next / istniejący stack,
- Canvas,
- routing,
- global styles,
- loader,
- GLB loading.

ETAP 3
Załaduj canonical model i popraw materiały.

ETAP 4
Zbuduj studio lighting.

ETAP 5
Zbuduj scroll architecture i camera rig.

ETAP 6
Reveal + hero + 360.

ETAP 7
Crown unscrew + inspection.

ETAP 8
Crown exploded + callout system.

ETAP 9
Dynamic OLED.

ETAP 10
Cold + hot + liquid.

ETAP 11
Timer.

ETAP 12
Thermal cutaway + callouts.

ETAP 13
Time compression.

ETAP 14
Charge transition + charging scene.

ETAP 15
Material configurator.

ETAP 16
Engraving.

ETAP 17
Drop test.

ETAP 18
Final hero + configurator.

ETAP 19
Mobile / reduced motion / fallback.

ETAP 20
Performance tuning.

ETAP 21
Final QA.

======================================================================
75. QA
======================================================================

Przed uznaniem projektu za skończony:

- uruchom build,
- usuń wszystkie TS errors,
- usuń console errors,
- sprawdź hydration errors,
- sprawdź brakujące assety,
- sprawdź wszystkie GLB paths,
- sprawdź scroll w dół,
- sprawdź scroll w górę,
- sprawdź refresh w środku strony,
- sprawdź resize,
- sprawdź mobile,
- sprawdź desktop,
- sprawdź ultrawide,
- sprawdź reduced-motion,
- sprawdź konfigurator,
- sprawdź reset drop test,
- sprawdź loading,
- sprawdź fallback,
- sprawdź production build.

Jeżeli używasz Next.js:
uruchom finalnie przynajmniej:

npm run build

lub odpowiednią komendę package managera.

Nie kończ pracy, jeżeli build nie przechodzi.

======================================================================
76. NIE ZADAWAJ MI PYTAŃ O DROBIAZGI
======================================================================

Masz bardzo dokładny brief.

Nie zatrzymuj pracy pytaniami w stylu:

"jaki font?"
"czy użyć GSAP?"
"czy dodać cień?"

Podejmuj sensowne decyzje projektowe sam.

Pytaj tylko wtedy, jeżeli istnieje faktyczna blokada, której nie da się rozwiązać na podstawie:
- repo,
- dokumentacji,
- assetów,
- tego promptu.

======================================================================
77. BĄDŹ KRYTYCZNY WOBEC ASSETÓW
======================================================================

Modele zostały przygotowane specjalnie pod ten projekt, ale nie traktuj fallbackowych materiałów lub technicznych reference renders jako wzoru finalnej jakości.

Geometria = source of truth dla kształtu i node'ów.

Finalny:
- brushed titanium,
- OLED,
- glass,
- water,
- vacuum visualization,
- lighting

ma być znacznie lepszy w Three.js niż w technicznych preview PNG.

======================================================================
78. WAŻNA UWAGA O THERMAL PEEL
======================================================================

Było kilka wcześniejszych prób thermal exploded, ale finalna wersja w paczce to:

01_MODELS/thermal/THERMAL_PEEL_CUTAWAY.glb

Docelowy porządek prezentacji:

WATER
INNER VESSEL
LOW-E SURFACE
VACUUM
OUTER SHELL

To właśnie tę wersję traktuj jako referencję.

Nie twórz z powrotem "pięciu rur przesuniętych obok siebie".

Chodzi o elegancki wycięty sektor / peel cutaway.

======================================================================
79. FINALNY EFEKT
======================================================================

Kiedy strona będzie skończona, użytkownik powinien mieć poczucie:

"to wygląda jak prawdziwa premiera produktu za kilkaset euro"

a nie:

"ktoś wrzucił model GLB do Three.js".

Ma być widoczne, że dopracowano:

- produkt,
- materiały,
- storytelling,
- lighting,
- kamerę,
- UI,
- sound design,
- motion design,
- informacje techniczne,
- konfigurator,
- performance.

======================================================================
80. DEFINICJA DONE
======================================================================

Projekt jest DONE dopiero, gdy:

1. pełna historia AETHR ONE istnieje od intro do finale,
2. GLB jest poprawnie wykorzystany,
3. Crown realnie się odkręca,
4. można zajrzeć do wnętrza,
5. Smart Crown się rozkłada,
6. callouty wskazują konkretne części,
7. OLED jest dynamiczny,
8. działa COLD,
9. działa HOT,
10. działa thermal timer,
11. thermal peel jest czytelny,
12. warstwy mają callouty,
13. timer dochodzi do 24h,
14. pojawia się steam / pour,
15. istnieje AETHR Charge,
16. bateria i charging coil mają deep dive,
17. zmieniają się materiały,
18. działa engraving,
19. istnieje interaktywny model,
20. działa drop test,
21. istnieje final hero,
22. istnieje configurator,
23. jest footer z "A fictional product experience.",
24. desktop działa dobrze,
25. mobile działa dobrze,
26. reduced-motion działa,
27. production build przechodzi,
28. brak poważnych console errors,
29. performance jest sensowny.

======================================================================
81. PO ZAKOŃCZENIU
======================================================================

Na końcu swojej pracy przedstaw mi krótki raport:

1. co zostało zbudowane,
2. jakie biblioteki zostały użyte,
3. gdzie znajduje się główna logika animacji,
4. gdzie definiowane są materiały,
5. gdzie definiowane są chaptery scrolla,
6. jak uruchomić projekt lokalnie,
7. jak zrobić build,
8. czy build przeszedł,
9. jakie elementy zostały uproszczone ze względów performance,
10. czy zostały jakiekolwiek TODO.

Nie kończ raportem przed faktycznym wykonaniem pracy.

NAJPIERW ZBUDUJ STRONĘ.