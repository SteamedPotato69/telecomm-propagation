import type { DeepStrings } from '../types';
import type { calculator as esCalculator } from '../es/calculator';

export const calculator: DeepStrings<typeof esCalculator> = {
  propagationOptions: {
    model: 'Modelo de propagação',
    modelCoverage: 'Modelo de propagação (cobertura)',
    largeCityHataOnly: 'Cidade grande (somente Hata)',
    metropolitanCostOnly: 'Centro metropolitano — Cm (somente COST-231)',
    environmentHataOnly: 'Ambiente (somente Hata)',
    budgetHeading: 'Orçamento de enlace',
  },

  envOptions: {
    urban: 'Urbano',
    suburban: 'Suburbano',
    'open-rural': 'Aberto/rural',
  },

  calculator: {
    title: 'Calculadora de perda de propagação',
    geometryRequired: 'Geometria exigida por {{model}}',
    largeCity: 'Cidade grande (Hata / ECC-33)',
    metropolitanCenter: 'Centro metropolitano — Cm (COST-231)',
    environmentHataOnly: 'Ambiente (somente Hata)',
    compareAll: 'Comparar todos os modelos deste ambiente',
  },

  comparison: {
    title: 'Comparação de modelos',
    explainer:
      '"Distância ao ideal" = diferença absoluta em relação à perda no espaço livre (limite teórico inferior) com ' +
      'os mesmos parâmetros. Menor distância = melhor.',
    bestFit: 'MELHOR AJUSTE',
    distanceToIdeal: 'Distância ao ideal: {{value}} dB',
    idealSeries: 'Ideal (espaço livre)',
    chartsHeading: 'Perda vs. distância',
    chartsExplainer:
      'Cada modelo avaliado em uma faixa de distâncias fixa (0.3-20 km), com os demais parâmetros iguais aos de ' +
      'cima. A linha cinza pontilhada é o espaço livre (a "predição ideal"); quanto mais perto uma curva estiver ' +
      'dessa linha, melhor o ajuste.',
    logScaleTitle: 'Escala logarítmica de distância',
    linearScaleTitle: 'Escala linear de distância',
    xLabelLog: 'Distância (km, escala log)',
    xLabelLinear: 'Distância (km)',
    yLabel: 'Perda (dB)',
  },

  geometryFields: {
    streetWidthM: { label: 'Largura da rua (W)', helper: '' },
    diffractingBuildingHeightM: {
      label: 'Altura do edifício de difração (H)',
      helper: 'Deve ser maior que a altura do móvel acima.',
    },
    streetOrientationDeg: {
      label: 'Orientação da rua (Φ)',
      helper: 'Ângulo entre o raio incidente e a rua. A faixa válida depende do modelo escolhido.',
    },
    facadeReflectionLr: {
      label: 'Reflexão da fachada (lr)',
      helper: 'Típico: 2 em VHF, 3.2 em UHF.',
    },
    baseStationHeightAboveRoofM: {
      label: 'Altura da estação rádio base acima dos telhados (H)',
      helper: 'Altura da antena ACIMA do nível dos telhados próximos, não sua altura absoluta.',
    },
    averageBuildingHeightM: {
      label: 'Altura média dos edifícios (hR)',
      helper: 'Deve ser maior que a altura do móvel acima.',
    },
    buildingSeparationM: { label: 'Separação entre edifícios (b)', helper: '' },
  },
};
