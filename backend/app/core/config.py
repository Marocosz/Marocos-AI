"""
ARQUIVO DE CONFIGURAÇÃO E DEFINIÇÕES DE LLM
--------------------------------------------------
Objetivo:
    Centralizar as configurações globais da aplicação, o carregamento de variáveis de ambiente
    e, principalmente, as definições estruturais para o uso de LLMs (Large Language Models).
    Atua como a "fonte da verdade" para configurações de infraestrutura e mapeamento de modelos.

Atuação no Sistema:
    - Backend / Core: Fornece constantes e configurações usadas por todo o backend.
    - IA / LLM Factory: Define os vocabulários (Enums) e o registro (Registry) que permitem
      a criação agnóstica de modelos de IA.

Responsabilidades:
    1. Definir os Provedores de IA suportados (OpenAI, Groq, Gemini).
    2. Definir os Níveis de Capacidade (Tiers) dos modelos (Fast, Medium, Strong).
    3. Mapear a combinação abstrata (Provedor + Nível) para o nome técnico real do modelo.
    4. Carregar e validar variáveis de ambiente (.env) via Pydantic.

Comunicação:
    - Importado por `app.core.llm` (para instanciar modelos).
    - Importado por `app.services.rag_service` (para configurar o banco vetorial).
    - Importado por `nodes.py` e outros módulos que precisam de acesso a chaves ou configs.
"""

import os
from pathlib import Path
from enum import Enum
from typing import List
from pydantic import field_validator, ValidationInfo
from pydantic_settings import BaseSettings

# Base Directory: Points to the 'backend' folder (parent of 'app')
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class LLMProvider(str, Enum):
    """
    Enumeração dos provedores de IA suportados pela aplicação.
    Utilizado para garantir consistência na seleção do serviço (evita 'magic strings').
    """
    OPENAI = "openai"
    GROQ = "groq"
    GEMINI = "gemini"

class ModelTier(str, Enum):
    """
    Abstração dos níveis de capacidade dos modelos.
    Permite que o sistema solicite um modelo "Rápido" ou "Forte" sem precisar saber
    qual é a versão específica (ex: gpt-4o ou gpt-5) naquele momento.
    
    - FAST: Baixa latência, menor custo, ideal para Router e classificações simples.
    - MEDIUM: Equilíbrio entre custo e inteligência.
    - STRONG: Alta capacidade de raciocínio, ideal para geração complexa e RAG.
    """
    FAST = "fast"
    MEDIUM = "medium"
    STRONG = "strong"

# --------------------------------------------------
# MODEL REGISTRY (Mapeamento de Configuração)
# --------------------------------------------------
# Este dicionário atua como a tabela de configuração da "LLM Factory".
# Ele traduz a intenção abstrata (Provedor + Nível) para a implementação concreta (Nome do Modelo).
#
# Regra de Negócio:
# Para alterar o modelo usado em toda a aplicação (ex: upgrade de gpt-4 para gpt-5),
# basta alterar a string aqui, sem necessidade de refatorar o código dos agentes.
MODEL_REGISTRY = {
    # A família gpt-4.1 foi descontinuada pela OpenAI; gpt-5-mini é o único modelo de chat
    # liberado para a chave do projeto, então os 3 tiers apontam para ele.
    (LLMProvider.OPENAI, ModelTier.FAST): "gpt-5-mini",
    (LLMProvider.OPENAI, ModelTier.MEDIUM): "gpt-5-mini",
    (LLMProvider.OPENAI, ModelTier.STRONG): "gpt-5-mini",
    
    (LLMProvider.GROQ, ModelTier.FAST): "llama-3.1-8b-instant",
    (LLMProvider.GROQ, ModelTier.MEDIUM): "llama-3.1-70b-versatile",
    (LLMProvider.GROQ, ModelTier.STRONG): "llama-3.3-70b-versatile",

    (LLMProvider.GEMINI, ModelTier.FAST): "gemini-1.5-flash",
    (LLMProvider.GEMINI, ModelTier.MEDIUM): "gemini-1.5-pro",
    (LLMProvider.GEMINI, ModelTier.STRONG): "gemini-1.5-pro",
}

class Settings(BaseSettings):
    """
    Classe de Gerenciamento de Configurações e Segredos.
    Utiliza Pydantic para ler o arquivo .env, validar tipos e fornecer defaults.
    """

    # --- Credenciais e Segurança ---
    # Chaves de API para os serviços externos.
    # Definidas ANTES do provider para estarem disponíveis na validação.
    OPENAI_API_KEY: str | None = None
    GROQ_API_KEY: str | None = None
    GOOGLE_API_KEY: str | None = None

    # --- Configurações do Banco Vetorial (RAG) ---
    # Define onde os dados vetoriais serão persistidos e o nome da coleção.
    # Impacto: Alterar estes valores pode desconectar a aplicação da memória existente.
    # Usa path absoluto baseado no BASE_DIR
    CHROMA_DB_DIR: str = os.path.join(str(BASE_DIR), "chroma_db")
    COLLECTION_NAME: str = "marocos_portfolio"
    
    # --- Configurações de Seleção de IA ---
    # Define qual provedor será utilizado como padrão caso não seja especificado outro.
    LLM_PROVIDER: str = "gemini" 
    
    # Modelo de Embeddings
    # Responsável por converter texto em vetores.
    # Deve ser compatível com os dados já indexados no ChromaDB.
    EMBEDDING_MODEL: str = "models/gemini-embedding-001"

    # --- CORS (Cross-Origin Resource Sharing) ---
    # Lista de origens permitidas (frontend)
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173", # Vite Local
        "http://localhost:3000", # Next.js
        "https://marocos.dev",
        "https://api.marocos.dev",
        "https://www.marocos.dev"
    ]

    @field_validator("LLM_PROVIDER")
    @classmethod
    def validate_provider_key(cls, v: str, info: ValidationInfo):
        """
        Valida se a chave de API correspondente ao provider escolhido foi fornecida.
        Isso evita que o app inicie mas quebre na primeira requisição.
        """
        values = info.data
        provider = v.lower()
        
        if provider == "openai" and not values.get("OPENAI_API_KEY"):
            raise ValueError("Provider 'openai' selected but OPENAI_API_KEY is missing.")
        if provider == "groq" and not values.get("GROQ_API_KEY"):
            raise ValueError("Provider 'groq' selected but GROQ_API_KEY is missing.")
        if provider == "gemini" and not values.get("GOOGLE_API_KEY"):
            raise ValueError("Provider 'gemini' selected but GOOGLE_API_KEY is missing.")
            
        return v

    class Config:
        env_file = ".env"
        extra = "ignore" # Garante que variáveis extras no .env não quebrem a inicialização

# Instância global de configurações para ser importada em outros módulos.
settings = Settings()