// Rosto genérico (guia-de-estilo.md, seção 4): olhos, sobrancelhas e boca colados à superfície
// de uma cabeça elipsoide, com expressões e formas de boca para fala.
//
// Uso:
//   const rosto = criarRosto({ raio: {x,y,z}, centro: new THREE.Vector3(...), ... });
//   cabeca.add(rosto);
//   rosto.userData.definirExpressao('feliz');
//   rosto.userData.definirBoca('aberta');   // fechada | meia | aberta | o | sorriso | traco
//   rosto.userData.piscar(0..1);            // 0 = aberto, 1 = fechado

import * as THREE from 'three';
import { peca } from './toon.js';

const GRAU = Math.PI / 180;

// Tabela do guia (4.2): sobrancelha (ângulo, deslocamento em C), escala Y do olho, boca padrão.
export const EXPRESSOES = {
  neutro:       { sob: 0,   sobY: 0,     olho: 1.0,  boca: 'traco' },
  bravo:        { sob: -22, sobY: -0.03, olho: 0.8,  boca: 'traco_curto' },
  surpreso:     { sob: 0,   sobY: 0.05,  olho: 1.25, boca: 'o' },
  feliz:        { sob: 8,   sobY: 0.02,  olho: 0.9,  boca: 'sorriso' },
  preocupado:   { sob: 20,  sobY: 0.02,  olho: 1.0,  boca: 'triste' },
  determinado:  { sob: -12, sobY: -0.02, olho: 0.9,  boca: 'traco_largo' },
};

