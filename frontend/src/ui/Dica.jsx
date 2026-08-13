import React from 'react'
import { HelpCircle } from 'lucide-react'
import { useBalao } from './useBalao'
import './Dica.css'

/**
 * DICA — o balão de ajuda do sistema.
 * --------------------------------------------------
 * Um alvo pequeno que revela um balão no hover e no foco. Nasceu para o
 * seletor de papel de parede, onde a explicação do modo sóbrio ("sem
 * movimento, sem vidro") ocupava uma linha embaixo de cada amostra e poluía
 * uma grade que existe para ser escaneada de relance.
 *
 * NÃO USA O `title` NATIVO, e isso é o ponto. O balão do navegador tem fonte,
 * cor, atraso e posição do sistema operacional do visitante — num projeto que
 * desenha o próprio SO, ele é o único elemento que denuncia que há outro por
 * baixo. Este segue a linguagem do resto: superfície de vidro, borda do
 * sistema, raio de controle, e a mesma escala tipográfica.
 *
 * TECLADO NÃO FICA DE FORA. O alvo é um `<button>` de verdade, o balão aparece
 * no `:focus-visible` além do hover, e `aria-describedby` amarra os dois — um
 * balão que só existe no mouse é decoração, não informação. Aqui o balão É
 * lido: ele é a única fonte da explicação, ao contrário do `TextoCortado`.
 *
 * A MECÂNICA DO BALÃO SAIU DAQUI e virou `ui/useBalao.jsx` quando apareceu o
 * segundo consumidor. O que ficou neste arquivo é só o ALVO — o botãozinho de
 * interrogação e o comportamento dele. As três armadilhas de posicionamento
 * (recorte por overflow, ancestral transformado, destino do portal) estão
 * documentadas no hook, e é lá que se lê antes de mexer em posição.
 */
const Dica = ({ texto, rotulo, posicao = 'acima', className = '' }) => {
  const { alvoRef, id, visivel, mostrar, esconder, renderBalao } = useBalao(posicao)

  return (
    <span className={`dica ${className}`.trim()}>
      <button
        ref={alvoRef}
        type="button"
        className="dica-alvo"
        // O rótulo acessível é o que o botão FAZ; o texto em si vem pelo
        // describedby, que é o papel certo para conteúdo explicativo.
        aria-label={rotulo}
        aria-describedby={visivel ? id : undefined}
        aria-expanded={visivel}
        onMouseEnter={mostrar}
        onMouseLeave={esconder}
        onFocus={mostrar}
        onBlur={esconder}
        // Esc fecha: o balão pode cobrir o que a pessoa quer ler.
        onKeyDown={(e) => e.key === 'Escape' && esconder()}
        // Não submete nem navega; o clique só alterna, para funcionar no toque.
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (visivel) esconder()
          else mostrar()
        }}
      >
        <HelpCircle size={13} strokeWidth={2} aria-hidden="true" />
      </button>

      {renderBalao(texto)}
    </span>
  )
}

export default Dica
