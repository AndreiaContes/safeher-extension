console.log("🛡️ SafeHer ativa em modo silencioso.");

let totalAlertas = 0;
let nivelRisco = "SEGURO";

const textosJaRegistrados = new Set();
const elementosProtegidos = new WeakSet();

function storageDisponivel() {
  return (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.storage &&
    chrome.storage.local
  );
}

function normalizarSafeHer(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:"'´`~^“”]/g, "")
    .trim();
}

function deveIgnorarElemento(elemento) {
  if (!elemento) return true;

  return (
    typeof elemento.closest === "function" &&
    (
      elemento.closest("pre") ||
      elemento.closest("code") ||
      elemento.closest(".cm-content") ||
      elemento.closest(".monaco-editor") ||
      elemento.closest("#safeher-alerta") ||
      elemento.closest(".safeher-warning")
    )
  );
}

function analisarTexto(texto, origem = "Página", elemento = null) {
  const textoLimpo = texto.trim();

  if (!textoLimpo || textoLimpo.length < 3) return;
  if (textoLimpo.length > 2000) return;

  const resultado = detectarAgressao(textoLimpo);
  if (!resultado.detectado) return;

  totalAlertas++;
  atualizarNivelGeral(resultado.nivel);

  const ocorrencia = {
    mensagem: textoLimpo,
    nivel: resultado.nivel,
    categoria: resultado.categoria,
    origem,
    pagina: window.location.href,
    data: new Date().toLocaleString("pt-BR")
  };

  const chave = `${normalizarSafeHer(ocorrencia.mensagem)}-${ocorrencia.categoria}-${ocorrencia.nivel}`;

  if (!textosJaRegistrados.has(chave)) {
    textosJaRegistrados.add(chave);
    salvarOcorrencia(ocorrencia);
    mostrarNotificacaoSafeHer(ocorrencia);
  }

  if (elemento) {
    aplicarProtecaoEmocional(elemento);
  }
}

function analisarElemento(elemento) {
  if (deveIgnorarElemento(elemento)) return;

  const texto =
    elemento.innerText ||
    elemento.value ||
    elemento.textContent ||
    "";

  if (!texto || texto.length > 2000) return;

  const partes = texto
    .split(/\n/)
    .map(linha => linha.trim())
    .filter(linha => linha.length >= 3 && linha.length <= 300);

  partes.forEach((parte) => {
    analisarTexto(parte, "Conteúdo detectado na página", elemento);
  });
}
function varrerPagina() {
  const elementos = document.querySelectorAll(`
    p,
    span,
    li,
    article,
    div[data-message-author-role],
    div.markdown,
    div.prose,
    div[role='row'],
    div[role='gridcell'],
    div.copyable-text,
    span.selectable-text,
    textarea,
    input,
    [contenteditable='true']
  `);

  elementos.forEach(analisarElemento);
}

function atualizarNivelGeral(nivel) {
  if (nivel === "alto") {
    nivelRisco = "RISCO ALTO";
  } else if (nivel === "medio" && nivelRisco !== "RISCO ALTO") {
    nivelRisco = "RISCO MODERADO";
  } else if (nivel === "baixo" && nivelRisco === "SEGURO") {
    nivelRisco = "ATENÇÃO";
  }
}

function salvarOcorrencia(ocorrencia) {
  if (!storageDisponivel()) return;

  chrome.storage.local.get(["history", "currentFindings"], (data) => {
    let historico = data.history || [];
    let ocorrenciasAtuais = data.currentFindings || [];

    const chaveNova = `${normalizarSafeHer(ocorrencia.mensagem)}-${ocorrencia.categoria}-${ocorrencia.nivel}`;

    const jaExisteNoHistorico = historico.some((item) => {
      const chaveItem = `${normalizarSafeHer(item.mensagem || "")}-${item.categoria}-${item.nivel}`;
      return chaveItem === chaveNova;
    });

    const jaExisteNasAtuais = ocorrenciasAtuais.some((item) => {
      const chaveItem = `${normalizarSafeHer(item.mensagem || "")}-${item.categoria}-${item.nivel}`;
      return chaveItem === chaveNova;
    });

    if (!jaExisteNoHistorico) historico.unshift(ocorrencia);
    if (!jaExisteNasAtuais) ocorrenciasAtuais.unshift(ocorrencia);

    chrome.storage.local.set({
      history: historico.slice(0, 80),
      currentFindings: ocorrenciasAtuais.slice(0, 30),
      totalAlertas,
      nivelRisco,
      ultimaOcorrencia: ocorrencia,
      ocorrenciaSelecionada: ocorrencia
    });
  });
}

