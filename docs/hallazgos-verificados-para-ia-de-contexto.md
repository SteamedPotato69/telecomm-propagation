---
titulo: "Hallazgos verificados contra las diapositivas originales -- para la IA que mantiene el contexto del curso"
para: "La IA (Cowork u otra) que redacta y actualiza CURSO_CONTEXTO.md, PROPUESTA_herramienta_celular_para_Claude_Code.md y docs/curso-referencia.md"
fecha: 2026-10-21
autor: Claude Code (rama feature/cell-puzzle del repo telecomm-propagation)
metodo: "Cada diapositiva citada se renderizó como IMAGEN (PyMuPDF, 100-110 dpi) y se leyó; las cifras se recalcularon con scripts independientes. No se confió en el texto extraído."
---

# 0. Lee esto primero

**Regla de oro:** el texto extraído de los PDF **pierde o reordena exactamente lo que importa en una ecuación** (raíces `√`, el lugar de `α`, el signo, qué va dentro de un corchete). Varios errores de este paquete de documentos nacen de ahí. Antes de afirmar una fórmula, **renderiza la diapositiva a imagen y léela**.

```python
import pymupdf  # pip install pymupdf
d = pymupdf.open("Planificación de redes de comunicaciones móviles e inalámbricas.pdf")
d[24-1].get_pixmap(dpi=100).save("diap24.png")   # numeración física = número de diapositiva (75 en total)
```

**Numeración de páginas.** En `Planificación de redes ... .pdf` (75 págs.) la página física = el número de diapositiva. En `Propagación en Canales Móviles.pdf` (172 págs., re-exportado con animaciones como páginas sueltas) los números de abajo son **páginas físicas del PDF de 172**, no "diapositivas lógicas" (1-85).

**Cómo está cada hallazgo en el repo:** ✅ corregido en código/docs del repo · ⏳ pendiente en el repo · 📝 solo afecta a tus documentos.

# 1. Resumen

| # | Dónde está el error | Qué dice | Qué es correcto (evidencia) | Gravedad | Repo |
|---|---|---|---|---|---|
| F1 | `docs/curso-referencia.md` §13.1 (Q) | `Q = ceil(S_T / (3·D²/2)) + 1` | `Q = E[S_T/S_RC] + 1`, `S_RC = N·Sc = √3·D²/2` (diap. 24). Se perdió la raíz de 3 | **Alta**: subestima hasta ~40 % | ✅ e180f47 |
| F2 | `CURSO_CONTEXTO.md` §5.5 y fila 2026-08-30 del §11 (ECC-33) | "el código usa el signo incorrecto (resta) y debe corregirse a suma" | **El código está bien.** La diapositiva imprime `+`, pero con la convención de "ganancia"; con suma el modelo se desvía hasta 40 dB de Hata. Ver §3 | **Alta**: el consejo rompe un modelo correcto | 📝 (código intacto, correcto) |
| F3 | `docs/curso-referencia.md` líneas ~420 y ~430 (Walfisch-Bertoni) | `−18·log(1 + d²/(17H))` | `−18·log(1 − d²/(17H))` (pág. 87 del PDF de 172). `CURSO_CONTEXTO.md` ya lo tenía bien | Media (hasta 0,8 dB a 5 km) | doc ✅ / código ⏳ |
| F4 | `docs/curso-referencia.md` §13.4 (η_DL) | `Σ[...]·(1−β) + i_other` | `Σ[ α·(Eb/N0)·(R/W) ]·[(1−β)+i_other]`: el corchete es un factor común (diap. 67) | Media | ✅ |
| F5 | `PROPUESTA` §1 (ρ de voz) | tres valores, "ninguno reproduce 0,0210" | Falta un **cuarto dato**: la diap. 69 escribe su ejemplo **sin α** (→0,00995) y dice ≈0,020. La conclusión (código mal, curso inconsistente) se mantiene | Media | ✅ a6fddc1 |
| F6 | `PROPUESTA` §2 / `CURSO_CONTEXTO` | PS 64k con Eb/N0 = 4,0 (diap. 66) | El PDF **se contradice**: 4,0 en la diap. 66 (fila "Video llamada") y 3,5 en la diap. 72. Los ρ impresos (0,0357) salen con 3,5 | Baja | ✅ documentado |
| F7 | `CURSO_CONTEXTO.md` §11 filas 2026-08-30 | "no hay implementación en `walfischBertoni.ts`", "COST-231 WI no está implementado" | Hoy **ambos y Ikegami están implementados** y registrados | Baja (obsoleto) | 📝 |
| F8 | `PROPUESTA` §0.2, §2 | "no tocar `src/screens`"; API con `label: string` | El trabajo de i18n ya se mergeó: hay que traducir todo a es/en/pt y los servicios usan `id: 'voice'\|'ps64'\|'ps384'` | Baja (obsoleto) | 📝 |
| F9 | `CURSO_CONTEXTO.md` §5.9-5.10 vs `README.md` del repo | CURSO_CONTEXTO: Ericsson 9999/3GPP "confirmados y en alcance"; README: Ericsson 9999 y Lee "fuera de alcance" | **No verificado por mí** (no revisé esas diapositivas). Hay que reconciliar | ? | ⏳ |

