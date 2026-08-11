const startMenuContentEn = {
  searchCheck: "Type here to search",
  title: "Under Construction",
  description: "Soon I will be an AI Agent capable of chatting with you about my entire portfolio.",
  visitor: "Visitor"
};

const startMenuContentPt = {
  searchCheck: "Digite aqui para pesquisar",
  title: "Em Construção",
  description: "Em breve serei um Agente de IA capaz de conversar com você sobre todo o meu portfólio.",
  visitor: "Visitante"
};

export const getStartMenuData = (lang) => (lang === 'pt' ? startMenuContentPt : startMenuContentEn);