function mostrarNotificacaoSafeHer(ocorrencia) {
  const alertaAnterior = document.getElementById("safeher-alerta");
  if (alertaAnterior) alertaAnterior.remove();

  const alerta = document.createElement("div");
  alerta.id = "safeher-alerta";

  alerta.innerHTML = `
    <div style="font-weight:700; font-size:14px; margin-bottom:5px;">
      🛡️ SafeHer detectou um risco
    </div>
    <div style="font-size:12px; margin-bottom:8px;">
      ${ocorrencia.categoria} • ${converterNivel(ocorrencia.nivel)}
    </div>
    <div style="font-size:11px; opacity:0.9; margin-bottom:12px;">
      Deseja analisar esta ocorrência?
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
      <button id="safeher-ignorar" style="${botaoSecundario()}">Ignorar</button>
      <button id="safeher-detalhes" style="${botaoPrincipal()}">Ver detalhes</button>
    </div>
  `;

  alerta.style.position = "fixed";
  alerta.style.right = "18px";
  alerta.style.bottom = "18px";
  alerta.style.width = "300px";
  alerta.style.zIndex = "999999";
  alerta.style.padding = "14px";
  alerta.style.borderRadius = "16px";
  alerta.style.color = "#fff";
  alerta.style.fontFamily = "Arial, sans-serif";
  alerta.style.boxShadow = "0 18px 45px rgba(0,0,0,0.35)";
  alerta.style.background = definirCorAlerta(ocorrencia.nivel);

  document.body.appendChild(alerta);

  document.getElementById("safeher-ignorar").addEventListener("click", () => {
    alerta.remove();
  });

  document.getElementById("safeher-detalhes").addEventListener("click", () => {
    if (!storageDisponivel()) return;

    chrome.storage.local.set({ ocorrenciaSelecionada: ocorrencia }, () => {
      alerta.remove();

      chrome.runtime.sendMessage({
        action: "abrirPopupSafeHer"
      });
    });
  });
}

function aplicarProtecaoEmocional(elemento) {
  if (!storageDisponivel()) return;
  if (!elemento) return;
  if (elemento.dataset.safeherProtected === "true") return;

  chrome.storage.local.get(["protectionMode"], (data) => {
    if (!data.protectionMode) return;
    if (deveIgnorarElemento(elemento)) return;
    if (elementosProtegidos.has(elemento)) return;

    const texto =
      elemento.innerText ||
      elemento.value ||
      elemento.textContent ||
      "";

    if (!texto || texto.length > 2000) return;
    if (texto.includes("Conteúdo ofensivo ocultado pela SafeHer")) return;

    elementosProtegidos.add(elemento);

    elemento.dataset.safeherProtected = "true";
    elemento.style.filter = "blur(5px)";
    elemento.style.opacity = "0.7";
    elemento.style.transition = "0.3s ease";

    const aviso = document.createElement("div");
    aviso.classList.add("safeher-warning");
    aviso.innerText = "⚠ Conteúdo ofensivo ocultado pela SafeHer";

    aviso.style.background = "#111827";
    aviso.style.color = "#fff";
    aviso.style.padding = "8px 12px";
    aviso.style.borderRadius = "12px";
    aviso.style.marginTop = "8px";
    aviso.style.fontSize = "12px";
    aviso.style.fontWeight = "600";
    aviso.style.cursor = "pointer";
    aviso.style.border = "1px solid rgba(255,255,255,0.12)";
    aviso.style.width = "fit-content";

    aviso.addEventListener("click", () => {
      if (elemento.style.filter === "blur(5px)") {
        elemento.style.filter = "none";
        elemento.style.opacity = "1";
        aviso.innerText = "Ocultar conteúdo novamente";
      } else {
        elemento.style.filter = "blur(5px)";
        elemento.style.opacity = "0.7";
        aviso.innerText = "⚠ Conteúdo ofensivo ocultado pela SafeHer";
      }
    });

    if (!elemento.nextSibling?.classList?.contains("safeher-warning")) {
      elemento.parentNode.insertBefore(aviso, elemento.nextSibling);
    }
  });
}

