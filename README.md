# telecomm-propagation

**Español** · [English](README.en.md) · [Português](README.pt.md)

Calculadora de modelos de pérdida de propagación en canales móviles (espacio libre, Hata, COST-231, ECC-33, Ikegami, Walfisch-Bertoni, COST-231 Walfish-Ikegami) desarrollada en Expo/React Native. Proyecto del curso de énfasis 2 Análisis de redes móviles — Universidad del Cauca.

## Navegación de la app

`Inicio` → `Entorno` → `Calculadora` → `Comparación`, y por separado `Inicio` → `Simulador de desvanecimiento`, `Inicio` → `Planificación celular` y `Inicio` → `Ajustes` (ver `src/screens/RootNavigator.tsx`):

1. **Inicio**: tres cards habilitadas -- "Métodos empíricos de propagación" (pérdida de trayecto), "Simulador de desvanecimiento" (plano/selectivo y lento/rápido) y "Planificación celular" -- y un botón ⚙ arriba a la derecha que abre **Ajustes** (tema e idioma).
2. **Entorno**: elige una categoría de la taxonomía de entornos (`src/models/propagation/environments.ts`) -- determina qué modelos son aplicables.
3. **Calculadora**: el selector de modelos solo muestra los aplicables al entorno elegido; los campos de geometría (ancho de calle, altura de edificios, etc.) solo aparecen cuando el modelo seleccionado los necesita.
4. **Comparación**: corre todos los modelos aplicables del entorno con los mismos parámetros y los compara contra la pérdida en espacio libre ("predicción ideal"); el de menor distancia se marca como mejor ajuste. Debajo de las tarjetas, dos gráficas (`src/components/LineChart.tsx`, sobre `react-native-svg`) de pérdida vs. distancia -- escala logarítmica y lineal, todas las curvas superpuestas, muestreadas en 0.3-20 km con los demás parámetros fijos.
5. **Simulador de desvanecimiento** (`src/screens/FadingScreen.tsx`): a partir de frecuencia portadora, dispersión de retardo (D, con chips de preset Rural/Suburbano/Urbano), velocidad del móvil, ancho de banda de la señal y duración de símbolo (o tasa de símbolo, invertible a Ts), calcula el ancho de banda de coherencia (Bc), el corrimiento Doppler (fd) y el tiempo de coherencia (Tc); clasifica el canal como plano/selectivo en frecuencia y lento/rápido (selectivo en tiempo), y ubica el punto de operación en una de las 5 zonas del plano BT/Bc vs. Ts/Tc (`src/components/FadingZoneChart.tsx`, gráfica de punto sobre `react-native-svg`, no una serie de líneas -- distinta de `LineChart.tsx`).
6. **Planificación guiada** (Planificación celular → Planificación guiada; `src/screens/PlanStartScreen.tsx`, `PlanWizardScreen.tsx`): un asistente paso a paso que reutiliza los modelos de arriba. **1G y 2G siguen el orden del cálculo a lápiz y papel** (diap. 44-46): escenario → espectro y agrupación → capacidad → cobertura → resultado → resumen; **3G es casi automático** (solo área, usuarios y Erlang por usuario; el resto sale del ejemplo del curso). Cada pantalla muestra "Tu plan hasta ahora" con lo ya calculado, el modelo de propagación se elige solo según la frecuencia, y el plan **se guarda en este dispositivo** (solo las entradas; los resultados se recalculan al abrirlo, así una corrección de un modelo nunca deja números viejos). La última pantalla resume lo que usará el rompecabezas, que **solo lee** el plan y nunca lo modifica.
7. **Rompecabezas celular** (la misión del camino de niveles, que se abre desde el resumen del plan con "Ir al rompecabezas"; `src/screens/CellPuzzleScreen.tsx`, `src/components/puzzle/`): cuatro pasos. (1) **Tu mapa**: sube una imagen (archivo, galería en el móvil, arrastrar o pegar con Ctrl+V en la web; sirve cualquier formato que el dispositivo sepa abrir) o toma una foto con la cámara (cámara web en el navegador, la trasera en el móvil, con botón para cambiar); la imagen no se guarda. (2) **Línea de referencia**: traza con el dedo o el cursor una línea que mida 1 km (0,5 / 2 / 5 km también); de ahí sale la escala de todo el juego. (3) **Ubica el área**: el área S_T del plan (no se puede cambiar) se arrastra sobre el mapa; rectángulo o elipse, proporción y giro; si no cabe en la imagen se dice exactamente cuántos píxeles faltan. (4) **Cubre el área**: cada toque coloca una agrupación de N celdas que encaja sola en la retícula (cada color es un grupo de frecuencias; la primera pieza fija la retícula); deshacer, reiniciar, pista y autocompletar. Las estrellas se miden contra el mínimo que encuentra el propio juego (una búsqueda sobre rotaciones y posiciones, no una demostración): ★ cubrir toda el área, ★★ con a lo sumo 2 agrupaciones más, ★★★ igualar el mínimo; las pistas limitan a 2 estrellas y autocompletar a 1. El resultado muestra también cuántas celdas hacen falta de verdad frente a las del plan: el borde del área siempre pide celdas extra.
8. **Camino de niveles y gamificación** (`src/screens/PuzzlePathScreen.tsx`, `TutorialScreen.tsx`, `src/models/game/`): "Ir al rompecabezas" abre primero un camino con **cuatro niveles cortos** de datos inventados (un hexágono → teselar un parche → armar la agrupación con N = 3 → reutilizar con N = 7, el ejemplo del curso, donde se dibuja la distancia D = √(3N)·R entre celdas del mismo color) y, al final, **Tu misión**: el rompecabezas del punto 7 con tu plan y tu imagen, siempre abierta. Los tutoriales usan el mismo juego que la misión. Cada nivel completado da **XP** (20 la primera vez y 15 por cada estrella nueva; repetir sin mejorar no da XP), estrellas y una **racha** diaria; al terminar hay confeti y, en el móvil, vibración. El progreso se guarda en este dispositivo (`src/storage/progressStore.ts`), no hay vidas ni nada que bloquee, los efectos se apagan en Ajustes y también se desactivan solos si el sistema pide reducir el movimiento.

## Ajustes: tema e idioma

