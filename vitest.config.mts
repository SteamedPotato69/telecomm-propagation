import { defineConfig } from 'vitest/config';

// Scoped to code that imports nothing from react-native/expo, so it runs
// under plain Node with zero RN/jsdom mocking:
//   - src/models/**   the pure calculation modules
//   - src/storage/**  persistence with an injected storage (the tests pass an
//                     in-memory one; AsyncStorage is only wired in the React context)
//   - src/i18n/**     only the translation *data* and translateMessage (the
//                     tests build their own i18next instance instead of
//                     importing src/i18n/index.ts, which needs expo-localization)
// Screens stay verified manually in the browser (see README).
export default defineConfig({
  test: {
    include: ['src/models/**/*.test.ts', 'src/storage/**/*.test.ts', 'src/i18n/**/*.test.ts'],
  },
});
