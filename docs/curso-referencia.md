---
title: "Base de Conocimiento del Curso — Propagación en Canales Móviles (ENFA 2 MIRAMÁ)"
proposito: "Documento vivo de contexto para asistentes de IA (Claude u otros). Resume fielmente el material oficial subido por el estudiante, para que cualquier sesión futura entienda el curso sin tener que releer los PDFs desde cero. Se irá complementando a medida que el estudiante suba nuevo material."
ultima_actualizacion: "2026-09-27"
---

# Cómo usar este documento (leer primero)

Este archivo es una **base de conocimiento**, no un resumen para estudiar ni una solución de ejercicios. Su función es darle a cualquier IA (especialmente a Claude, dentro de este proyecto "ENFA 2 MIRAMÁ") el contexto suficiente para:

1. Saber qué ha visto el curso hasta ahora (temario, modelos, fórmulas, notación) y en qué orden.
2. Distinguir entre lo que es **material oficial del curso** (viene de las diapositivas del profesor) y lo que sería **conocimiento general de la industria** (que el asistente debe aportar solo como complemento, dejándolo explícito, según las instrucciones del proyecto).
3. Servir de referencia rápida de fórmulas, rangos de validez y notación para no repetir errores de unidades logarítmicas (dB, dBm, dBi) al auditar cálculos del estudiante.

**Regla para la IA que lea esto:** este documento resume las diapositivas; no reemplaza el criterio pedagógico exigido por las instrucciones del proyecto (método socrático, auditoría matemática, no dar el diseño hecho). Úsalo como memoria de contenido, no como plantilla de respuestas.

**Regla para quien lo actualice (el estudiante o una IA con su autorización):** cada vez que se suba material nuevo, añadir una sección nueva siguiendo el mismo formato (fuente, fecha, contenido, fórmulas, vacíos) en vez de reescribir lo existente, para conservar el historial de qué se ha cubierto y cuándo.

---

# 0. Metadatos del material fuente

| Campo | Valor |
|---|---|
| Archivo | `Propagación en Canales Móviles.pdf` |
| Autores / docentes | Víctor Fabián Miramá, Víctor Manuel Quintero |
| Institución | Facultad de Ingeniería Electrónica y Telecomunicaciones, Universidad del Cauca |
| Fecha en el pie de página de las diapositivas | 6/03/2026 |
| Extensión | 85 diapositivas |
| Asignatura (proyecto Cowork) | ENFA 2 MIRAMÁ |
| Tipo de contenido | Radiopropagación en canales móviles: modelos de predicción, caracterización de canal (banda estrecha y banda ancha) |

**Nota importante sobre fidelidad del texto:** el PDF es una presentación de diapositivas con abundantes gráficas, diagramas y capturas de pantalla (curvas de propagación, geometrías de difracción, patrones de Ikegami/Walfish, ejemplos de software Atoll/Volcano, etc.) que **no se pudieron extraer como texto** (son imágenes). Esas diapositivas quedan listadas en la sección 10 como vacíos de contenido — cualquier IA que use este documento debe saber que la descripción de esas figuras es incompleta y, si el estudiante pregunta por ellas, debe pedir que las describa o las suba como imagen aparte.

Algunas fórmulas fueron extraídas mediante OCR de imágenes/ecuaciones incrustadas (probablemente objetos de Office Math o imágenes). Cuando la extracción es ambigua (signos, subíndices que se perdieron), se marca explícitamente con **[OCR-verificar]**. No usar esas fórmulas para "dar la respuesta" a un ejercicio sin antes verificar contra el PDF original o contra la bibliografía (Rappaport, Goldsmith).

---

# 1. Temario oficial (tal como aparece en la diapositiva de contenido)

1. Características básicas de la propagación por canales móviles.
2. Principios de propagación.
3. Métodos empíricos de predicción de propagación.
4. Óptica geométrica y técnicas de trazado de rayos.
5. Herramientas software de análisis de cobertura de redes de comunicaciones móviles e inalámbricas.

**Estado de cobertura en este PDF:**
- Puntos 1, 2 y 3 están desarrollados en profundidad (son el grueso del documento).
- El punto 4 (óptica geométrica / ray tracing) aparece solo de forma tangencial, dentro de "Modelos Microcelulares" (técnica de trazado de rayos, Ray Tracing) y en los modelos de Ikegami/Walfish-Bertoni (que se basan en óptica geométrica), pero no hay una sección dedicada y desarrollada como tal en este archivo.
- El punto 5 (herramientas software) aparece solo como menciones puntuales: Atoll (Forsk) y "Volcano", sin desarrollo teórico.
- Además, el PDF incluye un bloque grande **no listado explícitamente en el temario de la diapositiva 2** pero que ocupa casi un tercio del documento (diapositivas 63–85): **"Canales Multitrayecto"**, con caracterización en banda ancha (dispersión de retardo, dispersión Doppler, ancho de banda de coherencia, tiempo de coherencia). Es contenido de fondo para entender por qué se necesitan los modelos de predicción, y probablemente es la base del siguiente tema del curso (modelado de canal / sistemas digitales).

---

# 2. Características básicas de la propagación por canales móviles

## 2.1 Contexto: evolución de las redes móviles
El material sitúa la necesidad de re-analizar la propagación en la evolución tecnológica:

- **1G (1980–1990):** Voz. AMPS.
- **2G (1990–2000):** Voz, SMS, Datos. GSM, GPRS.
- **3G (2000–2010):** Voz, SMS, Datos, web, videollamada. UMTS, CDMA2000, TD-SCDMA.
- **4G (2010–2020):** Voz, Datos, IoT. LTE, LTE Advanced.
- **5G (2020–):** Datos, mIoT (massive IoT). New Radio (NR).

Razón para actualizar el análisis: nuevas tecnologías, nuevas bandas de frecuencia, nueva caracterización del canal móvil.

## 2.2 Planificación de sistemas móviles (4 pasos)
1. Caracterización del canal móvil en **banda estrecha**.
2. Caracterización del canal móvil en **banda ancha**.
3. Desarrollo de modelos de simulación.
4. Realización de medidas radioeléctricas.

### Banda estrecha
Incluye: pérdidas de propagación, métodos de predicción, entornos reales (ecuaciones de Maxwell), modelos simplificados (óptica geométrica), expresiones empíricas/curvas de propagación, características dependientes del entorno.

Trade-off explícito en las diapositivas (triángulo): **Exactitud – Complejidad – Tiempo de cálculo.**

Pérdida básica de propagación descompuesta como:
```
Lb = Lbf + Lex + Lent
```
(pérdida en espacio libre + pérdida excedente por el entorno + pérdida de entrada/penetración — **[OCR-verificar]** los subíndices exactos de esta descomposición).

### Banda ancha
Incluye: pérdidas básicas de propagación, modelado de efectos multitrayecto, modelos de simulación.

### Modelos de simulación
- BER en función de (pérdida básica de propagación + características multitrayecto).
- Medidas de corrección: recepción por diversidad, codificación de canal.
- Modelo de canal como filtro variable en el tiempo (red de varias etapas / taps).
- Modelos hardware y software.

### Medidas radioeléctricas
Sirven para: validar modelos de predicción/simulación, detectar interferencias, resolver situaciones complejas, perfeccionar los métodos de predicción.

## 2.3 Variabilidad de la propagación

- Potencia transmitida fija → potencia recibida es **variable aleatoria**.
- Pérdida básica de propagación en función de la distancia, ley de potencias:
```
lb(d) = k·d^n
Lb(d) [dB] = L0 + 10·n·log10(d) ,   L0 = 10·log10(l0)
```
- `L0` y `n` se obtienen empíricamente. `n` = exponente de pérdida de trayecto (path-loss exponent), pendiente = `10n` dB/década.

**Tabla de exponentes n según entorno (tal como aparece en la diapositiva):**

| Entorno | Exponente n |
|---|---|
| Espacio libre | 2 |
| Urbano | 2.7–3.5 |
| Urbano con grandes edificios | 3–5 |
| Interior de edificios | 1.6–1.8 |
| Interior de edificios con sombras (obstrucciones) | 2–3 |
| Entorno suburbano | 2–3 |
| Zonas industriales | 2.2 |

### Desvanecimiento lento / por sombra (shadow fading)
Variabilidad de la atenuación debida al terreno y obstrucciones entre Tx y Rx. Se añade una componente aleatoria gaussiana:
```
lb(d) = l(d)·g(x,y)
Lb(d) [dB] = L(d) + G(x,y)
```
donde `G(x,y)` ~ N(0, σ²) (media cero, desviación típica σ en dB) — típicamente distribución **log-normal** de la potencia recibida.

