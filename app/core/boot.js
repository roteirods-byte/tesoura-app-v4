/* TESOURA BOOT — Patch V5 (anti-flash iframe + cache-buster + bfcache) */
(function () {
  "use strict";

  const REV = "v5_3_2026-01-05";

  const TABS = {
    "aba-jogadores": "tesoura_jogadores_teste.html",
    "aba-presenca": "tesoura_presenca_escala_R5.html",
    "aba-controle": "tesoura_controle_geral_teste.html",
    "aba-mensalidade": "tesoura_mensalidade_R4.html",
    "aba-caixa": "tesoura_caixa_teste.html",
    "aba-gols": "tesoura_gols.html"
  };

  const $id = (id) => document.getElementById(id);

  const frame = $id("frame");
  const loader = $id("frameLoader");
  const overlay = $id("overlay");

  const btnLogin = $id("btnLogin");
  const btnSair = $id("btnSair");
  const badge = $id("badge");

  const inJog = $id("senhaJogador");
  const inDir = $id("senhaDiretor");
  const btnJog = $id("btnEntrarJogadores");
  const btnDir = $id("btnEntrarDiretoria");
  const loginMsg = $id("loginMsg");

  const tabCaixa = $id("aba-caixa");

  function setLoader(on) {
    if (!loader) return;
    loader.classList.toggle("on", !!on);
  }

  function hideFrame() {
    if (!frame) return;
    frame.classList.remove("frame-on");
  }

  function showFrame() {
    if (!frame) return;
    frame.classList.add("frame-on");
  }

  function hardBlankFrame() {
    if (!frame) return;
    try {
      frame.onload = null;
      frame.src = "about:blank";
    } catch (_) {}
    hideFrame();
  }

  function cacheBust(url) {
    const sep = url.includes("?") ? "&" : "?";
    return url + sep + "rev=" + encodeURIComponent(REV) + "&_=" + Date.now();
  }

  function setActiveTab(tabId) {
    document.querySelectorAll(".tab").forEach((btn) => {
      btn.classList.toggle("active", btn.id === tabId);
    });
  }

  function modeLabel(mode) {
    if (mode === "diretoria") return "DIRETORIA";
    if (mode === "jogador") return "JOGADOR (VISUAL)";
    return "LOGIN";
  }

  function getMode() {
    // session.js expõe TESOURA.getMode(); fallback localStorage
    try {
      if (window.TESOURA && typeof window.TESOURA.getMode === "function") {
        return window.TESOURA.getMode();
      }
    } catch (_) {}
    return localStorage.getItem("tesoura_mode") || "";
  }

  function setMode(mode) {
    try {
      if (window.TESOURA && typeof window.TESOURA.setMode === "function") {
        window.TESOURA.setMode(mode);
        return;
      }
    } catch (_) {}
    localStorage.setItem("tesoura_mode", mode);
  }

  function clearMode() {
    try {
      if (window.TESOURA && typeof window.TESOURA.clearMode === "function") {
        window.TESOURA.clearMode();
      } else {
        localStorage.removeItem("tesoura_mode");
      }
    } catch (_) {
      localStorage.removeItem("tesoura_mode");
    }
  }

  function showOverlay(on) {
    if (!overlay) return;
    overlay.style.display = on ? "flex" : "none";
  }

  function updateUI() {
    const mode = getMode();

    // Badge
    if (badge) badge.textContent = modeLabel(mode);

    // Botões topo
    if (btnSair) btnSair.style.display = mode ? "inline-flex" : "none";
    if (btnLogin) btnLogin.style.display = mode ? "none" : "inline-flex";

    // CAIXA só na diretoria
    if (tabCaixa) {
      const allowed = (mode === "diretoria");
      tabCaixa.disabled = !allowed;
      tabCaixa.classList.toggle("disabled", !allowed);
    }
  }

  async function openTab(tabId) {
    const rawUrl = TABS[tabId];
    if (!rawUrl || !frame) return;

    const mode = getMode();
    if (tabId === "aba-caixa" && mode !== "diretoria") {
      alert("CAIXA: acesso restrito à Diretoria.");
      return;
    }

    setActiveTab(tabId);

    // Esconde imediatamente (evita ver o painel anterior durante o carregamento)
    setLoader(true);
    hardBlankFrame();

    const url = cacheBust(rawUrl);

    // Fallback: se o onload não disparar (cache/erro), libera a tela
    const fallback = setTimeout(() => {
      setLoader(false);
      showFrame();
    }, 4500);

    frame.onload = () => {
      clearTimeout(fallback);
      setLoader(false);
      showFrame();
      frame.onload = null;
    };

    frame.src = url;
    localStorage.setItem("tesoura_last_tab", tabId);
  }

  function openDefaultTab() {
    const mode = getMode();
    const last = localStorage.getItem("tesoura_last_tab") || "";
    const safeLast = (last && TABS[last]) ? last : "";

    // Jogador: sempre começa em JOGADORES
    if (mode === "jogador") return openTab("aba-jogadores");

    // Diretoria: tenta last (se não for CAIXA), senão controle
    if (mode === "diretoria") {
      if (safeLast && safeLast !== "aba-caixa") return openTab(safeLast);
      return openTab("aba-controle");
    }
  }

  function doLogin(mode) {
    const pinOk =
      (mode === "jogador" && (inJog?.value || "").trim() === (window.TESOURA_CONFIG?.JOGADOR_PIN || "")) ||
      (mode === "diretoria" && (inDir?.value || "").trim() === (window.TESOURA_CONFIG?.DIRETORIA_PIN || ""));

    if (!pinOk) {
      if (loginMsg) loginMsg.textContent = "Senha incorreta.";
      return;
    }

    if (loginMsg) loginMsg.textContent = "";
    setMode(mode);
    showOverlay(false);
    updateUI();
    openDefaultTab();
  }

  function doLogout() {
    clearMode();
    updateUI();
    showOverlay(true);
    setLoader(false);
    hardBlankFrame();
  }

  function bindEvents() {
    // Tabs
    document.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const mode = getMode();
        if (!mode) {
          showOverlay(true);
          return;
        }
        openTab(btn.id);
      });
    });

    // Login / sair
    if (btnLogin) btnLogin.addEventListener("click", () => showOverlay(true));
    if (btnSair) btnSair.addEventListener("click", () => doLogout());

    // Entrar
    if (btnJog) btnJog.addEventListener("click", () => doLogin("jogador"));
    if (btnDir) btnDir.addEventListener("click", () => doLogin("diretoria"));

    // Enter nos campos
    if (inJog) inJog.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doLogin("jogador");
    });
    if (inDir) inDir.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doLogin("diretoria");
    });

    // bfcache: antes de sair da página, já esconde o iframe (evita “flash” ao voltar)
    window.addEventListener("pagehide", () => {
      setLoader(true);
      hardBlankFrame();
    });

    // quando voltar (bfcache), reabre o painel sem mostrar o anterior
    window.addEventListener("pageshow", (ev) => {
      if (ev && ev.persisted) {
        setLoader(false);
        hardBlankFrame();
        showOverlay(true); // sempre pede senha (regra do JORGE)
      }
    });
  }

  function disableServiceWorker() {
    // evita versão antiga aparecer por cache do SW
    try {
      if (!("serviceWorker" in navigator)) return;
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
    } catch (_) {}
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Sempre pede senha ao abrir (sem “auto-login”)
    updateUI();
    showOverlay(true);
    hardBlankFrame();
    bindEvents();
    disableServiceWorker();
  });
})();
