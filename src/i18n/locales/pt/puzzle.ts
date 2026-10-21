import type { DeepStrings } from '../types';
import type { puzzleTexts as esPuzzle } from '../es/puzzle';

export const puzzleTexts: DeepStrings<typeof esPuzzle> = {
  puzzle: {
    title: 'Quebra-cabeça celular',

    steps: {
      image: {
        title: 'Seu mapa',
        intro: 'Envie ou fotografe o mapa sobre o qual você vai posicionar as células.',
      },
      reference: {
        title: 'Linha de referência',
        intro:
          'Com o dedo ou o cursor, trace uma linha sobre o mapa que meça {{km}} km (por exemplo, a sua barra de escala). Com ela o jogo sabe o tamanho de tudo.',
      },
      area: {
        title: 'Posicione a área',
        intro: 'Arraste a área a cobrir sobre o mapa. Ela mede {{area}} km² (a do seu plano) e não pode ser alterada.',
      },
      play: {
        title: 'Cubra a área',
        introCluster:
          'Toque ou arraste sobre o mapa para colocar um agrupamento de {{n}} células: elas se encaixam sozinhas na rede. Cada cor é um grupo de frequências.',
        introSingle: 'Toque ou arraste sobre o mapa para colocar células: elas se encaixam sozinhas na rede. No 3G todas compartilham a frequência.',
      },
    },

    image: {
      file: 'Escolher arquivo',
      gallery: 'Galeria',
      camera: 'Tirar foto',
      dropHint: 'ou arraste uma imagem aqui, ou cole com Ctrl+V',
      formats: 'Servem os formatos que o seu dispositivo souber abrir (PNG, JPG, WebP, GIF, SVG...).',
      privacy: 'A imagem não sai do seu dispositivo nem é guardada.',
      opening: 'Abrindo a imagem…',
      error: 'Não foi possível abrir essa imagem. Tente outro arquivo: PNG ou JPG costumam funcionar sempre.',
      notImage: 'Esse arquivo não parece uma imagem.',
      size: 'Imagem de {{w}} × {{h}}',
    },

    camera: {
      capture: 'Capturar',
      flip: 'Trocar de câmera',
      cancel: 'Cancelar',
      allow: 'Permitir a câmera',
      needsPermission: 'É preciso permissão para usar a câmera.',
      denied: 'A permissão da câmera está bloqueada: ative-a nas configurações do navegador ou do telefone.',
      insecure:
        'O navegador só permite a câmera em páginas seguras (https ou localhost). Abra o app a partir de localhost ou com https, ou escolha um arquivo.',
      failed: 'Não foi possível iniciar a câmera.',
      loading: 'Iniciando a câmera…',
    },

    reference: {
      lengthLabel: 'A linha mede',
      clear: 'Apagar linha',
      none: 'Você ainda não traçou a linha.',
      measured: 'Linha de {{px}} px = {{km}} km → {{scale}} px por km.',
    },

    area: {
      shape: 'Forma',
      rectangle: 'Retângulo',
      ellipse: 'Elipse',
      proportion: 'Proporção',
      rotate: 'Girar',
      center: 'Centralizar',
      size: 'Mede {{w}} × {{h}} km.',
      fits: 'A área cabe na sua imagem.',
      doesNotFit:
        'A área precisa de {{needW}} × {{needH}} px e a sua imagem tem {{imgW}} × {{imgH}}. Volte à linha de referência e trace uma de {{km}} km que meça no máximo {{maxPx}} px.',
      hexSmall: 'Nesta escala cada célula mede cerca de {{px}} px na tela: é difícil de ver e de tocar.',
      tooMany: 'O seu plano tem {{count}} células: são demais para desenhar aqui.',
    },

    play: {
      coverage: 'Cobertura',
      clusters: 'Agrupamentos',
      cells: 'Células',
      undo: 'Desfazer',
      reset: 'Reiniciar',
      hint: 'Dica',
      autofill: 'Autocompletar',
      rotateLattice: 'Girar rede',
      latticeHelp: 'A primeira peça fixa a rede; as demais se encaixam nela. Toque numa peça colocada para removê-la.',
    },

    result: {
      title: 'Área coberta!',
      stars_one: '{{count}} estrela de 3',
      stars_other: '{{count}} estrelas de 3',
      yourClusters: 'Seus agrupamentos',
      optimum: 'Mínimo que o jogo encontrou',
      planCells: 'Células do plano',
      cellsInside: 'Células com o centro dentro da área',
      cellsOutside: 'Células que passam da borda',
      qCourse: 'Agrupamentos que o curso estimava (Q)',
      note: 'A borda da área sempre pede células extras: por isso são necessárias mais células do que as do plano.',
      helpHints: 'Você usou dicas: no máximo 2 estrelas.',
      helpAutofill: 'Você usou o autocompletar: no máximo 1 estrela.',
      starCovered: 'Você cobriu toda a área',
      starClose: 'No máximo 2 agrupamentos acima do mínimo',
      starOptimal: 'Você igualou o mínimo',
      again: 'Jogar de novo',
      toSummary: 'Voltar ao resumo',
    },

    a11y: {
      mapReference: 'Mapa. Arraste para traçar a linha de referência.',
      mapArea: 'Mapa. Arraste para mover a área.',
      mapPlay: 'Mapa. Toque ou arraste para colocar um agrupamento.',
    },
  },
};
