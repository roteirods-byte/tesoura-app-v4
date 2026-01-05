/* TESOURA BOOT — PATCH V5.2 (FRAME id="frame")
   - Trava qualquer click/onclick antigo (capture + stopPropagation)
   - Sempre cria IFRAME NOVO a cada troca de aba (elimina “flash”)
   - Cache-buster por navegação
   - Protege BFCache (pageshow.persisted)
*/
(function () {
  "use strict";

  const REV = "v5_2";
  let navToken = 0;

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setLoader(on) {
    const l = qs("#loader");
    if (!l) return;
    l.classList.toggle("on", !!on);
  }

  function buildUrl(u) {
    if (!u) return "";
    const sep = u.includes("?") ? "&" : "?";
    return `${u}${sep}rev=${encodeURIComponent(REV)}_${Date.now()}`;
  }

  function getTabMap() {
    return window.TESOURA_TABS || (window.TESOURA_CONFIG && window.TESOURA_CONFIG.PANELS) || {};
  }

  function setActiveTab(tabId) {
    qsa("[data-tab]").forEach((btn) => {
      const tid = btn?.dataset?.tab;
      if (!tid) return;
      btn.classList.toggle("active", tid === tabId);
    });
  }

  function getTabBtnFromEvent(e) {
    const t = e.target;
    if (!t || !t.closest) return null;
    return t.closest("[data-tab]");
  }

  function getFrameWrap() {
    // container do iframe (normalmente o pai do #frame)
    const fr = qs("#frame");
    return fr?.parentElement || qs("#conteudoWrap") || qs(".conteudoWrap") || qs("main") || document.body;
  }

  function ensureSingleIframe() {
    const wrap = getFrameWrap();
    let frame = qs("#frame") || qs("iframe", wrap) || qs("iframe");

    if (!frame) {
      frame = document.createElement("iframe");
      frame.id = "frame";
      frame.title = "Conteúdo";
      frame.style.width = "100%";
      frame.style.height = "100%";
      frame.style.border = "0";
      wrap.appendChild(frame);
    }

    // remove iframes extras (fantasmas)
    qsa("iframe").forEach((f) => {
      if (f !== frame) f.remove();
    });

    // começa escondido e em branco
    frame.style.visibility = "hidden";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";
    try { frame.src = "about:blank"; } catch (_) {}

    return frame;
  }

  function showFrame(frame) {
    frame.style.visibility = "visible";
    frame.style.opacity = "1";
    frame.style.pointerEvents = "auto";
  }

  function hideFrame(frame) {
    frame.style.visibility = "hidden";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";
  }

  function openTab(tabId) {
    const map = getTabMap();
    const url = map[tabId];
    if (!url) return;

    const token = ++navToken;

    setLoader(true);
    setActiveTab(tabId);

    try { localStorage.setItem("TESOURA_LAST_TAB", tabId); } catch (_) {}

    // garante iframe único e esconde já
    const old = ensureSingleIframe();

    // cria IFRAME NOVO (id=frame) para matar qualquer conteúdo anterior
    const fresh = document.createElement("iframe");
    fresh.id = "frame";
    fresh.title = "Conteúdo";
    fresh.style.width = old.style.width || "100%";
    fresh.style.height = old.style.height || "100%";
    fresh.style.border = old.style.border || "0";
    hideFrame(fresh);

    // substitui imediatamente (assim o velho some na hora)
    old.replaceWith(fresh);

    fresh.onload = () => {
      if (token !== navToken) return;
      showFrame(fresh);
      setLoader(false);
    };

    fresh.onerror = () => {
      if (token !== navToken) return;
      setLoader(false);
      // mantém escondido, evita “flash”
      hideFrame(fresh);
      console.error("Erro ao carregar painel:", tabId, url);
    };

    const finalUrl = buildUrl(url);

    // força blank antes do src final (duplo tick)
    setTimeout(() => {
      if (token !== navToken) return;
      try { fresh.src = "about:blank"; } catch (_) {}
      setTimeout(() => {
        if (token !== navToken) return;
        fresh.src = finalUrl;
      }, 0);
    }, 0);
  }

  function init() {
    ensureSingleIframe();

    // BLOQUEIA onclick antigo de abas (capture phase)
    document.addEventListener(
      "click",
      (e) => {
        const btn = getTabBtnFromEvent(e);
        if (!btn) return;

        const tabId = btn?.dataset?.tab;
        if (!tabId) return;

        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();

        openTab(tabId);
      },
      true
    );

    // compatibilidade: se algum código chamar abrirAba(...)
    window.abrirAba = openTab;

    // BFCache: se voltar do histórico congelado, recarrega
    window.addEventListener("pageshow", (e) => {
      if (e && e.persisted) location.reload();
    });

    // abre última aba (ou a ativa)
    const map = getTabMap();
    let initial = "";
    try { initial = localStorage.getItem("TESOURA_LAST_TAB") || ""; } catch (_) {}

    if (initial && map[initial]) return openTab(initial);

    const active = qs("[data-tab].active");
    const tid = active?.dataset?.tab;
    if (tid && map[tid]) return openTab(tid);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