### Multitrayectoria / desvanecimiento rápido (fast fading)
- Antena del móvil a baja altura (1.5–3 m).
- Múltiples trayectos indirectos generados por obstáculos naturales y artificiales cerca del receptor.
- Es el mecanismo básico de propagación en canales móviles.
- Variaciones muy rápidas del nivel recibido: desvanecimiento rápido.
- Factor `r(t,f)`, significativo en recorridos de **40λ**.
```
lb(d) = l(d)·g(x,y)·r(t,f)
Lb(d)[dB] = L(d) + G(x,y) + R(t,f)
```
- `r` es proporcional al cuadrado de una magnitud que sigue distribución de **Rayleigh** (equivalente a una exponencial negativa en potencia).

### Promedios
```
Media local:  L̄b(d)[dB]  = L(d) + G(x,y)
Media global: L̿b(d)[dB]  = L(d)
```

### Relación potencia transmitida–recibida
Con PIRE `Pt` y antena receptora isótropa:
```
Pr(d)[dB] = Pt − Lb(d)
Pr(d)[dB] = Pt − L(d) − G(x,y) − R(t,f)
```
Relación lineal: la ley de variación estadística de `Pr(d)` es igual a la de `Lb(d)`.

### Distribuciones combinadas
- Rayleigh + Log-normal combinadas → **distribución mixta Rayleigh-Lognormal** (conocida en la literatura como distribución de **Suzuki**, aunque la diapositiva no usa ese nombre).
- Si hay **visibilidad directa (LOS)** entre Tx y Rx: junto a las componentes de multitrayecto existe un rayo directo, no hay desvanecimiento lento, hay una componente intensa + componente difusa (ecos) → distribución **Nakagami-Rice** (Rician).

## 2.4 Propagación multitrayecto (profundización)
- Caídas de hasta **40 dB** respecto al nivel promedio.
- Distancia entre mínimos ≈ **λ/2** (desvanecimiento selectivo en espacio) → patrón de ondas estacionarias.
- El patrón espacial se convierte en patrón temporal cuando el móvil se desplaza.
- La multitrayectoria genera **ISI** (interferencia entre símbolos), que se traduce en BER.
- Soluciones mencionadas: **ecualización** y **receptores tipo Rake**.
- Mecanismo: en entornos rodeados de obstáculos, las componentes llegan al receptor en tiempos, amplitudes y fases distintos → variaciones amplias y rápidas de nivel a lo largo del recorrido del móvil.

## 2.5 Modelos clásicos enumerados (de menor a mayor complejidad)
1. Modelo de espacio libre (muy buena estimación en ese caso ideal).
2. LOS + reflexión en tierra — modelo de pérdidas de tierra plana.
3. Modelo de tierra plana + corrección por pérdidas de difracción (árboles).
4. Pérdidas de trayecto — modelo de difracción (obstáculo único).
5. Pérdidas de trayecto — modelo de difracción múltiple.

### Fórmula de pérdidas en espacio libre (confirmada en conversación con el estudiante, 2026-08-22)
La diapositiva de este ítem (n.º 19 aprox.) no trae la fórmula como texto extraíble (es una imagen) — sigue siendo un vacío de contenido del PDF en sí. Sin embargo, el estudiante confirmó directamente que en clase manejan la constante **32.44**, es decir, la variante de la pérdida de espacio libre con `d` en km y `f` en MHz:
```
Lfs[dB] = 32.44 + 20·log10(d[Km]) + 20·log10(f[MHz])
```
Es la misma relación física que la ecuación de Friis para el término de pérdida (antenas isotrópicas, Gt=Gr=0dBi): `Lfs = (4πd/λ)² = (4πd·f/c)²`. Es equivalente a la constante **92.45** que aparece explícita en el término `Afs` del método ECC-33 (sección 5.5) — la diferencia entre 92.45 y 32.44 es exactamente 60 dB, el factor de conversión GHz↔MHz (`20·log10(1000)=60`). Pendiente: verificar con el estudiante la derivación completa del 32.44 (conversión m→km y Hz→MHz) para dejar registrado el desglose paso a paso si hace falta corregir algo.

### Modelos de difracción mencionados (solo nombrados, con figura no extraíble)
- Difracción filo de cuchillo (**Knife-Edge**).
- **Bullington**: difracción filo de cuchillo múltiple (reduce varios obstáculos a uno equivalente).
- **Epstein–Peterson**.
- **Deygout**.

---

# 3. Principios de propagación

## 3.1 Importancia del estudio de la propagación
Para el diseño de sistemas de radiocomunicaciones se debe garantizar:
- Niveles de señal deseados.
- Relación S/N (o BER) requerida.
- Cobertura en tiempo y espacio.
- Servicio libre de interferencias, distorsiones o errores.

Y además, compatibilidad con otros usuarios: las bandas de frecuencia se comparten, hay que garantizar no interferencia entre sistemas.

## 3.2 Variabilidad del medio de propagación
El canal de radio es cambiante y no siempre predecible. Se requieren observaciones de 1 a 15 años para modelar y estimar variaciones, considerando:
- El clima (presión, vapor de agua, intensidad de lluvias, presencia/ausencia de nubes).
- La región (tropical, ecuatorial…).
- Las estaciones del año (determinan índice de refracción y atenuación).

## 3.3 Balance de enlace (link budget) — ejemplo introductorio
```
C/N = Pr/Nr = (Pt·Gt·Gr)/(Lb·Nr)
Pt [dBm] ≥ (C/N)req + Nr + Lb − Gt − Gr
```
**Ejemplo de receptor típico dado en la diapositiva:**
- CNR requerido = 18 dB
- Nr (nivel de ruido) = −120 dBm
- Antenas dipolo λ/2 = 1.5 dB (ganancia)
- f = 1 GHz, d = 1 km
- Resultado del ejemplo: `Pt > −13 dBm = 0.05 mW`

**Consideraciones "vida real"** (la diapositiva las presenta como choque con la idealidad del cálculo anterior):
- Deben incluirse pérdidas por penetración en edificios, obstáculos y difracción.
- `L = L0 + Pérdidas en edificios de ciudad (20–30 dB) + Pérdidas en interiores (20–30 dB)`.
- Esto implica un factor de 100 a 1000 en la potencia necesaria: de 0.05 mW se pasa a 5–50 mW, y en interiores (20 dB adicionales) a 0.5–5 W.

**Nota pedagógica para la IA:** este es exactamente el tipo de cálculo donde las instrucciones del proyecto piden auditar signos y conversión de unidades logarítmicas antes de aceptar el resultado del estudiante — la ecuación de balance de enlace mezcla dB y dBm y es un punto clásico de error de signo.

---

# 4. Evolución histórica de los modelos de predicción de pérdida básica

- **Clásicos:** curvas del CCIR (años 60), para áreas rurales y grandes zonas de cobertura sin reutilización de frecuencias. Ábacos y nomogramas de Bullington.
- **Modelos empíricos:** Okumura, Lee, Egli, Longley-Rice, Hata, COST 231 (Walfisch, Ikegami).
- **Modelos determinísticos.**
- **Modelos semideterminísticos:** Durkin.
- **Entornos microcelulares:** GTD (Teoría Geométrica de la Difracción). Modelos bidimensionales y tridimensionales.
- **Modelo de propagación de tierra plana:** válido para distancias cortas (d < 20 km).
- **Influencia del terreno:** refracción en la troposfera, representación de perfiles.
- **Zonas de sombra y visibilidad; difracción en obstáculos:** obstáculo aislado (agudo/redondeado), dos obstáculos aislados (EMP, Wilkerson, Epstein-Peterson), múltiples obstáculos.

---

# 5. Métodos empíricos de predicción de propagación (desarrollo detallado)

Contexto general: en radiocomunicaciones zonales (punto a multipunto) hay gran variabilidad de los trayectos; se usan análisis de perfiles/radiales; en terrenos irregulares o urbanos es difícil modelar obstáculos, de ahí el uso de métodos empíricos basados en campañas de mediciones. Ventaja: rapidez y sencillez. Desventaja: exactitud limitada — **error cuadrático medio típico entre 10 y 14 dB** respecto al valor medido.

## 5.1 Modelo ITU-R (Recomendación ITU-R 529)
Basado en el modelo de Bullington. Predice la intensidad de campo `E` en función de la rugosidad del terreno, frecuencia de operación y altura de antenas. Limitación: muy restringido en rango de frecuencias.

## 5.2 Método de Lee
- Basado en el modelo de tierra plana + mediciones experimentales en EE. UU.
- Gráficas de nivel de potencia (dBm).
- Entornos suburbanos y urbanos (tres ciudades típicas).
- Frecuencia de referencia: 850 MHz (parámetros de referencia usan 900 MHz, ver abajo).
- Actualmente reemplazado por modelos para frecuencias mayores.

**Parámetros de referencia:**

