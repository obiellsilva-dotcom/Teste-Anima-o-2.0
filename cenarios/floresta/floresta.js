// Cenário "floresta": floresta do mundo novo ao amanhecer.
// Luz: sol baixo atrás da cena (quente, dominante, contra-luz) + céu frio.
// Elementos mágicos: cogumelos que brilham em `magia`, vaga-lumes, feixes de luz entre as árvores.

import * as THREE from 'three';
import { PALETA as P } from '../../motor/paleta.js';
import {
  malha, matCenario, texturaManchas, criarArvore, criarArbusto, criarPedra, aleatorio, geoAmassada, variarCor,
} from '../../motor/cenografia.js';
import { texturaHalo } from '../../efeitos/brilho.js';

export const FICHA = {
  nome: 'floresta',
  titulo: 'Floresta',
  descricao: 'Floresta do mundo novo ao amanhecer: sol baixo atrás das árvores, trilha de terra, cogumelos mágicos e vaga-lumes.',
  cameras: {
    geral: { pos: [0.8, 4.2, 14], alvo: [0, 3.4, 0], fov: 50 },
    baixa: { pos: [2.5, 1.2, 8], alvo: [0, 3.2, 0], fov: 46 },
  },
  marcas: {
    centro: { pos: [0, 0, 3.2], rotY: 0.15 },
  },
  fundo: { topo: P.ceu_alto, base: P.ceu_horizonte, sol: { x: 0.42, y: 0.5, cor: P.sol } },
  rim: { cor: P.sol, dir: [-0.6, 0.5, -2] },
  vinheta: 0.5,
};

// Trilha: curva suave que vem da câmera e some no fundo.
const trilhaX = (z) => Math.sin(z * 0.16) * 1.6 + (z < 0 ? z * -0.08 : 0);

