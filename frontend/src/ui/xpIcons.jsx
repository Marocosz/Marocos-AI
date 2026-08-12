import React from 'react'

/**
 * OS ÍCONES DO MODO XP
 * ==================================================
 * Sete ícones desenhados no ESTILO do Windows XP — volume, brilho no topo,
 * contorno escuro e cor saturada — e não cópias da arte da Microsoft. A
 * diferença importa por dois motivos: os arquivos originais são material
 * protegido, e o argumento do site inteiro é que aqui tudo é feito à mão.
 *
 * SÃO SVG, E NÃO PNG, pelo mesmo motivo que o resto do sistema é: escalam sem
 * borrar (o mesmo ícone serve o tile de 48px da área de trabalho e os 20px da
 * lista do menu Iniciar), pesam alguns bytes cada um, e entram no bundle sem
 * uma requisição por ícone.
 *
 * A LINGUAGEM É A MESMA EM TODOS, e é o que faz o conjunto parecer um conjunto:
 * um degradê claro-para-escuro de cima para baixo, um realce branco translúcido
 * na parte superior da forma principal, e contorno mais escuro que o
 * preenchimento. É a receita visual daquela era.
 *
 * Cada `id` de gradiente leva o nome do ícone porque `<defs>` é global no
 * documento: dois ícones com um `id="grad"` cada e o segundo silenciosamente
 * repinta o primeiro.
 */

const Svg = ({ size, children, titulo }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label={titulo}
  >
    {children}
  </svg>
)

/** Meu Computador — o monitor CRT de tubo, com a base cinza. */
const MeuComputador = ({ size = 32 }) => (
  <Svg size={size} titulo="Meu computador">
    <defs>
      <linearGradient id="xpPcTela" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7fc3f5" />
        <stop offset="55%" stopColor="#2b7fd4" />
        <stop offset="100%" stopColor="#14508f" />
      </linearGradient>
      <linearGradient id="xpPcCaixa" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f2f0e6" />
        <stop offset="100%" stopColor="#b9b5a2" />
      </linearGradient>
    </defs>
    {/* base */}
    <path d="M11 25h10l1.5 3.5h-13z" fill="url(#xpPcCaixa)" stroke="#6f6b5c" strokeWidth="0.9" strokeLinejoin="round" />
    {/* corpo do monitor */}
    <rect x="3" y="5" width="26" height="19" rx="2.2" fill="url(#xpPcCaixa)" stroke="#6f6b5c" strokeWidth="1" />
    {/* tela */}
    <rect x="5.4" y="7.2" width="21.2" height="13.4" rx="1.2" fill="url(#xpPcTela)" stroke="#123f72" strokeWidth="0.8" />
    {/* brilho diagonal na tela */}
    <path d="M6 19.6 15.5 7.6h4.2L7.6 20.2z" fill="#ffffff" opacity="0.18" />
    {/* realce superior da caixa */}
    <path d="M4.4 6.2h23.2v1.4H4.4z" fill="#ffffff" opacity="0.5" />
  </Svg>
)

/** Meus Documentos — a pasta manila com uma folha saindo. */
const Pasta = ({ size = 32 }) => (
  <Svg size={size} titulo="Pasta">
    <defs>
      <linearGradient id="xpPastaFrente" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffe9a8" />
        <stop offset="45%" stopColor="#fdc84f" />
        <stop offset="100%" stopColor="#e2960f" />
      </linearGradient>
    </defs>
    {/* aba de trás */}
    <path
      d="M2.5 8.5a1.5 1.5 0 0 1 1.5-1.5h7.2l2.3 2.6h13a1.5 1.5 0 0 1 1.5 1.5v3H2.5z"
      fill="#e0a52a"
      stroke="#a9740a"
      strokeWidth="0.9"
      strokeLinejoin="round"
    />
    {/* folha branca */}
    <rect x="9" y="9.5" width="14" height="9" rx="0.8" fill="#ffffff" stroke="#b9b5a2" strokeWidth="0.8" />
    {/* frente da pasta */}
    <path
      d="M2.5 12.5h27a1.4 1.4 0 0 1 1.36 1.75l-2.3 9.2A1.6 1.6 0 0 1 27 24.7H4.2a1.6 1.6 0 0 1-1.56-1.25L1.2 14.2A1.4 1.4 0 0 1 2.5 12.5z"
      fill="url(#xpPastaFrente)"
      stroke="#a9740a"
      strokeWidth="0.9"
      strokeLinejoin="round"
    />
    <path d="M3 14h26l-0.5 2H3.4z" fill="#ffffff" opacity="0.45" />
  </Svg>
)

