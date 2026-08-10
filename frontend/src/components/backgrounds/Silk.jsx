import { Renderer, Program, Mesh, Color, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'
import { WALLPAPER } from '../../config/system'

/**
 * SILK — o wallpaper do tema escuro.
 *
 * PORTADO DE @react-three/fiber PARA ogl. O shader é o mesmo, byte a byte; o
 * que mudou foi o runtime. Motivo: este componente é importado estaticamente
 * pela cadeia App -> Desktop -> Hills, então o `three` inteiro entrava no
 * caminho crítico e anulava o React.lazy do Crystal — o `three` estava no
 * bundle principal, e o chunk "lazy" só carregava a cola do drei.
 *
 * O Silk não usa câmera, cena, luz nem material: é um quad de tela cheia com um
 * fragment shader. O ogl faz exatamente isso, já era dependência do projeto (o
 * Iridescence usa) e é uma fração do tamanho.
 *
 * MESMA ESTRUTURA DO Iridescence.jsx, de propósito — inclusive a pausa por ref,
 * que existe porque pôr `isAnimated` nas dependências do efeito destruía e
 * reconstruía o contexto WebGL a cada alternância, bem no instante em que a
 * cortina da tela de bloqueio começa a subir.
 */

const hexParaRgbNormalizado = (hex) => {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
}

/**
 * O vertex shader mudou de forma, não de efeito. No three, `position` era vec3
 * (vindo de um planeGeometry 2x2); no ogl, o Triangle fornece `position` e `uv`
 * como vec2. O Triangle é um triângulo de tela cheia cujo uv vai de 0 a 1 ao
 * longo da região visível — exatamente o que o plano 2x2 dava.
 */
const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

/**
 * Fragment shader IDÊNTICO ao da versão three. A única linha acrescentada é a
 * de precisão, que o three injetava sozinho e o ogl exige explícita.
 */
const fragmentShader = `
precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  // Usa gl_FragCoord para noise consistente independente do tamanho da geometria
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`

export default function Silk({
  speed = WALLPAPER.silk.velocidade,
  scale = WALLPAPER.silk.escala,
  color = WALLPAPER.silk.cor,
  noiseIntensity = WALLPAPER.silk.ruido,
  rotation = WALLPAPER.silk.rotacao,
  isAnimated = true,
}) {
  const containerRef = useRef(null)

  // Ver o cabeçalho: a pausa vive numa ref, não nas dependências do efeito.
  const animandoRef = useRef(isAnimated)
  useEffect(() => {
    animandoRef.current = isAnimated
  }, [isAnimated])

  useEffect(() => {
    if (!containerRef.current) return
    const ctn = containerRef.current

    const renderer = new Renderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: false,
    })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)

    let program
    let mesh

    function redimensionar() {
      // Renderiza a uma fração da resolução e estica por CSS. Como o efeito é
      // de fumaça, a perda de nitidez é imperceptível — e derruba muito o custo
      // em monitor 4K ou de alta taxa de atualização.
      const f = WALLPAPER.silk.dpr
      renderer.setSize(ctn.offsetWidth * f, ctn.offsetHeight * f)
      gl.canvas.style.width = '100%'
      gl.canvas.style.height = '100%'
      // Explícito, não por acidente: o canvas é inline por padrão, e o vão de
      // descender de um inline só não aparece aqui porque `.marocos-wallpaper`
      // tem `overflow: hidden`. O Iridescence.css faz o mesmo no irmão.
      gl.canvas.style.display = 'block'
      if (mesh) renderer.render({ scene: mesh })
    }

    window.addEventListener('resize', redimensionar, false)
    redimensionar()

    const geometry = new Triangle(gl)
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uSpeed: { value: speed },
        uScale: { value: scale },
        uNoiseIntensity: { value: noiseIntensity },
        uColor: { value: new Color(...hexParaRgbNormalizado(color)) },
        uRotation: { value: rotation },
        uTime: { value: 0 },
      },
    })

    mesh = new Mesh(gl, { geometry, program })

    /**
     * TETO DE FPS. O custo do backdrop-filter das janelas é (custo do blur) ×
     * (quadros por segundo do fundo): toda vez que este canvas redesenha, o
     * navegador refaz o blur de tudo que estiver por cima. Como isto é um
     * gradiente lento, 20fps é indistinguível de 60 e custa um terço.
     */
    const intervaloMs = 1000 / WALLPAPER.silk.fps

    /**
     * Válvula de segurança para quando a aba volta de segundo plano: o rAF
     * para, `ultimoTempo` fica velho, e sem teto o primeiro quadro receberia
     * um delta gigante e o padrão daria um salto.
     *
     * TEM de ficar bem acima de `intervaloMs`. Um teto igual ao intervalo
     * morde TODO quadro — o portão de fps abaixo garante que o delta nunca é
     * menor que ele — e aí o incremento vira fixo por quadro em vez de
     * proporcional ao tempo real, fazendo a velocidade do padrão variar com a
     * taxa de atualização do monitor e acoplando a arte ao botão de
     * performance (`WALLPAPER.silk.fps` deixaria de ser só sobre custo).
     */
    const dtMaximoS = (intervaloMs * 5) / 1000
    let ultimoDesenho = 0
    let ultimoTempo = 0
    let idAnimacao

    function atualizar(t) {
      idAnimacao = requestAnimationFrame(atualizar)
      if (!animandoRef.current) {
        // Pausado: não desenha nada, 0% de GPU. E zera a referência de tempo,
        // senão o primeiro quadro após despausar receberia um delta enorme e o
        // padrão daria um salto.
        ultimoTempo = t
        return
      }

      if (t - ultimoDesenho < intervaloMs) return
      ultimoDesenho = t

      /**
       * O TEMPO É ACUMULADO, NÃO LIDO DO RELÓGIO ABSOLUTO. A versão r3f fazia
       * `uTime += 0.1 * delta` dentro do useFrame, e a soma dos deltas ao
       * longo do tempo é o tempo decorrido — a 20fps isso dava 0.1 unidade por
       * segundo real, e o mesmo vale aqui: `dtMaximoS` é folgado o bastante
       * (5× o intervalo do teto de fps) para nunca morder em regime, então
       * `Σdt` continua igual ao tempo decorrido. Reproduzir com
       * `uTime = t * 0.0001` daria a mesma velocidade em regime, mas o padrão
       * saltaria ao despausar — porque o relógio andou enquanto o shader
       * estava parado. Acumulando, pausar congela de verdade.
       */
      const dt = Math.min((t - ultimoTempo) / 1000, dtMaximoS)
      ultimoTempo = t
      program.uniforms.uTime.value += 0.1 * dt

      renderer.render({ scene: mesh })
    }

    ultimoTempo = performance.now()
    idAnimacao = requestAnimationFrame(atualizar)
    renderer.render({ scene: mesh })
    ctn.appendChild(gl.canvas)

    return () => {
      cancelAnimationFrame(idAnimacao)
      window.removeEventListener('resize', redimensionar)
      if (ctn.contains(gl.canvas)) ctn.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [color, speed, scale, noiseIntensity, rotation])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
