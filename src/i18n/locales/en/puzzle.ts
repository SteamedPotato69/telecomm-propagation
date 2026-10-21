import type { DeepStrings } from '../types';
import type { puzzleTexts as esPuzzle } from '../es/puzzle';

export const puzzleTexts: DeepStrings<typeof esPuzzle> = {
  puzzle: {
    title: 'Cell puzzle',

    steps: {
      image: {
        title: 'Your map',
        intro: 'Upload or photograph the map on which you will place the cells.',
      },
      reference: {
        title: 'Reference line',
        intro:
          'With your finger or the cursor, draw a line on the map that is {{km}} km long (for example, its scale bar). With it the game knows how big everything is.',
      },
      area: {
        title: 'Place the area',
        intro: 'Drag the area to cover over the map. It is {{area}} km² (your plan’s) and cannot be changed.',
      },
      play: {
        title: 'Cover the area',
        introCluster:
          'Tap or drag on the map to place a cluster of {{n}} cells: they snap into the lattice. Each colour is a group of frequencies.',
        introSingle: 'Tap or drag on the map to place cells: they snap into the lattice. In 3G they all share one frequency.',
      },
    },

    image: {
      file: 'Choose a file',
      gallery: 'Gallery',
      camera: 'Take a photo',
      dropHint: 'or drag an image here, or paste it with Ctrl+V',
      formats: 'Any format your device can open works (PNG, JPG, WebP, GIF, SVG...).',
      privacy: 'The image never leaves your device and is not stored.',
      opening: 'Opening the image…',
      error: 'That image could not be opened. Try another file: PNG or JPG usually always work.',
      notImage: 'That file does not look like an image.',
      size: 'Image of {{w}} × {{h}}',
    },

    camera: {
      capture: 'Capture',
      flip: 'Switch camera',
      cancel: 'Cancel',
      allow: 'Allow the camera',
      needsPermission: 'Permission is needed to use the camera.',
      denied: 'Camera permission is blocked: enable it in the browser or phone settings.',
      insecure:
        'The browser only allows the camera on secure pages (https or localhost). Open the app from localhost or over https, or choose a file.',
      failed: 'The camera could not be started.',
      loading: 'Starting the camera…',
    },

    reference: {
      lengthLabel: 'The line is',
      clear: 'Clear line',
      none: 'You have not drawn the line yet.',
      measured: 'Line of {{px}} px = {{km}} km → {{scale}} px per km.',
    },

    area: {
      shape: 'Shape',
      rectangle: 'Rectangle',
      ellipse: 'Ellipse',
      proportion: 'Proportion',
      rotate: 'Rotate',
      center: 'Center',
      size: 'It measures {{w}} × {{h}} km.',
      fits: 'The area fits in your image.',
      doesNotFit:
        'The area needs {{needW}} × {{needH}} px and your image is {{imgW}} × {{imgH}}. Go back to the reference line and draw one for {{km}} km that is at most {{maxPx}} px long.',
      hexSmall: 'At this scale each cell is only about {{px}} px on screen: hard to see and to tap.',
      tooMany: 'Your plan has {{count}} cells: too many to draw here.',
    },

    play: {
      coverage: 'Coverage',
      clusters: 'Clusters',
      cells: 'Cells',
      undo: 'Undo',
      reset: 'Restart',
      hint: 'Hint',
      autofill: 'Auto-fill',
      rotateLattice: 'Rotate lattice',
      latticeHelp: 'The first piece fixes the lattice; the others snap into it. Tap a placed piece to remove it.',
    },

    result: {
      title: 'Area covered!',
      stars_one: '{{count}} star out of 3',
      stars_other: '{{count}} stars out of 3',
      yourClusters: 'Your clusters',
      optimum: 'Minimum the game found',
      planCells: 'Cells in the plan',
      cellsInside: 'Cells with their centre inside the area',
      cellsOutside: 'Cells sticking out of the border',
      qCourse: 'Clusters the course estimated (Q)',
      note: 'The border of the area always needs extra cells: that is why more cells are needed than the plan’s.',
      helpHints: 'You used hints: at most 2 stars.',
      helpAutofill: 'You used auto-fill: at most 1 star.',
      starCovered: 'You covered the whole area',
      starClose: 'At most 2 clusters over the minimum',
      starOptimal: 'You matched the minimum',
      again: 'Play again',
      toSummary: 'Back to the summary',
    },

    a11y: {
      mapReference: 'Map. Drag to draw the reference line.',
      mapArea: 'Map. Drag to move the area.',
      mapPlay: 'Map. Tap or drag to place a cluster.',
    },
  },
};
