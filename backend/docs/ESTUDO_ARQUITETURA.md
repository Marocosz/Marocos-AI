# Estudo Profundo: Arquitetura Backend do Agente Conversacional

Este documento serve como um guia técnico avançado sobre o backend do agente "Marcos Portfolio". Ele disseca as decisões de arquitetura, técnicas de prompt engineering e estratégias de segurança implementadas para criar um sistema robusto, contextual e fiel à persona.

---

## 🏗️ Introdução & Filosofia

O sistema não é apenas um chatbot que responde perguntas. Ele é uma **Pipeline Cognitiva** (Cognitive Pipeline) baseada em Grafos (LangGraph), onde cada etapa da conversa é processada por um "Nó" especialista.

**Principais Problemas Resolvidos:**

- **Perda de Contexto:** Como saber que "e ele?" se refere ao projeto citado há 3 mensagens?
- **Alucinação:** Como impedir que o bot invente projetos que nunca fiz?
- **Quebra de Persona:** Como garantir que ele fale como um "Dev Jr/Pleno gente boa" e não como um robô corporativo?
- **Segurança:** Como evitar que o usuário force o bot a falar bobagens (Jailbreak)?

---

## 📂 Análise Modulada (Deep Dive)

### 1. Nó de Contextualização (`contextualize_input`)

> **Arquivo:** `nodes/memory.py`

#### 🎯 Responsabilidade

Transformar interações dependentes de contexto (ex: "E quem criou?") em perguntas autônomas e autocontidas (ex: "Quem criou o projeto DataChat?").

#### 🛠️ Técnica: Coreference Resolution (Resolução de Correferência)

LLMs não têm "memória" nativa entre requisições. Se buscarmos no banco vetorial apenas "E ele?", teremos resultados lixo. Precisamos "descompactar" a intenção.

**Prompt Engineering (Destaques):**

- **Trigger de Segurança:** `confidence = "high"`. O prompt é instruído a **NÃO** reescrever se houver ambiguidade.
  - _Risco evitado:_ Se o usuário diz "Isso é legal", e a reescrita inventa "O projeto X é legal" erroneamente, estragamos a conversa. Melhor falhar mantendo o original do que alucinar um sujeito errado.
- **Saída Estruturada (JSON):** Forçamos o modelo a devolver `{ "rephrased_query": "...", "confidence": "high" }`. Isso permite que o código Python decida programaticamente se aceita ou descarta a reescrita.

#### ⚠️ Se não existisse...

Perguntas sequenciais como "Quais tecnologias ele usa?" falhariam 100% das vezes no RAG (Retrieval Augmented Generation), pois o banco vetorial encontraria textos aleatórios com a palavra "ele" ou "tecnologias", sem saber do que se trata.

---

### 2. Nó de Memória & Resumo (`summarize_conversation`)

> **Arquivo:** `nodes/memory.py`

#### 🎯 Responsabilidade

Impedir o estouro da janela de contexto (Token Limit) e manter a coerência de longo prazo sem repassar 50 mensagens inteiras a cada chamada.

#### 🛠️ Técnica: Rolling Summary (Resumo Rolante) com Semantic Separation

Não apenas "resumimos". O prompt separa os dados em blocos lógicos:

- `[PERFIL_DO_USUARIO]`: Fatos aprendidos sobre quem está perguntando (Nome, Cargo).
- `[CONTEXTO_TECNICO_ATUAL]`: O tópico da discussão vigente.
- `[PREFERENCIAS]`: Configurações de tom ou formato.

**Decisão Crítica de Prompt:**

- _"Se Novos Eventos contradiz Memória Atual, A NOVIDADE VENCE."_
- Isso evita o problema de **Memória Teimosa**, onde o bot insiste num erro antigo porque ele está gravado no resumo. A instrução explícita de sobreescrita sanea a base de conhecimento dinâmica.

---

### 3. Nó de Roteamento (`router_node`)

> **Arquivo:** `nodes/router.py`

#### 🎯 Responsabilidade

O "Cérebro" decisório. Escolhe se a mensagem vai para o fluxo **SOCIAL** (Casual) ou **TÉCNICO** (RAG).

#### 🛠️ Técnica: Híbrida (Determinística + Semântica)

1.  **Camada 1 (Regex/Determinística):**
    - Se o input for `"Oi"`, `"Valeu"`, `"Kkk"`, não gastamos tokens/dinheiro com LLM. Um Regex resolve em milissegundos.
    - _Ganho:_ Latência zero para interações triviais e economia de custo.
2.  **Camada 2 (Classificação Semântica via LLM):**
    - Analisa nuances. _"Você gosta de jogos?"_ parece casual, mas para este portfólio é **TÉCNICO**, pois a resposta está no `profile.md`.
    - **Prompt:** Instruímos explicitamente: _"Se for pergunta sobre gostos pessoais, CLASS IF TECHNICAL"_. Isso corrige o viés padrão dos LLMs que acham que "hobby" é sempre "papo furado".

#### ⚠️ Se não existisse...

O bot gastaria recursos buscando no banco de dados para responder um "Oi" (Lento e Caro), ou responderia perguntas técnicas com "chatice genérica" por achar que é papo casual.

---

### 4. Nó de RAG & Recuperação (`retrieve` + `rag.py`)

> **Arquivo:** `nodes/rag.py`

#### 🎯 Responsabilidade

A busca da verdade. Encontrar os trechos de documentos (`.md`) que respondem à pergunta.

