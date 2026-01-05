/* TESOURA BOOT (anti-flash compatível) */
(function () {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);

  function getFrame() {
    return byId("frame") || byId("conteudo") || qs("iframe");
  }

  function getLoader() {
    return byId("frameLoader") || byId("loader") || qs(".frameLoader");
  }

  function showLoader(on) {
    const l = getLoader();
    if (!l) return;
    l.style.display = on ? "flex" : "none";
  }

  function setActive(tabId) {
    document.querySelectorAll(".tab, .tab-btn").forEach((el) => el.classList.remove("active"));
    const el =
      byId(tabId) ||
      document.querySelector(`.tab-btn[data-tab="${tabId}"]`) ||
      document.querySelector(`.tab[data-tab="${tabId}"]`);
    if (el) el.classList.add("active");
  }

  function mapUrl(tabId) {
    const cfg = window.TESOURA_CONFIG || {};
    const mapPanels = cfg.PANELS || {};
    const mapTabs = window.TESOURA_TABS || {};

    if (mapPanels[tabId]) return mapPanels[tabId];
    if (mapTabs[tabId]) return mapTabs[tabId];

    // fallback: se vier "jogadores" vira "aba-jogadores"
    const guess = "aba-" + tabId;
    if (mapPanels[guess]) return mapPanels[guess];

    return "";
  }

  function normalizeTab(tabId) {
    if (tabId === "aba-caixa" && window.TESOURA_ROLE === "diretoria" && window.TESOURA_CAN_CAIXA === false) {
      return "aba-controle";
    }
    return tabId;
  }

  function swapTo(url) {
    const fr = getFrame();
    if (!fr) return;

    showLoader(true);

    // 1) esconder imediatamente
    fr.onload = null;
    fr.style.visibility = "hidden";

    // 2) limpar para about:blank
    fr.src = "about:blank";

    // 3) só depois carregar o painel novo e mostrar no onload
    setTimeout(() => {
      fr.onload = () => {
        fr.style.visibility = "visible";
        showLoader(false);
      };
      fr.src = url;
    }, 30);
  }

  function openTab(tabId) {
    tabId = normalizeTab(tabId);
    setActive(tabId);

    const url =
      mapUrl(tabId) ||
      mapUrl("aba-controle") ||
      mapUrl("controle");

    if (!url) return;

    swapTo(url);
  }

  function wireTabs() {
    // abas por id (seu caso: aba-jogadores, aba-presenca, etc.)
    document.querySelectorAll(".tab").forEach((btn) => {
      if (!btn.id) return;
      btn.addEventListener("click", () => openTab(btn.id));
    });

    // fallback: abas por data-tab (caso exista)
    document.querySelectorAll(".tab-btn[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => openTab(btn.dataset.tab));
    });
  }

  function boot() {
    showLoader(false);
    wireTabs();

    const cfg = window.TESOURA_CONFIG || {};
    const def = cfg.DEFAULT_TAB || window.TESOURA_DEFAULT_TAB || "aba-controle";
    openTab(def);
  }

  // se o index já tiver abrirAba(), mantém e reforça o anti-flash
  if (typeof window.abrirAba === "function") {
    const old = window.abrirAba;
    window.abrirAba = function (tabId) {
      try { old(tabId); } catch (e) {}
      try { openTab(tabId); } catch (e) {}
    };
  } else {
    window.abrirAba = openTab;
  }

  window.TesouraOpenTab = openTab;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
