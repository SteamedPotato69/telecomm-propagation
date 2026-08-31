# telecomm-propagation

Calculadora de modelos de pérdida de propagación en canales móviles (espacio libre, Hata, COST-231, ECC-33, Ikegami, Walfisch-Bertoni) desarrollada en Expo/React Native. Proyecto del curso de énfasis 2 Análisis de redes móviles — Universidad del Cauca.

## Estado de los modelos

| Modelo | Estado | Rango válido |
|---|---|---|
| Espacio libre (Friis) | ✅ Implementado | Cualquier `d, f > 0` |
| Okumura-Hata | ✅ Implementado | f: 150–1500 MHz, hb: 30–200 m, hm: 1–10 m, d: 1–20 km |
| COST-231 Hata | ✅ Implementado | f: 1500–2000 MHz, hb: 30–200 m, hm: 1–10 m, d: 1–20 km |
| ECC-33 | ✅ Implementado | f: 0–4000 MHz, hb: 20–200 m, hr: 5–10 m, d: 0–10 km |
| Ikegami | ✅ Implementado | f, d > 0; requiere geometría de calle (ver abajo). Signos marcados `[OCR-verificar]` por la fuente del curso |
| Walfisch-Bertoni | ✅ Implementado | f: 300–3000 MHz, d: 0.2–5 km; requiere geometría de edificios (ver abajo) |

Fuera de su rango válido, un modelo **no bloquea el cálculo**: muestra el resultado junto con una advertencia de que es una extrapolación. Un valor físicamente imposible (frecuencia, distancia o altura ≤ 0) sí bloquea el cálculo, porque las fórmulas dependen de `log10` y ese caso produciría un resultado sin sentido (`-Infinity`).

Todas las constantes y rangos de los modelos implementados están tomados de [`docs/curso-referencia.md`](docs/curso-referencia.md) (base de conocimiento del curso, mantenida por el estudiante y actualizada semanalmente) — no de fuentes genéricas de internet. Donde una constante del curso difiere de la fuente genérica usada originalmente (Hata, ECC-33), el comentario del archivo correspondiente documenta ambos valores y por qué se usa el del curso.

**Ikegami y Walfisch-Bertoni** necesitan parámetros geométricos que los otros cuatro modelos no usan (ancho de calle, altura de edificio, orientación...), agregados como campos **opcionales** en `PropagationInputs` -- ver `src/models/propagation/types.ts`. La UI solo muestra esos campos cuando el modelo correspondiente está seleccionado. Dos advertencias explícitas de estos dos modelos, documentadas en el comentario de cada archivo:

- **Ikegami** (`ikegami.ts`): la fuente del curso marca los signos de esta sección como `[OCR-verificar]` -- no fueron re-derivados de forma independiente.
- **Walfisch-Bertoni** (`walfischBertoni.ts`): el parámetro `H` ("altura antena Tx sobre edificios próximos") se interpretó como altura *sobre* el nivel de los tejados, no absoluta -- una lectura de una redacción ambigua del curso, no un dato confirmado sin ambigüedad.

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
App.tsx                          # punto de entrada; renderiza CalculatorScreen
src/
  models/propagation/
    types.ts                     # PropagationInputs/Result/Warning, contrato PropagationModelDefinition
    freeSpace.ts                 # modelo de espacio libre (Friis)
    hata.ts                      # Okumura-Hata (urbano/suburbano/rural)
    cost231Hata.ts               # COST-231 Hata
    ecc33.ts                     # ECC-33
    ikegami.ts                   # Ikegami (requiere geometría de calle)
    walfischBertoni.ts           # Walfisch-Bertoni (requiere geometría de edificios)
    index.ts                     # registro: PROPAGATION_MODELS / PROPAGATION_MODEL_LIST
  utils/
    validation.ts                # assertPositive (validación dura), rangeWarningMessage (validación blanda), parseDecimal
    format.ts                    # formatPathLoss
  components/
    NumericField.tsx             # campo numérico controlado
    ModelSelector.tsx            # selector de modelo (chips)
    ResultPanel.tsx              # resultado + advertencias + errores
  screens/
    CalculatorScreen.tsx         # estado del formulario, orquesta modelo + componentes
```

## Cómo agregar un nuevo modelo de propagación

1. Crear `src/models/propagation/miModelo.ts` que exporte una función `calculate(inputs: PropagationInputs): PropagationResult` y un objeto `PropagationModelDefinition` (ver `freeSpace.ts` como plantilla mínima o `hata.ts` para uno con validación de rango y corrección por entorno).
2. Usar `assertPositive` para cualquier valor que entre a un `log10`, y `rangeWarningMessage` para el rango empírico del modelo.
3. Registrar el modelo en `src/models/propagation/index.ts` (`PROPAGATION_MODELS` y `PROPAGATION_MODEL_LIST`).
4. Si el modelo necesita un parámetro que `PropagationInputs` no tiene todavía, extenderlo ahí — es el único lugar que el formulario y los modelos comparten.

No hace falta tocar `CalculatorScreen.tsx` ni los componentes de UI: leen el registro dinámicamente.

## Trabajo futuro

- Añadir tests unitarios por modelo, con valores de referencia resueltos a mano o en clase -- **no** buscados en fuentes genéricas de internet (ver `docs/curso-referencia.md` §5.2 para el ejercicio pendiente de resolver que serviría de caso de prueba para Hata/COST-231/Ikegami).
- Selección automática de modelo según los parámetros de entrada (en vez del selector manual actual) y una vista comparativa con gráficas de pérdida vs. distancia -- es el enunciado oficial de la tarea (`docs/curso-referencia.md` §12.2), no una idea aparte.

## Licencia

Ver [LICENSE](LICENSE).