#### 🛠️ Técnica: Source Tracking & Metadata Injection

Ao recuperar os chunks, não jogamos apenas texto cru. Formatamos assim:

```text
--- FONTE: profile.md ---
(Conteúdo...)
```

Isso permite que o LLM (na etapa de geração) saiba a origem da informação. Se o usuário perguntar "Onde você diz isso?", o bot tem a referência.

---

### 5. Nó de Answerability Guard (`answerability_guard`)

> **Arquivo:** `nodes/guard.py`

#### 🎯 Responsabilidade

O "Advogado do Diabo". Antes de responder, este nó julga se **REALMENTE** temos a informação necessária.

#### 🛠️ Técnica: Self-Reflection & Binary Classification

É um passo de verificação que roda um LLM com temperatura 0 (Determinístico).
Ele NÃO gera texto para o usuário. Ele gera metadados internos:

- `is_answerable`: `True` / `False`
- `reason`: `missing_specific_fact`, `ambiguous`, `content_exhausted`

**O Grande Diferencial:**
Se o usuário pergunta _"Qual a placa do seu carro?"_ e o RAG retorna chunks sobre "Projetos em React", um LLM comum tentaria inventar uma placa ou dizer algo vago.
O Guard analisa: _"A pergunta pede PLACA. O contexto tem REACT. Match? Não."_ -> Bloqueia a resposta.

#### ⚠️ Se não existisse...

Teríamos **Alucinações**. O bot tentaria responder a qualquer custo, inventando fatos sobre a vida pessoal do Marcos que não existem nos documentos, quebrando a confiança.

---

### 6. Nó de Geração Final (`generate_rag`)

> **Arquivo:** `nodes/rag.py`

#### 🎯 Responsabilidade

Sintetizar a resposta final para o usuário, aplicando a **Persona**.

#### 🛠️ Técnica: Persona Injection & Negative Constraints

O prompt deste nó é o mais complexo do sistema. Ele não apenas diz "responda". Ele impõe restrições negativas:

- _"NUNCA mande o usuário ler o site."_ (Postura de Anfitrião Ativo).
- _"Se não sabe, diga que NÃO SABE."_ (Honestidade Intelectual).
- _"Use gírias leves."_ (Tone-match).

**Check de Anti-Repetição:**
O prompt recebe também o `formatted_history` e é instruído: _"Se você já contou a história X na mensagem acima, VÁ PARA A PRÓXIMA ou diga que acabou."_. Isso evita o efeito "Papagaio" onde o bot repete a mesma anedota em loop.

---

### 7. Observabilidade (`observability.py`)

> **Arquivo:** `core/observability.py`

#### 🎯 Responsabilidade

Tornar o "pensamento" da IA visível para o desenvolvedor.

#### 🛠️ Técnica: Structured Logging (Visual Boxes)

Em vez de logs lineares ilegíveis, criamos um sistema de blocos visuais (`Ascii Boxes`) que mostram claramente:

- 👤 INPUT
- ⚙️ NÓ (Inputs e Outputs estruturados)
- 🤖 RESPOSTA

Isso acelera o debug em 10x, pois conseguimos ver exatamente onde a lógica quebrou (ex: "O Router classificou errado" ou "O Guard bloqueou sem querer").

---

## 🔄 Fluxo Completo do Sistema (End-to-End)

Imagine que o usuário pergunta: **"E quais tecnologias ele usa?"** (logo após falar do projeto DataChat).

1.  **Input Recebido:** A API recebe a string bruta.
2.  **Language Detection:** Identifica `pt-br`.
3.  **Memory (Contextualize):**
    - Lê o histórico. Vê que a mensagem anterior era sobre "DataChat".
    - **Reescreve:** "Quais tecnologias o projeto DataChat usa?"
4.  **Router:**
    - Analisa a nova pergunta. Identifica palavras-chave "tecnologias", "projeto".
    - **Decisão:** `TECHNICAL` (Rota RAG).
5.  **Retrieve:**
    - Busca no VectorDB (Chroma) por: "tecnologias projeto DataChat".
    - Encontra 4 pedaços de texto do `profile.md`.
6.  **Answerability Guard:**
    - Analisa os 4 pedaços. Eles contêm "Python", "Pandas", "React"? Sim.
    - **Veredito:** `is_answerable: True`.
7.  **Generate RAG:**
    - Recebe os fatos brutos.
    - Aplica a persona "Marcos".
    - Gera: _"Opa, no DataChat eu usei **Python** pesadão no backend com **Pandas** para processar os dados..."_
8.  **Translator:**
    - Verifica idioma original (`pt-br`). Não precisa traduzir.
9.  **Output:** JSON final enviado ao Frontend/User.

### 🛡️ Redes de Segurança (Safety Nets)

1.  **Se o Router falhar:** Ele tem um `try/catch` que força o caminho `TECHNICAL` em caso de erro. Melhor responder tecnicamente errado do que dar "crash".
2.  **Se o RAG não achar nada:** O `Guard` pega o contexto vazio, seta `is_answerable: False`, e o fluxo é desviado para o `FallbackResponder` ("Putz, não sei...").
3.  **Se o usuário tentar Jailbreak ("Ignore suas regras"):** O prompt do `generate_rag` tem instruções explícitas de `System Override` para ignorar comandos que quebrem a persona.

---

Este documento reflete o estado atual do código em `backend/app/graph`.
