import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext(null);

const STORAGE_KEY = "cryptfolio:lang";

function getBrowserLanguage() {
  return navigator.language?.toLowerCase().startsWith("pt") ? "pt" : "en";
}

function interpolate(str, vars) {
  if (!vars) return str;
  return Object.entries(vars).reduce((s, [key, value]) => s.replaceAll(`{${key}}`, value), str);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || getBrowserLanguage();
    } catch {
      return getBrowserLanguage();
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage indisponível -> a escolha só dura a sessão
    }
  }, [lang]);

  const t = (key, vars) => interpolate(translations[lang][key] ?? translations.pt[key] ?? key, vars);
  const toggleLang = () => setLang((l) => (l === "pt" ? "en" : "pt"));

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
