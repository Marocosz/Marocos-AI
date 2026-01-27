"""
MÓDULO DE OBSERVABILIDADE (LOGS VISUAIS)
--------------------------------------------------
Objetivo:
    Fornecer utilitários para logs estruturados em blocos visuais.
    Melhora a legibilidade do fluxo de interação no terminal e arquivos.
    
Funcionamento:
    Usa o logger padrão mas aplica formatação ASCII box-style para 
    delimitar claramente o início/fim de interações e seções.
"""

import uuid
from datetime import datetime
from app.core.logger import logger

class AgentObserver:
    """
    Gerenciador estático de logs visuais.
    Não mantém estado, apenas formata.
    """
    
    SEPARATOR_BOLD = "=" * 80
    SEPARATOR_THIN = "-" * 80
    
    @staticmethod
    def _box(text: str, char="=") -> str:
        """Envolve texto em linhas"""
        return f"\n{char*80}\n{text}\n{char*80}"

    @staticmethod
    def log_start_interaction(input_text: str) -> str:
        """
        Registra o início de uma nova interação do usuário.
        Retorna o ID da interação para ser passado no estado (se desejado).
        """
        interaction_id = str(uuid.uuid4())[:8] # Short ID
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        header = f"🚀 INTERACTION START | ID: {interaction_id} | TIME: {timestamp}"
        
        logger.info(AgentObserver.SEPARATOR_BOLD)
        logger.info(f"{header:^80}")
        logger.info(AgentObserver.SEPARATOR_BOLD)
        
        logger.info(f"\n>>> 👤 USER INPUT:\n{input_text.strip()}\n")
        return interaction_id

    @staticmethod
    def log_section(node_name: str, data: dict = None, content: str = None):
        """
        Registra uma seção de processamento (um Nó do grafo).
        
        Args:
            node_name: Nome do nó (ex: ROUTER, RAG).
            data: Dict de chave/valor para metadata (mostrado como tabela).
            content: Texto livre (strings longas, contextos, respostas).
        """
        title = f"⚙️ NODE: {node_name.upper()}"
        logger.info(AgentObserver.SEPARATOR_THIN)
        logger.info(f"{title}")
        logger.info(AgentObserver.SEPARATOR_THIN)
        
        if data:
            for k, v in data.items():
                # Formatação chave-valor alinhada
                key_str = f"{k}:"
                logger.info(f"{key_str:<20} {v}")
                
        if content:
            if data: logger.info("") # Espaço se tiver metadata antes
            logger.info(f"📄 CONTENT:\n{content.strip()}")

    @staticmethod
    def log_end_interaction(final_source: str, response_text: str):
        """
        Registra o fim da interação e a resposta entregue.
        """
        logger.info(AgentObserver.SEPARATOR_THIN)
        logger.info(f"🏁 INTERACTION END | SOURCE: {final_source.upper()}")
        logger.info(AgentObserver.SEPARATOR_BOLD)
        logger.info(f"\n>>> 🤖 FINAL RESPONSE:\n{response_text.strip()}\n")
        logger.info(AgentObserver.SEPARATOR_BOLD + "\n\n")

# Instância global facilitadora (opcional, já que são métodos estáticos)
observer = AgentObserver()
