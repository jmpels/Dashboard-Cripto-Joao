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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Tenta cada URL da lista por ordem, uma vez. Devolve a primeira resposta OK.
async function tryUrlsOnce(urls) {
  let lastError;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`request failed: ${res.status}`);
      return { data: await res.json(), timestamp: Date.now() };
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

// Devolve { data, timestamp, fromCache }. `timestamp` é sempre o momento em que os dados
// foram efetivamente pedidos à API (não o momento desta chamada), para o "última atualização"
// mostrado ao utilizador refletir a realidade mesmo quando vem da cache.
//
// `urlOrUrls` pode ser um único URL ou uma lista de URLs alternativos (ex: o mesmo pedido
// através de proxies diferentes) — tenta cada um por ordem. Se todos falharem à primeira
// (proxies gratuitos têm quebras momentâneas), espera um pouco e repete a ronda toda mais
// uma vez antes de desistir — na prática resolve grande parte das falhas transitórias.
// Se mesmo assim tudo falhar mas já houver uma resposta antiga em cache (mesmo fora do
// prazo), devolve-a em vez de rebentar — dados desatualizados é sempre melhor que um ecrã em branco.
export async function fetchJsonCached(urlOrUrls, { ttlMs, force = false, retryDelayMs = 1200 } = {}) {
  const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
  const key = `cryptfolio:${urls[0]}`;

  if (!force) {
    const cached = readCache(key);
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return { data: cached.data, timestamp: cached.timestamp, fromCache: true };
    }
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { data, timestamp } = await tryUrlsOnce(urls);
      writeCache(key, { timestamp, data });
      return { data, timestamp, fromCache: false };
    } catch {
      if (attempt === 0) await sleep(retryDelayMs);
    }
  }

  const stale = readCache(key);
  if (stale) return { data: stale.data, timestamp: stale.timestamp, fromCache: true, stale: true };
  throw new Error(`todas as tentativas falharam para: ${urls[0]}`);
}
