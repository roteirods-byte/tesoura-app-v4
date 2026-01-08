// config.js (TESOURA)
// Mantém compatibilidade: TESOURA_CONFIG + SUPABASE_URL/ANON_KEY em window

window.TESOURA_CONFIG = Object.assign({}, window.TESOURA_CONFIG || {}, {
  APP_PIN: "TESOURA2026",

  // Supabase (cliente)
  SUPABASE_URL: "https://xumsbprhlpqnulskldrl.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_qtRHm8yo7PXADifAIaxqNM_0Z6kS9U4C8NfNUZTxH6uR5NjZcOknVBJ3LLb4QhE2",

  // Diretoria (edita) + regra do CAIXA
  // true = com CAIXA | false = sem CAIXA
  DIRETORES: {
    "baideck": { caixa: true },
    "thiago":  { caixa: true },
    "slove":   { caixa: false },
    "4le":     { caixa: false },
    "titi":    { caixa: false }
  }
});

// Compatibilidade para painéis antigos:
window.SUPABASE_URL = window.TESOURA_CONFIG.SUPABASE_URL;
window.SUPABASE_ANON_KEY = window.TESOURA_CONFIG.SUPABASE_ANON_KEY;
