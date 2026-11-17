// Personagem principal: o senhor (54 anos, acordou milionário depois de anos trabalhando).
// Ficha e decisões de estilo: personagens/senhor.md
//
// Unidade: C = altura da cabeça = 1. Altura total ≈ 4 C (guia, seção 3.1).
// Frente do personagem = +Z. Lado E (esquerdo DELE) = +X (direita de quem olha).
//
// Árvore de juntas (guia 3.4):
//   raiz > quadril > tronco > cabeca > rosto
//                           > ombroE > cotoveloE > maoE   (e D)
//                  > coxaE > joelhoE > peE                (e D)

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETA as P } from '../motor/paleta.js';
import { peca, pivo, sombraContato } from '../motor/toon.js';
import { criarRosto } from '../motor/rosto.js';
import { geometriaCalota, limiteFrenteLadoTras, geometriaTorno, raioNoPerfil } from '../motor/formas.js';

export const FICHA = {
  nome: 'senhor',
  altura: 3.93,           // em C, do chão ao topo do cabelo
  pele: P.pele_2,
  cabelo: P.cabelo_branco,
  camisa: P.creme,
  calca: P.tecido_azul,
  couro: P.couro_escuro,  // cinto e sapatos
  acento: P.ouro,         // fivela e relógio: o único brilho de "milionário"
};

// Perfil do corpo (raio, y), em forma de ovo: bacia embaixo, barriga larga, ombros = cabeça.
// y = 0 fica 0,06 C acima da junta do quadril.
const PERFIL_CORPO = [
  [0.00, -0.24], [0.34, -0.22], [0.47, -0.12], [0.57, 0.04], [0.645, 0.26], [0.665, 0.50],
  [0.635, 0.76], [0.565, 0.98], [0.51, 1.14], [0.43, 1.30], [0.24, 1.40], [0.00, 1.43],
];
const PROF = 0.82;        // achatamento frente-trás do corpo
const BASE = 0.06;        // origem do perfil acima da junta do quadril
const Y_CINTO = 0.2;      // no perfil