export function criarRosto({
  raio = { x: 0.52, y: 0.5, z: 0.51 },     // semi-eixos da cabeça
  centro = new THREE.Vector3(0, 0.5, 0),   // centro da cabeça no espaço do pivô da cabeça
  alturaCabeca = 1.0,                      // C
  olho = { forma: 'pilula', largura: 0.07, altura: 0.11 },
  alturaOlho = 0.55,                       // fração da altura, de cima para baixo
  distanciaOlhos = 0.34,
  sobrancelha = { largura: 0.20, espessura: 0.045, acimaDoOlho: 0.10 },
  boca = { largura: 0.13, espessura: 0.022 },
  alturaBoca = 0.76,
  cores = { olho: '#110f16', sobrancelha: '#2a1c17', boca: '#110f16' },
} = {}) {
  const rosto = new THREE.Group();
  rosto.name = 'rosto';

  // Ponto na superfície do elipsoide (coordenadas relativas ao centro) + normal.
  const superficie = (x, y) => {
    const k = 1 - (x / raio.x) ** 2 - (y / raio.y) ** 2;
    const z = raio.z * Math.sqrt(Math.max(k, 0));
    const n = new THREE.Vector3(x / raio.x ** 2, y / raio.y ** 2, z / raio.z ** 2).normalize();
    return { p: new THREE.Vector3(x, y, z).add(centro), n };
  };
  const yRel = (fracaoDeCima) => alturaCabeca * (0.5 - fracaoDeCima); // relativo ao centro
  const Z = new THREE.Vector3(0, 0, 1);

  // Suporte orientado pela normal: o +Z local aponta para fora da cabeça.
  const suporte = (nome, x, y, recuo = 0) => {
    const { p, n } = superficie(x, y);
    const g = new THREE.Group();
    g.name = nome;
    g.position.copy(p).addScaledVector(n, recuo);
    g.quaternion.setFromUnitVectors(Z, n);
    rosto.add(g);
    return g;
  };

  // ---- Olhos
  const yOlho = yRel(alturaOlho);
  const geoOlho = olho.forma === 'redondo'
    ? new THREE.SphereGeometry(0.5, 24, 16)
    : new THREE.CapsuleGeometry(0.5, 0.6, 8, 16);
  const olhos = {};
  for (const [lado, sx] of [['E', 1], ['D', -1]]) {
    const s = suporte('olho' + lado, sx * distanciaOlhos / 2, yOlho, -0.004);
    const m = peca(geoOlho, cores.olho, { contorno: false, rim: false, sombra: false, nome: 'olho' + lado + '_malha' });
    const alturaGeo = olho.forma === 'redondo' ? 1 : 1.6;
    m.scale.set(olho.largura, olho.altura / alturaGeo, olho.largura * 0.45);
    m.userData.escalaY = m.scale.y;
    s.add(m);
    olhos[lado] = m;
  }

  // ---- Sobrancelhas (barra arredondada horizontal)
  const raioSob = sobrancelha.espessura / 2;
  const geoSob = new THREE.CapsuleGeometry(raioSob, Math.max(sobrancelha.largura - sobrancelha.espessura, 0.001), 6, 12);
  geoSob.rotateZ(Math.PI / 2);
  const sobrancelhas = {};
  for (const [lado, sx] of [['E', 1], ['D', -1]]) {
    const s = suporte('sobrancelha' + lado, sx * distanciaOlhos / 2, yOlho + sobrancelha.acimaDoOlho, -raioSob * 0.35);
    const m = peca(geoSob, cores.sobrancelha, { sombra: false, nome: 'sobrancelha' + lado + '_malha' });
    m.scale.z = 0.6;
    s.add(m);
    sobrancelhas[lado] = m;
  }

  // ---- Boca: várias formas, só uma visível
  const yBoca = yRel(alturaBoca);
  const sBoca = suporte('boca', 0, yBoca, -0.003);
  const L = boca.largura, e = boca.espessura;
  const formas = {};
  const addForma = (nome, geo, ajuste = () => {}) => {
    const m = peca(geo, cores.boca, { contorno: false, rim: false, sombra: false, nome: 'boca_' + nome });
    ajuste(m);
    m.visible = false;
    sBoca.add(m);
    formas[nome] = m;
  };
  const traco = (largura) => { const g = new THREE.CapsuleGeometry(e / 2, largura - e, 4, 10); g.rotateZ(Math.PI / 2); return g; };
  addForma('traco', traco(L), m => (m.scale.z = 0.6));
  addForma('fechada', traco(L), m => (m.scale.z = 0.6));
  addForma('traco_curto', traco(L * 0.8), m => (m.scale.z = 0.6));
  addForma('traco_largo', traco(L * 1.15), m => (m.scale.z = 0.6));
  const arco = (curva) => {
    // Arco de toro centrado embaixo (sorriso) ou em cima (triste).
    const ang = 0.55 * Math.PI;
    const R = (L / 2) / Math.sin(ang / 2);
    const g = new THREE.TorusGeometry(R, e * 0.7, 8, 24, ang);
    g.rotateZ(curva > 0 ? -Math.PI / 2 - ang / 2 : Math.PI / 2 - ang / 2);
    const prof = R * (1 - Math.cos(ang / 2));
    g.translate(0, curva > 0 ? R - prof / 2 : -R + prof / 2, 0);
    return g;
  };
  addForma('sorriso', arco(1), m => (m.scale.z = 0.6));
  addForma('triste', arco(-1), m => (m.scale.z = 0.6));
  const elipse = new THREE.SphereGeometry(0.5, 20, 12);
  addForma('meia', elipse, m => m.scale.set(0.10, 0.04, 0.02));
  addForma('aberta', elipse, m => m.scale.set(0.11, 0.08, 0.02));
  addForma('o', elipse, m => m.scale.set(0.07, 0.09, 0.02));

  let expressaoAtual = 'neutro';
  let piscada = 0;

  const aplicarOlhos = () => {
    const ex = EXPRESSOES[expressaoAtual];
    for (const m of Object.values(olhos)) {
      m.scale.y = m.userData.escalaY * ex.olho * (1 - 0.9 * piscada);
    }
  };

  const definirBoca = (forma) => {
    for (const [n, m] of Object.entries(formas)) m.visible = n === forma;
  };

  const definirExpressao = (nome) => {
    const ex = EXPRESSOES[nome];
    if (!ex) throw new Error('Expressão desconhecida: ' + nome);
    expressaoAtual = nome;
    // Ângulo positivo = ponta de dentro para cima (guia 4.2).
    sobrancelhas.E.rotation.z = -ex.sob * GRAU;
    sobrancelhas.D.rotation.z = ex.sob * GRAU;
    sobrancelhas.E.position.y = sobrancelhas.D.position.y = ex.sobY;
    aplicarOlhos();
    definirBoca(ex.boca);
  };

  const piscar = (f) => { piscada = THREE.MathUtils.clamp(f, 0, 1); aplicarOlhos(); };

  rosto.userData = { definirExpressao, definirBoca, piscar, olhos, sobrancelhas, formas };
  definirExpressao('neutro');
  return rosto;
}
