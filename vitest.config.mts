import { defineConfig } from 'vitest/config';

// Scoped to src/models/** on purpose: that's the only code in this app that
// imports nothing from react-native/expo, so it runs under plain Node with
// zero RN/jsdom mocking. Screens stay verified manually in the browser
// (see README) -- this covers the pure calculation modules only.
export default defineConfig({
  test: {
    include: ['src/models/**/*.test.ts'],
  },
});
