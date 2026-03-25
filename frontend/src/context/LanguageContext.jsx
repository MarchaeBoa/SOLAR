import React, { createContext, useContext, useState, useCallback } from 'react';
import translations, { LANGUAGES } from '../i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('solar_lang') || 'pt';
  });

  const setLanguage = useCallback((code) => {
    setLanguageState(code);
    localStorage.setItem('solar_lang', code);
  }, []);

  const t = translations[language] || translations.pt;

  const value = {
    language,
    setLanguage,
    t,
    languages: LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider');
  }
  return context;
}

export default LanguageContext;
