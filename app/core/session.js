/**
 * TESOURA - CORE SESSION
 * Guarda o modo atual sem depender de variáveis espalhadas.
 */
window.TESOURA = window.TESOURA || {};

TESOURA.sessionSet = function (key, value) {
  localStorage.setItem("tesoura_" + key, JSON.stringify(value));
};

TESOURA.sessionGet = function (key, fallback) {
  const raw = localStorage.getItem("tesoura_" + key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
};

TESOURA.sessionClear = function () {
  Object.keys(localStorage)
    .filter(k => k.startsWith("tesoura_"))
    .forEach(k => localStorage.removeItem(k));
};

// modos: "jogadores" | "diretoria"
TESOURA.setMode = function (mode) { TESOURA.sessionSet("mode", mode); };
TESOURA.getMode = function () { return TESOURA.sessionGet("mode", null); };
