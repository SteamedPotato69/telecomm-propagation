# telecomm-propagation

Calculadora de modelos de pérdida de propagación en canales móviles (espacio libre, Hata, COST-231, ECC-33, Ikegami, Walfisch-Bertoni) desarrollada en Expo/React Native. Proyecto del curso de énfasis 2 Análisis de redes móviles — Universidad del Cauca.

## Estado de los modelos

| Modelo | Estado | Rango válido |
|---|---|---|
| Espacio libre (Friis) | ✅ Implementado | Cualquier `d, f > 0` |
| Okumura-Hata | ✅ Implementado | f: 150–1500 MHz, hb: 30–200 m, hm: 1–10 m, d: 1–20 km |
| COST-231 Hata | ✅ Implementado | f: 1500–2000 MHz, hb: 30–200 m, hm: 1–10 m, d: 1–20 km |
| ECC-33 | ✅ Implementado | Rango práctico reportado en literatura hasta ~3.5 GHz (no normativo) |
| Ikegami | ⏳ Pendiente | Requiere confirmar fórmula exacta contra el material del curso |
| Walfisch-Bertoni | ⏳ Pendiente | Requiere confirmar fórmula exacta contra el material del curso |

Fuera de su rango válido, un modelo **no bloquea el cálculo**: muestra el resultado junto con una advertencia de que es una extrapolación. Un valor físicamente imposible (frecuencia, distancia o altura ≤ 0) sí bloquea el cálculo, porque las fórmulas dependen de `log10` y ese caso produciría un resultado sin sentido (`-Infinity`).

Ikegami y Walfisch-Bertoni aparecen en el selector marcados como "(próximamente)" y no son seleccionables: sus módulos existen (`src/models/propagation/ikegami.ts`, `walfischBertoni.ts`) pero lanzan un error explícito en vez de usar constantes sin verificar. Ver el comentario en cada archivo para el detalle.

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
    ikegami.ts                   # pendiente (stub documentado)
    walfischBertoni.ts           # pendiente (stub documentado)
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

- Confirmar las fórmulas exactas de Ikegami y Walfisch-Bertoni contra el material del curso e implementarlas.
- Añadir tests unitarios por modelo (valores de referencia conocidos de la literatura).
- Considerar exportar/comparar resultados de varios modelos a la vez.

## Licencia

Ver [LICENSE](LICENSE).
