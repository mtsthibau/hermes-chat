"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import en from "../../messages/en.json";
import pt from "../../messages/pt.json";

type Locale = "en" | "pt";

const DEFAULT_TIME_ZONE = process.env.NEXT_PUBLIC_APP_TIME_ZONE ?? "UTC";

const messages: Record<Locale, typeof pt> = { en, pt };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem("hermes_locale") as Locale | null;
    if (stored === "en" || stored === "pt") {
      setLocaleState(stored);
    }
    document.documentElement.lang = stored ?? "pt";
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("hermes_locale", l);
    document.documentElement.lang = l;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages[locale]}
        timeZone={DEFAULT_TIME_ZONE}
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
