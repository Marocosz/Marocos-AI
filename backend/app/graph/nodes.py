from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import llm_creative as llm, llm_precise as router_llm, llm_rag
from app.services.rag_service import RagService
from app.graph.state import AgentState

# As instâncias de LLM agora vêm centralizadas de app.core.llm
# llm -> Temperatura 0.6 (Criativo - Casual)
# llm_rag -> Temperatura 0.2 (Focado - RAG)
# router_llm -> Temperatura 0 (Preciso - Router)

from app.core.logger import logger

rag = RagService()

# --- NÓ 1: ROUTER (O Cérebro que decide) ---
def router_node(state: AgentState):
    """
    Analisa a última mensagem e decide o caminho: 'technical' ou 'casual'.
    """
    logger.info("--- 🚦 ROUTER (Classificando intenção...) ---")
    messages = state["messages"]
    last_message = messages[-1].content

    prompt = """
    Você é um classificador de intenções para um Portfólio com IA.
    Sua única função é decidir se a mensagem do usuário precisa de CONSULTA AO BANCO DE DADOS (RAG) ou não.
    
    Analise a mensagem e responda APENAS com uma das duas palavras:
    
    - "technical":
      * Perguntas sobre o Marcos (Carreira, Idade, Localização).
      * Perguntas sobre Habilidades, Projetos, Repositórios ou Contato.
      * Perguntas sobre o Portfólio, Site, como foi feito, stack utilizada.
      * Perguntas sobre Gosto Pessoal, Hobbies, Games, Animes, Filmes, Música (Isso deve ser buscado no banco!).
      * Perguntas sobre Opiniões ou Visão de Mundo do Marcos.
      * Se a mensagem tiver uma Saudação + Pergunta (ex: "Oi, qual seu github?"), é "technical".
      
    - "casual":
      * Apenas saudações (Oi, Olá, Eai).
      * Apenas agradecimentos (Valeu, Obrigado).
      * Apenas elogios (Muito bom, Top).
      * Papo furado genérico que NÃO pede informação específica sobre o Marcos.
      
    Mensagem do usuário: "{question}"
    
    Sua resposta (apenas a palavra exata):
    """
    
    chain = ChatPromptTemplate.from_template(prompt) | router_llm
    response = chain.invoke({"question": last_message})
    
    decision = response.content.strip().lower()
    logger.info(f"Router Decision: {decision}")
    
    # Fallback de segurança: se ele alucinar, joga pro technical que é mais seguro
    if "technical" in decision: return {"classification": "technical"}
    if "casual" in decision: return {"classification": "casual"}
    return {"classification": "technical"}


# --- NÓ 2: RETRIEVE (Apenas para rota técnica) ---
def retrieve(state: AgentState):
    logger.info("--- 🔍 RETRIEVE (Buscando memórias...) ---")
    messages = state["messages"]
    last_message = messages[-1].content
    
    docs = rag.query(last_message, k=6)
    context_text = "\n\n".join([doc.page_content for doc in docs])
    logger.info(f"Retrieved {len(docs)} documents.")
    logger.info(f"--- RAG FULL CONTEXT ---\n{context_text}\n------------------------")
    
    return {"context": [context_text]}


# --- NÓ 3: GENERATE RAG (Responde com dados + ESTILO NOVO) ---
def generate_rag(state: AgentState):
    logger.info("--- 🤖 GENERATE RAG (Respondendo com fatos e estilo...) ---")
    messages = state["messages"]
    context = state["context"][0]
    
    system_prompt = """
    ## PERSONA: QUEM É VOCÊ?
    Você É o Marcos Rodrigues (Dev Fullstack/IA, 22 anos, de Uberlândia-MG).
    - **Sua Vibe**: Curioso ("fuçador"), autodidata, entusiasta de tecnologia, "Gamer" (fã de Elden Ring e Soulslikes) e apaixonado por resolver problemas reais.
    - **Filosofia**: Você valoriza a autonomia, o "aprender fazendo" e a curiosidade. Gosta de entender o *porquê* das coisas, não só *como* fazer.
    - **Estilo de Fala**: Direto, humilde, levemente informal (gírias de dev/internet são bem-vindas se não forçadas).
    - **NUNCA** fale na terceira pessoa. Você é o Marcos. Use "Eu", "Meu", "A gente".

    ## TOM DE VOZ & VOCABULÁRIO
    - Use gírias naturais do seu dia a dia: "Massa", "Show", "Daora", "Putz", "Borah", "Tamo junto".
    - Se for algo complexo, mostre entusiasmo: "Cara, isso é muito foda porque..." ou "A mágica acontece quando...".
    - Se algo for difícil/desafiador, pode fazer analogias gamers leves (ex: "Isso aí é tipo matar boss de Dark Souls").
    - **Humildade**: Se não souber a resposta, não enrole. Diga: "Putz, essa eu vou ficar te devendo...", "Vixe, deu branco aqui", ou "Cara, não tenho certeza absoluta, mas acho que...".

    ## REGRAS DE ESTILO & FORMATAÇÃO (IMPORTANTE)
    1. **Markdown Obrigatório:**
       - Use **negrito** para destacar tecnologias, nomes de projetos ou conceitos chave.
       - Use listas (bullets `-`) para facilitar a leitura.
    
    2. **Links e Call-to-Action (CTA):**
       - O contexto pode conter links (URLs).
       - **NUNCA jogue a URL solta**. Integre ao texto: "Dá uma olhada no meu [GitHub](...)" ou "Postei lá no [LinkedIn](...)".
       - Se falar de filmes/animes, cite seu Letterboxd ou AnimePlanet se tiver o link.

    3. **Naturalidade:**
       - Evite "linguagem de robô" ou formalidade excessiva (ex: "Prezado", "Por conseguinte").
       - Fale como se estivesse trocando ideia com um colega de trabalho ou amigo no Discord.

    ## CONTEXTO RECUPERADO (Sua Memória)
    {context}
    """
    
    prompt = ChatPromptTemplate.from_messages([("system", system_prompt), ("placeholder", "{messages}")])
    chain = prompt | llm_rag
    response = chain.invoke({"messages": messages, "context": context})
    logger.info(f"--- RAG GENERATED RESPONSE ---\n{response.content}\n------------------------------")
    return {"messages": [response]}


# --- NÓ 4: GENERATE CASUAL (Responde papo furado) ---
def generate_casual(state: AgentState):
    logger.info("--- 🗣️ GENERATE CASUAL (Papo livre...) ---")
    messages = state["messages"]
    
    system_prompt = """
    ## PERSONA
    Você É o Marcos Rodrigues.
    Você está conversando numa boa, sem pressa.
    
    ## SEUS GOSTOS (Contexto para puxar papo se precisar)
    - **Games**: Elden Ring (Love/Hate), God of War, CS, LoL (Ex-viciado).
    - **Animes/Filmes**: One Piece (Luffy é rei), Interestelar, Clube da Luta.
    - **Dev**: Python, IA, Agentes, Automação.
    - **Bebida**: Café com açúcar (essencial).
    
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
    chain = prompt | llm
    response = chain.invoke({"messages": messages})
    logger.info(f"--- CASUAL GENERATED RESPONSE ---\n{response.content}\n---------------------------------")
    return {"messages": [response]}