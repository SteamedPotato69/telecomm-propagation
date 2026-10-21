---
titulo: "Plan v2: Planificación guiada 1G/2G/3G con plan guardado + Rompecabezas celular sobre imagen"
rama: feature/cell-puzzle   # desde origin/main (87aeafe)
estado: PLAN -- sin implementar. Autorización del profesor: asumir lo razonable y justificar cada decisión
cambios_respecto_a_v1: "el área y la escala ya no se deducen del juego; el juego es la ÚLTIMA pantalla de un asistente paso a paso que guarda el plan en local; escala = línea de referencia = 1 km; cámara; 3G automático"
relacionado: docs/plan-umts-dl-ci.md (rama feature/umts-dl-ci, en pausa; su C/I alimentaría un nivel opcional)
---

# 0. Cómo lo entiendo (flujo de datos en una sola dirección)

```
 Asistente paso a paso            Plan guardado (local)           Resumen              Minijuego
 1G/2G: orden "a lápiz"   ──►   S_T, N, nº de celdas, R, …  ──►  valores que   ──►  Imagen + línea de 1 km
 3G: casi automático             (se recalcula y se muestra       hacen falta         + área + piezas
 (modelos que ya existen)         ordenado en cada pantalla)      para entenderlo     (SOLO LEE el plan)
```

- **Los cálculos nunca dependen del juego.** El juego lee un plan ya calculado; no lo modifica. Su único estado propio es el progreso (XP, racha, estrellas), en otra clave de almacenamiento.
- Cada pantalla del asistente muestra, de forma ordenada, lo ya calculado en las anteriores ("Tu plan hasta ahora").
- Antes del juego hay una pantalla de **resumen** que lista los valores que el juego usa y qué significa cada uno.
- Hoy el repo **no** tiene ese asistente: tiene calculadoras sueltas (Geometría, Tráfico, Link budget, Dimensionamiento, WCDMA) sin memoria entre pantallas. El asistente es trabajo nuevo que **reutiliza los modelos puros existentes**; las calculadoras sueltas se conservan como "herramientas".

# 1. Secuencia del asistente

## 1G / 2G -- el mismo orden que a lápiz y papel (diap. 44-46)

| Paso | Pantalla | Entradas mínimas (precargadas con el ejemplo del curso) | Resultado que se guarda |
|---|---|---|---|
| 1 | Escenario | Área S_T (50 km²), usuarios (10 000), Erlang/usuario (0,025), GoS (2 %) | A_T = 250 Erl |
| 2 | Espectro y agrupación | N (1G: 7 · 2G: 4), ancho de banda (1G: 12,5 MHz · 2G: 8 MHz), ancho de canal (1G: 30 kHz · 2G: 200 kHz); 2G: ranuras de tráfico por portadora (7) | 1G: 416 canales → **59/celda** · 2G: 40 portadoras → 10 TRX → **70 TCH/celda** |
| 3 | Capacidad | (ninguna: usa los pasos 1-2) | A_c = B⁻¹(K, GoS) · celdas por capacidad |
| 4 | Cobertura | frecuencia y alturas; el **link budget viene precargado** con la tabla de la diapositiva de cada generación y se edita en "Avanzado". El modelo de propagación **se elige solo** según el rango de validez | MAPL → R → área de celda → celdas por cobertura |
| 5 | Resultado | (ninguna) | **nº de celdas = máx(capacidad, cobertura)**, factor limitante, D y Q de la geometría hexagonal |
| 6 | Resumen | (ninguna) | lista explicada de lo que usará el juego |
| 7 | Rompecabezas | imagen, línea de referencia, ubicar el área | progreso del juego (aparte) |

Falta una pieza que hoy no existe: el **plan de frecuencias** (`floor(BW/canal)`, `floor(total/N)`, portadoras → TRX → TCH). Hoy el dimensionamiento recibe "59 canales por celda" ya hecho. Se crea como módulo puro y probado (416 → 59; 8 MHz/200 kHz → 40 → 10 TRX → 70 TCH).

## 3G -- automático

Pantalla 1 con **3 datos**: área S_T, usuarios, Erlang/usuario (0,025 precargado). Todo lo demás (mezcla 70/20/10, η objetivo 50 %, i_oc 0,55, tabla del link budget UMTS, banda 2100 MHz) va por defecto y se puede ver/editar en "Avanzado" plegado. Pantalla 2: resultado calculado "bajo cuerda" (N_max usuarios por celda, radio convergido, carga η, NodeB por capacidad y por cobertura, el mayor) con detalle opcional. Luego resumen y juego. En 3G el factor de reutilización es **1** (una sola frecuencia, diap. 66), así que la pieza del juego es una celda sola.

# 2. Decisiones y justificación (versión corregida)

