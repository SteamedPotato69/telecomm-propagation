# telecomm-propagation

[Español](README.md) · **English** · [Português](README.pt.md)

Calculator for propagation path-loss models in mobile channels (free space, Hata, COST-231, ECC-33, Ikegami, Walfisch-Bertoni, COST-231 Walfish-Ikegami), built with Expo/React Native. Project for the Emphasis Course 2 *Mobile Network Analysis* — Universidad del Cauca.

> This is a translation of the [Spanish README](README.md), which is the reference version. Source comments, `docs/curso-referencia.md` (the course knowledge base) and the course material itself are in Spanish.

## App navigation

`Home` → `Environment` → `Calculator` → `Comparison`, and separately `Home` → `Fading simulator`, `Home` → `Cellular planning` and `Home` → `Settings` (see `src/screens/RootNavigator.tsx`):

1. **Home**: three enabled cards -- "Empirical propagation models" (path loss), "Fading simulator" (flat/selective and slow/fast) and "Cellular planning" -- and a ⚙ button at the top right that opens **Settings** (theme and language).
2. **Environment**: pick a category from the environment taxonomy (`src/models/propagation/environments.ts`) -- it determines which models apply.
3. **Calculator**: the model selector only shows the models applicable to the chosen environment; geometry fields (street width, building height, etc.) only appear when the selected model needs them.
4. **Comparison**: runs every applicable model of the environment with the same parameters and compares them against free-space loss (the "ideal prediction"); the one with the smallest distance is marked as best fit. Below the cards, two charts (`src/components/LineChart.tsx`, on `react-native-svg`) of loss vs. distance -- logarithmic and linear scale, all curves overlaid, sampled over 0.3-20 km with the other parameters fixed.
5. **Fading simulator** (`src/screens/FadingScreen.tsx`): from carrier frequency, delay spread (D, with Rural/Suburban/Urban preset chips), mobile speed, signal bandwidth and symbol duration (or symbol rate, convertible to Ts), it computes the coherence bandwidth (Bc), the Doppler shift (fd) and the coherence time (Tc); classifies the channel as flat/selective in frequency and slow/fast (time-selective), and places the operating point in one of the 5 zones of the BT/Bc vs. Ts/Tc plane (`src/components/FadingZoneChart.tsx`, a point plot on `react-native-svg`, not a line series -- different from `LineChart.tsx`).

## Settings: theme and language

The ⚙ button on Home opens the Settings screen (`src/screens/SettingsScreen.tsx`), which groups the user's two preferences.

### Light/dark theme

A 3-position switch (`🌙 Dark` / `Auto` / `☀ Light`) to pick the mode directly, without cycling. "Auto" follows the operating system/browser preference (`useColorScheme`); a manual choice is saved with `@react-native-async-storage/async-storage` and remembered between sessions.

The color tokens are in [`src/theme/palette.ts`](src/theme/palette.ts), consumed through the `useTheme()` hook from [`src/theme/ThemeContext.tsx`](src/theme/ThemeContext.tsx). The **neon lilac (`#c084fc`) is identical in both palettes on purpose** -- it is the app's brand color (the glow of the Home card, the border of the winning model in Comparison) and must not change with the theme. What does change per theme is `accentText` (legible text in the same family of purples: dark on a light background, light on a dark background) -- using the pure lilac as a text color would fail contrast in light mode.

### Language (Español / English / Português)

A list of options: `Automatic (device language)`, `Español`, `English`, `Português` -- each language is always shown in its own name, so someone who landed in the wrong language can still find theirs. "Automatic" takes the first supported language among the device's preferences (`expo-localization`) and, if there is none, Spanish. The choice is saved with AsyncStorage (same technique as the theme) and applied instantly, without restarting; on web, `<html lang>` is also updated.

**How it is built** (`src/i18n/`):

- `i18next` + `react-i18next`. Spanish (`src/i18n/locales/es/`) is the source of truth; `en/` and `pt/` are typed against its shape (`DeepStrings<typeof es>`), so **a missing or extra key in any language breaks `npx tsc --noEmit`**. Calls to `t('key')` are also checked against Spanish.
- **The calculation models remain pure** (`src/models/**` and `src/utils/**` import neither React nor i18n; vitest runs them under Node). Instead of throwing or returning Spanish text, they produce a language-neutral message -- a key plus parameters (`LocalizedError` / `LocalizedMessage`, in `src/utils/localizedMessage.ts`) -- and the UI translates it with `translateMessage` / `translateError` (`src/i18n/translateMessage.ts`). The same applies to model names, environments, fading zones and WCDMA services: the models only expose an `id`, and the text lives in the language files.
- Technical names, symbols and units (Bc, fd, Eb/No, MAPL, km², dBm...) are not translated. `docs/curso-referencia.md` (the course knowledge base) is kept in Spanish.
- **Permissive decimal input**: numeric fields accept a comma or a period regardless of the selected language (`parseDecimal`). Results are always displayed with a decimal point.
- There are tests (`src/i18n/i18n.test.ts`) that `en`/`pt` keep the same `{{placeholders}}` as `es` in every text -- the one thing the type check cannot see -- and that `translateMessage` correctly resolves errors, warnings and plurals.

