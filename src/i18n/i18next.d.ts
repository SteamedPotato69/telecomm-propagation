import type { es } from './locales/es';

// Makes t('some.key') type-checked against the Spanish (source-of-truth) locale.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof es };
  }
}
