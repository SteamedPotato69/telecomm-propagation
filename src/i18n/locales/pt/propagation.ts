import type { DeepStrings } from '../types';
import type { propagation as esPropagation } from '../es/propagation';

export const propagation: DeepStrings<typeof esPropagation> = {
  models: {
    'free-space': {
      label: 'Espaço livre (Friis)',
      shortLabel: 'Espaço livre',
      citation: 'Friis, H.T. (1946). Forma logarítmica padrão, d em km, f em MHz.',
    },
    hata: {
      label: 'Okumura-Hata',
      shortLabel: 'Hata',
      citation: 'Hata, M. (1980), IEEE Trans. Vehicular Technology. Válido para f: 150-1500 MHz.',
    },
    'cost231-hata': {
      label: 'COST-231 Hata',
      shortLabel: 'COST-231',
      citation: 'COST Action 231 (1999). Extensão do Hata para f: 1500-2000 MHz.',
    },
    ecc33: {
      label: 'ECC-33',
      shortLabel: 'ECC-33',
      citation:
        'Electronic Communications Committee, Report 33. Válido para f: 0-4000 MHz (docs/curso-referencia.md §5.5).',
    },
    ikegami: {
      label: 'Ikegami',
      shortLabel: 'Ikegami',
      citation:
        'Ikegami et al. (1984). Fórmula: docs/curso-referencia.md §5.6 (a fonte marca os sinais desta seção como [OCR-verificar]).',
    },
    'walfisch-bertoni': {
      label: 'Walfisch-Bertoni',
      shortLabel: 'Walfisch-B.',
      citation:
        'Walfisch & Bertoni (1988). Fórmula: docs/curso-referencia.md §5.7. Válido para f: 300-3000 MHz, d: 0.2-5 km.',
    },
    'cost231-walfish-ikegami': {
      label: 'COST-231 Walfish-Ikegami',
      shortLabel: 'COST231-WI',
      citation:
        'COST Action 231. Fórmula: docs/curso-referencia.md §5.8, verificada contra documentação técnica independente (Altair WinProp).',
    },
  },

  environments: {
    'urban-large': {
      label: 'Urbano — cidade grande / centro metropolitano',
      description: 'Alta densidade de edifícios altos, centros metropolitanos densos.',
    },
    'urban-medium': {
      label: 'Urbano — cidade média/pequena',
      description: 'Densidade de edificação moderada, sem arranha-céus dominantes.',
    },
    'urban-macro-3gpp': {
      label: 'Urbano Macro (3GPP UMa)',
      description: 'Macrocélulas urbanas 3GPP TR 38.901. Pendente: modelo ainda não implementado.',
    },
    'urban-micro-3gpp': {
      label: 'Urbano Micro / cânion de rua (3GPP UMi)',
      description:
        'Microcélulas urbanas 3GPP TR 38.901, geometria de cânion de rua. Pendente: modelo ainda não implementado.',
    },
    suburban: {
      label: 'Suburbano',
      description: 'Áreas residenciais de baixa densidade, mistura de árvores e casas.',
    },
    rural: {
      label: 'Rural / aberto',
      description: 'Espaço aberto sem obstáculos significativos.',
    },
    'street-geometry': {
      label: 'Geometria de rua urbana (edifícios e ruas explícitos)',
      description:
        'Quando se conhecem a largura da rua, a altura dos edifícios e a orientação -- não é uma categoria de cidade, e sim dados geométricos concretos do percurso.',
    },
    'indoor-3gpp': {
      label: 'Interior (3GPP InH / InF)',
      description:
        'Escritórios (InH) e ambientes industriais (InF), 3GPP TR 38.901. Pendente: modelo ainda não implementado.',
    },
    universal: {
      label: 'Universal (sem ambiente)',
      description: 'Limite teórico inferior, não depende de nenhum tipo de ambiente.',
    },
  },

  environment: {
    title: 'Escolha um ambiente',
    subtitle: 'Determina quais modelos de predição de perda estão disponíveis para o seu exercício.',
    modelsAvailable_one: '{{count}} modelo disponível',
    modelsAvailable_other: '{{count}} modelos disponíveis',
  },

  cellularHub: {
    title: 'Planejamento celular',
    subtitle: 'Geometria, dimensionamento por tráfego e capacidade/cobertura -- docs/curso-referencia.md §13.',
    toolsHeading: 'Ferramentas avulsas',
    features: {
      guided: {
        title: 'Planejamento guiado',
        description: 'Passo a passo, como à mão (1G e 2G) ou quase automático (3G). Seu plano fica salvo neste dispositivo.',
      },
      geometry: {
        title: 'Geometria celular e reuso de frequências',
        description: 'Raio da célula, passo da rede, distância de reuso e número de agrupamentos.',
      },
      traffic: {
        title: 'Tráfego (Erlang B) e densidade',
        description:
          'Bloqueio, tráfego suportável, canais necessários ou densidade máxima de tráfego para um GoS alvo.',
      },
      'link-budget': {
        title: 'Link budget (Hata / COST-231-Hata)',
        description: 'MAPL a partir de um orçamento de enlace completo, e inversão para o raio máximo da célula.',
      },
      dimensioning: {
        title: 'Dimensionamento 1G/2G',
        description: 'Fluxo completo capacidade vs. cobertura -- o resultado final é o fator limitante.',
      },
      wcdma: {
        title: 'Carga UMTS uplink e cell breathing',
        description: 'Ganho de processamento, fator de carga por usuário e o laço iterativo de convergência.',
      },
    },
  },
};
