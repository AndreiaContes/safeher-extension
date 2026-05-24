console.log("✅ detector.js carregado com sucesso");

function detectarAgressao(texto) {
  texto = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:"'´`~^“”]/g, "")
    .trim();

  const ameacas = [
    "vou te matar",
    "merece apanhar",
    "voce merece apanhar",
    "vou acabar com voce",
    "vou acabar com sua vida",
    "vou acabar com a sua vida",
    "vou te bater",
    "eu sei onde voce mora",
    "sei onde voce mora",
    "vou destruir sua reputacao",
    "destruir sua reputacao",
    "vou divulgar suas fotos",
    "divulgar suas fotos",
    "vou espalhar suas fotos",
    "espalhar suas fotos",
    "vou postar suas fotos",
    "vou vazar suas fotos",
    "vou te expor",
    "vou te encontrar",
    "continuar aparecendo aqui"
  ];

  const assedio = [
    "manda foto",
    "manda nude",
    "manda nudes",
    "gostosa",
    "delicia",
    "que corpo",
    "vou te pegar",
    "passa seu numero",
    "passa seu whatsapp",
    "passa seu contato",
    "me responde",
    "responde logo",
    "vou ficar insistindo",
    "vou insistir ate voce responder",
    "vc e muito gostosa",
    "quero ficar com voce",
    "vou ai te ver",
    "vou aparecer ai",
    "voce me pertence",
    "ninguem vai te querer",
    "sua roupa pede isso",
    "mulher assim merece",
    "voce provocou isso",
    "se nao me responder",
    "vou atras de voce",
    "eu nao vou desistir de voce",
    "vou infernizar sua vida",
    "te vi hoje",
    "sei onde voce trabalha",
    "sei sua rotina",
    "fica quietinha",
    "fica na sua",
    "mulher tem que obedecer",
    "vou fazer voce aprender",
    "voce precisa de um homem",
    "mulher nasceu pra servir"
  ];

  const humilhacao = [
    "voce e inutil",
    "voce e uma fracassada",
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
    "ninguem gosta de voce aqui",
    "todo mundo te odeia",
    "voce estraga tudo",
    "voce e um lixo",
    "ninguem liga pra voce",
    "voce nao presta",
    "mulher fraca",
    "ninguem vai acreditar em voce",
    "voce nunca vai conseguir",
    "desaparece daqui",
    "cala a boca",
    "fica quieta",
    "ninguem pediu sua opiniao",
    "voce so fala besteira",
    "voce e doida",
    "maluca",
    "surtada",
    "dramatica",
    "emocionada demais",
    "ninguem te quer aqui",
    "isso e culpa sua",
    "voce merece isso",
    "para de chorar",
    "mulher exagerada",
    "mulher louca",
    "voce e um peso",
    "nao faz nada direito",
    "inutil igual sempre",
    "todo mundo ri de voce"
  ];

  const ataqueProfissional = [
    "mulher nao sabe",
    "isso nao e coisa de mulher",
    "voce nunca vai conseguir",
    "voce nunca vai conseguir trabalhar nessa area",
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
    "nao leva jeito pra lideranca",
    "mulher nao serve pra comandar",
    "homem faz melhor",
    "isso exige inteligencia",
    "isso exige raciocinio",
    "isso nao e trabalho de mulher",
    "volta pra cozinha",
    "vai cuidar da casa",
    "vai cuidar dos filhos",
    "fica bonita e quieta",
    "deixa os homens resolverem",
    "ninguem vai te contratar",
    "ninguem respeita mulher nisso",
    "voce nao merece estar aqui",
    "voce so conseguiu por ser mulher",
    "so esta aqui por favoritismo",
    "voce nao tem perfil",
    "mulher nao aguenta pressao",
    "mulher nao serve para exatas",
    "voce nao sabe argumentar",
    "nao sabe nem falar direito",
    "nao deveria trabalhar com isso",
    "isso nao combina com mulher",
    "empresa nenhuma vai querer voce",
    "ninguem vai te promover",
    "voce nao nasceu pra empreender",
    "mulher nao deveria opinar nisso",
    "deixa um homem explicar",
    "voce nao entende o mercado",
    "nao tem postura profissional",
    "voce nao inspira confianca",
    "nao parece inteligente",
    "mulher nao deveria programar",
    "mulher nao nasceu para liderar"
  ];

  const preconceito = [
    "preta nojenta",
    "macaca",
    "cabelo ruim",
    "preta imunda",
    "sua raca",
    "isso e coisa de pobre",
    "favelada",
    "retardada",
    "mongoloide",
    "aleijada",
    "doente mental",
    "louca",
    "viado",
    "sapatona",
    "traveco",
    "mulherzinha",
    "parece homem",
    "isso nao e gente",
    "essa gente",
    "tipinho",
    "gente da sua laia",
    "gente igual voce",
    "volta pro seu lugar",
    "isso e culpa da sua raca",
    "gente pobre e assim",
    "gente preta e assim",
    "voce tem cara de bandida",
    "cara de empregada",
    "parece mendiga",
    "mulher rodada",
    "mulher usada",
    "gorda ridicula",
    "magrela nojenta",
    "feia demais",
    "parece um lixo",
    "ninguem vai querer uma mulher assim",
    "isso e falta de homem",
    "mulher da sua idade",
    "velha ridicula",
    "velha inutil",
    "mulher preta nao deveria",
    "mulher preta nao deveria estar aqui",
    "mulher preta nao pertence aqui",
    "preta nao deveria estar aqui",
    "isso e coisa de gay",
    "isso e pecado",
    "essa mulher nao e normal",
    "mulher direita nao faz isso",
    "mulher decente nao age assim"
  ];

  function contem(lista) {
    return lista.some((frase) => texto.includes(frase));
  }

  if (contem(ameacas)) {
    return {
      detectado: true,
      categoria: "Ameaça física",
      nivel: "alto"
    };
  }

  if (contem(preconceito)) {
    return {
      detectado: true,
      categoria: "Preconceito/Racismo",
      nivel: "alto"
    };
  }

  if (contem(assedio)) {
    return {
      detectado: true,
      categoria: "Assédio",
      nivel: "medio"
    };
  }

  if (contem(ataqueProfissional)) {
    return {
      detectado: true,
      categoria: "Ataque intelectual/profissional",
      nivel: "medio"
    };
  }

  if (contem(humilhacao)) {
    return {
      detectado: true,
      categoria: "Humilhação emocional",
      nivel: "medio"
    };
  }

  return {
    detectado: false,
    categoria: "Nenhum risco detectado",
    nivel: "seguro"
  };
}