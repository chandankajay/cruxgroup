"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "../../lib/locale";

type LangContextValue = {
  readonly lang: Locale;
  readonly setLang: (l: Locale) => void;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({
  initialLocale,
  children,
}: {
  readonly initialLocale: Locale;
  readonly children: ReactNode;
}): React.ReactElement {
  const [lang, setLang] = useState<Locale>(initialLocale);

  useEffect(() => {
    setLang(initialLocale);
  }, [initialLocale]);

  const value = useMemo<LangContextValue>(
    () => ({ lang, setLang }),
    [lang]
  );

  return (
    <LangContext.Provider value={value}>{children}</LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang must be used within LanguageProvider");
  }
  return ctx;
}
