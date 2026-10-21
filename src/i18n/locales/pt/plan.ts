import type { DeepStrings } from '../types';
import type { planTexts as esPlan } from '../es/plan';

export const planTexts: DeepStrings<typeof esPlan> = {
  plan: {
    start: {
      title: 'Planejamento guiado',
      subtitle:
        'Siga a mesma ordem de quando se faz à mão: cada passo usa o que foi calculado no anterior, e tudo fica salvo neste dispositivo.',
      privacy: 'Seu plano é salvo somente neste dispositivo.',
      generation: {
        g1: { title: '1G — AMPS', subtitle: 'Analógico, FDMA. Canais de 30 kHz e agrupamento típico N=7.' },
        g2: { title: '2G — GSM', subtitle: 'Digital, TDMA. Portadoras de 200 kHz com 7 canais de tráfego cada.' },
        g3: { title: '3G — UMTS', subtitle: 'Quase automático: só três dados e o resto é calculado para você.' },
      },
      savedStatus: 'Plano salvo · passo {{step}} de {{total}}',
      savedCells_one: '{{count}} célula no seu plano',
      savedCells_other: '{{count}} células no seu plano',
      noResult: 'Ainda sem resultado final',
      begin: 'Começar com o exemplo do curso',
      continue: 'Continuar',
      restart: 'Recomeçar',
      restartConfirm: 'Toque de novo para apagar este plano e voltar ao exemplo do curso',
      changed: 'Com os modelos atuais este plano dá {{now}} células (quando você o salvou dava {{before}}).',
      saveFailed: 'Não foi possível salvar neste dispositivo: seu plano continua aqui enquanto o app estiver aberto.',
    },

    shell: {
      stepOf: 'Passo {{step}} de {{total}}',
      previous: 'Anterior',
      next: 'Próximo',
      advanced: 'Avançado',
      invalidNumber: 'Digite um número válido: enquanto isso usa-se o último valor correto.',
      ledgerTitle: 'Seu plano até agora',
    },

    constraint: {
      capacity: 'Capacidade',
      coverage: 'Cobertura',
    },

    ledger: {
      totalArea: 'Área a cobrir (S_T)',
      totalTraffic: 'Tráfego total (A_T)',
      clusterSize: 'Agrupamento (N)',
      totalChannels: 'Canais na banda',
      channelsPerCell: 'Canais por célula (K)',
      carriers: 'Portadoras na banda',
      transceiversPerCell: 'Transceptores por célula',
      trafficPerCell: 'Tráfego por célula (A_c)',
      cellsByCapacity: 'Células por capacidade',
      propagationModel: 'Modelo de propagação',
      mapl: 'Perda máxima permitida (MAPL)',
      cellRadius: 'Raio da célula (R)',
      cellArea: 'Área da célula (π·R²)',
      cellsByCoverage: 'Células por cobertura',
      cellsFinal: 'Células do plano',
      bindingConstraint: 'Fator limitante',
      maxUsersPerCell: 'Usuários simultâneos máx. por célula',
      convergedRadius: 'Raio convergido (R)',
      convergedLoad: 'Carga convergida (η)',
      nodeBsByCoverage: 'NodeBs por cobertura',
      nodeBsByCapacity: 'NodeBs por capacidade',
    },

    steps: {
      scenario: {
        title: 'Cenário',
        intro: 'Quanta área é preciso cobrir e quanto tráfego as pessoas geram na hora de pico.',
        users: 'Usuários ativos na hora de pico',
        erlangPerUser: 'Tráfego por usuário',
        gosHelper: 'Fração entre 0 e 1: 0.02 significa 2 % de chamadas bloqueadas.',
        result: 'Tráfego total = usuários × Erlang por usuário = {{value}} Erlang.',
      },
      spectrum: {
        title: 'Espectro e agrupamento',
        intro1g: 'O AMPS divide o espectro em canais de 30 kHz. Cada agrupamento de N células usa todos os canais uma vez.',
        intro2g: 'O GSM divide o espectro em portadoras de 200 kHz; cada portadora leva vários canais de tráfego.',
        clusterHelper: 'N maior = menos interferência entre células que reutilizam frequências, mas menos canais por célula.',
        carrierWidth: 'Espaçamento entre portadoras',
        controlHelper: 'O curso não desconta canais de controle. No AMPS real são 21 por operadora [contexto de indústria].',
        tchHelper: 'O curso usa 7: assume-se que uma das 8 janelas de tempo da portadora leva sinalização.',
        result1g: 'A banda tem {{total}} canais; com N={{n}} cada célula fica com {{perCell}}.',
        result2g: '{{carriers}} portadoras → {{trx}} por célula × {{tch}} canais de tráfego = {{perCell}} canais por célula.',
      },
      capacity: {
        title: 'Capacidade',
        intro: 'Com K canais por célula e o GoS pedido, o Erlang B diz quanto tráfego cada célula suporta.',
        formula: 'A_c = B⁻¹(K, GoS)',
        note: 'Uma tabela impressa de Erlang B pode dar um valor um pouco diferente: aqui o cálculo é exato.',
      },
      coverage: {
        title: 'Cobertura',
        intro: 'O orçamento de enlace dá a perda máxima permitida (MAPL); com ela o modelo de propagação dá o raio da célula.',
        modelAuto: 'Modelo escolhido pela frequência: {{model}}',
        advancedIntro: 'Vêm do exemplo do curso. Você pode mudá-los, mas não é preciso.',
      },
      result: {
        title: 'Resultado',
        intro: 'O número de células é o maior entre o que a capacidade pede e o que a cobertura pede.',
        cellsTitle: 'Células necessárias',
        bindingCapacity: 'Manda a capacidade: são necessárias mais células para atender todo o tráfego.',
        bindingCoverage: 'Manda a cobertura: são necessárias mais células para chegar a toda a área.',
      },
      summary: {
        title: 'Resumo para o quebra-cabeça',
        intro: 'Isto é o que o minijogo vai usar. Ele só lê: não muda o seu plano.',
        play: 'Ir ao quebra-cabeça',
        unavailable: 'O plano 3G não tem um número final de NodeBs (o cálculo não convergiu), então o jogo não pode começar.',
      },
      scenario3g: {
        title: 'Cenário 3G',
        intro:
          'Só três dados. O resto (mix de serviços 70/20/10, orçamento de enlace, carga alvo, banda de 2100 MHz) vem do exemplo do curso e é calculado para você.',
        advancedIntro: 'Valores do exemplo do curso. Você pode mudá-los, mas não é preciso.',
        targetLoadHelper: 'Fração entre 0 e 1: 0.5 é planejar com 50 % da carga máxima.',
      },
      result3g: {
        title: 'Resultado 3G',
        intro: 'Calculado para você: ganho de processamento, carga por serviço e o laço de cell breathing até o raio se estabilizar.',
        smallerStep: 'Com o passo de cálculo padrão o laço oscilava: foi repetido com um passo menor ({{step}}), que chega ao mesmo ponto.',
        minByCapacity: 'No mínimo são necessários {{count}} NodeBs por capacidade.',
        bindingCapacity: 'Manda a capacidade: são necessários mais NodeBs para atender todos os usuários.',
        bindingCoverage: 'Manda a cobertura: são necessários mais NodeBs para chegar a toda a área.',
      },
    },

    summary: {
      items: {
        totalArea: {
          label: 'Área a cobrir (S_T)',
          hint: 'A área que é preciso cobrir. Vem do primeiro passo e não muda no jogo.',
        },
        clusterSize: {
          label: 'Agrupamento (N)',
          hint: 'Células por agrupamento: cada uma usa um conjunto diferente de frequências. No 3G todas compartilham a frequência, então N = 1.',
        },
        plannedCells: {
          label: 'Células do plano',
          hint: 'Quantas células o seu plano precisa: o maior entre capacidade e cobertura.',
        },
        cellArea: {
          label: 'Área por célula',
          hint: 'O que cabe a cada célula: a área total dividida pelas células do plano.',
        },
        hexRadius: {
          label: 'Raio do hexágono',
          hint: 'Raio do hexágono com essa área: o tamanho de cada célula no mapa.',
        },
        circleRadius: {
          label: 'Raio do círculo equivalente',
          hint: 'Raio de um círculo com a mesma área, para comparar com o R do seu orçamento de enlace.',
        },
        reuseDistance: {
          label: 'Distância de reuso (D)',
          hint: 'Distância mínima entre duas células que usam as mesmas frequências: D = √(3N)·R.',
        },
        clusterCountQ: {
          label: 'Agrupamentos estimados (Q)',
          hint: 'Os que o curso estima para cobrir a área (slide 24). O jogo vai dizer quantos realmente são necessários.',
        },
      },
    },
  },
};
