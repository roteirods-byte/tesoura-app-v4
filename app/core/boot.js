/* TESOURA BOOT (login/abas/iframe) — Patch V6 */
(() => {
  "use strict";

  const VERSION = "v6_2026-01-05";

  const $ = (sel, root = document) => root.querySelector(sel);

  // --- UI helpers
  function showLoader(on) {
    const el = $("#loader");
    if (!el) return;
    el.classList.toggle("on", !!on);
  }

  function setBadge(text) {
    const el = $("#badgeMode");
    if (el) el.textContent = text || "---";
  }

  function msg(text) {
    const el = $("#msg");
    if (!el) return;
    el.textContent = text || "";
    if (text) setTimeout(() => { if (el.textContent === text) el.textContent = ""; }, 2500);
  }

  function hideFrame() {
    const fr = $("#frame");
    if (!fr) return;
    fr.style.visibility = "hidden";
    fr.style.opacity = "0";
    fr.style.pointerEvents = "none";
  }

  function showFrame() {
    const fr = $("#frame");
    if (!fr) return;
    fr.style.visibility = "visible";
    fr.style.opacity = "1";
    fr.style.pointerEvents = "auto";
  }

  // --- abas
  function tabMap() {
    // nomes oficiais do repo
    return {
      jogadores: "tesoura_jogadores_teste.html",
      presenca: "tesoura_presenca_escala_R5.html",
      controle: "tesoura_controle_geral_teste.html",
      mensalidade: "tesoura_mensalidade_R4.html",
      caixa: "tesoura_caixa_teste.html",
      gols: "tesoura_gols_teste.html",
    };
  }

  function setActiveTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
  }

  function canUseCaixa() {
    const mode = (window.session?.get?.("mode") || "").toLowerCase();
    // diretoria pode tudo; jogador visual sem caixa (como você pediu antes)
    return mode === "diretoria";
  }

  function refreshPermissionsUI() {
    const caixaBtn = $("#tab-caixa");
    if (caixaBtn) caixaBtn.disabled = !canUseCaixa();
  }

  function currentTabUrl(tabId) {
    const map = tabMap();
    const file = map[tabId] || "";
    if (!file) return "";
    // cache-buster forte (evita voltar conteúdo antigo)
    const bust = `${VERSION}_${Date.now()}`;
    const sep = file.includes("?") ? "&" : "?";
    return `${file}${sep}rev=${encodeURIComponent(bust)}`;
  }

  function openTab(tabId) {
    const fr = $("#frame");
    const url = currentTabUrl(tabId);
    if (!fr || !url) return;

    // Permissão do CAIXA
    if (tabId === "caixa" && !canUseCaixa()) {
      msg("CAIXA: acesso apenas Diretoria.");
      return;
    }

    setActiveTab(tabId);
    showLoader(true);

    // ANTI-FLASH definitivo:
    // 1) esconde iframe
    // 2) limpa para about:blank
    // 3) só então carrega a aba nova (com cache-buster)
    hideFrame();
    fr.onload = null;

    try { fr.src = "about:blank"; } catch {}

    // Carrega na próxima “virada” do browser (evita mostrar resíduo)
    requestAnimationFrame(() => {
      fr.onload = () => {
        showLoader(false);
        // mostra só depois de carregar
        showFrame();
        // salva última aba
        try { window.session?.set?.("lastTab", tabId); } catch {}
      };
      fr.src = url;
    });
  }

  // --- login
  function pins() {
    const cfg = window.TESOURA_CONFIG || {};
    return {
      jogador: String(cfg.pin_jogador || "TESOURA2026"),
      diretoria: String(cfg.pin_diretoria || "1baidec"),
    };
  }

  function showLogin() {
    const ov = $("#loginOverlay");
    if (ov) ov.style.display = "flex";
    $("#btnLogin")?.classList.add("orange");
    $("#btnSair")?.classList.remove("orange");
    hideFrame();
  }

  function hideLogin() {
    const ov = $("#loginOverlay");
    if (ov) ov.style.display = "none";
    $("#btnLogin")?.classList.remove("orange");
    $("#btnSair")?.classList.add("orange");
  }

  function enterAs(mode) {
    const m = String(mode || "").toLowerCase();
    window.session?.set?.("mode", m === "diretoria" ? "diretoria" : "jogador");
    setBadge(m === "diretoria" ? "DIRETORIA (edita)" : "JOGADOR (visual)");
    refreshPermissionsUI();
    hideLogin();

    // abre a última aba usada; se não, abre PRESENÇA (mais usado no dia)
    const last = window.session?.get?.("lastTab") || "presenca";
    openTab(last);
  }

  function tryLoginJogador() {
    const p = pins();
    const v = String($("#pinJog")?.value || "").trim();
    if (v !== p.jogador) { msg("Senha incorreta (Jogadores)."); return; }
    enterAs("jogador");
  }

  function tryLoginDiretoria() {
    const p = pins();
    const v = String($("#pinDir")?.value || "").trim();
    if (v !== p.diretoria) { msg("Senha incorreta (Diretoria)."); return; }
    enterAs("diretoria");
  }

  function logout() {
    // não apaga tudo; só força voltar ao login
    showLogin();
    setBadge("---");
    refreshPermissionsUI();
    showLoader(false);
    const fr = $("#frame");
    if (fr) {
      hideFrame();
      try { fr.src = "about:blank"; } catch {}
    }
  }

  // --- eventos
  function bind() {
    // Tabs
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => openTab(btn.dataset.tab));
    });

    // Login overlay
    $("#btnEntrarJogadores")?.addEventListener("click", tryLoginJogador);
    $("#btnEntrarDiretoria")?.addEventListener("click", tryLoginDiretoria);

    // Enter no input
    $("#pinJog")?.addEventListener("keydown", (e) => { if (e.key === "Enter") tryLoginJogador(); });
    $("#pinDir")?.addEventListener("keydown", (e) => { if (e.key === "Enter") tryLoginDiretoria(); });

    // Top buttons
    $("#btnLogin")?.addEventListener("click", showLogin);
    $("#btnSair")?.addEventListener("click", logout);

    // BFCache: se voltar “do nada”, força estado consistente
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) {
        // volta de cache: esconde frame e reabre com bust
        hideFrame();
        showLoader(false);
        refreshPermissionsUI();

        const mode = window.session?.get?.("mode");
        if (!mode) { showLogin(); return; }
        hideLogin();
        const last = window.session?.get?.("lastTab") || "presenca";
        openTab(last);
      }
    });

    // Ao sair da página, limpa iframe pra não “vazar” na volta
    window.addEventListener("pagehide", () => {
      const fr = $("#frame");
      if (!fr) return;
      hideFrame();
      try { fr.src = "about:blank"; } catch {}
    });
  }

  // --- boot
  function boot() {
    showLoader(false);
    hideFrame();

    // Config carregada? (não bloqueia se falhar)
    refreshPermissionsUI();

    const mode = window.session?.get?.("mode");
    if (!mode) {
      showLogin();
      return;
    }

    // Se já tem sessão salva
    setBadge(mode === "diretoria" ? "DIRETORIA (edita)" : "JOGADOR (visual)");
    hideLogin();
    refreshPermissionsUI();

    const last = window.session?.get?.("lastTab") || "presenca";
    openTab(last);
  }

  document.addEventListener("DOMContentLoaded", () => {
    bind();
    boot();
  });
})();
