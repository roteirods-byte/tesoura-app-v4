/* TESOURA_OVERRIDE_V1 - destrava login + abas (robusto) */
(function () {
  const $ = (id) => document.getElementById(id);

  // fallback simples caso TESOURA (session.js) não exista
  const store = {
    get(k, d=null){ try{ const v = localStorage.getItem("tesoura_"+k); return v==null?d:JSON.parse(v); }catch(_){ return d; } },
    set(k, v){ try{ localStorage.setItem("tesoura_"+k, JSON.stringify(v)); }catch(_){ } },
    del(k){ try{ localStorage.removeItem("tesoura_"+k); }catch(_){ } },
    clear(){ try{ Object.keys(localStorage).filter(k=>k.startsWith("tesoura_")).forEach(k=>localStorage.removeItem(k)); }catch(_){ } }
  };

  const cfgRaw = window.TESOURA_CONFIG || {};
  const CFG = {
    PIN_JOGADORES: cfgRaw.PIN_JOGADORES || cfgRaw.APP_PIN || "TESOURA2026",
    DIRETORIA_PINS: cfgRaw.DIRETORIA_PINS || null,
    DIRETORIA_PIN_UNICA: cfgRaw.DIRETORIA_PIN || cfgRaw.ADMIN_PIN || null,
  };

  function setMsg(txt){
    const el = $("loginMsg") || $("msgTelaInicial");
    if (el) el.textContent = txt || "";
  }

  function setCaixaUI(permitido){
    const el = $("aba-caixa");
    if (!el) return;
    if (permitido){
      el.style.opacity = "1";
      el.style.pointerEvents = "auto";
      el.title = "";
    } else {
      el.style.opacity = "0.35";
      el.style.pointerEvents = "none";
      el.title = "Sem permissão para CAIXA";
    }
  }

  function showLoginSafe(show){
    if (typeof window.showLogin === "function") return window.showLogin(!!show);
    if (typeof window.showTelaInicial === "function") return window.showTelaInicial(!!show);
  }

  function abrirAbaSafe(id){
    if (typeof window.abrirAba === "function") return window.abrirAba(id);
    // fallback simples: ativa botão visualmente
    const btn = $(id);
    if (btn) btn.click();
  }

  function lockJogadorSafe(lock){
    if (typeof window.lockIframeForJogador === "function") return window.lockIframeForJogador(!!lock);
    if (typeof window.TESOURA_TRAVAR_IFRAMES === "function" && lock) return window.TESOURA_TRAVAR_IFRAMES();
  }

  function setBadgeSafe(txt){
    if (typeof window.setBadge === "function"){
      try { return window.setBadge(txt); } catch(_) {}
    }
  }

  function entrarJogadores(){
    const pin = String(($("senhaJogador") || $("pinJog"))?.value || "").trim();
    const pinOk = String(CFG.PIN_JOGADORES || "").trim();

    if (!pin) return setMsg("Digite a senha dos JOGADORES.");
    if (pinOk && pin !== pinOk) return setMsg("Senha dos JOGADORES incorreta.");

    store.set("mode", "jogadores");
    store.set("can_caixa", false);
    store.set("dir_pin", null);

    setCaixaUI(false);
    setMsg("");
    showLoginSafe(false);
    setBadgeSafe("Modo: Jogadores (visual)");
    abrirAbaSafe("aba-jogadores");
    lockJogadorSafe(true);
  }

  function getDirInfo(pin){
    if (CFG.DIRETORIA_PINS && CFG.DIRETORIA_PINS[pin]) return CFG.DIRETORIA_PINS[pin];
    if (CFG.DIRETORIA_PIN_UNICA && pin === CFG.DIRETORIA_PIN_UNICA) return { caixa: true };
    return null;
  }

  function entrarDiretoria(){
    const pin = String(($("senhaDiretor") || $("pinDir"))?.value || "").trim();
    if (!pin) return setMsg("Digite a senha da DIRETORIA.");

    const info = getDirInfo(pin);
    if (!info) return setMsg("Senha da DIRETORIA incorreta.");

    const podeCaixa = !!info.caixa;

    store.set("mode", "diretoria");
    store.set("dir_pin", pin);
    store.set("can_caixa", podeCaixa);

    setCaixaUI(podeCaixa);
    setMsg("");
    showLoginSafe(false);
    setBadgeSafe("Modo: Diretoria");
    lockJogadorSafe(false);

    const last = store.get("lastTab", "aba-jogadores");
    if (last === "aba-caixa" && !podeCaixa) abrirAbaSafe("aba-jogadores");
    else abrirAbaSafe(last);
  }

  function sair(){
    if ($("senhaJogador")) $("senhaJogador").value = "";
    if ($("senhaDiretor")) $("senhaDiretor").value = "";
    if ($("pinJog")) $("pinJog").value = "";
    if ($("pinDir")) $("pinDir").value = "";
    store.clear();
    setCaixaUI(false);
    setMsg("");
    showLoginSafe(true);
    setBadgeSafe("");
  }

  window.addEventListener("DOMContentLoaded", () => {
    // salvar aba clicada
    ["aba-jogadores","aba-presenca","aba-controle","aba-mensalidade","aba-caixa","aba-gols","aba-banco"].forEach(id=>{
      const el = $(id);
      if (!el) return;
      el.addEventListener("click", ()=>store.set("lastTab", id), true);
    });

    $("btnEntrarJogadores")?.addEventListener("click", entrarJogadores);
    $("btnEntrarDiretoria")?.addEventListener("click", entrarDiretoria);
    $("btnSair")?.addEventListener("click", sair);

    $("senhaJogador")?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") entrarJogadores(); });
    $("senhaDiretor")?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") entrarDiretoria(); });

    // restaura sessão
    const mode = store.get("mode", null);
    if (!mode){ setCaixaUI(false); showLoginSafe(true); return; }

    if (mode === "jogadores"){
      setCaixaUI(false);
      showLoginSafe(false);
      setBadgeSafe("Modo: Jogadores (visual)");
      lockJogadorSafe(true);
      const last = store.get("lastTab", "aba-jogadores");
      abrirAbaSafe(last === "aba-caixa" ? "aba-jogadores" : last);
      return;
    }

    // diretoria
    const pin = store.get("dir_pin", "");
    const info = getDirInfo(pin);
    const podeCaixa = !!(info && info.caixa);

    setCaixaUI(podeCaixa);
    showLoginSafe(false);
    setBadgeSafe("Modo: Diretoria");
    lockJogadorSafe(false);

    const last = store.get("lastTab", "aba-jogadores");
    abrirAbaSafe(last === "aba-caixa" && !podeCaixa ? "aba-jogadores" : last);
  });
})();