| Parámetro | Valor de referencia |
|---|---|
| Altura antena transmisora ht | 100 pies (30.5 m) |
| Altura antena receptora hr | 10 pies (3 m) |
| Potencia de transmisión Pt | 10 W (40 dBm) |
| Ganancia antena transmisión Gtd | 4 (6 dBd) |
| Ganancia antena recepción Grd | 1 (0 dBd) |
| Frecuencia f | 900 MHz |

**Factores de corrección** para condiciones distintas a las de referencia:
```
α1 = (ht/30.5)^2
α2 = (hr/3)^n     con  n=2 si hr>10m ;  n=1 si hr<3m
α3 = pt/10
α4 = gtd/4
α5 = grd/1
α0 = α1·α2·α3·α4·α5   (factor global de corrección)
```

**Fórmulas de potencia recibida por entorno** [OCR-verificar signos/constantes contra el original o Rappaport]:

- Zona suburbana:
  `Pr(dBm) = −53.9 − 38.4·log(d[Km]) − n·log(f/900) + 10·log(α0)`
- Zona urbana (Filadelfia):
  `Pr(dBm) = −62.5 − 36.8·log(d[Km]) − n·log(f/900) + 10·log(α0)`
- Zona urbana (Newark):
  `Pr(dBm) = −55.2 − 43.1·log(d[Km]) − n·log(f/900) + 10·log(α0)`
- Zona urbana (Tokio):
  `Pr(dBm) = −77.8 − 30.5·log(d[Km]) − n·log(f/900) + 10·log(α0)`

**Exponente n del término de frecuencia** (depende de entorno y frecuencia):
- n = 2 para f < 450 MHz y zona suburbana.
- n = 3 para f > 450 MHz y zona urbana.

### Ejercicio propuesto en el material — **actualizado el 2026-08-28, reemplaza la versión anterior**
El PDF fue re-subido por el estudiante con una versión ampliada de este ejercicio (ver sección 12 para el detalle de qué cambió entre versiones del PDF). Enunciado vigente:

> Determine las pérdidas de propagación **y la potencia de recepción** para el sistema con las siguientes características:
> - Frecuencia: **900 MHz y 2000 MHz**
> - Potencia de transmisor: **25 W**
> - Ganancia de antena transmisora: **10 dB**
> - Ganancia de antena receptora: **3 dB**
> - Altura antena base: 40 m
> - Altura antena móvil: 1.8 m
> - Distancia: 2.5 km y 5 km
> - Entorno: Urbano
> - Orientación calle respecto línea base: φ = 30°
> - Altura media edificios: 12 m
> - Espaciado edificios: 50 m
> - Ancho calle: w = 20 m
> - **lr = 3.2** (parámetro de reflexión de fachada del método de Ikegami — sección 5.6)

Sigue sin estar resuelto en el material — sigue siendo tarea del estudiante.

**Lectura de por qué está diseñado así (no es arbitrario):** al pedir **dos frecuencias (900 y 2000 MHz)** te está obligando a auditar el rango de validez de cada modelo antes de aplicarlo — la fórmula original de Hata solo es válida hasta 1500 MHz (sección 5.3), COST231-Hata cubre 1500–2000 MHz (sección 5.4). A 900 MHz tienes dos opciones válidas (Hata u Okumura-Hata clásico); a 2000 MHz **Hata clásico ya no aplica** y tienes que usar COST231-Hata. Además, los datos de calle/edificios (φ, hR, b, w, y ahora `lr`) indican que también se debe resolver con **Ikegami** (sección 5.6), que sí requiere esos parámetros explícitamente. Es, en el fondo, un ejercicio de **selección correcta de modelo según rango de validez** — exactamente lo que tu app (sección 12) debe automatizar.

## 5.3 Método de Okumura-Hata

- Origen: medidas de campo de Okumura en Tokio; curvas estándar de propagación (medios urbanos, distintas alturas efectivas de antena en BS, bandas 150/450/900 MHz, pra=1kW, altura de antena receptora 1.5 m).
- Correcciones consideradas por Okumura: ondulación del terreno (Δh), pendiente/heterogeneidad del terreno (trayectos mixtos tierra-mar), obstáculos significativos, altura de antena receptora, potencia radiada aparente, orientación de calles y densidad de edificios.
- Hata convirtió las curvas de Okumura en **expresiones numéricas** (pérdida básica `Lb` para entornos urbano, suburbano y rural).

**Fórmula de Hata (referencia, entorno urbano):**
```
Lb = 69.55 + 26.26·log(f) − 13.82·log(ht) − a(hm) + [44.9 − 6.55·log(ht)]·log(d)
```
Rangos de validez:
- f: 150–1500 MHz
- ht (altura efectiva antena Tx): 30–200 m
- hm (altura antena Rx): 1–10 m
- d: 1–20 km

**Corrección a(hm)** (a(hm) = 0 para hm = 1.5 m; depende del tipo de ciudad):

Ciudad media-pequeña:
```
a(hm) = (1.1·log(f) − 0.7)·hm − (1.56·log(f) − 0.8)
```
(error crece con la frecuencia, ≈1 dB a 1500 MHz; mayor error entre 4–5 m de altura)

Ciudad grande:
```
a(hm) = 8.29·[log(1.54·hm)]² − 1.1     para f ≤ 200 MHz
a(hm) = 3.2·[log(11.75·hm)]² − 4.97    para f ≥ 400 MHz
```
(error máximo en frecuencias bajas y alturas >5 m, hasta ≈1 dB)

**Corrección para zona suburbana:**
```
Lbs = Lb − 2·[log(f/28)]² − 5.4
```
**Corrección para zona rural (abierta):**
```
Lbr = Lb − 4.78·[log(f)]² + 18.33·log(f) − 40.94
```

Limitaciones de Hata: no considera ondulación del terreno ni grado de urbanización; solo válida para f ≤ 1500 MHz. Para Europa, sistemas en 1800 MHz (DECT, DCS-1800) requieren extensión → **COST 231**.

## 5.4 COST 231-Hata (extensión de Hata a frecuencias más altas)
```
Lb = 46.3 + 33.9·log(f) − 13.82·log(ht) − a(hm) + [44.9 − 6.55·log(ht)]·log(d) + cm
```
- `cm` = 0 dB para ciudad tipo medio y áreas suburbanas con densidad de árboles moderada.
- `cm` = 3 dB para grandes centros metropolitanos.
- Rangos: 1500 ≤ f ≤ 2000 MHz; 30 ≤ ht ≤ 200 m; 1 ≤ hm ≤ 10 m; 1 ≤ d ≤ 20 km.

## 5.5 Método ECC-33
> **Confirmado por el estudiante (2026-08-29): ECC-33 sigue vigente en el curso**, pese a no aparecer en el texto extraído de la re-exportación de 172 páginas del PDF (ver sección 12.1). Se mantiene esta sección tal como está documentada desde la versión original de 85 diapositivas — es dato de clase confirmado, no una suposición. Si en algún momento aparece una versión del profesor con una fórmula distinta o constantes distintas a las de esta sección, esa nueva fuente tiene prioridad y hay que actualizar aquí.

Desarrollado por el Electronic Communication Committee (ECC); modificación de Okumura-Hata para frecuencias más altas (hasta 4 GHz) en ciudades europeas.
```
Lb = Afs + Abm − Gb − Gr        [nota: revisar signo de Gb/Gr — OCR-verificar]

Afs = 92.45 + 20·log(d) + 20·log(f)
Abm = 20.41 + 9.83·log(d) + 7.894·log(f) + 9.56·[log(f)]²
Gb  = log(hb/200)·[13.958 + 5.8·(log d)²]
Gr  = (42.57 + 13.7·log f)·(log(hr) − 0.6)     para ciudades medianas
Gr  = 0.759·hr − 1.862                          para ciudades grandes
```
Rangos: f ≤ 4 GHz; d ≤ 10 km; 20 ≤ hb ≤ 200 m; 5 ≤ hr ≤ 10 m.

## 5.6 Método de Ikegami
- Calcula la potencia media en zona urbana.
- Basado en **teoría de rayos y óptica geométrica** (aquí conecta con el punto 4 del temario oficial).
- Supone estructura ideal de ciudad, alturas uniformes de edificios; considera orientación de calles y altura de la estación móvil.
- Considera rayos principales y secundarios (multitrayecto): componentes dominantes con **una sola difracción y una sola reflexión**.
- Supuestos: el tejado que produce la difracción tiene línea de vista con Tx y Rx; se desprecia la reflexión en el suelo.
- Válido cuando la antena Tx está alta (solo influyen los edificios cercanos al receptor).

