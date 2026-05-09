import React, { createContext, useContext, useState } from 'react';

import { i18n, setLocale as i18nSetLocale } from './i18n';

type LanguageContextType = {
  locale: string;
  setLocale: (code: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: i18n.locale,
  setLocale: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState(i18n.locale);

  function setLocale(code: string) {
    i18nSetLocale(code);
    setLocaleState(code);
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
