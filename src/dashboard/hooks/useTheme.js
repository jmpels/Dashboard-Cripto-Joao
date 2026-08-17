import { useEffect, useState } from "react";

const STORAGE_KEY = "cryptfolio:theme";

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#f6f8fa" : "#0d1117");
}

// Aplica o tema no <html> (data-theme), lido inicialmente do localStorage ou,
// na primeira visita, da preferência do sistema. Aplicado já no lazy-init do
// useState (não num useEffect) para evitar um flash do tema errado no arranque.
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    let initial;
    try {
      initial = localStorage.getItem(STORAGE_KEY) || getSystemTheme();
    } catch {
      initial = getSystemTheme();
    }
    applyTheme(initial);
    return initial;
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage indisponível -> a escolha só dura a sessão
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
}