## Imagen y medición
| # | Decisión | Por qué |
|---|---|---|
| B1 | **Tres orígenes de imagen**: archivo (selector, arrastrar y soltar, pegar), **foto con la cámara**: web con `getUserMedia` (cámara web) y móvil con la cámara del teléfono | Lo pediste; son los tres caminos reales de un estudiante (captura de pantalla, mapa impreso, foto) |
| B2 | Cámara del teléfono **con botón para alternar frontal/trasera**; por defecto la **trasera** | Pediste la frontal. Para fotografiar un mapa o una hoja la trasera es la práctica (mejor resolución, enfoque); la frontal queda a un toque. Si prefieres la frontal por defecto es un cambio de una línea |
| B3 | La cámara web exige **contexto seguro** (https o `localhost`); desde `http://192.168.x.x` el navegador la bloquea. Se detecta y se muestra un mensaje claro | Es una restricción del navegador, no de la app; el lanzador de escritorio (`localhost:4173`) sí funciona |
| B4 | Formatos: los que decodifique la plataforma (web: PNG, JPEG, WebP, GIF, BMP, SVG, AVIF…; móvil: `expo-image-picker` + `expo-document-picker`, render con `expo-image`). Error claro si no decodifica (p. ej. HEIC/TIFF en navegadores sin soporte). PDF queda fuera del MVP | "Todos los formatos posibles" depende de cada decodificador; prometer más sería mentir |
| B5 | La imagen **no se sube ni se guarda**: vive en memoria de la sesión | Privacidad (los mapas pueden ser sensibles) |
| B6 | **Línea de referencia = 1 km** trazada con dedo o cursor: define la escala de todo el sistema (px/km). Puntos y arrastre para ajustarla; la longitud real se puede cambiar con fichas (0,5 / 1 / 2 / 5 km) | Es exactamente lo pedido. La ficha editable existe porque algunos mapas traen barras de escala de otra longitud; por defecto sigue siendo 1 km |
| B7 | Los puntos se guardan en **píxeles de la imagen original** (la distancia se mide con el ancho y el alto reales, no en coordenadas normalizadas) | Normalizar por separado x e y deforma las distancias cuando la imagen no es cuadrada |

## Área, celdas y piezas
| # | Decisión | Por qué |
|---|---|---|
| C1 | El **área a cubrir viene del plan** (S_T, km²). En el mapa aparece como una **forma de área exactamente S_T** (cuadrado/rectángulo con relación de aspecto ajustable, círculo, elipse), que se **arrastra y gira** sobre la imagen | S_T ya está decidida; el juego no la cambia. Con la escala fijada por la línea de referencia, dibujar a mano un polígono cualquiera rompería la igualdad con S_T (el modo "dibujar a mano" queda como mejora, mostrando su área y avisando si difiere) |
| C2 | Si la forma de S_T **no cabe** en la imagen con esa escala, se avisa: "el área mide 1 414 px y tu imagen 800: traza una línea de 1 km más corta" | Es la consecuencia directa de fijar km por línea y área por plan; mejor explicarlo que dejarlo fallar |
| C3 | **Pieza = agrupación de N celdas con N colores** (1G: 7 · 2G: 4 · 3G: 1), no hexágonos sueltos | Es el contenido del curso y da el "encaje automático" de forma natural |
| C4 | **Imán a la retícula cocanal** `a·v1 + b·v2` (v1=(i,j), v2=(−j,i+j), N=i²+ij+j²); la primera pieza fija el origen | Prototipo verificado (N=1,3,4,7,9,12,13): N colores exactos y distancia mínima entre celdas del mismo color = D = √(3N)·R |
| C5 | **Tamaño del hexágono**: `R_hex = √( S_T / (N_celdas · 3√3/2) )`, es decir, un hexágono con **el área de celda que el plan decidió** (S_T dividida entre las celdas necesarias) | El curso usa dos convenciones (área de celda πR² en 1G/2G y hexágono 3√3/2·R² en geometría). Con área igual, el número de celdas planeado es el objetivo del juego y este no "contradice" al plan. Se muestra el radio de círculo equivalente y se explica |
| C6 | **Cobertura** = fracción del área cubierta por celdas colocadas, medida por muestreo (~4 000 puntos, prueba punto-en-hexágono O(1) en coordenadas axiales) | Exacta en el límite, barata, sirve para cualquier forma |
| C7 | **Estrellas** respecto a un **óptimo calculado por el juego** (búsqueda de desfase × rotación 0°/30°): ★ cubrir el 100 % · ★★ ≤ óptimo+2 celdas · ★★★ óptimo. Al final se compara: tu resultado / óptimo / celdas del plan / Q del curso | El borde de cualquier forma casi siempre pide 1-2 celdas más que el plan; se explica en vez de ocultarlo. La métrica la define nuestro teselado real |
| C8 | Aviso didáctico cuando **N > nº de celdas del plan** (1G: N=7 y 6 celdas) | El patrón de reutilización ni siquiera se completa una vez: es una lección real sobre cuándo la reutilización tiene sentido |
| C9 | **Tope de rendimiento**: > ~600 hexágonos → aviso | Con R pequeño el SVG se vuelve lento; además es dimensionamiento |

