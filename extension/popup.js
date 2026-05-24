const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const detectedMessages = document.getElementById("detectedMessages");

const messageInput = document.getElementById("messageInput");
const analyzeBtn = document.getElementById("analyzeBtn");

const resultBox = document.getElementById("resultBox");
const riskLevel = document.getElementById("riskLevel");
const riskTitle = document.getElementById("riskTitle");
const riskDescription = document.getElementById("riskDescription");
const recommendedAction = document.getElementById("recommendedAction");

const historyList = document.getElementById("historyList");
const protectionToggle = document.getElementById("protectionToggle");

const actionPanel = document.getElementById("actionPanel");
const generateReportBtn = document.getElementById("generateReportBtn");
const blockGuideBtn = document.getElementById("blockGuideBtn");
const denounceGuideBtn = document.getElementById("denounceGuideBtn");
const markIgnoredBtn = document.getElementById("markIgnoredBtn");

const senderStatus = document.getElementById("senderStatus");
const recurrenceText = document.getElementById("recurrenceText");

let ocorrenciaAtual = null;

const regrasSafeHer = [
  {
    categoria: "Ameaça física",
    nivel: "Alto Risco",
    palavras: [
      "vou te matar",
      "vou acabar com voce",
      "vou acabar com sua vida",
      "vou acabar com a sua vida",
      "merece apanhar",
      "voce merece apanhar",
      "vou te bater",
      "eu sei onde voce mora",
      "sei onde voce mora",
      "vou divulgar suas fotos",
      "divulgar suas fotos",
      "vou destruir sua reputacao",
      "destruir sua reputacao",
      "vou te expor",
      "vou te encontrar",
      "vou espalhar suas fotos",
      "vou vazar suas fotos"
    ]
  },
  {
    categoria: "Assédio",
    nivel: "Médio Risco",
    palavras: [
      "manda foto",
      "manda nude",
      "manda nudes",
      "gostosa",
      "delicia",
      "que corpo",
      "vou te pegar",
      "passa seu numero",
      "passa seu whatsapp",
      "me responde",
      "responde logo",
      "vou ficar insistindo",
      "quero ficar com voce",
      "voce me pertence",
      "se nao me responder",
      "vou atras de voce",
      "vou infernizar sua vida",
      "sei onde voce trabalha",
      "sei sua rotina"
    ]
  },
  {
    categoria: "Humilhação emocional",
    nivel: "Médio Risco",
    palavras: [
      "voce e inutil",
      "burra",
      "incapaz",
      "ninguem te suporta",
      "vagabunda",
      "nao deveria estar aqui",
      "voce nao deveria estar aqui",
      "vc nao deveria estar aqui",
      "seu lugar nao e aqui",
      "fracassada",
      "ridicula",
      "patetica",
      "idiota",
      "incompetente",
      "voce nao serve pra nada",
      "ninguem gosta de voce",
      "todo mundo te odeia",
      "voce estraga tudo",
      "voce e um lixo",
      "ninguem liga pra voce",
      "voce nao presta",
      "ninguem vai acreditar em voce",
      "desaparece daqui",
      "cala a boca",
      "fica quieta",
      "ninguem pediu sua opiniao",
      "voce so fala besteira",
      "maluca",
      "surtada",
      "dramatica",
      "todo mundo ri de voce"
    ]
  },
  {
    categoria: "Ataque intelectual/profissional",
    nivel: "Médio Risco",
    palavras: [
      "mulher nao sabe",
      "isso nao e coisa de mulher",
      "voce nunca vai conseguir",
      "lugar de mulher nao e aqui",
      "lugar de mulher e na cozinha",
      "deixa isso para homens",
      "mulher nao entende tecnologia",
      "mulher nao entende programacao",
      "mulher nao entende negocios",
      "mulher nao sabe liderar",
      "mulher e emocional demais",
      "voce nao tem capacidade",
      "isso e complexo pra voce",
      "voce nao nasceu pra isso",
      "mulher nao serve pra comandar",
      "homem faz melhor",
      "volta pra cozinha",
      "vai cuidar da casa",
      "vai cuidar dos filhos",
      "deixa os homens resolverem",
      "ninguem vai te contratar",
      "voce so conseguiu por ser mulher",
      "so esta aqui por favoritismo",
      "mulher nao aguenta pressao",
      "mulher nao deveria programar",
      "mulher nao nasceu para liderar"
    ]
  },
  {
    categoria: "Preconceito/Racismo",
    nivel: "Alto Risco",
    palavras: [
      "preta nojenta",
      "macaca",
      "cabelo ruim",
      "preta imunda",
      "sua raca",
      "isso e coisa de pobre",
      "favelada",
      "gente da sua laia",
      "gente igual voce",
      "volta pro seu lugar",
      "gente pobre e assim",
      "gente preta e assim",
      "voce tem cara de bandida",
      "cara de empregada",
      "mulher da sua idade deveria ficar quieta",
      "velha ridicula",
      "mulher preta nao deveria",
      "mulher direita nao faz isso",
      "mulher decente nao age assim"
    ]
  }
];