**Variables:**
- E1, E2: campos por onda difractada y reflejada respectivamente.
- H: altura del edificio donde ocurre la difracción.
- hr: altura de la antena receptora.
- W: ancho de la calle donde está el receptor.
- w: distancia del receptor al edificio donde se difracta.
- Φ: ángulo entre el rayo incidente y la dirección de la calle.
- d: distancia.
- lr: parámetro de reflexión en fachadas (típico: 2 en VHF, 3.2 en UHF).

**Forma logarítmica (E en dBu, H/hr/W en metros, f en MHz):**
```
E̅ = E̅0 + 5.8 + 10·log(1 + 3/lr²) + 10·log(W) − 20·log(H − hr) − 10·log(f) − 10·log(sen φ)
```
Con:
```
E0[dBu] = 77 + PRA[dBW] − 20·log(d[Km])
Lb[dB]  = PRA[dBm] − E[dBu] + 20·log(f[MHz]) + 79.4
```
Y la forma final combinada:
```
Lb[dB] = 26.25 + 30·log(f) + 20·log(d) − 10·log(1 + 3/lr²) − 10·log(W) + 20·log(H − hr) + 10·log(sen φ)
```
(**[OCR-verificar]**: las diapositivas 39–41 tienen la deducción completa; verificar signos exactos contra el original antes de usarla para calificar un ejercicio).

## 5.7 Método de Walfish-Bertoni
- A diferencia de Ikegami, considera la influencia del **conjunto de edificios** (no solo el más cercano).
- Supone áreas con distribución uniforme de edificios altos, bordes angulares, filas casi paralelas.
- Antena Tx no muy elevada (por encima de edificios próximos), edificios separados una distancia mucho menor a su altura.
- El móvil **no** tiene LOS con el transmisor.
- Analiza reflexión, dispersión y difracción.
- Rango de frecuencias: 300 MHz – 3 GHz. Separación BS–MS: 200 m – 5 km.
- Pérdidas totales = pérdidas de espacio libre + pérdidas por propagación sobre edificios + pérdidas por difracción final (última azotea).

**Parámetros:** H (altura antena Tx sobre edificios próximos), hR (altura media edificios), hm (altura antena móvil), b (separación entre edificios), d (distancia).

```
Lb[dB] = 57.1 + A + log(f) + 18·log(d) − 18·log(H) − 18·log(1 + d²/(17H))
```
(el último término considera la curvatura de la Tierra)

```
A[dB] = 5·log[(b/2)² + (hR − hm)²] − 9·log(b) + 20·log{ tan⁻¹[2(hR − hm)/b] }
```

Pérdida total (sumando pérdidas de espacio libre L0):
```
L[dB] = Lb + L0 = 89.55 + A + 21·log(f) + 38·log(d) − 18·log(H) − 18·log(1 + d²/(17H))
```

## 5.8 Modelo COST-231 (Walfish-Ikegami combinado)
Combina los modelos de Walfish y de Ikegami. Aplicable a:
- Celdas grandes y pequeñas (antenas BS por encima de los tejados; geometría tipo Walfish-Bertoni + ancho de calle W y ángulo Φ de Ikegami).
- Microceldas (antenas BS por debajo de los tejados; efecto guía de onda).

```
Lb = L0 + Lrts + Lmsd
```
- `L0`: pérdidas de espacio libre.
- `Lrts`: pérdidas por difracción y dispersión del tejado a la calle:
```
Lrts = −16.9 − 10·log(W) + 10·log(f) + 20·log(ΔhR) + Lori
ΔhR = hR − hm
```
```
Lori = −10 + 0.3571·φ          para 0° ≤ φ ≤ 35°
Lori = 2.5 + 0.075·(φ − 35)    para 35° ≤ φ ≤ 55°
Lori = 4 + 0.114·(φ − 55)      para 55° ≤ φ ≤ 90°
```
(Si `Lrts < 0` → se toma `Lrts = 0`.)

- `Lmsd`: pérdidas multipantalla (multi-screen diffraction):
```
Lmsd = Lbsh + Ka + Kd·log(d) + Kf·log(f) + 9·log(b)
Lbsh = −18·log(1 + ΔhB) ,   ΔhB = hB − hR   (si ΔhB < 0 → Lbsh = 0)

Ka = 54                        si ΔhB ≥ 0
Ka = 54 − 0.8·ΔhB              si ΔhB < 0 y d ≥ 0.5 km
Ka = 54 − 1.6·ΔhB·d            si ΔhB < 0 y d < 0.5 km

Kd = 18                        si ΔhB ≥ 0
Kd = 18 − 15·(ΔhB/hR)          si ΔhB < 0

Kf = −4 + 0.7·(f/925 − 1)      ciudad media/suburbana
Kf = −4 + 1.5·(f/925 − 1)      grandes centros metropolitanos
```

**Valores por defecto si no se conocen datos de edificios/calles:**
- Altura de edificios: `hR ≈ 3 × número de pisos`.
- Separación entre edificios: `b = 20–50 m`.
- Ancho de calle: `W = b/2`.
- Orientación de la calle respecto al rayo directo: `φ = 90°`.

Validación: 900 MHz y 1800 MHz; distancias de 10 m a 3 km. Precisión aceptable cuando `hR > hB`. Si `hB ≪ hR`, el error crece (predominan efecto guía de onda y difracción en esquinas); en microceldas `b`, `W`, `φ` pierden significado físico.

**Caso especial — visibilidad a lo largo de una calle (guía de onda):**
```
Lb = 42.6 + 26·log(d[Km]) + 20·log(f[MHz])   para d ≥ 20 m
```

## 5.9 Modelo genérico tipo Okumura-Hata (variante paramétrica)
```
Lb = a0 + a1·log(d) + a2·log(ht) + a3·log(ht)·log(d) − 3.2·[log(11.75·hr)]² + g(f)
g(f) = 44.49·log(f) − 4.78·[log(f)]²
```
(ht, hr en metros; f en MHz; d en km. Los coeficientes `a0..a3` no se listan explícitamente en el texto extraído — **vacío de contenido**, probablemente están en una tabla-imagen no extraída.)

## 5.10 3GPP TR 38.901 — modelo para 5G/6G
- Válido para frecuencias entre **0.5 y 100 GHz**.
- Considera diferentes entornos, cada uno con su propia fórmula de path loss (no completamente extraíbles del PDF por estar en imágenes/tablas):
  - **Rural Macro (RMa):** distancia de breakpoint `dBP = 2π·hBS·hUT·fc / c`.
  - **Urban Macro (UMa):** `d'BP = 4·h'BS·h'UT·fc / c`, con `h'BS = hBS − hE`, `h'UT = hUT − hE` (hE = altura de ajuste por entorno).
  - **Urban Micro – Street Canyon (UMi):** mencionado, geometría de "efecto cañón" en calle urbana.
  - **Indoor Hotspot – Office.**
  - **Indoor Factory.**
  - **Sub-Urban Macro.**
- **Vacío de contenido:** las fórmulas completas de path loss por escenario (PL1/PL2, NLOS, etc.) no quedaron en el texto extraído — están en las gráficas/tablas de las diapositivas 98–107. Si el estudiante pregunta por 3GPP TR 38.901 en detalle, la IA debe indicar que el PDF del curso solo trae el encuadre general y ofrecer contrastar con el estándar 3GPP oficial (búsqueda web), dejando claro qué parte es del curso y cuál es contexto de la industria, tal como piden las instrucciones del proyecto.

## 5.11 Modelo Longley-Rice (ITM — Irregular Terrain Model)
- Modela obstáculos lejanos como filo de cuchillo y los cercanos como cilindros.
- Tiene en cuenta rugosidad del terreno (Δh).
- Frecuencia: 20 MHz – 40 GHz. Alturas de antena: 0.5–3000 m. Distancia: 1–2000 km.
- Muy útil para sistemas móviles y de difusión.
- Limitación práctica: requiere mapas digitalizados de alta resolución confiables.

---

# 6. Métodos semi-empíricos de predicción

## 6.1 Modelo de Durkin
- Considera tres condiciones de trayecto: con línea de vista (LOS), con línea de vista parcial (zona de Fresnel obstruida), sin línea de vista.
- Necesita datos geográficos del terreno.
- Si hay varias obstrucciones, las reduce a una equivalente mediante el **método de Bullington**.

---

# 7. Modelos micro/picocelulares y herramientas software

## 7.1 Modelos microcelulares
- Cobertura reducida; requieren condición de LOS entre Tx y Rx.
- Fenómenos relevantes: reflexión en suelo/edificios/obstáculos; difracción sobre obstáculos cercanos al móvil; dispersión (según frecuencia).
- Se usan **modelos tridimensionales**, en particular **trazado de rayos (Ray Tracing)**: la precisión depende del número de rayos/componentes considerados; se asume que la antena Tx está por encima de los edificios.

