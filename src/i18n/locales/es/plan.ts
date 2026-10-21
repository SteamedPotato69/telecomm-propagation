export const planTexts = {
  plan: {
    start: {
      title: 'Planificación guiada',
      subtitle:
        'Sigue el mismo orden que a lápiz y papel: cada paso usa lo calculado en el anterior, y todo queda guardado en este dispositivo.',
      privacy: 'Tu plan se guarda solo en este dispositivo.',
      generation: {
        g1: { title: '1G — AMPS', subtitle: 'Analógico, FDMA. Canales de 30 kHz y agrupación típica N=7.' },
        g2: { title: '2G — GSM', subtitle: 'Digital, TDMA. Portadoras de 200 kHz con 7 canales de tráfico cada una.' },
        g3: { title: '3G — UMTS', subtitle: 'Casi automático: solo tres datos y el resto se calcula por ti.' },
      },
      savedStatus: 'Plan guardado · paso {{step}} de {{total}}',
      savedCells_one: '{{count}} celda en tu plan',
      savedCells_other: '{{count}} celdas en tu plan',
      noResult: 'Todavía sin resultado final',
      begin: 'Empezar con el ejemplo del curso',
      continue: 'Continuar',
      restart: 'Empezar de nuevo',
      restartConfirm: 'Toca otra vez para borrar este plan y volver al ejemplo del curso',
      changed: 'Con los modelos actuales este plan da {{now}} celdas (cuando lo guardaste daba {{before}}).',
      saveFailed: 'No se pudo guardar en este dispositivo: tu plan seguirá aquí mientras la app esté abierta.',
    },

    shell: {
      stepOf: 'Paso {{step}} de {{total}}',
      previous: 'Anterior',
      next: 'Siguiente',
      advanced: 'Avanzado',
      invalidNumber: 'Escribe un número válido: mientras tanto se usa el último valor correcto.',
      ledgerTitle: 'Tu plan hasta ahora',
    },

    constraint: {
      capacity: 'Capacidad',
      coverage: 'Cobertura',
    },

    /** Labels of the "Tu plan hasta ahora" rows; keys are LedgerItemId. */
    ledger: {
      totalArea: 'Área a cubrir (S_T)',
      totalTraffic: 'Tráfico total (A_T)',
      clusterSize: 'Agrupación (N)',
      totalChannels: 'Canales en la banda',
      channelsPerCell: 'Canales por celda (K)',
      carriers: 'Portadoras en la banda',
      transceiversPerCell: 'Transceptores por celda',
      trafficPerCell: 'Tráfico por celda (A_c)',
      cellsByCapacity: 'Celdas por capacidad',
      propagationModel: 'Modelo de propagación',
      mapl: 'Pérdida máxima permitida (MAPL)',
      cellRadius: 'Radio de celda (R)',
      cellArea: 'Área de celda (π·R²)',
      cellsByCoverage: 'Celdas por cobertura',
      cellsFinal: 'Celdas del plan',
      bindingConstraint: 'Factor limitante',
      maxUsersPerCell: 'Usuarios simultáneos máx. por celda',
      convergedRadius: 'Radio convergido (R)',
      convergedLoad: 'Carga convergida (η)',
      nodeBsByCoverage: 'NodeB por cobertura',
      nodeBsByCapacity: 'NodeB por capacidad',
    },

    steps: {
      scenario: {
        title: 'Escenario',
        intro: 'Cuánta área hay que cubrir y cuánto tráfico genera la gente en la hora pico.',
        users: 'Usuarios activos en hora pico',
        erlangPerUser: 'Tráfico por usuario',
        gosHelper: 'Fracción entre 0 y 1: 0.02 es un 2 % de llamadas bloqueadas.',
        result: 'Tráfico total = usuarios × Erlang por usuario = {{value}} Erlang.',
      },
      spectrum: {
        title: 'Espectro y agrupación',
        intro1g: 'AMPS reparte el espectro en canales de 30 kHz. Cada agrupación de N celdas usa todos los canales una vez.',
        intro2g: 'GSM reparte el espectro en portadoras de 200 kHz; cada portadora lleva varios canales de tráfico.',
        clusterHelper: 'Más N = menos interferencia entre celdas que reutilizan frecuencias, pero menos canales por celda.',
        carrierWidth: 'Separación entre portadoras',
        controlHelper: 'El curso no descuenta canales de control. En AMPS real son 21 por operador [contexto de industria].',
        tchHelper: 'El curso usa 7: se asume que una de las 8 ranuras de la portadora lleva señalización.',
        result1g: 'La banda tiene {{total}} canales; con N={{n}} tocan {{perCell}} por celda.',
        result2g: '{{carriers}} portadoras → {{trx}} por celda × {{tch}} canales de tráfico = {{perCell}} canales por celda.',
      },
      capacity: {
        title: 'Capacidad',
        intro: 'Con K canales por celda y el GoS pedido, Erlang B dice cuánto tráfico soporta cada celda.',
        formula: 'A_c = B⁻¹(K, GoS)',
        note: 'Una tabla impresa de Erlang B puede dar un valor algo distinto: aquí el cálculo es exacto.',
      },
      coverage: {
        title: 'Cobertura',
        intro: 'El presupuesto de enlace da la pérdida máxima permitida (MAPL); con ella el modelo de propagación da el radio de celda.',
        modelAuto: 'Modelo elegido según la frecuencia: {{model}}',
        advancedIntro: 'Vienen del ejemplo del curso. Puedes cambiarlos, pero no hace falta.',
      },
      result: {
        title: 'Resultado',
        intro: 'El número de celdas es el mayor entre lo que pide la capacidad y lo que pide la cobertura.',
        cellsTitle: 'Celdas necesarias',
        bindingCapacity: 'Manda la capacidad: hacen falta más celdas para atender todo el tráfico.',
        bindingCoverage: 'Manda la cobertura: hacen falta más celdas para llegar a toda el área.',
      },
      summary: {
        title: 'Resumen para el rompecabezas',
        intro: 'Esto es lo que usará el minijuego. Solo lo lee: no cambia tu plan.',
        play: 'Ir al rompecabezas',
        soon: 'El rompecabezas llega en la siguiente entrega.',
        unavailable: 'El plan 3G no tiene un número final de NodeB (el cálculo no convergió), así que el juego no puede empezar.',
      },
      scenario3g: {
        title: 'Escenario 3G',
        intro:
          'Solo tres datos. El resto (mezcla de servicios 70/20/10, presupuesto de enlace, carga objetivo, banda de 2100 MHz) viene del ejemplo del curso y se calcula por ti.',
        advancedIntro: 'Valores del ejemplo del curso. Puedes cambiarlos, pero no hace falta.',
        targetLoadHelper: 'Fracción entre 0 y 1: 0.5 es planificar al 50 % de la carga máxima.',
      },
      result3g: {
        title: 'Resultado 3G',
        intro: 'Calculado por ti: ganancia de procesado, carga por servicio y el bucle de cell breathing hasta que el radio se estabiliza.',
        smallerStep: 'Con el paso de cálculo estándar el bucle oscilaba: se repitió con un paso menor ({{step}}), que llega al mismo punto.',
        minByCapacity: 'Como mínimo hacen falta {{count}} NodeB por capacidad.',
        bindingCapacity: 'Manda la capacidad: hacen falta más NodeB para atender a todos los usuarios.',
        bindingCoverage: 'Manda la cobertura: hacen falta más NodeB para llegar a toda el área.',
      },
    },

    summary: {
      items: {
        totalArea: {
          label: 'Área a cubrir (S_T)',
          hint: 'El área que hay que cubrir. Sale del primer paso y no cambia en el juego.',
        },
        clusterSize: {
          label: 'Agrupación (N)',
          hint: 'Celdas por agrupación: cada una usa un conjunto distinto de frecuencias. En 3G todas comparten frecuencia, así que N = 1.',
        },
        plannedCells: {
          label: 'Celdas del plan',
          hint: 'Cuántas celdas necesita tu plan: el mayor entre capacidad y cobertura.',
        },
        cellArea: {
          label: 'Área por celda',
          hint: 'Lo que le toca a cada celda: el área total dividida entre las celdas del plan.',
        },
        hexRadius: {
          label: 'Radio del hexágono',
          hint: 'Radio del hexágono con esa área: el tamaño de cada celda en el mapa.',
        },
        circleRadius: {
          label: 'Radio del círculo equivalente',
          hint: 'Radio de un círculo con la misma área, para compararlo con el R de tu presupuesto de enlace.',
        },
        reuseDistance: {
          label: 'Distancia de reutilización (D)',
          hint: 'Distancia mínima entre dos celdas que usan las mismas frecuencias: D = √(3N)·R.',
        },
        clusterCountQ: {
          label: 'Agrupaciones estimadas (Q)',
          hint: 'Las que estima el curso para cubrir el área (diap. 24). El juego te dirá cuántas hacen falta de verdad.',
        },
      },
    },
  },
};