# 2. Detalle y evidencia

## F1 -- Fórmula de Q (diap. 24)

La diapositiva 24, leída como imagen, trae las **tres** formas:
```
Q = E[ S_T / S_RC ] + 1   =   E[ S_T / (N·S_c) ] + 1   =   E[ S_T / (√3·D²/2) ] + 1
```
`E[·]` es la **parte entera** (notación hispana/francesa). El texto extraído mostraba `3·D²/2`: la `√` se perdió. Como `S_RC = N·(3√3/2)R² = (√3/2)D²`, la forma con `3·D²/2` es √3 veces mayor, así que **Q sale ~42 % más chico**.

Reproducible:
```python
from math import sqrt, floor, ceil
N,R,ST = 7,1,500; D2=3*N*R*R; SRC=N*3*sqrt(3)/2*R*R   # SRC = 18.187
print(ceil(ST/(1.5*D2))+1, floor(ST/SRC)+1)            # 17  28
```
Con el valor antiguo, 5 agrupaciones "cubrían" 91 km² de los 100 km² requeridos. Las líneas 780 y 804 de `curso-referencia.md` **se contradecían entre sí** (la 780 ya decía `√3·D²/2`).
Matiz abierto: `E[·]+1` literal añade una unidad cuando el cociente es entero (50/2,5 = 20 → 21); es la lectura literal y se deja así, anotado.

## F2 -- ECC-33: **no** cambiar el signo

La diapositiva **sí** imprime `L_b = A_fs + A_bm + G_b + G_r` (pág. 71 del PDF de 172; las fórmulas de A_fs, A_bm, G_b, G_r en la pág. 72; rangos en la 73). El error está en la **conclusión** de `CURSO_CONTEXTO.md`:

> "Gb y Gr ya dan valores típicamente negativos... sumarlos reduce la pérdida total cuando la antena es más alta -- es coherente."

Es al revés. `G_b = log(h_b/200)·{13,958 + 5,8·[log d]²}` es **negativo** para h_b < 200 m y `G_r = (42,57 + 13,7·log f)(log h_r − 0,6)` es negativo para h_r pequeña. Con `+`, **bajar** la antena **reduce** la pérdida (absurdo físico). Con `−` (`A_fs + A_bm − G_b − G_r`, la forma estándar de la literatura) la pérdida baja al subir la antena. La diapositiva trata `G_b`/`G_r` como "ganancia de altura" ("Ganancia de altura de la estación base y receptor móvil"): una ganancia positiva **resta** pérdida.

Evidencia numérica (f = 900 MHz, d = 2,5 km, h_b = 40 m, ciudad mediana; Hata de ciudad media como referencia):

| h_r | ECC-33 con **resta** (código) | ECC-33 con **suma** (diapositiva literal) | Hata |
|---|---|---|---|
| 1,8 m (fuera del rango 5-10 m del modelo) | 148,3 | 98,6 | 137,9 |
| 5 m | **129,7** | 117,2 | **129,7** |
| 10 m | **117,1** | 129,9 | **117,0** |

Con resta, ECC-33 coincide con Hata a < 0,1 dB; con suma, la tendencia en h_r se invierte y se aleja hasta 40 dB.

```python
from math import log10
def ecc(f_mhz,d,hb,hr,sign):
    f=f_mhz/1000; lf=log10(f); ld=log10(d)
    afs=92.45+20*ld+20*lf; abm=20.41+9.83*ld+7.894*lf+9.56*lf**2
    gb=log10(hb/200)*(13.958+5.8*ld**2); gr=(42.57+13.7*lf)*(log10(hr)-0.6)
    return afs+abm+sign*(gb+gr)
print(ecc(900,2.5,40,5,-1), ecc(900,2.5,40,5,+1))   # 129.7  117.2
```

**Acción para ti:** retira la instrucción "el código debe corregirse a suma". Anota que *la diapositiva imprime `+` pero es una convención de signo de G que, tomada literalmente, es físicamente inconsistente; el estudiante debe decidir con el profesor cómo defenderlo*. **No pidas a nadie cambiar `ecc33.ts`.**

## F3 -- Walfisch-Bertoni

Pág. 87 del PDF de 172 (imagen): `L = 89,55 + A + 21·log f + 38·log d − 18·log H − 18·log[ 1 − d²/(17H) ]`. Efecto del signo (f=900 MHz, H=28 m, b=50 m, hR=12 m, hm=1,8 m): ≈0 dB a 0,5 km, +0,13 dB a 2 km, **+0,82 dB a 5 km**. Además `1 − d²/(17H)` exige `d² < 17H` (con d en km, H en m); hay que validar el dominio. El estado en el repo: la corrección de código está planeada en `docs/plan-umts-dl-ci.md` (F0a) y **aún no aplicada**.