export function criarSenhor({ expressao = 'feliz' } = {}) {
  const raiz = new THREE.Group();
  raiz.name = 'raiz';
  raiz.userData.ficha = FICHA;

  // ---------------- Quadril: cintura da calça + cinto (se move com as pernas)
  const Y_QUADRIL = 1.36;
  const quadril = pivo('quadril', raiz, 0, Y_QUADRIL, 0);

  const calcaCintura = peca(geometriaTorno(PERFIL_CORPO, { ate: Y_CINTO + 0.04, escala: 1.012 }), FICHA.calca, { nome: 'cintura_calca' });
  calcaCintura.position.y = BASE;
  calcaCintura.scale.z = PROF;
  quadril.add(calcaCintura);

  const rCinto = raioNoPerfil(PERFIL_CORPO, Y_CINTO) * 1.035;
  const cinto = peca(new THREE.TorusGeometry(rCinto, 0.042, 10, 48), FICHA.couro, { nome: 'cinto' });
  cinto.rotation.x = Math.PI / 2;
  cinto.scale.set(1, PROF, 1); // após girar, o Y local do toro é a profundidade
  cinto.position.y = BASE + Y_CINTO;
  quadril.add(cinto);

  const fivela = peca(new RoundedBoxGeometry(0.16, 0.12, 0.05, 3, 0.02), FICHA.acento, { nome: 'fivela' });
  fivela.position.set(0, BASE + Y_CINTO, rCinto * PROF + 0.02);
  quadril.add(fivela);

  // ---------------- Pernas retas
  const COXA = 0.56, CANELA = 0.54, R_PERNA = 0.15;
  for (const [lado, sx] of [['E', 1], ['D', -1]]) {
    const coxa = pivo('coxa' + lado, quadril, sx * 0.25, 0, 0);
    const mCoxa = peca(new THREE.CapsuleGeometry(R_PERNA, COXA, 8, 20), FICHA.calca, { nome: 'coxa' + lado + '_malha' });
    mCoxa.position.y = -COXA / 2;
    coxa.add(mCoxa);

    const joelho = pivo('joelho' + lado, coxa, 0, -COXA, 0);
    const mCanela = peca(new THREE.CapsuleGeometry(R_PERNA, CANELA, 8, 20), FICHA.calca, { nome: 'canela' + lado + '_malha' });
    mCanela.position.y = -CANELA / 2;
    joelho.add(mCanela);

    // Pé: sapato mais largo que a perna (guia 3.1), bico para a frente. Tornozelo a 0,26 C do chão.
    const pe = pivo('pe' + lado, joelho, 0, -CANELA, 0);
    const sapato = peca(new RoundedBoxGeometry(0.34, 0.24, 0.5, 4, 0.1), FICHA.couro, { nome: 'sapato' + lado });
    sapato.position.set(sx * 0.01, -0.14, 0.07);
    pe.add(sapato);
  }

  // ---------------- Tronco (gira na altura do cinto): camisa, gola, botões
  const tronco = pivo('tronco', quadril, 0, BASE + Y_CINTO, 0);
  const camisa = peca(geometriaTorno(PERFIL_CORPO, { de: Y_CINTO - 0.08 }), FICHA.camisa, { nome: 'camisa' });
  camisa.position.y = -Y_CINTO;
  camisa.scale.z = PROF;
  tronco.add(camisa);
  const yp = (y) => y - Y_CINTO; // converte altura do perfil para o espaço do tronco

  for (const y of [0.55, 0.8, 1.05]) {
    const b = peca(new THREE.SphereGeometry(0.028, 12, 8), FICHA.camisa, { nome: 'botao', sombra: false });
    b.position.set(0, yp(y), raioNoPerfil(PERFIL_CORPO, y) * PROF + 0.005);
    tronco.add(b);
  }

  // ---------------- Braços: manga dobrada no cotovelo, antebraço à mostra, mão em luva
  const BRACO = 0.58, ANTEBRACO = 0.52;
  const juntasBraco = {};
  for (const [lado, sx] of [['E', 1], ['D', -1]]) {
    const ombro = pivo('ombro' + lado, tronco, sx * 0.49, yp(1.13), 0);
    ombro.add(peca(new THREE.SphereGeometry(0.15, 24, 16), FICHA.camisa, { nome: 'ombro' + lado + '_malha' }));

    const mBraco = peca(new THREE.CapsuleGeometry(0.128, BRACO - 0.1, 8, 20), FICHA.camisa, { nome: 'braco' + lado });
    mBraco.position.y = -BRACO / 2;
    ombro.add(mBraco);

    const cotovelo = pivo('cotovelo' + lado, ombro, 0, -BRACO, 0);
    const dobra = peca(new THREE.TorusGeometry(0.118, 0.046, 10, 24), FICHA.camisa, { nome: 'dobra_manga' + lado });
    dobra.rotation.x = Math.PI / 2;
    dobra.position.y = 0.02;
    cotovelo.add(dobra);

    const mAnte = peca(new THREE.CapsuleGeometry(0.1, ANTEBRACO - 0.1, 8, 20), FICHA.pele, { nome: 'antebraco' + lado });
    mAnte.position.y = -ANTEBRACO / 2;
    cotovelo.add(mAnte);

    const mao = pivo('mao' + lado, cotovelo, 0, -ANTEBRACO, 0);
    const mMao = peca(new THREE.SphereGeometry(0.14, 24, 16), FICHA.pele, { nome: 'mao' + lado + '_malha' });
    mMao.scale.set(0.95, 1.05, 0.9);
    mMao.position.y = -0.09;
    mao.add(mMao);

    juntasBraco[lado] = { ombro, cotovelo };
  }

  // Relógio de ouro no pulso esquerdo.
  const relogio = peca(new THREE.TorusGeometry(0.105, 0.03, 8, 24), FICHA.acento, { nome: 'relogio' });
  relogio.rotation.x = Math.PI / 2;
  relogio.position.y = -ANTEBRACO + 0.07;
  juntasBraco.E.cotovelo.add(relogio);

  // Pose de repouso: braços afastados pela barriga, cotovelo levemente dobrado.
  for (const [lado, sx] of [['E', 1], ['D', -1]]) {
    juntasBraco[lado].ombro.rotation.z = sx * 0.36;
    juntasBraco[lado].cotovelo.rotation.z = -sx * 0.18;
    juntasBraco[lado].cotovelo.rotation.x = -0.12;
  }

  // ---------------- Cabeça
  const RX = 0.53, RY = 0.5, RZ = 0.51;
  const cabeca = pivo('cabeca', tronco, 0, yp(1.42), 0);
  const centroCabeca = new THREE.Vector3(0, RY, 0.02);
  const cranio = peca(new THREE.SphereGeometry(1, 48, 32), FICHA.pele, { nome: 'cranio' });
  cranio.scale.set(RX, RY, RZ);
  cranio.position.copy(centroCabeca);
  cabeca.add(cranio);

  // Orelhas: redondas e medianas, viradas um pouco para a frente.
  for (const [lado, sx] of [['E', 1], ['D', -1]]) {
    const orelha = peca(new THREE.SphereGeometry(1, 24, 16), FICHA.pele, { nome: 'orelha' + lado });
    orelha.scale.set(0.05, 0.125, 0.11);
    orelha.position.set(sx * (RX - 0.01), RY - 0.06, -0.02);
    orelha.rotation.y = sx * 0.45;
    cabeca.add(orelha);
  }

  // Cabelo branco curto: linha de cabelo na testa, acima das orelhas nos lados, nuca atrás.
  const cabelo = peca(geometriaCalota(limiteFrenteLadoTras(1.08, 1.36, 2.2)), FICHA.cabelo, { nome: 'cabelo' });
  cabelo.scale.set(RX + 0.03, RY + 0.035, RZ + 0.03);
  cabelo.position.copy(centroCabeca);
  cabeca.add(cabelo);

  // Rosto: olhos pequenos e redondos, sobrancelhas grossas e brancas (ver ficha).
  const rosto = criarRosto({
    raio: { x: RX, y: RY, z: RZ },
    centro: centroCabeca,
    alturaCabeca: 2 * RY,
    olho: { forma: 'redondo', largura: 0.075, altura: 0.075 },
    alturaOlho: 0.57,
    distanciaOlhos: 0.32,
    sobrancelha: { largura: 0.22, espessura: 0.075, acimaDoOlho: 0.105 },
    boca: { largura: 0.14, espessura: 0.024 },
    alturaBoca: 0.77,
    cores: { olho: P.olho, sobrancelha: FICHA.cabelo, boca: P.olho },
  });
  cabeca.add(rosto);
  rosto.userData.definirExpressao(expressao);

  // ---------------- Sombra de contato (guia 5.3)
  raiz.add(sombraContato(1.5, 0.9));

  // Atalhos para animação: raiz.userData.juntas.cotoveloE.rotation.x = ...
  const juntas = {};
  raiz.traverse(o => { if (o.isGroup && o.name) juntas[o.name] = o; });
  raiz.userData.juntas = juntas;
  raiz.userData.rosto = rosto.userData;
  return raiz;
}

export default criarSenhor;
