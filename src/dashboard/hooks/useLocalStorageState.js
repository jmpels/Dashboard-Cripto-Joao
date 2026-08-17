import { useEffect, useState } from "react";

// Estado normal do React, mas persistido em localStorage — sobrevive a fechar o
// browser/app e a recarregar a página, para o cliente não ter de reintroduzir o
// portfólio sempre que abre o dashboard.
export function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage indisponível (ex: modo privado) -> o estado dura só a sessão
    }
  }, [key, value]);

  return [value, setValue];
}
