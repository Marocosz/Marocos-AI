import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Keys
    GROQ_API_KEY: str
    GOOGLE_API_KEY: str

    # Configurações do Vector DB
    CHROMA_DB_DIR: str = "./chroma_db"  # Pasta onde o banco será salvo
    COLLECTION_NAME: str = "marocos_persona"

    # Configurações do Modelo
    MODEL_NAME: str = "llama-3.1-8b-instant"
    EMBEDDING_MODEL: str = "models/embedding-001"

    class Config:
        env_file = ".env"
        extra = "ignore" # Ignora variáveis extras no .env

settings = Settings()
