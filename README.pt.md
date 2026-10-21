# telecomm-propagation

[Español](README.md) · [English](README.en.md) · **Português**

Calculadora de modelos de perda de propagação em canais móveis (espaço livre, Hata, COST-231, ECC-33, Ikegami, Walfisch-Bertoni, COST-231 Walfish-Ikegami) desenvolvida em Expo/React Native. Projeto do curso de ênfase 2 *Análise de redes móveis* — Universidad del Cauca.

> Esta é uma tradução do [README em espanhol](README.md), que é a versão de referência. Os comentários do código-fonte, o `docs/curso-referencia.md` (a base de conhecimento do curso) e o próprio material do curso estão em espanhol. **A terminologia técnica em português ainda não foi revisada por um falante nativo.**

## Navegação do app

`Início` → `Ambiente` → `Calculadora` → `Comparação`, e separadamente `Início` → `Simulador de desvanecimento`, `Início` → `Planejamento celular` e `Início` → `Configurações` (veja `src/screens/RootNavigator.tsx`):

1. **Início**: três cards habilitados -- "Métodos empíricos de propagação" (perda de percurso), "Simulador de desvanecimento" (plano/seletivo e lento/rápido) e "Planejamento celular" -- e um botão ⚙ no canto superior direito que abre **Configurações** (tema e idioma).
2. **Ambiente**: escolha uma categoria da taxonomia de ambientes (`src/models/propagation/environments.ts`) -- ela determina quais modelos são aplicáveis.
3. **Calculadora**: o seletor de modelos mostra apenas os aplicáveis ao ambiente escolhido; os campos de geometria (largura da rua, altura dos edifícios etc.) só aparecem quando o modelo selecionado precisa deles.
4. **Comparação**: executa todos os modelos aplicáveis do ambiente com os mesmos parâmetros e os compara com a perda no espaço livre ("predição ideal"); o de menor distância é marcado como melhor ajuste. Abaixo dos cards, dois gráficos (`src/components/LineChart.tsx`, sobre `react-native-svg`) de perda vs. distância -- escala logarítmica e linear, todas as curvas sobrepostas, amostradas em 0.3-20 km com os demais parâmetros fixos.
5. **Simulador de desvanecimento** (`src/screens/FadingScreen.tsx`): a partir da frequência da portadora, dispersão de atraso (D, com chips de preset Rural/Suburbano/Urbano), velocidade do móvel, largura de banda do sinal e duração do símbolo (ou taxa de símbolo, convertível em Ts), calcula a largura de banda de coerência (Bc), o deslocamento Doppler (fd) e o tempo de coerência (Tc); classifica o canal como plano/seletivo em frequência e lento/rápido (seletivo no tempo), e posiciona o ponto de operação em uma das 5 zonas do plano BT/Bc vs. Ts/Tc (`src/components/FadingZoneChart.tsx`, gráfico de ponto sobre `react-native-svg`, não uma série de linhas -- diferente do `LineChart.tsx`).
6. **Planejamento guiado** (Planejamento celular → Planejamento guiado; `src/screens/PlanStartScreen.tsx`, `PlanWizardScreen.tsx`): um assistente passo a passo que reutiliza os modelos acima. **1G e 2G seguem a ordem do cálculo à mão** (slides 44-46): cenário → espectro e agrupamento → capacidade → cobertura → resultado → resumo; **3G é quase automático** (apenas área, usuários e Erlang por usuário; o resto vem do exemplo do curso). Cada tela mostra "Seu plano até agora" com o que já foi calculado, o modelo de propagação é escolhido pela frequência, e o plano **fica salvo neste dispositivo** (apenas as entradas; os resultados são recalculados ao abrir, então uma correção de modelo nunca deixa números antigos). A última tela resume o que o quebra-cabeça vai usar; ele **só lê** o plano e nunca o altera.
7. **Quebra-cabeça celular** (a partir do resumo do plano, "Ir ao quebra-cabeça"; `src/screens/CellPuzzleScreen.tsx`, `src/components/puzzle/`): quatro passos. (1) **Seu mapa**: envie uma imagem (arquivo, galeria no celular, arrastar ou colar com Ctrl+V na web; serve qualquer formato que o dispositivo saiba abrir) ou tire uma foto com a câmera (webcam no navegador, a traseira no celular, com botão para trocar); a imagem não é guardada. (2) **Linha de referência**: trace com o dedo ou o cursor uma linha que meça 1 km (0,5 / 2 / 5 km também); dela sai a escala de todo o jogo. (3) **Posicione a área**: a área S_T do plano (não pode ser alterada) é arrastada sobre o mapa; retângulo ou elipse, proporção e giro; se não couber na imagem, a tela diz exatamente quantos pixels faltam. (4) **Cubra a área**: cada toque coloca um agrupamento de N células que se encaixa sozinho na rede (cada cor é um grupo de frequências; a primeira peça fixa a rede); desfazer, reiniciar, dica e autocompletar. As estrelas são medidas contra o mínimo que o próprio jogo encontra (uma busca sobre rotações e posições, não uma demonstração): ★ cobrir toda a área, ★★ com no máximo 2 agrupamentos a mais, ★★★ igualar o mínimo; as dicas limitam a 2 estrelas e o autocompletar a 1. O resultado também mostra quantas células são realmente necessárias frente às do plano: a borda da área sempre pede células extras.

## Configurações: tema e idioma

O botão ⚙ do Início abre a tela de Configurações (`src/screens/SettingsScreen.tsx`), que reúne as duas preferências do usuário.

### Tema claro/escuro

Um switch de 3 posições (`🌙 Escuro` / `Auto` / `☀ Claro`) para escolher o modo diretamente, sem alternar em ciclo. "Auto" segue a preferência do sistema operacional/navegador (`useColorScheme`); uma escolha manual é salva com `@react-native-async-storage/async-storage` e lembrada entre sessões.