> **Note on Portuguese:** the Portuguese translation has not been reviewed by a native speaker -- the telecommunications terminology (e.g. *ERB* for base station, *link budget*, *desvanecimento*) should be validated before it is handed in as course material.

## Model status

| Model | Status | Valid range |
|---|---|---|
| Free space (Friis) | ✅ Implemented | Any `d, f > 0` |
| Okumura-Hata | ✅ Implemented | f: 150–1500 MHz, hb: 30–200 m, hm: 1–10 m, d: 1–20 km |
| COST-231 Hata | ✅ Implemented | f: 1500–2000 MHz, hb: 30–200 m, hm: 1–10 m, d: 1–20 km |
| ECC-33 | ✅ Implemented | f: 0–4000 MHz, hb: 20–200 m, hr: 5–10 m, d: 0–10 km |
| Ikegami | ✅ Implemented | f, d > 0; requires street geometry (see below). Signs marked `[OCR-verificar]` by the course source |
| Walfisch-Bertoni | ✅ Implemented | f: 300–3000 MHz, d: 0.2–5 km; requires building geometry (see below) |
| COST-231 Walfish-Ikegami | ✅ Implemented | No documented numeric range; requires street and building geometry |

**Out of scope, explicitly decided:** Ericsson 9999 and Lee -- both had constants in `docs/curso-referencia.md` that did not match several independent sources when checked (see the project's conversation log), and they were excluded instead of being implemented with unresolved doubts. **3GPP TR 38.901** is in the environment taxonomy but not implemented yet -- it is a much larger model (6 scenarios, LOS/NLOS, units different from the rest of the app) and was deliberately left for another work session.

Outside its valid range, a model **does not block the calculation**: it shows the result together with a warning that it is an extrapolation. A physically impossible value (frequency, distance or height ≤ 0) does block the calculation, because the formulas depend on `log10` and that case would produce a meaningless result (`-Infinity`).

All the constants and ranges of the implemented models are taken from [`docs/curso-referencia.md`](docs/curso-referencia.md) (the course knowledge base, maintained by the student and updated weekly) — not from generic internet sources. Where a course constant differs from the generic source originally used (Hata, ECC-33), the comment in the corresponding file documents both values and why the course value is used.

**Ikegami and Walfisch-Bertoni** need geometric parameters that the other four models do not use (street width, building height, orientation...), added as **optional** fields in `PropagationInputs` -- see `src/models/propagation/types.ts`. The UI only shows those fields when the corresponding model is selected. Two explicit warnings about these two models, documented in each file's comment:

- **Ikegami** (`ikegami.ts`): the course source marks this section's signs as `[OCR-verificar]` -- they were not independently re-derived.
- **Walfisch-Bertoni** (`walfischBertoni.ts`): the parameter `H` ("Tx antenna height over nearby buildings") was interpreted as height *above* the rooftop level, not absolute -- a reading of ambiguous course wording, not a confirmed unambiguous datum.

## Fading simulator

Second feature of the app (`src/screens/FadingScreen.tsx`, models in `src/models/fading/`), independent of the path-loss calculator above. It implements `docs/curso-referencia.md` §8 ("Multipath channels -- wideband characterization"):

- **Bc ≈ 1/(2π·D)** -- coherence bandwidth, from the delay spread D (§8.3). Rural/Suburban/Urban presets taken from the §8.6 table.
- **fd = f0·(v/c)** -- Doppler shift (§8.4).
- **Tc ≈ 9/(16π·fd)** -- coherence time (§8.4). A stationary mobile (v = 0) gives Tc = +∞, shown as such, not as an error.
- Classification as **flat/selective in frequency** (`BT` vs `Bc`) and **slow/fast** (`Ts` vs `Tc`), and placement in one of the **5 zones** of §8.7 in `src/components/FadingZoneChart.tsx` (point plot on the `BT/Bc` vs `Ts/Tc` plane, log scale, not a line chart).

Numerically verified against the course's 3 worked examples (§8.8): D=2µs/f=900MHz/v=36km/h gives Bc≈80kHz and Tc≈6ms; with BT=25kHz and Ts=50µs it falls in zone 2 (flat); with BT=200kHz and Ts=3.7µs (GSM) it falls in zone 4 (frequency-selective).

**Zone 1 ("hatched zone"), explicit warning:** the course names this zone in §8.7 ("transmission is not possible") but its exact inequality lives in a diagram that did not survive the PDF text extraction -- **`[interpretación no verificada]`** (unverified interpretation), like the `[OCR-verificar]` marks in `ikegami.ts`. The implementation (`src/models/fading/fading.ts`, function `classifyZone`) marks it as `BT·Ts < 1` (insufficient bandwidth for the requested symbol rate, Nyquist criterion) **restricted to the flat/flat quadrant** (`BT < Bc` and `Ts < Tc`). That restriction is not cosmetic: a first version applied `BT·Ts < 1` without restricting it and misclassified the course's own GSM example (BT·Ts = 0.74 < 1, but the course says zone 4) -- an occupied bandwidth smaller than the symbol rate is normal in spectrally efficient modulations (GMSK included), not evidence that transmission is impossible.

## Upcoming features: cellular planning and dimensioning (proposals)

Inspired by a second course PDF, `Planificación de redes de comunicaciones móviles e inalámbricas.pdf` (April 24, 2026, see [`docs/curso-referencia.md`](docs/curso-referencia.md) §13) -- different from the one that already backs the propagation calculator and the fading simulator above. In development on the `feature/cellular-planning` branch: the 6 approved features (1, 2, 3, 4a, 5, 6) are already implemented and verified (see the per-row status below); 4b, 7, 8 and 9 remain `[PENDIENTE]` for the reasons already explained in each row.

**Status convention:** ✅ **Approved** = complete, unambiguous theory, verified against at least one numeric example from the course -- ready to implement directly. 🚀 **Implemented** = already in the app (`feature/cellular-planning` branch), verified with tests (`vitest`, see [Type checking](#type-checking)) and in the browser. 🕒 **[PENDIENTE]** (pending) = information is missing (ambiguous formula, no numeric verification, or not confirmed in the official material) -- do not implement the calculation yet; it must appear in the UI as a future feature (see the UI note at the end of this section), never as a numeric result without a warning.

| # | Feature | Status | Why |
|---|---|---|---|
| 1 | Cell geometry and frequency reuse | 🚀 Implemented | `src/models/geometry/`. Verified against N=7 → D=√21·R (§13.1, slide 23) |
| 2 | Erlang B -- capacity dimensioning | 🚀 Implemented | `src/models/traffic/erlangB.ts`. Verified against the course's 3 exercises (§13.2) -- 2 of the 3 reference figures are ~3-4% off the exact continuous inversion, documented in the tests as course rounding, not an error |
| 3 | Traffic density ↔ geometry bridge (`p = B(ρ·Sc, K)`) | 🚀 Implemented | `src/models/traffic/density.ts`. Verified against ρ=30.77/500=0.0615 Erlang/km² (§13.2-13.3, slides 31-32) |
| 4a | Link budget with MAPL → R inversion, for Hata / COST-231-Hata | 🚀 Implemented | `src/models/propagation/{hata,cost231Hata,linkBudget}.ts`. Confirmed against the original PDF that both examples (1G and 2G) use Okumura-Hata, not COST-231-Hata -- the distance inversion is exact (§13.3, slides 45-46); the MAPL formula from the link budget reproduces the 2G example exactly but the 1G one comes out 2dB higher with no explanation in the material, documented as an open discrepancy |
| 4b | Link budget with MAPL → R inversion, for Ikegami / Walfisch-Bertoni / COST-231 Walfish-Ikegami | 🕒 [PENDIENTE] | They inherit the ambiguities already marked `[OCR-verificar]` in `ikegami.ts` / `walfischBertoni.ts`; it remains to confirm that the inversion has a closed form |
| 5 | Full 1G/2G dimensioning flow (capacity vs. coverage, take the maximum) | 🚀 Implemented | `src/models/dimensioning/`. The capacity side matches both exercises exactly (6 and 5 cells); the coverage side differs from the course (2 vs 3, 7 vs 8) as a direct consequence of the 4a MAPL finding, not a new error -- the qualitative conclusion (1G capacity-limited, 2G coverage-limited) does match in both cases |
| 6 | UMTS uplink load + iterative *cell breathing* loop | 🚀 Implemented | `src/models/wcdma/`. Gp/sensitivity/MAPL exact for the 3 services; ρ exact for PS64k/PS384k, not for voice (0.0148 computed vs. 0.0210 stated -- not reproducible from the given data); the formula connecting users/cell to output load in the course's iteration table is not documented -- implemented with the standard load equation (damped for numerical stability), which converges to a physically sensible point but not identical to the slide's R=1.07km/η=54% |
| 7 | UMTS downlink load (η_DL) | 🕒 [PENDIENTE] | Variable `β` not defined in the extracted material; no verification exercise (§13.4-13.5) |
| 8 | Erlang C (queueing model) | 🕒 [PENDIENTE] | Does not appear in the course material; applicability to radio channels (a loss system, not a queueing one) unconfirmed |
| 9 | Engset / extended Erlang B (with retries) | 🕒 [PENDIENTE] | Only in the industry summary (`erlang.com`), not in official course material |

### 1. Cell geometry and frequency reuse -- ✅ Approved

**What it solves:** given a cell radius R (or the other way around), computes the lattice step d, the reuse distance D, validates the cluster size N against the list of allowed rhombic numbers, the co-channel rhombus area, the number of clusters Q needed to cover a total area, and the area per sector if sectorized.

**Formulas:** see [`docs/curso-referencia.md`](docs/curso-referencia.md) §13.1.

**Proposed fit:** new module `src/models/geometry/` (same pattern as `models/fading/`: `types.ts`, `geometry.ts`, `index.ts`) + screen `GeometryScreen.tsx`, a new entry in `RootNavigator.tsx` and a third card in `HomeScreen.tsx`.

**Validation:** `assertPositive` for R; N must belong to the set of valid rhombic numbers (reject with a clear message if not, not just warn).

**Reference check:** N=7 → D=√21·R (slide 23).

### 2. Erlang B -- capacity dimensioning -- ✅ Approved

**What it solves:** the Erlang B recursion (blocking given K channels and traffic A) and its inverse (`A = B⁻¹(K,GoS)`, supportable traffic given K channels and a target GoS; and `K = B⁻¹(A,GoS)` rounded up, required channels given traffic and GoS).

**Formulas:** see [`docs/curso-referencia.md`](docs/curso-referencia.md) §13.2. Use the recursive form, not the factorial one (it overflows numerically).

**Proposed fit:** `src/models/traffic/erlangB.ts` (+ `types.ts`, `index.ts`) + screen `TrafficScreen.tsx` with a "what to solve for" selector (blocking / channels / traffic), similar to the preset chips of the fading simulator.

**Validation:** `assertPositive` for A and K; GoS must be in (0,1); K must be an integer (round up in the inverse).

**Reference check:** `B⁻¹(59, 0.02) = 47 Erlang/cell` (slide 45); `B⁻¹(70, 0.02) = 57 Erlang/cell` (slide 46); `B⁻¹(42, 0.01) = 30.77 Erlang/cell` (slide 31).

### 3. Traffic density ↔ geometry bridge -- ✅ Approved

**What it solves:** `p = B(ρ·Sc, K)` -- given the traffic density ρ (Erlang/km², normally derived from a user density and traffic/user) and the cell area Sc (from feature 1), computes the blocking with K channels; or, conversely, the maximum supportable density for a target GoS.

**Proposed fit:** it needs no module of its own -- it is a combination of features 1 and 2; it can live as a `DensityScreen.tsx` screen that imports `models/geometry` and `models/traffic/erlangB`, or as an additional mode inside `TrafficScreen.tsx`.

**Reference check:** slide 28 (definition) and slides 31-32 (example with ρ=30.77/500=0.0615 Erlang/km²).

### 4a. Link budget with MAPL → R inversion (Hata / COST-231-Hata) -- ✅ Approved

**What it solves:** today `CalculatorScreen` only computes L(d) given d. This feature takes a full link budget (MS power, antenna gains, body loss, feeder loss, BTS sensitivity, shadowing margin, interference margin -- the same parameter table as slides 45-46) and computes the MAPL, then inverts Hata/COST-231-Hata (linear in log10(d)) to obtain R_max.

**Proposed fit:** add a function `solveDistanceKm(inputs, targetLossDb): number` to `hata.ts` and `cost231Hata.ts` (direct algebra: solve `log10(d)` from the equation already implemented in `calculate()`), a new `LinkBudgetInputs` type, and a screen `LinkBudgetScreen.tsx` with the parameter table and the R_max result.

**Validation:** reuse `assertPositive`; the resulting MAPL must be positive (EIRP power > sensitivity, otherwise a clear "no link margin" error).

**Reference check:** MAPL=141 dB → R=2.5 km (slide 45, urban Okumura-Hata); MAPL=133 dB → R=1.5 km (slide 46).

### 4b. Link budget with MAPL → R inversion (Ikegami / Walfisch-Bertoni / COST-231 WI) -- 🕒 [PENDIENTE]

**What is missing:** these three models already carry their own warnings (`[OCR-verificar]` in Ikegami, unconfirmed interpretation of `H` in Walfisch-Bertoni). Before inverting them it must be confirmed (a) that the base formula is correct, and (b) that it is invertible in closed form for R with the other geometric parameters fixed (it is not obvious for Walfisch-Bertoni, which mixes `log10(d)` with `log10(1 + d²/(17H))`).

**Treatment in the app meanwhile:** in `LinkBudgetScreen.tsx`, the model selector must **exclude** these three (or show them disabled with the label "Coming soon -- pending confirmation of invertibility"), just as each model's status is already documented in the "Model status" table above.

### 5. Full 1G/2G dimensioning flow -- ✅ Approved

**What it solves:** composes 1, 2 and 4a into the exact flow of the course exercises: total traffic → cells by capacity (via 2) → link budget → cells by coverage (via 4a) → result = maximum of both. It is, in essence, a calculator that solves the assignment on slide 75 of the PDF (due May 5) for 1G and 2G.

**Proposed fit:** screen `DimensioningScreen.tsx` that orchestrates the previous modules and presents the result like the table on slide 32 (radius, # cells, area, channels/cell, traffic/cell, density, # subscribers per stage).

**Reference check:** full table of slide 32 (4 stages of cell splitting) and the two exercises of slides 44-46.

### 6. UMTS uplink load + *cell breathing* -- ✅ Approved

**What it solves:** the equivalent of feature 5 for 3G/UMTS, where capacity and coverage are coupled through cell load instead of being independent. It implements Gp, ρ_i, η_UL and the iterative loop effective MAPL → R → users → η, until convergence.

**Proposed fit:** independent module `src/models/wcdma/` (math different from Erlang B -- continuous load, not discrete channels) + screen `WcdmaLoadScreen.tsx` that shows the iteration table as on slide 73 (one column per iteration: load, effective MAPL, R, area, users, ΔR) until convergence.

**Validation:** η must converge to below 1 (unstable load otherwise); iterate with a maximum iteration limit and report if it does not converge.

**Reference check:** full exercise of slides 71-74 (converges in 3 iterations to R=1.07 km, η=54%).

### 7. UMTS downlink load (η_DL) -- 🕒 [PENDIENTE]

**What is missing:** the variable `β` of the extracted formula is not defined in the material (§13.4-13.5), and no course exercise exercises it numerically. Implementing it now would mean guessing a literature convention (orthogonality factor) without being able to verify it against the course.

**Treatment in the app meanwhile:** `WcdmaLoadScreen.tsx` must show only the uplink result, with an explicit note "Downlink: pending confirmation of the definition of β against the course material -- not implemented."

### 8. Erlang C -- 🕒 [PENDIENTE]

**What is missing:** confirmation from the professor of whether the course covers it, and in what radio-channel dimensioning context a queueing model would apply (the radio channels in this course are all pure-loss, not waiting).

**Treatment in the app meanwhile:** do not include it as an option in `TrafficScreen.tsx`; if added later, it must go in a separate module (`erlangC.ts`) so as not to mix an unconfirmed model with Erlang B (which is confirmed).

### 9. Engset / extended Erlang B -- 🕒 [PENDIENTE]

**What is missing:** same as 8 -- they do not appear in any official material loaded so far, only in the `erlang.com` industry summary.

### UI note for [PENDIENTE] features

No feature marked 🕒 [PENDIENTE] must produce a numeric result in the app -- show it, if it is added to the UI before the gap is resolved, as a **disabled** card or model with the label "Coming soon", following the same criterion that the "Model status" table above already applies to an unimplemented model. This probably means extending `HomeScreen.tsx` from two hardcoded cards to a data-driven list of cards with a `status: 'enabled' | 'coming-soon'` field, instead of adding a nearly identical third JSX block for each new feature.

## Prerequisites

- **Node.js**: `^20.19.4 || ^22.13.0 || ^24.3.0 || >=25.0.0` (required by React Native 0.86; verified in `node_modules/react-native/package.json`).
- **npm** (bundled with Node). The project uses `package-lock.json`, not `yarn.lock` or `pnpm-lock.yaml`.
- To test on a physical phone: the **Expo Go** app ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)), on the same Wi-Fi network as the computer.
- To build natively (optional, not needed for development with Expo Go):
  - Android: Android Studio + SDK.
  - iOS: Xcode (macOS only).

## Installation

```bash
git clone https://github.com/SteamedPotato69/telecomm-propagation.git
cd telecomm-propagation
npm install
```

## Open and run in VS Code

1. **File → Open Folder…** and select the repo root (where `package.json` is). Do not open a subdirectory.
2. Open the integrated terminal: **Terminal → New Terminal** (or `` Ctrl+` ``).
3. Run the [Installation](#installation) and [Running](#running) commands from that terminal.

Optional extension: **Expo Tools** (publisher Expo) for snippets and `app.json` support. TypeScript/JSX support is already built into VS Code, with no extra configuration.

There is no `launch.json` configured for debugging with native VS Code breakpoints -- that needs separate configuration, not covered yet. To try the calculator, `npm run web` or Expo Go is enough.

## Running

```bash
# Expo development server (pick the platform from the interactive menu)
npm start

# Directly on a platform:
npm run web       # browser, http://localhost:8081
npm run android   # Android emulator or device with Expo Go
npm run ios       # iOS simulator (macOS only) or device with Expo Go
```

With `npm start` or `npm run android`/`ios`, Expo shows a QR code: scan it with the Expo Go app to open the project on a physical device.

## Package as a desktop app (Windows, simple option)

A lightweight launcher for Windows: it generates the static web build and serves it locally, opening the default browser automatically. It is not a packaged native app (that -- Electron/Tauri or an `.exe` with embedded Node -- remains a possible next step); this assumes the machine running it already has Node.js installed.

```bash
npm run build:web       # generates dist/ (static Expo build for web)
```

Then, to start it:

- By double-clicking [`desktop/iniciar-app.bat`](desktop/iniciar-app.bat) -- it generates the build if missing, starts the server and opens the browser by itself.
- Or manually: `npm run start:desktop` (equivalent to `node desktop/serve.js`).

Details of [`desktop/serve.js`](desktop/serve.js): static HTTP server with no external dependencies (only native Node modules), port `4173` by default (configurable with the `PORT` environment variable), with path-traversal protection and a *fallback* to `index.html` for routes without an extension. It opens the browser only after the server is already listening, to avoid a race between "open the browser" and "the server responds".

`dist/` is a build artifact (already in `.gitignore`) -- it is regenerated with `npm run build:web`, not versioned.

## EAS (Expo Application Services)

The project is already linked to an existing EAS project (see `app.json`):

- `projectId`: `d49ee7fe-6cb5-470f-9bae-664c6e548834`
- `owner`: `latriassona` (an organization on Expo, not a personal account)
- `slug`: `telecomm` -- different from the package name (`telecomm-propagation`); the slug that already existed in that EAS project was adopted instead of renaming it on the server side.

This is **not needed for local development** (`npm run web` / Expo Go do not require it). It only matters if you are going to build natively or publish OTA updates:

```bash
npm install --global eas-cli
eas login     # account with access to the "latriassona" organization
eas whoami    # check which account is active
```

If your account does not have access to "latriassona", `eas build`/`eas update` will fail with a permissions error -- you have to ask to be added to the organization first.

### Generate an APK to test on a device

```bash
eas build --platform android --profile preview
```

It runs in the cloud (needs neither Android Studio nor a local SDK); when finished, the terminal shows a download link for the `.apk`. Install it directly on the phone (outside Google Play, so Android will ask you to allow "install apps from unknown sources" the first time).

Do not use the `production` profile for this: it generates an `.aab`, meant for uploading to the Play Store, not directly installable.

## Type checking

```bash
npx tsc --noEmit
```

Besides the code, this checks that the three translations have exactly the same keys and that every `t('key')` in the UI exists.

## Tests

```bash
npx vitest run
```

Scope limited to `src/models/**` and to the translation *data* in `src/i18n/` (plus `translateMessage`): that code imports nothing from `react-native`/Expo, so it runs under Node without needing RN/jsdom mocks (the i18n test creates its own `i18next` instance instead of importing `src/i18n/index.ts`, which does need `expo-localization`). It covers the cellular-planning features (geometry, Erlang B, link budget) -- the original propagation and fading models are still only verified by eye in the browser (see [Future work](#future-work)).

## Project structure

```
App.tsx                          # entry point; renders RootNavigator
src/
  models/propagation/
    types.ts                     # PropagationInputs/Result/Warning, PropagationModelDefinition contract, GeometryFieldKey
    environments.ts              # ENVIRONMENT_CATEGORIES: environment taxonomy -> applicable models
    freeSpace.ts                 # free-space model (Friis)
    hata.ts                      # Okumura-Hata (urban/suburban/rural)
    cost231Hata.ts               # COST-231 Hata
    ecc33.ts                     # ECC-33
    ikegami.ts                   # Ikegami (requires street geometry)
    walfischBertoni.ts           # Walfisch-Bertoni (requires building geometry)
    cost231WalfishIkegami.ts     # COST-231 Walfish-Ikegami (combines Ikegami + Walfisch-Bertoni)
    linkBudget.ts                # calculateMapl(): MAPL from a full link budget (§13.3)
    sampleSeries.ts               # evaluates a model over a range of distances, for the charts
    index.ts                     # registry: PROPAGATION_MODELS / PROPAGATION_MODEL_LIST
  models/fading/
    types.ts                     # FadingInputs/Result, FadingZone
    fading.ts                    # calculateFading(): Bc, fd, Tc, classification and the 5 zones (§8.7)
    environments.ts              # DELAY_SPREAD_PRESETS: Rural/Suburban/Urban presets (§8.6)
    index.ts                     # barrel
  models/geometry/                # cellular planning (§13.1) -- feature/cellular-planning branch
    types.ts                     # GeometryInputs/Result
    rhombicNumbers.ts            # example table + isValidRhombicNumber (N=i²+ij+j²)
    geometry.ts                  # calculateCellularGeometry(): hexagonal lattice, reuse, Q
    index.ts                     # barrel
  models/traffic/                 # cellular planning (§13.2-13.3) -- feature/cellular-planning branch
    erlangB.ts                   # erlangBBlocking / erlangBInverseTraffic / erlangBInverseChannels
    density.ts                   # traffic density <-> geometry bridge (p = B(ρ·Sc, K))
    index.ts                     # barrel
  models/dimensioning/             # cellular planning (§13.3) -- feature/cellular-planning branch
    types.ts                     # DimensioningInputs/Result
    dimensioning.ts               # calculateDimensioning(): orchestrates traffic + propagation, max(capacity, coverage)
    index.ts                     # barrel
  models/wcdma/                    # cellular planning (§13.4) -- feature/cellular-planning branch
    types.ts                     # ServiceMix/Load, WcdmaLoadInputs/Result, WcdmaIterationStep
    presets.ts                   # DEFAULT_SERVICE_MIX: the course exercise's mix (70% voice / 20% PS64k / 10% PS384k)
    wcdma.ts                      # calculateServiceLoad, calculateWcdmaUplinkLoad (damped cell-breathing loop)
    index.ts                     # barrel
  utils/
    validation.ts                # assertPositive, assertNonNegative, assertUnitInterval, assertInteger, rangeWarningMessage, parseDecimal, requireField
    localizedMessage.ts          # LocalizedError / LocalizedMessage: language-neutral errors and warnings (key + parameters)
    format.ts                    # formatPathLoss, formatCoherenceBandwidth, formatDopplerShift, formatCoherenceTime
  components/
    NumericField.tsx             # controlled numeric field (optional unit for dimensionless parameters)
    ModelSelector.tsx            # model selector (chips), generic over {id,label,disabled}
    ResultPanel.tsx              # result + warnings + errors
    LineChart.tsx                 # line chart on react-native-svg (linear or log axis)
    FadingResultPanel.tsx        # Bc/fd/Tc + flat-selective / slow-fast classification
    FadingZoneChart.tsx          # BT/Bc vs Ts/Tc point plot on react-native-svg (not LineChart)
    GlowCard.tsx                 # card with neon glow (top-level cards on Home)
    SegmentedControl.tsx         # switch for a few short options (theme mode)
    BackButton.tsx               # back button (arrow only, 48dp touch target)
    ListCard.tsx                 # simple list card (hub screens: Environment, Cellular planning)
    GeometryResultPanel.tsx      # cell geometry result
    TrafficResultPanel.tsx       # generic single-number result (Erlang B / density)
    LinkBudgetForm.tsx           # ~8-field link-budget block, shared between screens
    LinkBudgetResultPanel.tsx    # EIRP / MAPL / maximum cell radius
    DimensioningResultPanel.tsx  # per-stage table: capacity / coverage / final result
    WcdmaResultPanel.tsx          # load per service, simultaneous users, convergence trace
  screens/
    RootNavigator.tsx            # navigation state (Route union, one case per screen)
    HomeScreen.tsx                # top-level cards, data-driven + Settings button
    SettingsScreen.tsx            # settings: theme and language
    EnvironmentScreen.tsx         # environment selector
    CalculatorScreen.tsx          # form + result, filtered by environment
    ComparisonScreen.tsx          # "versus" view between all of the environment's models
    geometryFieldConfig.ts        # unit/default for each GeometryFieldKey (label and helper: i18n `geometryFields.*`)
    FadingScreen.tsx              # fading simulator: form + result + zone chart
    CellularHubScreen.tsx        # cellular-planning hub -- feature/cellular-planning branch
    GeometryScreen.tsx            # same
    TrafficScreen.tsx             # same (Blocking/Traffic/Channels/Density modes)
    LinkBudgetScreen.tsx          # same
    DimensioningScreen.tsx        # same (capacity + coverage, orchestrates 1, 2 and 4a)
    WcdmaLoadScreen.tsx           # same (UMTS uplink load + cell breathing)
  i18n/
    index.ts                     # initializes i18next (device language) and re-exports the module
    languages.ts                 # Language, native names, device-language detection
    LocaleContext.tsx            # LocaleProvider + useLocale(); AsyncStorage persistence, <html lang> on web
    translateMessage.ts          # translateMessage / translateError: LocalizedMessage -> text
    i18next.d.ts                 # types t('key') against Spanish
    locales/{es,en,pt}/          # per-language texts (core, propagation, calculator, fading, cellular); es is the source of truth
  theme/
    palette.ts                    # light/dark color tokens; accent (neon lilac) is constant in both
    ThemeContext.tsx               # ThemeProvider + useTheme(); AsyncStorage persistence
```

## How to add a new propagation model

1. Create `src/models/propagation/myModel.ts` exporting a function `calculate(inputs: PropagationInputs): PropagationResult` and a `PropagationModelDefinition` object (see `freeSpace.ts` as a minimal template or `hata.ts` for one with range validation and environment correction).
2. Use `assertPositive` for any value that goes into a `log10`, `rangeWarningMessage` for the model's empirical range, and `requireField` for any optional geometric parameter the model needs. These helpers (and any custom error, via `LocalizedError`) take translation **keys** (`fields.*`, `errors.*`), not text: the model writes in no language.
3. If the model needs a geometric parameter that `PropagationInputs` does not have yet, extend it there as an **optional** field, add it to `GeometryFieldKey`, and declare `extraFields` in the `PropagationModelDefinition` -- that is all it takes for `CalculatorScreen` to show the right field automatically, without touching the UI.
4. Register the model in `src/models/propagation/index.ts` (`PROPAGATION_MODELS` and `PROPAGATION_MODEL_LIST`).
5. Add the model to `applicableModelIds` of the category(ies) in `environments.ts` where it applies.
6. Add `models.<id>` (`label`, `shortLabel`, `citation`) in the three languages of `src/i18n/locales/` (and any new `fields.*` / `errors.*` keys it uses) -- `tsc` tells you if one is missing.

There is no need to touch the UI components directly: they read the registry and the taxonomy dynamically.

## Future work

- Extend `vitest` coverage (introduced for the cellular-planning models, see [Type checking](#type-checking)) to the original propagation and fading models -- today they only have a smoke test (`freeSpace.test.ts`), the rest is still verified only by eye in the browser. Use reference values solved by hand or in class -- **not** looked up in generic internet sources (see `docs/curso-referencia.md` §5.2 for the pending exercise that would serve as a test case).
- Implement 3GPP TR 38.901 (6 scenarios, LOS/NLOS, units in GHz/meters) -- deliberately out of this round due to its size.
- The comparison charts sample a fixed range of distances (0.3-20 km) independent of each model's documented validity range -- a curve can visually extend beyond where the model is validated, as the range warnings in the calculator already tolerate. It is worth visually marking that stretch if it becomes confusing in practice.
- Fading simulator: the exact inequality of the "hatched zone" (zone 1, §8.7) is not in the text extracted from the course -- see the `[interpretación no verificada]` warning in `src/models/fading/fading.ts`. If the student gets the original diagram, it is worth reviewing the implemented criterion (`BT·Ts < 1` restricted to the flat/flat quadrant) against the real inequality.

## License

See [LICENSE](LICENSE).
