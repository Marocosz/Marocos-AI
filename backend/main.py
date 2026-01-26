"""
PONTO DE ENTRADA DA API (Application Entrypoint)
--------------------------------------------------
Objetivo:
    Inicializar a aplicação web FastAPI, configurar middlewares globais (CORS) e registrar as rotas.

Atuação no Sistema:
    - Backend / Server: É o arquivo executado pelo servidor ASGI (Uvicorn).

Responsabilidades:
    1. Instanciar a aplicação FastAPI.
    2. Configurar CORS para permitir que o Frontend (React/Vite) faça requisições.
    3. Conectar os roteadores (endpoints) da aplicação.
    4. Fornecer endpoint de Health Check para monitoramento.

Comunicação:
    - Importa e ativa rotas definir em `app.api.routes`.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.core.config import settings
import uvicorn

app = FastAPI(
    title="Marcos Portfolio API",
    description="Backend com Agentes IA para o Portfólio do Marcos",
    version="1.0.0"
)

# --------------------------------------------------
# Configuração de CORS (Cross-Origin Resource Sharing)
# --------------------------------------------------
# Necessário porque o Frontend (Porta 5173) e Backend (Porta 8000) 
# rodam em origens diferentes durante o desenvolvimento.
origins = [
    # --- Desenvolvimento (Local) ---
    "http://localhost:5173", # Vite Local
    "http://localhost:3000", # Next.js (se houver)
    
    # --- Produção (Live) ---
    "https://marocos.dev",
    "https://www.marocos.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, OPTIONS, etc.
    allow_headers=["*"], # Permite envio de Headers customizados
)

# --------------------------------------------------
# Registro de Rotas
# --------------------------------------------------
# Prefixamos com /api para manter bom versionamento e organização
app.include_router(api_router, prefix="/api")

# --------------------------------------------------
# Health Check
# --------------------------------------------------
@app.get("/health")
def health_check():
    """
    Endpoint leve para verificadores de uptime (ex: AWS Load Balancer, Pingdom).
    Retorna 200 OK se o servidor estiver de pé.
    """
    return {"status": "ok", "provider": settings.LLM_PROVIDER}

if __name__ == "__main__":
    # Inicia servidor de desenvolvimento com Hot Reload
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
