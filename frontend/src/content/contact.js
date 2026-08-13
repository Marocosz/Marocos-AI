import { Mail, Linkedin, Github, MessageSquare } from 'lucide-react';
/* A VERSÃO VEM DE FONTE ÚNICA. Ela estava escrita à mão nos dois banners abaixo, e
   `content/sistema.js` carregava o comentário "o mesmo do banner do terminal" — que
   é a descrição de um defeito, não de um contrato. Ver a nota lá. */
import { SISTEMA } from './sistema';

const contactDataItems = [
  {
    id: "email",
    label: "EMAIL",
    value: "marcosrodriguesepro@gmail.com",
    link: "mailto:marcosrodriguesepro@gmail.com",
    icon: Mail,
    color: "#ea4335" 
  },
  {
    id: "linkedin",
    label: "LINKEDIN",
    value: "/in/marcosrodriguesptc",
    link: "https://linkedin.com/in/marcosrodriguesptc", 
    icon: Linkedin,
    color: "#0a66c2" 
  },
  {
    id: "github",
    label: "GITHUB",
    value: "/marocosz",
    link: "https://github.com/marocosz",
    icon: Github,
    /**
     * TOKEN, E NÃO "#fff".
     *
     * Este campo `color` não tinha consumidor nenhum até agora — o TerminalApp
     * renderiza `<Icon size={14} />` sem cor (o `entry.color` dele vem de
     * `terminal.logs`, não daqui). Então o branco literal não era um bug: passaria
     * a ser no instante em que o botão de contato do "Sobre este PC" o usasse,
     * porque branco sobre o vidro claro do tema de dia é invisível.
     *
     * As outras três ficam literais de propósito — são cores de MARCA, a exceção
     * documentada do projeto: elas significam algo, e seguir o tema faria o
     * LinkedIn deixar de ser azul. A do GitHub é a única que não pode ser
     * literal, porque a marca dele é monocromática por definição: a "cor" dela é
     * o primeiro plano de quem a exibe.
     */
    color: "var(--text-primary)"
  },
  {
    id: "discord",
    label: "DISCORD",
    value: "@marocos", 
    link: "https://discord.com/users/marocos", 
    icon: MessageSquare,
    color: "#5865F2" 
  }
];

// Content for the Contact Page
const contactPageContentEn = {
  sectionLabel: "06. / CONNECT",
  title: "Let's Talk",
  description: "Below are the best channels to find me. Run the command or click the links.",
  /**
   * O BLOCO `hosting` SAIU DAQUI, e a história dele vale a nota.
   *
   * Ele começou como 55 palavras de anúncio ("Perfect for small to medium
   * projects that need reliable, custom hosting...") com quatro bullets de
   * folheto, no meio de um app de CONTATO. Foi cortado para quatro linhas que
   * provavam devops em vez de vender hospedagem — e o corte estava certo, mas a
   * conclusão que faltava era outra: o texto não era ruim, estava no lugar
   * errado.
   *
   * Agora existe o lugar. Ele vive em `content/servicos.js`, que alimenta a
   * janela de Serviços E a manchete que o comando `vps` do terminal imprime.
   * FONTE ÚNICA de propósito: com o texto nos dois arquivos, a ficha da janela e
   * a saída do terminal diriam a mesma coisa e divergiriam na primeira edição.
   */
  terminal: {
    title: "visitor@portfolio: ~",
    prompt: "visitor@portfolio:~$",
    version: `Marocos OS [Version ${SISTEMA.versao}]`,
    copyright: "(c) 2026 Marcos Rodrigues. All rights reserved.",
    systemCheck: "System check: OK. Loading shell...",
    logs: [
      { text: "Initializing handshake protocol...", status: "OK", color: "#27c93f" },
      { text: "Verifying ssl certificates...", status: "VERIFIED", color: "#ffbd2e" },
      { text: "Decrypting contact data...", status: "DONE", color: "#a855f7" }
    ],
    tableHeaders: ["TYPE", "DESTINATION", "STATUS"]
  },
  items: contactDataItems
};

const contactPageContentPt = {
  sectionLabel: "06. / CONECTAR",
  title: "Vamos Conversar",
  description: "Abaixo estão os melhores canais para me encontrar. Execute o comando ou clique nos links.",
  /** Ver a nota no bloco em inglês: `hosting` mudou para `content/servicos.js`. */
  terminal: {
    title: "visitante@portfolio: ~",
    prompt: "visitante@portfolio:~$",
    version: `Marocos OS [Versão ${SISTEMA.versao}]`,
    copyright: "(c) 2026 Marcos Rodrigues. Todos os direitos reservados.",
    systemCheck: "Verificação do sistema: OK. Carregando shell...",
    logs: [
      { text: "Inicializando protocolo de handshake...", status: "OK", color: "#27c93f" },
      { text: "Verificando certificados ssl...", status: "VERIFICADO", color: "#ffbd2e" },
      { text: "Descriptografando dados...", status: "PRONTO", color: "#a855f7" }
    ],
    tableHeaders: ["TIPO", "DESTINO", "STATUS"]
  },
  items: contactDataItems
};

export const getContactData = (lang) => (lang === 'pt' ? contactPageContentPt : contactPageContentEn);