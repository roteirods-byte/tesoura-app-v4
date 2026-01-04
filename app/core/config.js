/* TESOURA CONFIG (central) */
window.TESOURA_CONFIG = {
  // Jogadores (visual)
  APP_PIN: "TESOURA2026",

  // Diretoria (PIN -> permissões)
  DIRETORIA_PINS: {
    "1baidec": { caixa: true  },
    "2thiago": { caixa: true  },
    "3love":   { caixa: false },
    "4le":     { caixa: false },
    "5titi":   { caixa: false }
  },

  // Abas -> páginas (IFRAME)
  PANELS: {
    "aba-jogadores": "tesoura_jogadores_teste.html",
    "aba-presenca":  "tesoura_presenca_escala_R5.html",
    "aba-controle":  "tesoura_controle_geral_teste.html",
    "aba-mensalidade":"tesoura_mensalidade_R4.html",
    "aba-caixa":     "tesoura_caixa_teste.html",
    "aba-gols":      "tesoura_gols.html",
     },

  DEFAULT_TAB: "aba-controle"
};