analyzeBtn.addEventListener("click", analisarOcorrenciaSelecionada);

protectionToggle.addEventListener("change", () => {
  chrome.storage.local.set({
    protectionMode: protectionToggle.checked
  });
});

chrome.storage.local.get(
  ["protectionMode", "history", "ocorrenciaSelecionada"],
  (data) => {
    protectionToggle.checked = data.protectionMode || false;
    carregarHistorico(data.history || []);

    if (data.ocorrenciaSelecionada) {
      carregarOcorrenciaSelecionada(data.ocorrenciaSelecionada, data.history || []);
    }
  }
);

function analisarMensagem() {
  const mensagem = messageInput.value.trim();

  if (!mensagem) {
    alert("Cole uma mensagem para análise.");
    return;
  }

  const resultadoDetector = detectarAgressaoPopup(mensagem);
  const resultado = montarResultado(resultadoDetector);

  mostrarResultado(resultado);

  if (!resultadoDetector.detectado) {
    ocorrenciaAtual = null;
    actionPanel.classList.add("hidden");
    return;
  }

  const ocorrencia = {
    mensagem,
    nivel: converterNivelParaInterno(resultado.nivel),
    categoria: resultado.titulo,
    pagina: "Análise manual pela interface SafeHer",
    origem: "Mensagem analisada manualmente",
    data: new Date().toLocaleString("pt-BR")
  };

  ocorrenciaAtual = ocorrencia;
  salvarHistorico(ocorrencia);
  actionPanel.classList.remove("hidden");

  chrome.storage.local.get(["history"], (data) => {
    atualizarRecorrencia(ocorrencia, data.history || []);
  });
}

function detectarAgressaoPopup(texto) {
  const mensagem = normalizarTexto(texto);

  for (const regra of regrasSafeHer) {
    for (const palavra of regra.palavras) {
      if (mensagem.includes(normalizarTexto(palavra))) {
        return {
          detectado: true,
          categoria: regra.categoria,
          nivel: regra.nivel,
          termo: palavra
        };
      }
    }
  }

  return {
    detectado: false,
    categoria: "Nenhum risco detectado",
    nivel: "Seguro",
    termo: null
  };
}