Os tokens de cor estão em [`src/theme/palette.ts`](src/theme/palette.ts), consumidos pelo hook `useTheme()` de [`src/theme/ThemeContext.tsx`](src/theme/ThemeContext.tsx). O **lilás neon (`#c084fc`) é idêntico nas duas paletas de propósito** -- é a cor de marca do app (o brilho do card do Início, a borda do modelo vencedor na Comparação) e não deve mudar conforme o tema. O que muda por tema é o `accentText` (texto legível na mesma família de roxos: escuro sobre fundo claro, claro sobre fundo escuro) -- usar o lilás puro como cor de texto falharia no contraste no modo claro.

### Idioma (Español / English / Português)

Uma lista de opções: `Automático (idioma do dispositivo)`, `Español`, `English`, `Português` -- cada idioma é sempre mostrado com o seu próprio nome, para que quem caiu no idioma errado consiga encontrar o seu. "Automático" usa o primeiro idioma suportado entre as preferências do dispositivo (`expo-localization`) e, se não houver nenhum, espanhol. A escolha é salva com AsyncStorage (mesma técnica do tema) e aplicada na hora, sem reiniciar; na web, o `<html lang>` também é atualizado.

**Como foi construído** (`src/i18n/`):

- `i18next` + `react-i18next`. O espanhol (`src/i18n/locales/es/`) é a fonte de verdade; `en/` e `pt/` são tipados contra a sua forma (`DeepStrings<typeof es>`), então **uma chave que falte ou sobre em qualquer idioma quebra o `npx tsc --noEmit`**. As chamadas `t('chave')` também são verificadas contra o espanhol.
- **Os modelos de cálculo continuam puros** (`src/models/**` e `src/utils/**` não importam React nem i18n; o vitest os executa sob Node). Em vez de lançar ou devolver textos em espanhol, eles produzem uma mensagem neutra quanto ao idioma -- uma chave mais parâmetros (`LocalizedError` / `LocalizedMessage`, em `src/utils/localizedMessage.ts`) -- e a UI a traduz com `translateMessage` / `translateError` (`src/i18n/translateMessage.ts`). O mesmo vale para os nomes de modelos, ambientes, zonas de desvanecimento e serviços WCDMA: os modelos só expõem um `id`, e o texto vive nos arquivos de idioma.
- Nomes técnicos, símbolos e unidades (Bc, fd, Eb/No, MAPL, km², dBm...) não são traduzidos. O `docs/curso-referencia.md` (a base de conhecimento do curso) é mantido em espanhol.
- **Entrada decimal permissiva**: os campos numéricos aceitam vírgula ou ponto independentemente do idioma escolhido (`parseDecimal`). Os resultados são sempre exibidos com ponto decimal.
- Há testes (`src/i18n/i18n.test.ts`) de que `en`/`pt` mantêm os mesmos `{{marcadores}}` que `es` em cada texto -- a única coisa que a verificação de tipos não enxerga -- e de que `translateMessage` resolve corretamente erros, avisos e plurais.

> **Nota sobre o português:** a tradução para o português não passou por revisão de um falante nativo -- a terminologia de telecomunicações (p. ex. *ERB* para estação rádio base, *link budget*, *desvanecimento*) convém ser validada antes de ser entregue como material de curso.

## Estado dos modelos

| Modelo | Estado | Faixa válida |
|---|---|---|
| Espaço livre (Friis) | ✅ Implementado | Qualquer `d, f > 0` |
| Okumura-Hata | ✅ Implementado | f: 150–1500 MHz, hb: 30–200 m, hm: 1–10 m, d: 1–20 km |
| COST-231 Hata | ✅ Implementado | f: 1500–2000 MHz, hb: 30–200 m, hm: 1–10 m, d: 1–20 km |
| ECC-33 | ✅ Implementado | f: 0–4000 MHz, hb: 20–200 m, hr: 5–10 m, d: 0–10 km |
| Ikegami | ✅ Implementado | f, d > 0; requer geometria de rua (veja abaixo). Sinais marcados `[OCR-verificar]` pela fonte do curso |
| Walfisch-Bertoni | ✅ Implementado | f: 300–3000 MHz, d: 0.2–5 km; requer geometria de edifícios (veja abaixo) |
| COST-231 Walfish-Ikegami | ✅ Implementado | Sem faixa numérica documentada; requer geometria de rua e de edifícios |

**Fora do escopo, decidido explicitamente:** Ericsson 9999 e Lee -- ambos tinham constantes no `docs/curso-referencia.md` que não coincidiram com várias fontes independentes ao serem verificadas (veja o registro da conversa do projeto), e foram excluídos em vez de implementados com dúvidas não resolvidas. O **3GPP TR 38.901** está na taxonomia de ambientes, mas ainda não foi implementado -- é um modelo muito maior (6 cenários, LOS/NLOS, unidades diferentes do resto do app) e foi deixado deliberadamente para outra sessão de trabalho.

Fora da sua faixa válida, um modelo **não bloqueia o cálculo**: mostra o resultado junto com um aviso de que é uma extrapolação. Um valor fisicamente impossível (frequência, distância ou altura ≤ 0) bloqueia o cálculo, porque as fórmulas dependem de `log10` e esse caso produziria um resultado sem sentido (`-Infinity`).

Todas as constantes e faixas dos modelos implementados são tiradas do [`docs/curso-referencia.md`](docs/curso-referencia.md) (base de conhecimento do curso, mantida pelo estudante e atualizada semanalmente) — não de fontes genéricas da internet. Quando uma constante do curso difere da fonte genérica usada originalmente (Hata, ECC-33), o comentário do arquivo correspondente documenta ambos os valores e por que se usa o do curso.

**Ikegami e Walfisch-Bertoni** precisam de parâmetros geométricos que os outros quatro modelos não usam (largura da rua, altura do edifício, orientação...), adicionados como campos **opcionais** em `PropagationInputs` -- veja `src/models/propagation/types.ts`. A UI só mostra esses campos quando o modelo correspondente está selecionado. Dois avisos explícitos sobre esses dois modelos, documentados no comentário de cada arquivo:

