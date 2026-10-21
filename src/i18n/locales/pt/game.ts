import type { DeepStrings } from '../types';
import type { gameTexts as esGame } from '../es/game';

export const gameTexts: DeepStrings<typeof esGame> = {
  game: {
    path: {
      title: 'Caminho do quebra-cabeça',
      intro: 'Quatro níveis curtos ensinam cada peça; no final está a sua missão: o quebra-cabeça com o seu plano e a sua imagem.',
      xp: 'XP',
      totalStars: 'Estrelas',
      streak_one: '{{count}} dia de sequência',
      streak_other: '{{count}} dias de sequência',
      noStreak: 'Sem sequência: jogue hoje para começar uma',
      level: 'Nível {{number}}',
      locked: 'Bloqueado: consiga uma estrela no nível anterior',
      play: 'Jogar',
      replay: 'Repetir',
      stars_one: '{{count}} estrela de 3',
      stars_other: '{{count}} estrelas de 3',
      notPlayed: 'Não jogado',
      yourMission: 'Sua missão',
      missionLine: 'Seu plano {{generation}}: {{area}} km², agrupamentos de {{n}} células',
      goToMission: 'Ir à minha missão',
      saveFailed: 'Não foi possível salvar o seu progresso neste dispositivo: ele se mantém enquanto o app estiver aberto.',
    },

    levels: {
      hexagon: {
        title: 'Um hexágono',
        goal: 'Cubra a área com células: cada toque coloca uma.',
        lesson:
          'Uma célula é desenhada como hexágono porque os hexágonos se encaixam sem deixar vazios nem se sobrepor. Sua área é S_c = (3√3/2)·R² (slide 21).',
      },
      patch: {
        title: 'Ladrilhar um trecho',
        goal: 'Cubra um trecho maior: as células se encaixam sozinhas na rede.',
        lesson: 'Cada célula está à mesma distância das vizinhas, d = R·√3 (slide 21): por isso se encaixam.',
      },
      cluster: {
        title: 'Montar o agrupamento',
        goal: 'Coloque agrupamentos de 3 células: cada cor é um grupo de frequências.',
        lesson:
          'Um agrupamento de N células usa N grupos de frequências diferentes e se repete sem vazios. N = i² + i·j + j² (slides 22-23): aqui N = 3.',
      },
      reuse: {
        title: 'Reutilizar',
        goal: 'Cubra a área com agrupamentos de 7 células e veja a distância entre células da mesma cor.',
        lesson: 'Duas células da mesma cor estão à distância de reutilização D = √(3N)·R (slide 23): com N = 7, D = √21·R.',
      },
    },

    tutorial: {
      header: 'Nível {{number}} de {{total}}',
      next: 'Próximo nível',
      toPath: 'Voltar ao caminho',
    },

    reuse: {
      label: 'D = √(3·{{n}})·R = {{d}} km',
    },

    reward: {
      xp: '+{{xp}} XP',
      unlocked: 'Nível desbloqueado: {{name}}',
      streak_one: '{{count}} dia seguido',
      streak_other: '{{count}} dias seguidos',
    },

    cheer: {
      one: 'Você conseguiu! Com menos agrupamentos você ganha mais uma estrela.',
      two: 'Quase perfeito! Um agrupamento a menos e são três estrelas.',
      three: 'Perfeito! Você igualou o mínimo do jogo.',
    },

    effects: {
      title: 'Efeitos do jogo',
      on: 'Ativados',
      off: 'Desativados',
      hint: 'Confete e vibração. Se o sistema pedir para reduzir o movimento, o confete não é animado mesmo ativado.',
    },
  },
};
