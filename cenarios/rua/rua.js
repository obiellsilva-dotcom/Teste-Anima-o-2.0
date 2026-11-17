// Cenário "rua": rua de bairro ao amanhecer (mundo de hoje).
// Luz: sol baixo no fim da rua (quente, dominante, contra-luz) + céu frio. Postes ainda acesos.
// A rua corre ao longo de Z; a câmera "geral" olha para -Z (para o sol).
// Objeto animável: "carro" (rodas giram sozinhas conforme ele anda em Z).

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETA as P } from '../../motor/paleta.js';
import { peca } from '../../motor/toon.js';
import { malha, matCenario, matEmissivo, texturaManchas, texturaTijolos, criarArvore, criarArbusto, aleatorio, variarCor } from '../../motor/cenografia.js';
import { texturaHalo } from '../../efeitos/brilho.js';
import { criarCarro } from './carro.js';

const RUA = 3.8;        // meia largura do asfalto
const CALC = 3.0;       // largura da calçada
const MEIO_FIO = 0.35;  // altura da calçada

export const FICHA = {
  nome: 'rua',
  titulo: 'Rua',
  descricao: 'Rua de bairro ao amanhecer: asfalto com faixa, calçadas, casas, postes acesos, árvores e um carro.',
  cameras: {
    geral: { pos: [-2.2, 4.6, 17], alvo: [0.6, 3.0, 0], fov: 50 },
    lado: { pos: [10.5, 2.6, 1.2], alvo: [0, 2.6, -1.6], fov: 46 },
    frente_esq: { pos: [-5.8, 2.3, -7.5], alvo: [0, 2.1, 0.2], fov: 50 },
    baixa: { pos: [-3.2, 0.7, -5.6], alvo: [0, 3.9, 0.6], fov: 56 },
    aerea: { pos: [3.5, 19, 15], alvo: [0, 0, -2.5], fov: 50 },
    calcada: { pos: [1.2, 3.6, 17.5], alvo: [4.8, 2.4, 6.5], fov: 40 },
  },
  marcas: {
    meio: { pos: [0, 0, 1.6], rotY: Math.PI },          // no meio da rua, de frente para o carro que vem
    meio_frente: { pos: [0, 0, 1.6], rotY: 0.15 },      // no meio da rua, de frente para a câmera
    calcada: { pos: [5.0, MEIO_FIO, 9], rotY: 0.08 },   // na calçada da direita, vindo para a câmera
  },
  fundo: { topo: P.ceu_alto, base: P.ceu_horizonte, sol: { x: 0.52, y: 0.46, cor: P.sol } },
  rim: { cor: P.sol, dir: [0.2, 0.5, -2] },
  vinheta: 0.5,
};

