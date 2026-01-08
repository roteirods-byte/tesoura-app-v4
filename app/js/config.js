// Fonte única de configuração do Tesoura (v4)
// Este arquivo pode ficar na raiz (config.js) e/ou em app/js/config.js.
// Importante: usa MERGE para não apagar configurações já existentes.
(function () {
  const prev = (window.TESOURA_CONFIG && typeof window.TESOURA_CONFIG === "object") ? window.TESOURA_CONFIG : {};

  window.TESOURA_CONFIG = Object.assign({}, prev, {
    // Supabase
    SUPABASE_URL: "https://xuplzpispukvtggjasxx.supabase.co",
    // Pode ser SUPABASE_KEY ou SUPABASE_ANON_KEY — o CAIXA aceita ambos
    SUPABASE_KEY: "sb_publishable_uGvmPC40FfyxzS6Kh1gNHg_AO9wJ6kg",

    // Login / Diretores (visual)
    APP_PIN: "TESOURA2026",
    DIRETORES: {
      "1baidec": { caixa: true },
      "2thiago": { caixa: true },
      "3love":   { caixa: false },
      "4le":     { caixa: false },
      "5titi":   { caixa: false }
    }
  });
})();
