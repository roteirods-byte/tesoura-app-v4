/**
 * TESOURA - CORE CONFIG (central)
 */
window.TESOURA_CONFIG = {
  APP_NAME: "TESOURA",
  APP_VERSION: "v4",

  // SUPABASE (dados do projeto)
  SUPABASE_URL: "https://xuplzpispukvtggjasxx.supabase.co",
  // Use sempre a chave pública do front: anon public / publishable
  SUPABASE_ANON_KEY: "sb_publishable_uGvmPC40FfyxzS6Kh1gNHg_AO9wJ6kg",

  // PIN do modo Jogadores (somente visualização)
  PIN_JOGADORES: "TESOURA2026",

  // Diretoria por PIN (mais rápido pra finalizar agora)
  DIRETORIA_PINS: {
    "1baidec": { caixa: true },
    "2thiago": { caixa: true },
    "3love":   { caixa: false },
    "4le":     { caixa: false },
    "5titi":   { caixa: false }
  }
};