function montarResultado(resultadoDetector) {
  if (!resultadoDetector.detectado) {
    return {
      nivel: "Seguro",
      titulo: "Mensagem aparentemente segura",
      descricao: "A SafeHer não encontrou sinais claros de ameaça, assédio, preconceito ou violência digital.",
      acao: "Mesmo assim, observe o contexto. Algumas violências podem ser sutis ou aparecer em sequência."
    };
  }

  if (resultadoDetector.nivel === "Alto Risco") {
    return {
      nivel: "Alto Risco",
      titulo: resultadoDetector.categoria,
      descricao: "A mensagem contém indícios graves de violência, intimidação, ameaça ou discriminação.",
      acao: "Salve evidências, gere relatório e considere denunciar ou bloquear pela própria plataforma."
    };
  }

  if (resultadoDetector.nivel === "Médio Risco") {
    return {
      nivel: "Médio Risco",
      titulo: resultadoDetector.categoria,
      descricao: "A mensagem apresenta sinais de agressão verbal, assédio, humilhação ou ataque emocional/profissional.",
      acao: "Guarde a mensagem, evite alimentar o conflito e avalie bloquear, denunciar ou manter no histórico."
    };
  }

  return {
    nivel: "Baixo Risco",
    titulo: resultadoDetector.categoria,
    descricao: "A mensagem contém linguagem inadequada ou desrespeitosa.",
    acao: "Acompanhe se esse comportamento se repete e registre as ocorrências."
  };
}

function mostrarResultado(resultado) {
  resultBox.classList.remove("hidden");

  riskLevel.textContent = resultado.nivel;
  riskTitle.textContent = resultado.titulo;
  riskDescription.textContent = resultado.descricao;
  recommendedAction.textContent = resultado.acao;

  riskLevel.className = "risk-level";

  if (resultado.nivel === "Seguro") riskLevel.classList.add("seguro");
  if (resultado.nivel === "Baixo Risco") riskLevel.classList.add("baixo");
  if (resultado.nivel === "Médio Risco") riskLevel.classList.add("medio");
  if (resultado.nivel === "Alto Risco") riskLevel.classList.add("alto");
}

function salvarHistorico(ocorrencia) {
  if (!ocorrencia || ocorrencia.nivel === "seguro") return;

  chrome.storage.local.get(["history"], (data) => {
    let historico = data.history || [];

    const chaveNova = criarChaveOcorrencia(ocorrencia);

    const jaExiste = historico.some((item) => {
      return criarChaveOcorrencia(item) === chaveNova;
    });

    if (!jaExiste) {
      historico.unshift(ocorrencia);
    }

    historico = historico.filter((item) => {
      return item.nivel && item.nivel !== "seguro" && item.categoria !== "Mensagem aparentemente segura";
    });

    chrome.storage.local.set({
      history: historico.slice(0, 50),
      ocorrenciaSelecionada: ocorrencia
    });

    carregarHistorico(historico.slice(0, 50));
  });
}

