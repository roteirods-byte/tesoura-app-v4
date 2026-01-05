/* TESOURA BOOT (destrava login/abas/iframe) */
(function(){
  const $ = (id)=>document.getElementById(id);
  const qs = (s)=>document.querySelector(s);

  function setTopMsg(txt){
    const el = $("msg") || $("loginMsg") || $("msgTelaInicial");
    if(el) el.textContent = txt || "";
  }

  function setBadge(txt){
    const b = $("badge") || qs(".badge");
    if(b) b.textContent = txt || "";
  }

  function showOverlay(show){
    const ov = $("overlay") || qs(".overlay");
    if(ov) ov.style.display = show ? "flex" : "none";
  }

  function activeTab(tabId){
    document.querySelectorAll(".tab, .tabBtn").forEach(el=>el.classList.remove("active"));
    const t = $(tabId);
    if(t) t.classList.add("active");
  }

  function applyCaixaVisibility(){
    const can = !!window.TESOURA_CAN_CAIXA;
    const caixa = $("aba-caixa");
    if(caixa) caixa.style.display = can ? "" : "none";
  }

  function loadPanel(tabId){
    const cfg = window.TESOURA_CONFIG || {};
    const map = cfg.PANELS || {};
    const frame = $("frame");
    if(!frame) return setTopMsg("ERRO: iframe #frame não encontrado.");


      // ANTI-PISCA: esconde o quadro antes de trocar a página
      frame.style.visibility = "hidden";
      frame.onload = () => { frame.style.visibility = "visible"; };
    const url = map[tabId];
    if(!url) return setTopMsg("ERRO: aba sem página: " + tabId);

    activeTab(tabId);

    // cache-buster
    const sep = url.includes("?") ? "&" : "?";
    frame.src = url + sep + "v=" + Date.now();

    setTopMsg("");
  }

  function requireLogin(){
    if(!window.TESOURA_ROLE){
      showOverlay(true);
      setTopMsg("Faça login para acessar.");
      return true;
    }
    return false;
  }

  function loginJogadores(){
    const cfg = window.TESOURA_CONFIG || {};
    const pinCfg = String(cfg.APP_PIN || "TESOURA2026").trim();
    const pin = String(($("pinJog")?.value || $("senhaJogador")?.value || "")).trim();

    if(!pin) return setTopMsg("Digite a senha dos JOGADORES.");
    if(pinCfg && pin !== pinCfg) return setTopMsg("Senha incorreta.");

    window.TESOURA_ROLE = "jogador";
    window.TESOURA_CAN_CAIXA = false;

    applyCaixaVisibility();
    setBadge("JOGADOR (VISUAL)");
    showOverlay(false);

    loadPanel((cfg.DEFAULT_TAB || "aba-controle"));
  }

  function loginDiretoria(){
    const cfg = window.TESOURA_CONFIG || {};
    const pins = cfg.DIRETORIA_PINS || {};
    const pin = String(($("pinDir")?.value || $("senhaDiretor")?.value || "")).trim();

    if(!pin) return setTopMsg("Digite a senha da DIRETORIA.");
    if(!pins[pin]) return setTopMsg("Senha incorreta.");

    window.TESOURA_ROLE = "diretoria";
    window.TESOURA_CAN_CAIXA = !!pins[pin].caixa;

    applyCaixaVisibility();
    setBadge("DIRETORIA");
    showOverlay(false);

    loadPanel((cfg.DEFAULT_TAB || "aba-controle"));
  }

  function sair(){
    window.TESOURA_ROLE = "";
    window.TESOURA_CAN_CAIXA = false;
    if($("pinJog")) $("pinJog").value = "";
    if($("pinDir")) $("pinDir").value = "";
    if($("senhaJogador")) $("senhaJogador").value = "";
    if($("senhaDiretor")) $("senhaDiretor").value = "";
    setBadge("");
    showOverlay(true);
    setTopMsg("");
    const frame = $("frame");
    if(frame) frame.src = "about:blank";
  }

  function bindTabs(){
    document.querySelectorAll(".tab, .tabBtn").forEach(el=>{
      el.addEventListener("click", ()=>{
        if(requireLogin()) return;
        loadPanel(el.id);
      });
    });
  }

  window.addEventListener("DOMContentLoaded", ()=>{
    // sempre começa pedindo senha
    showOverlay(true);
    applyCaixaVisibility();
    bindTabs();

    // botões
    $("btnEntrarJogadores")?.addEventListener("click", loginJogadores);
    $("btnEntrarDiretoria")?.addEventListener("click", loginDiretoria);
    $("btnSair")?.addEventListener("click", sair);
    $("btnLogin")?.addEventListener("click", ()=>showOverlay(true));

    // Enter nos inputs
    $("pinJog")?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") loginJogadores(); });
    $("pinDir")?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") loginDiretoria(); });
    $("senhaJogador")?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") loginJogadores(); });
    $("senhaDiretor")?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") loginDiretoria(); });

    // se tiver uma aba marcada no HTML, carrega depois do login
    setTopMsg("");
  });
})();