## 7.2 Modelos picocelulares
- Cobertura aún más restringida; suelen requerir LOS.
- Dos tipos: con línea de vista y obstruido.
- Aplicación típica: interiores de edificios, oficinas, industria, centros comerciales; el modelado considera absorción según el tipo de material constructivo.
- Técnica principal: **Ray Tracing**, analizando cada rayo lanzado desde el Tx:
  - Pérdidas por partición en el mismo piso (hard partitions / soft partitions), tabuladas según material.
  - Pérdidas entre pisos según material y dimensiones (tablas típicas de **13 a 34 dB**); también se considera ventanas de edificios vecinos (posición, dimensiones, número).
  - Pérdidas por movimiento de objetos/personas.
- Clasificación de modelos picocelulares: empíricos, determinísticos, probabilístico/estadístico.

## 7.3 Herramientas software mencionadas
- **Atoll** (Forsk) — mencionado con referencia `forsk.com/atoll-overview`.
- **Volcano** — mencionado sin más detalle (probablemente otra herramienta de planificación/predicción, aparece junto a un ejemplo de predicción en Múnich).
- **Vacío de contenido:** no hay desarrollo teórico de estas herramientas en el texto extraído (punto 5 del temario oficial queda muy incompleto en este PDF).

---

# 8. Canales multitrayecto (caracterización en banda ancha)

Este bloque es, en extensión, el segundo más grande del documento (diapositivas 63–85) y sienta las bases para el diseño de sistemas digitales de banda ancha.

## 8.1 Contexto
- Sistemas móviles **analógicos**: banda estrecha, caracterización básica.
- Sistemas móviles **digitales**: banda ancha, efectos adicionales por propagación multitrayecto y desplazamiento del móvil.
- El tipo de desvanecimiento depende de:
  - Parámetros de la señal: ancho de banda, periodo de símbolo, etc.
  - Parámetros del canal: dispersión del retardo (delay spread) y dispersión Doppler (Doppler spread).

## 8.2 Mecanismos de dispersión (independientes entre sí)
- **Dispersión en tiempo** (dispersión de retardo) → desvanecimiento **selectivo en frecuencia**.
- **Dispersión en frecuencia** (dispersión Doppler) → desvanecimiento **selectivo en tiempo**.

## 8.3 Dispersión en tiempo (delay spread)
- **Exceso de retardo:** `ti − t0` (retardo del eco i respecto al primer eco recibido, referido a cualquier "tap").
- **Dispersión del retardo (delay spread):** conjunto de valores `{ti − t0}`; depende del entorno. Regla práctica: 1 µs de diferencia ≈ 300 m de diferencia de recorrido. En ambientes urbanos: **0.5–1.5 µs**.

**Retardo medio y rms** (ponderados por potencia de cada componente `Pi`, con `PT = ΣPi`):
```
τ̄   = (1/PT)·Σ Pi·τi
τrms = √[ (1/PT)·Σ Pi·τi² − τ̄² ]
```
(**[OCR-verificar]** notación exacta de subíndices; el concepto —media y rms del perfil potencia-retardo— es estándar en Rappaport.)

### Distorsión producida por la dispersión del retardo
- Dominio del tiempo: **ISI** (interferencia entre símbolos).
- Dominio de la frecuencia (sistemas de banda ancha): **desvanecimiento selectivo en frecuencia (FSF)**.

### Ancho de banda de coherencia (Bc)
- Ancho de banda sobre el cual el canal puede considerarse "plano".
- Mide el grado de correlación entre dos componentes espectrales separadas por Bc.
- Relación aproximada con la dispersión de retardo D (canal con perfil potencia-retardo exponencial):
```
Bc ≈ 1 / (2π·D)
```

### Comparación BT (ancho de banda de la señal) vs Bc
- Si `BT ≪ Bc`: componentes espectrales correlacionadas, mismo desvanecimiento → **desvanecimiento plano**.
- Si `BT > Bc`: componentes con distinto desvanecimiento, no correlacionado → **desvanecimiento selectivo en frecuencia**.

## 8.4 Dispersión en frecuencia (Doppler)
- Efecto Doppler por movimiento relativo Tx-Rx:
```
f = f0 · (v/c)        (corrimiento Doppler, forma aproximada dada en las diapositivas)
```
- Cada componente en frecuencia experimenta un corrimiento Doppler `fdi`.
- **Dispersión Doppler (Doppler spread):** conjunto de corrimientos en frecuencia; cuantifica la movilidad.
- Consecuencia: **TSF** (Time Selective Fading / desvanecimiento selectivo en tiempo) — elementos sucesivos de la señal transmitidos en tiempos distintos (p. ej. TDMA) "ven" canales distintos.

### Tiempo de coherencia (Tc)
- Parámetro que caracteriza el TSF.
- Dos elementos de señal separados por un tiempo `< Tc` están correlacionados (ven el mismo canal); si la separación es `> Tc`, no están correlacionados y les afecta el TSF.
- Relación aproximada dada en la diapositiva:
```
Tc ≈ 9 / (16π·fd)
```

## 8.5 Resumen: 4 parámetros básicos de caracterización en banda ancha
- Dispersión en tiempo → **dispersión de retardo** y **ancho de banda de coherencia**.
- Dispersión en frecuencia → **dispersión Doppler** y **tiempo de coherencia**.

## 8.6 Tablas de valores típicos (dadas en el material)

**Dispersión de retardo D y ancho de banda de coherencia Bc por entorno:**

| Entorno | D (µs) | Bc (kHz) |
|---|---|---|
| Rural | 0.2 | 796 |
| Suburbano | 0.5 | 318 |
| Urbano | 3 | 53 |

**Tiempo de coherencia Tc a 900 MHz según velocidad:**

| Velocidad (km/h) | Corrimiento Doppler (Hz) | Tc (ms) |
|---|---|---|
| 10 | 8.3 | 21.5 |
| 50 | 41.7 | 4.3 |
| 100 | 83.3 | 2.1 |

## 8.7 Clasificación del canal en el plano tiempo-frecuencia (5 zonas, según BT vs Bc y duración de símbolo vs Tc)
1. Zona rayada: no es posible la transmisión.
2. Canal plano en frecuencia y en tiempo (no sufre ningún desvanecimiento selectivo).
3. Canal plano en frecuencia (desvanecimiento selectivo en **tiempo**).
4. Canal plano en el tiempo (desvanecimiento selectivo en **frecuencia**).
5. Canal no plano (sufre ambos tipos de desvanecimiento).

## 8.8 Ejemplos numéricos resueltos en el material
**Ejemplo 1:** canal con `D = 2 µs`, transmisión en `f = 900 MHz`, móvil a `v = 36 km/h`, corrimiento Doppler dado `fd = 30 Hz`.
```
Bc = 1/(2π·D) = 1/(2π·2×10⁻⁶) ≈ 80 kHz
Tc = 9/(16π·fd) = 9/(16π·30) ≈ 6 ms
```

**Ejemplo 2:** transmisión digital `R = 19.5 kbps` (Tb = 0.05 ms), `B = 25 kHz` → **Zona 2 (canal plano)**.

**Ejemplo 3:** sistema GSM, `BW = 200 kHz`, `Tb = 3.7 µs` → **Zona 4 (canal selectivo en frecuencia)**.

## 8.9 Consecuencias prácticas y técnicas de compensación
- Analógicos de banda estrecha: desvanecimiento plano (no selectivo); pueden darse cortes breves si el móvil circula despacio; distorsión poco importante.
- Digitales (cientos de kHz de ancho de banda): distorsión e ISI producen BER elevado que **no se reduce aumentando potencia** → **BER irreducible (I-BER)**.
- Técnicas de compensación mencionadas:
  - Diversidad en recepción.
  - Saltos en frecuencia (frequency hopping).
  - Ecualizadores digitales en el receptor (deben ser adaptativos, requieren conocer las características del canal).
  - Códigos detectores/correctores de errores con entrelazado (interleaving).
- Datos de referencia:
  - Medios urbanos: retardos típicos de 2–5 µs (diferencias de recorrido de 600–1500 m).
  - GSM: retardo máximo ecualizable = 16 µs; corrimiento Doppler típico ≈ 210 Hz.
  - Sistemas **CDMA** de gran ancho de banda: aprovechan el poder de resolución del receptor para identificar y separar ecos, ponerlos en fase y sumarlos coherentemente → la dispersión temporal pasa de ser perjudicial a **beneficiosa** (ganancia de diversidad multitrayecto) mediante **receptores Rake**.

## 8.10 Modelos de canales multitrayecto (naturaleza)
- Los canales multitrayecto móviles son **lineales pero variantes en el tiempo**.
- **Modelos matemáticos:** representan las ondas por rayos y su interacción con estructuras dispersoras → simulación lógica (software).
- **Modelos físicos:** los fenómenos multitrayecto se materializan mediante circuitos eléctricos → simulación física (hardware).

