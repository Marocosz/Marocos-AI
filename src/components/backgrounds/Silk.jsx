import { Canvas, useFrame } from '@react-three/fiber';
import { forwardRef, useRef, useMemo } from 'react';
import { Color } from 'three';

const hexToNormalizedRGB = hex => {
  hex = hex.replace('#', '');
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255
  ];
};

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  // Truque: Ignora a câmera e desenha um quadrado que cobre 100% da tela (Clip Space)
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
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
`;

const SilkPlane = forwardRef(function SilkPlane({ uniforms, isAnimated }, ref) {
  useFrame((_, delta) => {
    if (ref.current?.material?.uniforms && isAnimated) {
       ref.current.material.uniforms.uTime.value += 0.1 * delta;
    }
  });

  return (
    <mesh ref={ref}>
      {/* PlaneGeometry 2x2 cobre o clip space de -1 a 1 */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial 
        uniforms={uniforms} 
        vertexShader={vertexShader} 
        fragmentShader={fragmentShader} 
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
});

const Silk = ({ speed = 1, scale = 2, color = '#121212', noiseIntensity = 0.5, rotation = 0, isAnimated = true }) => {
  const meshRef = useRef();
  const uniforms = useMemo(
    () => ({
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uColor: { value: new Color(...hexToNormalizedRGB(color)) },
      uRotation: { value: rotation },
      uTime: { value: 0 }
    }),
    [speed, scale, noiseIntensity, color, rotation]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas 
        /* PERFORMANCE FIX: 
           dpr={0.6} renderiza o shader com 60% da resolução e estica.
           Reduz drasticamente o uso de GPU em monitores High-Refresh (166Hz) e Full HD/4K.
           Como o efeito é de "fumaça", a perda de nitidez é imperceptível e até desejável.
        */
        dpr={0.6} 
        // PERFORMANCE FIX: Pausa o loop de renderização (0% GPU) se a animação estiver desligada
        frameloop={isAnimated ? "always" : "demand"}
        resize={{ scroll: false }} 
        gl={{ 
          alpha: true, 
          antialias: false, 
          powerPreference: "high-performance",
          stencil: false,
          depth: false
        }} 
      >
        <SilkPlane ref={meshRef} uniforms={uniforms} isAnimated={isAnimated} />
      </Canvas>
    </div>
  );
};

export default Silk;