El botón ⚙ de Inicio abre la pantalla de Ajustes (`src/screens/SettingsScreen.tsx`), que agrupa las dos preferencias del usuario.

### Tema claro/oscuro

Un switch de 3 posiciones (`🌙 Oscuro` / `Auto` / `☀ Claro`) para elegir el modo directamente, sin ciclar. "Auto" sigue la preferencia del sistema operativo/navegador (`useColorScheme`); una elección manual se guarda con `@react-native-async-storage/async-storage` y se recuerda entre sesiones.

Los tokens de color están en [`src/theme/palette.ts`](src/theme/palette.ts), consumidos vía el hook `useTheme()` de [`src/theme/ThemeContext.tsx`](src/theme/ThemeContext.tsx). El **lila neón (`#c084fc`) es idéntico en ambas paletas a propósito** -- es el color de marca de la app (el brillo de la card de Inicio, el borde del modelo ganador en Comparación) y no debe cambiar según el tema. Lo que sí cambia por tema es `accentText` (texto legible en la misma familia de morados: oscuro sobre fondo claro, claro sobre fondo oscuro) -- usar el lila puro como color de texto fallaría el contraste en modo claro.

### Idioma (español / English / Português)

Lista de opciones: `Automático (idioma del dispositivo)`, `Español`, `English`, `Português` -- cada idioma siempre se muestra con su propio nombre, para que alguien que cayó en el idioma equivocado pueda encontrar el suyo. "Automático" toma el primer idioma soportado de las preferencias del dispositivo (`expo-localization`) y, si no hay ninguno, español. La elección se guarda con AsyncStorage (misma técnica que el tema) y se aplica al instante, sin reiniciar; en web además se actualiza `<html lang>`.

**Cómo está construido** (`src/i18n/`):

- `i18next` + `react-i18next`. El español (`src/i18n/locales/es/`) es la fuente de verdad; `en/` y `pt/` están tipadas contra su forma (`DeepStrings<typeof es>`), así que **una clave que falte o sobre en cualquier idioma rompe `npx tsc --noEmit`**. Las llamadas `t('clave')` también se verifican contra el español.
- **Los modelos de cálculo siguen siendo puros** (`src/models/**` y `src/utils/**` no importan React ni i18n; vitest los corre bajo Node). En vez de lanzar o devolver textos en español, producen un mensaje neutral al idioma -- una clave más parámetros (`LocalizedError` / `LocalizedMessage`, en `src/utils/localizedMessage.ts`) -- y la UI lo traduce con `translateMessage` / `translateError` (`src/i18n/translateMessage.ts`). Lo mismo aplica a los nombres de modelos, entornos, zonas de desvanecimiento y servicios WCDMA: los modelos solo exponen un `id`, y el texto vive en los archivos de idioma.
- Los nombres técnicos, símbolos y unidades (Bc, fd, Eb/No, MAPL, km², dBm...) no se traducen. `docs/curso-referencia.md` (la base de conocimiento del curso) se mantiene en español.
- **Entrada decimal permisiva**: los campos numéricos aceptan coma o punto sin importar el idioma elegido (`parseDecimal`). Los resultados se muestran siempre con punto decimal.
- Hay tests (`src/i18n/i18n.test.ts`) de que `en`/`pt` conservan los mismos `{{marcadores}}` que `es` en cada texto -- lo único que el chequeo de tipos no ve -- y de que `translateMessage` resuelve correctamente errores, advertencias y plurales.

> **Nota sobre el portugués:** la traducción al portugués no ha pasado por revisión de un hablante nativo -- la terminología de telecomunicaciones (p. ej. *ERB* para estación base, *link budget*, *desvanecimento*) conviene validarla antes de entregarla como material de curso.

## Estado de los modelos

| Modelo | Estado | Rango válido |
|---|---|---|
| Espacio libre (Friis) | ✅ Implementado | Cualquier `d, f > 0` |
| Okumura-Hata | ✅ Implementado | f: 150–1500 MHz, hb: 30–200 m, hm: 1–10 m, d: 1–20 km |
| COST-231 Hata | ✅ Implementado | f: 1500–2000 MHz, hb: 30–200 m, hm: 1–10 m, d: 1–20 km |
| ECC-33 | ✅ Implementado | f: 0–4000 MHz, hb: 20–200 m, hr: 5–10 m, d: 0–10 km |
| Ikegami | ✅ Implementado | f, d > 0; requiere geometría de calle (ver abajo). Signos marcados `[OCR-verificar]` por la fuente del curso |
| Walfisch-Bertoni | ✅ Implementado | f: 300–3000 MHz, d: 0.2–5 km; requiere geometría de edificios (ver abajo) |
| COST-231 Walfish-Ikegami | ✅ Implementado | Sin rango numérico documentado; requiere geometría de calle y de edificios |

**Fuera de alcance, decidido explícitamente:** Ericsson 9999 y Lee -- ambos tenían constantes en `docs/curso-referencia.md` que no coincidieron con múltiples fuentes independientes al verificarlos (ver el registro de la conversación del proyecto), y se excluyeron en vez de implementarlos con dudas sin resolver. **3GPP TR 38.901** está en la taxonomía de entornos pero no implementado todavía -- es un modelo mucho más grande (6 escenarios, LOS/NLOS, unidades distintas al resto de la app) y se dejó deliberadamente para otra sesión de trabajo.

Fuera de su rango válido, un modelo **no bloquea el cálculo**: muestra el resultado junto con una advertencia de que es una extrapolación. Un valor físicamente imposible (frecuencia, distancia o altura ≤ 0) sí bloquea el cálculo, porque las fórmulas dependen de `log10` y ese caso produciría un resultado sin sentido (`-Infinity`).

Todas las constantes y rangos de los modelos implementados están tomados de [`docs/curso-referencia.md`](docs/curso-referencia.md) (base de conocimiento del curso, mantenida por el estudiante y actualizada semanalmente) — no de fuentes genéricas de internet. Donde una constante del curso difiere de la fuente genérica usada originalmente (Hata, ECC-33), el comentario del archivo correspondiente documenta ambos valores y por qué se usa el del curso.

