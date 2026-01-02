/**
 * TESOURA - CORE SUPABASE
 * Um único client para todo o app.
 */
window.TESOURA = window.TESOURA || {};

TESOURA.getSupabase = function () {
  if (!window.supabase || !window.supabase.createClient) {
    throw new Error("Supabase JS não carregou. Verifique o <script src> do Supabase.");
  }
  if (!window.TESOURA_CONFIG || !TESOURA_CONFIG.SUPABASE_URL || !TESOURA_CONFIG.SUPABASE_ANON_KEY) {
    throw new Error("TESOURA_CONFIG incompleto (SUPABASE_URL / SUPABASE_ANON_KEY).");
  }
  if (!TESOURA._client) {
    TESOURA._client = supabase.createClient(
      TESOURA_CONFIG.SUPABASE_URL,
      TESOURA_CONFIG.SUPABASE_ANON_KEY
    );
  }
  return TESOURA._client;
};

TESOURA.getUserEmail = async function () {
  const sb = TESOURA.getSupabase();
  const { data } = await sb.auth.getUser();
  return data?.user?.email || null;
};

TESOURA.canUseCaixa = async function () {
  const email = await TESOURA.getUserEmail();
  if (!email) return false;
  return !!(TESOURA_CONFIG.CAIXA_PERMITIDOS && TESOURA_CONFIG.CAIXA_PERMITIDOS[email] === true);
};