/** Histórico — a pasta com o relógio, como o "documentos recentes". */
const PastaRelogio = ({ size = 32 }) => (
  <Svg size={size} titulo="Histórico">
    <defs>
      <linearGradient id="xpHistFrente" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffe9a8" />
        <stop offset="45%" stopColor="#fdc84f" />
        <stop offset="100%" stopColor="#e2960f" />
      </linearGradient>
      <linearGradient id="xpHistRelogio" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#cfd8e3" />
      </linearGradient>
    </defs>
    <path
      d="M2.5 8.5a1.5 1.5 0 0 1 1.5-1.5h7.2l2.3 2.6h13a1.5 1.5 0 0 1 1.5 1.5v3H2.5z"
      fill="#e0a52a"
      stroke="#a9740a"
      strokeWidth="0.9"
      strokeLinejoin="round"
    />
    <path
      d="M2.5 12.5h27a1.4 1.4 0 0 1 1.36 1.75l-2.3 9.2A1.6 1.6 0 0 1 27 24.7H4.2a1.6 1.6 0 0 1-1.56-1.25L1.2 14.2A1.4 1.4 0 0 1 2.5 12.5z"
      fill="url(#xpHistFrente)"
      stroke="#a9740a"
      strokeWidth="0.9"
      strokeLinejoin="round"
    />
    <path d="M3 14h26l-0.5 2H3.4z" fill="#ffffff" opacity="0.45" />
    {/* o relógio, sobreposto no canto */}
    <circle cx="22.5" cy="20.5" r="7" fill="url(#xpHistRelogio)" stroke="#3f6ea8" strokeWidth="1.1" />
    <circle cx="22.5" cy="20.5" r="5.2" fill="none" stroke="#9db6d4" strokeWidth="0.6" />
    <path d="M22.5 16.6v4l2.8 1.8" stroke="#17406f" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

/** Gerenciador de dispositivos — a plaquinha verde com o chip. */
const Chip = ({ size = 32 }) => (
  <Svg size={size} titulo="Dispositivos">
    <defs>
      <linearGradient id="xpChipPlaca" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3f9e4d" />
        <stop offset="100%" stopColor="#1c5c2a" />
      </linearGradient>
      <linearGradient id="xpChipCorpo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6b6f76" />
        <stop offset="45%" stopColor="#3b3f46" />
        <stop offset="100%" stopColor="#212429" />
      </linearGradient>
    </defs>
    <rect x="2.5" y="4.5" width="27" height="23" rx="2" fill="url(#xpChipPlaca)" stroke="#144320" strokeWidth="1" />
    {/* trilhas */}
    <path d="M5 9h6v4h5M27 12h-5v6h-6M5 21h7v3" stroke="#8fd39b" strokeWidth="0.9" fill="none" opacity="0.75" />
    {/* pernas do chip */}
    <g stroke="#c9ccd2" strokeWidth="1.4" strokeLinecap="round">
      <path d="M12 8.5v2M16 8.5v2M20 8.5v2M12 21.5v2M16 21.5v2M20 21.5v2" />
      <path d="M8.5 13h2M8.5 16h2M8.5 19h2M21.5 13h2M21.5 16h2M21.5 19h2" />
    </g>
    <rect x="10.5" y="10.5" width="11" height="11" rx="1.2" fill="url(#xpChipCorpo)" stroke="#15171a" strokeWidth="0.9" />
    <path d="M11.4 11.4h9.2v3h-9.2z" fill="#ffffff" opacity="0.16" />
    <circle cx="13" cy="19.4" r="1" fill="#8fd39b" opacity="0.8" />
  </Svg>
)

/** Prompt de comando — a janela preta com o cursor. */
const Prompt = ({ size = 32 }) => (
  <Svg size={size} titulo="Terminal">
    <defs>
      <linearGradient id="xpPromptBarra" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4a8ff0" />
        <stop offset="100%" stopColor="#1f4fbe" />
      </linearGradient>
    </defs>
    <rect x="3" y="5.5" width="26" height="21" rx="1.6" fill="#0b0b0b" stroke="#3a3a3a" strokeWidth="1" />
    <path d="M3 7.1a1.6 1.6 0 0 1 1.6-1.6h22.8A1.6 1.6 0 0 1 29 7.1v3.1H3z" fill="url(#xpPromptBarra)" />
    <path d="M4 6.4h24v1.1H4z" fill="#ffffff" opacity="0.4" />
    {/* botão fechar da janelinha */}
    <rect x="24.2" y="6.9" width="3.4" height="2.4" rx="0.5" fill="#d94f3d" />
    {/* prompt */}
    <text x="6" y="18.4" fontFamily="monospace" fontSize="6.4" fill="#d8d8d8">
      C:\
    </text>
    <rect x="16.4" y="13.6" width="4.4" height="5.6" fill="#d8d8d8" opacity="0.9" />
  </Svg>
)

/** Marcos Virtual — a figurinha de contato, no espírito dos mensageiros. */
const Contato = ({ size = 32 }) => (
  <Svg size={size} titulo="Assistente">
    <defs>
      <linearGradient id="xpContatoCorpo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7fc3f5" />
        <stop offset="55%" stopColor="#2b7fd4" />
        <stop offset="100%" stopColor="#14508f" />
      </linearGradient>
      <linearGradient id="xpContatoCabeca" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffe0b8" />
        <stop offset="100%" stopColor="#e0a86a" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="10.5" r="5.6" fill="url(#xpContatoCabeca)" stroke="#a9740a" strokeWidth="0.9" />
    <path d="M11.8 6.8a5.6 5.6 0 0 1 8.4 0z" fill="#ffffff" opacity="0.35" />
    <path
      d="M5.5 28c0-5.6 4.7-9.4 10.5-9.4S26.5 22.4 26.5 28z"
      fill="url(#xpContatoCorpo)"
      stroke="#123f72"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <path d="M8.5 22.6a12 12 0 0 1 15 0l-1 1.4a10.4 10.4 0 0 0-13 0z" fill="#ffffff" opacity="0.3" />
    {/* o pontinho verde de "online" */}
    <circle cx="25" cy="22.5" r="4.2" fill="#7cbb00" stroke="#4a7300" strokeWidth="1" />
    <path d="M23.2 22.6l1.3 1.4 2.4-2.7" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
)

/** leia-me.txt — a folha do bloco de notas, com o canto dobrado. */
const Texto = ({ size = 32 }) => (
  <Svg size={size} titulo="Documento de texto">
    <defs>
      <linearGradient id="xpTextoFolha" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#dfe3ea" />
      </linearGradient>
    </defs>
    <path
      d="M7 3.5h12.2L26 10.4V28a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z"
      fill="url(#xpTextoFolha)"
      stroke="#8a97a8"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    {/* o canto dobrado */}
    <path d="M19.2 3.5 26 10.4h-6.8z" fill="#c3cbd6" stroke="#8a97a8" strokeWidth="0.9" strokeLinejoin="round" />
    {/* linhas de texto */}
    <g stroke="#7f9db9" strokeWidth="1.1" strokeLinecap="round">
      <path d="M9.4 14h13M9.4 17.2h13M9.4 20.4h13M9.4 23.6h8" />
    </g>
  </Svg>
)

/** Painel de controle — a janelinha com o controle deslizante. */
const Painel = ({ size = 32 }) => (
  <Svg size={size} titulo="Configurações">
    <defs>
      <linearGradient id="xpPainelBarra" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4a8ff0" />
        <stop offset="100%" stopColor="#1f4fbe" />
      </linearGradient>
    </defs>
    <rect x="3" y="5.5" width="26" height="21" rx="1.6" fill="#ece9d8" stroke="#0831d9" strokeWidth="1" />
    <path d="M3 7.1a1.6 1.6 0 0 1 1.6-1.6h22.8A1.6 1.6 0 0 1 29 7.1v3.1H3z" fill="url(#xpPainelBarra)" />
    <path d="M4 6.4h24v1.1H4z" fill="#ffffff" opacity="0.4" />
    {/* dois deslizantes */}
    <g stroke="#7f9db9" strokeWidth="1.4" strokeLinecap="round">
      <path d="M7 15.5h18M7 21h18" />
    </g>
    <rect x="12" y="13" width="4" height="5" rx="1" fill="#c9ccd2" stroke="#5f6b7a" strokeWidth="0.9" />
    <rect x="19" y="18.5" width="4" height="5" rx="1" fill="#c9ccd2" stroke="#5f6b7a" strokeWidth="0.9" />
  </Svg>
)

/**
 * O MAPA. Chaveado pelo `id` do app do registry, e não pela ordem — mesma regra
 * dos rótulos de ícone em `i18n/os.js`.
 *
 * App que não estiver aqui simplesmente cai no glifo lucide de sempre, e é o
 * comportamento certo: um app novo aparece com o ícone padrão em vez de sumir.
 */
const ICONES_XP = {
  about: MeuComputador,
  projects: Pasta,
  project: Texto,
  history: PastaRelogio,
  devices: Chip,
  terminal: Prompt,
  assistant: Contato,
  readme: Texto,
  settings: Painel,
}

/**
 * O acesso é um COMPONENTE e não uma função de busca, e a razão é a regra de
 * fast refresh do eslint: um módulo que exporta componentes não pode exportar
 * também um utilitário comum, senão o recarregamento a quente do Vite deixa de
 * funcionar para o arquivo inteiro.
 *
 * Devolve `null` para app sem ícone próprio, e quem chama decide o fallback.
 */
const IconeXp = ({ appId, size = 32 }) => {
  const Icone = ICONES_XP[appId]
  return Icone ? <Icone size={size} /> : null
}

export default IconeXp