**Ikegami y Walfisch-Bertoni** necesitan parámetros geométricos que los otros cuatro modelos no usan (ancho de calle, altura de edificio, orientación...), agregados como campos **opcionales** en `PropagationInputs` -- ver `src/models/propagation/types.ts`. La UI solo muestra esos campos cuando el modelo correspondiente está seleccionado. Dos advertencias explícitas de estos dos modelos, documentadas en el comentario de cada archivo:

- **Ikegami** (`ikegami.ts`): la fuente del curso marca los signos de esta sección como `[OCR-verificar]` -- no fueron re-derivados de forma independiente.
- **Walfisch-Bertoni** (`walfischBertoni.ts`): el parámetro `H` ("altura antena Tx sobre edificios próximos") se interpretó como altura *sobre* el nivel de los tejados, no absoluta -- una lectura de una redacción ambigua del curso, no un dato confirmado sin ambigüedad.

## Simulador de desvanecimiento

Segunda funcionalidad de la app (`src/screens/FadingScreen.tsx`, modelos en `src/models/fading/`), independiente de la calculadora de pérdida de trayecto de arriba. Implementa `docs/curso-referencia.md` §8 ("Canales multitrayecto -- caracterización en banda ancha"):

- **Bc ≈ 1/(2π·D)** -- ancho de banda de coherencia, a partir de la dispersión de retardo D (§8.3). Presets Rural/Suburbano/Urbano tomados de la tabla del §8.6.
- **fd = f0·(v/c)** -- corrimiento Doppler (§8.4).
- **Tc ≈ 9/(16π·fd)** -- tiempo de coherencia (§8.4). Un móvil estático (v = 0) da Tc = +∞, mostrado como tal, no como error.
- Clasificación **plano/selectivo en frecuencia** (`BT` vs `Bc`) y **lento/rápido** (`Ts` vs `Tc`), y ubicación en una de las **5 zonas** del §8.7 en `src/components/FadingZoneChart.tsx` (gráfica de punto en el plano `BT/Bc` vs `Ts/Tc`, escala log, no una gráfica de líneas).

Verificado numéricamente contra los 3 ejemplos resueltos del curso (§8.8): D=2µs/f=900MHz/v=36km/h da Bc≈80kHz y Tc≈6ms; con BT=25kHz y Ts=50µs cae en zona 2 (plano); con BT=200kHz y Ts=3.7µs (GSM) cae en zona 4 (selectivo en frecuencia).

**Zona 1 ("zona rayada"), advertencia explícita:** el curso nombra esta zona en §8.7 ("no es posible la transmisión") pero su desigualdad exacta vive en un diagrama que no sobrevivió la extracción de texto del PDF -- **`[interpretación no verificada]`**, igual que los `[OCR-verificar]` de `ikegami.ts`. La implementación (`src/models/fading/fading.ts`, función `classifyZone`) la marca como `BT·Ts < 1` (ancho de banda insuficiente para la tasa de símbolo, criterio de Nyquist) **restringido al cuadrante plano/plano** (`BT < Bc` y `Ts < Tc`). Esa restricción no es cosmética: una primera versión aplicaba `BT·Ts < 1` sin restringir y clasificaba mal el propio ejemplo GSM del curso (BT·Ts = 0.74 < 1, pero el curso dice zona 4) -- un ancho de banda ocupado menor que la tasa de símbolo es normal en modulaciones espectralmente eficientes (GMSK incluida), no evidencia de que la transmisión sea imposible.

## Próximas funcionalidades: planificación y dimensionamiento celular (propuestas)

Inspiradas en un segundo PDF del curso, `Planificación de redes de comunicaciones móviles e inalámbricas.pdf` (24/04/2026, ver [`docs/curso-referencia.md`](docs/curso-referencia.md) §13) -- distinto del que ya sustenta la calculadora de propagación y el simulador de desvanecimiento de arriba. En desarrollo en la rama `feature/cellular-planning`: las 6 funcionalidades aprobadas (1, 2, 3, 4a, 5, 6) ya están implementadas y verificadas (ver estado por fila abajo); 4b, 7, 8 y 9 siguen `[PENDIENTE]` por las razones ya explicadas en cada fila.

