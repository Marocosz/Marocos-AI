"""
ROTAS DA API (FastAPI)
--------------------------------------------------
Objetivo:
    Expor os pontos de entrada HTTP para que o Frontend possa se comunicar com o Backend.
    Gerencia o ciclo de vida da requisição, validação de dados e resposta em streaming.

Atuação no Sistema:
    - Backend / API Layer: A fronteira entre o mundo externo e a lógica interna da IA.

Responsabilidades:
    1. Receber requisições do Chat (/chat).
    2. Validar payloads de entrada (Pydantic).
    3. Aplicar controle de taxa (Rate Limiting) global.
    4. Converter formato de mensagens (Frontend -> LangChain).
    5. Executar o Grafo de IA em modo Streaming (SSE).
    6. Enviar atualizações de status ("Pesquisando...", "Pensando...") em tempo real.

Comunicação:
    - Invoca `agent_app` (workflow.py) para processar a IA.
    - Consulta `limiter` (rate_limit.py) para aprovar requisições.
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import json
from langchain_core.messages import HumanMessage, AIMessage

from app.graph.workflow import agent_app
from app.core.rate_limit import limiter
from app.core.logger import logger

router = APIRouter()

# --------------------------------------------------
# Modelos de Dados (DTOs)
# --------------------------------------------------
class ChatRequest(BaseModel):
    """
    Payload esperado na requisição de chat.
    """
    message: str # A nova mensagem do usuário
    history: Optional[List[dict]] = [] # Histórico da conversa [{"role": "user", "content": "..."}]
    language: Optional[str] = "pt-br" # Idioma da interface (para status messages)

class ChatResponse(BaseModel):
    response: str
    usage: dict # Estatísticas de uso da quota diária

# --------------------------------------------------
# Endpoint de Status
# --------------------------------------------------
@router.get("/chat/status")
async def get_status(request: Request):
    """
    Retorna o consumo atual da API (quantas requisições restam hoje).
    Usado pelo Frontend para exibir o contador na UI.
    """
    status = limiter.get_status()
    return status

# --------------------------------------------------
# Endpoint Principal de Chat (Streaming)
# --------------------------------------------------
@router.post("/chat")
async def chat_endpoint(request: ChatRequest, fast_api_request: Request):
    """
    Processa uma nova mensagem de chat e retorna uma resposta via Server-Sent Events (SSE).
    
    Fluxo:
    1. Verifica Rate Limit.
    2. Reconstrói o histórico de mensagens no formato LangChain.
    3. Inicia o grafo (agent_app) em modo assíncrono.
    4. Intercepta cada passo do grafo para enviar feedbacks de progresso ao usuário.
    5. Envia a resposta final.
    """
    client_ip = fast_api_request.client.host
    logger.info(f"Incoming chat request from IP: {client_ip}\nMessage: {request.message}")
    
    # 1. Validação de Rate Limit (Segurança)
    if not limiter.check_request():
        logger.warning(f"Rate limit exceeded. IP: {client_ip} tried to request.")
        raise HTTPException(
            status_code=429, 
            detail="Limite diário global do projeto atingido (APIs gratuitas). Volte amanhã!"
        )

    # 2. Conversão de Histórico (JSON -> Objetos LangChain)
    langchain_messages = []
    for msg in request.history:
        if msg.get("role") == "user":
            langchain_messages.append(HumanMessage(content=msg.get("content", "")))
        elif msg.get("role") == "assistant":
            langchain_messages.append(AIMessage(content=msg.get("content", "")))
    
    # Adiciona a mensagem atual
    langchain_messages.append(HumanMessage(content=request.message))
    
    # Estado inicial do grafo
    initial_state = {
        "messages": langchain_messages,
        "language": request.language or "pt-br"
    }

    # 3. Gerador de Eventos SSE (Server-Sent Events)
    # Permite enviar dados parciais sem fechar a conexão HTTP.
    async def event_generator():
        try:
            
            # Helper para definir idioma das mensagens de status
            is_pt = request.language != 'en' 
            
            # Formata evento no padrão SSE:
            # event: nome_do_evento
            # data: json_string
            def format_event(event_type, data):
                return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"

            # Envia status inicial
            yield format_event("status", {"message": "Iniciando..." if is_pt else "Starting..."})

            final_response_content = ""
            
            # 4. Loop de Execução do Grafo
            # agent_app.astream(stream_mode="updates") retorna um dict a cada nó finalizado.
            async for chunk in agent_app.astream(initial_state, stream_mode="updates"):
                node_name = list(chunk.keys())[0]
                node_output = chunk[node_name]

                # Mapeamento: Nó -> Mensagem de Status para o Usuário
                status_msg = ""
                if node_name == "detect_language":
                    status_msg = "Lendo histórico..." if is_pt else "Reading history..."
                elif node_name == "summarize_conversation":
                    status_msg = "Entendendo contexto..." if is_pt else "Understanding context..."
                elif node_name == "contextualize_input":
                    status_msg = "Analisando intenção..." if is_pt else "Analyzing intent..."
                elif node_name == "router_node":
                    # Se o router decidiu que é técnico, avisa que vai pesquisar.
                    classification = node_output.get("classification", "technical")
                    
                    if classification == "technical":
                        status_msg = "Pesquisando nas memórias..." if is_pt else "Searching memories..."
                    else:
                        status_msg = "Pensando..." if is_pt else "Thinking..."
                elif node_name == "retrieve":
                    status_msg = "Estudando informações..." if is_pt else "Reading data..."
                elif node_name == "answerability_guard":
                    status_msg = "Validando resposta..." if is_pt else "Validating answer..."
                elif node_name == "fallback_responder":
                    status_msg = "Formulando explicação..." if is_pt else "Formulating explanation..."
                elif node_name == "generate_rag" or node_name == "generate_casual":
                     status_msg = "Finalizando..." if is_pt else "Finalizing..."
                elif node_name == "translator_node":
                    status_msg = "Traduzindo resposta..." if is_pt else "Translating response..."
                
                # Se houve mudança de status, envia evento ao frontend
                if status_msg:
                    yield format_event("status", {"message": status_msg})

                # Captura a resposta final (AIMessage) quando ela aparecer
                if node_output and "messages" in node_output:
                    msgs = node_output["messages"]
                    # Verifica se é uma resposta da IA e não um comando de sistema
                    if msgs and isinstance(msgs[-1], AIMessage):
                        final_response_content = msgs[-1].content

            # 5. Envio da Resposta Final
            if final_response_content:
                # Recupera stats atualizados após o processamento
                stats = limiter.get_status()
                yield format_event("result", {
                    "response": final_response_content,
                    "usage": stats
                })
            else:
                 yield format_event("error", {"detail": "No response generated."})

        except Exception as e:
            logger.error(f"Stream Error: {e}")
            yield format_event("error", {"detail": str(e)})

    return StreamingResponse(event_generator(), media_type="text/event-stream")
