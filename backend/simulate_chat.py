import requests
import time
import json
import random

BASE_URL = "http://localhost:8000/api/chat"

# Reset colors for cleaner console
RESET = "\033[0m"
BOLD = "\033[1m"
GREEN = "\033[32m"
BLUE = "\033[34m"
RED = "\033[31m"
CYAN = "\033[36m"
YELLOW = "\033[33m"

def print_header(title):
    print(f"\n{BOLD}{CYAN}{'='*60}")
    print(f" {title.center(58)} ")
    print(f"{'='*60}{RESET}")

def send_message(message, history=[], language=None, expect_status=200):
    payload = {
        "message": message,
        "history": history,
        # Envia null/None se nao especificar, para testar a deteção auto do backend
        "language": language 
    }
    
    try:
        start = time.time()
        res = requests.post(BASE_URL, json=payload)
        elapsed = time.time() - start
        
        if res.status_code != expect_status:
            print(f"{RED}❌ Erro Inesperado: {res.status_code} - {res.text}{RESET}")
            return None
            
        data = res.json()
        print(f"{GREEN}✔ Respondido em {elapsed:.2f}s{RESET}")
        return data["response"]
        
    except Exception as e:
        print(f"{RED}❌ Falha de Conexão: {e}{RESET}")
        return None

def test_language_detection():
    print_header("TESTE: DETECÇÃO AUTOMÁTICA DE IDIOMA")
    
    tests = [
        ("Hello, who are you? (Inglês)", "Hello, who are you?", None), # Sem lang explícito
        ("Hola, que haces? (Espanhol)", "Hola, que haces?", None),
        ("Bonjour (Francês)", "Bonjour ca va?", None),
        ("Português Padrão", "Quem é você?", "pt-br") # Explícito
    ]
    
    for label, msg, lang_param in tests:
        print(f"\n🔹 {BOLD}{label}{RESET}")
        print(f"   Input: {msg}")
        resp = send_message(msg, language=lang_param)
        print(f"   {YELLOW}🤖 Bot:{RESET} {resp}")

def test_memory_summarization():
    print_header("TESTE: MEMÓRIA & SUMMARIZATION")
    print(f"{YELLOW}Objetivo: Enviar > 12 mensagens e ver se o bot lembra do início.{RESET}")
    
    history = []
    
    # 1. Injeta fatos na memória
    facts = [
        "Meu nome é Carlos.",
        "Eu tenho 30 anos.",
        "Gosto de carros esportivos.",
        "Moro em São Paulo.",
        "Tenho um cachorro chamado Rex.",
        "Trabalho com Python.",
        "Gosto de pizza de calabresa.",
        "Torço para o Corinthians.",
        "Minha cor favorita é azul.",
        "Tenho medo de altura.",
        "Já viajei para o Japão.",
        "Estou aprendendo Rust."
    ]
    
    print("\n📝 Injetando fatos na conversa...")
    for fact in facts:
        # Simula o fluxo real: adiciona user msg, pega resposta, adiciona bot msg
        history.append({"role": "user", "content": fact})
        print(f"   User: {fact}")
        
        # Envia apenas contexto recente para nao estourar request,
        # MAS na real o frontend enviaria tudo. Aqui simulamos o backend gerenciando.
        # O backend que deve gerenciar. Vamos mandar o historico FULL para ele processar.
        
        resp = send_message(fact, history=history) # Envia FULL history para forçar summary
        if resp:
            history.append({"role": "assistant", "content": resp})
            # print(f"   Bot: {resp[:50]}...")
            
    # 2. Pergunta sobre o início (Fato 1 e 5)
    print("\n🔎 Verificando retenção de memória (após compressão)...")
    
    questions = [
        "Qual é o meu nome?",
        "Qual o nome do meu cachorro?",
        "Qual minha cor favorita?"
    ]
    
    for q in questions:
        print(f"\n❓ {q}")
        history.append({"role": "user", "content": q})
        resp = send_message(q, history=history)
        print(f"   {YELLOW}🤖 Bot:{RESET} {resp}")
        if resp:
            history.append({"role": "assistant", "content": resp})

def test_contextualization():
    print_header("TESTE: CONTEXTUALIZAÇÃO (Follow-up)")
    
    history = []
    
    # Msg 1
    q1 = "O que é o projeto DataChat?"
    print(f"\nUser: {q1}")
    resp1 = send_message(q1, history=[])
    print(f"{YELLOW}Bot:{RESET} {resp1}")
    
    history.append({"role": "user", "content": q1})
    history.append({"role": "assistant", "content": resp1})
    
    # Msg 2 (Dependente)
    q2 = "Quais tecnologias ele usa?" # 'ele' = DataChat
    print(f"\nUser: {q2}")
    resp2 = send_message(q2, history=history)
    print(f"{YELLOW}Bot:{RESET} {resp2}")

def run_full_suite():
    print(f"{GREEN}{BOLD}🚀 INICIANDO SUÍTE COMPLETA DE TESTES - BACKEND AGENT{RESET}")
    
    test_language_detection()
    time.sleep(2)
    test_contextualization()
    time.sleep(2)
    test_memory_summarization()
    
    print_header("FIM DA SIMULAÇÃO")

if __name__ == "__main__":
    run_full_suite()