**Convención de estado:** ✅ **Aprobada** = teoría completa y sin ambigüedad, verificada contra al menos un ejemplo numérico del curso -- lista para implementar directamente. 🚀 **Implementada** = ya está en la app (rama `feature/cellular-planning`), verificada con tests (`vitest`, ver [Verificación de tipos](#verificación-de-tipos)) y en el navegador. 🕒 **[PENDIENTE]** = falta información (fórmula ambigua, sin verificación numérica, o sin confirmar en el material oficial) -- no implementar el cálculo todavía; debe aparecer en la UI como funcionalidad futura (ver nota de UI al final de esta sección), nunca como resultado numérico sin advertencia.

| # | Funcionalidad | Estado | Por qué |
|---|---|---|---|
| 1 | Geometría celular y reutilización de frecuencias | 🚀 Implementada | `src/models/geometry/`. Verificada contra N=7 → D=√21·R (§13.1, diap. 23) |
| 2 | Erlang B -- dimensionamiento por capacidad | 🚀 Implementada | `src/models/traffic/erlangB.ts`. Verificada contra los 3 ejercicios del curso (§13.2) -- 2 de las 3 cifras de referencia están ~3-4% desviadas de la inversión continua exacta, documentado en los tests como redondeo del curso, no error |
| 3 | Puente densidad de tráfico ↔ geometría (`p = B(ρ·Sc, K)`) | 🚀 Implementada | `src/models/traffic/density.ts`. Verificada contra ρ=30.77/500=0.0615 Erlang/km² (§13.2-13.3, diap. 31-32) |
| 4a | Link budget con inversión MAPL → R, para Hata / COST-231-Hata | 🚀 Implementada | `src/models/propagation/{hata,cost231Hata,linkBudget}.ts`. Confirmado contra el PDF original que ambos ejemplos (1G y 2G) usan Okumura-Hata, no COST-231-Hata -- la inversión de distancia es exacta (§13.3, diap. 45-46); la fórmula de MAPL a partir del presupuesto de enlace reproduce el ejemplo 2G exacto pero el 1G queda 2dB por encima sin explicación en el material, documentado como discrepancia abierta |
| 4b | Link budget con inversión MAPL → R, para Ikegami / Walfisch-Bertoni / COST-231 Walfish-Ikegami | 🕒 [PENDIENTE] | Heredan las ambigüedades ya marcadas `[OCR-verificar]` en `ikegami.ts` / `walfischBertoni.ts`; falta confirmar que la inversión tiene forma cerrada |
| 5 | Flujo de dimensionamiento completo 1G/2G (capacidad vs. cobertura, tomar el máximo) | 🚀 Implementada | `src/models/dimensioning/`. Lado de capacidad coincide exacto con ambos ejercicios (6 y 5 celdas); lado de cobertura difiere del curso (2 vs 3, 7 vs 8) como consecuencia directa del hallazgo de MAPL de 4a, no un error nuevo -- la conclusión cualitativa (1G limitado por capacidad, 2G por cobertura) sí coincide en ambos casos |
| 6 | Carga UMTS uplink + bucle iterativo de *cell breathing* | 🚀 Implementada | `src/models/wcdma/`. Gp/sensibilidad/MAPL exactos para los 3 servicios; ρ exacto para PS64k/PS384k; para voz se usa la ecuación impresa en la diap. 67 (α multiplica en el denominador): 0.00669, mientras el curso declara 0.0210 (diap. 72; la diap. 69 escribe su ejemplo sin α y da 0.00995) -- ninguna combinación de los datos dados reproduce 0.0210, documentado sin forzarlo (una versión anterior dividía por α, 0.0148, al revés de la física); la fórmula que conecta usuarios/celda con carga de salida en la tabla de iteraciones del curso no está documentada -- se implementó con la ecuación de carga estándar (amortiguada para estabilidad numérica); con los coeficientes COST-231 de la propia diapositiva converge a R≈1.04 km / η≈56 % (curso: 1.07 km / 54 %) |
| 7 | Carga UMTS downlink (η_DL) | 🕒 [PENDIENTE] | Variable `β` no definida en el material extraído; sin ejercicio de verificación (§13.4-13.5) |
| 8 | Erlang C (modelo de cola) | 🕒 [PENDIENTE] | No aparece en el material del curso; aplicabilidad a canales de radio (sistema de pérdida, no de cola) sin confirmar |
| 9 | Engset / Erlang B extendido (con reintentos) | 🕒 [PENDIENTE] | Solo en el resumen de industria (`erlang.com`), no en material oficial del curso |

### 1. Geometría celular y reutilización de frecuencias -- ✅ Aprobada

**Qué resuelve:** dado un radio de celda R (o al revés), calcula el paso de retícula d, la distancia de reutilización D, valida el tamaño de agrupación N contra la lista de números rómbicos permitidos, el área del rombo cocanal, el número de agrupaciones Q para cubrir un área total, y el área por sector si se sectoriza.

**Fórmulas:** ver [`docs/curso-referencia.md`](docs/curso-referencia.md) §13.1.

**Encaje propuesto:** módulo nuevo `src/models/geometry/` (mismo patrón que `models/fading/`: `types.ts`, `geometry.ts`, `index.ts`) + pantalla `GeometryScreen.tsx`, entrada nueva en `RootNavigator.tsx` y una tercera card en `HomeScreen.tsx`.

**Validación:** `assertPositive` para R; N debe pertenecer al conjunto de números rómbicos válidos (rechazar con mensaje claro si no, no solo advertir).

**Verificación de referencia:** N=7 → D=√21·R (diap. 23).

### 2. Erlang B -- dimensionamiento por capacidad -- ✅ Aprobada

**Qué resuelve:** recursión de Erlang B (bloqueo dado K canales y tráfico A) y su inversa (`A = B⁻¹(K,GoS)`, tráfico soportable dado K canales y GoS objetivo; y `K = B⁻¹(A,GoS)` redondeando hacia arriba, canales necesarios dado tráfico y GoS).

**Fórmulas:** ver [`docs/curso-referencia.md`](docs/curso-referencia.md) §13.2. Usar la forma recursiva, no la factorial (desborda numéricamente).

**Encaje propuesto:** `src/models/traffic/erlangB.ts` (+ `types.ts`, `index.ts`) + pantalla `TrafficScreen.tsx` con selector de "qué despejar" (bloqueo / canales / tráfico), similar a los chips de preset del simulador de desvanecimiento.

**Validación:** `assertPositive` para A y K; GoS debe estar en (0,1); K debe ser entero (redondear hacia arriba en la inversa).

**Verificación de referencia:** `B⁻¹(59, 0.02) = 47 Erlang/celda` (diap. 45); `B⁻¹(70, 0.02) = 57 Erlang/celda` (diap. 46); `B⁻¹(42, 0.01) = 30.77 Erlang/celda` (diap. 31).

### 3. Puente densidad de tráfico ↔ geometría -- ✅ Aprobada

**Qué resuelve:** `p = B(ρ·Sc, K)` -- dada la densidad de tráfico ρ (Erlang/km², normalmente proveniente de una densidad de usuarios y tráfico/usuario) y el área de celda Sc (de la funcionalidad 1), calcula el bloqueo con K canales; o, a la inversa, la densidad máxima soportable para un GoS objetivo.

**Encaje propuesto:** no necesita módulo propio -- es una combinación de las funcionalidades 1 y 2; puede vivir como una pantalla `DensityScreen.tsx` que importa `models/geometry` y `models/traffic/erlangB`, o como un modo adicional dentro de `TrafficScreen.tsx`.

**Verificación de referencia:** diap. 28 (definición) y diap. 31-32 (ejemplo con ρ=30.77/500=0.0615 Erlang/km²).

### 4a. Link budget con inversión MAPL → R (Hata / COST-231-Hata) -- ✅ Aprobada

**Qué resuelve:** hoy `CalculatorScreen` solo calcula L(d) dado d. Esta funcionalidad recibe un link budget completo (potencia MS, ganancias de antena, body loss, pérdida de feeder, sensibilidad de BTS, margen de sombra, margen de interferencia -- la misma tabla de parámetros de diap. 45-46) y calcula el MAPL, luego invierte Hata/COST-231-Hata (lineales en log10(d)) para obtener R_max.

**Encaje propuesto:** agregar una función `solveDistanceKm(inputs, targetLossDb): number` a `hata.ts` y `cost231Hata.ts` (álgebra directa: despejar `log10(d)` de la ecuación ya implementada en `calculate()`), un tipo `LinkBudgetInputs` nuevo, y una pantalla `LinkBudgetScreen.tsx` con la tabla de parámetros y el resultado R_max.

**Validación:** reutilizar `assertPositive`; el MAPL resultante debe ser positivo (potencia EIRP > sensibilidad, si no, error claro de "no hay margen de enlace").

**Verificación de referencia:** MAPL=141 dB → R=2.5 km (diap. 45, Okumura-Hata urbano); MAPL=133 dB → R=1.5 km (diap. 46).

### 4b. Link budget con inversión MAPL → R (Ikegami / Walfisch-Bertoni / COST-231 WI) -- 🕒 [PENDIENTE]

**Qué falta:** estos tres modelos ya cargan advertencias propias (`[OCR-verificar]` en Ikegami, interpretación no confirmada de `H` en Walfisch-Bertoni). Antes de invertirlos hay que confirmar (a) que la fórmula base es correcta, y (b) que es invertible en forma cerrada para R con los demás parámetros geométricos fijos (no es evidente para Walfisch-Bertoni, que mezcla `log10(d)` con `log10(1 + d²/(17H))`).

**Tratamiento en la app mientras tanto:** en `LinkBudgetScreen.tsx`, el selector de modelo debe **excluir** estos tres (o mostrarlos deshabilitados con la etiqueta "Próximamente -- pendiente de confirmar invertibilidad"), igual que ya se documenta el estado de cada modelo en la tabla "Estado de los modelos" de arriba.

### 5. Flujo de dimensionamiento completo 1G/2G -- ✅ Aprobada

**Qué resuelve:** compone 1, 2 y 4a en el flujo exacto de los ejercicios del curso: tráfico total → celdas por capacidad (vía 2) → link budget → celdas por cobertura (vía 4a) → resultado = máximo de ambas. Es, en esencia, una calculadora que resuelve la tarea de la diap. 75 del PDF (entrega 5 de mayo) para 1G y 2G.

**Encaje propuesto:** pantalla `DimensioningScreen.tsx` que orquesta los módulos anteriores y presenta el resultado igual que la tabla de diap. 32 (radio, # celdas, área, canales/celda, tráfico/celda, densidad, # abonados por etapa).

**Verificación de referencia:** tabla completa de diap. 32 (4 etapas de división celular) y los dos ejercicios de diap. 44-46.

### 6. Carga UMTS uplink + *cell breathing* -- ✅ Aprobada

**Qué resuelve:** el equivalente de la funcionalidad 5 para 3G/UMTS, donde la capacidad y la cobertura están acopladas por la carga de celda en vez de ser independientes. Implementa Gp, ρ_i, η_UL y el bucle iterativo MAPL_efectivo → R → usuarios → η, hasta converger.

**Encaje propuesto:** módulo independiente `src/models/wcdma/` (matemática distinta de Erlang B -- carga continua, no canales discretos) + pantalla `WcdmaLoadScreen.tsx` que muestra la tabla de iteraciones tal como en diap. 73 (columna por iteración: carga, MAPL_ef, R, área, usuarios, ΔR) hasta convergencia.

**Validación:** η debe converger a menos de 1 (carga inestable si no); iterar con un límite máximo de iteraciones y reportar si no converge.

**Verificación de referencia:** ejercicio completo de diap. 71-74 (converge en 3 iteraciones a R=1.07 km, η=54%).

### 7. Carga UMTS downlink (η_DL) -- 🕒 [PENDIENTE]

**Qué falta:** la variable `β` de la fórmula extraída no está definida en el material (§13.4-13.5), y no hay ningún ejercicio del curso que la ejercite numéricamente. Implementarla ahora significaría adivinar una convención de la literatura (factor de ortogonalidad) sin poder verificarla contra el curso.

**Tratamiento en la app mientras tanto:** `WcdmaLoadScreen.tsx` debe mostrar únicamente el resultado de uplink, con una nota explícita "Downlink: pendiente de confirmar la definición de β contra el material del curso -- no implementado."

### 8. Erlang C -- 🕒 [PENDIENTE]

**Qué falta:** confirmación del profesor de si el curso lo cubre, y en qué contexto de dimensionamiento de canales de radio se aplicaría un modelo de cola (los canales de radio en este curso son todos de pérdida pura, no de espera).

**Tratamiento en la app mientras tanto:** no incluir como opción en `TrafficScreen.tsx`; si se agrega más adelante, debe ir en un módulo separado (`erlangC.ts`) para no mezclar un modelo no confirmado con Erlang B (que sí lo está).

### 9. Engset / Erlang B extendido -- 🕒 [PENDIENTE]

**Qué falta:** igual que 8 -- no aparecen en ningún material oficial cargado hasta ahora, solo en el resumen de industria de `erlang.com`.

### Nota de UI para funcionalidades [PENDIENTE]

Ninguna funcionalidad marcada 🕒 [PENDIENTE] debe producir un resultado numérico en la app -- mostrarla, si se agrega a la UI antes de resolver el vacío, como una card o modelo **deshabilitado** con la etiqueta "Próximamente", siguiendo el mismo criterio que ya aplica la tabla "Estado de los modelos" de arriba a un modelo no implementado. Esto probablemente implica extender `HomeScreen.tsx` de dos cards hardcodeadas a una lista de cards data-driven con un campo `status: 'enabled' | 'coming-soon'`, en vez de agregar un tercer bloque JSX casi idéntico por cada funcionalidad nueva.

## Requisitos previos

- **Node.js**: `^20.19.4 || ^22.13.0 || ^24.3.0 || >=25.0.0` (requerido por React Native 0.86; verificado en `node_modules/react-native/package.json`).
- **npm** (incluido con Node). El proyecto usa `package-lock.json`, no `yarn.lock` ni `pnpm-lock.yaml`.
- Para probar en un teléfono físico: la app **Expo Go** ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)), en la misma red Wi-Fi que el computador.
- Para compilar nativo (opcional, no necesario para desarrollo con Expo Go):
  - Android: Android Studio + SDK.
  - iOS: Xcode (solo macOS).

## Instalación

```bash
git clone https://github.com/SteamedPotato69/telecomm-propagation.git
cd telecomm-propagation
npm install
```

## Abrir y ejecutar en VS Code

1. **File → Open Folder…** y selecciona la raíz del repo (donde está `package.json`). No abras un subdirectorio.
2. Abre la terminal integrada: **Terminal → New Terminal** (o `` Ctrl+` ``).
3. Corre los comandos de [Instalación](#instalación) y [Ejecución](#ejecución) desde esa terminal.

Extensión opcional: **Expo Tools** (publicador Expo) para snippets y soporte de `app.json`. El soporte de TypeScript/JSX ya viene integrado en VS Code, sin configuración adicional.

No hay `launch.json` configurado para debugging con breakpoints nativos de VS Code -- para eso hace falta configuración aparte, no cubierta todavía. Para probar la calculadora, `npm run web` o Expo Go es suficiente.

## Ejecución

```bash
# Servidor de desarrollo de Expo (elige la plataforma desde el menú interactivo)
npm start

# Directamente en una plataforma:
npm run web       # navegador, http://localhost:8081
npm run android   # emulador Android o dispositivo con Expo Go
npm run ios       # simulador iOS (solo macOS) o dispositivo con Expo Go
```

Con `npm start` o `npm run android`/`ios`, Expo muestra un código QR: escanéalo con la app Expo Go para abrir el proyecto en un dispositivo físico.

## Empaquetar como app de escritorio (Windows, opción simple)

Un lanzador liviano para Windows: genera el build web estático y lo sirve localmente, abriendo el navegador predeterminado automáticamente. No es una app nativa empaquetada (eso -- Electron/Tauri o un `.exe` con Node embebido -- queda como posible siguiente paso); esto asume que la máquina que lo ejecuta ya tiene Node.js instalado.

```bash
npm run build:web       # genera dist/ (build estático de Expo para web)
```

Luego, para arrancarlo:

- Haciendo doble clic en [`desktop/iniciar-app.bat`](desktop/iniciar-app.bat) -- genera el build si falta, levanta el servidor y abre el navegador solo.
- O manualmente: `npm run start:desktop` (equivalente a `node desktop/serve.js`).

Detalles de [`desktop/serve.js`](desktop/serve.js): servidor HTTP estático sin dependencias externas (solo módulos nativos de Node), puerto `4173` por defecto (configurable con la variable de entorno `PORT`), con protección contra path traversal y un *fallback* a `index.html` para rutas sin extensión. Abre el navegador únicamente después de que el servidor ya está escuchando, para evitar una carrera entre "abrir el navegador" y "que el servidor responda".

`dist/` es un artefacto de build (ya está en `.gitignore`) -- se regenera con `npm run build:web`, no se versiona.

## EAS (Expo Application Services)

El proyecto ya está vinculado a un proyecto EAS existente (ver `app.json`):

- `projectId`: `d49ee7fe-6cb5-470f-9bae-664c6e548834`
- `owner`: `latriassona` (organización en Expo, no una cuenta personal)
- `slug`: `telecomm` -- distinto del nombre del paquete (`telecomm-propagation`); se adoptó el slug que ya existía en ese proyecto EAS en vez de renombrarlo del lado del servidor.

Esto **no es necesario para desarrollo local** (`npm run web` / Expo Go no lo requieren). Solo importa si vas a compilar nativo o publicar actualizaciones OTA:

```bash
npm install --global eas-cli
eas login     # cuenta con acceso a la organización "latriassona"
eas whoami    # verifica qué cuenta quedó activa
```

Si tu cuenta no tiene acceso a "latriassona", `eas build`/`eas update` van a fallar con un error de permisos -- hay que pedir que te agreguen a la organización antes.

### Generar un APK para probar en un dispositivo

```bash
eas build --platform android --profile preview
```

Corre en la nube (no requiere Android Studio ni SDK local); al terminar, la terminal muestra un enlace de descarga del `.apk`. Instálalo directamente en el teléfono (fuera de Google Play, así que Android va a pedir permitir "instalar apps de origen desconocido" la primera vez).

No usar el perfil `production` para esto: genera un `.aab`, pensado para subir a Play Store, no instalable directamente.

## Verificación de tipos

```bash
npx tsc --noEmit
```

Además del código, esto verifica que las tres traducciones tengan exactamente las mismas claves y que cada `t('clave')` de la UI exista.

## Tests

```bash
npx vitest run
```

Alcance limitado a `src/models/**`, a la persistencia del plan y del progreso en `src/storage/` (con un almacén en memoria inyectado) y a los *datos* de traducción en `src/i18n/` (más `translateMessage`): ese código no importa nada de `react-native`/Expo, así que corre bajo Node sin necesitar mocks de RN/jsdom (el test de i18n crea su propia instancia de `i18next` en vez de importar `src/i18n/index.ts`, que sí necesita `expo-localization`). Cubre las funcionalidades de planificación celular (geometría, Erlang B, link budget) -- los modelos de propagación y desvanecimiento originales todavía se verifican solo a ojo en el navegador (ver [Trabajo futuro](#trabajo-futuro)).

## Estructura del proyecto

```
App.tsx                          # punto de entrada; renderiza RootNavigator
src/
  models/propagation/
    types.ts                     # PropagationInputs/Result/Warning, contrato PropagationModelDefinition, GeometryFieldKey
    environments.ts              # ENVIRONMENT_CATEGORIES: taxonomía de entornos -> modelos aplicables
    freeSpace.ts                 # modelo de espacio libre (Friis)
    hata.ts                      # Okumura-Hata (urbano/suburbano/rural)
    cost231Hata.ts               # COST-231 Hata
    ecc33.ts                     # ECC-33
    ikegami.ts                   # Ikegami (requiere geometría de calle)
    walfischBertoni.ts           # Walfisch-Bertoni (requiere geometría de edificios)
    cost231WalfishIkegami.ts     # COST-231 Walfish-Ikegami (combina Ikegami + Walfisch-Bertoni)
    linkBudget.ts                # calculateMapl(): MAPL desde un presupuesto de enlace completo (§13.3)
    sampleSeries.ts               # evalúa un modelo sobre un rango de distancias, para las gráficas
    registry.ts                  # registro: PROPAGATION_MODELS / PROPAGATION_MODEL_LIST
    modelSelection.ts            # recommendInvertibleModel(f): elige el modelo cuyo rango de frecuencia encaja
    index.ts                     # barrel
  models/fading/
    types.ts                     # FadingInputs/Result, FadingZone
    fading.ts                    # calculateFading(): Bc, fd, Tc, clasificación y las 5 zonas (§8.7)
    environments.ts              # DELAY_SPREAD_PRESETS: presets Rural/Suburbano/Urbano (§8.6)
    index.ts                     # barrel
  models/geometry/                # planificación celular (§13.1) -- rama feature/cellular-planning
    types.ts                     # GeometryInputs/Result
    rhombicNumbers.ts            # tabla de ejemplo + isValidRhombicNumber (N=i²+ij+j²)
    geometry.ts                  # calculateCellularGeometry(): retícula hexagonal, reuso, Q
    index.ts                     # barrel
  models/traffic/                 # planificación celular (§13.2-13.3) -- rama feature/cellular-planning
    erlangB.ts                   # erlangBBlocking / erlangBInverseTraffic / erlangBInverseChannels
    density.ts                   # puente densidad de tráfico <-> geometría (p = B(ρ·Sc, K))
    index.ts                     # barrel
  models/dimensioning/             # planificación celular (§13.3) -- rama feature/cellular-planning
    types.ts                     # DimensioningInputs/Result
    dimensioning.ts               # calculateDimensioning(): orquesta traffic + propagation, max(capacidad, cobertura)
    index.ts                     # barrel
  models/wcdma/                    # planificación celular (§13.4) -- rama feature/cellular-planning
    types.ts                     # ServiceMix/Load, WcdmaLoadInputs/Result, WcdmaIterationStep
    presets.ts                   # DEFAULT_SERVICE_MIX: mix del ejercicio del curso (70% voz / 20% PS64k / 10% PS384k)
    wcdma.ts                      # calculateServiceLoad, calculateWcdmaUplinkLoad (bucle de cell breathing amortiguado)
    index.ts                     # barrel
  models/plan/                     # motor del plan 1G/2G/3G (puro) -- rama feature/cell-puzzle
    frequencyPlan.ts             # canales por celda: 1G 416 -> 59; 2G 40 portadoras -> 10 TRX -> 70 TCH (diap. 44-46)
    plan1g2g.ts                  # escenario -> espectro -> capacidad -> cobertura -> resultado, en el orden "a lápiz"
    plan3g.ts                    # 3G automático: 3 datos de entrada, el resto por defecto del curso (reintenta con paso menor si el bucle oscila)
    gameMission.ts               # GameMission: lo único que el rompecabezas lee del plan (solo lectura)
    presets.ts                   # COURSE_1G / COURSE_2G: el ejemplo resuelto del curso
  models/layout/                   # geometría del rompecabezas (puro) -- rama feature/cell-puzzle
    hexGrid.ts                   # celdas hexagonales en coordenadas axiales (d = R·√3, Sc = 3√3/2·R²)
    clusterLattice.ts            # la agrupación de N celdas como pieza: N colores, imán a la retícula cocanal (distancia D)
    areaShape.ts                 # el área S_T como forma movible de superficie exacta
    scale.ts                     # línea de referencia (1 km por defecto) -> píxeles por km; ¿cabe el área en la imagen?
    coverage.ts                  # cobertura por muestreo del área
    autoTiling.ts                # mínimo de agrupaciones que cubren el área (referencia para estrellas y pistas)
    areaPlacement.ts             # dónde está el área sobre la imagen (centro en píxeles), ajuste a la imagen, ¿se puede jugar?
    placement.ts                 # reductor de las piezas colocadas: la primera fija la retícula; deshacer, pistas, autocompletar
    puzzle.ts                    # colores por grupo, estrellas, pista y autocompletar
  models/game/                     # camino de niveles (puro) -- rama feature/puzzle-gamification
    levels.ts                    # los 4 tutoriales como datos y su escala; la misión nunca está bloqueada
    progress.ts                  # XP, estrellas, racha por día, desbloqueo y recordResult
    confetti.ts                  # dónde cae cada pieza del confeti (determinista)
  utils/
    validation.ts                # assertPositive, assertNonNegative, assertUnitInterval, assertInteger, rangeWarningMessage, parseDecimal, requireField
    localizedMessage.ts          # LocalizedError / LocalizedMessage: errores y advertencias neutrales al idioma (clave + parámetros)
    format.ts                    # formatPathLoss, formatCoherenceBandwidth, formatDopplerShift, formatCoherenceTime
  components/
    NumericField.tsx             # campo numérico controlado (unit opcional para parámetros sin unidad)
    ModelSelector.tsx            # selector de modelo (chips), genérico sobre {id,label,disabled}
    ResultPanel.tsx              # resultado + advertencias + errores
    LineChart.tsx                 # gráfica de líneas sobre react-native-svg (eje lineal o log)
    FadingResultPanel.tsx        # Bc/fd/Tc + clasificación plano-selectivo / lento-rápido
    FadingZoneChart.tsx          # gráfica de punto BT/Bc vs Ts/Tc sobre react-native-svg (no LineChart)
    GlowCard.tsx                 # card con brillo neón (cards de nivel superior en Inicio)
    SegmentedControl.tsx         # switch de pocas opciones cortas (modo de tema)
    BackButton.tsx               # botón de volver (solo flecha, objetivo táctil de 48dp)
    plan/                        # piezas del asistente: PlanShell (progreso + Anterior/Siguiente), PlanLedger, PlanNumberField, pasos 1G/2G y 3G, SummaryStep
    puzzle/                      # rompecabezas: carga de imagen y cámara, MapCanvas (imagen + SVG + gestos), pasos línea/área/juego, resultado
    ListCard.tsx                 # card de lista simple (pantallas hub: Entorno, Planificación celular)
    GeometryResultPanel.tsx      # resultado de geometría celular
    TrafficResultPanel.tsx       # resultado genérico de un solo número (Erlang B / densidad)
    LinkBudgetForm.tsx           # bloque de ~8 campos de presupuesto de enlace, compartido entre pantallas
    LinkBudgetResultPanel.tsx    # EIRP / MAPL / radio de celda máximo
    DimensioningResultPanel.tsx  # tabla por etapas: capacidad / cobertura / resultado final
    WcdmaResultPanel.tsx          # carga por servicio, usuarios simultáneos, traza de convergencia
  screens/
    RootNavigator.tsx            # estado de navegación (union Route, un case por pantalla)
    HomeScreen.tsx                # cards de nivel superior, data-driven + botón de Ajustes
    SettingsScreen.tsx            # ajustes: tema e idioma
    PlanStartScreen.tsx           # planificación guiada: elegir 1G/2G/3G, continuar o empezar de nuevo
    PlanWizardScreen.tsx          # los pasos del asistente (1G/2G y 3G)
    CellPuzzleScreen.tsx          # el minijuego: imagen -> línea -> área -> juego (solo lee la misión del plan)
    PuzzlePathScreen.tsx          # el camino de niveles: XP, estrellas, racha, 4 tutoriales y Tu misión
    TutorialScreen.tsx            # un nivel tutorial: el mismo juego con datos inventados
    EnvironmentScreen.tsx         # selector de entorno
    CalculatorScreen.tsx          # formulario + resultado, filtrado por entorno
    ComparisonScreen.tsx          # vista "versus" entre todos los modelos del entorno
    geometryFieldConfig.ts        # unidad/default por cada GeometryFieldKey (etiqueta y ayuda: i18n `geometryFields.*`)
    FadingScreen.tsx              # simulador de desvanecimiento: formulario + resultado + gráfica de zona
    CellularHubScreen.tsx        # hub de planificación celular -- rama feature/cellular-planning
    GeometryScreen.tsx            # ídem
    TrafficScreen.tsx             # ídem (modos Bloqueo/Tráfico/Canales/Densidad)
    LinkBudgetScreen.tsx          # ídem
    DimensioningScreen.tsx        # ídem (capacidad + cobertura, orquesta 1, 2 y 4a)
    WcdmaLoadScreen.tsx           # ídem (carga UMTS uplink + cell breathing)
  i18n/
    index.ts                     # inicializa i18next (idioma del dispositivo) y re-exporta el módulo
    languages.ts                 # Language, nombres nativos, detección del idioma del dispositivo
    LocaleContext.tsx            # LocaleProvider + useLocale(); persistencia con AsyncStorage, <html lang> en web
    translateMessage.ts          # translateMessage / translateError: LocalizedMessage -> texto
    i18next.d.ts                 # tipa t('clave') contra el español
    locales/{es,en,pt}/          # textos por idioma (core, propagation, calculator, fading, cellular); es es la fuente de verdad
  plan/
    PlanContext.tsx              # PlanProvider + usePlan1g2g/usePlan3g: plan guardado, guardado con retardo, nunca pisa lo guardado antes de terminar de cargar
  progress/
    ProgressContext.tsx          # ProgressProvider + useProgress: XP/estrellas/racha guardados, record() devuelve lo ganado
  storage/
    planStore.ts                 # persistencia versionada del plan (entradas + paso + instantánea); tolera datos corruptos
    progressStore.ts             # persistencia versionada del progreso; descarta campo a campo lo corrupto
  theme/
    palette.ts                    # tokens de color claro/oscuro; accent (lila neón) es constante en ambos
    ThemeContext.tsx               # ThemeProvider + useTheme(); persistencia con AsyncStorage
```

## Cómo agregar un nuevo modelo de propagación

1. Crear `src/models/propagation/miModelo.ts` que exporte una función `calculate(inputs: PropagationInputs): PropagationResult` y un objeto `PropagationModelDefinition` (ver `freeSpace.ts` como plantilla mínima o `hata.ts` para uno con validación de rango y corrección por entorno).
2. Usar `assertPositive` para cualquier valor que entre a un `log10`, `rangeWarningMessage` para el rango empírico del modelo, y `requireField` para cualquier parámetro geométrico opcional que el modelo necesite. Estos helpers (y cualquier error propio, vía `LocalizedError`) reciben **claves** de traducción (`fields.*`, `errors.*`), no texto: el modelo no escribe en ningún idioma.
3. Si el modelo necesita un parámetro geométrico que `PropagationInputs` no tiene todavía, extenderlo ahí como campo **opcional**, agregarlo a `GeometryFieldKey`, y declarar `extraFields` en el `PropagationModelDefinition` -- eso es lo único que hace falta para que `CalculatorScreen` muestre el campo correcto automáticamente, sin tocar la UI.
4. Registrar el modelo en `src/models/propagation/index.ts` (`PROPAGATION_MODELS` y `PROPAGATION_MODEL_LIST`).
5. Agregar el modelo a `applicableModelIds` de la(s) categoría(s) de `environments.ts` donde aplique.
6. Agregar `models.<id>` (`label`, `shortLabel`, `citation`) en los tres idiomas de `src/i18n/locales/` (y las claves `fields.*` / `errors.*` nuevas que use) -- `tsc` avisa si falta alguna.

No hace falta tocar los componentes de UI directamente: leen el registro y la taxonomía dinámicamente.

## Trabajo futuro

- Extender la cobertura de `vitest` (introducida para los modelos de planificación celular, ver [Verificación de tipos](#verificación-de-tipos)) a los modelos de propagación y desvanecimiento originales -- hoy solo tienen un test de humo (`freeSpace.test.ts`), el resto sigue verificado únicamente a ojo en el navegador. Usar valores de referencia resueltos a mano o en clase -- **no** buscados en fuentes genéricas de internet (ver `docs/curso-referencia.md` §5.2 para el ejercicio pendiente de resolver que serviría de caso de prueba).
- Implementar 3GPP TR 38.901 (6 escenarios, LOS/NLOS, unidades en GHz/metros) -- deliberadamente fuera de esta ronda por tamaño.
- Las gráficas de la comparación samplean un rango fijo de distancias (0.3-20 km) independiente del rango de validez documentado de cada modelo -- una curva puede extenderse visualmente más allá de donde el modelo está validado, igual que ya toleran las advertencias de rango en la calculadora. Vale la pena marcar visualmente ese tramo si se vuelve confuso en la práctica.
- Simulador de desvanecimiento: la desigualdad exacta de la "zona rayada" (zona 1, §8.7) no está en el texto extraído del curso -- ver la advertencia `[interpretación no verificada]` en `src/models/fading/fading.ts`. Si el estudiante consigue el diagrama original, vale la pena revisar el criterio implementado (`BT·Ts < 1` restringido al cuadrante plano/plano) contra la desigualdad real.

## Licencia

Ver [LICENSE](LICENSE).