- **Ikegami** (`ikegami.ts`): a fonte do curso marca os sinais desta seção como `[OCR-verificar]` -- não foram rederivados de forma independente.
- **Walfisch-Bertoni** (`walfischBertoni.ts`): o parâmetro `H` ("altura da antena Tx sobre os edifícios próximos") foi interpretado como altura *acima* do nível dos telhados, não absoluta -- uma leitura de uma redação ambígua do curso, não um dado confirmado sem ambiguidade.

## Simulador de desvanecimento

Segunda funcionalidade do app (`src/screens/FadingScreen.tsx`, modelos em `src/models/fading/`), independente da calculadora de perda de percurso acima. Implementa o `docs/curso-referencia.md` §8 ("Canais multipercurso -- caracterização em banda larga"):

- **Bc ≈ 1/(2π·D)** -- largura de banda de coerência, a partir da dispersão de atraso D (§8.3). Presets Rural/Suburbano/Urbano tirados da tabela do §8.6.
- **fd = f0·(v/c)** -- deslocamento Doppler (§8.4).
- **Tc ≈ 9/(16π·fd)** -- tempo de coerência (§8.4). Um móvel estático (v = 0) dá Tc = +∞, mostrado como tal, não como erro.
- Classificação **plano/seletivo em frequência** (`BT` vs `Bc`) e **lento/rápido** (`Ts` vs `Tc`), e posicionamento em uma das **5 zonas** do §8.7 em `src/components/FadingZoneChart.tsx` (gráfico de ponto no plano `BT/Bc` vs `Ts/Tc`, escala log, não um gráfico de linhas).

Verificado numericamente contra os 3 exemplos resolvidos do curso (§8.8): D=2µs/f=900MHz/v=36km/h dá Bc≈80kHz e Tc≈6ms; com BT=25kHz e Ts=50µs cai na zona 2 (plano); com BT=200kHz e Ts=3.7µs (GSM) cai na zona 4 (seletivo em frequência).

**Zona 1 ("zona hachurada"), aviso explícito:** o curso nomeia essa zona no §8.7 ("a transmissão não é possível"), mas sua desigualdade exata vive em um diagrama que não sobreviveu à extração de texto do PDF -- **`[interpretación no verificada]`** (interpretação não verificada), como os `[OCR-verificar]` do `ikegami.ts`. A implementação (`src/models/fading/fading.ts`, função `classifyZone`) a marca como `BT·Ts < 1` (largura de banda insuficiente para a taxa de símbolo pedida, critério de Nyquist) **restrito ao quadrante plano/plano** (`BT < Bc` e `Ts < Tc`). Essa restrição não é cosmética: uma primeira versão aplicava `BT·Ts < 1` sem restringir e classificava errado o próprio exemplo GSM do curso (BT·Ts = 0.74 < 1, mas o curso diz zona 4) -- uma largura de banda ocupada menor que a taxa de símbolo é normal em modulações espectralmente eficientes (GMSK inclusive), não evidência de que a transmissão seja impossível.

## Próximas funcionalidades: planejamento e dimensionamento celular (propostas)

Inspiradas em um segundo PDF do curso, `Planificación de redes de comunicaciones móviles e inalámbricas.pdf` (24/04/2026, veja [`docs/curso-referencia.md`](docs/curso-referencia.md) §13) -- diferente do que já sustenta a calculadora de propagação e o simulador de desvanecimento acima. Em desenvolvimento no branch `feature/cellular-planning`: as 6 funcionalidades aprovadas (1, 2, 3, 4a, 5, 6) já estão implementadas e verificadas (veja o estado por linha abaixo); 4b, 7, 8 e 9 continuam `[PENDIENTE]` pelas razões já explicadas em cada linha.

