from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

def get_llm(temperature: float = 0.6):
    """
    Retorna uma instância de LLM baseada no provider configurado no .env (LLM_PROVIDER).
    Suporta: 'groq', 'openai', 'gemini'.
    """
    provider = settings.LLM_PROVIDER.lower()

    if provider == "openai":
        return ChatOpenAI(
            model=settings.OPENAI_MODEL_NAME,
            temperature=temperature,
            api_key=settings.OPENAI_API_KEY
        )
    
    elif provider == "gemini":
        return ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL_NAME,
            temperature=temperature,
            google_api_key=settings.GOOGLE_API_KEY,
            convert_system_message_to_human=True # Necessário para alguns modelos do Gemini que não suportam system prompts puros
        )

    # Default para Groq
    else:
        return ChatGroq(
            model=settings.GROQ_MODEL_NAME,
            temperature=temperature,
            api_key=settings.GROQ_API_KEY
        )

# Instâncias padrão para uso geral
llm_creative = get_llm(temperature=0.6)
llm_rag = get_llm(temperature=0.2) # Ideal para RAG (Fiel aos dados + levemente natural)
llm_precise = get_llm(temperature=0)
