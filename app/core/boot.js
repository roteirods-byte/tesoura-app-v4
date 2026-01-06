/* TESOURA BOOT (login/abas/iframe) */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  const APP_PIN = "TESOURA2026";
  const DIRETORIA_PINS = ["1baidec"]; // ajuste se tiver mais

  function showLoader(on) {
    const l = $("#loader");
    if (!l) return;
    l.classList.toggle("on", !!on);
  }

  function setActiveTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
  }

  function currentTabUrl(tabId) {
    const map = window.TESOURA_TABS || {};
    return map[tabId] || "";
  }

  // anti-flash: token de navegação
  let navToken = 0;

  function getFrame() {
    // compatível com seu HTML atual: <iframe id="frame"...>
    return $("#frame") || $("#conteudo");
  }

  function hideFrame(frame) {
    if (!frame) return;
    frame.style.display = "none";
    frame.style.visibility = "hidden";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";
  }

  function showFrame(frame) {
    if (!frame) return;
    frame.style.display = "block";
    frame.style.visibility = "visible";
    frame.style.opacity = "1";
    frame.style.pointerEvents = "auto";
  }

  function withRev(url) {
    if (!url) return url;
    const rev = "v=" + Date.now();
    return url.includes("?") ? `${url}&${rev}` : `${url}?${rev}`;
  }

  function loadPanel(tabId) {
    const url = currentTabUrl(tabId);
    const old = getFrame();
    if (!old || !url) return;

    const token = ++navToken;

    // 1) some IMEDIATO com o painel antigo
    hideFrame(old);

    // 2) limpa para evitar bfcache/retorno visual
    try { old.src = "about:blank"; } catch (e) {}

    // 3) cria iframe NOVO (garante que nada “pisca”)
    const nf = document.createElement("iframe");
    nf.id = old.id; // mantém "frame"
    nf.title = "Conteúdo";
    nf.setAttribute("aria-label", "Conteúdo");
    nf.style.width = "100%";
    nf.style.height = "100%";
    nf.style.border = "0";
    hideFrame(nf);

    old.parentNode.replaceChild(nf, old);

    setActiveTab(tabId);
    showLoader(true);

    const finalUrl = withRev(url);

    nf.onload = () => {
      // só mostra se ainda for a navegação mais recente
      if (token !== navToken) return;
      showFrame(nf);
      showLoader(false);
    };

    // 4) garante 1 “frame” de pintura antes de carregar o painel (reduz flash)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (token !== navToken) return;
        nf.src = finalUrl;
      });
    });
  }

  function bootTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab;
        if (!tabId) return;
        loadPanel(tabId);
      });
    });
  }

  // bfcache: quando volta pelo “voltar/avançar”, esconde tudo imediatamente
  window.addEventListener("pageshow", () => {
    const fr = getFrame();
    if (fr) {
      hideFrame(fr);
      try { fr.src = "about:blank"; } catch (e) {}
    }
    showLoader(false);
  });

  // LOGIN
  function showLoginModal(on) {
    const m = $("#loginModal");
    if (!m) return;
    m.classList.toggle("on", !!on);
  }

  function setRole(role) {
    // role: "jogador" | "diretoria"
    window.TESOURA_ROLE = role;
    const pill = $("#rolePill");
    if (pill) pill.textContent = role === "diretoria" ? "DIRETORIA (edita)" : "JOGADOR (visual)";
  }

  function initLogin() {
    const pinJog = $("#pinJog");
    const pinDir = $("#pinDir");
    const btnJog = $("#btnJog");
    const btnDir = $("#btnDir");

    if (!btnJog || !btnDir || !pinJog || !pinDir) return;

    showLoginModal(true);

    btnJog.addEventListener("click", () => {
      if ((pinJog.value || "").trim() !== APP_PIN) return;
      setRole("jogador");
      showLoginModal(false);
      // abre a primeira aba padrão
      loadPanel("jogadores");
    });

    btnDir.addEventListener("click", () => {
      const v = (pinDir.value || "").trim();
      if (!DIRETORIA_PINS.includes(v)) return;
      setRole("diretoria");
      showLoginModal(false);
      loadPanel("jogadores");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bootTabs();
    initLogin();
  });
})();
