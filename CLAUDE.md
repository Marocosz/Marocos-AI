# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Monorepo do portfólio marocos.dev: `backend/` (FastAPI + agente LangGraph com RAG) e `frontend/`
(SPA React/Vite). Código, comentários e prompts estão em PT-BR — mantenha.

## Convenção de commit

**Nunca adicione o trailer `Co-Authored-By:` nas mensagens de commit deste repositório**, nem
qualquer outra assinatura de ferramenta. O dono do repositório pediu isso explicitamente e vale
para todos os commits, sem exceção — inclusive quando a instrução padrão do agente disser o
contrário. Mensagens em PT-BR, com prefixo `feat:` / `fix:` / `perf:` / `refactor:` / `docs:` /
`chore:`.

## Comandos

Backend (cwd `backend/`, venv local `venvmarocos`):

```powershell
.\venvmarocos\Scripts\Activate.ps1
python main.py            # dev server com reload em :8000
python boot.py            # entrypoint do Docker: ingestão condicional + uvicorn --workers 1
python ingest.py          # recria o banco vetorial do zero (lento, ver RAG abaixo)
python simulate_chat.py   # bateria E2E via HTTP/SSE — exige o servidor no ar em outro terminal
python test_embedding.py  # sonda qual modelo de embedding do Google está disponível
```

Não existe pytest nem suíte automatizada; `simulate_chat.py` é o teste de integração do projeto.
`requirements.txt` está em UTF-16 (pip freeze do PowerShell) — `cat`/`grep` POSIX falham nele, use
`Get-Content`.

Frontend (cwd `frontend/`): `npm run dev` | `build` | `lint` (eslint flat config) | `preview` |
`test` (vitest, `environment: 'node'` — **só lógica pura**, sem DOM).
Não há prettier nem TypeScript.

Verificação de interface (cwd `frontend/visual/`, pacote isolado com Playwright):

```powershell
npm install            # 1a vez: baixa o Chromium, so aqui
npm run build:frontend
npm test               # 21 cenas visuais + 13 testes funcionais de rota
npm run report         # relatorio com as diferencas lado a lado
```

**Rode isso antes de afirmar que uma mudança não alterou a interface.** O regressor visual é cego
a tempo (desliga a animação para capturar), e o `npm run build` não pega `import()` dinâmico
quebrado — quem pega é o `rotas.spec.js`.

## Arquitetura

### Ciclo de uma requisição de chat

`POST /api/chat` (`app/api/routes.py`) → rate limit global → converte `history` (dicts do front) em
`HumanMessage`/`AIMessage` → `agent_app.astream(stream_mode="updates")`. Cada nó concluído dispara um
evento SSE `status` (texto amigável PT/EN); no fim vai um evento `result` com `{response, usage}`.

O frontend parseia o SSE à mão em `apps/AssistantApp.jsx` (`fetch` + `ReadableStream`, buffer partido em
`\n\n`) porque `EventSource` não faz POST. `routes.py` manda 4KB de padding e `X-Accel-Buffering: no`
para o Traefik/Nginx não segurar o primeiro flush.

### O grafo (`backend/app/graph/workflow.py`)

```
detect_language → summarize_conversation → semantic_gateway_node
   ├─ casual    → generate_casual ──────────────┐
   └─ technical → retrieve → answerability_guard├─→ should_translate → translator_node | END
                    ├─ ok   → generate_rag ─────┤
                    └─ nope → fallback_responder┘
```

As 3 funções de decisão ficam no topo de `workflow.py` e são deliberadamente **fail open** para o
caminho mais seguro (`technical`, `generate_rag`): erro de parsing nunca deve descartar uma pergunta
real.

`semantic_gateway_node` (`nodes/gateway.py`) é a fusão de contextualize + router feita para cortar
latência: camada regex determinística resolve saudações/agradecimentos em mensagens de ≤10 palavras
sem gastar LLM; senão uma única chamada devolve JSON `{rephrased_query, classification, confidence,
reason}`, e `confidence < 0.4` força `technical`.

