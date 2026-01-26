from typing import Literal
from langgraph.graph import StateGraph, END
from app.graph.state import AgentState  # <--- IMPORTANDO DO ARQUIVO CERTO
from app.graph.nodes import (
    router_node, retrieve, generate_rag, generate_casual, 
    contextualize_input, translator_node, 
    detect_language_node, summarize_conversation
)

# Função de Decisão (A ponte levadiça)
def decide_next_node(state: AgentState) -> Literal["retrieve", "generate_casual"]:
    """
    Lê a classificação feita pelo Router e aponta para onde o grafo deve ir.
    """
    user_intent = state["classification"]
    
    if user_intent == "casual":
        return "generate_casual"
    else:
        return "retrieve" # Se for technical (ou erro), vai buscar dados

# Montagem do Grafo
def create_graph():
    workflow = StateGraph(AgentState)

    # Adiciona os Nós
    workflow.add_node("detect_language", detect_language_node) # NOVO
    workflow.add_node("summarize_conversation", summarize_conversation) # NOVO
    workflow.add_node("contextualize_input", contextualize_input) 
    workflow.add_node("router_node", router_node)
    workflow.add_node("retrieve", retrieve)
    workflow.add_node("generate_rag", generate_rag)
    workflow.add_node("generate_casual", generate_casual)
    workflow.add_node("translator_node", translator_node)

    # Define o Ponto de Partida (Agora começa detectando idioma)
    workflow.set_entry_point("detect_language") 

    # Fluxo Linear Inicial: Detectar -> Resumir -> Contextualizar -> Roteador
    workflow.add_edge("detect_language", "summarize_conversation")
    workflow.add_edge("summarize_conversation", "contextualize_input")
    workflow.add_edge("contextualize_input", "router_node")

    # Define as Arestas Condicionais (O "IF" do grafo)
    workflow.add_conditional_edges(
        "router_node",      # De onde sai
        decide_next_node,   # Função que decide
        {                   # Mapa de decisões
            "retrieve": "retrieve",
            "generate_casual": "generate_casual"
        }
    )

    # Função de Check para Tradução
    def should_translate(state: AgentState):
        lang = state.get("language", "pt-br").lower()
        if lang in ["pt-br", "pt", "portuguese", "português"]:
            return "end" # Se for PT, acaba
        return "translator_node" # Se não, traduz

    # Conecta Retrieve -> Generate RAG
    workflow.add_edge("retrieve", "generate_rag")

    # Depois de Gerar (RAG ou Casual), verifica se precisa traduzir
    workflow.add_conditional_edges(
        "generate_rag",
        should_translate,
        {
            "end": END,
            "translator_node": "translator_node"
        }
    )

    workflow.add_conditional_edges(
        "generate_casual",
        should_translate,
        {
            "end": END,
            "translator_node": "translator_node"
        }
    )

    # Depois de traduzir, acaba
    workflow.add_edge("translator_node", END)

    return workflow.compile()

agent_app = create_graph()