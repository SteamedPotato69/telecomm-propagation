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
