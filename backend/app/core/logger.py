"""
SISTEMA DE LOGS CENTRALIZADO
--------------------------------------------------
Objetivo:
    Padronizar a saída de logs da aplicação, garantindo que informações críticas
    sejam salvas em arquivo (para auditoria) e exibidas no terminal (para debug).

Atuação no Sistema:
    - Backend / Infraestrutura: Utilizado por todos os módulos para reportar atividades.

Responsabilidades:
    1. Criar e manter o diretório local de logs.
    2. Configurar rotação de arquivos (evita files gigantes que lotam o disco).
    3. Configurar formatação legível para console vs. detalhada para arquivo.
    4. Garantir thread-safety básico na escrita.

Comunicação:
    - Importado por `nodes.py`, `routes.py`, etc. através de `logger.info()`.
"""

import logging
import sys
import os
from logging.handlers import RotatingFileHandler

# Define onde os logs serão salvos fisicamente
LOG_DIR = "logs"

# Garante que a pasta exista antes de tentar escrever
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# Inicializa o objeto Logger Singleton
logger = logging.getLogger("marocos_backend")
logger.setLevel(logging.INFO)

# --------------------------------------------------
# Definindo Formatos de Saída
# --------------------------------------------------

# Formato Arquivo: Mais técnico e rastreável (Data + Hora + Arquivo + Linha)
file_formatter = logging.Formatter(
    '[%(asctime)s] [%(levelname)s] [%(filename)s:%(lineno)d] - %(message)s'
)

# Formato Console: Mais limpo para devs acompanharem a execução
console_formatter = logging.Formatter(
    '[%(levelname)s] %(message)s'
)

# --------------------------------------------------
# Configurando Handlers (Destinos do Log)
# --------------------------------------------------

# 1. Handler de Arquivo (Persistência)
# Usa RotatingFileHandler para criar 'app.log', 'app.log.1', etc.
# Limite: 10MB por arquivo, mantém os últimos 5 backups.
file_handler = RotatingFileHandler(
    os.path.join(LOG_DIR, "app.log"), 
    maxBytes=10*1024*1024, # 10MB
    backupCount=5,
    encoding='utf-8'
)
file_handler.setFormatter(file_formatter)
file_handler.setLevel(logging.INFO)

# 2. Handler de Console (Terminal/Docker Logs)
# Joga a saída para stdout, capturável por ferramentas de cloud.
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(console_formatter)
console_handler.setLevel(logging.INFO)

# --------------------------------------------------
# Ajustes Finais
# --------------------------------------------------

# Impede que o log "suba" para o logger raiz (root), evitando duplicação
# já que frameworks como FastAPI/Uvicorn têm seus próprios loggers.
logger.propagate = False

# Verifica se já existem handlers para não adicionar duplicados (caso de reload)
if not logger.handlers:
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