**Convenção de estado:** ✅ **Aprovada** = teoria completa e sem ambiguidade, verificada contra pelo menos um exemplo numérico do curso -- pronta para implementar diretamente. 🚀 **Implementada** = já está no app (branch `feature/cellular-planning`), verificada com testes (`vitest`, veja [Verificação de tipos](#verificação-de-tipos)) e no navegador. 🕒 **[PENDIENTE]** (pendente) = falta informação (fórmula ambígua, sem verificação numérica, ou sem confirmação no material oficial) -- não implementar o cálculo ainda; deve aparecer na UI como funcionalidade futura (veja a nota de UI no fim desta seção), nunca como resultado numérico sem aviso.

| # | Funcionalidade | Estado | Por quê |
|---|---|---|---|
| 1 | Geometria celular e reuso de frequências | 🚀 Implementada | `src/models/geometry/`. Verificada contra N=7 → D=√21·R (§13.1, slide 23) |
| 2 | Erlang B -- dimensionamento por capacidade | 🚀 Implementada | `src/models/traffic/erlangB.ts`. Verificada contra os 3 exercícios do curso (§13.2) -- 2 das 3 cifras de referência estão ~3-4% desviadas da inversão contínua exata, documentado nos testes como arredondamento do curso, não erro |
| 3 | Ponte densidade de tráfego ↔ geometria (`p = B(ρ·Sc, K)`) | 🚀 Implementada | `src/models/traffic/density.ts`. Verificada contra ρ=30.77/500=0.0615 Erlang/km² (§13.2-13.3, slides 31-32) |
| 4a | Link budget com inversão MAPL → R, para Hata / COST-231-Hata | 🚀 Implementada | `src/models/propagation/{hata,cost231Hata,linkBudget}.ts`. Confirmado contra o PDF original que ambos os exemplos (1G e 2G) usam Okumura-Hata, não COST-231-Hata -- a inversão de distância é exata (§13.3, slides 45-46); a fórmula de MAPL a partir do orçamento de enlace reproduz o exemplo 2G exato, mas o 1G fica 2dB acima sem explicação no material, documentado como discrepância em aberto |
| 4b | Link budget com inversão MAPL → R, para Ikegami / Walfisch-Bertoni / COST-231 Walfish-Ikegami | 🕒 [PENDIENTE] | Herdam as ambiguidades já marcadas `[OCR-verificar]` em `ikegami.ts` / `walfischBertoni.ts`; falta confirmar que a inversão tem forma fechada |
| 5 | Fluxo de dimensionamento completo 1G/2G (capacidade vs. cobertura, tomar o máximo) | 🚀 Implementada | `src/models/dimensioning/`. O lado da capacidade coincide exato com ambos os exercícios (6 e 5 células); o lado da cobertura difere do curso (2 vs 3, 7 vs 8) como consequência direta da descoberta de MAPL de 4a, não um erro novo -- a conclusão qualitativa (1G limitado por capacidade, 2G por cobertura) coincide nos dois casos |
| 6 | Carga UMTS uplink + laço iterativo de *cell breathing* | 🚀 Implementada | `src/models/wcdma/`. Gp/sensibilidade/MAPL exatos para os 3 serviços; ρ exato para PS64k/PS384k; para voz usa-se a equação impressa no slide 67 (α multiplica no denominador): 0.00669, enquanto o curso declara 0.0210 (slide 72; o slide 69 escreve o exemplo sem α e dá 0.00995) -- nenhuma combinação dos dados fornecidos reproduz 0.0210, documentado sem forçar (uma versão anterior dividia por α, 0.0148, o oposto da física); a fórmula que conecta usuários/célula com a carga de saída na tabela de iterações do curso não está documentada -- foi implementado com a equação de carga padrão (amortecida para estabilidade numérica); com os coeficientes COST-231 do próprio slide converge para R≈1.04 km / η≈56 % (curso: 1.07 km / 54 %) |
| 7 | Carga UMTS downlink (η_DL) | 🕒 [PENDIENTE] | Variável `β` não definida no material extraído; sem exercício de verificação (§13.4-13.5) |
| 8 | Erlang C (modelo de fila) | 🕒 [PENDIENTE] | Não aparece no material do curso; aplicabilidade a canais de rádio (sistema de perda, não de fila) não confirmada |
| 9 | Engset / Erlang B estendido (com retentativas) | 🕒 [PENDIENTE] | Apenas no resumo da indústria (`erlang.com`), não em material oficial do curso |

### 1. Geometria celular e reuso de frequências -- ✅ Aprovada

**O que resolve:** dado um raio de célula R (ou o inverso), calcula o passo da rede d, a distância de reuso D, valida o tamanho de agrupamento N contra a lista de números rômbicos permitidos, a área do losango co-canal, o número de agrupamentos Q para cobrir uma área total, e a área por setor se for setorizada.

**Fórmulas:** veja [`docs/curso-referencia.md`](docs/curso-referencia.md) §13.1.

**Encaixe proposto:** módulo novo `src/models/geometry/` (mesmo padrão de `models/fading/`: `types.ts`, `geometry.ts`, `index.ts`) + tela `GeometryScreen.tsx`, nova entrada no `RootNavigator.tsx` e um terceiro card no `HomeScreen.tsx`.

**Validação:** `assertPositive` para R; N deve pertencer ao conjunto de números rômbicos válidos (rejeitar com mensagem clara se não, não apenas avisar).

**Verificação de referência:** N=7 → D=√21·R (slide 23).

### 2. Erlang B -- dimensionamento por capacidade -- ✅ Aprovada

**O que resolve:** a recursão de Erlang B (bloqueio dados K canais e tráfego A) e sua inversa (`A = B⁻¹(K,GoS)`, tráfego suportável dados K canais e GoS alvo; e `K = B⁻¹(A,GoS)` arredondando para cima, canais necessários dados tráfego e GoS).

**Fórmulas:** veja [`docs/curso-referencia.md`](docs/curso-referencia.md) §13.2. Usar a forma recursiva, não a fatorial (estoura numericamente).

**Encaixe proposto:** `src/models/traffic/erlangB.ts` (+ `types.ts`, `index.ts`) + tela `TrafficScreen.tsx` com seletor de "o que resolver" (bloqueio / canais / tráfego), semelhante aos chips de preset do simulador de desvanecimento.

**Validação:** `assertPositive` para A e K; GoS deve estar em (0,1); K deve ser inteiro (arredondar para cima na inversa).

**Verificação de referência:** `B⁻¹(59, 0.02) = 47 Erlang/célula` (slide 45); `B⁻¹(70, 0.02) = 57 Erlang/célula` (slide 46); `B⁻¹(42, 0.01) = 30.77 Erlang/célula` (slide 31).

### 3. Ponte densidade de tráfego ↔ geometria -- ✅ Aprovada

**O que resolve:** `p = B(ρ·Sc, K)` -- dada a densidade de tráfego ρ (Erlang/km², normalmente proveniente de uma densidade de usuários e tráfego/usuário) e a área da célula Sc (da funcionalidade 1), calcula o bloqueio com K canais; ou, inversamente, a densidade máxima suportável para um GoS alvo.

**Encaixe proposto:** não precisa de módulo próprio -- é uma combinação das funcionalidades 1 e 2; pode viver como uma tela `DensityScreen.tsx` que importa `models/geometry` e `models/traffic/erlangB`, ou como um modo adicional dentro de `TrafficScreen.tsx`.

**Verificação de referência:** slide 28 (definição) e slides 31-32 (exemplo com ρ=30.77/500=0.0615 Erlang/km²).

### 4a. Link budget com inversão MAPL → R (Hata / COST-231-Hata) -- ✅ Aprovada

**O que resolve:** hoje o `CalculatorScreen` só calcula L(d) dado d. Esta funcionalidade recebe um link budget completo (potência da MS, ganhos de antena, body loss, perda no feeder, sensibilidade da ERB, margem de sombreamento, margem de interferência -- a mesma tabela de parâmetros dos slides 45-46) e calcula o MAPL, depois inverte Hata/COST-231-Hata (lineares em log10(d)) para obter R_max.

**Encaixe proposto:** adicionar uma função `solveDistanceKm(inputs, targetLossDb): number` a `hata.ts` e `cost231Hata.ts` (álgebra direta: isolar `log10(d)` da equação já implementada em `calculate()`), um tipo `LinkBudgetInputs` novo, e uma tela `LinkBudgetScreen.tsx` com a tabela de parâmetros e o resultado R_max.

**Validação:** reutilizar `assertPositive`; o MAPL resultante deve ser positivo (potência EIRP > sensibilidade, senão um erro claro de "sem margem de enlace").

**Verificação de referência:** MAPL=141 dB → R=2.5 km (slide 45, Okumura-Hata urbano); MAPL=133 dB → R=1.5 km (slide 46).

### 4b. Link budget com inversão MAPL → R (Ikegami / Walfisch-Bertoni / COST-231 WI) -- 🕒 [PENDIENTE]

**O que falta:** esses três modelos já carregam avisos próprios (`[OCR-verificar]` em Ikegami, interpretação não confirmada de `H` em Walfisch-Bertoni). Antes de invertê-los é preciso confirmar (a) que a fórmula base está correta, e (b) que é invertível em forma fechada para R com os demais parâmetros geométricos fixos (não é evidente para Walfisch-Bertoni, que mistura `log10(d)` com `log10(1 + d²/(17H))`).

**Tratamento no app enquanto isso:** na `LinkBudgetScreen.tsx`, o seletor de modelo deve **excluir** esses três (ou mostrá-los desabilitados com o rótulo "Em breve -- pendente de confirmar invertibilidade"), assim como o estado de cada modelo já é documentado na tabela "Estado dos modelos" acima.

### 5. Fluxo de dimensionamento completo 1G/2G -- ✅ Aprovada

**O que resolve:** compõe 1, 2 e 4a no fluxo exato dos exercícios do curso: tráfego total → células por capacidade (via 2) → link budget → células por cobertura (via 4a) → resultado = máximo de ambas. É, em essência, uma calculadora que resolve a tarefa do slide 75 do PDF (entrega em 5 de maio) para 1G e 2G.

**Encaixe proposto:** tela `DimensioningScreen.tsx` que orquestra os módulos anteriores e apresenta o resultado como a tabela do slide 32 (raio, # células, área, canais/célula, tráfego/célula, densidade, # assinantes por etapa).

**Verificação de referência:** tabela completa do slide 32 (4 etapas de divisão celular) e os dois exercícios dos slides 44-46.

### 6. Carga UMTS uplink + *cell breathing* -- ✅ Aprovada

**O que resolve:** o equivalente da funcionalidade 5 para 3G/UMTS, onde capacidade e cobertura são acopladas pela carga da célula em vez de serem independentes. Implementa Gp, ρ_i, η_UL e o laço iterativo MAPL_efetivo → R → usuários → η, até convergir.

**Encaixe proposto:** módulo independente `src/models/wcdma/` (matemática diferente do Erlang B -- carga contínua, não canais discretos) + tela `WcdmaLoadScreen.tsx` que mostra a tabela de iterações como no slide 73 (coluna por iteração: carga, MAPL_ef, R, área, usuários, ΔR) até a convergência.

**Validação:** η deve convergir para menos de 1 (carga instável se não); iterar com um limite máximo de iterações e informar se não converge.

**Verificação de referência:** exercício completo dos slides 71-74 (converge em 3 iterações para R=1.07 km, η=54%).

### 7. Carga UMTS downlink (η_DL) -- 🕒 [PENDIENTE]

**O que falta:** a variável `β` da fórmula extraída não está definida no material (§13.4-13.5), e nenhum exercício do curso a exercita numericamente. Implementá-la agora significaria adivinhar uma convenção da literatura (fator de ortogonalidade) sem poder verificá-la contra o curso.

**Tratamento no app enquanto isso:** a `WcdmaLoadScreen.tsx` deve mostrar apenas o resultado de uplink, com uma nota explícita "Downlink: pendente de confirmar a definição de β contra o material do curso -- não implementado."

### 8. Erlang C -- 🕒 [PENDIENTE]

**O que falta:** confirmação do professor sobre se o curso o cobre, e em que contexto de dimensionamento de canais de rádio um modelo de fila se aplicaria (os canais de rádio neste curso são todos de perda pura, não de espera).

**Tratamento no app enquanto isso:** não incluir como opção na `TrafficScreen.tsx`; se for adicionado depois, deve ir em um módulo separado (`erlangC.ts`) para não misturar um modelo não confirmado com o Erlang B (que está confirmado).

### 9. Engset / Erlang B estendido -- 🕒 [PENDIENTE]

**O que falta:** igual ao 8 -- não aparecem em nenhum material oficial carregado até agora, apenas no resumo da indústria do `erlang.com`.

### Nota de UI para funcionalidades [PENDIENTE]

Nenhuma funcionalidade marcada 🕒 [PENDIENTE] deve produzir um resultado numérico no app -- mostrá-la, se for adicionada à UI antes de resolver a lacuna, como um card ou modelo **desabilitado** com o rótulo "Em breve", seguindo o mesmo critério que a tabela "Estado dos modelos" acima já aplica a um modelo não implementado. Isso provavelmente implica estender o `HomeScreen.tsx` de dois cards fixos para uma lista de cards orientada a dados com um campo `status: 'enabled' | 'coming-soon'`, em vez de adicionar um terceiro bloco JSX quase idêntico a cada funcionalidade nova.

## Pré-requisitos

- **Node.js**: `^20.19.4 || ^22.13.0 || ^24.3.0 || >=25.0.0` (exigido pelo React Native 0.86; verificado em `node_modules/react-native/package.json`).
- **npm** (incluído com o Node). O projeto usa `package-lock.json`, não `yarn.lock` nem `pnpm-lock.yaml`.
- Para testar em um celular físico: o app **Expo Go** ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)), na mesma rede Wi-Fi do computador.
- Para compilar nativo (opcional, desnecessário para desenvolver com Expo Go):
  - Android: Android Studio + SDK.
  - iOS: Xcode (somente macOS).

## Instalação

```bash
git clone https://github.com/SteamedPotato69/telecomm-propagation.git
cd telecomm-propagation
npm install
```

## Abrir e executar no VS Code

1. **File → Open Folder…** e selecione a raiz do repositório (onde está o `package.json`). Não abra um subdiretório.
2. Abra o terminal integrado: **Terminal → New Terminal** (ou `` Ctrl+` ``).
3. Execute os comandos de [Instalação](#instalação) e [Execução](#execução) nesse terminal.

Extensão opcional: **Expo Tools** (publicador Expo) para snippets e suporte ao `app.json`. O suporte a TypeScript/JSX já vem integrado ao VS Code, sem configuração adicional.

Não há `launch.json` configurado para depuração com breakpoints nativos do VS Code -- isso exige configuração à parte, ainda não coberta. Para testar a calculadora, `npm run web` ou Expo Go é suficiente.

## Execução

```bash
# Servidor de desenvolvimento do Expo (escolha a plataforma no menu interativo)
npm start

# Diretamente em uma plataforma:
npm run web       # navegador, http://localhost:8081
npm run android   # emulador Android ou dispositivo com Expo Go
npm run ios       # simulador iOS (somente macOS) ou dispositivo com Expo Go
```

Com `npm start` ou `npm run android`/`ios`, o Expo mostra um código QR: escaneie-o com o app Expo Go para abrir o projeto em um dispositivo físico.

## Empacotar como app de desktop (Windows, opção simples)

Um iniciador leve para Windows: gera o build web estático e o serve localmente, abrindo o navegador padrão automaticamente. Não é um app nativo empacotado (isso -- Electron/Tauri ou um `.exe` com Node embutido -- fica como possível próximo passo); isso pressupõe que a máquina que o executa já tenha o Node.js instalado.

```bash
npm run build:web       # gera dist/ (build estático do Expo para web)
```

Depois, para iniciá-lo:

- Dando um duplo clique em [`desktop/iniciar-app.bat`](desktop/iniciar-app.bat) -- gera o build se faltar, sobe o servidor e abre o navegador sozinho.
- Ou manualmente: `npm run start:desktop` (equivalente a `node desktop/serve.js`).

Detalhes do [`desktop/serve.js`](desktop/serve.js): servidor HTTP estático sem dependências externas (apenas módulos nativos do Node), porta `4173` por padrão (configurável com a variável de ambiente `PORT`), com proteção contra path traversal e um *fallback* para `index.html` em rotas sem extensão. Abre o navegador somente depois de o servidor já estar escutando, para evitar uma corrida entre "abrir o navegador" e "o servidor responder".

`dist/` é um artefato de build (já está no `.gitignore`) -- é regenerado com `npm run build:web`, não é versionado.

## EAS (Expo Application Services)

O projeto já está vinculado a um projeto EAS existente (veja `app.json`):

- `projectId`: `d49ee7fe-6cb5-470f-9bae-664c6e548834`
- `owner`: `latriassona` (organização no Expo, não uma conta pessoal)
- `slug`: `telecomm` -- diferente do nome do pacote (`telecomm-propagation`); adotou-se o slug que já existia nesse projeto EAS em vez de renomeá-lo no lado do servidor.

Isso **não é necessário para desenvolvimento local** (`npm run web` / Expo Go não o exigem). Só importa se você for compilar nativo ou publicar atualizações OTA:

```bash
npm install --global eas-cli
eas login     # conta com acesso à organização "latriassona"
eas whoami    # verifica qual conta ficou ativa
```

Se a sua conta não tiver acesso a "latriassona", `eas build`/`eas update` vão falhar com um erro de permissão -- é preciso pedir para ser adicionado à organização antes.

### Gerar um APK para testar em um dispositivo

```bash
eas build --platform android --profile preview
```

Executa na nuvem (não exige Android Studio nem SDK local); ao terminar, o terminal mostra um link de download do `.apk`. Instale-o diretamente no celular (fora do Google Play, então o Android vai pedir para permitir "instalar apps de origem desconhecida" na primeira vez).

Não use o perfil `production` para isso: gera um `.aab`, feito para enviar à Play Store, não instalável diretamente.

## Verificação de tipos

```bash
npx tsc --noEmit
```

Além do código, isso verifica que as três traduções tenham exatamente as mesmas chaves e que cada `t('chave')` da UI exista.

## Testes

```bash
npx vitest run
```

Escopo limitado a `src/models/**`, à persistência do plano em `src/storage/` (com um armazenamento em memória injetado) e aos *dados* de tradução em `src/i18n/` (mais o `translateMessage`): esse código não importa nada de `react-native`/Expo, então roda sob Node sem precisar de mocks de RN/jsdom (o teste de i18n cria sua própria instância do `i18next` em vez de importar `src/i18n/index.ts`, que precisa do `expo-localization`). Cobre as funcionalidades de planejamento celular (geometria, Erlang B, link budget) -- os modelos originais de propagação e desvanecimento ainda são verificados apenas a olho no navegador (veja [Trabalho futuro](#trabalho-futuro)).

## Estrutura do projeto

```
App.tsx                          # ponto de entrada; renderiza RootNavigator
src/
  models/propagation/
    types.ts                     # PropagationInputs/Result/Warning, contrato PropagationModelDefinition, GeometryFieldKey
    environments.ts              # ENVIRONMENT_CATEGORIES: taxonomia de ambientes -> modelos aplicáveis
    freeSpace.ts                 # modelo de espaço livre (Friis)
    hata.ts                      # Okumura-Hata (urbano/suburbano/rural)
    cost231Hata.ts               # COST-231 Hata
    ecc33.ts                     # ECC-33
    ikegami.ts                   # Ikegami (requer geometria de rua)
    walfischBertoni.ts           # Walfisch-Bertoni (requer geometria de edifícios)
    cost231WalfishIkegami.ts     # COST-231 Walfish-Ikegami (combina Ikegami + Walfisch-Bertoni)
    linkBudget.ts                # calculateMapl(): MAPL a partir de um orçamento de enlace completo (§13.3)
    sampleSeries.ts               # avalia um modelo sobre uma faixa de distâncias, para os gráficos
    registry.ts                  # registro: PROPAGATION_MODELS / PROPAGATION_MODEL_LIST
    modelSelection.ts            # recommendInvertibleModel(f): escolhe o modelo cuja faixa de frequência se encaixa
    index.ts                     # barrel
  models/fading/
    types.ts                     # FadingInputs/Result, FadingZone
    fading.ts                    # calculateFading(): Bc, fd, Tc, classificação e as 5 zonas (§8.7)
    environments.ts              # DELAY_SPREAD_PRESETS: presets Rural/Suburbano/Urbano (§8.6)
    index.ts                     # barrel
  models/geometry/                # planejamento celular (§13.1) -- branch feature/cellular-planning
    types.ts                     # GeometryInputs/Result
    rhombicNumbers.ts            # tabela de exemplo + isValidRhombicNumber (N=i²+ij+j²)
    geometry.ts                  # calculateCellularGeometry(): rede hexagonal, reuso, Q
    index.ts                     # barrel
  models/traffic/                 # planejamento celular (§13.2-13.3) -- branch feature/cellular-planning
    erlangB.ts                   # erlangBBlocking / erlangBInverseTraffic / erlangBInverseChannels
    density.ts                   # ponte densidade de tráfego <-> geometria (p = B(ρ·Sc, K))
    index.ts                     # barrel
  models/dimensioning/             # planejamento celular (§13.3) -- branch feature/cellular-planning
    types.ts                     # DimensioningInputs/Result
    dimensioning.ts               # calculateDimensioning(): orquestra traffic + propagation, max(capacidade, cobertura)
    index.ts                     # barrel
  models/wcdma/                    # planejamento celular (§13.4) -- branch feature/cellular-planning
    types.ts                     # ServiceMix/Load, WcdmaLoadInputs/Result, WcdmaIterationStep
    presets.ts                   # DEFAULT_SERVICE_MIX: mix do exercício do curso (70% voz / 20% PS64k / 10% PS384k)
    wcdma.ts                      # calculateServiceLoad, calculateWcdmaUplinkLoad (laço de cell breathing amortecido)
    index.ts                     # barrel
  models/plan/                     # motor do plano 1G/2G/3G (puro) -- branch feature/cell-puzzle
    frequencyPlan.ts             # canais por célula: 1G 416 -> 59; 2G 40 portadoras -> 10 TRX -> 70 TCH (slides 44-46)
    plan1g2g.ts                  # cenário -> espectro -> capacidade -> cobertura -> resultado, na ordem "a lápis"
    plan3g.ts                    # 3G automático: 3 entradas, o resto padrões do curso (repete com passo menor se o laço oscilar)
    gameMission.ts               # GameMission: a única coisa que o quebra-cabeça lê do plano (somente leitura)
    presets.ts                   # COURSE_1G / COURSE_2G: o exemplo resolvido do curso
  models/layout/                   # geometria do quebra-cabeça (puro) -- branch feature/cell-puzzle
    hexGrid.ts                   # células hexagonais em coordenadas axiais (d = R·√3, Sc = 3√3/2·R²)
    clusterLattice.ts            # o agrupamento de N células como peça: N cores, ímã na rede co-canal (distância D)
    areaShape.ts                 # a área S_T como forma móvel de superfície exata
    scale.ts                     # linha de referência (1 km por padrão) -> pixels por km; a área cabe na imagem?
    coverage.ts                  # cobertura por amostragem da área
    autoTiling.ts                # mínimo de agrupamentos que cobrem a área (referência para estrelas e dicas)
    areaPlacement.ts             # onde a área fica sobre a imagem (centro em pixels), ajuste à imagem, dá para jogar?
    placement.ts                 # redutor das peças colocadas: a primeira fixa a rede; desfazer, dicas, autocompletar
    puzzle.ts                    # cores por grupo, estrelas, dica e autocompletar
  utils/
    validation.ts                # assertPositive, assertNonNegative, assertUnitInterval, assertInteger, rangeWarningMessage, parseDecimal, requireField
    localizedMessage.ts          # LocalizedError / LocalizedMessage: erros e avisos neutros quanto ao idioma (chave + parâmetros)
    format.ts                    # formatPathLoss, formatCoherenceBandwidth, formatDopplerShift, formatCoherenceTime
  components/
    NumericField.tsx             # campo numérico controlado (unit opcional para parâmetros sem unidade)
    ModelSelector.tsx            # seletor de modelo (chips), genérico sobre {id,label,disabled}
    ResultPanel.tsx              # resultado + avisos + erros
    LineChart.tsx                 # gráfico de linhas sobre react-native-svg (eixo linear ou log)
    FadingResultPanel.tsx        # Bc/fd/Tc + classificação plano-seletivo / lento-rápido
    FadingZoneChart.tsx          # gráfico de ponto BT/Bc vs Ts/Tc sobre react-native-svg (não LineChart)
    GlowCard.tsx                 # card com brilho neon (cards de nível superior no Início)
    SegmentedControl.tsx         # switch de poucas opções curtas (modo de tema)
    BackButton.tsx               # botão de voltar (somente seta, alvo de toque de 48dp)
    plan/                        # peças do assistente: PlanShell (progresso + Anterior/Próximo), PlanLedger, PlanNumberField, passos 1G/2G e 3G, SummaryStep
    puzzle/                      # quebra-cabeça: carga de imagem e câmera, MapCanvas (imagem + SVG + gestos), passos linha/área/jogo, resultado
    ListCard.tsx                 # card de lista simples (telas hub: Ambiente, Planejamento celular)
    GeometryResultPanel.tsx      # resultado de geometria celular
    TrafficResultPanel.tsx       # resultado genérico de um único número (Erlang B / densidade)
    LinkBudgetForm.tsx           # bloco de ~8 campos de orçamento de enlace, compartilhado entre telas
    LinkBudgetResultPanel.tsx    # EIRP / MAPL / raio máximo da célula
    DimensioningResultPanel.tsx  # tabela por etapas: capacidade / cobertura / resultado final
    WcdmaResultPanel.tsx          # carga por serviço, usuários simultâneos, rastro de convergência
  screens/
    RootNavigator.tsx            # estado de navegação (union Route, um case por tela)
    HomeScreen.tsx                # cards de nível superior, orientado a dados + botão de Configurações
    SettingsScreen.tsx            # configurações: tema e idioma
    PlanStartScreen.tsx           # planejamento guiado: escolher 1G/2G/3G, continuar ou recomeçar
    PlanWizardScreen.tsx          # os passos do assistente (1G/2G e 3G)
    CellPuzzleScreen.tsx          # o minijogo: imagem -> linha -> área -> jogo (só lê a missão do plano)
    EnvironmentScreen.tsx         # seletor de ambiente
    CalculatorScreen.tsx          # formulário + resultado, filtrado por ambiente
    ComparisonScreen.tsx          # visão "versus" entre todos os modelos do ambiente
    geometryFieldConfig.ts        # unidade/padrão por cada GeometryFieldKey (rótulo e ajuda: i18n `geometryFields.*`)
    FadingScreen.tsx              # simulador de desvanecimento: formulário + resultado + gráfico de zona
    CellularHubScreen.tsx        # hub de planejamento celular -- branch feature/cellular-planning
    GeometryScreen.tsx            # idem
    TrafficScreen.tsx             # idem (modos Bloqueio/Tráfego/Canais/Densidade)
    LinkBudgetScreen.tsx          # idem
    DimensioningScreen.tsx        # idem (capacidade + cobertura, orquestra 1, 2 e 4a)
    WcdmaLoadScreen.tsx           # idem (carga UMTS uplink + cell breathing)
  i18n/
    index.ts                     # inicializa o i18next (idioma do dispositivo) e reexporta o módulo
    languages.ts                 # Language, nomes nativos, detecção do idioma do dispositivo
    LocaleContext.tsx            # LocaleProvider + useLocale(); persistência com AsyncStorage, <html lang> na web
    translateMessage.ts          # translateMessage / translateError: LocalizedMessage -> texto
    i18next.d.ts                 # tipa t('chave') contra o espanhol
    locales/{es,en,pt}/          # textos por idioma (core, propagation, calculator, fading, cellular); es é a fonte de verdade
  plan/
    PlanContext.tsx              # PlanProvider + usePlan1g2g/usePlan3g: plano salvo, salvamento com atraso, nunca sobrescreve o salvo antes de terminar de carregar
  storage/
    planStore.ts                 # persistência versionada do plano (entradas + passo + instantâneo); tolera dados corrompidos
  theme/
    palette.ts                    # tokens de cor claro/escuro; accent (lilás neon) é constante nos dois
    ThemeContext.tsx               # ThemeProvider + useTheme(); persistência com AsyncStorage
```

## Como adicionar um novo modelo de propagação

1. Criar `src/models/propagation/meuModelo.ts` que exporte uma função `calculate(inputs: PropagationInputs): PropagationResult` e um objeto `PropagationModelDefinition` (veja `freeSpace.ts` como modelo mínimo ou `hata.ts` para um com validação de faixa e correção por ambiente).
2. Usar `assertPositive` para qualquer valor que entre em um `log10`, `rangeWarningMessage` para a faixa empírica do modelo, e `requireField` para qualquer parâmetro geométrico opcional que o modelo precise. Esses helpers (e qualquer erro próprio, via `LocalizedError`) recebem **chaves** de tradução (`fields.*`, `errors.*`), não texto: o modelo não escreve em nenhum idioma.
3. Se o modelo precisar de um parâmetro geométrico que o `PropagationInputs` ainda não tem, estendê-lo ali como campo **opcional**, adicioná-lo ao `GeometryFieldKey`, e declarar `extraFields` no `PropagationModelDefinition` -- isso é tudo o que é preciso para o `CalculatorScreen` mostrar o campo certo automaticamente, sem mexer na UI.
4. Registrar o modelo em `src/models/propagation/index.ts` (`PROPAGATION_MODELS` e `PROPAGATION_MODEL_LIST`).
5. Adicionar o modelo a `applicableModelIds` da(s) categoria(s) de `environments.ts` onde se aplique.
6. Adicionar `models.<id>` (`label`, `shortLabel`, `citation`) nos três idiomas de `src/i18n/locales/` (e as chaves `fields.*` / `errors.*` novas que usar) -- o `tsc` avisa se faltar alguma.

Não é preciso mexer diretamente nos componentes de UI: eles leem o registro e a taxonomia dinamicamente.

## Trabalho futuro

- Estender a cobertura do `vitest` (introduzido para os modelos de planejamento celular, veja [Verificação de tipos](#verificação-de-tipos)) aos modelos originais de propagação e desvanecimento -- hoje só têm um teste de fumaça (`freeSpace.test.ts`), o resto continua verificado apenas a olho no navegador. Usar valores de referência resolvidos à mão ou em aula -- **não** buscados em fontes genéricas da internet (veja `docs/curso-referencia.md` §5.2 para o exercício pendente de resolver que serviria de caso de teste).
- Implementar o 3GPP TR 38.901 (6 cenários, LOS/NLOS, unidades em GHz/metros) -- deliberadamente fora desta rodada pelo tamanho.
- Os gráficos da comparação amostram uma faixa fixa de distâncias (0.3-20 km) independente da faixa de validade documentada de cada modelo -- uma curva pode se estender visualmente além de onde o modelo é validado, como os avisos de faixa na calculadora já toleram. Vale a pena marcar visualmente esse trecho se ficar confuso na prática.
- Simulador de desvanecimento: a desigualdade exata da "zona hachurada" (zona 1, §8.7) não está no texto extraído do curso -- veja o aviso `[interpretación no verificada]` em `src/models/fading/fading.ts`. Se o estudante conseguir o diagrama original, vale a pena revisar o critério implementado (`BT·Ts < 1` restrito ao quadrante plano/plano) contra a desigualdade real.

## Licença

Veja [LICENSE](LICENSE).