## F4 y F5 -- Carga UMTS (diap. 66, 67, 69, 72)

- Diap. 67 (imagen): `ρᵢ = 1 / (1 + W / (αᵢ·R_bᵢ·(Eb/N0)ᵢ))`; `η_UL = Σρᵢ·(1+i_oc)`; `N_j = η_UL,max / (ρ_j·(1+i_oc))`; `η_DL = Σ[ αᵢ·(Eb/N0)ᵢ·(R_bᵢ/W) ]·[(1−β)+i_other]`. **β no se define en el PDF.**
- Valores de ρ de voz (R=12,2 kbps, Eb/N0=5 dB, α=0,67, W=3,84 Mcps): ecuación impresa **0,00669** · código anterior (α dividiendo) 0,01477 · diap. 69 sin α **0,00995** · el curso dice **≈0,020** (diap. 69) y **0,0210** (diap. 72). Ninguno reproduce 0,0210. PS 64k/384k (α=1) sí coinciden (0,0357 / 0,137).
- Coherencia útil para la sustentación: con la ecuación impresa, `ρ_UL = L/(1+L)` con `L = α·R·(Eb/N0)/W`, la **misma** `L` del interior de η_DL; α reduce la carga en UL y DL. El código anterior hacía lo contrario en UL.
- Contraprueba (no es oráculo): con los coeficientes de la propia diap. 72 (`L = 148,0 + 34,1·log R`) el bucle de *cell breathing* converge a R = 1,04 km / η = 56 % con la ecuación impresa (antes: 1,00 km / 62 %; el curso imprime 1,07 km / 54 %).
- N_max UL: 10,33 (código viejo) → **12,62** (ecuación impresa); el curso imprime 9.
- Por qué "no convergía" la pantalla WCDMA: usaba Hata plano a 2100 MHz (rango 150-1500). Con COST-231-Hata converge. ✅ corregido (5634792).

## F6 -- Eb/N0 de PS 64 k

Diap. 66 (imagen): tabla con **Voz AMR 12,2 / 5,0 / 0,67**, **Video llamada 64 kbps / 4,0 / 1,0 (Gp 17,8 dB)**, **PS data 128 / 3,0**, **PS data 384 / 2,0**. Diap. 72: Voz, **PS 64k con 3,5**, PS 384k. El app usa los tres servicios de la diap. 72. No son "el mismo" servicio con dos valores: son dos tablas distintas del PDF; documentarlo como inconsistencia.

# 3. Cifras del curso que **no** se reproducen (registrar, no "arreglar")

| Dato | Curso | Recalculado | Causa conocida |
|---|---|---|---|
| A_c = B⁻¹(59 canales, 2 %) | 47 Erl (diap. 45) | 48,700 | Tabla de Erlang B redondeada |
| A_c = B⁻¹(70 canales, 2 %) | 57 Erl (diap. 46) | 59,129 | ídem |
| Celdas 2G por cobertura | 8 | 7 (50/π·1,508² = 6,998) | El curso redondea Sc a 7 km² |
| MAPL 1G | 141 dB (diap. 45) | 143 dB con su propia tabla (30+13−3+116−8−5) | **Sin explicar** (el 2G sí cuadra) |
| EIRP MS 2G | 30 dBm (diap. 46) | 27 dBm = Pt − body = 30 − 3 | La fila "EIRP MS = 30" contradice su propia tabla; el MAPL 133 dB solo sale con 27 |
| ρ de voz | 0,0210 | 0,00669 | Ver F5 |
| N_max UL | 9 | 12,62 | Consecuencia de ρ |
| R / η tras cell breathing | 1,07 km / 54 % | 1,04 km / 56 % (con la fórmula de la diapositiva) | La conversión U_celda→η no está en el material |

# 4. Qué espero que cambies en tus documentos

1. `docs/curso-referencia.md`: líneas de WB (`+` → `−`); ya corregidos Q y η_DL (revisa mi redacción).
2. `CURSO_CONTEXTO.md`: **retirar** la instrucción sobre ECC-33 (F2) y reescribirla como "inconsistencia de signo de la diapositiva"; actualizar el estado de Ikegami/WB/COST-231 WI (F7).
3. `PROPUESTA...md`: añadir el dato de la diap. 69 (F5), actualizar §0.2 y la API (F8), y marcar §1 como **resuelto en el repo**.
4. Reconciliar el alcance de Ericsson 9999 / Lee / 3GPP con el README del repo (F9) **tras verificar esas diapositivas como imagen**.
5. Cuando cites una ecuación, indica **página física + "leída como imagen"**.

# 5. Lo que **no** verifiqué (para que no lo des por bueno)

- Las secciones 5.2 (Lee), 5.9 (Ericsson 9999), 5.10 (3GPP TR 38.901) de `CURSO_CONTEXTO.md`: no las contrasté con imágenes.
- El origen del −2 dB del MAPL 1G.
- Cuál es la derivación exacta del 0,0210 de ρ de voz.
- Cuál es la intención del profesor con el signo `+` de ECC-33 (pregunta abierta para él).
