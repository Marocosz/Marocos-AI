import requests
import time
import json

BASE_URL = "http://localhost:8000/api/chat"

# Cenários de Teste (Perguntas Reais de Recrutadores/Devs)
scenarios = [
    # 1. Introdução Básica
    "Quem é você e o que você faz?",
    
    # 2. Stack Tecnológica
    "Quais são suas principais habilidades técnicas?",
    
    # 3. Pergunta Específica (RAG)
    "Você tem experiência com desenvolvimento de Agentes de IA?",
    
    # 4. Sobre Projetos
    "Me conte um pouco sobre esse portfólio, como ele foi feito?",
    
    # 5. Pessoal / Culture Fit
    "Quais são seus hobbies? O que você joga?",
    
    # 6. Contato
    "Gostei do seu perfil, como posso entrar em contato?",
    
    # 7. Teste de 'Papo Furado' (Casual)
    "Eai cara, tudo tranquilo?",
    
    # 8. Teste de Limite (Opcional - vai contar pro rate limit)
    # "Isso é um teste de spam.",
]

def run_simulation():
    print("--- 🚀 Iniciando Simulação de Chat ---")
    print(f"Alvo: {BASE_URL}\n")
    
    history = []

    for i, question in enumerate(scenarios, 1):
        print(f"[{i}/{len(scenarios)}] 👤 Usuário: {question}")
        
        payload = {
            "message": question,
            "history": history[-2:] # Manda as ultimas 2 interações para contexto
        }

        try:
            start_time = time.time()
            response = requests.post(BASE_URL, json=payload)
            elapsed = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                answer = data["response"]
                usage = data.get("usage", {})
                
                print(f"🤖 Agent ({elapsed:.2f}s): {answer}")
                print(f"📊 Limite: {usage.get('current')}/{usage.get('limit')}")
                
                # Adiciona ao histórico para a próxima (simulando conversa continuada ou nova, aqui farei historico acumulado)
                history.append({"role": "user", "content": question})
                history.append({"role": "assistant", "content": answer})
                
            elif response.status_code == 429:
                print("⛔ Rate Limit Atingido!")
                break
            else:
                print(f"⚠️ Erro {response.status_code}: {response.text}")

        except Exception as e:
            print(f"❌ Erro na requisição: {e}")

        print("-" * 50)
        time.sleep(1) # Intervalo para não floodar instantaneamente

    print("\n✅ Simulação Concluída. Verifique os logs em 'backend/logs/app.log' para detalhes internos.")

if __name__ == "__main__":
    run_simulation()
