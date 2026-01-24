import os
import sys
# Adiciona o diretório atual ao path para encontrar o módulo 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.rag_service import RagService

def main():
    # Define o caminho absoluto para a pasta de dados
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_folder = os.path.join(base_dir, "data", "knowledge_base")
    
    print("--- INICIANDO PROCESSO DE INGESTÃO (RAG) ---")
    
    try:
        rag = RagService()
        rag.ingest_data(data_folder)
        
        # Teste de verificação pós-ingestão
        print("\\n🔎 Teste de Sanidade (Busca Rápida): 'Quais as skills do Marcos?'")
        results = rag.query("Quais as skills do Marcos?", k=2)
        
        if results:
            for i, doc in enumerate(results):
                print(f"\\nResult {i+1}:")
                print(f"{doc.page_content[:150]}...")
        else:
            print("⚠️ O banco parece vazio após a ingestão.")
            
    except Exception as e:
        print(f"\\n❌ Erro Fatal: {e}")
        print("Dica: Verifique se suas chaves de API estão no arquivo .env")

if __name__ == "__main__":
    main()
