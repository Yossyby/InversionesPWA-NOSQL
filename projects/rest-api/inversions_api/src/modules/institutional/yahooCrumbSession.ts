// FIC: Yahoo Finance crumb/cookie session manager — singleton with 15-min TTL and in-flight dedup. (EN)
// FIC: Gestor de sesión crumb/cookie de Yahoo Finance — singleton con TTL de 15 min y dedup de in-flight. (ES)

const YAHOO_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
const YAHOO_CRUMB_URL = "https://query2.finance.yahoo.com/v1/test/getcrumb";
const YAHOO_COOKIE_URL = "https://fc.yahoo.com";
const CRUMB_TTL_MS = 900_000; // 15 minutes / 15 minutos

export interface YahooSession {
  crumb: string;
  cookie: string;
  expiresAt: number;
}

// FIC: Module-level singletons for session caching and in-flight dedup. (EN)
// FIC: Singletons a nivel de módulo para caché de sesión y dedup de in-flight. (ES)
let sessionCache: YahooSession | null = null;
let sessionPromise: Promise<YahooSession> | null = null;

// FIC: Returns a valid Yahoo Finance session (crumb + cookie), reusing cached or in-flight if available. (EN)
// FIC: Retorna una sesión válida de Yahoo Finance (crumb + cookie), reutilizando caché o in-flight si disponible. (ES)
export async function getYahooSession(
  fetchImpl: typeof globalThis.fetch = globalThis.fetch
): Promise<YahooSession> {
  const now = Date.now();

  // Return cached session if still valid / Retornar sesión en caché si sigue siendo válida
  if (sessionCache && now < sessionCache.expiresAt) return sessionCache;

  // Return in-flight promise to avoid concurrent duplicate requests / Retornar promesa en vuelo para evitar requests duplicados concurrentes
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async (): Promise<YahooSession> => {
    try {
      // Step 1: GET fc.yahoo.com with redirect:manual to capture Set-Cookie header
      // Paso 1: GET fc.yahoo.com con redirect:manual para capturar el header Set-Cookie
      const cookieRes = await fetchImpl(YAHOO_COOKIE_URL, {
        redirect: "manual",
        headers: { "User-Agent": YAHOO_USER_AGENT },
      });

      const rawCookie = cookieRes.headers.get("set-cookie") ?? "";
      // FIC: Extract cookie token matching pattern KEY=VALUE from Set-Cookie header. (EN)
      // FIC: Extrae token de cookie con patrón CLAVE=VALOR del header Set-Cookie. (ES)
      const cookieMatch = rawCookie.match(/[A-Za-z0-9]+=\s*[A-Za-z0-9._%+\-]+/);
      const cookie = cookieMatch ? cookieMatch[0].replace(/\s/g, "") : "";

      // Step 2: GET crumb endpoint using the extracted cookie
      // Paso 2: GET endpoint de crumb usando la cookie extraída
      const crumbRes = await fetchImpl(YAHOO_CRUMB_URL, {
        headers: {
          "User-Agent": YAHOO_USER_AGENT,
          Cookie: cookie,
        },
      });

      const crumb = (await crumbRes.text()).trim();
      if (!crumb) throw new Error("Empty crumb response from Yahoo Finance");

      const session: YahooSession = {
        crumb,
        cookie,
        expiresAt: Date.now() + CRUMB_TTL_MS,
      };
      sessionCache = session;
      return session;
    } finally {
      sessionPromise = null;
    }
  })();

  return sessionPromise;
}

// FIC: Invalidate cached session — forces a fresh crumb fetch on next call. (EN)
// FIC: Invalida la sesión en caché — fuerza un nuevo crumb fetch en la próxima llamada. (ES)
export function invalidateYahooSession(): void {
  sessionCache = null;
  sessionPromise = null;
}

export { YAHOO_USER_AGENT };
