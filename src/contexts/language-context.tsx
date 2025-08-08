
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UI_TEXTS } from '@/constants/ui-texts'; // Import UI_TEXTS

export type Language = 'es' | 'en' | 'fr' | 'pt';

export interface LanguageOption {
  code: Language;
  name: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'pt', name: 'Português' },
];

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (key: string, replacements?: Record<string, string>) => string;
  currentLanguageOption: LanguageOption | undefined;
}

const defaultLanguage: Language = 'es';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedLang = localStorage.getItem('globalStopLanguage') as Language | null;
    if (storedLang && LANGUAGES.some(l => l.code === storedLang)) {
      setLanguageState(storedLang);
      document.documentElement.lang = storedLang;
    } else {
      document.documentElement.lang = defaultLanguage;
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    if (isMounted) {
      setLanguageState(lang);
      localStorage.setItem('globalStopLanguage', lang);
      document.documentElement.lang = lang;
    }
  }, [isMounted]); 

  const translate = useCallback(
    (key: string, replacements?: Record<string, string>): string => {
      const keys = key.split('.');
      let textObject: any = UI_TEXTS;

      for (const k of keys) {
        if (textObject && typeof textObject === 'object' && k in textObject) {
          textObject = textObject[k];
        } else {
          textObject = null;
          break;
        }
      }
      
      let translatedText = '';
      if (textObject && typeof textObject === 'object' && !Array.isArray(textObject)) {
        translatedText = textObject[language] || textObject[defaultLanguage] || textObject['en'] || key;
      } else {
        translatedText = key; 
      }

      if (translatedText && replacements) {
        for (const placeholder in replacements) {
          const regex = new RegExp(`\\\{${placeholder}\\\}`, 'g');
          translatedText = translatedText.replace(regex, replacements[placeholder]);
        }
      }

      return translatedText;
    },
    [language]
  );

  const currentLanguageOption = useMemo(() => {
    return LANGUAGES.find(l => l.code === language);
  }, [language]);

  const value = useMemo(() => ({
    language, setLanguage, translate, currentLanguageOption
  }), [language, setLanguage, translate, currentLanguageOption]);

  if (!isMounted) {
    const serverValue = {
      ...value,
      language: defaultLanguage,
      setLanguage: () => {}, 
      currentLanguageOption: LANGUAGES.find(l => l.code === defaultLanguage),
    };
    return <LanguageContext.Provider value={serverValue}>{children}</LanguageContext.Provider>;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
