export const puzzleTexts = {
  puzzle: {
    title: 'Rompecabezas celular',

    steps: {
      image: {
        title: 'Tu mapa',
        intro: 'Sube o fotografía el mapa sobre el que vas a ubicar las celdas.',
      },
      reference: {
        title: 'Línea de referencia',
        intro:
          'Traza con el dedo o el cursor una línea sobre el mapa que mida {{km}} km (por ejemplo, su barra de escala). Con ella el juego sabe qué tan grande es todo.',
      },
      area: {
        title: 'Ubica el área',
        intro: 'Arrastra el área a cubrir sobre el mapa. Mide {{area}} km² (la de tu plan) y no se puede cambiar.',
      },
      play: {
        title: 'Cubre el área',
        introCluster:
          'Toca o arrastra sobre el mapa para colocar una agrupación de {{n}} celdas: encajan solas en la retícula. Cada color es un grupo de frecuencias.',
        introSingle: 'Toca o arrastra sobre el mapa para colocar celdas: encajan solas en la retícula. En 3G todas comparten frecuencia.',
      },
    },

    image: {
      file: 'Elegir archivo',
      gallery: 'Galería',
      camera: 'Tomar foto',
      dropHint: 'o arrastra una imagen aquí, o pégala con Ctrl+V',
      formats: 'Sirven los formatos que tu dispositivo sepa abrir (PNG, JPG, WebP, GIF, SVG...).',
      privacy: 'La imagen no sale de tu dispositivo ni se guarda.',
      opening: 'Abriendo la imagen…',
      error: 'No se pudo abrir esa imagen. Prueba con otro archivo: PNG o JPG suelen funcionar siempre.',
      notImage: 'Ese archivo no parece una imagen.',
      change: 'Cambiar imagen',
      size: 'Imagen de {{w}} × {{h}}',
    },

    camera: {
      capture: 'Capturar',
      flip: 'Cambiar de cámara',
      cancel: 'Cancelar',
      allow: 'Permitir la cámara',
      needsPermission: 'Hace falta permiso para usar la cámara.',
      denied: 'El permiso de la cámara está bloqueado: actívalo en los ajustes del navegador o del teléfono.',
      insecure:
        'El navegador solo permite la cámara en páginas seguras (https o localhost). Abre la app desde localhost o con https, o elige un archivo.',
      failed: 'No se pudo iniciar la cámara.',
      loading: 'Iniciando la cámara…',
    },

    reference: {
      lengthLabel: 'La línea mide',
      clear: 'Borrar línea',
      none: 'Todavía no has trazado la línea.',
      measured: 'Línea de {{px}} px = {{km}} km → {{scale}} px por km.',
    },

    area: {
      shape: 'Forma',
      rectangle: 'Rectángulo',
      ellipse: 'Elipse',
      proportion: 'Proporción',
      rotate: 'Girar',
      center: 'Centrar',
      size: 'Mide {{w}} × {{h}} km.',
      fits: 'El área cabe en tu imagen.',
      doesNotFit:
        'El área necesita {{needW}} × {{needH}} px y tu imagen tiene {{imgW}} × {{imgH}}. Vuelve a la línea de referencia y traza una de {{km}} km que mida como máximo {{maxPx}} px.',
      hexSmall: 'A esta escala cada celda mide unos {{px}} px en pantalla: cuesta verla y tocarla.',
      tooMany: 'Tu plan tiene {{count}} celdas: son demasiadas para dibujarlas aquí.',
    },

    play: {
      coverage: 'Cobertura',
      clusters: 'Agrupaciones',
      cells: 'Celdas',
      undo: 'Deshacer',
      reset: 'Reiniciar',
      hint: 'Pista',
      autofill: 'Autocompletar',
      rotateLattice: 'Girar retícula',
      latticeHelp: 'La primera pieza fija la retícula; las demás encajan en ella. Toca una pieza colocada para quitarla.',
    },

    result: {
      title: '¡Área cubierta!',
      stars_one: '{{count}} estrella de 3',
      stars_other: '{{count}} estrellas de 3',
      yourClusters: 'Tus agrupaciones',
      optimum: 'Mínimo que encontró el juego',
      planCells: 'Celdas del plan',
      cellsInside: 'Celdas con el centro dentro del área',
      cellsOutside: 'Celdas que sobresalen del borde',
      qCourse: 'Agrupaciones que estimaba el curso (Q)',
      note: 'El borde del área siempre pide celdas extra: por eso hacen falta más celdas que las del plan.',
      helpHints: 'Usaste pistas: máximo 2 estrellas.',
      helpAutofill: 'Autocompletaste: máximo 1 estrella.',
      starCovered: 'Cubriste toda el área',
      starClose: 'Hasta 2 agrupaciones más que el mínimo',
      starOptimal: 'Igualaste el mínimo',
      again: 'Jugar de nuevo',
      keep: 'Seguir ajustando',
      toSummary: 'Volver al resumen',
    },

    a11y: {
      mapReference: 'Mapa. Arrastra para trazar la línea de referencia.',
      mapArea: 'Mapa. Arrastra para mover el área.',
      mapPlay: 'Mapa. Toca o arrastra para colocar una agrupación.',
    },
  },
};
