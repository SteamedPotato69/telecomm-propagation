import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { detectDeviceLanguage, isLanguage } from './languages';
import type { Language } from './languages';

/** 'system' follows the device language (same idea as the theme's 'system' mode). */
export type LanguagePreference = 'system' | Language;

const STORAGE_KEY = 'telecomm-propagation.language';

interface LocaleContextValue {
  preference: LanguagePreference;
  /** The language actually in use (the preference with 'system' resolved). */
  language: Language;
  setPreference: (preference: LanguagePreference) => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function resolve(preference: LanguagePreference): Language {
  return preference === 'system' ? detectDeviceLanguage() : preference;
}

/**
 * Mirrors ThemeProvider: restores the saved choice from AsyncStorage
 * (localStorage on web), applies it to i18next, and persists changes.
 * Also keeps <html lang> in sync on web, for screen readers and browser
 * translation prompts.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const { i18n: instance } = useTranslation();
  const [preference, setPreferenceState] = useState<LanguagePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'system' || isLanguage(saved)) {
          setPreferenceState(saved);
          void i18n.changeLanguage(resolve(saved));
        }
      })
      .catch(() => {
        // No saved preference (or storage unavailable) -- the device language chosen at init stays.
      });
  }, []);

  const language = (isLanguage(instance.language) ? instance.language : resolve(preference)) as Language;

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setPreference = useCallback((next: LanguagePreference) => {
    setPreferenceState(next);
    void i18n.changeLanguage(resolve(next));
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo(() => ({ preference, language, setPreference }), [preference, language, setPreference]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used inside a LocaleProvider.');
  }
  return context;
}
