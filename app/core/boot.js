/* TESOURA BOOT (anti-flash definitivo v5.1)
   - Trava qualquer click/onclick antigo (capture + stopPropagation)
   - Sempre cria IFRAME NOVO a cada navegação (zera conteúdo anterior)
   - Cache-buster por navegação (evita HTML antigo)
   - Protege contra BFCache (pageshow.persisted)
*/

(function () {
  "use strict";

  // Altere o valor abaixo quando quiser forçar atualização geral.
  // (não precisa ser data real; pode ser v5_1, v5_2, etc.)
  const REV = "v5_1";

  let navToken = 0;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

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
    return window.TESOURA_TABS || {};
  }

  function setActiveTab(tabId) {
    qsa(".tab, .tab-btn, [data-tab]").forEach((btn) => {
      const tid = btn?.dataset?.tab;
      if (!tid) return;
      btn.classList.toggle("active", tid === tabId);
    });
  }

  function getTabBtnFromEvent(e) {
    const t = e.target;
    if (!t || !t.closest) return null;
    return t.closest(".tab, .tab-btn, [data-tab]");
  }

  // Garante 1 único iframe e já inicia escondido/blank
  function ensureSingleIframe() {
    const iframes = qsa("iframe");
    let frame = qs("#conteudo") || iframes[0];

    if (!frame) {
      frame = document.createElement("iframe");
      frame.id = "conteudo";
      frame.title = "Conteúdo";
      frame.style.width = "100%";
      frame.style.height = "100%";
      frame.style.border = "0";
      (qs("#conteudoWrap") || document.body).appendChild(frame);
    }

    // Remove qualquer outro iframe “fantasma”
    iframes.forEach((f) => {
      if (f !== frame) f.remove();
    });

    // Esconde e zera imediatamente
    frame.style.visibility = "hidden";
    try {
      frame.src = "about:blank";
    } catch (_) {}

    return frame;
  }

  function openTab(tabId) {
    const map = getTabMap();
    const url = map[tabId];
    if (!url) return;

    const token = ++navToken;

    setLoader(true);
    setActiveTab(tabId);

    // Salva última aba
    try {
      localStorage.setItem("TESOURA_LAST_TAB", tabId);
    } catch (_) {}

    // SEMPRE cria iframe novo (mata o flash)
    const old = ensureSingleIframe();
    const fresh = document.createElement("iframe");
    fresh.id = "conteudo";
    fresh.title = "Conteúdo";
    fresh.style.width = old.style.width || "100%";
    fresh.style.height = old.style.height || "100%";
    fresh.style.border = old.style.border || "0";
    fresh.style.visibility = "hidden";
    fresh.setAttribute("referrerpolicy", "no-referrer");

    old.replaceWith(fresh);

    fresh.onload = () => {
      if (token !== navToken) return; // navegação antiga, ignora
      fresh.style.visibility = "visible";
      setLoader(false);
    };

    const finalUrl = buildUrl(url);

    // 2 ticks: garante “blank” antes do src final
    setTimeout(() => {
      if (token !== navToken) return;
      try {
        fresh.src = "about:blank";
      } catch (_) {}
      setTimeout(() => {
        if (token !== navToken) return;
        fresh.src = finalUrl;
      }, 0);
    }, 0);
  }

  function init() {
    ensureSingleIframe();

    // 1) BLOQUEIA qualquer onclick antigo (inclusive inline)
    //    Capture phase + stopPropagation = só o boot manda
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

    // 2) Compatibilidade com código legado: se algum lugar chamar abrirAba(...)
    window.abrirAba = openTab;

    // 3) BFCache: se voltar do histórico “congelado”, recarrega pra não mostrar iframe antigo
    window.addEventListener("pageshow", (e) => {
      if (e && e.persisted) {
        location.reload();
      }
    });

    // 4) Abre a aba inicial
    const map = getTabMap();
    let initial = null;

    try {
      initial = localStorage.getItem("TESOURA_LAST_TAB");
    } catch (_) {}

    if (initial && map[initial]) {
      openTab(initial);
      return;
    }

    const active = qs(".tab.active, .tab-btn.active, [data-tab].active");
    const tid = active?.dataset?.tab;
    if (tid && map[tid]) openTab(tid);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