export function montar(cena) {
  const animados = [];

  // Asfalto com manchas e faixa central tracejada
  const texAsfalto = texturaManchas({ cor: P.pedra, cores: [P.pedra_escura, P.pedra_clara, '#323845'], manchas: 30, semente: 31, repetir: [2, 12] });
  const asfalto = malha(new THREE.PlaneGeometry(RUA * 2, 140), '#ffffff', { material: matCenario('#ffffff', { mapa: texAsfalto }), projeta: false });
  asfalto.rotation.x = -Math.PI / 2;
  asfalto.position.z = -40;
  cena.add(asfalto);
  for (let z = 16; z > -100; z -= 4.5) {
    const faixa = malha(new THREE.PlaneGeometry(0.22, 2.2), P.creme, { projeta: false });
    faixa.rotation.x = -Math.PI / 2;
    faixa.position.set(0, 0.012, z);
    cena.add(faixa);
  }

  // Calçadas (lajotas) + meio-fio
  const texCalc = texturaTijolos({ cor: P.pedra_clara, corClara: '#4a5263', junta: P.pedra, fiadas: 4, porFiada: 2, semente: 33, repetir: [1, 40] });
  for (const s of [-1, 1]) {
    const calc = malha(new THREE.BoxGeometry(CALC, MEIO_FIO, 140), '#ffffff', { material: matCenario('#ffffff', { mapa: texCalc }) });
    calc.position.set(s * (RUA + CALC / 2), MEIO_FIO / 2, -40);
    cena.add(calc);
    const fio = malha(new THREE.BoxGeometry(0.25, MEIO_FIO + 0.04, 140), P.pedra_clara);
    fio.position.set(s * (RUA + 0.12), (MEIO_FIO + 0.04) / 2, -40);
    cena.add(fio);
    const grama = malha(new THREE.PlaneGeometry(40, 140), P.grama, { projeta: false });
    grama.rotation.x = -Math.PI / 2;
    grama.position.set(s * (RUA + CALC + 20), MEIO_FIO - 0.01, -40);
    cena.add(grama);
  }

  // Casas dos dois lados (fachada virada para a rua)
  const coresParede = [P.creme, P.madeira_clara, P.parede_quarto, P.pedra_clara, P.tecido_verde, P.couro];
  const X0 = RUA + CALC + 1.2;
  for (const s of [-1, 1]) {
    let z = 18;
    let i = 0;
    while (z > -90) {
      const sem = (s > 0 ? 100 : 200) + i;
      const larg = 6 + aleatorio(sem) * 3.5;
      const alt = 5.5 + aleatorio(sem * 1.3) * 4;
      const prof = 7;
      const cz = z - larg / 2;
      const casa = new THREE.Group();
      const cor = variarCor(coresParede[Math.floor(aleatorio(sem * 2.1) * coresParede.length)], sem);
      const corpo = malha(new THREE.BoxGeometry(prof, alt, larg), cor);
      corpo.position.y = alt / 2 + MEIO_FIO;
      casa.add(corpo);
      // telhado de duas águas (cumeeira ao longo de Z) ou platibanda
      if (aleatorio(sem * 3.3) < 0.65) {
        const tri = new THREE.Shape();
        tri.moveTo(-prof / 2 - 0.4, 0); tri.lineTo(prof / 2 + 0.4, 0); tri.lineTo(0, 2.6); tri.closePath();
        const tel = malha(new THREE.ExtrudeGeometry(tri, { depth: larg + 0.6, bevelEnabled: false }), variarCor(P.telha, sem));
        tel.position.set(0, alt + MEIO_FIO, -larg / 2 - 0.3);
        casa.add(tel);
      } else {
        const plat = malha(new THREE.BoxGeometry(prof + 0.3, 0.5, larg + 0.3), variarCor(P.pedra_clara, sem));
        plat.position.y = alt + MEIO_FIO + 0.25;
        casa.add(plat);
      }
      // janelas e porta na fachada (lado que olha para a rua)
      const fx = -s * (prof / 2 + 0.02);
      const nJan = Math.max(1, Math.floor(larg / 2.6));
      for (let a = 0; a < (alt > 7.5 ? 2 : 1); a++) {
        for (let j = 0; j < nJan; j++) {
          const acesa = aleatorio(sem * 7 + j * 3 + a) < 0.35;
          const jz = -larg / 2 + (j + 0.5) * (larg / nJan);
          const jan = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.5), acesa ? matEmissivo(P.janela_luz) : matCenario(P.rodape));
          jan.rotation.y = -s * Math.PI / 2;
          jan.position.set(fx, MEIO_FIO + 3.2 + a * 3, jz);
          casa.add(jan);
          const mold = malha(new THREE.BoxGeometry(0.12, 1.75, 1.55), P.madeira_escura, { projeta: false });
          mold.position.set(fx + s * 0.04, MEIO_FIO + 3.2 + a * 3, jz);
          casa.add(mold);
          jan.position.x -= s * 0.08;
        }
      }
      const porta = malha(new THREE.BoxGeometry(0.15, 2.8, 1.4), P.madeira_escura);
      porta.position.set(fx, MEIO_FIO + 1.4, larg / 2 - 1.3);
      casa.add(porta);
      casa.position.set(s * (X0 + prof / 2), 0, cz);
      cena.add(casa);
      // árvore ou arbusto na calçada, de vez em quando
      if (aleatorio(sem * 5.1) < 0.55) {
        const arv = criarArvore({ altura: 8 + aleatorio(sem) * 3, raioCopa: 2.0, semente: sem, cores: [P.folha_escura, P.folha, P.folha_clara], tronco: P.madeira_escura });
        arv.position.set(s * (RUA + CALC - 0.7), MEIO_FIO, cz + 1.5);
        cena.add(arv);
      } else {
        const ab = criarArbusto(0.8, sem, [P.folha, P.folha_clara]);
        ab.position.set(s * (X0 - 0.4), MEIO_FIO, cz);
        cena.add(ab);
      }
      z -= larg + 0.6;
      i++;
    }
  }

  // Postes acesos (lado esquerdo), com halo
  for (let z = 12; z > -80; z -= 14) {
    const poste = new THREE.Group();
    const haste = peca(new THREE.CylinderGeometry(0.1, 0.14, 7.5, 10), P.metal, { nome: 'poste' });
    haste.position.y = 3.75;
    poste.add(haste);
    const braco = peca(new THREE.CylinderGeometry(0.07, 0.07, 1.8, 8), P.metal, { nome: 'poste_braco' });
    braco.rotation.z = Math.PI / 2;
    braco.position.set(0.8, 7.4, 0);
    poste.add(braco);
    const lumi = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.4), matEmissivo(P.lampada));
    lumi.position.set(1.6, 7.3, 0);
    poste.add(lumi);
    const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaHalo(0.2), color: P.lampada, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
    h.scale.setScalar(2.6);
    h.position.set(1.6, 7.2, 0);
    poste.add(h);
    poste.position.set(-(RUA + 0.6), MEIO_FIO, z);
    cena.add(poste);
  }

  // Carro (animável pelo roteiro: objetos -> "carro")
  const carro = criarCarro();
  carro.position.set(-2.0, 0, -9);
  cena.add(carro);
  let zAnterior = null;

  // Luzes: sol baixo no fim da rua (contra-luz) + céu frio + rebatimento quente fraco
  cena.add(new THREE.HemisphereLight('#7a95c4', '#3a3530', 1.25));
  const sol = new THREE.DirectionalLight(P.sol, 3.0);
  sol.position.set(4, 8, -30);
  sol.target.position.set(0, 0, 2);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -14, right: 14, top: 22, bottom: -22, near: 1, far: 70 });
  sol.shadow.bias = -0.0008;
  cena.add(sol, sol.target);
  const rebate = new THREE.DirectionalLight('#ffd9b0', 0.7);
  rebate.position.set(-5, 6, 16);
  cena.add(rebate);
  cena.fog = new THREE.Fog('#a3857a', 22, 85);

  return {
    atualizar() {
      // Rodas giram conforme o carro anda em Z (o roteiro só move o carro).
      if (zAnterior === null) zAnterior = carro.position.z;
      carro.userData.rodar(carro.position.z);
    },
  };
}
