"""
DEFINIÇÃO E MONTAGEM DO GRAFO (WORKFLOW)
--------------------------------------------------
Objetivo:
    Orquestrar a execução lógica do agente de IA.
    Configura a ordem de execução dos nós, as decisões condicionais (IFs) e o fluxo de dados.
    Transforma funções Python isoladas em uma aplicação estruturada (StateGraph).

Atuação no Sistema:
    - Backend / Core Logic: É o ponto de entrada da execução da IA (invocado pelo endpoint da API).

Responsabilidades:
    1. Registrar todos os nós disponíveis (funções do nodes.py).
    2. Definir o fluxo linear (Edges).
    3. Definir o fluxo condicional (Conditional Edges) baseado no estado.
    4. Compilar o grafo em uma aplicação executável (Runnable).

Comunicação:
    - Importa e orquestra funções de `app.graph.nodes`.
    - Utiliza o estado definido em `app.graph.state`.
    - Exporta `agent_app` para uso no servidor (main.py ou simulador).
"""

from typing import Literal
from langgraph.graph import StateGraph, END
from app.graph.state import AgentState  # <--- IMPORTANDO DO ARQUIVO CERTO
from app.graph.nodes import (
    router_node, retrieve, generate_rag, generate_casual, 
    contextualize_input, translator_node, 
    contextualize_input, translator_node, 
    detect_language_node, summarize_conversation,
    answerability_guard, fallback_responder # Novos nós do Guard
)
# from app.graph.nodes_guard import answerability_guard, fallback_responder # <-- REMOVIDO (agora incluído acima)

# --------------------------------------------------
# Lógica de Decisão Condicional (Roteamento)
# --------------------------------------------------
def decide_next_node(state: AgentState) -> Literal["retrieve", "generate_casual"]:
    """
    Função Helper para decidir o próximo passo após o nó 'router_node'.
    
    Por que existe:
        O LangGraph precisa de uma função explícita para resolver 'Conditional Edges'.
        Esta função lê o estado e retorna o NOME (string) do próximo nó.
        
    Entrada: State gerado pelo router_node.
    Saída: String com o nome do próximo nó ("retrieve" ou "generate_casual").
    """
    # Acessa a classificação definida pelo Router (technical/casual)
    user_intent = state["classification"]
    
    if user_intent == "casual":
        return "generate_casual"
    else:
        # Padrão de segurança: Se technical ou qualquer erro, tenta buscar no RAG.
        # Isso garante que dúvidas reais nunca sejam descartadas.
        return "retrieve" 

# --------------------------------------------------
# Lógica de Decisão: Guard (Respondibilidade)
# --------------------------------------------------
def decide_after_guard(state: AgentState) -> Literal["generate_rag", "fallback_responder"]:
    """
    Decide se segue para geração de resposta (RAG) ou fallback.
    
    Lógica:
        - Verifica o resultado do `answerability_guard`.
        - Se is_answerable == True: Segue para gerar a resposta com os dados.
        - Se is_answerable == False: Desvia para o FallbackResponder para negar educadamente.
    """
    result = state.get("answerability_result", {})
    
    # Default True (Fail Open para geração) para evitar travar em caso de erro de parsing no Guard,
    # embora o Guard tenha fail-safe interno.
    if result.get("is_answerable", True):
        return "generate_rag"
        
    # Caminho de negação/explicação
    return "fallback_responder" 

# --------------------------------------------------
# Lógica de Decisão: Tradução
# --------------------------------------------------
def should_translate(state: AgentState):
    """
    Verifica se a resposta precisa ser traduzida antes de finalizar.
    
    Lógica:
        - Se o idioma detectado for PT-BR (nativo do bot), encerra (END).
        - Caso contrário, envia para o nó 'translator_node'.
    """
    lang = state.get("language", "pt-br").lower()
    if lang in ["pt-br", "pt", "portuguese", "português"]:
        return "end" # Caminho feliz (mais rápido)
    return "translator_node" # Caminho extra (internacionalização)


# --------------------------------------------------
# Construção do Grafo
# --------------------------------------------------
def create_graph():
    """
    Monta a máquina de estados finita (FSM) do agente.
    """
    # Inicializa o grafo tipado com AgentState
    workflow = StateGraph(AgentState)

    # 1. Registro de Nós (Nodes)
    # Cada string é um ID único para o nó no grafo.
    workflow.add_node("detect_language", detect_language_node) 
    workflow.add_node("summarize_conversation", summarize_conversation) 
    workflow.add_node("contextualize_input", contextualize_input) 
    workflow.add_node("router_node", router_node)
    workflow.add_node("retrieve", retrieve)
    workflow.add_node("generate_rag", generate_rag)
    workflow.add_node("generate_casual", generate_casual)
    workflow.add_node("translator_node", translator_node)
    
    # NOVOS NÓS (Guard & Fallback)
    workflow.add_node("answerability_guard", answerability_guard)
    workflow.add_node("fallback_responder", fallback_responder)

    # 2. Definição do Fluxo Linear (Sequência Obrigatória)
    # Entry Point -> Detect -> Summarize -> Contextualize -> Router
    workflow.set_entry_point("detect_language") 
    workflow.add_edge("detect_language", "summarize_conversation")
    workflow.add_edge("summarize_conversation", "contextualize_input")
    workflow.add_edge("contextualize_input", "router_node")

    # 3. Definição do Fluxo Condicional (Bifurcação)
    # Do 'router_node', o fluxo se divide em dois caminhos possíveis.
    workflow.add_conditional_edges(
        "router_node",      # Nó de origem
        decide_next_node,   # Função de decisão
        {                   # Mapa: Retorno da Função -> Nome do Nó Destino
            "retrieve": "retrieve",
            "generate_casual": "generate_casual"
        }
    )

    # 4. Reconvergência e Tradução
    # O caminho técnico passava direto para generate_rag.
    # AGORA: Passa pelo Guardião primeiro.
    workflow.add_edge("retrieve", "answerability_guard")
    
    # Do Guardião, decide se vai para RAG ou Fallback
    workflow.add_conditional_edges(
        "answerability_guard",
        decide_after_guard,
        {
            "generate_rag": "generate_rag",
            "fallback_responder": "fallback_responder"
        }
    )

    # Tanto o RAG quanto o Casual convergem para a verificação de tradução.
    # Tanto o RAG, Casual e Fallback convergem para a verificação de tradução.
    # Isso evita duplicar lógica de tradução em cada braço.
    workflow.add_conditional_edges("generate_rag", should_translate, {"end": END, "translator_node": "translator_node"})
    workflow.add_conditional_edges("fallback_responder", should_translate, {"end": END, "translator_node": "translator_node"})
    workflow.add_conditional_edges("generate_casual", should_translate, {"end": END, "translator_node": "translator_node"})

    # Se passar pelo tradutor, o próximo passo é sempre o fim (END).
    workflow.add_edge("translator_node", END)

    # Compila para gerar o executável (Runnable)
    return workflow.compile()

# Instância exportada pronta para uso
agent_app = create_graph()