---

# 9. Fuentes / enlaces citados dentro de las diapositivas

- IEEE Xplore: `https://ieeexplore.ieee.org/document/9759472`
- ITU-R, informe general de radiocomunicaciones: `https://www.itu.int/dms_pub/itu-r/opb/gen/R-GEN-SGB-2025-PDF-E.pdf`
- Modelos de difracción (Harvard, curso ES151): `http://people.seas.harvard.edu/~jones/es151/prop_models/propagation.html`
- Forsk (software Atoll): `https://www.forsk.com/atoll-overview`
- SkyDSP (tesis, capítulo 1 — modelos de propagación y multitrayecto): `http://www.skydsp.com/publications/4thyrthesis/chapter1.htm`
- HP Labs (J. Tourrilhes) — canal inalámbrico: `http://www.hpl.hp.com/personal/Jean_Tourrilhes/Linux/Linux.Wireless.modem.html`
- Mike Willis — tutorial de propagación: `http://www.mike-willis.com/Tutorial/PF15.htm`
- NI Devzone (National Instruments) — canal multitrayecto: `http://zone.ni.com/devzone/cda/ph/p/id/339` y `.../id/332`
- Wireless.per.nl — referencia de desvanecimiento e indoor: `http://wireless.per.nl/reference/chaptr03/...`
- ESRI proceedings (paper P525): `http://proceedings.esri.com/library/userconf/proc98/proceed/TO550/PAP525/P525.HTM`
- HowStuffWorks — radar/Doppler: `http://science.howstuffworks.com/radar1.htm`

Nota: varias de estas URLs corresponden a recursos antiguos (páginas de universidades/proyectos de los 2000s); al contrastarlas o citarlas, verificar que sigan activas.

---

# 10. Vacíos de contenido detectados (para tener en cuenta al responder)

Estas diapositivas contienen figuras, gráficas o tablas que **no se pudieron extraer como texto** y por tanto no están representadas en este documento. Si el estudiante pregunta específicamente por ellas, indicar que la base de conocimiento actual no captura el detalle visual y pedir que las describa, las suba como imagen, o se refiera a la numeración de diapositiva:

- Diapositivas 5, 15, 17–18, 21–22, 41 y varias entre 62–90: diagramas y gráficas sin texto asociado (geometría de multitrayecto, curvas de intensidad de campo, diagramas de Ikegami/Walfish/COST-231, capturas de software).
- Diapositivas de "Métodos de Predicción de Propagación" (55–62): capturas de pantalla de herramientas (Atoll, "Volcano") y ejemplos de predicción (macroceldas a 450 MHz, predicción en Múnich) sin texto explicativo extraído.
- Coeficientes `a0, a1, a2, a3` del modelo genérico tipo Okumura-Hata (sección 5.9): no aparecen en el texto, probablemente en una tabla-imagen.
- Fórmulas completas de path loss por escenario del 3GPP TR 38.901 (sección 5.10): solo se capturó el encuadre general (breakpoint distance de RMa y UMa); las fórmulas de PLOS/PLNLOS de cada escenario no están en el texto extraído.
- El ejercicio propuesto (sección 5.2) no tiene solución en el material — es un ejercicio abierto para el estudiante.
- El punto 4 del temario oficial ("Óptica geométrica y técnicas de trazado de rayos") y el punto 5 ("Herramientas software") están débilmente desarrollados en este PDF específico; es probable que se cubran con más detalle en material adicional que el estudiante suba más adelante.

---

# 11. Registro de actualizaciones de este documento

| Fecha | Cambio | Fuente |
|---|---|---|
| 2026-08-18 | Creación inicial a partir de `Propagación en Canales Móviles.pdf` (85 diapositivas) | Carpeta del proyecto "ENFA 2 MIRAMÁ" |
| 2026-08-22 | Sección 2.5: se agrega la fórmula de pérdidas en espacio libre confirmada por el estudiante (constante 32.44, `f` en MHz, `d` en km) y su equivalencia con el término `Afs` del ECC-33 (constante 92.45, `f` en GHz) | Conversación con el estudiante |
| 2026-08-25 | **v1 — primera versión trasladada al repositorio de código** `TELECOMM-LFS` como `docs/curso-referencia.md`, según lo establecido en el `CLAUDE.md` del proyecto (fuente de verdad de fórmulas para la implementación) | Repositorio GitHub `SteamedPotato69/TELECOMM-LFS` |
| 2026-08-28 | **Re-subida del PDF fuente** (mismo archivo, ahora 172 páginas en vez de 85 — ver sección 12). Se actualiza el ejercicio de la sección 5.2, se marca ECC-33 (5.5) como pendiente de confirmar, y se agrega la sección 12 con el enunciado oficial del proyecto de app | Carpeta del proyecto "ENFA 2 MIRAMÁ" |
| 2026-08-29 | Se confirma que **ECC-33 sigue vigente** en el curso (no fue retirado del temario, fue un problema de exportación de esa diapositiva en el PDF de 172 páginas). Se cierra la advertencia en sección 5.5 y se actualiza 12.1 | Conversación con el estudiante |
| 2026-09-27 | Se agrega la **sección 13** (`Planificación de redes de comunicaciones móviles e inalámbricas.pdf`, 24/04/2026, 75 diapositivas): geometría celular, Erlang B aplicado a dimensionamiento, patrón capacidad-vs-cobertura, ecuación de carga UMTS y bucle de *cell breathing*. Documento distinto de `Propagación en Canales Móviles.pdf` (secciones 1-12) — mismo curso, módulo de planificación celular | Carpeta del proyecto "ENFA 2 MIRAMÁ", análisis en sesión de Cowork |
| 2026-09-27 | **Verificación directa contra el PDF original** de la sección 13.3 (diap. 45-46), durante la implementación de la Fase 4 de planificación celular: (1) confirmado que **ambos ejemplos (1G y 2G) usan Okumura-Hata Urbano**, no COST-231-Hata para el 2G — la sección 13.3 no lo especificaba con certeza; (2) la tabla de parámetros del ejemplo 2G tiene un **error interno**: declara "EIRP MS = 30dBm" pero sus propios Pt=30/Gt=0/Body loss=3 implican EIRP=27dBm (probable resto de copiar la diapositiva del 1G); (3) el ejemplo 1G, con EIRP autoconsistente, arroja un **MAPL de 143dB con la fórmula estándar de link budget, 2dB por encima del 141dB declarado**, sin explicación encontrada en el material — queda como discrepancia sin resolver, no se fuerza el ajuste. Detalle completo en `src/models/propagation/linkBudget.ts` | PDF original `1G_2G_enfa2/Planificación de redes de comunicaciones móviles e inalámbricas.pdf`, re-extraído con `pdftotext` |
| 2026-09-27 | **Verificación directa contra el PDF original** de la sección 13.4 (diap. 66-74), durante la implementación de la Fase 6. Las diapositivas 71-74 tienen un formato visual muy distinto al resto del PDF (tablas y tarjetas de colores tipo dashboard, en vez de las diapositivas simples del profesor) -- se le preguntó explícitamente al estudiante por la procedencia y **confirmó que es del PDF original del profesor sin editar**, así que se trata como material oficial del curso pese al diseño inusual. Verificado con precisión: (1) la tabla de Gp y sensibilidad por servicio (diap. 66, 72) coincide exacta para Voz AMR/PS64k/PS384k; (2) el factor de carga ρ coincide exacto para PS64k y PS384k pero **no para voz** (con Eb/No=5dB, α=0.67, R=12.2kbps dados en la propia tabla, la fórmula da ρ=0.0148, no el 0.0210 declarado -- ninguna combinación de los datos dados lo reproduce); (3) el ejercicio usa un COST-231-Hata **simplificado específico** para 2100MHz/hb=30m (L=148.0+34.1·log₁₀(R)), con coeficientes distintos a `cost231Hata.ts`; (4) el área de celda en esta sección es **hexagonal (2.6·R²)**, no circular como en §13.3 -- confirmado exacto contra U_celda=920 de la diap. 73; (5) **la fórmula que conecta "U_celda" (población registrada en la huella de la celda) con "H_salida" (carga de salida) en la tabla de iteraciones de la diap. 73 no está mostrada en el material** -- ninguna reconstrucción directa a partir de la ecuación de carga estándar reproduce la convergencia suave de 3 pasos del profesor (diverge/oscila); se implementó con la conversión estándar de WCDMA (población → usuarios activos vía Erlang/usuario) estabilizada con iteración amortiguada, que converge a un punto de operación físicamente sensato pero no idéntico numéricamente al R=1.07km/η=54% de la diapositiva. Detalle completo en `src/models/wcdma/wcdma.ts` | PDF original `1G_2G_enfa2/Planificación de redes de comunicaciones móviles e inalámbricas.pdf`, re-extraído con `pdftotext` y renderizado a imagen con PyMuPDF; procedencia de diap. 71-74 confirmada por el estudiante |

