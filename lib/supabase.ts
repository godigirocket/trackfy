import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./constants";

/**
 * Cliente Supabase resiliente.
 *
 * Se o projeto Supabase estiver pausado, deletado ou sem rede, qualquer
 * chamada (auth.signIn, auth.getSession, etc.) iria falhar com
 * "Failed to fetch" e quebrar o redirect do dashboard. Para evitar isso
 * usamos um wrapper de fetch com timeout e flag offline para que o app
 * apenas redirecione ao /login em vez de travar a UI.
 */
const TIMEOUT_MS = 8000;

const safeFetch: typeof fetch = (input, init) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  return fetch(input as RequestInfo, { ...(init ?? {}), signal: ctrl.signal })
    .finally(() => clearTimeout(t));
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: { fetch: safeFetch },
});

/** Helper que nunca rejeita — retorna { data: null } em caso de erro de rede. */
export async function safeGetSession() {
  try {
    const { data } = await supabase.auth.getSession();
    return data;
  } catch {
    return { session: null };
  }
}
