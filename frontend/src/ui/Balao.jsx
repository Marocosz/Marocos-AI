import React from 'react'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import './Balao.css'

/**
 * BALÃO — a notificação do sistema.
 * --------------------------------------------------
 * Superfície only: quem decide quando aparece e quando some é quem usa (ver
 * `os/desktop/AvisosDesktop.jsx`). Aqui mora só a forma.
 *
 * A FORMA É A DO CHROME DO SISTEMA, não uma receita nova. Vidro translúcido com
 * blur, borda de janela, raio de janela, sombra de janela — a mesma matéria do
 * menu Iniciar e da barra de tarefas, que são os outros dois painéis que
 * flutuam sobre o wallpaper. Um balão sólido no meio de um sistema de vidro lê
 * como coisa de fora.
 *
 * A marca de acento é a PÍLULA da borda esquerda: 3px, raio 2, centrada
 * verticalmente — o mesmo `.app-indicator` da taskbar e o mesmo traço do item
 * ativo do explorador, girado para a vertical. Item que reclama atenção tem uma
 * marca só no sistema inteiro.
 *
 * `acao` é opcional: com ela o corpo inteiro vira clicável (e um <button> de
 * verdade), sem ela o balão é só leitura. O X existe nos dois casos, porque
 * dispensar tem de ser possível mesmo quando há uma ação melhor.
 */
const Balao = ({ Icone, titulo, corpo, rotuloFechar, onFechar, acao, transicao, className = '' }) => {
  const Conteudo = (
    <>
      {Icone && (
        <span className="balao-icone" aria-hidden="true">
          <Icone size={16} strokeWidth={2} />
        </span>
      )}
      <span className="balao-texto">
        <strong className="balao-titulo">{titulo}</strong>
        {corpo}
      </span>
    </>
  )

  return (
    <motion.aside
      className={`balao ${className}`.trim()}
      role="status"
      initial={transicao.inicial}
      animate={transicao.animar}
      exit={transicao.sair}
      transition={transicao.transition}
    >
      {acao ? (
        <button type="button" className="balao-corpo balao-corpo--acao" onClick={acao}>
          {Conteudo}
        </button>
      ) : (
        <span className="balao-corpo">{Conteudo}</span>
      )}

      <button
        type="button"
        className="balao-fechar"
        aria-label={rotuloFechar}
        onClick={onFechar}
      >
        <X size={14} strokeWidth={2.2} />
      </button>
    </motion.aside>
  )
}

export default Balao