## Asistente y plan guardado
| # | Decisión | Por qué |
|---|---|---|
| D1 | `PlanSession` **versionado** en AsyncStorage (una por generación: 1G, 2G, 3G), guardando **entradas** (fuente de verdad) y una copia de los resultados; al abrir se **recalcula** con los modelos vigentes | Si un modelo se corrige, el plan no queda con números viejos; los resultados siguen "guardados y presentados" |
| D2 | Datos corruptos o de versión antigua → se descartan con aviso, nunca bloquean la app; "Continuar mi plan" / "Empezar de nuevo" / "Cargar ejemplo del curso" | Robustez |
| D3 | El juego recibe un objeto de **solo lectura** `GameMission` derivado del plan: {tecnología, S_T, N, nº de celdas, R_hex, D, S_c} | Garantiza la dirección única de dependencia |
| D4 | 1G/2G con **valores del curso precargados** y solo los campos mínimos visibles por paso; el link budget, bajo "Avanzado" | "Valores muy concretos y mínimos"; el estudiante puede reproducir la hoja a lápiz |
| D5 | **Modelo de propagación elegido automáticamente por el rango de validez** (≤1500 MHz Hata; 1500-2000 COST-231-Hata; 2100 MHz usa COST-231-Hata como el ejemplo del curso, con aviso de que roza su rango) | Es el requisito del enunciado ("seleccionar los modelos adecuados") y arregla un problema real: la pantalla WCDMA actual usa Hata plano a 2100 MHz y por eso **no converge**; con COST-231-Hata converge (10 iteraciones; 6 con ρ corregida) |
| D6 | Se corrige ρ según la diap. 67 (α multiplica) y se documenta que el curso declara 0,0210 sin explicación conocida | El asistente 3G tiene que dar números confiables; ver `plan-umts-dl-ci.md` §1. Con la corrección N_max pasa de 10,33 a 12,62 y el curso dice 9: se muestra como discrepancia, no se fuerza |
| D7 | Se corrige **Q** (diap. 24: `E[S_T/S_RC]+1` con `S_RC=√3·D²/2`; el código usa `3·D²/2`: subestima hasta ~40 %: N=7, R=1, S_T=500 → 17 en vez de 28) con `floor(...)+1` | El resumen y el juego muestran Q; no puede estar mal. Commit aislado con la evidencia |
| D8 | Las calculadoras sueltas se **conservan** en el hub como "Herramientas"; el asistente es la entrada principal | No se pierde nada de lo ya entregado |
| D9 | **Capacidad de 3G**: el plan 3G entrega N_NodeB = máx(capacidad, cobertura) igual que 1G/2G, y el juego usa N_celdas = N_NodeB | Un único camino para el juego |

## Juego, gamificación, técnica
| # | Decisión | Por qué |
|---|---|---|
| E1 | **Camino de niveles tipo Duolingo**: 1 Hexágono → 2 Teselar un parche → 3 Armar la agrupación → 4 Reutilizar (ver D entre celdas del mismo color) → 5 **Tu misión** (tu plan + tu imagen) → 6 Interferencia (opcional, C/I). Los niveles 1-4 son tutoriales con datos genéricos; el 5 usa el plan | El rompecabezas pedido es el nivel 5; el resto enseña las piezas. El nivel 5 siempre desbloqueado |
| E2 | XP, racha diaria, estrellas, confeti SVG, resorte de encaje, háptico (móvil), mensajes de ánimo, sin vidas que bloqueen, respeta "reducir movimiento". Mecánicas de Duolingo, **no** su marca ni mascota; identidad propia con el lila `#c084fc` | Motivar sin frustrar; evita problemas de propiedad |
| E3 | Gestos con `PanResponder` + `Animated` de RN sobre SVG, sin `reanimated`/`gesture-handler` | Funciona igual en web y Expo Go, cero dependencias nativas nuevas; se reevalúa si el rendimiento falla |
| E4 | **Alternativa sin arrastrar**: tocar un hueco fantasma coloca la agrupación | Accesibilidad, precisión en móvil, pruebas automáticas |
| E5 | Autocompletar/pista (usa el óptimo) y deshacer/reiniciar | Evita bloqueos; sirve para demostrar en la sustentación |
| E6 | i18n es/en/pt desde el primer commit, lógica en `src/models/**` pura, almacenamiento en `src/storage/` | Reglas del proyecto |

# 3. Arquitectura

- `src/models/plan/` (puro): `frequencyPlan.ts`, `plan1g2g.ts` (orquesta tráfico + link budget + dimensionamiento + geometría con los modelos existentes), `plan3g.ts` (valores por defecto + WCDMA + elección de modelo + N_NodeB), `modelSelection.ts` (modelo por rango de validez), `gameMission.ts` (`GameMission` desde el plan), `types.ts` (con `version`).
- `src/models/layout/` (puro): `hexGrid.ts`, `clusterLattice.ts`, `areaShape.ts` (formas de área S_T), `scale.ts` (línea de referencia → px/km), `coverage.ts`, `autoTiling.ts`.
- `src/models/game/` (puro): niveles como datos, estrellas, XP, racha.
- `src/storage/planStore.ts` y `progressStore.ts` (AsyncStorage, versionado, tolerante a fallos) + `PlanContext`.
- UI: `PlanWizard*` (pantallas de §1), `PlanLedger` ("Tu plan hasta ahora"), `PlanSummaryScreen`, `ImageSourcePicker` (archivo/cámara web/cámara móvil), `MapCanvas`, `ReferenceLineTool`, `AreaShapeTool`, `HexLayer`, `ClusterPiece`, `CoverageMeter`, `LevelPath`, `ConfettiBurst`, `StarsRow`, `CellPuzzleResult`.

# 4. Fases y PRs apilados (cada PR deja `main` funcionando)

