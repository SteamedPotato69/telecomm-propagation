---
titulo: "Plan: Rompecabezas celular -- cubrir un área sobre una imagen con agrupaciones de celdas (didáctico y gamificado)"
rama: feature/cell-puzzle   # desde origin/main (87aeafe)
estado: PLAN -- sin implementar. Autorización del profesor: asumir lo razonable y justificar cada decisión
relacionado: docs/plan-umts-dl-ci.md (rama feature/umts-dl-ci, en pausa; el C/I de F2 se reutiliza en el nivel de interferencia)
---

# 0. Cómo entendí la funcionalidad

1. La persona **sube una imagen** (un mapa, una foto aérea, un plano) en el formato que pueda.
2. **Marca sobre la imagen el área a cubrir** (la S_T que ya se declara en Geometría / Dimensionamiento).
3. **Rellena esa área con celdas**, como un **rompecabezas**: las piezas encajan solas (imán) y el juego dice cuánto del área está cubierto y si se hizo bien.
4. Todo con espíritu **Duolingo**: niveles cortos, feedback inmediato, XP, racha, estrellas, celebración, retroalimentación amable cuando falla.

**¿Tiene sentido? Sí**, y encaja con lo que el curso enseña (diap. 20-25: retícula hexagonal, agrupación de N celdas, distancia de reutilización D, número de agrupaciones Q). Dos precisiones que cambian el diseño:

- **"Celda" y "hexágono" son lo mismo** en el modelo (el hexágono es la idealización de la cobertura circular, diap. 20). Pero la **pieza del rompecabezas no debe ser un hexágono suelto sino la agrupación (cluster)**: N hexágonos, cada uno de un color distinto (cada color = un conjunto de frecuencias). Es la única pieza que "encaja sola" de verdad: solo ciertas traslaciones (las de la retícula cocanal, distancia D) hacen que la agrupación se repita sin huecos ni solapes. Esa restricción *es* la lección de reutilización de frecuencias, y da el efecto de imán gratis.
- El hexágono es un **modelo idealizado**, no una predicción de cobertura real sobre el terreno de la foto. Lo diremos en la propia pantalla (es didáctico).

# 1. Hallazgo previo que hay que corregir primero: el Q actual está mal

Diapositiva 24 (leída como imagen): `Q = E[S_T / S_RC] + 1`, con `S_RC = N·Sc = √3·D²/2`.
El código (`geometry.ts:33`) usa `3·D²/2` (se perdió la raíz de 3, probablemente al transcribir) y además `ceil(...)+1`. Consecuencia: **subestima las agrupaciones hasta ~40 %**. Ejemplo N=7, R=1 km, S_T=500 km²: el código dice 17 y la diapositiva da 28. Incluso su propio test (S_T=100 → 5) cubre menos área de la requerida (5 × 18,19 = 91 km² < 100).

El rompecabezas haría visible el error de inmediato (el estudiante vería que 17 agrupaciones no cubren el área), por eso se corrige **antes**, en un commit aislado, con la evidencia. Decisión sobre `E[·]`: en notación hispana/francesa `E[x]` es la parte entera, así que se usa `floor(S_T/S_RC) + 1` (lectura literal de la diapositiva). Es ≥ `ceil` y asegura cobertura; se documenta la diferencia con `ceil` (solo difiere cuando S_T/S_RC es entero). `docs/curso-referencia.md` línea 804 igual (la línea 780 ya tiene `√3·D²/2`).

# 2. Decisiones y justificación

