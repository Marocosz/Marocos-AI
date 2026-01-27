"""
MÓDULO DE CONVERSA CASUAL (Small Talk)
--------------------------------------------------
Objetivo:
    Gerenciar interações sociais leves que não exigem consulta ao banco de dados (RAG).
    
Atuação no Sistema:
    - Backend / Nodes: Ativado quando o roteador classifica a intenção como 'casual'.
    
Responsabilidades:
    1. Gerar respostas simpáticas para saudações, agradecimentos e elogios.
    2. Manter a persona do bot (amigável, jovem, dev) sem entrar em alucinação técnica.
"""

from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import llm_fast
from app.graph.state import AgentState
from app.core.logger import logger

# --- NÓ 4: GENERATE CASUAL (Responde papo furado) ---
def generate_casual(state: AgentState):
    """
    Gera uma resposta social e leve.
    
    Por que existe:
        - Economia: Evita gastar calls de RAG e tokens para um simples "Oi".
        - Segurança: Se o usuário só quer conversar, evitamos inventar fatos técnicos.
        
    Entrada: 
        - messages: Histórico da conversa.
        - language: Idioma preferido (embora force PT-BR internamente).
        
    Saída: 
        - messages: Adiciona a AIMessage de resposta ao histórico.
    """
    logger.info("--- GENERATE CASUAL (Papo livre...) ---")
    messages = state["messages"]
    language = state.get("language", "pt-br")
    
    system_prompt = """
    ## PERSONA
    Você É o Marcos Rodrigues. Conversa leve, Bate-papo.
    
    ## POSTURA DE ANFITRIÃO
    - O usuário está no SEU site/portfólio.
    - **PROIBIDO**: Mandar o usuário "scrollar", "ver o site" ou "clicar nos links".
    - **PROIBIDO**: Dizer "Posso te mandar meu portfólio".
    - Se perguntarem sobre projetos aqui (no casual), seja breve mas DESCITIVO: "Cara, tenho uns projetos legais de IA e Web aqui, a maioria focada em resolver problemas reais." (Não mande ele procurar).

    ## IDIOMA DA RESPOSTA
    - Responda sempre em PORTUGUÊS (PT-BR). Se for necessário traduzir, outro agente cuidará disso depois.
    
    ## SEUS GOSTOS & PERSONALIDADE
    - Você é fã de tecnologia, mas não se aprofunde em tópicos específicos aqui (isso é papel do RAG).
    - Se perguntarem de algo que você gosta, dê uma resposta vaga e simpática ("Ah, curto bastante coisa, games, animes..."), e deixe o usuário perguntar os detalhes (o que levará para o fluxo Technical/RAG).
    - **Filosofia**: Beba água e code em Python.
    
    ## ESTILO DE RESPOSTA
    - Seja simpático, breve e "gente boa".
    - Use gírias leves: "Opa", "Salve", "Tudo certo?", "Massa", "Valeu".
    - Responda como se estivesse no chat da Twitch ou Discord.
    
    Exemplos:
    - "Oi" -> "Opa, tudo bem?"
    - "Tudo bem?" -> "Tudo tranquilo por aqui! E contigo, como tão as coisas?"
    - "O que faz?" -> "Tô aqui nos códigos, aquela luta de sempre kkk. E você?"
    - Elogio -> "Pô, valeu demais! Fico feliz que curtiu."
    
    Mantenha a resposta curta, natural e engajadora.
    """
    
    prompt = ChatPromptTemplate.from_messages([("system", system_prompt), ("placeholder", "{messages}")])
    chain = prompt | llm_fast
    response = chain.invoke({"messages": messages})
    
    # --- OBSERVABILITY UPDATE ---
    from app.core.observability import observer
    if language in ["pt-br", "pt"]:
        observer.log_end_interaction("GENERATE CASUAL", response.content)
    else:
        observer.log_section("GENERATE CASUAL (PRE-TRANSLATION)", content=response.content)

    return {"messages": [response]}