Nós vivem em `app/graph/nodes/*.py` e são reexportados por `nodes/__init__.py` — ao criar um nó,
adicione ao `__all__` de lá **e** ao mapa de status em `routes.py`.

### Fábrica de LLM

`core/config.py` tem `MODEL_REGISTRY: (LLMProvider, ModelTier) → nome do modelo`. Para trocar de
modelo, edite só esse dict. `core/llm.py` instancia 4 singletons **no import** a partir de
`settings.LLM_PROVIDER` — os nós importam esses singletons, nunca chamam `get_llm()` direto. Logo o
provider é global e trocá-lo exige restart.

| singleton | temp | usado por |
|---|---|---|
| `llm_fast` | 0.0 | language, memory, gateway, casual |
| `llm_medium_no_temp` | 0.0 | `answerability_guard` |
| `llm_medium` | 0.1 | `generate_rag`, `fallback_responder` |
| `llm_strong` | 0.5 | disponível, sem uso atual |

`config.py` valida no boot que a API key do provider escolhido existe (`field_validator`), então
config errada quebra a inicialização em vez da primeira requisição.

### RAG

Embeddings são **sempre** Google, independente do `LLM_PROVIDER` — `GOOGLE_API_KEY` é obrigatória
mesmo rodando em groq/openai.

Fonte da verdade: `backend/data/knowledge_base/*.md` (só essa pasta é ingerida;
`data/resumo_marcos.md` fica de fora). Atualizar conteúdo é GitOps: editar o `.md`, commitar, e
subir com `FORCE_REINGEST=true`.

`RagService.ingest_data` faz full refresh (`rmtree` do `chroma_db`) e envia **1 chunk por request com
sleep(4)** para respeitar o RPM do Google — reingerir `profile.md` (42KB) leva vários minutos. Chunks
de 1000 com overlap 200, separadores priorizando headings markdown. `retrieve` busca top-k=4 usando
`rephrased_query` e prefixa cada trecho com `--- FONTE: arquivo.md ---`.

### Prompts são o código mais sensível do backend

Os system prompts inline nos nós (o de `generate_rag` tem ~130 linhas) carregam as regras de negócio:
persona em 1ª pessoa do Marcos, zero-alucinação (responder só a partir do contexto recuperado),
anti-repetição comparando com o histórico formatado, gancho de continuidade e anti-jailbreak. Ao
editar, cuidado com chaves: `ChatPromptTemplate` interpreta `{}` como variável — `gateway.py` usa
`{{{{ }}}}` para emitir JSON literal.

### Estado

`AgentState` (`graph/state.py`) é `TypedDict`; `messages` usa `Annotated[..., add_messages]`, ou seja
o retorno é **appendado**, não substituído. Cada nó devolve um dict parcial só com as chaves que
mudou (`{}` = no-op, como `summarize_conversation` com histórico curto — ele só age acima de 10
mensagens, preservando as 4 últimas vivas).

### Rate limit e concorrência

`core/rate_limit.py` mantém cota **global do projeto** (100 req/dia, não por IP) em
`logs/rate_limit.json`, com lock por arquivo (`SimpleFileLock`, stale check de 5s). `boot.py` fixa
`--workers 1` de propósito: ChromaDB (SQLite) + esse lock de arquivo dão race condition com múltiplos
workers. Não aumente os workers.

### Observabilidade

`core/logger.py` → `RotatingFileHandler` em `logs/app.log`. `core/observability.py` (`AgentObserver`)
desenha blocos ASCII por nó; os nós chamam `observer.log_section()` e o par
`log_start_interaction()` / `log_end_interaction()`. Quem fecha a interação é `generate_rag` quando o
idioma é pt-br, senão o `translator_node`.

### Frontend — o Marocos OS

**Ao trabalhar no `frontend/`, invoque a skill `marocos-os-frontend`** (em
`.claude/skills/`). Ela traz as ferramentas de verificação e as convenções; o resto o próprio
código documenta.