function carregarHistorico(historico) {
  historyList.innerHTML = "";

  const historicoLimpo = limparHistorico(historico);

  if (historicoLimpo.length === 0) {
    historyList.innerHTML = "<li>Nenhuma ocorrência registrada.</li>";
    renderizarMensagensDetectadas(historicoLimpo);
    return;
  }

  historicoLimpo.slice(0, 50).forEach((item, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>Ocorrência ${index + 1} — ${converterNivelParaPopup(item.nivel)}</strong><br>
      <span>${item.categoria || "Ocorrência registrada"}</span><br>
      <em>"${item.mensagem}"</em><br>
      <small>${item.data || "Sem data"}</small>
    `;

    li.addEventListener("click", () => {
      carregarOcorrenciaSelecionada(item, historicoLimpo);
    });

    historyList.appendChild(li);
  });

  renderizarMensagensDetectadas(historicoLimpo);
}

function carregarOcorrenciaSelecionada(ocorrencia, historico) {
  ocorrenciaAtual = ocorrencia;

  if (messageInput) {
    messageInput.value = ocorrencia.mensagem;
  }

  const resultado = {
    nivel: converterNivelParaPopup(ocorrencia.nivel),
    titulo: ocorrencia.categoria,
    descricao: `Mensagem detectada em: ${ocorrencia.pagina || "origem não informada"}`,
    acao: "Analise a ocorrência e decida se deseja gerar relatório, bloquear, denunciar ou manter no histórico."
  };

  mostrarResultado(resultado);
  atualizarRecorrencia(ocorrencia, historico);
  actionPanel.classList.remove("hidden");
}

function atualizarRecorrencia(ocorrencia, historico) {
  const historicoLimpo = limparHistorico(historico);

  const repeticoes = historicoLimpo.filter((item) => {
    return normalizarTexto(item.categoria || "") === normalizarTexto(ocorrencia.categoria || "");
  }).length;

  if (repeticoes >= 5) {
    senderStatus.className = "sender-status red";
    senderStatus.textContent = "🔴 Alto risco";
    recurrenceText.textContent =
      `A SafeHer identificou ${repeticoes} ocorrências semelhantes. Possível comportamento recorrente/agressivo.`;
  } else if (repeticoes >= 2) {
    senderStatus.className = "sender-status yellow";
    senderStatus.textContent = "🟡 Atenção";
    recurrenceText.textContent =
      `A SafeHer identificou reincidência de comportamento ofensivo (${repeticoes} ocorrências).`;
  } else {
    senderStatus.className = "sender-status green";
    senderStatus.textContent = "🟢 Baixo histórico";
    recurrenceText.textContent =
      "Nenhuma recorrência grave identificada até o momento.";
  }
}

generateReportBtn.addEventListener("click", () => {
  chrome.storage.local.get(["history"], (data) => {
    const historicoLimpo = limparHistorico(data.history || []);

    if (historicoLimpo.length === 0) {
      alert("Nenhuma ocorrência registrada para gerar relatório.");
      return;
    }

    const ocorrenciasFormatadas = historicoLimpo.map((item, index) => {
      return `
OCORRÊNCIA ${index + 1}

Data:
${item.data || "Não informado"}

Página:
${item.pagina || "Não informado"}

Origem:
${item.origem || "Não informado"}

Categoria:
${item.categoria || "Não informado"}

Nível de risco:
${converterNivelParaPopup(item.nivel)}

Mensagem:
${item.mensagem}
`;
    }).join("\n-----------------------------\n");

    const conteudo = `
SAFEHER - RELATÓRIO COMPLETO DE OCORRÊNCIAS DIGITAIS

Total de ocorrências registradas:
${historicoLimpo.length}

${ocorrenciasFormatadas}

RECOMENDAÇÃO GERAL:
Evite responder impulsivamente. Salve evidências, faça print da tela e utilize os recursos de bloqueio ou denúncia da própria plataforma quando necessário.

OBSERVAÇÃO:
Este relatório foi gerado pela SafeHer como apoio à organização de evidências digitais.
`;

    const blob = new Blob([conteudo], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download(
      {
        url,
        filename: "relatorio-completo-safeher.txt",
        saveAs: true
      },
      () => {
        URL.revokeObjectURL(url);

        if (chrome.runtime.lastError) {
          alert("Não foi possível gerar o relatório. Verifique a permissão de downloads no manifest.json.");
          return;
        }

        alert("Relatório gerado com sucesso.");
      }
    );
  });
});

blockGuideBtn.addEventListener("click", () => {
  alert(
    "Orientação SafeHer:\n\n" +
    "A SafeHer não bloqueia automaticamente em todas as plataformas.\n\n" +
    "Abra o perfil, comentário ou conversa da pessoa e use a opção BLOQUEAR da própria rede social. Mantenha o relatório salvo como evidência."
  );
});

denounceGuideBtn.addEventListener("click", () => {
  window.open("https://new.safernet.org.br/denuncie", "_blank");
});

markIgnoredBtn.addEventListener("click", () => {
  actionPanel.classList.add("hidden");
  ocorrenciaAtual = null;
  chrome.storage.local.remove(["ocorrenciaSelecionada"]);
  alert("Ocorrência ignorada nesta análise.");
});

function limparHistorico(historico) {
  const vistos = new Set();

  return historico.filter((item) => {
    if (!item || !item.mensagem) return false;
    if (!item.nivel || item.nivel === "seguro") return false;
    if (item.categoria === "Mensagem aparentemente segura") return false;

    const chave = criarChaveOcorrencia(item);

    if (vistos.has(chave)) return false;

    vistos.add(chave);
    return true;
  });
}

function criarChaveOcorrencia(item) {
  return `${normalizarTexto(item.mensagem || "")}-${normalizarTexto(item.categoria || "")}-${converterNivelParaPopup(item.nivel || "")}`;
}

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:"'´`~^“”]/g, "")
    .trim();
}

