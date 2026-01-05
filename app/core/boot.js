/* TESOURA BOOT (destrava login/abas/iframe) */
(function(){
  "use strict";

  const $ = (sel, root=document) => root.querySelector(sel);

  function showLoader(on){
    const l = $("#loader");
    if(!l) return;
    l.classList.toggle("on", !!on);
  }

  function setActiveTab(tabId){
    document.querySelectorAll(".tab-btn").forEach(btn=>{
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
  }

  function currentTabUrl(tabId){
    const map = window.TESOURA_TABS || {};
    return map[tabId] || "";
  }

  function openTab(tabId){
    const frame = $("#conteudo");
    const url = currentTabUrl(tabId);
    if(!frame || !url) return;

    setActiveTab(tabId);

    // ANTI-FLASH (definitivo):
    // 1) esconde o iframe imediatamente
    // 2) limpa para about:blank
    // 3) só depois carrega o painel novo
    showLoader(true);
    frame.onload = null;
    frame.style.visibility = "hidden";
    frame.src = "about:blank";

    // dá 1 tick para o browser aplicar o "blank" antes do novo src
    setTimeout(()=>{
      frame.onload = () => {
        // só mostra quando o painel terminou de carregar
        frame.style.visibility = "visible";
        showLoader(false);
      };
      frame.src = url;
    }, 0);
  }

  function hookTabs(){
    document.querySelectorAll(".tab-btn").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const tab = btn.dataset.tab;
        openTab(tab);
      });
    });
  }

  function hookLogin(){
    const btnLogin = $("#btnLogin");
    if(!btnLogin) return;
    btnLogin.addEventListener("click", ()=>{
      const modal = $("#modalLogin");
      if(modal) modal.classList.add("open");
    });
    const btnClose = $("#btnCloseLogin");
    if(btnClose){
      btnClose.addEventListener("click", ()=>{
        const modal = $("#modalLogin");
        if(modal) modal.classList.remove("open");
      });
    }
  }

  function boot(){
    hookTabs();
    hookLogin();

    // abre aba padrão (ou a primeira)
    const first = document.querySelector(".tab-btn");
    const defaultTab = (window.TESOURA_DEFAULT_TAB || (first ? first.dataset.tab : null));
    if(defaultTab) openTab(defaultTab);
  }

  // expõe openTab para debug se precisar
  window.TesouraOpenTab = openTab;

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
