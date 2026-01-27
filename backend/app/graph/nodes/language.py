"""
MÓDULO DE IDIOMAS E INTERNACIONALIZAÇÃO
--------------------------------------------------
Objetivo:
    Gerenciar a detecção do idioma do usuário e a tradução das respostas,
    permitindo que o bot funcione em múltiplas línguas sem perder a persona.
    
Atuação no Sistema:
    - Backend / Nodes: Pontas do pipeline (Início e Fim).
    
Responsabilidades:
    1. Detect Language: Identificar se o user fala PT-BR (nativo) ou outro idioma.
    2. Translator: Adaptar a resposta final para o idioma alvo, preservando termos técnicos.
"""

from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import llm_fast
from app.graph.state import AgentState
from app.core.logger import logger

# --- NÓ 0A: DETECT LANGUAGE (Identificação Automática) ---
def detect_language_node(state: AgentState):
    """
    Identifica o idioma da entrada do usuário.
    
    Por que existe:
        Permite suporte passivo a estrangeiros. O sistema opera internamente em PT-BR
        (para manter a qualidade do RAG e persona), mas este nó "marca" o estado
        para que a tradução ocorra apenas no último passo.
        
    Entrada: state['messages'] (última mensagem).
    Saída: state['language'] (código ISO, ex: 'en', 'es', 'pt-br').
    """
    logger.info("--- DETECT LANGUAGE (Identificando idioma...) ---")
    messages = state["messages"]
    last_message = messages[-1].content
    
    # --- OBSERVABILITY START ---
    from app.core.observability import observer
    observer.log_start_interaction(last_message)
    # ---------------------------
    
    system_prompt = """
    Você é um classificador de idiomas preciso.
    Sua tarefa é identificar em qual língua o texto abaixo está escrito.
    
    Retorne APENAS o código ISO 639-1 (ex: 'pt-br', 'en', 'es', 'fr').
    
    Regras:
    - Se for Português, retorne 'pt-br'.
    - Se for muito curto ou ambíguo (ex: "ok", "test"), assuma 'pt-br' se não for óbvio.
    - NÃO responda a mensagem, apenas classifique.
    - Retorne APENAS o código, sem pontuação ou explicação.
    
    Texto: {text}
    """
    prompt = ChatPromptTemplate.from_template(system_prompt)
    chain = prompt | llm_fast # Modelo rápido e preciso
    
    response = chain.invoke({"text": last_message})
    detected_lang = response.content.strip().lower()
    
    # --- OBSERVABILITY UPDATE ---
    observer.log_section("DETECT LANGUAGE", data={"Language": detected_lang})
    
    return {"language": detected_lang}


# --- NÓ 5: TRANSLATOR (Opcional - Apenas se não for PT-BR) ---
def translator_node(state: AgentState):
    """
    Traduz a resposta final do bot para o idioma do usuário.
    
    Lógica:
        - Verifica se o idioma alvo é diferente de PT-BR.
        - Se for igual, retorna vazio (no-op).
        - Se for diferente, invoca LLM para traduzir mantendo gírias adaptadas.
    
    Entrada: state['messages'] (última resposta do bot), state['language'].
    Saída: Nova AIMessage com o conteúdo traduzido.
    """
    logger.info("--- TRANSLATOR (Traduzindo resposta...) ---")
    messages = state["messages"]
    last_message = messages[-1].content
    target_language = state.get("language", "pt-br")
    
    # Se já for PT-BR (ou não especificado), não faz nada.
    if target_language.lower() in ["pt-br", "pt", "portuguese", "português"]:
        return {} # Retorna vazio para não adicionar nada novo

    # Prompt de Tradução com manutenção de Persona e Termos Técnicos.
    system_prompt = f"""
    Você é um TRADUTOR ESPECIALISTA e LOCALIZADOR DE CONTEÚDO (PT-BR -> {target_language}).
    Sua tarefa é traduzir a resposta do assistente (Marcos) para o idioma solicitado, MANTENDO A PERSONA.

    ## REGRAS DE TRADUÇÃO:
    1. **Persona & Tom**: O Marcos é jovem, dev, informal e direto. Mantenha esse tom.
       - "Massa/Daora" -> "Cool/Awesome" (EN)
       - "Putz" -> "Damn/Shoot" (EN)
       - Não traduza gírias literalmente, use a equivalente cultural.
    
    2. **Filmes, Séries e Jogos (CRÍTICO)**:
       - Se houver nomes de filmes/jogos na resposta, você DEVE usar o título oficial no idioma de destino ({target_language}), se existir e for comum.
       - Exemplo (PT -> EN): "O Poderoso Chefão" -> "The Godfather".
       - Exemplo (PT -> EN): "Cidade de Deus" -> "City of God".
       - Se for um nome universal (ex: "Elden Ring", "Avengers"), mantenha.
    
    3. **Termos Técnicos**: Mantenha em Inglês (Code, Deploy, Frontend), pois é padrão.
    
    4. **NÃO EXPLIQUE**: Apenas entregue a tradução final. Não diga "Aqui está a tradução".

    Texto Original (PT-BR):
    {last_message}
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
    ])
    
    # Usa o modelo fast para garantir a melhor nuance na tradução.
    chain = prompt | llm_fast
    
    response = chain.invoke({})
    translated_text = response.content.strip()
    
    # --- OBSERVABILITY UPDATE ---
    from app.core.observability import observer
    observer.log_section("TRANSLATOR", data={"Target": target_language}, content=f"Original: {last_message}\nTranslated: {translated_text}")
    
    observer.log_end_interaction("TRANSLATOR", translated_text)
    
    # Retorna uma nova mensagem AIMessage com o conteúdo traduzido.
    # O LangGraph irá adicionar a mensagem traduzida ao histórico.
    return {"messages": [AIMessage(content=translated_text)]}
