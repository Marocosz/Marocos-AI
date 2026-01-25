import logging
import sys
import os
from logging.handlers import RotatingFileHandler

# Criar diretório de logs se não existir
LOG_DIR = "logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# Configuração do Logger
logger = logging.getLogger("noiseportfolio_backend")
logger.setLevel(logging.INFO)

# Formatter detalhado para o arquivo
file_formatter = logging.Formatter(
    '[%(asctime)s] [%(levelname)s] [%(filename)s:%(lineno)d] - %(message)s'
)

# Formatter mais limpo para o terminal
console_formatter = logging.Formatter(
    '[%(levelname)s] %(message)s'
)

# 1. Handler para Arquivo (Roda e salva tudo, com rotação)
file_handler = RotatingFileHandler(
    os.path.join(LOG_DIR, "app.log"), 
    maxBytes=10*1024*1024, # 10MB
    backupCount=5,
    encoding='utf-8'
)
file_handler.setFormatter(file_formatter)
file_handler.setLevel(logging.INFO)

# 2. Handler para Console (Terminal)
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(console_formatter)
console_handler.setLevel(logging.INFO)

# Evitar duplicar handlers se o módulo for recarregado
if not logger.handlers:
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