| # | Decisión | Por qué |
|---|---|---|
| A1 | Pieza = **agrupación de N celdas con N colores**, no hexágonos sueltos | Es el contenido del curso (reutilización) y produce el "encaje automático" de forma natural y correcta |
| A2 | Imán a la **retícula cocanal** `a·v1 + b·v2` (v1=(i,j), v2=(−j,i+j) en coordenadas axiales, N=i²+ij+j²). La primera pieza fija el origen; las demás solo caen en traslaciones válidas | Verificado con prototipo (N=1,3,4,7,9,12,13): hay exactamente N colores y la distancia mínima entre celdas del mismo color es **exactamente D=√(3N)·R** |
| A3 | El **área** es un polígono dibujado sobre la imagen (con atajos: rectángulo, "toda la imagen") | Un polígono cubre mapas reales (ciudad, campus, municipio); el rectángulo solo es el caso fácil |
| A4 | **Escala px↔km**: por defecto se **deduce de la S_T declarada** (área del polígono = S_T). Alternativa: calibrar con una barra de escala (dos puntos + distancia real) | Respeta "el área declarada con anterioridad" (la S_T manda) y no exige conocer la escala. La barra de escala existe porque muchos mapas la traen y es más fiel |
| A5 | **Cobertura** = fracción del polígono cubierta por celdas colocadas, medida por muestreo (≈4 000 puntos) con prueba punto-en-hexágono O(1) en coordenadas axiales | Es exacta en el límite, barata y funciona con cualquier polígono |
| A6 | **Estrellas**: ★ cubrir el 100 % · ★★ usar ≤ referencia+2 agrupaciones · ★★★ igualar la referencia. La **referencia** la calcula el juego buscando el desfase y rotación (0°/30°) que minimizan las agrupaciones | La métrica la define nuestro propio teselado real, no la fórmula del curso; se muestra al final "tu resultado / óptimo / fórmula del curso" para enseñar que Q es una estimación |
| A7 | **Niveles tipo "camino"** (Duolingo) con la matemática en orden pedagógico: 1 Hexágono (R, d, Sc) → 2 Teselar un parche → 3 Armar la agrupación (N=3, 4, 7) → 4 Reutilizar (ver D entre celdas del mismo color) → 5 **Tu mapa** (imagen propia) → 6 Reto de interferencia (elegir N para C/I objetivo) | Lo pedido ("rompecabezas") es el nivel 5; los anteriores enseñan las piezas. El modo libre (nivel 5) está siempre desbloqueado: no se obliga a pasar por la ruta |
| A8 | **Gamificación**: XP, racha diaria, estrellas por nivel, confeti SVG, resorte de encaje, háptico (móvil), mensajes de ánimo. Sin vidas que bloqueen. Respetar "reducir movimiento" | Motivar sin frustrar: es un trabajo de curso. Se copian las **mecánicas**, no la marca ni la mascota de Duolingo (identidad propia con la paleta de la app, lila `#c084fc` intacto) |
| A9 | **Gestos con `PanResponder` + `Animated` de RN y SVG**; sin `react-native-reanimated`/`gesture-handler` | Funciona igual en web y Expo Go, cero dependencias nativas nuevas, menos riesgo. Se reevalúa solo si el rendimiento lo exige |
| A10 | **Alternativa sin arrastrar**: tocar un hueco ("slot") fantasma coloca la agrupación | Accesibilidad (lector de pantalla/teclado), móviles con poca precisión y pruebas automáticas |
| A11 | **Formatos de imagen**: lo que la plataforma decodifique. Web: `<input type=file accept=image/*>`, arrastrar-y-soltar y pegar del portapapeles (PNG, JPEG, WebP, GIF, BMP, SVG, AVIF…). Móvil: `expo-image-picker` (galería) + `expo-document-picker` (archivos) y render con `expo-image`. Error claro si no se puede decodificar (p. ej. HEIC/TIFF en navegadores sin soporte) | "Todos los formatos posibles" depende del decodificador de cada plataforma; prometer más sería mentir. **PDF queda fuera del MVP** (requiere un renderizador aparte); se anota como mejora |
| A12 | La imagen **nunca se sube a ningún servidor** ni se guarda: vive en memoria de la sesión; solo se persiste el progreso (XP, racha, estrellas) en AsyncStorage | Privacidad y simplicidad; mapas pueden ser sensibles |
| A13 | Coordenadas del polígono **normalizadas (0-1) sobre la imagen** | Independientes de la resolución y del tamaño en pantalla; sobreviven a rotar el teléfono |
| A14 | **Tope de rendimiento**: si el área implicaría > ~600 hexágonos se avisa ("esta celda es muy pequeña para esta área: sube R o reduce el área") | Con R=0,1 km y 50 km² serían ~1 900 celdas; el SVG se vuelve lento. Además es una enseñanza de dimensionamiento |
| A15 | **i18n completo desde el primer commit** (es/en/pt, claves tipadas, test de marcadores) y lógica en `src/models/**` pura | Mismas reglas del proyecto |
| A16 | **Entradas** R, N, S_T: campos en la propia pantalla, precargados con el ejemplo del curso (R=1 km, N=7, S_T=50 km²). Botón "Llevar al mapa" desde Geometría que pasa {R, N, S_T} por parámetros de ruta | El patrón de parámetros de ruta ya existe (`calculator`). Evita un contexto global nuevo |
| A17 | Entrada en el hub de Planificación celular como 6.º ítem **"Rompecabezas celular"** | El hub ya es una lista dirigida por datos |

# 3. Arquitectura