export function montar(cena) {
  const animados = [];

  // Chão de grama com manchas grandes
  const texGrama = texturaManchas({ cor: P.grama, cores: [P.folha, P.folha_clara, '#355c30'], manchas: 46, semente: 11, repetir: [5, 5] });
  const chao = malha(new THREE.PlaneGeometry(90, 90), '#ffffff', { material: matCenario('#ffffff', { mapa: texGrama }), projeta: false });
  chao.rotation.x = -Math.PI / 2;
  cena.add(chao);

  // Trilha de terra: faixa de quads seguindo a curva
  const pts = [];
  for (let z = 16; z >= -40; z -= 1) pts.push(new THREE.Vector3(trilhaX(z), 0, z));
  const largura = (z) => 1.7 + (z > 0 ? z * 0.06 : 0);
  const pos = [];
  const idx = [];
  pts.forEach((p, i) => {
    const w = largura(p.z) + Math.sin(i * 1.7) * 0.15;
    pos.push(p.x - w, 0.015, p.z, p.x + w, 0.015, p.z);
    if (i > 0) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  });
  const geoTrilha = new THREE.BufferGeometry();
  geoTrilha.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geoTrilha.setIndex(idx);
  geoTrilha.computeVertexNormals();
  const trilha = malha(geoTrilha, P.terra, { projeta: false });
  cena.add(trilha);
  // Pedrinhas na beira da trilha
  for (let i = 0; i < 22; i++) {
    const z = 12 - i * 2.2;
    const lado = i % 2 ? 1 : -1;
    const pd = criarPedra(0.18 + aleatorio(i * 3) * 0.2, i + 40, P.pedra_clara);
    pd.position.set(trilhaX(z) + lado * (largura(z) + 0.2), 0.05, z + aleatorio(i) * 1.2);
    cena.add(pd);
  }

  // Árvores: fora da trilha, mais densas ao fundo; as da frente emolduram o quadro.
  const lugares = [
    [-5.5, 6, 10, 2.6], [5.8, 7.5, 11, 2.8], [-3.8, -2, 9, 2.3], [4.2, -4, 10, 2.5],
    [-7.5, -8, 12, 3.0], [8, -10, 12, 3.0], [-2.8, -14, 10, 2.4], [3.4, -17, 11, 2.6],
    [-9, -18, 13, 3.2], [10, -21, 12, 3.0], [-5, -24, 12, 2.8], [6.5, -27, 12, 2.8],
    [-12, -2, 12, 3.0], [12, 0, 12, 3.0], [-1.5, -30, 11, 2.6], [1.8, -34, 12, 2.8],
    [-8, 14, 12, 3.2], [9.5, 15, 12, 3.2],
  ];
  lugares.forEach(([x, z, alt, copa], i) => {
    const arv = criarArvore({ altura: alt, raioCopa: copa, semente: 3 + i * 1.9, cores: z < -12 ? [P.folha_escura, P.folha] : [P.folha_escura, P.folha, P.folha_clara], tronco: P.madeira_escura });
    arv.position.set(x, 0, z);
    cena.add(arv);
  });

  // Arbustos e pedras grandes
  for (let i = 0; i < 16; i++) {
    const z = 10 - i * 3;
    const lado = i % 2 ? 1 : -1;
    const ab = criarArbusto(0.8 + aleatorio(i * 5) * 0.7, 60 + i, [P.folha, P.folha_clara]);
    ab.position.set(trilhaX(z) + lado * (3.2 + aleatorio(i * 7) * 3), 0, z + aleatorio(i * 9) * 2);
    cena.add(ab);
  }
  for (const [x, z, t] of [[-3.2, 4.5, 0.9], [3.6, 1.5, 0.7], [-2.6, -6, 1.1]]) {
    const pd = criarPedra(t, x * 10 + z, P.pedra);
    pd.position.set(x, t * 0.25, z);
    cena.add(pd);
  }

  // Cogumelos mágicos (emissivos + halo), em grupinhos
  const grupos = [[-2.6, 5.6], [2.8, 3.6], [-3.0, -1.2], [2.4, -7.5], [-1.9, -11]];
  grupos.forEach(([gx, gz], gi) => {
    for (let k = 0; k < 3; k++) {
      const s = gi * 10 + k;
      const esc = 0.6 + aleatorio(s) * 0.6;
      const cg = new THREE.Group();
      const pe = malha(new THREE.CylinderGeometry(0.06 * esc, 0.09 * esc, 0.45 * esc, 8), P.creme, { projeta: false });
      pe.position.y = 0.22 * esc;
      cg.add(pe);
      const chapeu = new THREE.Mesh(new THREE.SphereGeometry(0.24 * esc, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), matCenario(P.magia_funda, { emissivo: P.magia }));
      chapeu.position.y = 0.42 * esc;
      cg.add(chapeu);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaHalo(0.25), color: P.magia, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.scale.setScalar(1.1 * esc);
      halo.position.y = 0.45 * esc;
      cg.add(halo);
      cg.position.set(gx + (aleatorio(s * 2) - 0.5) * 0.9, 0, gz + (aleatorio(s * 3) - 0.5) * 0.9);
      cena.add(cg);
      animados.push((t) => { halo.material.opacity = 0.4 + 0.2 * Math.sin(t * 2.2 + s); });
    }
  });

  // Feixes de luz do sol entre as árvores (planos aditivos com degradê vertical)
  const cvF = document.createElement('canvas');
  cvF.width = 64; cvF.height = 256;
  const gF = cvF.getContext('2d');
  const grF = gF.createLinearGradient(0, 0, 0, 256);
  grF.addColorStop(0, 'rgba(255,255,255,0)');
  grF.addColorStop(0.3, 'rgba(255,255,255,0.9)');
  grF.addColorStop(1, 'rgba(255,255,255,0)');
  gF.fillStyle = grF;
  gF.fillRect(0, 0, 64, 256);
  const grH = gF.createLinearGradient(0, 0, 64, 0);
  grH.addColorStop(0, 'rgba(0,0,0,1)'); grH.addColorStop(0.5, 'rgba(0,0,0,0)'); grH.addColorStop(1, 'rgba(0,0,0,1)');
  gF.globalCompositeOperation = 'destination-out';
  gF.fillStyle = grH;
  gF.fillRect(0, 0, 64, 256);
  const texF = new THREE.CanvasTexture(cvF);
  for (const [x, z, w, rot, op] of [[-1.5, -6, 1.6, 0.42, 0.22], [1.8, -9, 2.2, 0.38, 0.18], [0.2, -3, 1.1, 0.45, 0.16], [-3.5, -12, 2.6, 0.36, 0.14]]) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w, 16), new THREE.MeshBasicMaterial({
      map: texF, color: P.sol, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false,
    }));
    f.position.set(x, 6.5, z);
    f.rotation.set(0, -0.2, rot);
    cena.add(f);
    animados.push((t) => { f.material.opacity = op * (0.85 + 0.15 * Math.sin(t * 0.9 + x)); });
  }

  // Vaga-lumes (partículas `magia`, órbitas lentas)
  for (let i = 0; i < 34; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaHalo(0.4), color: i % 5 === 0 ? P.janela_luz : P.magia, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    const base = new THREE.Vector3((aleatorio(i) - 0.5) * 12, 0.6 + aleatorio(i * 2) * 4, 8 - aleatorio(i * 3) * 22);
    const tam = 0.12 + aleatorio(i * 4) * 0.12;
    sp.scale.setScalar(tam);
    cena.add(sp);
    animados.push((t) => {
      const a = t * (0.3 + aleatorio(i * 5) * 0.4) + i;
      sp.position.set(base.x + Math.cos(a) * 0.6, base.y + Math.sin(a * 1.3) * 0.35, base.z + Math.sin(a) * 0.6);
      sp.material.opacity = 0.55 + 0.45 * Math.sin(t * 3 + i * 1.7);
    });
  }

  // Luzes: sol baixo atrás (contra-luz quente), céu frio
  cena.add(new THREE.HemisphereLight('#6d8ec4', '#2b3b2a', 1.15));
  const sol = new THREE.DirectionalLight(P.sol, 3.2);
  sol.position.set(-6, 9, -26);
  sol.target.position.set(0, 0, 4);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -16, right: 16, top: 22, bottom: -22, near: 1, far: 70 });
  sol.shadow.bias = -0.0008;
  cena.add(sol, sol.target);
  const frente = new THREE.DirectionalLight('#ffd9b0', 0.6);   // rebatimento suave na frente
  frente.position.set(4, 6, 14);
  cena.add(frente);
  cena.fog = new THREE.Fog('#9c8a86', 16, 55);

  return { atualizar(t) { for (const f of animados) f(t); } };
}