| PR | Fases | Contenido |
|---|---|---|
| A | P0-P1 | Correcciones (Q, ρ, modelo por rango) con tests y docs · plan de frecuencias · `plan1g2g`/`plan3g` puros con los casos del curso: 1G → 59 canales/celda, 48,7 Erl, 6 celdas; 2G → 40 portadoras, 10 TRX, 70 TCH, 5 por capacidad, 8 por cobertura; 3G converge · `src/models/layout` con tests |
| B | P2-P3 | Almacenamiento + `PlanContext` · asistente 1G/2G y 3G con "Tu plan hasta ahora" · pantalla de resumen · entrada en el hub · 3 idiomas |
| C | P4-P6 | Imagen (archivo + cámara) · línea de referencia · forma de área · piezas, imán, tocar-para-colocar, cobertura, autocompletar, deshacer · resultado |
| D | P7-P8 | Camino de niveles y gamificación · README ×3 · accesibilidad, rendimiento · verificación |

Commits atómicos; la lógica pura siempre antes que la UI que la usa. Es un trabajo grande (cuatro PR): el PR-C ya entrega el rompecabezas jugable; el PR-D es lo que lo vuelve "Duolingo".

# 5. Verificación (qué puedo y qué no)

- **Puedo**: `tsc`, `vitest` (matemática, plan, persistencia con un almacén simulado), navegador de escritorio y ancho móvil (arrastre con ratón, subir y pegar imagen, **cámara web si hay una disponible**, errores), claro/oscuro, 3 idiomas.
- **No puedo**: gestos táctiles reales, háptico, galería y cámara nativas, HEIC/AVIF en dispositivos concretos, rendimiento en un teléfono de gama baja, permisos de cámara en iOS/Android. Eso lo prueba el estudiante en Expo Go; queda como lista de comprobación en cada PR.
- Antes de escribir código aplica `AGENTS.md`: se leerá la documentación de Expo SDK 57 de `expo-image-picker` (incl. cámara), `expo-document-picker`, `expo-image` y `expo-haptics` (versiones de `bundledNativeModules.json`: ~57.0.20, ~57.0.2, ~57.0.5, ~57.0.3) y su soporte en web. Los textos de permiso de cámara de las compilaciones nativas se declaran en `app.json`.

# 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| Alcance enorme | PRs apilados; el PR-C ya es jugable; lo no esencial (modo dibujar a mano, pinch-zoom, nivel C/I) queda aparte |
| El área de S_T no cabe con la escala elegida | Aviso guiado (C2) y sugerencia de línea más corta |
| El plan guardado queda obsoleto si cambia un modelo | Se recalcula desde las entradas al abrir (D1) |
| Arrastre impreciso/lento | Tocar-para-colocar desde el primer día; medir; reconsiderar `gesture-handler` si hace falta |
| Cámara bloqueada (permiso denegado, http no seguro, sin dispositivo) | Mensajes claros y caída al selector de archivos |
| El resultado 3G depende del cell breathing, que tiene supuestos propios sin verificar (conversión U_celda→η) | Se muestra el resultado tal cual y se declara; no se ajusta nada para parecerse a R=1,07 km / η=54 % |
| Gamificación que distraiga | Modo directo siempre accesible; efectos desactivables |

# 7. Fuera de alcance (MVP)

PDF como imagen · dibujar el área a mano · pinch-zoom y rotación libre de la retícula · sectorización (diap. 25) · predicción de cobertura real con Hata sobre la imagen (el hexágono es ideal) · ranking/multijugador · sonido · carga downlink y C/I (en `plan-umts-dl-ci.md`).

# 8. Registro de implementación -- PR A (hecho)

Estado: P0 y P1 implementados en `feature/cell-puzzle` (sin subir). `tsc` limpio, `vitest` 213/213.

**P0 -- correcciones**
- `e180f47` Q (diap. 24): `3·D²/2` → `√3·D²/2` y `E[·]` = parte entera.
- `47d5ece` tres etiquetas de i18n que seguían en español + test que lo vigila.
- `a6fddc1` ρ de voz (diap. 67): α multiplica. El bucle con los coeficientes de la diapositiva pasa de R=1,00 km/η=62 % a 1,04 km/56 % (curso 1,07/54).
- `3df7065` + `5634792` rangos de frecuencia como dato, `recommendInvertibleModel`, y la pantalla WCDMA converge por defecto (verificado en el navegador: 6 iteraciones).

**P1 -- motor puro**
- `eb93ece` plan de frecuencias + `plan1g2g` (1G: 416→59, 6 celdas por capacidad; 2G: 40→10→70, 5 por capacidad y 7 por cobertura).
- `21e0a17` `plan3g` + `GameMission`.
- `2f02689`, `b56d1c3` `models/layout`: retícula, agrupación como pieza (N colores, distancia mínima mismo color = D para todo N válido ≤ 91), forma de área, escala, cobertura, teselado óptimo.