Sem router e sem scroll de página: `App` → providers → `os/shell/Shell`, que escolhe um de dois
shells lendo o **mesmo** estado de janelas. `Desktop` lê `windows[]` como conjunto (z-order);
`MobileShell` lê como pilha. É a premissa que evita manter dois frontends.

- **`os/registry.js` é a fonte única de cada app**: id, rota, título, ícone, tamanho e onde ele
  aparece. Só o campo `component` é `lazy()` — rota, título e ícone são resolvidos sincronamente
  porque `deriveInitial()` lê a URL antes do primeiro render.
- **`config/system.js` é a fonte única dos valores de ajuste** — parâmetros dos shaders, onde a
  janela nasce, durações de transição, tempos do boot, blur do vidro. `config/cssBridge.js` os
  injeta como `--cfg-*`, então ele manda no CSS também. Exceção documentada no cabeçalho dele: os
  gradientes desenhados da cerimônia ficam em `os/tokens.css`, porque são arte e não configuração.
- **i18n sem lib**: `content/*.js` (dados do portfólio) e `i18n/*.js` (strings de interface)
  exportam `...En`/`...Pt` e um `getXData(lang)`. Texto novo entra nos dois idiomas.
- **Estado**: tema e movimento em `ThemeContext`, idioma em `LanguageContext`, janelas em
  `WindowManagerContext` — este dividido em dois provedores (estado × ações) para que arrastar uma
  janela não re-renderize os apps abertos. Os três persistem em localStorage (`isDarkMode`,
  `isAnimationEnabled`, `language`).
- **Wallpaper WebGL** (`Silk` no escuro, `Iridescence` no claro, ambos via `ogl`) só em desktop;
  abaixo de 1024px é gradiente CSS. Recebem `isAnimated` para zerar o custo quando invisíveis.
  **Nada em `src/` pode importar `three` estaticamente** — ele só entra pelo `lazy()` do cristal,
  e um import estático em qualquer lugar o traz de volta ao caminho crítico.

## Deploy

`backend/docker-compose.yml`: um serviço `api` na rede `coolify` (`external: true`), labels Traefik
para `api.marocos.dev` → porta 8000, volume nomeado `chroma_data` em `/app/chroma_db`. Dockerfile
roda `CMD ["python", "boot.py"]`.

Como o compose usa `external: true` na rede `coolify`, o checklist
`~/.claude/COOLIFY-DEPLOY-CHECKLIST.md` se aplica a qualquer mudança em compose, Dockerfile,
healthcheck, nome de serviço ou domínio — note que o serviço se chama `api`, nome genérico numa rede
compartilhada (item de colisão de DNS do checklist).

O frontend não tem Dockerfile aqui: é build Vite servido em separado. **A URL da API é resolvida em
tempo de build**, sem variável `VITE_`: `REDE.apiBase` em `frontend/src/config/system.js` alterna
entre `localhost:8000` e `api.marocos.dev` por `import.meta.env.DEV`. E o CORS é uma lista fixa em
`config.py:CORS_ORIGINS`; domínio novo de frontend precisa entrar lá.

## Gotchas

- O mapa de status SSE em `routes.py` ainda referencia nós que não existem mais
  (`contextualize_input`, `router_node`) e **não tem entrada para `semantic_gateway_node`** — daí a
  ausência de feedback nesse passo.
- Timeout do cliente é 60s (`REDE.timeoutChatMs`, aplicado por `AbortController` no
  `apps/AssistantApp.jsx`); um pipeline completo (gateway + guard + rag + translator) pode encostar
  nesse teto.
- `chroma_db/`, `logs/` e o `venvmarocos/` são locais e ficam fora do build (`.dockerignore`).
- `testes.txt` na raiz é dump de log de uma conversa, não um teste.
- O IP do cliente vem do primeiro valor de `X-Forwarded-For` (Traefik), com fallback para
  `request.client.host`; é usado apenas em log, não no rate limit.