## 3.1 Lógica pura y probada (`src/models/layout/`, sin React ni i18n)
- `hexGrid.ts`: coordenadas axiales ↔ cartesianas (orientación por rotación en grados), vértices de un hexágono, celda que contiene un punto (redondeo cúbico).
- `clusterLattice.ts`: `ijForClusterSize(N)`, `latticeVectors(i,j)`, `clusterColorIndex(q,r,i,j)` (clase lateral módulo la sub-retícula), `baseCluster(i,j)` (N celdas compactas), `snapToLattice(punto, ancla, i, j, R)`.
- `areaPolygon.ts`: área (fórmula del lazo), punto-en-polígono, escala a partir de S_T (`kmPerUnit`) y a partir de dos puntos + distancia.
- `coverage.ts`: muestreo del polígono, cobertura dado el conjunto de agrupaciones colocadas, cuántas celdas caen dentro/fuera.
- `autoTiling.ts`: agrupaciones mínimas que cubren el polígono (búsqueda de desfase × {0°, 30°}); alimenta las pistas, el autocompletar y la referencia de estrellas.
- `types.ts`: tipos de entrada/resultado; errores como `LocalizedError`.
- Tests (vitest): N colores exactos para N ∈ {1,3,4,7,9,12,13}; distancia mínima mismo color = D; invarianza por traslación; el teselado completo de una ventana cubre al 100 %; área de polígonos conocidos; escala por área; auto-teselado de un rectángulo con valor calculado a mano; errores de N inválido, polígono degenerado (< 3 puntos, área 0, autointersección).

## 3.2 Juego (`src/models/game/`, puro)
- Definición de niveles como datos (id, tipo, parámetros, objetivo, texto por clave i18n).
- Puntuación: estrellas, XP, racha (función pura que recibe fechas).
- Banco de preguntas del nivel 6 (apoyado en C/I de la rama `feature/umts-dl-ci` F2; si no está, se ofrece solo el nivel 1-5 y el 6 queda "próximamente").

## 3.3 UI (`src/screens` y `src/components`)
- `CellPuzzleScreen`: máquina de pasos **Misión → Imagen → Área → Escala → Juego → Resultado**.
- `ImageSourcePicker` (web/nativo), `MapCanvas` (imagen + capa SVG con zoom por botones; pinch en una fase posterior), `AreaEditor` (vértices arrastrables con zonas táctiles ≥ 44 px, deshacer, atajos), `HexLayer`, `ClusterPiece` (arrastrable + fantasma con borde verde/rojo), `CoverageMeter`, `LevelPath`, `ConfettiBurst`, `StarsRow`.
- `CellPuzzleResult`: tu resultado vs óptimo vs `Q` del curso, con explicación en lenguaje llano.

# 4. Fases y PRs apilados (cada uno deja `main` funcionando)

| Fase | Contenido | PR |
|---|---|---|
| P0 | Corrección de Q (§1) + test + docs | PR-A |
| P1 | Núcleo `src/models/layout/` con tests | PR-A |
| P2 | Imagen + polígono + escala (sin juego aún) con pantalla y 3 idiomas | PR-B |
| P3 | Rompecabezas: piezas, imán, tocar-para-colocar, cobertura, autocompletar, deshacer | PR-B |
| P4 | Gamificación: camino de niveles, XP/racha/estrellas, confeti, háptico, preguntas | PR-C |
| P5 | Integración (hub, botón en Geometría), README ×3, accesibilidad, rendimiento, verificación | PR-C |

Commits atómicos dentro de cada fase; la lógica pura va siempre antes que la UI que la usa.

# 5. Verificación (qué puedo y qué no)

- **Puedo**: `tsc`, `vitest` (matemática), navegador de escritorio y ancho móvil (arrastre con ratón, subir imagen por el selector, pegar, errores), claro/oscuro, los 3 idiomas.
- **No puedo**: gestos táctiles reales, háptico, selector de galería nativo, formatos HEIC/AVIF en dispositivos concretos, rendimiento en un teléfono de gama baja. Eso lo prueba el estudiante en Expo Go; lo dejo como lista de comprobación en el PR.
- Antes de escribir código aplica `AGENTS.md`: se leerá la documentación de Expo SDK 57 de `expo-image-picker`, `expo-document-picker`, `expo-image` y `expo-haptics` (versiones compatibles según `bundledNativeModules.json`: ~57.0.20, ~57.0.2, ~57.0.5, ~57.0.3) y la compatibilidad con web antes de instalarlos.

# 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Arrastre impreciso/lento en web y móvil con `PanResponder` | Alternativa de tocar-para-colocar desde el primer día; medir; si falla, reconsiderar `gesture-handler` |
| Demasiados hexágonos | Tope y aviso (A14); el área y R son del estudiante |
| Escala incorrecta (polígono mal dibujado) | Mostrar el área resultante y la escala implícita; permitir recalibrar |
| Que la gamificación distraiga o "infantilice" | Modo libre siempre accesible; textos sobrios; efectos desactivables |
| Alcance enorme | Fases y PRs apilados; P2-P3 ya entregan el rompecabezas jugable |
| El estudiante debe poder defender cada parte | Cada módulo puro lleva comentario con la diapositiva/lógica y un resumen "qué hace / qué NO verifica" en el PR |

# 7. Fuera de alcance (MVP) y siguiente

PDF como imagen · pinch-zoom y rotación libre de la retícula · sectorización (diap. 25) · predicción de cobertura real con Hata sobre la imagen (el hexágono es ideal) · modo multijugador/ranking · sonido · nivel de interferencia si F2 de `plan-umts-dl-ci.md` no está mergeada.
