import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMovimentoReduzido } from '../os/hooks/useMediaQuery'
import { Float, Environment, Lightformer, Sparkles } from '@react-three/drei'

/**
 * CRISTAL — a marca 3D do sistema, reutilizável.
 * --------------------------------------------------
 * Mesma geometria, mesmo material e mesma luz do cristal que está em produção.
 * O que muda é só o invólucro.
 *
 * A versão de produção era um <div> de 700x700 posicionado em `absolute` com
 * top/left/transform chumbados, que transbordava o container de propósito e
 * obrigava cada consumidor a inventar um recorte. Aqui o componente é um bloco
 * comum do tamanho que você pedir: quem posiciona é quem usa.
 *
 * POR QUE QUADRADO: o visível na horizontal é proporcional à largura da caixa,
 * então numa caixa estreita e alta o cristal encostaria nas bordas laterais.
 * Canvas quadrado dá o mesmo enquadramento em qualquer tamanho. O cálculo da
 * distância da câmera está em DISTANCIA_CAMERA, abaixo.
 *
 *   <Crystal size={220} />            estático, sem loop de render
 *   <Crystal size={320} animated />   girando e flutuando, como em produção
 *   <Crystal size={140} sparkles={false} />
 */

// Pose de repouso: leve giro no Y e inclinação no X para as facetas pegarem a
// luz. Sem isto o cristal estático fica de frente e chapado.
const POSE_PARADA = [0.14, 0.6, 0.05]

/**
 * Distância da câmera, escolhida por conta e não por tentativa.
 *
 * A malha tem meia-altura 1.8 (escala y) e meia-largura 0.7. Com fov 45, o
 * visível no plano do objeto é tan(22.5°) x z. Em z=7 dava ±2.90, e o cristal
 * ocupava apenas 62% da altura e 24% da largura da caixa — muito canvas vazio,
 * e é por isso que ele lia como pequeno mesmo com `size` grande.
 *
 * Em z=5.6 o visível cai para ±2.32: o cristal passa a ocupar 78% da altura, e
 * os Sparkles (que se espalham até 1.5) ficam em 65% — ainda dentro do quadro,
 * sem encostar na borda.
 */
const DISTANCIA_CAMERA = 5.6

const CrystalMesh = ({ animated, spin, corpo }) => {
  const meshRef = useRef()
  // Tempo de rotação acumulado, e a velocidade que está valendo agora.
  const faseRef = useRef(0)
  const spinAtualRef = useRef(spin)

  useFrame((_, delta) => {
    if (!animated || !meshRef.current) return

    // O ÂNGULO É INTEGRADO, NÃO CALCULADO DO TEMPO ABSOLUTO.
    //
    // Antes era `clock.getElapsedTime() * spin`. Enquanto cada tela tinha o seu
    // próprio cristal isso dava no mesmo, mas com um cristal só atravessando a
    // cerimônia inteira a velocidade muda em voo — e multiplicar o tempo já
    // decorrido por um spin novo salta a rotação na hora da troca. Somando por
    // frame, mudar de velocidade não mexe no ângulo já percorrido.
    //
    // `delta` limitado: depois de um engasgo ou de uma aba em segundo plano ele
    // vem grande e o cristal daria um pulo para recuperar o "atraso".
    const dt = Math.min(delta, 0.05)
    // Aproximação exponencial da velocidade alvo: a queda de 3.2 para 1.6 na
    // passagem para o bloqueio vira uma desaceleração, e não um corte. É o
    // sistema assentando.
    spinAtualRef.current += (spin - spinAtualRef.current) * Math.min(1, dt * 2.2)
    faseRef.current += dt * spinAtualRef.current

    // Mesmos coeficientes da produção. Com spin constante o resultado é
    // idêntico ao de lá.
    const t = faseRef.current
    meshRef.current.rotation.y = t * 0.2
    meshRef.current.rotation.x = Math.cos(t * 0.3) * 0.1
    meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.05
  })

  return (
    <mesh ref={meshRef} rotation={animated ? undefined : POSE_PARADA} scale={[0.7, 1.8, 0.7]}>
      {/* Icosaedro dá as faces irregulares de quartzo bruto. Fino em x/z,
          alongado em y. */}
      <icosahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        color={corpo}
        emissive="#090909"
        emissiveIntensity={0.2}
        roughness={0.15}
        metalness={0.1}
        transmission={1.0}
        thickness={2.0}
        ior={1.5}
        clearcoat={1}
        /* A produção também passava chromaticAberration={0.06} aqui. Essa prop
           é do MeshTransmissionMaterial do drei, não do meshPhysicalMaterial do
           three — ela vinha sendo ignorada silenciosamente. Removida por ser
           inerte; para ter aberração de verdade seria preciso trocar o
           material, o que mudaria o visual. */
      />
    </mesh>
  )
}

