import type { DeepStrings } from '../types';
import type { cellular as esCellular } from '../es/cellular';

export const cellular: DeepStrings<typeof esCellular> = {
  geometry: {
    title: 'Geometria celular e reuso de frequências',
    subtitle:
      'Rede hexagonal, distância de reuso e número de agrupamentos — docs/curso-referencia.md §13.1.',
    clusterSize: 'Tamanho do agrupamento (N)',
    clusterHelper: 'Deve ser um número rômbico: N = i²+ij+j² para inteiros i,j ≥ 0 (1, 3, 4, 7, 9, 12, 13...).',
    totalAreaHelper:
      'Opcional -- deixe vazio se você só precisa da geometria de uma célula, sem o número de agrupamentos.',
    result: {
      latticeStep: 'Passo da rede (d)',
      reuseDistance: 'Distância de reuso (D)',
      cellArea: 'Área da célula (S_c)',
      cocellArea: 'Área do losango co-canal (S_RC)',
      sectorArea: 'Área por setor (trissetorial)',
      clusterCount: 'Número de agrupamentos (Q)',
    },
  },

  traffic: {
    title: 'Tráfego (Erlang B)',
    subtitle:
      'Bloqueio, tráfego suportável, canais necessários ou densidade de tráfego -- docs/curso-referencia.md §13.2-13.3.',
    whatToCompute: 'O que você quer calcular?',
    modes: {
      blocking: 'Bloqueio',
      traffic: 'Tráfego',
      channels: 'Canais',
      density: 'Densidade',
    },
    cellArea: 'Área da célula (S_c)',
    cellAreaHelper: 'Do módulo de geometria celular, ou qualquer área de célula conhecida.',
    gosHelper: 'Fração entre 0 e 1 (0.02 = 2% de bloqueio alvo).',
    results: {
      blocking: 'Probabilidade de bloqueio (GoS)',
      supportableTraffic: 'Tráfego suportável (A)',
      requiredChannels: 'Canais necessários (K)',
      maxDensity: 'Densidade de tráfego máxima suportável (ρ)',
    },
  },

  linkBudget: {
    title: 'Link budget (Hata / COST-231-Hata)',
    subtitle:
      'MAPL a partir de um orçamento de enlace completo, e inversão para o raio máximo da célula -- ' +
      'docs/curso-referencia.md §13.3.',
    result: {
      maxRadius: 'Raio máximo da célula (R)',
    },
  },

  linkBudgetForm: {
    transmitPower: 'Potência da MS (Pt)',
    msAntennaGain: 'Ganho da antena da MS',
    btsAntennaGain: 'Ganho da antena da ERB',
    btsFeederLoss: 'Perda no feeder da ERB',
    btsSensitivity: 'Sensibilidade da ERB',
    sensitivityHelper: 'Negativa, p. ex. -116.',
  },

  dimensioning: {
    title: 'Dimensionamento 1G/2G',
    subtitle: 'Capacidade vs. cobertura -- o resultado final é o fator limitante. docs/curso-referencia.md §13.3.',
    channelsPerCell: 'Canais por célula (K)',
    gosHelper: 'Fração entre 0 e 1 (0.02 = 2%).',
    result: {
      byCapacity: 'Por capacidade',
      trafficPerCell: 'Tráfego/célula (A_c)',
      cellsByCapacity: 'Células por capacidade',
      byCoverage: 'Por cobertura',
      mapl: 'MAPL',
      cellRadius: 'Raio da célula (R)',
      cellArea: 'Área da célula (π·R²)',
      cellsByCoverage: 'Células por cobertura',
      capacity: 'Capacidade',
      coverage: 'Cobertura',
      finalLabel: 'Resultado final -- fator limitante: {{constraint}}',
      cellsFinal_one: '{{count}} célula',
      cellsFinal_other: '{{count}} células',
    },
  },

  wcdma: {
    title: 'Carga UMTS uplink e cell breathing',
    subtitle:
      'Ganho de processamento, carga por usuário e laço iterativo de convergência -- docs/curso-referencia.md §13.4.',
    serviceMixHeading: 'Mix de serviços (fixo, exemplo do curso)',
    services: {
      voice: 'Voz AMR',
      ps64: 'PS 64k',
      ps384: 'PS 384k',
    },
    targetLoadHelper: 'Fração entre 0 e 1 (0.5 = 50%).',
    referenceService: 'Serviço de referência (cobertura)',
    linkBudgetHeading: 'Orçamento de enlace UMTS',
    mobileEirp: 'EIRP do móvel',
    thermalNoise: 'Ruído térmico (kTB)',
    noiseFigure: 'Figura de ruído do NodeB',
    nodeBAntennaGain: 'Ganho da antena do NodeB',
    result: {
      loadPerService: 'Carga por serviço',
      processingGain: '{{service}} -- Gp',
      loadPerUser: 'ρ (por usuário)',
      maplZeroLoad: 'MAPL com carga zero',
      simultaneousUsers: 'Usuários simultâneos',
      maxPerCell: 'Máximo por célula (N_max)',
      convergence: 'Convergência (cell breathing)',
      converged_one: 'Convergiu em {{count}} iteração',
      converged_other: 'Convergiu em {{count}} iterações',
      notConverged_one: 'Não convergiu em {{count}} iteração -- veja o rastro',
      notConverged_other: 'Não convergiu em {{count}} iterações -- veja o rastro',
      convergedRadius: 'Raio convergido (R)',
      convergedLoad: 'Carga convergida (η)',
      nodeBsByCoverage: 'NodeBs por cobertura',
      nodeBsByCapacity: 'NodeBs por capacidade',
      nodeBsFinal: '{{count}} NodeB',
      downlinkNote:
        'Downlink (η_DL) não implementado -- o material do curso usa uma variável (β) sem definição e sem ' +
        'exercício de verificação (docs/curso-referencia.md §13.4-13.5).',
    },
  },
};
