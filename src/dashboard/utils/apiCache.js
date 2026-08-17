// Cache simples com TTL para pedidos GET, guardada em localStorage (sobrevive a recarregar a página).
// Serve para não bater no limite de pedidos (429) da CoinGecko: enquanto a última resposta
// para o mesmo URL ainda estiver dentro do prazo de validade, é reutilizada sem ir à rede.
const memoryCache = new Map();

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return memoryCache.get(key) ?? null;
  }
}

function writeCache(key, entry) {
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    memoryCache.set(key, entry);
  }
}

// Devolve { data, timestamp, fromCache }. `timestamp` é sempre o momento em que os dados
// foram efetivamente pedidos à API (não o momento desta chamada), para o "última atualização"
// mostrado ao utilizador refletir a realidade mesmo quando vem da cache.
export async function fetchJsonCached(url, { ttlMs, force = false } = {}) {
  const key = `cryptfolio:${url}`;
  if (!force) {
    const cached = readCache(key);
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return { data: cached.data, timestamp: cached.timestamp, fromCache: true };
    }
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`request failed: ${res.status}`);
  const data = await res.json();
  const timestamp = Date.now();
  writeCache(key, { timestamp, data });
  return { data, timestamp, fromCache: false };
}
