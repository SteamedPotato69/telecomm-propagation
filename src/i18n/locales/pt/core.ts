import type { DeepStrings } from '../types';
import type { core as esCore } from '../es/core';

export const core: DeepStrings<typeof esCore> = {
  common: {
    back: 'Voltar',
    comingSoon: 'Em breve',
    soon: 'em breve',
    missingValues: 'Todos os campos numéricos devem ter um valor.',
  },

  results: {
    pathLoss: 'Perda de propagação',
  },

  home: {
    chooseFeature: 'Por favor, escolha uma funcionalidade',
    settings: 'Configurações',
    cards: {
      empirical: {
        title: 'Métodos empíricos de propagação',
        subtitle: 'Calculadora de perda de percurso: escolha um ambiente e compare os modelos aplicáveis.',
      },
      fading: {
        title: 'Simulador de desvanecimento',
        subtitle:
          'Plano vs. seletivo em frequência, lento vs. rápido: informe dispersão de atraso, velocidade e ' +
          'parâmetros do sinal e posicione o canal nas 5 zonas do curso.',
      },
      cellular: {
        title: 'Planejamento celular',
        subtitle:
          'Geometria de reuso de frequências, dimensionamento por tráfego (Erlang B), link budget e ' +
          'carga UMTS.',
      },
    },
  },

  settings: {
    title: 'Configurações',
    theme: {
      title: 'Tema',
      dark: 'Escuro',
      system: 'Auto',
      light: 'Claro',
    },
    language: {
      title: 'Idioma',
      system: 'Automático (idioma do dispositivo)',
      hint: 'Sua escolha fica salva neste dispositivo.',
    },
  },

  errors: {
    unknown: 'Erro desconhecido.',
    mustBePositive: '{{field}} deve ser um número maior que 0.',
    mustBeNonNegative: '{{field}} deve ser um número maior ou igual a 0.',
    mustBeUnitInterval: '{{field}} deve ser um número estritamente entre 0 e 1.',
    mustBeInteger: '{{field}} deve ser um número inteiro.',
    missingParameter: 'Falta o parâmetro "{{field}}", exigido pelo modelo {{model}}.',
    diffractingBuildingBelowMobile:
      'A altura do edifício de difração (H) deve ser maior que a altura do móvel (hr): caso contrário, a ' +
      'difração sobre o telhado não faz sentido físico e log10(H - hr) fica indefinido.',
    streetOrientationSinZero:
      'O ângulo de orientação da rua (Φ) não pode ser 0° nem 180°: faz log10(sen Φ) ficar indefinido (sen Φ = 0).',
    streetOrientationRange:
      'O ângulo de orientação da rua (Φ) deve estar entre 0° e 90° para este modelo: a fórmula de Lori ' +
      'não tem um ramo definido fora desse intervalo.',
    averageBuildingBelowMobile:
      'A altura média dos edifícios (hR) deve ser maior que a altura do móvel (hm): ΔhR = hR - hm deve ser ' +
      'positivo para que o cálculo faça sentido físico.',
    maplNonPositive:
      'O orçamento de enlace não deixa margem (MAPL <= 0 dB): revise potência, ganhos, sensibilidade e margens.',
    invalidClusterSize:
      'O tamanho de agrupamento N={{n}} não é geometricamente válido: deve poder ser escrito como i²+ij+j² ' +
      'com inteiros i,j >= 0 (por exemplo 1, 3, 4, 7, 9, 12, 13...).',
    gosUnreachable: 'O GoS alvo não foi atingido com um número razoável de canais.',
    invalidDamping: 'O fator de amortecimento deve estar entre 0 (exclusivo) e 1 (inclusivo).',
    referenceServiceNotFound: 'O serviço de referência "{{service}}" não foi encontrado entre os serviços informados.',
  },

  warnings: {
    outOfRange:
      '{{field}} = {{value}} {{unit}} está fora da faixa válida do modelo [{{min}}-{{max}}] {{unit}}; ' +
      'o resultado é uma extrapolação.',
  },

  fields: {
    frequency: 'Frequência',
    distance: 'Distância',
    baseStationHeight: 'Altura da estação rádio base',
    baseStationHeightAboveRoof: 'Altura da estação rádio base acima dos telhados (H)',
    mobileHeight: 'Altura do móvel',
    streetWidth: 'Largura da rua (W)',
    diffractingBuildingHeight: 'Altura do edifício de difração (H)',
    streetOrientation: 'Ângulo de orientação da rua (Φ)',
    facadeReflection: 'Parâmetro de reflexão da fachada (lr)',
    averageBuildingHeight: 'Altura média dos edifícios (hR)',
    buildingSeparation: 'Separação entre edifícios (b)',
    bodyLoss: 'Perda pelo corpo (body loss)',
    feederLoss: 'Perda no feeder',
    shadowFadingMargin: 'Margem de sombreamento',
    interferenceMargin: 'Margem de interferência',
    cellRadius: 'Raio da célula (R)',
    totalCoverageArea: 'Área total a cobrir (S_T)',
    channels: 'Número de canais (K)',
    offeredTraffic: 'Tráfego oferecido (A)',
    targetGos: 'GoS alvo',
    trafficDensity: 'Densidade de tráfego (ρ)',
    totalTraffic: 'Tráfego total',
    delaySpread: 'Dispersão de atraso (D)',
    mobileSpeed: 'Velocidade do móvel',
    signalBandwidth: 'Largura de banda do sinal (BT)',
    symbolDuration: 'Duração do símbolo (Ts)',
    serviceBitRate: 'Taxa de bits ({{service}})',
    serviceActivityFactor: 'Fator de atividade ({{service}})',
    chipRate: 'Chip rate (W)',
    targetLoad: 'Carga alvo (η)',
    totalUsers: 'Usuários totais',
    totalArea: 'Área total',
    averageErlangPerUser: 'Erlang médio por usuário',
    interferenceFactor: 'Fator de interferência (i_oc)',
  },
};
