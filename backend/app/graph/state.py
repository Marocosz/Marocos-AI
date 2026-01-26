from typing import Annotated, List
from typing_extensions import TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """
    Estado do grafo.
    - messages: Histórico da conversa.
    - context: Trechos do RAG.
    - classification: 'technical' ou 'casual' (Decisão do Router).
    """
    messages: Annotated[List[BaseMessage], add_messages]
    context: List[str]
    classification: str
    rephrased_query: str
    language: str
    summary: str