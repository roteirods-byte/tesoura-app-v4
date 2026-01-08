// /config.js
// Fonte única de configuração do v4

window.TESOURA_CONFIG = {
  // Jogadores (visual)
  APP_PIN: "TESOURA2026",

  // Diretoria (edita) + regra do CAIXA
  // true = COM CAIXA | false = SEM CAIXA
  DIRETORES: {
    "baidec": { caixa: true },
    "thiago": { caixa: true },
    "slove":  { caixa: false },
    "4le":    { caixa: false },
    "titi":   { caixa: false }
  },

  // >>> SUPABASE (OBRIGATÓRIO pro CAIXA funcionar)
  SUPABASE_URL: "https://xuplzpispukvtggjasxx.supabase.co",
  SUPABASE_KEY: "sb_publishable_uGvmPC40FfyxzS6Kh1gNHg_AO9wJ6kg"
};
