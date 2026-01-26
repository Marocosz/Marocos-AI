from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from langchain_core.messages import HumanMessage, AIMessage

from app.graph.workflow import agent_app
from app.core.rate_limit import limiter
from app.core.logger import logger

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = [] # Ex: [{"role": "user", "content": "..."}]
    language: Optional[str] = "pt-br" # Default to PT-BR

class ChatResponse(BaseModel):
    response: str
    usage: dict # {current, limit, remaining}

@router.get("/chat/status")
async def get_status(request: Request):
    # Global limit - no IP needed
    status = limiter.get_status()
    return status

@router.post("/chat")
async def chat_endpoint(request: ChatRequest, fast_api_request: Request):
    client_ip = fast_api_request.client.host
    logger.info(f"Incoming chat request from IP: {client_ip}\nMessage: {request.message}")
    
    # Check limit before processing
    if not limiter.check_request():
        logger.warning(f"Rate limit exceeded. IP: {client_ip} tried to request.")
        raise HTTPException(
            status_code=429, 
            detail="Limite diário global do projeto atingido (APIs gratuitas). Volte amanhã!"
        )

    # 1. Converter histórico
    langchain_messages = []
    for msg in request.history:
        if msg.get("role") == "user":
            langchain_messages.append(HumanMessage(content=msg.get("content", "")))
        elif msg.get("role") == "assistant":
            langchain_messages.append(AIMessage(content=msg.get("content", "")))
    
    langchain_messages.append(HumanMessage(content=request.message))
    
    initial_state = {
        "messages": langchain_messages,
        "language": request.language or "pt-br"
    }

    # Generator function for StreamingResponse
    async def event_generator():
        try:
            # Determine mapping based on language
            is_pt = request.language != 'en' # Default to PT logic
            
            # Helper to format SSE
            def format_event(event_type, data):
                return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"

            # 1. Send initial status
            yield format_event("status", {"message": "Iniciando..." if is_pt else "Starting..."})

            final_response_content = ""
            
            # 2. Iterate over the graph updates
            # stream_mode="updates" yields the output of each node as it finishes
            async for chunk in agent_app.astream(initial_state, stream_mode="updates"):
                node_name = list(chunk.keys())[0]
                node_output = chunk[node_name]

                # Map Nodes to Status Messages
                status_msg = ""
                if node_name == "detect_language":
                    status_msg = "Lendo histórico..." if is_pt else "Reading history..."
                elif node_name == "summarize_conversation":
                    status_msg = "Entendendo contexto..." if is_pt else "Understanding context..."
                elif node_name == "contextualize_input":
                    status_msg = "Analisando intenção..." if is_pt else "Analyzing intent..."
                elif node_name == "router_node":
                    # Router output contains 'classification'.
                    classification = "technical"
                    if node_output and "classification" in node_output:
                        classification = node_output["classification"]
                    
                    if classification == "technical":
                        status_msg = "Pesquisando nas memórias..." if is_pt else "Searching memories..."
                    else:
                        status_msg = "Pensando..." if is_pt else "Thinking..."
                elif node_name == "retrieve":
                    status_msg = "Estudando informações..." if is_pt else "Reading data..."
                elif node_name == "generate_rag" or node_name == "generate_casual":
                     status_msg = "Finalizando..." if is_pt else "Finalizing..."
                elif node_name == "translator_node":
                    status_msg = "Traduzindo resposta..." if is_pt else "Translating response..."
                
                if status_msg:
                    yield format_event("status", {"message": status_msg})

                if node_output and "messages" in node_output:
                    # Check if it's an AIMessage
                    msgs = node_output["messages"]
                    if msgs and isinstance(msgs[-1], AIMessage):
                        final_response_content = msgs[-1].content

            # 3. Send final response
            if final_response_content:
                # Get updated usage stats
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

    from fastapi.responses import StreamingResponse
    import json
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")