function reaplicarProtecaoEmocionalNoHistorico() {
  if (!storageDisponivel()) return;

  chrome.storage.local.get(["protectionMode", "currentFindings"], (data) => {
    if (!data.protectionMode) return;

    const ocorrenciasAtuais = data.currentFindings || [];
    const mensagens = ocorrenciasAtuais
      .map(item => normalizarSafeHer(item.mensagem || ""))
      .filter(Boolean);

    if (mensagens.length === 0) return;

    const elementos = document.querySelectorAll(`
      p,
      span,
      li,
      article,
      div[data-message-author-role],
      div.markdown,
      div.prose,
      textarea,
      input,
      [contenteditable='true']
    `);

    elementos.forEach((elemento) => {
      if (deveIgnorarElemento(elemento)) return;

      const texto =
        elemento.innerText ||
        elemento.value ||
        elemento.textContent ||
        "";

      if (!texto || texto.length > 2000) return;
      if (texto.includes("Conteúdo ofensivo ocultado pela SafeHer")) return;

      const textoNormalizado = normalizarSafeHer(texto);

      const encontrado = mensagens.some((mensagem) => {
        return textoNormalizado.includes(mensagem);
      });

      if (encontrado) {
        aplicarProtecaoEmocional(elemento);
      }
    });
  });
}

function definirCorAlerta(nivel) {
  if (nivel === "alto") return "linear-gradient(135deg, #b00020, #ff1744)";
  if (nivel === "medio") return "linear-gradient(135deg, #ff7a00, #ffb300)";
  return "linear-gradient(135deg, #7b2dff, #ff4fd8)";
}

function converterNivel(nivel) {
  if (nivel === "alto") return "Alto risco";
  if (nivel === "medio") return "Médio risco";
  if (nivel === "baixo") return "Baixo risco";
  return "Seguro";
}

function botaoPrincipal() {
  return `
    border:none;
    padding:8px;
    border-radius:8px;
    background:#ffffff;
    color:#111;
    font-weight:700;
    cursor:pointer;
    font-size:11px;
  `;
}

function botaoSecundario() {
  return `
    border:1px solid rgba(255,255,255,0.45);
    padding:8px;
    border-radius:8px;
    background:rgba(255,255,255,0.12);
    color:#fff;
    font-weight:700;
    cursor:pointer;
    font-size:11px;
  `;
}

document.addEventListener("input", (event) => {
  const alvo = event.target;

  if (
    alvo.tagName === "TEXTAREA" ||
    alvo.tagName === "INPUT" ||
    alvo.isContentEditable ||
    alvo.getAttribute("contenteditable") === "true"
  ) {
    const texto = alvo.value || alvo.innerText || alvo.textContent || "";
    analisarTexto(texto, "Mensagem digitada ou recebida em tempo real", alvo);
  }
});

document.addEventListener("keyup", (event) => {
  const alvo = event.target;

  if (
    alvo.tagName === "TEXTAREA" ||
    alvo.tagName === "INPUT" ||
    alvo.isContentEditable ||
    alvo.getAttribute("contenteditable") === "true"
  ) {
    const texto = alvo.value || alvo.innerText || alvo.textContent || "";
    analisarTexto(texto, "Mensagem digitada ou recebida em tempo real", alvo);
  }
});

document.addEventListener("scroll", () => {
  varrerPagina();
  reaplicarProtecaoEmocionalNoHistorico();
}, true);

let tempoVarredura;

const observer = new MutationObserver((mutations) => {
  clearTimeout(tempoVarredura);

  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      analisarElemento(node);

      const filhos = node.querySelectorAll?.(`
        p,
        span,
        li,
        article,
        div[data-message-author-role],
        div.markdown,
        div.prose,
        div[role='row'],
        div[role='gridcell'],
        div.copyable-text,
        span.selectable-text,
        textarea,
        input,
        [contenteditable='true']
      `);

      filhos?.forEach(analisarElemento);
    });
  });

  tempoVarredura = setTimeout(() => {
    varrerPagina();
    reaplicarProtecaoEmocionalNoHistorico();
  }, 400);
});