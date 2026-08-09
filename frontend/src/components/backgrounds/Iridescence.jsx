// src/components/backgrounds/Iridescence.jsx
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import './Iridescence.css';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function Iridescence({ color = [1, 1, 1], speed = 1.0, amplitude = 0.1, mouseReact = true, isAnimated = true, ...rest }) {
  const ctnDom = useRef(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const lastTime = useRef(0);

  useEffect(() => {
    if (!ctnDom.current) return;
    const ctn = ctnDom.current;
    const renderer = new Renderer();
    const gl = renderer.gl;
    gl.clearColor(1, 1, 1, 1);

    let program;
    let mesh;

    // PERFORMANCE FIX: Cache rect dimensions to avoid Reflow on every mousemove
    let rect = ctn.getBoundingClientRect();

    function resize() {
      // PERFORMANCE FIX: Renderiza a 60% da resolução para reduzir carga na GPU
      // em telas 4k/Retina. O efeito "blur" natural disfarça a baixa resolução.
      const scale = 0.6; 
      renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
      
      // FIX CRÍTICO: Força o canvas a esticar 100% via CSS inline, 
      // independente da resolução interna baixa (0.6).
      // Isso resolve o bug do fundo ficar "pequenininho" no canto.
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';

      if (program) {
        program.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height
        );
      }
      // Update cached rect
      rect = ctn.getBoundingClientRect();

      // FIX: Force render on resize to prevent black screen when paused
      if (mesh) {
        renderer.render({ scene: mesh });
      }
    }
    window.addEventListener('resize', resize, false);
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(...color) },
        uResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        },
        uMouse: { value: new Float32Array([mousePos.current.x, mousePos.current.y]) },
        uAmplitude: { value: amplitude },
        uSpeed: { value: speed }
      }
    });

    mesh = new Mesh(gl, { geometry, program });
    let animateId;

    // PERFORMANCE: teto de FPS.
    //
    // O custo do backdrop-filter das janelas e (custo do blur) x (frames por
    // segundo do fundo): sempre que este canvas redesenha, o navegador refaz o
    // blur de tudo que estiver por cima. Como isto e um gradiente lento, 20fps
    // e visualmente indistinguivel de 60 e custa um terco.
    const INTERVALO_MS = 1000 / 20;
    let ultimoDesenho = 0;

    function update(t) {
      animateId = requestAnimationFrame(update);
      if (!isAnimated) return; // Pausado: nao desenha nada, 0% de GPU

      if (t - ultimoDesenho < INTERVALO_MS) return;
      ultimoDesenho = t;

      program.uniforms.uTime.value = t * 0.001;
      lastTime.current = t * 0.001;
      renderer.render({ scene: mesh });
    }
    animateId = requestAnimationFrame(update);
    // Force one initial render
    renderer.render({ scene: mesh });
    ctn.appendChild(gl.canvas);

    function handleMouseMove(e) {
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      mousePos.current = { x, y };
      program.uniforms.uMouse.value[0] = x;
      program.uniforms.uMouse.value[1] = y;
    }
    if (mouseReact) {
      window.addEventListener('mousemove', handleMouseMove); // Listen on window for smoother drag even outside
    }

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener('resize', resize);
      if (mouseReact) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (ctn.contains(gl.canvas)) {
          ctn.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [color, speed, amplitude, mouseReact, isAnimated]);

  return <div ref={ctnDom} className="iridescence-container" {...rest} />;
}