function converterNivelParaPopup(nivel) {
  if (nivel === "alto" || nivel === "Alto Risco") return "Alto Risco";
  if (nivel === "medio" || nivel === "Médio Risco") return "Médio Risco";
  if (nivel === "baixo" || nivel === "Baixo Risco") return "Baixo Risco";
  return "Seguro";
}

function converterNivelParaInterno(nivel) {
  if (nivel === "Alto Risco") return "alto";
  if (nivel === "Médio Risco") return "medio";
  if (nivel === "Baixo Risco") return "baixo";
  return "seguro";
}

function renderizarMensagensDetectadas(historico) {
  detectedMessages.innerHTML = "";

  const historicoLimpo = limparHistorico(historico);

  if (historicoLimpo.length === 0) {
    detectedMessages.innerHTML = `
      <div class="empty-detected">
        Nenhuma ocorrência detectada.
      </div>
    `;
    return;
  }

  historicoLimpo.slice(0, 20).forEach((item) => {

    const div = document.createElement("div");

    div.className = "detected-item";

    div.innerHTML = `
      <strong>${converterNivelParaPopup(item.nivel)}</strong>
      <p>${item.mensagem}</p>
    `;

    div.addEventListener("click", () => {

      document
        .querySelectorAll(".detected-item")
        .forEach(el => el.classList.remove("active"));

      div.classList.add("active");

      ocorrenciaAtual = item;
    });

    detectedMessages.appendChild(div);
  });
}

function analisarOcorrenciaSelecionada() {

  if (!ocorrenciaAtual) {
    alert("Selecione uma ocorrência.");
    return;
  }

  const resultado = {
    nivel: converterNivelParaPopup(ocorrenciaAtual.nivel),
    titulo: ocorrenciaAtual.categoria,
    descricao:
      `Mensagem detectada em:\n${ocorrenciaAtual.pagina || "Origem não informada"}`,
    acao:
      gerarOrientacao(ocorrenciaAtual)
  };

  mostrarResultado(resultado);

  actionPanel.classList.remove("hidden");
}

function gerarOrientacao(ocorrencia) {

  if (ocorrencia.nivel === "alto") {
    return "Risco elevado identificado. Salve evidências, gere relatório e considere bloquear e denunciar imediatamente.";
  }

  if (ocorrencia.nivel === "medio") {
    return "A SafeHer recomenda cautela. Registre a ocorrência e avalie bloquear ou denunciar caso o comportamento continue.";
  }

  return "Acompanhe a situação e monitore possíveis reincidências.";
}

clearHistoryBtn.addEventListener("click", () => {
  chrome.storage.local.set({
    history: [],
    ocorrenciaSelecionada: null,
    totalAlertas: 0,
    nivelRisco: "SEGURO"
  }, () => {
    ocorrenciaAtual = null;

    historyList.innerHTML = "<li>Nenhuma ocorrência registrada.</li>";

    detectedMessages.innerHTML = `
      <div class="empty-detected">
        Nenhuma ocorrência detectada.
      </div>
    `;

    resultBox.classList.add("hidden");
    actionPanel.classList.add("hidden");

    alert("Histórico limpo com sucesso.");
  });
});