# telecomm-propagation

Calculadora de modelos de pérdida de propagación en canales móviles (espacio libre, Hata, COST-231, ECC-33, Ikegami, Walfisch-Bertoni, COST-231 Walfish-Ikegami) desarrollada en Expo/React Native. Proyecto del curso de énfasis 2 Análisis de redes móviles — Universidad del Cauca.

## Navegación de la app

`Inicio` → `Entorno` → `Calculadora` → `Comparación`, y por separado `Inicio` → `Simulador de desvanecimiento` (ver `src/screens/RootNavigator.tsx`):

1. **Inicio**: dos cards, ambas habilitadas. "Métodos empíricos de propagación" (pérdida de trayecto) y "Simulador de desvanecimiento" (flat/selectivo y lento/rápido).
2. **Entorno**: elige una categoría de la taxonomía de entornos (`src/models/propagation/environments.ts`) -- determina qué modelos son aplicables.
3. **Calculadora**: el selector de modelos solo muestra los aplicables al entorno elegido; los campos de geometría (ancho de calle, altura de edificios, etc.) solo aparecen cuando el modelo seleccionado los necesita.
4. **Comparación**: corre todos los modelos aplicables del entorno con los mismos parámetros y los compara contra la pérdida en espacio libre ("predicción ideal"); el de menor distancia se marca como mejor ajuste. Debajo de las tarjetas, dos gráficas (`src/components/LineChart.tsx`, sobre `react-native-svg`) de pérdida vs. distancia -- escala logarítmica y lineal, todas las curvas superpuestas, muestreadas en 0.3-20 km con los demás parámetros fijos.
5. **Simulador de desvanecimiento** (`src/screens/FadingScreen.tsx`): a partir de frecuencia portadora, dispersión de retardo (D, con chips de preset Rural/Suburbano/Urbano), velocidad del móvil, ancho de banda de la señal y duración de símbolo (o tasa de símbolo, invertible a Ts), calcula el ancho de banda de coherencia (Bc), el corrimiento Doppler (fd) y el tiempo de coherencia (Tc); clasifica el canal como plano/selectivo en frecuencia y lento/rápido (selectivo en tiempo), y ubica el punto de operación en una de las 5 zonas del plano BT/Bc vs. Ts/Tc (`src/components/FadingZoneChart.tsx`, gráfica de punto sobre `react-native-svg`, no una serie de líneas -- distinta de `LineChart.tsx`).

## Tema claro/oscuro

Debajo del subtítulo de Inicio hay un switch de 3 posiciones (`🌙 Oscuro` / `🖥 Auto` / `☀ Claro`) para elegir el modo directamente, sin ciclar. "Auto" sigue la preferencia del sistema operativo/navegador (`useColorScheme`); una elección manual se guarda con `@react-native-async-storage/async-storage` y se recuerda entre sesiones.

Los tokens de color están en [`src/theme/palette.ts`](src/theme/palette.ts), consumidos vía el hook `useTheme()` de [`src/theme/ThemeContext.tsx`](src/theme/ThemeContext.tsx). El **lila neón (`#c084fc`) es idéntico en ambas paletas a propósito** -- es el color de marca de la app (el brillo de la card de Inicio, el borde del modelo ganador en Comparación) y no debe cambiar según el tema. Lo que sí cambia por tema es `accentText` (texto legible en la misma familia de morados: oscuro sobre fondo claro, claro sobre fondo oscuro) -- usar el lila puro como color de texto fallaría el contraste en modo claro.

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

