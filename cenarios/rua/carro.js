// Carro compacto estilo toon (objeto interativo => peças com contorno, guia 5.4).
// Origem no chão, no centro do carro. Frente = +Z. Rodas giram com rodar(distancia).

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETA as P } from '../../motor/paleta.js';
import { peca } from '../../motor/toon.js';
import { matEmissivo } from '../../motor/cenografia.js';

export const MEDIDAS_CARRO = { largura: 3.3, comprimento: 6.2, altura: 3.0, raioRoda: 0.62 };

export function criarCarro({ cor = P.tecido_verde, teto = P.creme } = {}) {
  const { largura: L, comprimento: C, raioRoda: R } = MEDIDAS_CARRO;
  const g = new THREE.Group();
  g.name = 'carro';
  const add = (m) => { m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };

  // Carroceria e cabine
  const corpo = add(peca(new RoundedBoxGeometry(L, 1.25, C, 4, 0.35), cor, { nome: 'carroceria' }));
  corpo.position.y = R + 0.55;
  const capo = add(peca(new RoundedBoxGeometry(L - 0.1, 0.5, 1.9, 3, 0.2), cor, { nome: 'capo' }));
  capo.position.set(0, R + 1.1, C / 2 - 1.05);
  const cabine = add(peca(new RoundedBoxGeometry(L - 0.35, 1.3, 3.1, 4, 0.4), teto, { nome: 'cabine' }));
  cabine.position.set(0, R + 1.75, -0.45);

  // Vidros (escuros, refletindo o céu)
  const vidroCor = P.rodape;
  const vidro = (w, h, x, y, z, ry) => {
    const v = add(peca(new RoundedBoxGeometry(w, h, 0.06, 2, 0.03), vidroCor, { nome: 'vidro', contorno: false }));
    v.position.set(x, y, z);
    v.rotation.y = ry;
  };
  vidro(L - 0.75, 0.85, 0, R + 1.8, -0.45 + 1.57, 0);            // para-brisa
  vidro(L - 0.75, 0.8, 0, R + 1.8, -0.45 - 1.57, 0);             // traseiro
  for (const s of [-1, 1]) {
    vidro(1.2, 0.8, s * ((L - 0.35) / 2 + 0.01), R + 1.8, 0.25, Math.PI / 2);
    vidro(1.2, 0.8, s * ((L - 0.35) / 2 + 0.01), R + 1.8, -1.15, Math.PI / 2);
  }

  // Faróis, lanternas, para-choques, grade
  for (const s of [-1, 1]) {
    const farol = new THREE.Mesh(new THREE.CircleGeometry(0.26, 20), matEmissivo(P.janela_luz));
    farol.position.set(s * (L / 2 - 0.55), R + 0.75, C / 2 + 0.01);
    g.add(farol);
    const lanterna = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.28), matEmissivo(P.brasa_funda));
    lanterna.position.set(s * (L / 2 - 0.5), R + 0.8, -C / 2 - 0.01);
    lanterna.rotation.y = Math.PI;
    g.add(lanterna);
  }
  for (const z of [C / 2 + 0.05, -C / 2 - 0.05]) {
    const pc = add(peca(new RoundedBoxGeometry(L + 0.1, 0.32, 0.3, 2, 0.12), P.metal_claro, { nome: 'parachoque' }));
    pc.position.set(0, R + 0.1, z);
  }
  const grade = add(peca(new RoundedBoxGeometry(1.1, 0.35, 0.06, 2, 0.04), P.metal, { nome: 'grade' }));
  grade.position.set(0, R + 0.6, C / 2 + 0.02);

  // Rodas (pneu + calota), giram em X
  const rodas = [];
  for (const [x, z] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const eixo = new THREE.Group();
    eixo.position.set(x * (L / 2 - 0.15), R, z * (C / 2 - 1.15));
    const pneu = peca(new THREE.CylinderGeometry(R, R, 0.55, 20), P.pedra_escura, { nome: 'pneu' });
    pneu.rotation.z = Math.PI / 2;
    pneu.castShadow = true;
    eixo.add(pneu);
    const calota = peca(new THREE.CylinderGeometry(R * 0.5, R * 0.5, 0.58, 6), P.metal_claro, { nome: 'calota', contorno: false });
    calota.rotation.z = Math.PI / 2;
    eixo.add(calota);
    g.add(eixo);
    rodas.push(eixo);
  }
  g.userData.rodar = (distancia) => { for (const r of rodas) r.rotation.x = distancia / R; };
  return g;
}
