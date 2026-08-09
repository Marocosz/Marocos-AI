import { Mail, Linkedin, Github, MessageSquare } from 'lucide-react';

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
    color: "#fff" 
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
  hosting: {
    badge: "HOSTING SERVICE",
    title: "Professional VPS Hosting Available",
    description: "I offer complete end-to-end web hosting solutions through my own VPS infrastructure. From deployment to monitoring, database management to SSL certificates, I handle everything. Perfect for small to medium projects that need reliable, custom hosting with direct support from the developer.",
    features: ["✓ Custom Configuration", "✓ 24/7 Monitoring", "✓ Direct Support", "✓ SSL & Security"]
  },
  terminal: {
    title: "visitor@portfolio: ~",
    prompt: "visitor@portfolio:~$",
    version: "Marocos OS [Version 3.0.1]",
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
  hosting: {
    badge: "SERVIÇO DE HOSPEDAGEM",
    title: "Hospedagem VPS Profissional Disponível",
    description: "Ofereço soluções completas de hospedagem web através de minha própria infraestrutura VPS. Do deploy ao monitoramento, gerenciamento de banco de dados e certificados SSL, eu cuido de tudo. Perfeito para projetos de pequeno e médio porte que precisam de hospedagem confiável, personalizada e com suporte direto do desenvolvedor.",
    features: ["✓ Configuração Personalizada", "✓ Monitoramento 24/7", "✓ Suporte Direto", "✓ SSL & Segurança"]
  },
  terminal: {
    title: "visitante@portfolio: ~",
    prompt: "visitante@portfolio:~$",
    version: "Marocos OS [Versão 3.0.1]",
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
export const contactData = contactDataItems; // Backwards compatibility for raw list if needed