**Desviaciones respecto al plan y por qué**
1. **`plan3g` reintenta con paso menor.** A más densidad (20 000 usuarios / 50 km²) el bucle oscilaba con el paso por defecto y el plan se quedaba sin resultado. Con 0,3 → 0,1 → 0,03 se llega al **mismo punto fijo** (comprobado en 15 000 usuarios). Más de ~40 000 usuarios sigue sin converger: se devuelve `cellsFinal = null` y el mínimo por capacidad, nunca un número inventado.
2. **El bucle ignora el objetivo η.** Converge a cargas del 80-98 % aunque el objetivo sea 50 %, y en todos los casos probados el número final lo da la capacidad. Es una limitación del modelo ya documentada en `wcdma.ts`; se anota, no se arregla aquí.
3. **El teselado real necesita más celdas que el plan.** Cuadrado de 50 km² con hexágonos del área de celda del plan: 1G plan 6 → 3 agrupaciones (21 celdas, 9 tocan el área); 2G plan 7 → 4 agrupaciones; 3G plan 20 → 29 celdas. Las celdas de borde no entran en `S_T / área de celda`. El juego mostrará ambos números (plan, celdas con centro dentro, celdas necesarias para cubrir) y las estrellas se miden contra el óptimo real, no contra el plan.
4. **Hallazgos de la auditoría** para la IA del contexto: `docs/hallazgos-verificados-para-ia-de-contexto.md`.

**Siguiente**: PR B (almacenamiento + asistente), tras revisar este.

# 9. Registro de implementación -- PR B (hecho)

Estado: asistente 1G/2G/3G + plan guardado, apilado sobre el PR A (rama `feature/plan-wizard`). `tsc` limpio, `vitest` verde.

**Qué hay**
- `models/plan/guidedPlan.ts` (pasos en el orden del curso, `COURSE_3G`, `computePlan*` que nunca lanzan) y `ledger.ts` ("Tu plan hasta ahora" como filas neutrales al idioma).
- `storage/planStore.ts`: guarda **entradas + paso + instantánea**; los resultados se recalculan al abrir. Tolera JSON corrupto, otra versión, tipos erróneos, un plan 1G en la ranura 2G, una instantánea dañada y un almacén que lanza (12 tests con un almacén en memoria).
- `plan/PlanContext.tsx`: carga al abrir, guarda con 400 ms de retardo y **nunca escribe antes de terminar de leer** (si no, pisaría lo guardado con un estado vacío).
- UI: `PlanStartScreen` (elegir generación; continuar / empezar de nuevo con confirmación de dos toques), `PlanWizardScreen` (6 pasos 1G/2G, 3 pasos 3G), `PlanShell`, `PlanLedger`, `PlanNumberField`, `AdvancedSection` (el link budget y el entorno quedan plegados), `SummaryStep`; entrada en el hub y botón atrás de Android por pasos.
- Textos es/en/pt (`plan.*`, tipados).

**Decisiones tomadas al construirlo**
1. **Los campos guardan números, no texto** (`PlanNumberField`): un "2." a medias o un campo vacío no meten NaN en el plan; el campo se pone rojo y se sigue usando el último valor correcto. Si el valor guardado cambia desde fuera (empezar de nuevo), el texto lo sigue.
2. **Los presets son constantes compartidas: siempre se copian.** Un test mío mutó `COURSE_1G` sin querer y contaminó los siguientes; por eso el contexto clona (JSON) y los tests usan copias.
3. **El botón "Ir al rompecabezas" está desactivado** ("llega en la siguiente entrega"): el flujo se lee de punta a punta sin prometer lo que aún no existe.
4. **La instantánea sirve para avisar**, no para mostrar números: si con los modelos actuales el plan da otro número de celdas que cuando se guardó, la pantalla inicial lo dice.
5. Abrir el asistente **no guarda nada** hasta que el estudiante empieza o edita (`recordSnapshot` ignora planes que no existen).

**Verificado en el navegador** (escritorio y 375 px, es/en/pt, sin claves crudas): 1G con los valores del curso (416 → 59 canales, 48,70 Erl, 6 celdas; MAPL 143 dB, R 2,90 km, 2 por cobertura; resumen con hexágono de 1,791 km), 2G (40 → 10 → 70, MAPL 133, 7 por cobertura), 3G (convergió en 6, 20 NodeB; con 20 000 usuarios el paso estándar oscilaba y se reintentó con 0,1: R=0,95 km, 40 NodeB), usuarios = 0 (mensaje traducido, "Siguiente" desactivado), campo inválido, guardado en `localStorage` y restauración tras recargar, reinicio con confirmación.

**No verificado (lo prueba el estudiante en Expo Go)**: el botón atrás de hardware de Android dentro del asistente, AsyncStorage nativo (en web es `localStorage`), teclado numérico en móvil real.

# 10. Registro de implementación -- PR C (hecho)

Estado: imagen/cámara, línea de referencia, área y juego jugable, apilado sobre el PR B (rama `feature/cell-puzzle-game`). `tsc` limpio, `vitest` verde (275 tests).

**Qué hay**
- Lógica pura (con tests): `models/layout/puzzle.ts` (colores por grupo, estrellas, pista, autocompletar), `placement.ts` (reductor de piezas: la primera fija la retícula; deshacer; reiniciar; `new` para un puzzle distinto), `areaPlacement.ts` (centro del área en píxeles de imagen, ajuste a la imagen, `evaluateArea`).
- `components/puzzle/`: `imageSource.ts` (cualquier formato que la plataforma decodifique, vía `Image.getSize`), `ImageStep` (archivo, galería en móvil, arrastrar y Ctrl+V en web), `CameraCapture` (`expo-camera`), `MapCanvas` (imagen + SVG en píxeles de imagen + capa de gestos), `layers`, `ReferenceStep`, `AreaStep`, `PlayStep`, `ResultPanel`.
- `screens/CellPuzzleScreen.tsx` + ruta `cell-puzzle` (la misión viaja en la ruta; atrás recorre los pasos y termina en el resumen del plan, también con el botón de hardware de Android). El botón "Ir al rompecabezas" del resumen ya está activo.
- Textos es/en/pt (`puzzle.*`, tipados).

