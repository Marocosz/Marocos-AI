"""
FACTORY DE MODELOS DE LINGUAGEM (LLM)
--------------------------------------------------
Objetivo:
    Centralizar a lógica de criação e configuração de instâncias de modelos de linguagem (LLMs).
    Implementa o padrão "Factory" para permitir a troca dinâmica entre provedores (OpenAI, Groq, Gemini)
    e níveis de capacidade (Fast, Medium, Strong) sem alterar o código dos agentes.

Atuação no Sistema:
    - Backend / Core: Fornece as instâncias de IA prontas para uso por todo o sistema.
    - IA: Abstrai a complexidade de instanciar diferentes bibliotecas (langchain_openai, langchain_groq, etc).

Responsabilidades:
    1. Receber parâmetros abstratos (Provider, Tier, Temperature).
    2. Resolver o nome técnico do modelo usando o registro de configuração.
    3. Instanciar a classe correta do LangChain com as credenciais apropriadas.
    4. Fornecer instâncias padrão (Precise, RAG, Creative) para uso rápido.

Comunicação:
    - Importa configurações de `app.core.config`.
    - É importado por `nodes.py` e outros módulos que necessitam de processamento de IA.
"""

from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings, LLMProvider, ModelTier, MODEL_REGISTRY

def get_llm(provider: LLMProvider | str, tier: ModelTier | str, temperature: float = 0.5, **kwargs):
    """
    Cria e retorna uma instância de modelo de linguagem configurada (Factory Method).
    
    Por que existe:
        Para desacoplar a lógica de negócio (Agentes) da implementação específica do modelo.
        Permite mudar de "GPT-4" para "Claude" ou "Llama" alterando apenas parâmetros,
        sem mexer no código dos nós.

    Quando é chamada:
        - Na inicialização da aplicação para criar as instâncias padrão.
        - Dinamicamente, se algum agente precisar de um modelo específico sob demanda.

    Args:
        provider: O fornecedor da IA ('openai', 'groq', 'gemini'). Aceita Enum ou string.
        tier: O nível de capacidade desejado ('fast', 'medium', 'strong'). Aceita Enum ou string.
        temperature: Nível de criatividade (0.0 = determinístico, 1.0 = criativo). Padrão 0.5.
        **kwargs: Parâmetros adicionais suportados pelos modelos (ex: max_tokens, timeout).

    Returns:
        Uma instância de BaseChatModel do LangChain (ChatOpenAI, ChatGroq, etc) pronta para invoke.
    """
    
    # --------------------------------------------------
    # Normalização de Entradas
    # --------------------------------------------------
    # Garante que strings (vindas de .env ou input) sejam convertidas para Enums seguros.
    # Se a conversão falhar, aplica fallbacks seguros definidos nas configurações globais.
    if isinstance(provider, str):
        try:
            provider = LLMProvider(provider.lower())
        except ValueError:
            # Fallback de segurança: usa o provider padrão do .env se o solicitado for inválido
            provider = LLMProvider(settings.LLM_PROVIDER.lower()) 
            
    if isinstance(tier, str):
        try:
            tier = ModelTier(tier.lower())
        except ValueError:
            # Fallback: assume o modelo mais rápido/barato se o tier for inválido
            tier = ModelTier.FAST 

    # --------------------------------------------------
    # Resolução do Nome do Modelo
    # --------------------------------------------------
    # Consulta o MODEL_REGISTRY (definido em config.py) para descobrir qual modelo técnico
    # corresponde à combinação (Provedor, Nível).
    # Exemplo: (OPENAI, STRONG) -> "gpt-4o"
    model_name = MODEL_REGISTRY.get((provider, tier))
    
    if not model_name:
        # Erro crítico: Tentativa de usar uma combinação não mapeada no registro.
        # Interrompe a execução para evitar chamadas de API inválidas.
        raise ValueError(f"Model configuration not found for Provider: {provider} and Tier: {tier}.")

    # --------------------------------------------------
    # Instanciação Condicional (Factory Logic)
    # --------------------------------------------------
    # Seleciona a classe correta do LangChain e injeta as credenciais apropriadas.
    
    if provider == LLMProvider.OPENAI:
        return ChatOpenAI(
            model=model_name,
            temperature=temperature,
            api_key=settings.OPENAI_API_KEY,
            **kwargs
        )
    
    elif provider == LLMProvider.GEMINI:
        return ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temperature,
            google_api_key=settings.GOOGLE_API_KEY,
            convert_system_message_to_human=True, # Ajuste necessário para compatibilidade de papéis no Gemini
            **kwargs
        )
    
    elif provider == LLMProvider.GROQ:
        return ChatGroq(
            model=model_name,
            temperature=temperature,
            api_key=settings.GROQ_API_KEY,
            **kwargs
        )
    
    else:
        # Caso um novo Enum seja adicionado mas não tratado aqui
        raise ValueError(f"Provider {provider} not supported.")

# --------------------------------------------------
# Instâncias Padrão (Singletons)
# --------------------------------------------------
# Criamos aqui as instâncias globais usadas pela maioria dos nós do grafo.
# Isso evita recriar conexões a cada requisição e centraliza o perfil de uso.

# Lê o provider padrão definido no 
default_provider = settings.LLM_PROVIDER

# 1. Modelo Fast (Router/Classificação/Tasks Simples)
# Foco: Velocidade e eficiência. Temperatura 0 para garantir consistência lógica e decisões rápidas.
# Uso: RouterNode, Detector de Idioma, Summarize.
llm_fast = get_llm(provider=default_provider, tier=ModelTier.FAST, temperature=0.0)

# 2. Modelo Medium (RAG/Equilibrado)
# Foco: Capacidade de contexto e raciocínio moderado.
# Temperatura baixa (0.2) para evitar alucinações no RAG, mas permitir fluidez.
# Uso: GenerateRAGNode.
llm_medium = get_llm(provider=default_provider, tier=ModelTier.MEDIUM, temperature=0.1)
llm_medium_no_temp = get_llm(provider=default_provider, tier=ModelTier.MEDIUM, temperature=0.0)

# 3. Modelo Strong (Complexidade/Criatividade Controlada)
# Foco: Profundidade e melhor raciocínio.
# Pode ser usado para traduções mais nuançadas ou tarefas que exijam "inteligência" superior.
# Uso: TranslatorNode, GenerateCasual (embora casual seja simples, o strong pode dar melhores nuances se necessário, ou usamos fast com high temp).
llm_strong = get_llm(provider=default_provider, tier=ModelTier.STRONG, temperature=0.5)