No hay suite de tests todavía (ver [Trabajo futuro](#trabajo-futuro)).

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
    sampleSeries.ts               # evalúa un modelo sobre un rango de distancias, para las gráficas
    index.ts                     # registro: PROPAGATION_MODELS / PROPAGATION_MODEL_LIST
  models/fading/
    types.ts                     # FadingInputs/Result, FadingZone
    fading.ts                    # calculateFading(): Bc, fd, Tc, clasificación y las 5 zonas (§8.7)
    environments.ts              # DELAY_SPREAD_PRESETS: presets Rural/Suburbano/Urbano (§8.6)
    zoneLabels.ts                 # título/descripción en español por cada FadingZone
    index.ts                     # barrel
  utils/
    validation.ts                # assertPositive, assertNonNegative, rangeWarningMessage, parseDecimal, requireField
    format.ts                    # formatPathLoss, formatCoherenceBandwidth, formatDopplerShift, formatCoherenceTime
  components/
    NumericField.tsx             # campo numérico controlado (unit opcional para parámetros sin unidad)
    ModelSelector.tsx            # selector de modelo (chips)
    ResultPanel.tsx              # resultado + advertencias + errores
    LineChart.tsx                 # gráfica de líneas sobre react-native-svg (eje lineal o log)
    FadingResultPanel.tsx        # Bc/fd/Tc + clasificación plano-selectivo / lento-rápido
    FadingZoneChart.tsx          # gráfica de punto BT/Bc vs Ts/Tc sobre react-native-svg (no LineChart)
  screens/
    RootNavigator.tsx            # estado de navegación: home -> environment -> calculator -> comparison -> fading
    HomeScreen.tsx                # las dos cards de entrada
    EnvironmentScreen.tsx         # selector de entorno
    CalculatorScreen.tsx          # formulario + resultado, filtrado por entorno
    ComparisonScreen.tsx          # vista "versus" entre todos los modelos del entorno
    geometryFieldConfig.ts        # label/unidad/helper/default por cada GeometryFieldKey
    FadingScreen.tsx              # simulador de desvanecimiento: formulario + resultado + gráfica de zona
  theme/
    palette.ts                    # tokens de color claro/oscuro; accent (lila neón) es constante en ambos
    ThemeContext.tsx               # ThemeProvider + useTheme(); persistencia con AsyncStorage
```

## Cómo agregar un nuevo modelo de propagación

1. Crear `src/models/propagation/miModelo.ts` que exporte una función `calculate(inputs: PropagationInputs): PropagationResult` y un objeto `PropagationModelDefinition` (ver `freeSpace.ts` como plantilla mínima o `hata.ts` para uno con validación de rango y corrección por entorno).
2. Usar `assertPositive` para cualquier valor que entre a un `log10`, `rangeWarningMessage` para el rango empírico del modelo, y `requireField` para cualquier parámetro geométrico opcional que el modelo necesite.
3. Si el modelo necesita un parámetro geométrico que `PropagationInputs` no tiene todavía, extenderlo ahí como campo **opcional**, agregarlo a `GeometryFieldKey`, y declarar `extraFields` en el `PropagationModelDefinition` -- eso es lo único que hace falta para que `CalculatorScreen` muestre el campo correcto automáticamente, sin tocar la UI.
4. Registrar el modelo en `src/models/propagation/index.ts` (`PROPAGATION_MODELS` y `PROPAGATION_MODEL_LIST`).
5. Agregar el modelo a `applicableModelIds` de la(s) categoría(s) de `environments.ts` donde aplique.

No hace falta tocar los componentes de UI directamente: leen el registro y la taxonomía dinámicamente.

## Trabajo futuro

- Añadir tests unitarios por modelo, con valores de referencia resueltos a mano o en clase -- **no** buscados en fuentes genéricas de internet (ver `docs/curso-referencia.md` §5.2 para el ejercicio pendiente de resolver que serviría de caso de prueba).
- Implementar 3GPP TR 38.901 (6 escenarios, LOS/NLOS, unidades en GHz/metros) -- deliberadamente fuera de esta ronda por tamaño.
- Las gráficas de la comparación samplean un rango fijo de distancias (0.3-20 km) independiente del rango de validez documentado de cada modelo -- una curva puede extenderse visualmente más allá de donde el modelo está validado, igual que ya toleran las advertencias de rango en la calculadora. Vale la pena marcar visualmente ese tramo si se vuelve confuso en la práctica.
- Simulador de desvanecimiento: la desigualdad exacta de la "zona rayada" (zona 1, §8.7) no está en el texto extraído del curso -- ver la advertencia `[interpretación no verificada]` en `src/models/fading/fading.ts`. Si el estudiante consigue el diagrama original, vale la pena revisar el criterio implementado (`BT·Ts < 1` restringido al cuadrante plano/plano) contra la desigualdad real.

## Licencia

Ver [LICENSE](LICENSE).
