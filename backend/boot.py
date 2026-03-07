"""
SCRIPT DE INICIALIZAÇÃO "AUTO-SUFICIENTE"
--------------------------------------------------
Este script substitui o comando padrão do Docker.
Ele verifica se o banco de dados vetorial existe. 
Se não existir (ou se for forçada a recriação), ele roda a ingestão automaticamente.
"""
import os
import subprocess
import sys
import shutil

# Garante que o diretório atual está no path para imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def main():
    db_path = settings.CHROMA_DB_DIR
    
    # 1. Verifica se foi solicitado re-ingestão forçada via variável de ambiente
    force_reingest = os.getenv("FORCE_REINGEST", "false").lower() == "true"
    
    if force_reingest and os.path.exists(db_path):
        print(f"⚠️  FORCE_REINGEST=true detectado. Limpando conteúdo de '{db_path}'...")
        
        # CORREÇÃO: Em vez de apagar a pasta (que é um Volume bloqueado),
        # apagamos apenas o conteúdo dentro dela.
        try:
            for filename in os.listdir(db_path):
                file_path = os.path.join(db_path, filename)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path) # Deleta arquivos
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path) # Deleta subpastas
                except Exception as e:
                    print(f"❌ Falha ao deletar {file_path}. Razão: {e}")
            
            print("🗑️  Conteúdo do banco antigo removido com sucesso.")
            
        except Exception as e:
            print(f"❌ Erro crítico ao limpar diretório: {e}")

    # 2. Lógica Padrão: Se a pasta não existe OU está vazia, roda ingestão.
    # Nota: os.listdir pode falhar se a pasta não existir, então checamos exists primeiro.
    should_ingest = False
    if not os.path.exists(db_path):
        should_ingest = True
    elif not os.listdir(db_path): # Pasta existe mas está vazia
        should_ingest = True

    if should_ingest:
        print(f"⚙️  Iniciando processo de ingestão (Criação de Memória)...")
        
        # Roda o script de ingestão como um subprocesso
        result = subprocess.run([sys.executable, "ingest.py"])
        
        if result.returncode == 0:
            print("✅  Ingestão concluída com sucesso!")
        else:
            print("❌  Falha na ingestão. O servidor iniciará com memória vazia.")
    else:
        print(f"✅  Banco vetorial já existe em '{db_path}'. Pulando ingestão.")

    print("🚀  Iniciando Servidor Uvicorn...")
    
    # Inicia o servidor Uvicorn
    # IMPORTANTE: 1 worker apenas. FastAPI é async e lida com concorrência internamente.
    # Múltiplos workers causam race conditions no ChromaDB (SQLite) e no file-based rate limiter.
    subprocess.run([
        sys.executable, "-m", "uvicorn",
        "main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--workers", "1",
    ])

if __name__ == "__main__":
    main()