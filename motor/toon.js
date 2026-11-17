// Materiais e peças no estilo do guia (seção 5):
//  - sombreado toon de 3 faixas (personagens) e 5 faixas (cenário)
//  - borda de luz (rim) colorida, controlada por uniforms compartilhados pela cena
//  - contorno tom-sobre-tom (casco invertido) com espessura constante em pixels
//  - sombra de contato

import * as THREE from 'three';

function criarGradiente(valores) {
  const t = new THREE.DataTexture(new Uint8Array(valores), valores.length, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
}

// O Three.js amostra o gradiente com u = N·L * 0,5 + 0,5 (N·L de -1 a 1).
// 4 texels => limites em N·L = -0,5 / 0 / 0,5. Resultado: luz em N·L > 0,
// meio-tom entre -0,5 e 0, sombra abaixo de -0,5 (guia 5.2).
export const GRADIENTE_3 = criarGradiente([70, 150, 255, 255]);
export const GRADIENTE_5 = criarGradiente([40, 90, 140, 200, 255]);

// Uniforms compartilhados: a cena define de onde vem a contra-luz e de que cor é a borda.
export const RIM = {
  uRimCor: { value: new THREE.Color('#7fa4d9') },
  uRimDir: { value: new THREE.Vector3(1, 1.2, -1.5).normalize() }, // direção (mundo) de onde a luz vem
  uRimForca: { value: 0.85 },
  uRimLimiar: { value: 0.8 }, // maior = borda mais fina
};

// Contorno: espessura em px no quadro final, resolução da tela.
export const CONTORNO = {
  uResolucao: { value: new THREE.Vector2(1080, 1920) },
  uEspessura: { value: 2.0 },
};

const cacheToon = new Map();

export function materialToon(cor, { faixas = 3, rim = true, emissivo = null } = {}) {
  const chave = `${cor}|${faixas}|${rim}|${emissivo}`;
  if (cacheToon.has(chave)) return cacheToon.get(chave);
  const m = new THREE.MeshToonMaterial({
    color: cor,
    gradientMap: faixas === 5 ? GRADIENTE_5 : GRADIENTE_3,
  });
  if (emissivo) { m.emissive = new THREE.Color(emissivo); m.emissiveIntensity = 1; }
  if (rim) {
    m.onBeforeCompile = (s) => {
      Object.assign(s.uniforms, RIM);
      s.fragmentShader = s.fragmentShader
        .replace('#include <common>', `#include <common>
          uniform vec3 uRimCor; uniform vec3 uRimDir; uniform float uRimForca; uniform float uRimLimiar;`)
        .replace('#include <opaque_fragment>', `
          {
            vec3 vista = normalize(vViewPosition);
            float fres = 1.0 - clamp(dot(normal, vista), 0.0, 1.0);
            vec3 dirRim = normalize((viewMatrix * vec4(uRimDir, 0.0)).xyz);
            float lado = smoothstep(-0.05, 0.35, dot(normal, dirRim));
            float borda = smoothstep(uRimLimiar, uRimLimiar + 0.03, fres);
            outgoingLight += uRimCor * borda * lado * uRimForca;
          }
          #include <opaque_fragment>`);
    };
    m.customProgramCacheKey = () => 'toon-rim';
  }
  cacheToon.set(chave, m);
  return m;
}

// Cor do contorno = cor do material x 0,35, calculada em sRGB (como no guia).
function corContorno(cor) {
  const c = new THREE.Color(cor);
  const s = { r: 0, g: 0, b: 0 };
  c.getRGB(s, THREE.SRGBColorSpace);
  return new THREE.Color().setRGB(s.r * 0.35, s.g * 0.35, s.b * 0.35, THREE.SRGBColorSpace);
}

const cacheContorno = new Map();

export function materialContorno(cor) {
  if (cacheContorno.has(cor)) return cacheContorno.get(cor);
  const m = new THREE.ShaderMaterial({
    uniforms: { uCor: { value: corContorno(cor) }, ...CONTORNO },
    vertexShader: /* glsl */`
      uniform vec2 uResolucao;
      uniform float uEspessura;
      void main() {
        vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec3 nv = normalize(normalMatrix * normal);
        vec2 dir = (projectionMatrix * vec4(nv, 0.0)).xy;
        float tam = length(dir);
        if (tam > 1e-5) clip.xy += (dir / tam) * uEspessura * 2.0 / uResolucao * clip.w;
        gl_Position = clip;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uCor;
      void main() {
        gl_FragColor = vec4(uCor, 1.0);
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide,
  });
  cacheContorno.set(cor, m);
  return m;
}

// Peça de personagem/objeto: malha toon + contorno + sombra.
// Use geometrias com normais suaves (esfera, cápsula, torno, caixa arredondada).
export function peca(geometria, cor, { contorno = true, nome = '', rim = true, sombra = true } = {}) {
  const malha = new THREE.Mesh(geometria, materialToon(cor, { rim }));
  malha.name = nome;
  malha.castShadow = sombra;
  if (contorno) {
    const c = new THREE.Mesh(geometria, materialContorno(cor));
    c.name = nome ? nome + '_contorno' : 'contorno';
    malha.add(c);
  }
  return malha;
}

// Pivô (junta) vazio, para montar a árvore do personagem.
export function pivo(nome, pai, x = 0, y = 0, z = 0) {
  const p = new THREE.Group();
  p.name = nome;
  p.position.set(x, y, z);
  if (pai) pai.add(p);
  return p;
}

// Sombra de contato (guia 5.3): elipse #000 60% -> 0%.
let texSombra = null;
export function sombraContato(largura, profundidade = largura * 0.6) {
  if (!texSombra) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const g = cv.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(0,0,0,0.6)');
    r.addColorStop(0.55, 'rgba(0,0,0,0.38)');
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    texSombra = new THREE.CanvasTexture(cv);
  }
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(largura, profundidade),
    new THREE.MeshBasicMaterial({ map: texSombra, transparent: true, depthWrite: false }),
  );
  m.name = 'sombra_contato';
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.003;
  m.renderOrder = -1;
  return m;
}
