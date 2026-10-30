import { useEffect, useState } from "react";
import { fetchHistory } from "../utils/history";

export function useAssetHistory(id, range, enabled = true) {
  const [state, setState] = useState({ points: [], currency: "EUR", loading: false, error: null });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchHistory(id, range)
      .then((r) => !cancelled && setState({ ...r, loading: false, error: null }))
      .catch((e) => !cancelled && setState({ points: [], currency: "EUR", loading: false, error: e.message }));

    return () => { cancelled = true; };
  }, [id, range, enabled]);

  return state;
}