const Crystal = ({
  size = 260,
  animated = false,
  /**
   * Multiplicador da rotação. Em 1 o giro é o da produção: 0.2 rad/s, ou seja
   * 48 graus em quatro segundos — organico para um objeto em repouso numa
   * pagina, mas perto de imperceptivel numa tela de boot, onde o movimento
   * PRECISA comunicar que o sistema esta trabalhando.
   */
  spin = 1,
  sparkles = true,
  className = '',
  /**
   * O ACENTO DO PRESET ATIVO, e o companheiro mais fundo dele.
   *
   * Vêm por prop e não de `useTheme()` aqui dentro por dois motivos: este
   * componente é montado dentro de um `<Canvas>` do react-three-fiber, que roda
   * numa árvore de reconciliação PRÓPRIA — contexto do React da árvore de fora
   * não atravessa sozinho. E o padrão mantém o cristal testável e renderizável
   * fora do sistema, como já era.
   *
   * Os literais são o preset padrão da noite, para quem montar sem passar nada.
   */
  acento = '#a855f7',
  acentoFundo = '#4c1d95',
  /** Corpo do material. Ponto médio entre os dois acima — ver
   *  `corpoDoCristal()` em config/system.js. */
  corpo = '#6b24b7',
  /**
   * UMA COR PARA TODA A LUZ EM VOLTA, quando o preset pede. Só o XP usa hoje:
   * corpo laranja, luz verde — as duas cores do logotipo daquele sistema, em
   * oposição quente/fria.
   *
   * A OPOSIÇÃO É O QUE FAZ FUNCIONAR. A tentativa anterior foi pôr as quatro
   * cores da bandeirinha como quatro luzes distintas, e saiu acinzentada: com
   * `transmission: 1.0` o material atravessa e MISTURA o que recebe, então
   * saturação demais vinda de muitos lados se anula. Duas cores complementares
   * sobrevivem à refração; quatro viram cinza.
   *
   * Ausente (o caso de todos os outros presets), valem `acento` e
   * `acentoFundo` como sempre.
   */
  luz = null,
}) => {
  // Com `luz`, as DUAS fontes de identidade viram a mesma cor: é o que produz
  // um banho uniforme em volta do sólido, em vez de dois matizes competindo.
  const luzEsquerda = luz || acento
  const luzDireita = luz || acentoFundo
  const luzPonto = luz || acento
  /**
   * QUEM PEDE MENOS MOVIMENTO NÃO RECEBE UM CRISTAL GIRANDO.
   *
   * O resto do sistema respeita `prefers-reduced-motion` — as janelas, os
   * balões, o marquee que existia aqui — e este componente era o único que
   * girava de qualquer jeito. É a peça com MAIS movimento do site, e a única
   * que ignorava o pedido.
   *
   * E ISSO ERA TAMBÉM A INSTABILIDADE DO REGRESSOR VISUAL. O `useFrame` abaixo
   * integra `delta` de tempo real com `frameloop="always"`, e nem o
   * `reducedMotion: 'reduce'` do Playwright nem o `animations: 'disabled'` do
   * `toHaveScreenshot` alcançam isso — os dois param CSS, não o loop do
   * react-three-fiber. O ângulo do cristal na hora da foto era, literalmente,
   * quantos quadros couberam no tempo decorrido: nunca o mesmo duas vezes.
   *
   * Daí o sintoma que parecia inexplicável — cenas de tolerância zero falhando
   * de forma intermitente, e sempre cenas DIFERENTES. A suspeita anterior
   * (ruído do shader de wallpaper) estava errada: as cenas que só têm shader,
   * como `wallpaper-escuro` e `mobile-home`, sempre estiveram em tolerância
   * zero sem reclamar. As que oscilavam eram exatamente as marcadas
   * `cristal3d`.
   *
   * Com o giro parado sob `prefers-reduced-motion`, o cristal cai na
   * `POSE_PARADA` — um ângulo fixo — e as cenas do harness voltam a ser
   * reproduzíveis. A correção é de acessibilidade; a suíte determinística é
   * consequência.
   *
   * A LEITURA PRECISA SER SÍNCRONA, e este hook é o que garante isso: ele
   * inicializa o estado com `window.matchMedia(...).matches` já no primeiro
   * render. O `useReducedMotion()` do motion, que era o candidato óbvio aqui,
   * só resolve depois de montar — e essa janela de alguns quadros bastava para
   * o `useFrame` acumular um ângulo qualquer em `faseRef` antes de congelar.
   * O cristal parava, mas parava num lugar diferente a cada execução, que é
   * exatamente o defeito que este bloco existe para eliminar.
   */
  const prefereMovimentoReduzido = useMovimentoReduzido()
  const animar = animated && !prefereMovimentoReduzido

  return (
    <div
      className={`crystal-3d ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, DISTANCIA_CAMERA], fov: 45 }}
        /* Parado, renderiza um frame e dorme: 0% de GPU em repouso. */
        frameloop={animar ? 'always' : 'demand'}
        /* Clampa o pixel ratio: evita renderizar 3x ou 4x pixels em telas
           Retina, o que é puro desperdício num objeto translúcido e difuso. */
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        {/* AMBIENTE PROCEDURAL, montado na GPU.
         *
         * A produção usa <Environment preset="city" />, que baixa um .hdr de
         * raw.githubusercontent.com no instante em que o componente monta:
         * medi ~3,3s de travamento, e é uma dependência de rede externa em
         * runtime — offline, ou com o GitHub bloqueado, o cristal não
         * renderiza.
         *
         * Estes Lightformers dão ao material `transmission` o que ele precisa
         * (algo para refletir e refratar) sem buscar nada. O reflexo não é
         * pixel a pixel o mesmo do HDR de cidade, mas a leitura é a mesma:
         * uma fonte ampla e clara em cima, e dois realces coloridos nas
         * laterais. */}
        <Environment resolution={128}>
          {/* A fonte ampla continua branca — é a luz principal, não identidade.
              Os DOIS realces laterais seguem o acento do preset: o material tem
              transmission 1.0, então é por eles que a cor do sistema entra no
              cristal. Sem isso ele ficaria roxo com o resto da interface já
              âmbar ou verde, e o cristal é a marca — seria o roxo mais visível
              que sobrou. */}
          <Lightformer intensity={2.4} position={[0, 4, -9]} scale={[12, 12, 1]} color="#ffffff" />
          <Lightformer intensity={1.6} position={[-6, 1, 2]} scale={[10, 3, 1]} color={luzEsquerda} />
          <Lightformer intensity={1.1} position={[6, -2, 2]} scale={[10, 3, 1]} color={luzDireita} />
        </Environment>

        <ambientLight intensity={0.6} />
        <spotLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, -5, 5]} intensity={1} color={luzPonto} />

        {/* O <Float> fica SEMPRE na arvore, mesmo parado.
         *
         * Antes ele so era montado quando `animated`, e alternar a prop
         * mudava a estrutura do JSX: o mesh desmontava e remontava, obrigando
         * o three a recompilar o material de transmissao. Isso aparecia como
         * um frame de meio segundo exatamente quando a tela de bloqueio
         * comecava a subir — o pior momento possivel.
         *
         * Com frameloop="demand" o useFrame do Float simplesmente nao roda,
         * entao manter o componente montado custa nada e a arvore fica
         * estavel entre os dois estados. */}
        <Float
          speed={animar ? 2 : 0}
          rotationIntensity={0}
          floatIntensity={animar ? 1 : 0}
        >
          <CrystalMesh animated={animar} spin={spin} corpo={corpo} />
        </Float>

        {sparkles && (
          <Sparkles
            count={40}
            scale={3}
            size={3}
            /* Parado, speed=0: com frameloop="demand" um valor maior só
               congelaria no primeiro instante da animação, sem ganho. */
            speed={animar ? 0.5 : 0}
            opacity={0.6}
            color="#d8b4fe"
          />
        )}
      </Canvas>
    </div>
  )
}

export default Crystal
