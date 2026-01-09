/* TESOURA CONFIG (central) */
window.TESOURA_CONFIG = {
  // Jogadores (visual)
  APP_PIN: "TESOURA2026",
  // Supabase (cliente do app)
  SUPABASE_URL: "COLE_AQUI_SUA_SUPABASE_URL",
  SUPABASE_ANON_KEY: "COLE_AQUI_SUA_SUPABASE_ANON_KEY",

  // Diretoria (PIN -> permissões)
  DIRETORIA_PINS: {
    "1baidec": { caixa: true  },
    "2thiago": { caixa: true  },
    "3love":   { caixa: false },
    "4le":     { caixa: false },
    "5titi":   { caixa: false }
  },

  // Supabase (fonte única)
  SUPABASE_URL: "https://xuplzpispukvtggjasxx.supabase.co",
  SUPABASE_KEY: "sb_publishable_uGvmPC40FfyxzS6Kh1gNHg_AO9wJ6kg",
  // compat: alguns painéis usam "SUPABASE_ANON_KEY"
  SUPABASE_ANON_KEY: "sb_publishable_uGvmPC40FfyxzS6Kh1gNHg_AO9wJ6kg",
  // compat: painel CAIXA procura TESOURA_CONFIG.SUPABASE.url/key
  SUPABASE: { url: "https://xuplzpispukvtggjasxx.supabase.co", key: "sb_publishable_uGvmPC40FfyxzS6Kh1gNHg_AO9wJ6kg", anonKey: "sb_publishable_uGvmPC40FfyxzS6Kh1gNHg_AO9wJ6kg" },

// Abas -> páginas (IFRAME)
  PANELS: {
    "aba-jogadores": "tesoura_jogadores_teste.html",
    "aba-presenca":  "tesoura_presenca_escala_R5.html",
    "aba-controle":  "tesoura_controle_geral_teste.html",
    "aba-mensalidade":"tesoura_mensalidade_R4.html",
    "aba-caixa":     "tesoura_caixa_teste.html",
    "aba-gols":      "tesoura_gols_teste.html",
     },

  DEFAULT_TAB: "aba-controle"
};


// ===== API (Cloud Run) =====
window.TESOURA_CONFIG = window.TESOURA_CONFIG || {};
window.TESOURA_CONFIG.API_BASE = "https://tesoura-api-quutkunkda-uc.a.run.app";
