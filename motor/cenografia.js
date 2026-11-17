// Blocos de cenário no estilo do guia (seções 5.2 e 6):
//  - cenário usa toon de 5 faixas, sem contorno, sem rim
//  - textura = variação de cor POR PEÇA (tábua, lajota, tufo), nunca grão fino
//  - natureza e pedras em low-poly com faces chapadas
// Tudo com semente fixa: o mesmo cenário sai sempre igual.

import * as THREE from 'three';
import { GRADIENTE_5, materialToon } from './toon.js';

export function aleatorio(semente) {
  const x = Math.sin(semente * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Varia a luminosidade de uma cor em ±fator (guia: ±5% por peça).
export function variarCor(hex, semente, fator = 0.05) {
  const c = new THREE.Color(hex);
  const hsl = {};
  c.getHSL(hsl, THREE.SRGBColorSpace);
  hsl.l = THREE.MathUtils.clamp(hsl.l * (1 + (aleatorio(semente) * 2 - 1) * fator), 0, 1);
  hsl.h = (hsl.h + (aleatorio(semente * 1.7) * 2 - 1) * (3 / 360) + 1) % 1;
  return '#' + new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l, THREE.SRGBColorSpace).getHexString(THREE.SRGBColorSpace);
}

// Material de cenário (5 faixas, sem rim). flat = faces chapadas (low-poly).
const cacheMat = new Map();
export function matCenario(cor, { flat = false, emissivo = null, mapa = null, dupla = false } = {}) {
  const chave = `${cor}|${flat}|${emissivo}|${mapa ? mapa.uuid : ''}|${dupla}`;
  if (cacheMat.has(chave)) return cacheMat.get(chave);
  // (MeshToonMaterial não tem flatShading: o low-poly vem das normais chapadas, ver malha())
  const m = new THREE.MeshToonMaterial({ color: cor, gradientMap: GRADIENTE_5, map: mapa || null });
  if (emissivo) { m.emissive = new THREE.Color(emissivo); m.emissiveIntensity = 1; }
  if (dupla) m.side = THREE.DoubleSide;
  cacheMat.set(chave, m);
  return m;
}

// Malha de cenário pronta (recebe e projeta sombra).
export function malha(geo, cor, opcoes = {}) {
  if (opcoes.flat) geo = facetar(geo);
  const m = new THREE.Mesh(geo, opcoes.material || matCenario(cor, opcoes));
  m.castShadow = opcoes.projeta !== false;
  m.receiveShadow = opcoes.recebe !== false;
  if (opcoes.nome) m.name = opcoes.nome;
  return m;
}

// Normais chapadas por face (visual low-poly).
export function facetar(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  g.deleteAttribute('normal');
  g.computeVertexNormals();
  return g;
}

// Material só de cor, sem luz (vidros acesos, núcleos de luz).
export function matEmissivo(cor) {
  return new THREE.MeshBasicMaterial({ color: cor, toneMapped: false });
}

// ---------------- Texturas por peça (canvas)

function texturaCanvas(w, h, desenhar, repetir = [1, 1]) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  desenhar(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repetir[0], repetir[1]);
  t.anisotropy = 4;
  return t;
}

// Tábuas: faixas com variação ±5%, juntas escuras, emendas desencontradas, 1 em 5 mais clara.
export function texturaTabuas({ cor, corClara = null, junta, tabuas = 8, emendas = 2, semente = 1, repetir = [1, 1] }) {
  return texturaCanvas(512, 512, (g, w, h) => {
    const larg = h / tabuas;
    const esp = Math.max(2, larg * 0.06);
    g.fillStyle = junta;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < tabuas; i++) {
      const desloc = aleatorio(semente + i * 3.3) * w;
      for (let k = -1; k < emendas; k++) {
        const x0 = desloc + (k * w) / emendas, x1 = x0 + w / emendas;
        const s = semente + i * 17 + k * 5;
        const base = corClara && aleatorio(s * 2.1) < 0.2 ? corClara : cor;
        g.fillStyle = variarCor(base, s);
        g.fillRect(x0 + esp / 2, i * larg + esp / 2, x1 - x0 - esp, larg - esp);
        // repete na borda para emendar sem costura
        g.fillRect(x0 + esp / 2 - w, i * larg + esp / 2, x1 - x0 - esp, larg - esp);
      }
    }
  }, repetir);
}

// Tijolos/pedras: fiadas desencontradas (guia 6).
export function texturaTijolos({ cor, corClara, junta, fiadas = 8, porFiada = 4, semente = 1, repetir = [1, 1] }) {
  return texturaCanvas(512, 512, (g, w, h) => {
    const alt = h / fiadas, larg = w / porFiada, esp = alt * 0.08;
    g.fillStyle = junta;
    g.fillRect(0, 0, w, h);
    for (let j = 0; j < fiadas; j++) {
      const off = (j % 2) * larg / 2;
      for (let i = -1; i <= porFiada; i++) {
        const s = semente + j * 31 + i * 7;
        g.fillStyle = variarCor(aleatorio(s * 1.3) < 1 / 6 ? corClara : cor, s);
        g.fillRect(i * larg + off + esp / 2, j * alt + esp / 2, larg - esp, alt - esp);
      }
    }
  }, repetir);
}

