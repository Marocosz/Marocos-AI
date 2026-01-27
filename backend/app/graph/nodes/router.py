"""
MÓDULO DE ROTEAMENTO INTELIGENTE (ROUTER)
--------------------------------------------------
Objetivo:
    Classificar a intenção do usuário para definir o fluxo de execução.
    Decide se o usuário quer conversar (Casual) ou perguntar sobre o portfólio (Technical).

Atuação no Sistema:
    - Backend / Nodes: Ativado logo após a contextualização e antes de qualquer ação.

Responsabilidades:
    1. Pré-Router Determinístico (Regex): Captura "Oi", "Valeu", "Kkk" instantaneamente (Custo Zero).
    2. Router Semântico (LLM): Analisa nuances complexas com validação de confiança.
    3. Safety Fallback: Em caso de dúvida, força o caminho Técnico (Melhor errar tentando ajudar).
"""

import re
import json
from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import llm_fast
from app.graph.state import AgentState
from app.core.logger import logger

# --- NÓ 1: ROUTER (O Cérebro que decide) ---
def router_node(state: AgentState):
    """
    Classifica a intenção de navegação.
    
    Estratégia Híbrida:
        1. Tenta Regex para casos triviais (otimização de latência/custo).
        2. Se falhar, usa LLM para classificação semântica estruturada (JSON).
        
    Mecanismos de Defesa:
        - Enum Validation: Garante que só sai 'technical' ou 'casual'.
        - Confidence Threshold:
            * < 0.4: Força Technical (Incerteza alta).
            * 0.4 - 0.6: Loga warning mas aceita.
            
    Entrada: state['rephrased_query'].
    Saída: state['classification'] (Dita o próximo passo no Grafo).
    """
    import re # Import local para manter escopo
    
    logger.info("--- ROUTER (Classificando intenção...) ---")
    messages = state["messages"]
    
    # Input principal: Preferência para a query contextualizada, fallback para a original
    input_text = state.get("rephrased_query") or messages[-1].content
    input_text_clean = input_text.strip().lower()
    
    # ------------------------------------------------------------------
    # 1. PRÉ-ROUTER DETERMINÍSTICO (Economia de LLM)
    # ------------------------------------------------------------------
    # Só aplica se a mensagem for curta (evita classificar "Oi, o que é Python?" como casual)
    if len(input_text_clean.split()) <= 3:
        # Regex para saudações, agradecimentos e reações curtas
        casual_patterns = [
            r"^(oi|ol[áa]|eai|opa|alo|hello|hi)\W*$",  # Saudações simples
            r"^(valeu|obrigad[oa]|thanks|thx)\W*$",    # Agradecimentos
            r"^(ok|blz|beleza|show|top|massa|brabo|legal)\W*$", # Reações positivas
            r"^(tchau|flw|fui|até mais)\W*$",          # Despedidas
            r"^(k){3,}.*",                             # Risadas (kkkk)
            r"^(haha|hehe).*"                          # Risadas
        ]
        
        for pattern in casual_patterns:
            if re.match(pattern, input_text_clean):
                from app.core.observability import observer
                observer.log_section("ROUTER", data={"Type": "DETERMINISTIC (REGEX)", "Class": "CASUAL"})
                return {"classification": "casual"}

    # ------------------------------------------------------------------
    # 2. ROUTER SEMÂNTICO (LLM Estruturado)
    # ------------------------------------------------------------------
    
    # Contexto mínimo para auxiliar decisão (Ponto 3)
    last_msg_type = messages[-2].type if len(messages) > 1 else "inicio"
    context_hint = f"Mensagem anterior foi do tipo: {last_msg_type}"

    prompt = """
    Identifique a intenção do usuário para roteamento.
    
    # DIRETRIZES DE INTENÇÃO (Geral):
    
    [TECHNICAL] -> Rota de Consulta (RAG/Memória - OBRIGATÓRIO PARA FATOS E GOSTOS)
    - Perguntas sobre o MARCOS (Quem é? O que ele faz? Habilidades?).
    - Perguntas sobre GOSTOS PESSOAIS (Filmes, Animes, Jogos, Músicas, Hobbies).
    - Perguntas Fatuais ou Técnicas (Stack, Arquitetura, Projetos).
    - Perguntas Híbridas ("Oi, você joga Valorant?").
    - Qualquer pergunta que exija consultar a "memória" do Marcos.

    [CASUAL] -> Rota Social (Chat Livre - SOMENTE PUREZA SOCIAL)
    - APENAS saudações vazias ("Oi", "Olá", "Bom dia", "Tudo bem?").
    - APENAS agradecimentos simples ("Valeu", "Obrigado").
    - APENAS reações curtas ("Kkkk", "Legal", "Entendi", "Show").
    - Perguntas sobre O CHATBOT em si ("Como você funciona?", "Você dorme?").

    REGRA DE OURO / ANTI-ERRO:
    - Se o usuário perguntar "Gosta de X?", "Joga Y?" ou "Assiste Z?" -> É TECHNICAL.
    - O conteúdo sobre gostos pessoais ESTÁ no banco de dados (RAG). Não classifique como Casual.
    - Se houver dúvida se é uma pergunta pessoal ou técnica -> TECHNICAL.

    # FORMATO JSON:
    {{
        "classification": "technical" | "casual",
        "confidence": 0.0 a 1.0,
        "reason": "breve motivo"
    }}
    
    Contexto: {context_hint}
    Input: "{question}"
    """
    
    chain = ChatPromptTemplate.from_template(prompt) | llm_fast
    response = chain.invoke({
        "question": input_text,
        "context_hint": context_hint
    })
    
    try:
        content = response.content.strip()
        if content.startswith("```"):
            content = content.replace("```json", "").replace("```", "")
        
        data = json.loads(content)
        
        # PONTO 1: Validação Estrita de Enum
        raw_class = data.get("classification", "").lower()
        if raw_class not in ["technical", "casual"]:
            logger.warning(f"Router: Classificação inválida '{raw_class}'. Forçando 'technical'.")
            classification = "technical"
        else:
            classification = raw_class

        confidence = float(data.get("confidence", 0.0))
        reason = data.get("reason", "N/A")
        
        # PONTO 2: Lógica de Confiança (Thresholds)
        final_decision = classification
        
        # Regra: Incerteza (< 0.4) -> Força Technical (Segurança)
        if confidence < 0.4:
            logger.warning(f"Router: Confiança muito baixa ({confidence}). Forçando fallback para TECHNICAL.")
            final_decision = "technical"
            
        # Regra: Dúvida (0.4 - 0.6) -> Mantém mas loga warning
        elif 0.4 <= confidence < 0.6:
            logger.warning(f"Router: Confiança marginal ({confidence}). Mantendo decisão original: {classification}.")

        # PONTO 6: Métricas de Observabilidade (Logs Estruturados VISUAIS)
        from app.core.observability import observer
        
        observer.log_section("ROUTER", 
            data={
                "Class": final_decision.upper(),
                "Confidence": f"{confidence:.2f}",
                "Fallback": (final_decision != classification)
            },
            content=f"Reason: {reason}"
        )

        return {"classification": final_decision}

    except Exception as e:
        logger.error(f"Router Error: {e}. Fail-safe para TECHNICAL.", extra={"error": str(e)})
        return {"classification": "technical"}
