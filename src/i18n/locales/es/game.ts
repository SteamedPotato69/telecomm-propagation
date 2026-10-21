export const gameTexts = {
  game: {
    path: {
      title: 'Camino del rompecabezas',
      intro: 'Cuatro niveles cortos enseñan cada pieza; al final está tu misión: el rompecabezas con tu plan y tu imagen.',
      xp: 'XP',
      totalStars: 'Estrellas',
      streak_one: '{{count}} día de racha',
      streak_other: '{{count}} días de racha',
      noStreak: 'Sin racha: juega hoy para empezarla',
      level: 'Nivel {{number}}',
      locked: 'Bloqueado: consigue una estrella en el nivel anterior',
      play: 'Jugar',
      replay: 'Repetir',
      stars_one: '{{count}} estrella de 3',
      stars_other: '{{count}} estrellas de 3',
      notPlayed: 'Sin jugar',
      yourMission: 'Tu misión',
      missionLine: 'Tu plan {{generation}}: {{area}} km², agrupaciones de {{n}} celdas',
      goToMission: 'Ir a mi misión',
      saveFailed: 'No se pudo guardar tu progreso en este dispositivo: se mantiene mientras la app esté abierta.',
    },

    levels: {
      hexagon: {
        title: 'Un hexágono',
        goal: 'Cubre el área con celdas: cada toque coloca una.',
        lesson:
          'Una celda se dibuja como hexágono porque los hexágonos encajan sin dejar huecos ni solaparse. Su área es S_c = (3√3/2)·R² (diap. 21).',
      },
      patch: {
        title: 'Teselar un parche',
        goal: 'Cubre un parche más grande: las celdas encajan solas en la retícula.',
        lesson: 'Cada celda está a la misma distancia de sus vecinas, d = R·√3 (diap. 21): por eso encajan.',
      },
      cluster: {
        title: 'Armar la agrupación',
        goal: 'Coloca agrupaciones de 3 celdas: cada color es un grupo de frecuencias.',
        lesson:
          'Una agrupación de N celdas usa N grupos de frecuencias distintos y se repite sin huecos. N = i² + i·j + j² (diap. 22-23): aquí N = 3.',
      },
      reuse: {
        title: 'Reutilizar',
        goal: 'Cubre el área con agrupaciones de 7 celdas y mira la distancia entre celdas del mismo color.',
        lesson: 'Dos celdas del mismo color están a la distancia de reutilización D = √(3N)·R (diap. 23): con N = 7, D = √21·R.',
      },
    },

    tutorial: {
      header: 'Nivel {{number}} de {{total}}',
      next: 'Siguiente nivel',
      toPath: 'Volver al camino',
    },

    reuse: {
      label: 'D = √(3·{{n}})·R = {{d}} km',
    },

    reward: {
      xp: '+{{xp}} XP',
      unlocked: 'Nivel desbloqueado: {{name}}',
      streak_one: '{{count}} día seguido',
      streak_other: '{{count}} días seguidos',
    },

    cheer: {
      one: '¡Lo lograste! Con menos agrupaciones ganas otra estrella.',
      two: '¡Casi perfecto! Una agrupación menos y son tres estrellas.',
      three: '¡Perfecto! Igualaste el mínimo del juego.',
    },

    effects: {
      title: 'Efectos del juego',
      on: 'Activados',
      off: 'Desactivados',
      hint: 'Confeti y vibración. Si el sistema pide reducir el movimiento, el confeti no se anima aunque esté activado.',
    },
  },
};
