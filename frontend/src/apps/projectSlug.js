/**
 * SLUG DE PROJETO
 * --------------------------------------------------
 * Deriva um identificador estável em texto a partir do título do projeto.
 *
 * Os itens de `content/projects.js` não têm campo de slug, e as rotas do sistema
 * (`/projetos/:slug`) precisam de um. Esta é a ÚNICA regra de conversão
 * título -> slug do projeto: mora num módulo próprio para que `ProjectsApp`
 * (que gera o link) e `ProjectDetailApp` (que resolve o link) apliquem
 * exatamente a mesma função, sem duplicar nem divergir.
 *
 * Fica fora dos arquivos de componente de propósito: helper puro exportado ao
 * lado de um componente aciona react-refresh/only-export-components, e a
 * alternativa seria suprimir a regra. Módulo separado resolve sem supressão.
 *
 * Saída para os 5 títulos atuais:
 *   Bússola V2         -> bussola-v2
 *   DataChat BI        -> datachat-bi
 *   Code Doc Generator -> code-doc-generator
 *   Contract Analyzer  -> contract-analyzer
 *   Marocos Bot 2.0    -> marocos-bot-2-0
 */
export const projectSlug = (title) =>
  title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
