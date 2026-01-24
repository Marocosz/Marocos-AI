import os
import shutil
from typing import List
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from app.core.config import settings

class RagService:
    def __init__(self):
        # Inicializa o modelo de Embeddings do Google (Gratuito e Leve)
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            google_api_key=settings.GOOGLE_API_KEY
        )
        self.persist_directory = settings.CHROMA_DB_DIR
        self.collection_name = settings.COLLECTION_NAME

    def get_vectorstore(self):
        """
        Retorna a instância do banco Chroma conectado.
        Não realiza processamento, apenas carrega o que já existe no disco.
        """
        return Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings,
            collection_name=self.collection_name
        )

    def ingest_data(self, data_path: str):
        """
        Lê arquivos Markdown, divide em chunks e salva no ChromaDB.
        ATENÇÃO: Apaga o banco anterior para garantir dados frescos.
        """
        print(f"📂 Iniciando ingestão de: {data_path}")
        
        # 1. Carregar Arquivos Markdown
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Diretório não encontrado: {data_path}")

        loader = DirectoryLoader(data_path, glob="**/*.md", loader_cls=TextLoader)
        docs = loader.load()
        
        if not docs:
            print("⚠️ Nenhum documento encontrado para ingestão.")
            return

        print(f"📄 {len(docs)} documentos carregados.")

        # 2. Dividir em Chunks (Text Splitter)
        # Otimizado para Markdown: tenta quebrar nos cabeçalhos (#) primeiro
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\\n# ", "\\n## ", "\\n### ", "\\n", " ", ""]
        )
        chunks = text_splitter.split_documents(docs)
        print(f"🧩 Documentos divididos em {len(chunks)} chunks vetoriais.")

        # 3. Limpar banco antigo (Reset)
        if os.path.exists(self.persist_directory):
            try:
                shutil.rmtree(self.persist_directory)
                print("🧹 Banco vetorial antigo limpo.")
            except Exception as e:
                print(f"⚠️ Erro ao limpar banco antigo: {e}")

        # 4. Criar e Salvar Vetores
        print("🚀 Gerando embeddings via Google API e salvando no ChromaDB...")
        try:
            Chroma.from_documents(
                documents=chunks,
                embedding=self.embeddings,
                persist_directory=self.persist_directory,
                collection_name=self.collection_name
            )
            print("✅ Ingestão concluída com sucesso! Banco salvo em ./chroma_db")
        except Exception as e:
            print(f"❌ Erro durante a criação dos vetores: {e}")

    def query(self, question: str, k: int = 4) -> List[Document]:
        """
        Realiza uma busca por similaridade.
        """
        vectorstore = self.get_vectorstore()
        results = vectorstore.similarity_search(question, k=k)
        return results
