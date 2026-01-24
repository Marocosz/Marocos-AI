# Planejamento Completo: Marcos Persona API

Este documento consolida todo o planejamento, arquitetura e código inicial para o projeto **Marocos Persona API**. O objetivo é criar um agente de IA integrado ao seu portfólio que responde perguntas sobre sua carreira utilizando dados reais (RAG), otimizado para rodar em uma VPS com poucos recursos.

---

## 1. Arquitetura "Serverless RAG"

Para garantir que a aplicação rode leve na sua VPS (sem estourar RAM/CPU), utilizaremos serviços de API para o processamento pesado:

- **Cérebro (LLM):** `Groq` (Modelo: `llama-3.1-8b-instant`).
  - _Custo:_ Gratuito.
  - _Função:_ Geração de respostas rápidas.
- **Memória (Vector Store):** `ChromaDB` (Modo Persistente Local).
  - _Custo:_ Gratuito (Uso de disco local, pouca RAM).
  - _Função:_ Armazenar o conhecimento do portfólio.
- **Vetores (Embeddings):** `Google Generative AI` (`models/embedding-001`).
  - _Custo:_ Gratuito.
  - _Função:_ Converter texto em vetores sem usar CPU local.
- **Orquestração:** `LangGraph` + `LangChain`.
  - _Função:_ Controle de fluxo e estado do agente.
- **API:** `FastAPI`.
  - _Função:_ Interface backend.

---

## 2. Estrutura de Diretórios

Seguindo princípios de Clean Architecture e Modularidade:

```text
marocos_persona/
├── app/
│   ├── api/
│   │   └── routes.py          # (Futuro) Endpoints da API
│   ├── core/
│   │   ├── config.py          # Gerenciamento de Variáveis de Ambiente
│   │   └── llm.py             # (Futuro) Fábrica de LLM
│   ├── graph/                 # (Futuro) Lógica do Agente LangGraph
│   │   ├── nodes.py
│   │   ├── state.py
│   │   └── workflow.py
│   └── services/
│       └── rag_service.py     # Lógica de Ingestão e Busca no ChromaDB
├── data/
│   └── knowledge_base/        # Arquivos de conhecimento
│       └── profile.md
├── .env                       # Chaves de API (Local - não subir pro git)
├── .gitignore                 # Arquivos para ignorar no git
├── main.py                    # (Futuro) Entrypoint do FastAPI
├── ingest.py                  # Script para rodar a ingestão manualmente
└── requirements.txt           # Dependências do projeto
```

---

## 3. Arquivos de Configuração

### `requirements.txt`

Dependências essenciais para o projeto.

```text
fastapi
uvicorn
python-dotenv
pydantic-settings
langchain
langchain-community
langchain-core
langchain-groq
langchain-google-genai
langgraph
chromadb
tiktoken
```

### `.env` (Template)

Crie este arquivo na raiz e adicione suas chaves.

```text
GROQ_API_KEY=gsk_...
GOOGLE_API_KEY=AIza...
# Na VPS, essas variáveis serão configuradas no painel do Coolify
```

### `.gitignore`

Importante para não subir lixo ou segredos para o repositório.

```text
__pycache__/
*.pyc
.env
.venv/
venv/
chroma_db/
```

---

## 4. Base de Conhecimento

### `data/knowledge_base/profile.md`

Este arquivo contém os dados que o agente usará para responder. Baseado no seu currículo e histórico.

```markdown
# Sobre Marcos Rodrigues

Eu sou Marcos Rodrigues, um Desenvolvedor Fullstack e Engenheiro de IA em formação.
Moro em Uberlândia, MG.
Atualmente sou estagiário de TI na Supporte Logística (desde Agosto de 2025), focado em inovação e automação.
Também atuo como Freelancer Fullstack na Intecmídia Soluções.
Sou apaixonado por tecnologia, especialmente como a IA pode transformar processos complexos em soluções simples.

# Formação Acadêmica

- **Graduação:** Gestão da Informação na UFU (Universidade Federal de Uberlândia). Previsão de conclusão: 03/2026.
- **Técnico:** Eletrônica pelo IFTM (Concluído em 2021). Onde aprendi a base de hardware e lógica com C++ e Arduino.

# Habilidades Técnicas (Hard Skills)

- **Linguagens de Programação:** Python (Nível Expert - minha linguagem principal), JavaScript (Avançado).
- **Frameworks Backend:** FastAPI (Expert), Flask, LangChain (Avançado), Discord.py.
- **Data Science & IA:** Pandas, Scipy, Scikit-learn, RAG (Retrieval-Augmented Generation), Engenharia de Prompt, Integração com LLMs (Gemini, OpenAI, Llama/Groq).
- **Banco de Dados:** SQL (PostgreSQL, MySQL), NoSQL (MongoDB), ChromaDB (Vetorial).
- **Infraestrutura & DevOps:** Docker (Expert), Linux (Avançado - uso Zorin OS), Git/GitHub, Coolify (para deploy em VPS).
- **Frontend:** React, Nuxt, Streamlit (para demos rápidas), HTML/CSS/Tailwind.

# Projetos de Destaque

1. **DataChat BI:**
   - Descrição: Uma solução de Business Intelligence conversacional para logística. O sistema permite que gestores façam perguntas em linguagem natural e o sistema converte em SQL para consultar o banco de dados.
   - Tecnologias: Python, FastAPI, LangChain, React, SQL.
2. **Bússola Hub (V2):**
   - Descrição: Um "Sistema Operacional Pessoal" web. Une gestão financeira, cofre de senhas criptografado e controle de saúde.
   - Tecnologias: Flask, SQLAlchemy, Docker.

3. **Analisador de Contratos com IA:**
   - Descrição: API RESTful para upload de contratos (PDF/DOCX) que utiliza o Google Gemini para extrair cláusulas importantes e riscos automaticamente.
   - Tecnologias: FastAPI, Docker, Google Gemini API.

4. **Marocos Bot 2.0:**
   - Descrição: Sistema de automação para Discord focado em League of Legends. Gerencia lobbies, valida elo via Riot API e balanceia times matematicamente.
   - Tecnologias: Python, Discord.py, Riot API, Algoritmos de Matchmaking.

# Contato e Links

- **LinkedIn:** [https://www.linkedin.com/in/marcosrodriguesptc/](https://www.linkedin.com/in/marcosrodriguesptc/)
- **GitHub:** [https://github.com/marocosz](https://github.com/marocosz)
- **Email:** marcosrodriguesepro@gmail.com
- **Portfólio:** [https://marocos.dev](https://marocos.dev)
```
