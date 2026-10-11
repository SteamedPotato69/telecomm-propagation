import { getLocales } from 'expo-localization';

export type Language = 'es' | 'en' | 'pt';

export const LANGUAGES: Language[] = ['es', 'en', 'pt'];

/** Each language is always shown in its own name (never translated), so a user who landed in the wrong one can still find theirs. */
export const LANGUAGE_NATIVE_NAMES: Record<Language, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
};

/** The course material (and so the source-of-truth locale) is Spanish. */
export const DEFAULT_LANGUAGE: Language = 'es';

export function isLanguage(value: unknown): value is Language {
  return value === 'es' || value === 'en' || value === 'pt';
}

/** Maps a BCP-47 language code ("pt", "pt-BR", "en-US", ...) onto a supported language, or null. */
export function matchSupportedLanguage(languageCode: string | null | undefined): Language | null {
  const base = languageCode?.toLowerCase().split(/[-_]/)[0];
  return isLanguage(base) ? base : null;
}

/** The first of the device's preferred languages that the app supports, else Spanish. */
export function detectDeviceLanguage(): Language {
  for (const locale of getLocales()) {
    const match = matchSupportedLanguage(locale.languageCode);
    if (match) return match;
  }
  return DEFAULT_LANGUAGE;
}
