# Linha de base — antes da refatoração do frontend

Capturada em 2026-08-10, no commit `c703d01`, branch `feat/windowsmorphism`.
É o critério de aceite de toda tarefa marcada **[VISUAL]** no plano.

## Bundle

Build limpo (`rm -rf dist && npm run build`), em `frontend/`:

| chunk | raw | gzip |
|---|---|---|
| `index-B_vPFlE0.js` | 1.497.981 B (1,50 MB) | **432.103 B (432 KB)** |
| `Crystal-Bu5evQCN.js` | 59.581 B | 21.135 B |
| `index-C61Lo8Gp.css` | 71.817 B | 13.416 B |

Composição verificada por grep no bundle emitido:

| símbolo | `index.js` | `Crystal.js` |
|---|---|---|
| `THREE.WebGLRenderer` | 1 | 0 |
| `WebGLRenderer` | 5 | 0 |
| `IcosahedronGeometry` | 2 | 0 |
| `MeshPhysicalMaterial` | 3 | 0 |
| `react-markdown` | 1 | 0 |
| `micromark` | 2 | 0 |

O `three` está no bundle principal, não no chunk lazy — é o achado que a
Tarefa 13 resolve.

## Lint e testes

- `npm run lint` — sem erros
- `npm test` — 2 arquivos passando (`routes.test.js`, `windowManager.test.js`)

## Telas

Três capturas, tema escuro, cobrindo as áreas de maior risco visual do plano.
Decisão do dono do projeto: estas três bastam; o resto é validado por código.

| arquivo | cobre | tarefas que dependem |
|---|---|---|
| `baseline/01-area-de-trabalho-escuro.png` | wallpaper Silk em movimento, janela "Sobre este PC", coluna de ícones, assinatura, taskbar completa | 2, 8, 11, 13 |
| `baseline/02-inicializacao-escuro.png` | cerimônia de boot: vinheta fechada, cristal, barra de progresso, etapa, dica de pular | 5, 7, 13 |
| `baseline/03-tela-bloqueio-escuro.png` | tela de bloqueio: nebulosa em banda horizontal, campo de estrelas, cristal, marca "MAROCOS SO", relógio | 5, 7, 11, 13 |

### O que ler em cada uma

**01 — área de trabalho.** O Silk é o fundo roxo escuro com dobras diagonais
grandes e granulado fino; é a referência exata da Tarefa 13 (porte para `ogl`).
A janela "Sobre este PC" mostra o cristal, o bloco de identidade e a bio — e
**nada abaixo disso**, com barra de rolagem à direita: ver a nota sobre
`.about-section` logo abaixo. A taskbar tem os ícones de bandeja, relógio
`10:18` e data `10/08/2026`.

**02 — inicialização.** Fundo quase preto com vinheta forte fechando os cantos
e uma coluna de luz índigo no miolo. Cristal parado no centro, marca
"MAROCOS SYSTEMS", barra de progresso a ~40%, etapa "iniciando o Marcos
Virtual", "clique para pular" no rodapé.

**03 — bloqueio.** Campo violeta mais claro e aberto, com estrelas até as
bordas e a nebulosa como **banda horizontal** atravessando a tela na altura do
cristal — o contraste com a coluna vertical da inicialização é deliberado (ver
os seis eixos em `tokens.css`). Relógio no topo, "VISITANTE", cristal, marca
"MAROCOS SO" acesa, "ENTRAR".

## Nota: a janela "Sobre este PC" na captura 01

A captura confirma visualmente o que a seção 4.3 do spec descreve: as duas
`<section className="about-section">` do `AboutApp` estão sendo estilizadas
pelo `.about-section` do `index.css` legado, com `min-height: 70vh` e
`padding: 5rem 2rem` cada.

O efeito prático é visível na imagem: **as seções "ESPECIFICAÇÕES" e "RECURSOS
INSTALADOS" não aparecem** — estão empurradas para muito abaixo da área
visível, atrás de um espaço vazio de altura equivalente a duas viewports.
A barra de rolagem à direita da janela confirma que há conteúdo abaixo.

A decisão registrada é preservar pixel a pixel (Tarefa 2). Esta nota existe
para que a decisão seja tomada com a consequência à vista.