// Chão natural: manchas grandes e suaves de variação (sem grão).
export function texturaManchas({ cor, cores = [], manchas = 40, semente = 1, repetir = [1, 1] }) {
  return texturaCanvas(512, 512, (g, w, h) => {
    g.fillStyle = cor;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < manchas; i++) {
      const s = semente + i * 13;
      const x = aleatorio(s) * w, y = aleatorio(s * 1.9) * h, r = 30 + aleatorio(s * 2.7) * 90;
      const c = cores.length ? cores[i % cores.length] : variarCor(cor, s, 0.08);
      for (const [dx, dy] of [[0, 0], [-w, 0], [w, 0], [0, -h], [0, h]]) {
        const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
        gr.addColorStop(0, c + 'aa');
        gr.addColorStop(0.7, c + '55');
        gr.addColorStop(1, c + '00');
        g.fillStyle = gr;
        g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
      }
    }
  }, repetir);
}

// ---------------- Natureza low-poly

// Esfera low-poly "amassada" (copa, arbusto, pedra), com semente.
export function geoAmassada(raio, semente, detalhe = 1, amassar = 0.18) {
  const g = new THREE.IcosahedronGeometry(raio, detalhe);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  // mesmos vértices recebem o mesmo deslocamento (a geometria não é indexada)
  const chave = (x, y, z) => `${x.toFixed(3)}|${y.toFixed(3)}|${z.toFixed(3)}`;
  const desloc = new Map();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const k = chave(v.x, v.y, v.z);
    if (!desloc.has(k)) desloc.set(k, 1 + (aleatorio(semente + desloc.size * 1.37) * 2 - 1) * amassar);
    v.multiplyScalar(desloc.get(k));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

export function criarPedra(tamanho = 0.6, semente = 1, cor = '#414858') {
  const m = malha(geoAmassada(tamanho, semente, 0, 0.3), variarCor(cor, semente, 0.08), { flat: true });
  m.scale.y = 0.6 + aleatorio(semente * 3.1) * 0.3;
  m.rotation.y = aleatorio(semente * 5.3) * Math.PI;
  return m;
}

// Árvore: tronco afinando + 3–5 blocos de copa low-poly em tons de folha.
export function criarArvore({ altura = 9, raioCopa = 2.4, semente = 1, cores = ['#1e3a2c', '#2e5a3a', '#4b8048'], tronco = '#4b3122' } = {}) {
  const g = new THREE.Group();
  g.name = 'arvore';
  const altTronco = altura * 0.55;
  const t = malha(new THREE.CylinderGeometry(0.22 * raioCopa / 2.4, 0.42 * raioCopa / 2.4, altTronco, 7), tronco, { flat: true });
  t.position.y = altTronco / 2;
  g.add(t);
  // raízes
  for (let i = 0; i < 3; i++) {
    const r = malha(new THREE.ConeGeometry(0.22, 0.9, 5), tronco, { flat: true });
    const a = (i / 3) * Math.PI * 2 + aleatorio(semente + i);
    r.position.set(Math.cos(a) * 0.38, 0.25, Math.sin(a) * 0.38);
    r.rotation.set(Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1);
    g.add(r);
  }
  const blocos = 3 + Math.floor(aleatorio(semente * 2.3) * 3);
  for (let i = 0; i < blocos; i++) {
    const s = semente * 7 + i * 3.7;
    const r = raioCopa * (0.6 + aleatorio(s) * 0.45);
    const cor = cores[Math.min(cores.length - 1, Math.floor(aleatorio(s * 1.3) * cores.length))];
    const c = malha(geoAmassada(r, s, 1, 0.16), variarCor(cor, s, 0.05), { flat: true });
    const a = aleatorio(s * 2.9) * Math.PI * 2;
    const d = i === 0 ? 0 : raioCopa * 0.55;
    c.position.set(Math.cos(a) * d, altTronco + raioCopa * 0.5 + aleatorio(s * 4.1) * raioCopa * 0.8 + (i === 0 ? raioCopa * 0.35 : 0), Math.sin(a) * d);
    c.scale.y = 0.85;
    g.add(c);
  }
  g.rotation.y = aleatorio(semente * 9.7) * Math.PI * 2;
  return g;
}

export function criarArbusto(tamanho = 1, semente = 1, cores = ['#2e5a3a', '#4b8048']) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const s = semente + i * 2.1;
    const c = malha(geoAmassada(tamanho * (0.55 + aleatorio(s) * 0.3), s, 1, 0.15), variarCor(cores[i % cores.length], s), { flat: true });
    c.position.set((i - 1) * tamanho * 0.55, tamanho * 0.35, (aleatorio(s * 3) - 0.5) * tamanho * 0.4);
    c.scale.y = 0.75;
    g.add(c);
  }
  return g;
}

// Luz de céu padrão (hemisfério).
export function luzesPadrao(cena, { ceu, chao, intensidade = 0.9 }) {
  const h = new THREE.HemisphereLight(ceu, chao, intensidade);
  cena.add(h);
  return h;
}

export { materialToon };
