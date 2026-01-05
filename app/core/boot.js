/* TESOURA BOOT — PATCH V5 (iframe novo + cache-buster + bfcache) */
(function () {
  "use strict";

  // Versão do cache-buster (mude só quando quiser forçar tudo recarregar)
  const REV = "v5_2026-01-05_01";

  const $id = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setMsg(txt) {
    const el = $id("msg") || $id("loginMsg") || $id("msgTelaInicial") || qs("[data-msg]");
    if (el) el.textContent = txt || "";
  }

  function setBadge(txt) {
    const b = $id("badge") || qs(".badge");
    if (b) b.textContent = txt || "";
  }

  function showOverlay(show) {
    const ov = $id("overlay") || qs(".overlay");
    if (ov) ov.style.display = show ? "flex" : "none";
  }

  function showLoader(on) {
    const l = $id("frameLoader") || $id("loader") || qs(".frameLoader") || qs(".loader");
    if (!l) return;
    // suporta os 2 estilos (class on OU display)
    l.classList.toggle("on", !!on);
    l.style.display = on ? "flex" : "none";
  }

  function applyCaixaVisibility() {
    const can = !!window.TESOURA_CAN_CAIXA;
    const caixa = $id("aba-caixa") || $id("tab-caixa") || qs('[data-tab="aba-caixa"]');
    if (caixa) caixa.style.display = can ? "" : "none";
  }

  function markActive(tabId) {
    qsa(".tab, .tabBtn, .tab-btn").forEach((el) => el.classList.remove("active"));
    const t = $id(tabId);
    if (t) t.classList.add("active");
  }

  function getFrameWrap() {
    // tenta achar o container real do iframe (sem depender de 1 id só)
    return (
      $id("frameWrap") ||
      qs(".frameWrap") ||
      qs(".frame-wrap") ||
      $id("conteudoWrap") ||
      $id("iframeWrap") ||
      qs("#frame")?.parentElement ||
      qs("#conteudo")?.parentElement ||
      qs("main") ||
      document.body
    );
  }

  function getFrame() {
    // compatível com id antigo e novo
    return $id("conteudo") || $id("frame") || qs("iframe", getFrameWrap()) || qs("iframe");
  }

  function buildUrl(url) {
    if (!url) return url;
    const sep = url.includes("?") ? "&" : "?";
    return url + sep + "rev=" + encodeURIComponent(REV) + "&t=" + Date.now();
  }

  function swapIframeTo(url) {
    const wrap = getFrameWrap();
    const old = getFrame();
    if (!wrap) {
      setMsg("ERRO: não encontrei o container do iframe.");
      return;
    }

    showLoader(true);

    // cria iframe NOVO (isso elimina o “flash” do conteúdo anterior)
    const nf = document.createElement("iframe");

    // mantém compatibilidade com ids diferentes
    const newId = old?.id ? old.id : ($id("conteudo") ? "conteudo" : "frame");
    nf.id = newId;

    // copia classe e atributos úteis do iframe atual (se existir)
    if (old) {
      nf.className = old.className || "";
      const allow = old.getAttribute("allow");
      const sandbox = old.getAttribute("sandbox");
      if (allow) nf.setAttribute("allow", allow);
      if (sandbox) nf.setAttribute("sandbox", sandbox);
    }

    // estilo seguro (não depende do CSS)
    nf.style.width = "100%";
    nf.style.height = "100%";
    nf.style.border = "0";
    nf.style.visibility = "hidden";
    nf.style.opacity = "0";
    nf.style.pointerEvents = "none";

    // insere o novo iframe antes de remover o antigo (evita “buraco”)
    if (old && old.parentNode) {
      old.style.visibility = "hidden";
      old.style.opacity = "0";
      old.style.pointerEvents = "none";
      // coloca o novo logo depois do antigo
      old.parentNode.insertBefore(nf, old.nextSibling);
    } else {
      wrap.appendChild(nf);
    }

    // remove o antigo SOMENTE quando o novo terminar de carregar
    nf.onload = () => {
      nf.style.visibility = "visible";
      nf.style.opacity = "1";
      nf.style.pointerEvents = "auto";
      showLoader(false);

      if (old && old.parentNode) {
        try { old.src = "about:blank"; } catch (e) {}
        old.parentNode.removeChild(old);
      }
      setMsg("");
    };

    nf.onerror = () => {
      showLoader(false);
      setMsg("Erro ao carregar painel (ver Console).");
    };

    nf.src = buildUrl(url);
  }

  function loadPanel(tabId) {
    const cfg = window.TESOURA_CONFIG || {};
    const map = cfg.PANELS || window.TESOURA_TABS || {};
    const url = map[tabId];

    if (!url) {
      setMsg("ERRO: aba sem página: " + tabId);
      return;
    }

    markActive(tabId);
    try { sessionStorage.setItem("TESOURA_LAST_TAB", tabId); } catch (e) {}
    swapIframeTo(url);
  }

  function requireLogin() {
    if (!window.TESOURA_ROLE) {
      showOverlay(true);
      setMsg("Faça login para acessar.");
      return true;
    }
    return false;
  }

  function loginJogadores() {
    const cfg = window.TESOURA_CONFIG || {};
    const pinCfg = String(cfg.APP_PIN || "TESOURA2026").trim();
    const pin = String(($id("pinJog")?.value || $id("senhaJogador")?.value || "")).trim();

    if (!pin) return setMsg("Digite a senha dos JOGADORES.");
    if (pinCfg && pin !== pinCfg) return setMsg("Senha incorreta.");

    window.TESOURA_ROLE = "jogador";
    window.TESOURA_CAN_CAIXA = false;

    applyCaixaVisibility();
    setBadge("JOGADOR (VISUAL)");
    showOverlay(false);

    const last = (() => { try { return sessionStorage.getItem("TESOURA_LAST_TAB"); } catch (e) { return ""; } })();
    loadPanel(last || cfg.DEFAULT_TAB || "aba-controle");
  }

  function loginDiretoria() {
    const cfg = window.TESOURA_CONFIG || {};
    const pins = cfg.DIRETORIA_PINS || {};
    const pin = String(($id("pinDir")?.value || $id("senhaDiretor")?.value || "")).trim();

    if (!pin) return setMsg("Digite a senha da DIRETORIA.");
    if (!pins[pin]) return setMsg("Senha incorreta.");

    window.TESOURA_ROLE = "diretoria";
    window.TESOURA_CAN_CAIXA = !!pins[pin].caixa;

    applyCaixaVisibility();
    setBadge("DIRETORIA");
    showOverlay(false);

    const last = (() => { try { return sessionStorage.getItem("TESOURA_LAST_TAB"); } catch (e) { return ""; } })();
    loadPanel(last || cfg.DEFAULT_TAB || "aba-controle");
  }

  function sair() {
    window.TESOURA_ROLE = "";
    window.TESOURA_CAN_CAIXA = false;

    ["pinJog", "pinDir", "senhaJogador", "senhaDiretor"].forEach((id) => {
      const el = $id(id);
      if (el) el.value = "";
    });

    setBadge("");
    showOverlay(true);
    setMsg("");

    const fr = getFrame();
    if (fr) {
      try { fr.src = "about:blank"; } catch (e) {}
    }
  }

  function bindTabs() {
    qsa(".tab, .tabBtn, .tab-btn").forEach((el) => {
      el.addEventListener("click", () => {
        if (requireLogin()) return;
        loadPanel(el.id);
      });
    });
  }

  // BFCache: se o navegador “restaurar” a página do cache (voltar/avançar),
  // recarrega o painel corretamente para não mostrar iframe antigo. :contentReference[oaicite:1]{index=1}
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    try {
      const fr = getFrame();
      if (fr) fr.src = "about:blank";
    } catch (err) {}

    // se já estava logado, recarrega a última aba
    const cfg = window.TESOURA_CONFIG || {};
    const last = (() => { try { return sessionStorage.getItem("TESOURA_LAST_TAB"); } catch (e2) { return ""; } })();
    if (window.TESOURA_ROLE) {
      loadPanel(last || cfg.DEFAULT_TAB || "aba-controle");
    } else {
      showOverlay(true);
      showLoader(false);
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    showOverlay(true);
    applyCaixaVisibility();
    bindTabs();

    // botões (compatível com ids diferentes)
    $id("btnEntrarJogadores")?.addEventListener("click", loginJogadores);
    $id("btnEntrarDiretoria")?.addEventListener("click", loginDiretoria);
    $id("btnSair")?.addEventListener("click", sair);
    $id("btnLogin")?.addEventListener("click", () => showOverlay(true));

    // Enter nos inputs
    $id("pinJog")?.addEventListener("keydown", (e) => { if (e.key === "Enter") loginJogadores(); });
    $id("pinDir")?.addEventListener("keydown", (e) => { if (e.key === "Enter") loginDiretoria(); });
    $id("senhaJogador")?.addEventListener("keydown", (e) => { if (e.key === "Enter") loginJogadores(); });
    $id("senhaDiretor")?.addEventListener("keydown", (e) => { if (e.key === "Enter") loginDiretoria(); });

    setMsg("");
    showLoader(false);
  });
})();