**Instrucción para actualizaciones futuras:** al subir nuevo material (otro PDF, apuntes, normativas), añadir una nueva sección numerada siguiendo el mismo formato (metadatos de la fuente, contenido resumido con fórmulas y rangos de validez, vacíos de contenido) y agregar una fila a esta tabla. No borrar ni resumir las secciones anteriores — este documento debe seguir sirviendo como historial completo del curso.

---

# 12. Especificación oficial del proyecto de app (agregado al PDF el 2026-08-28)

## 12.1 Qué cambió entre versiones del PDF fuente
El estudiante volvió a subir `Propagación en Canales Móviles.pdf` y el archivo pasó de **85 a 172 páginas**. Verificado programáticamente (diff de texto extraído, no solo tamaño de archivo):

- La inmensa mayoría del salto de 85→172 páginas es **el mismo contenido re-exportado con las animaciones de PowerPoint como páginas independientes** (cada viñeta que aparece con clic queda como una página extra en el PDF). No es contenido nuevo — es la razón por la que la numeración interna de diapositivas ya no sirve como referencia estable; en este documento se sigue citando por número de "diapositiva lógica" original (1–85) donde aplica.
- **Cambio real #1:** el ejercicio de la sección 5.2 fue reemplazado por una versión ampliada (dos frecuencias, nuevos valores de potencia/ganancia, parámetro `lr` de Ikegami). Ver sección 5.2 actualizada.
- **Cambio real #2 — el más importante:** se agregó un enunciado de tarea explícito para construir la app (ver 12.2).
- **Cambio real #3 (resuelto, confirmado 2026-08-29):** el método **ECC-33 no aparece** en el texto extraído de la nueva versión del PDF (antes aparecía 3 veces con sus fórmulas; ahora 0) — pero el estudiante confirmó que **sigue vigente en el curso**. Fue un problema de exportación/OCR de esa diapositiva puntual en el nuevo archivo, no un retiro del temario. La sección 5.5 se mantiene sin cambios, tomada de la versión original de 85 diapositivas.

## 12.2 Enunciado textual de la tarea (tal como aparece en el PDF, inmediatamente después de "3GPP TR 38.901 – Sub Urban Macro" y antes de "Modelo Longley-Rice")

> **Ejercicio**
>
> Utilizando una IA de su preferencia, cree una app que le permita resolver ejercicios de modelos de canal, empleando los modelos vistos en clase.
>
> La app debe recibir los parámetros básicos y seleccionar los modelos adecuados para realizar el ejercicio, debe usted verificar y mostrar gráficas resultantes que le permita comparar la predicción de pérdidas y potencias gráficamente.

## 12.3 Lectura de los requisitos (importante para el alcance del proyecto de código)

Este enunciado es la fuente de verdad del alcance de `TELECOMM-LFS` — no es solo "una calculadora de fórmulas", tiene tres requisitos explícitos que conviene tener muy presentes en el `CLAUDE.md` y en el orden de las fases de desarrollo:

1. **"Recibir los parámetros básicos"** — un formulario de entrada con los parámetros físicos del sistema (f, d, ht, hr, entorno, y los específicos de calle/edificios cuando aplique).
2. **"Seleccionar los modelos adecuados"** — esto es más que dejar que el usuario elija un modelo de un dropdown: implica que la app debe **decidir automáticamente qué modelo(s) son válidos** para los parámetros dados, usando los rangos de validez ya documentados en este archivo (sección `validRanges` de cada modelo en el `CLAUDE.md`). Por ejemplo: con f=2000MHz, Hata clásico queda descartado automáticamente y debe sugerirse COST231-Hata; con datos de calle/edificios disponibles, debe sugerirse también Ikegami.
3. **"Verificar y mostrar gráficas... para comparar la predicción de pérdidas y potencias gráficamente"** — se requiere explícitamente una vista comparativa gráfica entre modelos (no solo un número de salida), y la palabra "verificar" reafirma la regla ya establecida en el `CLAUDE.md` de no dar un resultado por bueno sin contrastarlo contra un valor de referencia.

**Nota para el estudiante:** el roadmap de fases que se propuso inicialmente (selección manual de modelo primero, comparación y gráficas como fases 3 y 5, más adelante) puede no reflejar bien esta prioridad — el enunciado sugiere que la selección automática de modelo y la comparación gráfica son parte del núcleo de la entrega, no un extra. Vale la pena revisar el orden de fases con esto en mente.
---

# 13. Planificación celular 1G/2G/3G — tráfico, geometría y dimensionamiento (Prof. Víctor Fabián Miramá)

## 13.0 Metadatos del material fuente

| Campo | Valor |
|---|---|
| Archivo | `Planificación de redes de comunicaciones móviles e inalámbricas.pdf` |
| Docente | Víctor Fabián Miramá |
| Institución | Facultad de Ingeniería Electrónica y Telecomunicaciones, Universidad del Cauca |
| Fecha en el pie de página | 24/04/2026 |
| Extensión | 75 diapositivas |
| Carpeta | `1G_2G_enfa2/` dentro del proyecto "ENFA 2 MIRAMÁ" (subido 2026-09-27) |
| Relación con las secciones 0-12 de este documento | Material **distinto** de `Propagación en Canales Móviles.pdf` (secciones 1-12) — mismo curso, módulo de **planificación y dimensionamiento celular** en vez de modelos de propagación puros |

**Alcance real vs. anunciado:** la diapositiva 1 (tabla de contenido) anuncia 6 bloques hasta 4G y 5G, pero el contenido real de este PDF cubre solo hasta **3G** (termina en la diapositiva 75 con la asignación de trabajo para 1G/2G/3G). 4G y 5G no están en este archivo.

## 13.1 Geometría celular y retícula de planificación (diap. 20-25)

Antenas omnidireccionales producen coberturas circulares que no recubren el plano sin traslapes; la planificación usa coberturas poligonales inscritas en el círculo de cobertura de radio R:

```
S_triángulo = (3√3/4)·R²
S_cuadrado  = 2·R²
S_hexágono  = (3√3/2)·R²
```

Retícula hexagonal de planificación (diap. 21):
```
d = R·√3                       # paso de la retícula
S_c = (3√3/2)·R² = (√3/2)·d²   # área de celda hexagonal
```

Dadas dos estaciones en P(m,n) y Q(k,l), con i=m−k, j=n−l:
```
D² = (i² + j² + i·j)·d²
```

Situando la celda de referencia en el origen (diap. 22):
```
D² = (m² + n² + m·n)·d²
N = (D/d)² = m² + n² + m·n        # número rómbico: tamaño de agrupación válido
S_RC = N·(√3·d²/2) = (√3·D²/2)     # área del rombo cocanal, equivale a N celdas
```

Solo son geométricamente posibles agrupaciones cuyo N sea un número rómbico. Valores dados en el material (diap. 23):

| m | n | N |
|---|---|---|
| 0 | 2 | 4 |
| 1 | 1 | 3 |
| 1 | 2 | 7 |
| 1 | 3 | 13 |
| -1 | 2 | 3 |
| -1 | 3 | 7 |
| 2 | 2 | 12 |
| 0 | 3 | 9 |

Distancia de reutilización en función de R (diap. 23):
```
D = √(3·N)·R
```
Ejemplo dado: agrupación de 7 celdas → D = √21·R.

Número de agrupaciones para cubrir un área total S_T (diap. 24):
```
Q = E[ S_T / S_RC ] + 1 = E[ S_T / (√3·D²/2) ] + 1     # E[·] = parte entera; Q es también el índice de reutilización
# CORREGIDO 2026-10: antes decía 3·D²/2 y ceil(). La diap. 24 (leída como imagen) imprime S_RC = N·Sc = √3·D²/2:
# la raíz de 3 se perdió en la transcripción y subestimaba Q hasta ~40 % (N=7, R=1 km, S_T=500 km² → 17 en vez de 28).
```
Si K es el número de canales por celda, la red dispone de Q·K·N canales en total.

Sectorización trisectorial a 120° (diap. 25):
```
S_sector = (1/3)·S_c = (√3/2)·R²
```

**Verificación:** fórmulas confirmadas visualmente contra el render de las diapositivas 20-22 (no solo el texto extraído por OCR) — no hay marcas `[OCR-verificar]` en esta sección.

## 13.2 Erlang B aplicado a dimensionamiento celular (diap. 28, 31, 45-46)

