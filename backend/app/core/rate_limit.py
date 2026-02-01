"""
LIMITADOR DE TAXA GLOBAL (Rate Limiter)
--------------------------------------------------
Objetivo:
    Controlar o custo e o uso indevido da API, limitando o número total de requisições
    que o backend aceita processar por dia.
    
    Como estamos usando APIs gratuitas ou com budget limitado (OpenAI, Groq), 
    este limitador protege o bolso do desenvolvedor.

Atuação no Sistema:
    - Backend / Core Security: Intercepta requisições antes que cheguem à IA.

Responsabilidades:
    1. Manter um contador de requisições em memória (não persistente após restart).
    2. Reiniciar o contador automaticamente quando o dia muda.
    3. Garantir acesso Thread-Safe (concorrência) ao contador.

Comunicação:
    - Usado por `app.api.routes` para validar se o usuário pode enviar mensagem.
"""

import json
import os
import time
from datetime import date
from datetime import date
# from filelock import FileLock # (Opcional) Removido para evitar dependência externa obrigatória

# Implementação manual de Lock se não quiser adicionar dependência externa
class SimpleFileLock:
    def __init__(self, lock_file, timeout=5.0):
        self.lock_file = lock_file
        self.timeout = timeout  # Tempo máximo de vida do lock (segundos)
        
    def __enter__(self):
        start_time = time.time()
        while True:
            try:
                # Tenta criar arquivo de lock (atomic operation no OS)
                fd = os.open(self.lock_file, os.O_CREAT | os.O_EXCL | os.O_RDWR)
                os.close(fd)
                return
            except FileExistsError:
                # Verifica se o arquivo de lock é velho (stale check)
                try:
                    if os.path.exists(self.lock_file):
                        # Se o lock tem mais de X segundos, assumimos que o processo morreu
                        if time.time() - os.path.getmtime(self.lock_file) > self.timeout:
                            os.remove(self.lock_file)
                            continue # Tenta adquirir novamente
                except OSError:
                    # Concorrência: alguém já removeu
                    pass

                # Verifica Timeout de espera (loop infinito prevention)
                if time.time() - start_time > self.timeout:
                    # Em caso de timeout extremo, limpamos o lock para recuperar o sistema
                    try:
                        os.remove(self.lock_file)
                    except OSError:
                        pass
                    # Na próxima iteração tentará pegar
                
                time.sleep(0.05)
                
    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            os.remove(self.lock_file)
        except OSError:
            pass

class FileBasedRateLimiter:
    """
    Controlador de cota diária persistente (File-Based).
    Permite que múltiplos workers (Gunicorn/Uvicorn) compartilhem o mesmo limite.
    """
    def __init__(self, daily_limit: int = 100, db_path="rate_limit.json"):
        self.daily_limit = daily_limit
        self.db_path = db_path
        self.lock_path = db_path + ".lock"
        
        # Garante arquivo inicial
        if not os.path.exists(self.db_path):
            self._save_state({"count": 0, "date": str(date.today())})

    def _load_state(self):
        try:
            with open(self.db_path, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {"count": 0, "date": str(date.today())}

    def _save_state(self, state):
        with open(self.db_path, "w") as f:
            json.dump(state, f)

    def get_status(self) -> dict:
        lock = SimpleFileLock(self.lock_path)
        with lock:
            state = self._load_state()
            
            # Reset se mudou o dia
            today = str(date.today())
            if state["date"] != today:
                state = {"count": 0, "date": today}
                self._save_state(state)
                
            return {
                "current": state["count"],
                "limit": self.daily_limit,
                "remaining": max(0, self.daily_limit - state["count"])
            }

    def check_request(self) -> bool:
        lock = SimpleFileLock(self.lock_path)
        with lock:
            state = self._load_state()
            today = str(date.today())
            
            # Reset diário
            if state["date"] != today:
                state = {"count": 0, "date": today}
            
            # Verifica Limite
            if state["count"] >= self.daily_limit:
                # Salva mesmo se falhar (para persistir a data atualizada se mudou)
                self._save_state(state) 
                return False
            
            # Consome cota
            state["count"] += 1
            self._save_state(state)
            return True

# Singleton: instância global
limit_db_path = os.path.join("logs", "rate_limit.json")
# Garante que pasta logs existe (logger já deve ter criado, mas por garantia)
if not os.path.exists("logs"):
    os.makedirs("logs")
    
limiter = FileBasedRateLimiter(daily_limit=100, db_path=limit_db_path)
