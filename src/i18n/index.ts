import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, detectDeviceLanguage } from './languages';
import { en } from './locales/en';
import { es } from './locales/es';
import { pt } from './locales/pt';

// Resources are bundled and init is synchronous, so the first render is
// already in the right language (no flash). LocaleProvider later applies
// the user's saved choice, if any.
void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    pt: { translation: pt },
  },
  lng: detectDeviceLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  // React already escapes rendered text.
  interpolation: { escapeValue: false },
  returnNull: false,
});

export { i18n };
export * from './languages';
export { translateError, translateMessage } from './translateMessage';
export { LocaleProvider, useLocale } from './LocaleContext';
export type { LanguagePreference } from './LocaleContext';