El curso usa el modelo de pérdida pura Erlang B (bloqueo, sin cola) para dimensionar canales de tráfico por celda — cita explícitamente `erlang.com/calculator/erlb/` (diap. 28):

```
p = B(ρ·S_c, K)
```
donde p = probabilidad de bloqueo (GoS), ρ = densidad de tráfico (Erlang/km²), S_c = área de celda, K = canales disponibles.

Notación inversa usada en los ejercicios resueltos — dado K canales y un GoS objetivo, obtener el tráfico soportable:
```
A_c = B⁻¹(K, GoS)
```

Forma recursiva estable (no usar la forma factorial — desborda numéricamente para K y A grandes):
```
B(0,A) = 1
B(n,A) = A·B(n−1,A) / (n + A·B(n−1,A))     para n = 1..K
```
`B⁻¹(K,GoS)` se resuelve iterando A hasta que B(K,A) = GoS (búsqueda binaria: B es monótona creciente en A).

**Verificación numérica** (tres casos, todos confirmados contra el PDF):
- Diap. 31: 294 canales / 7 celdas = 42 canales/celda → `B⁻¹(42, 0.01) = 30.77 Erlang/celda`.
- Diap. 45 (1G): 416 canales / 7 celdas = 59 canales/celda → `B⁻¹(59, 0.02) = 47 Erlang/celda`.
- Diap. 46 (2G): 10 TRX × 7 IT = 70 canales/celda → `B⁻¹(70, 0.02) = 57 Erlang/celda`.

## 13.3 Patrón de dimensionamiento repetido: capacidad vs. cobertura (diap. 44-46, 71-74)

Los tres ejercicios resueltos completos del PDF (1G, 2G, 3G) siguen la misma estructura:

1. **Por tráfico/capacidad:** tráfico total (usuarios × Erlang/usuario) → canales por celda (según ancho de banda disponible / agrupación N) → `A_c = B⁻¹(K,GoS)` (§13.2) → # celdas = tráfico total / A_c.
2. **Por cobertura:** link budget (tabla de parámetros: EIRP, ganancias, sensibilidad, márgenes) → MAPL → modelo de propagación (Okumura-Hata o COST-231-Hata, ya implementados en `src/models/propagation/`) → radio de celda R → # celdas = área total / área de celda (área **circular** πR², distinta de la fórmula hexagonal de §13.1 — son dos etapas distintas del diseño, no un error).
3. **Resultado final = máx(# celdas por capacidad, # celdas por cobertura)** — el factor limitante.

**Verificación numérica completa:**

| Caso | Tráfico total | Canales/celda | A_c (Erlang B⁻¹) | Celdas por capacidad | MAPL | R | Celdas por cobertura | Resultado final |
|---|---|---|---|---|---|---|---|---|
| 1G (diap. 44-45) | 250 Erl (10000 usr × 0.025) | 59 | 47 Erl | 6 | 141 dB | 2.5 km | 3 | **6 (capacidad)** |
| 2G (diap. 46) | 250 Erl | 70 | 57 Erl | 5 | 133 dB | 1.5 km | 8 | **8 (cobertura)** |

3G (diap. 66-74) sigue el mismo patrón pero con la ecuación de carga UMTS en vez de Erlang B — ver §13.4.

## 13.4 Ecuación de carga UMTS y bucle iterativo de *cell breathing* (diap. 66-74)

En UMTS/WCDMA no hay canales discretos: la capacidad y la cobertura están acopladas a través de la carga de celda η. A mayor carga, menor MAPL efectivo, menor radio (el radio "respira" con el tráfico).

Ganancia de procesado (diap. 66):
```
Gp = 10·log10(W / R_b)          # W = 3.84 Mcps (chip rate UMTS), R_b = tasa del servicio
```

Contribución de carga de un usuario i al uplink (diap. 67):
```
ρ_i = 1 / (1 + W / (α_i · R_bi · (Eb/N0)_i))
```
Carga total de celda en uplink:
```
η_UL = Σ ρ_i · (1 + i_oc)          # i_oc: factor de interferencia de otras celdas
```
Número máximo de usuarios del servicio j por celda (UL):
```
N_j = η_UL,max / (ρ_j · (1 + i_oc))
```

**[Estructura confirmada 2026-10 sobre la imagen de la diap. 67; β sigue sin definir]** Carga en downlink:
```
η_DL = Σ [ α_i · (Eb/N0)_i · (R_bi / W) ] · [ (1 − β) + i_other ]
```
CORREGIDO: la transcripción anterior (`Σ[...]·(1 − β) + i_other`) sacaba `i_other` del producto; en la imagen el corchete `[(1−β)+i_other]` es un factor común que multiplica la suma. Nótese que `ρ_UL = L/(1+L)` con `L = α·R·(Eb/N0)/W`, la misma `L` del corchete interior de η_DL.

**Discrepancia de ρ de voz (verificada 2026-10 contra las imágenes de las diap. 67, 69 y 72):** la ecuación impresa (diap. 67) da 0.00669 para voz; la diap. 69 escribe su ejemplo SIN α (`1/(1+W/(R·Eb/N0))`) y da ≈0.00995 pero afirma ≈0.020; la diap. 72 usa 0.0210. Ningún valor dado reproduce 0.0210. Para PS64k/PS384k (α = 1) los tres coinciden con 0.0357/0.137. El PS 64k aparece con Eb/N0 = 4.0 dB en la diap. 66 y con 3.5 dB en la diap. 72 (el PDF se contradice; la app usa 3.5, el de los ρ impresos).
La variable `β` no está definida en el texto extraído (probablemente el factor de ortogonalidad del código, típico en literatura UMTS, pero no confirmado contra el PDF original) y no hay ningún ejercicio resuelto en el material que ejercite η_DL numéricamente — solo η_UL se usa en el ejercicio completo de diap. 69-74.

Margen de carga y bucle iterativo (diap. 68-70, 73):
```
M_carga = −10·log10(1 − η)
MAPL_efectivo = MAPL_sin_carga − M_carga
```
Se itera: MAPL_efectivo → modelo de propagación → R_cargado → densidad de usuarios en ese radio → η recalculado → hasta que R y η converjan.

**Ejercicio completo verificado (diap. 71-74):** 50 km², 10.000 usuarios, 0.025 Erlang/usuario, GoS=2%, mix 70% voz AMR / 20% PS64k / 10% PS384k, banda 2100 MHz. Paso 1 (Gp y ρ por servicio) → Paso 2 (link budget UMTS, MAPL_carga_cero = 152.2 dB para voz) → Paso 3 (η_objetivo=50%, i_oc=0.55 → 9 usuarios activos/celda) → Paso 4 (bucle: converge en 3 iteraciones a R=1.07 km, η=54%, margen de carga 3.37 dB) → Paso 5 (17 NodeB por cobertura vs. 31 NodeB por capacidad → 31 NodeB, limitado por capacidad) → Paso 6 (árbol OVSF: 30/128 códigos consumidos; interfaz Iub: 2 E1/NodeB, 2.7 Mbps/NodeB).

## 13.5 Vacíos de contenido y advertencias detectadas

- **η_DL (downlink):** ver §13.4 — variable `β` no definida, sin ejercicio de verificación. No implementar sin confirmar contra el PDF original o Rappaport/Holma-Toskala.
- **Erlang C (modelo de cola M/M/N):** este PDF **no lo menciona**. Todos los ejemplos de dimensionamiento de canal usan Erlang B (modelo de pérdida pura), consistente con que un canal de radio bloquea la llamada en vez de encolarla. Erlang C es un modelo de industria para *call centers* (ver el resumen de `erlang.com` ya cargado en el proyecto de Cowork) — su aplicabilidad a dimensionamiento de canales de radio no está confirmada por el curso.
- **Engset y Erlang B extendido (con reintentos):** tampoco aparecen en este PDF — solo en el resumen genérico de `erlang.com`.
- **4G y 5G:** anunciados en la tabla de contenido (diap. 1) pero no desarrollados en este archivo — pendientes de una entrega posterior del curso.
- **Diagramas de arquitectura** (AMPS diap. 37-38, GSM diap. 41-42, UMTS diap. 54-58, árbol OVSF diap. 61-64): son mayormente gráficos, no transcritos en detalle en este documento — relevantes para preguntas de identificación de arquitectura, no para cálculo.
- **Q (número de agrupaciones, §13.1):** la fórmula está dada (diap. 24) pero el material no incluye un ejercicio numérico que la ejercite directamente — es álgebra simple (techo de una división) y no se marca como una fuente de riesgo, a diferencia de η_DL.

## 13.6 Relación con el proyecto de app (`telecomm-propagation`)

Ver `README.md` sección "Próximas funcionalidades" para el mapeo de cada bloque de esta sección a una funcionalidad propuesta de la app, con estado APROBADA/PENDIENTE.

---