**Decisiones tomadas al construirlo**
1. **Cámara trasera por defecto** (con botón para cambiar), aunque se pidió "la frontal": el sujeto es un mapa o un plano. En el navegador, un portátil con una sola cámara usa esa.
2. **La imagen no se guarda** y vive solo en la pantalla del juego. Salir al resumen y volver pide la imagen otra vez: es el precio de no guardar nada.
3. **Cualquier cambio de imagen, escala o área empieza un puzzle nuevo** (acción `new`, que también borra el registro de ayudas): las piezas están posicionadas en esas unidades, y si no, cambiar el área sin querer cambiaría las estrellas.
4. **El centro del área se guarda en píxeles de imagen**: al volver a trazar la línea de referencia el área sigue donde estaba y solo cambia su tamaño en pantalla.
5. **Las rotaciones de la retícula que se ofrecen al jugador son las que busca `findMinimalTiling` (0-50° de 10 en 10)**: la primera versión ofrecía 0/15/30/45 y el "mínimo del juego" podía exigir una rotación que el jugador no podía elegir.
6. **Las posiciones se calculan como "dónde empezó el gesto + cuánto se movió"**, no con el desplazamiento de cada evento, porque el de un evento de movimiento es relativo al elemento donde cae. La página no se desplaza mientras hay un dedo sobre el mapa.
7. **Tope de 800 celdas** (`MAX_PLAYABLE_CELLS`): por encima, el SVG se vuelve lento en un teléfono y el paso del área lo dice y no deja continuar.
8. **Si las celdas salen más pequeñas que 14 px en pantalla** se avisa, pero no se bloquea.

**Verificado en el navegador** (imagen PNG generada, pegada como si fuera Ctrl+V, y selector de archivos simulando la selección): 1G (50 km², N=7, 11 celdas del plan) → línea de 98 px = 1 km → 98,3 px/km; área 1:1 de 7,07 km; 3:1 = 12,25 km = 1205 px en una imagen de 1200 px → bloqueada con los números exactos y "máximo 97 px"; arrastrar el área hasta el borde la deja pegada; la primera pieza fija la retícula (51 %) y la segunda encaja a 356 px = √21·R en pantalla (86 %); Pista (97 %); Autocompletar (100 %, 7 agrupaciones frente al mínimo de 4 → 1 estrella por el tope de ayuda); resultado con celdas dentro del área (13) frente a las del plan (11) y las 36 que sobresalen; "Volver al resumen"; 3G (N=1, hexágonos lilas, mínimo 29 celdas); 375 px sin desbordes; archivo que no es imagen y PNG corrupto → mensajes traducidos que se limpian al cargar una imagen válida; la cámara muestra la pantalla de permiso.

**No verificado (lo prueba el estudiante)**: gestos táctiles en un teléfono real; la vista en vivo de la cámara y el permiso (el panel del navegador no concede la cámara); galería nativa y selector de archivos del sistema; fotos HEIC; el botón atrás de hardware de Android dentro del juego; rendimiento con ~800 celdas en un teléfono de gama baja; los textos en portugués de estas pantallas (los tests de paridad de claves y de marcadores `{{…}}` pasan y el inglés lo vi renderizado de punta a punta, pero el portugués no).

**Limitaciones que se mantienen**
- El mínimo del juego es una búsqueda sobre 6 rotaciones × 25 posiciones (~200 ms), no una demostración de optimalidad; si el jugador lo supera, también es 3 estrellas.
- El teselado real necesita más celdas que las del plan (ver §8, punto 3); el resultado lo muestra en vez de ocultarlo.
- Si el plan 3G no converge (más de ~40 000 usuarios) no hay número final de NodeB y el resumen no deja entrar al juego.

**Siguiente**: PR D (gamificación: camino de niveles, XP/racha/estrellas guardadas, confeti, háptica, accesibilidad, rendimiento), tras revisar este.

# 11. Plan -- PR D (gamificación)

