// Rosto genérico (guia-de-estilo.md, seção 4): olhos, sobrancelhas e boca colados à superfície
// de uma cabeça elipsoide, com expressões e formas de boca para fala.
//
// Uso:
//   const rosto = criarRosto({ raio: {x,y,z}, centro: new THREE.Vector3(...), ... });
//   cabeca.add(rosto);
//   rosto.userData.definirExpressao('feliz');
//   rosto.userData.definirBoca('aberta');   // fala: fechada | meia | aberta
//   rosto.userData.piscar(0..1);            // 0 = aberto, 1 = fechado

import * as THREE from 'three';
import { peca } from './toon.js';

const GRAU = Math.PI / 180;

// As 8 expressões oficiais (guia 4.2). Só sobrancelha, olho e boca mudam.
//   sob: ângulo da sobrancelha (+ = ponta de dentro para cima) · sobY: deslocamento em C
//   olho: escala vertical · olhoTam: escala geral · olhoForma: 'normal' | 'arco' (fechado feliz)
export const EXPRESSOES = {
  neutro:      { sob: 0,   sobY: 0,      olho: 1.0,  olhoTam: 1.0,  olhoForma: 'normal', boca: 'traco' },
  feliz:       { sob: 8,   sobY: 0.02,   olho: 0.9,  olhoTam: 1.0,  olhoForma: 'normal', boca: 'sorriso' },
  espanto:     { sob: 0,   sobY: 0.06,   olho: 1.0,  olhoTam: 1.35, olhoForma: 'normal', boca: 'o' },
  medo:        { sob: 28,  sobY: 0.04,   olho: 1.0,  olhoTam: 1.2,  olhoForma: 'normal', boca: 'medo' },
  raiva:       { sob: -26, sobY: -0.035, olho: 0.75, olhoTam: 1.0,  olhoForma: 'normal', boca: 'triste' },
  determinado: { sob: -12, sobY: -0.02,  olho: 0.85, olhoTam: 1.0,  olhoForma: 'normal', boca: 'traco_largo' },
  cansado:     { sob: 12,  sobY: -0.035, olho: 0.38, olhoTam: 1.0,  olhoForma: 'normal', boca: 'cansada' },
  rindo:       { sob: 12,  sobY: 0.04,   olho: 1.0,  olhoTam: 1.0,  olhoForma: 'arco',   boca: 'rindo' },
};
export const EXPRESSOES_OFICIAIS = Object.keys(EXPRESSOES);
// Nomes antigos continuam aceitos.
const APELIDOS = { bravo: 'raiva', surpreso: 'espanto' };

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
  cores = { olho: '#110f16', sobrancelha: '#2a1c17', boca: '#110f16', dentes: '#e3d5b3' },
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
  const semContorno = (geo, cor, nome) => peca(geo, cor, { contorno: false, rim: false, sombra: false, nome });

  // Arco de toro: curva > 0 = ponta para baixo (sorriso, ∪); curva < 0 = ponta para cima (∩).
  const arco = (largura, espessura, curva, ang = 0.55 * Math.PI) => {
    const R = (largura / 2) / Math.sin(ang / 2);
    const g = new THREE.TorusGeometry(R, espessura / 2, 8, 24, ang);
    g.rotateZ(curva > 0 ? -Math.PI / 2 - ang / 2 : Math.PI / 2 - ang / 2);
    const prof = R * (1 - Math.cos(ang / 2));
    g.translate(0, curva > 0 ? R - prof / 2 : -R + prof / 2, 0);
    return g;
  };

  // ---- Olhos: forma normal + forma "arco" (fechado sorrindo, para rindo)
  const yOlho = yRel(alturaOlho);
  const geoOlho = olho.forma === 'redondo'
    ? new THREE.SphereGeometry(0.5, 24, 16)
    : new THREE.CapsuleGeometry(0.5, 0.6, 8, 16);
  const olhos = {}, olhosArco = {};
  for (const [lado, sx] of [['E', 1], ['D', -1]]) {
    const s = suporte('olho' + lado, sx * distanciaOlhos / 2, yOlho, -0.004);
    const m = semContorno(geoOlho, cores.olho, 'olho' + lado + '_malha');
    const alturaGeo = olho.forma === 'redondo' ? 1 : 1.6;
    m.userData.base = new THREE.Vector3(olho.largura, olho.altura / alturaGeo, olho.largura * 0.45);
    m.scale.copy(m.userData.base);
    s.add(m);
    olhos[lado] = m;

    const a = semContorno(arco(Math.max(olho.largura * 1.6, 0.1), 0.026, -1, 0.75 * Math.PI), cores.olho, 'olho' + lado + '_arco');
    a.scale.z = 0.6;
    a.visible = false;
    s.add(a);
    olhosArco[lado] = a;
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
  const addForma = (nome, malha) => {
    malha.visible = false;
    sBoca.add(malha);
    formas[nome] = malha;
    return malha;
  };
  const traco = (largura) => { const g = new THREE.CapsuleGeometry(e / 2, largura - e, 4, 10); g.rotateZ(Math.PI / 2); return g; };
  const comZ = (m, z = 0.6) => { m.scale.z = z; return m; };

  addForma('traco', comZ(semContorno(traco(L), cores.boca, 'boca_traco')));
  addForma('fechada', comZ(semContorno(traco(L), cores.boca, 'boca_fechada')));
  addForma('traco_largo', comZ(semContorno(traco(L * 1.15), cores.boca, 'boca_traco_largo')));
  addForma('sorriso', comZ(semContorno(arco(L, e * 1.4, 1), cores.boca, 'boca_sorriso')));
  addForma('triste', comZ(semContorno(arco(L * 0.9, e * 1.4, -1), cores.boca, 'boca_triste')));
  addForma('cansada', comZ(semContorno(arco(L * 0.8, e * 1.2, -1, 0.3 * Math.PI), cores.boca, 'boca_cansada')));

  const elipse = new THREE.SphereGeometry(0.5, 20, 12);
  const addElipse = (nome, sx, sy) => { const m = semContorno(elipse, cores.boca, 'boca_' + nome); m.scale.set(sx, sy, 0.02); addForma(nome, m); };
  addElipse('meia', L * 0.75, L * 0.3);
  addElipse('aberta', L * 0.85, L * 0.6);
  addElipse('o', L * 0.7, L * 0.9);
  addElipse('medo', L * 0.95, L * 0.28);

  // "rindo": boca aberta em D (topo reto, fundo redondo) com faixa de dentes em cima.
  const D = new THREE.Shape();
  const lD = L * 1.25, hD = L * 0.85;
  D.moveTo(-lD / 2, 0);
  D.lineTo(lD / 2, 0);
  D.absellipse(0, 0, lD / 2, hD, 0, -Math.PI, true);
  const rindo = new THREE.Group();
  rindo.name = 'boca_rindo';
  const fundo = semContorno(new THREE.ShapeGeometry(D, 24), cores.boca, 'boca_rindo_fundo');
  fundo.position.set(0, hD * 0.45, 0.009);
  rindo.add(fundo);
  const dentes = semContorno(new THREE.PlaneGeometry(lD * 0.78, hD * 0.22), cores.dentes || '#e3d5b3', 'boca_rindo_dentes');
  dentes.position.set(0, hD * 0.45 - hD * 0.13, 0.011);
  rindo.add(dentes);
  addForma('rindo', rindo);

  let expressaoAtual = 'neutro';
  let piscada = 0;

  const aplicarOlhos = () => {
    const ex = EXPRESSOES[expressaoAtual];
    const arcoAtivo = ex.olhoForma === 'arco';
    for (const lado of ['E', 'D']) {
      const m = olhos[lado];
      m.visible = !arcoAtivo;
      olhosArco[lado].visible = arcoAtivo;
      m.scale.set(m.userData.base.x * ex.olhoTam, m.userData.base.y * ex.olhoTam * ex.olho * (1 - 0.9 * piscada), m.userData.base.z);
    }
  };

  const definirBoca = (forma) => {
    if (!formas[forma]) throw new Error('Forma de boca desconhecida: ' + forma);
    for (const [n, m] of Object.entries(formas)) m.visible = n === forma;
  };

  const definirExpressao = (nome) => {
    nome = APELIDOS[nome] || nome;
    const ex = EXPRESSOES[nome];
    if (!ex) throw new Error(`Expressão fora da ficha: "${nome}". Oficiais: ${EXPRESSOES_OFICIAIS.join(', ')}`);
    expressaoAtual = nome;
    sobrancelhas.E.rotation.z = -ex.sob * GRAU;
    sobrancelhas.D.rotation.z = ex.sob * GRAU;
    sobrancelhas.E.position.y = sobrancelhas.D.position.y = ex.sobY;
    aplicarOlhos();
    definirBoca(ex.boca);
  };

  const piscar = (f) => { piscada = THREE.MathUtils.clamp(f, 0, 1); aplicarOlhos(); };

  rosto.userData = {
    definirExpressao, definirBoca, piscar, olhos, sobrancelhas, formas,
    get expressao() { return expressaoAtual; },
  };
  definirExpressao('neutro');
  return rosto;
}
