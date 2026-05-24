require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/analisar", (req, res) => {
  const { mensagem } = req.body;

  if (!mensagem) {
    return res.status(400).json({
      erro: "Mensagem não enviada."
    });
  }

  const texto = normalizarTexto(mensagem);

  console.log("Mensagem recebida:", texto);

  let pontos = 0;
  let categorias = [];

  const padroes = [
    {
      categoria: "Insulto",
      pontos: 2,
      termos: ["burra", "ridicula", "chata", "inutil", "fracassada", "vagabunda", "vadia", "piranha", "puta"]
    },
    {
      categoria: "Exclusão ou intimidação",
      pontos: 3,
      termos: ["nao serve para nada", "ninguem quer ouvir", "ninguem gosta de voce", "some da internet", "voce nao deveria estar aqui", "ninguem te quer"]
    },
    {
      categoria: "Misoginia",
      pontos: 3,
      termos: ["mulher nao entende", "mulher nenhuma deveria", "volta pra cozinha", "mulher nao sabe"]
    },
    {
      categoria: "Ameaça ou exposição",
      pontos: 5,
      termos: ["vou te perseguir", "vou acabar com voce", "sei onde voce mora", "vou divulgar", "vou espalhar coisas", "vou te encontrar", "vou expor voce"]
    }
  ];

  padroes.forEach((grupo) => {
    grupo.termos.forEach((termo) => {
      if (texto.includes(termo)) {
        pontos += grupo.pontos;
        categorias.push(grupo.categoria);
      }
    });
  });

  categorias = [...new Set(categorias)];

  let resposta;

  if (pontos >= 5) {
    resposta = {
      versao: "SafeHer Backend 2.0",
      nivel: "Alto Risco",
      titulo: "Ameaça ou violência digital grave detectada",
      descricao: `A mensagem apresenta sinais de ${categorias.join(", ")}.`,
      acao: "Não responda. Salve provas, bloqueie o agressor e procure apoio."
    };
  } else if (pontos >= 3) {
    resposta = {
      versao: "SafeHer Backend 2.0",
      nivel: "Médio Risco",
      titulo: "Possível assédio ou intimidação detectada",
      descricao: `A mensagem apresenta sinais de ${categorias.join(", ")}.`,
      acao: "Salve a mensagem, evite responder e considere bloquear o contato."
    };
  } else if (pontos >= 1) {
    resposta = {
      versao: "SafeHer Backend 2.0",
      nivel: "Baixo Risco",
      titulo: "Linguagem ofensiva detectada",
      descricao: `A mensagem apresenta sinais de ${categorias.join(", ")}.`,
      acao: "Considere ocultar o comentário ou silenciar o contato."
    };
  } else {
    resposta = {
      versao: "SafeHer Backend 2.0",
      nivel: "Seguro",
      titulo: "Nenhum risco grave detectado",
      descricao: "A mensagem não apresenta sinais fortes de violência digital.",
      acao: "Continue atenta e monitore possíveis comportamentos repetitivos."
    };
  }

  res.json(resposta);
});

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:"']/g, "")
    .trim();
}

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`
==================================
SafeHer Backend 2.0 rodando
Servidor: http://localhost:${PORT}
==================================
  `);
});