Estado: **plan antes de actuar** (el permiso del profesor pide justificar y planear). Se apila sobre el PR C (rama `feature/puzzle-gamification`, base `feature/cell-puzzle-game`). Recordatorio de ramas: a la fecha, `main` solo contiene el PR A; el PR B está fusionado en `feature/cell-puzzle` y el PR C (#15) apunta a `main` con B y C.

## Alcance (lo que se hace)

| # | Qué | Por qué |
|---|---|---|
| D1 | **Camino de niveles** (pantalla nueva entre el resumen y el juego): 4 tutoriales con datos genéricos + **Tu misión** (el rompecabezas del PR C con tu plan y tu imagen) | Es la decisión E1 ya aprobada: el rompecabezas pedido es el último nivel y los anteriores enseñan las piezas. Tu misión siempre está desbloqueada: nadie queda bloqueado frente a lo que tiene que entregar |
| D2 | **Tutoriales como datos** (`models/game/levels.ts`), sin imagen ni línea de referencia: reutilizan el mismo `PlayStep` con una misión genérica y un mapa sintético | Cero lógica de juego duplicada; los niveles se prueban con tests (¿caben? ¿hexágonos legibles? ¿tienen solución?) |
| D3 | **XP, estrellas y racha diaria**, guardados en el dispositivo (`storage/progressStore.ts`, mismo patrón y tolerancia a fallos que `planStore`) | Motivación sin castigo: no hay vidas ni nada que bloquee |
| D4 | **Premios al terminar**: XP ganado, racha, "siguiente nivel desbloqueado", mensaje de ánimo, estrellas con animación y **confeti** | Es lo que lo vuelve "estilo Duolingo" sin copiar su marca ni su mascota |
| D5 | **Háptica** (`expo-haptics ~57.0.3`) al colocar una pieza y al completar; **interruptor de efectos en Ajustes**; se respeta "reducir movimiento" del sistema | Riesgo ya anotado en §6: la gamificación no debe distraer ni marear |
| D6 | **Nivel "Reutilizar"**: al colocar dos agrupaciones se dibuja la distancia D entre celdas del mismo color y se rotula `D = √(3N)·R` | Hace visible la fórmula del curso (diap. 23) justo cuando se usa |
| D7 | **Accesibilidad y rendimiento**: etiquetas y anuncios (`accessibilityLiveRegion`) en el camino y la cobertura; medir el cálculo del mínimo (`findMinimalTiling`) y moverlo fuera del primer pintado si pasa de ~100 ms | Pendientes del PR C |
| D8 | README ×3 y registro §12 | Regla del proyecto |

## Reglas de los datos del juego (propuestas, a revisar)

- **XP**: primer nivel completado = 20 XP; cada estrella por encima de la mejor anterior = 15 XP. Repetir sin mejorar no da XP (si no, se "farmea"). 3 estrellas en total = 65 XP, vengan de una jugada o de tres.
- **Racha**: se cuenta por día local (AAAA-MM-DD); jugar un día consecutivo suma 1, saltarse un día vuelve a 1, jugar dos veces el mismo día no cambia nada. Si pasó más de un día sin jugar, la racha se **muestra** como 0 (aunque lo guardado sea la última).
- **Desbloqueo**: el nivel k+1 se abre al completar el k (≥ 1 estrella); Tu misión, siempre. Las estrellas de la misión se guardan **por generación** (1G, 2G, 3G): la misión depende del plan.
- **Estrellas de los tutoriales** con la misma regla que la misión (★ cubrir, ★★ ≤ mínimo + 2, ★★★ igualar el mínimo; pistas ≤ 2, autocompletar ≤ 1).

## Lo que se recorta, y por qué

- **Nivel 6 "Interferencia (C/I)"**: depende de `feature/umts-dl-ci`, que sigue sin fusionar (y de la corrección de Walfisch-Bertoni). Se deja fuera hasta que exista esa base; no se inventa un nivel sin respaldo del curso.
- **"Resorte de encaje" sobre el SVG** (E2): animar decenas de polígonos SVG con `Animated` es caro y poco fiable en web/Expo Go. Se sustituye por animaciones baratas (barra de cobertura, aparición de estrellas, confeti con `Animated.View`). Si falta, se reevalúa con datos.
- **Sonido, mascota, ligas/ranking**: fuera de alcance (§7).
- **Arrastre con teclado en web**: no se hace en este PR; queda anotado como limitación de accesibilidad.

## Orden de commits (la lógica pura siempre antes que la UI que la usa)

1. Dependencia `expo-haptics` y este plan.
2. `models/game/`: niveles, progreso (XP/estrellas/racha), geometría del confeti, mensajes. Con tests.
3. `storage/progressStore.ts` + `ProgressContext`. Con tests (almacén en memoria).
4. Textos es/en/pt (`game.*`).
5. UI: camino de niveles, nivel tutorial, rutas (el botón atrás de Android incluido), premios en el resultado.
6. Confeti, háptica, interruptor en Ajustes, reducir movimiento.
7. Accesibilidad y rendimiento.
8. README ×3 y registro §12.

## Verificación

- **Puedo**: `tsc`, `vitest` (XP, racha incluyendo fin de mes/año y bisiesto, desbloqueos, persistencia corrupta, los 4 niveles: caben, hexágonos legibles y solución con tests), navegador de escritorio y 375 px, es/en/pt, claro/oscuro, reducir movimiento (emulado).
- **No puedo (lo prueba el estudiante en Expo Go)**: la vibración real, los gestos táctiles y el rendimiento en un teléfono de gama baja.

# 12. Registro de implementación -- PR D (hecho)

Estado: camino de niveles + gamificación, apilado sobre el PR C (rama `feature/puzzle-gamification`, base `feature/cell-puzzle-game`). `tsc` limpio, `vitest` verde (334 tests). Cumple el plan de §11 salvo lo que allí se recortó.

**Qué hay**
- `models/game/` (puro, con tests): `levels.ts` (los 4 tutoriales como datos y su escala), `progress.ts` (XP, estrellas, racha por día, desbloqueo, `recordResult`), `confetti.ts` (geometría determinista). En `models/layout/`: `nearestSameColorPair` (la distancia D entre celdas del mismo color) y `findMinimalTilingAsync` (la misma búsqueda en trozos).
- `storage/progressStore.ts` + `progress/ProgressContext.tsx`: mismo patrón que el plan guardado (almacén inyectado, versionado, nunca escribe antes de leer, guardado con retardo). Lo corrupto se descarta **campo a campo**: un `xp` dañado no borra las estrellas ni la racha.
- UI: `PuzzlePathScreen` (camino: XP, estrellas, racha, 4 niveles, Tu misión), `TutorialScreen`, premios en el resultado (XP, racha, nivel desbloqueado, mensaje de ánimo), `ConfettiBurst`, háptica (`expo-haptics`), barra de cobertura animada, estrellas con resorte, interruptor de efectos en Ajustes, `useReducedMotion`. Rutas `puzzle-path` y `tutorial`; atrás (también el de hardware de Android): tutorial → camino → resumen, misión paso 0 → camino.
- Textos es/en/pt (`game.*`, tipados).

**Decisiones tomadas al construirlo**
1. **Los tutoriales son el mismo juego** (`PlayStep`) con otra configuración: un lienzo sintético de 800 × 600 sin imagen, sin línea y sin colocar el área. `generation: '1g'` en su misión solo satisface el tipo (un tutorial no pertenece a ninguna generación).
2. **El borde cuesta celdas**: con áreas de 3/12/6/14 celdas nominales el mínimo real salió 6/17/5/5; por eso "Un hexágono" y "Teselar un parche" se acortaron a 2 y 9 celdas nominales. Un test por nivel comprueba que cabe en el lienzo, que el hexágono se lee en un teléfono (≥ 24 px a 45 % de escala) y que tiene solución de 2 a 12 piezas.
3. **XP**: 20 la primera vez + 15 por cada estrella nueva; repetir sin mejorar da 0 (no se puede "farmear") y tres estrellas suman 65 vengan de una jugada o de tres.
4. **Racha por día local**; "ayer" se calcula en UTC (restar 24 h a una medianoche local falla en el cambio de horario); un último día futuro (reloj atrás, viaje al oeste) ni suma ni quita; una racha no continuada se **muestra** como 0 aunque siga guardada.
5. **Tu misión nunca está bloqueada**; sus estrellas se guardan por generación (1G/2G/3G).
6. **Confeti sin librería** (`Animated.View`): 18/36/54 piezas según las estrellas, sembrado (reproducible), se retira al caer la última y no recibe toques.
7. **"Reducir movimiento" manda sobre el interruptor**: aunque los efectos estén activados, con esa opción del sistema no hay confeti ni resorte, y la barra salta sin animar.
8. **La háptica va envuelta** en `try/catch`: la documentación de SDK 57 no dice qué hace donde no hay vibración (navegador sin la API, iPhone en ahorro de batería...).
9. **La búsqueda del mínimo va en trozos** (`findMinimalTilingAsync`): mismo recorrido y mismo desempate que la síncrona (comparten código; tests de igualdad). Medido en el navegador al entrar al juego de la misión 1G (compilación de desarrollo): antes una tarea larga de 295 ms; ahora ninguna de más de 50 ms, el paso aparece a los 43 ms y el mínimo es el mismo (4). Pista y autocompletar esperan a que esté.
10. Se quitó "Nueva mejor marca": en la primera vez también sería cierta y no dice nada.

**Verificado en el navegador** (es y pt; escritorio y 375 px): camino con 1 nivel abierto y 3 bloqueados; nivel 1 por autocompletar → +35 XP, racha de 1 día, "Teselar un parche" desbloqueado, progreso guardado en `localStorage` (`{xp, streak, stars}`) y restaurado tras recargar; niveles 2-4 por "Siguiente nivel"; la distancia de reutilización rotulada `D = √(3·7)·R = 4,58 km` (= √21 · 1 km); misión 1G completada con +35 XP y sus estrellas guardadas en `mission-1g`; confeti de 18 piezas para 1 estrella (comprobado en el DOM: opacidad y transformación en curso, 0 piezas a los 3,5 s); con efectos desactivados 0 piezas y el resultado igual de visible; el interruptor se guarda en ambos sentidos; textos en portugués de punta a punta.

**No verificado (lo prueba el estudiante)**
- La **vibración real** y los gestos táctiles en un teléfono; el rendimiento en uno de gama baja.
- **El confeti en pantalla**: el panel del navegador limita los fotogramas de animación al estar oculto (la barra de cobertura quedó a medio animar en una captura), así que solo lo comprobé por el DOM.
- **"Reducir movimiento"**: el camino de código existe pero no pude emular la opción del sistema.
- Los textos en inglés de las pantallas nuevas no los vi renderizados (los tests de paridad de claves y marcadores pasan; es y pt sí).

**Limitaciones que se mantienen / pendientes**
- Los criterios ✓ del resultado describen el **teselado**, y el tope por ayuda (pista ≤ 2★, autocompletar ≤ 1★) se avisa aparte: con autocompletar pueden verse los tres ✓ y una sola estrella.
- El progreso es independiente del plan: si cambias las entradas del plan, las estrellas de la misión de esa generación se conservan.
- No hay botón para borrar el progreso (`clearProgress` existe en el almacenamiento, sin conectar a la UI).
- Arrastrar con teclado en la web no está hecho (tocar para colocar sí funciona).
- El **nivel 6 "Interferencia (C/I)"** sigue fuera: depende de `feature/umts-dl-ci`, sin fusionar.
