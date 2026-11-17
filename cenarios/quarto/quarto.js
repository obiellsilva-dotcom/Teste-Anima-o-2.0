// Cenário "quarto": o quarto do senhor à noite (mundo antigo, antes de acordar no mundo novo).
// Cenário cortado: só piso, parede do fundo (-Z) e parede esquerda (-X) existem.
// Luz: abajur quente (dominante) + luar frio entrando pela janela da esquerda.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETA as P } from '../../motor/paleta.js';
import { peca } from '../../motor/toon.js';
import { malha, matCenario, matEmissivo, texturaTabuas, criarArbusto, aleatorio } from '../../motor/cenografia.js';
import { texturaHalo } from '../../efeitos/brilho.js';
import { criarCama, criarCriadoMudo, luzesQuarto, MEDIDAS_CAMA } from '../cama/cama.js';

const LX = 7, LZ = 6, ALT = 7.5;          // meia largura, meia profundidade, pé-direito
const CAMA = { x: 0.2, z: -LZ + MEDIDAS_CAMA.comprimento / 2 + 0.3 };

export const FICHA = {
  nome: 'quarto',
  titulo: 'Quarto',
  descricao: 'Quarto do senhor à noite: cama de casal, criado-mudo com abajur, janela com luar, guarda-roupa.',
  cameras: {
    geral: { pos: [3.2, 6.6, 11.5], alvo: [-1.3, 2.6, -2.4], fov: 52 },
    janela: { pos: [3.5, 4.2, 7], alvo: [-6, 3.4, 0.6], fov: 44 },
  },
  marcas: {
    centro: { pos: [-1.6, 0, 1.4], rotY: 0.25 },
    deitado: { pos: [CAMA.x, MEDIDAS_CAMA.alturaColchao, CAMA.z - 0.15], rotY: -Math.PI / 2 },
  },
  fundo: { topo: P.rodape, base: P.vazio },
  rim: { cor: P.luar, dir: [-2, 1.2, 0.5] },
  vinheta: 0.58,
};

export function montar(cena) {
  // Piso de tábuas
  const piso = malha(new THREE.PlaneGeometry(LX * 2, LZ * 2), '#ffffff', {
    material: matCenario('#ffffff', { mapa: texturaTabuas({ cor: P.madeira, corClara: P.madeira_clara, junta: P.madeira_escura, tabuas: 10, semente: 3, repetir: [2.2, 2.2] }) }),
    projeta: false,
  });
  piso.rotation.x = -Math.PI / 2;
  cena.add(piso);

  // Paredes (fundo e esquerda) + rodapé
  const fundo = malha(new THREE.PlaneGeometry(LX * 2, ALT), P.parede_quarto, { projeta: false });
  fundo.position.set(0, ALT / 2, -LZ);
  cena.add(fundo);
  const esquerda = malha(new THREE.PlaneGeometry(LZ * 2, ALT), P.parede_quarto, { projeta: false });
  esquerda.rotation.y = Math.PI / 2;
  esquerda.position.set(-LX, ALT / 2, 0);
  cena.add(esquerda);
  const rodFundo = malha(new THREE.BoxGeometry(LX * 2, 0.4, 0.12), P.rodape);
  rodFundo.position.set(0, 0.2, -LZ + 0.06);
  cena.add(rodFundo);
  const rodEsq = malha(new THREE.BoxGeometry(0.12, 0.4, LZ * 2), P.rodape);
  rodEsq.position.set(-LX + 0.06, 0.2, 0);
  cena.add(rodEsq);

  // Cama e criado-mudo
  const cama = criarCama();
  cama.position.set(CAMA.x, 0, CAMA.z);
  cena.add(cama);
  const criado = criarCriadoMudo();
  criado.position.set(CAMA.x + 2.95, 0, -LZ + 0.75);
  cena.add(criado);

  // Quadro sobre a cama
  const moldura = peca(new RoundedBoxGeometry(2.4, 1.6, 0.12, 2, 0.04), P.ouro, { nome: 'moldura' });
  moldura.position.set(CAMA.x, 5.0, -LZ + 0.08);
  cena.add(moldura);
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.3), matCenario(P.folha));
  tela.position.set(CAMA.x, 5.0, -LZ + 0.15);
  cena.add(tela);
  const montanha = new THREE.Mesh(new THREE.CircleGeometry(0.55, 3), matCenario(P.folha_clara));
  montanha.position.set(CAMA.x - 0.2, 4.75, -LZ + 0.16);
  montanha.rotation.z = Math.PI / 2;
  cena.add(montanha);

  // Janela na parede esquerda: moldura, vidro noturno, lua, cortinas
  const JZ = 0.9, JY = 3.8, JW = 2.8, JH = 3.0;
  const vidro = new THREE.Mesh(new THREE.PlaneGeometry(JW, JH), matEmissivo(P.ceu_alto));
  vidro.rotation.y = Math.PI / 2;
  vidro.position.set(-LX + 0.03, JY, JZ);
  cena.add(vidro);
  const lua = new THREE.Mesh(new THREE.CircleGeometry(0.32, 24), matEmissivo('#eef3ff'));
  lua.rotation.y = Math.PI / 2;
  lua.position.set(-LX + 0.05, JY + 0.7, JZ - 0.6);
  cena.add(lua);
  const haloLua = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaHalo(0.2), color: P.luar, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  haloLua.scale.setScalar(1.6);
  haloLua.position.copy(lua.position).add(new THREE.Vector3(0.05, 0, 0));
  cena.add(haloLua);
  const barra = (w, h, d, x, y, z) => { const b = peca(new RoundedBoxGeometry(w, h, d, 2, 0.04), P.madeira_escura, { nome: 'janela_moldura' }); b.position.set(x, y, z); cena.add(b); };
  barra(0.2, JH + 0.3, 0.2, -LX + 0.1, JY, JZ - JW / 2);
  barra(0.2, JH + 0.3, 0.2, -LX + 0.1, JY, JZ + JW / 2);
  barra(0.2, 0.2, JW + 0.2, -LX + 0.1, JY + JH / 2, JZ);
  barra(0.32, 0.2, JW + 0.5, -LX + 0.16, JY - JH / 2, JZ);   // peitoril
  barra(0.12, JH, 0.12, -LX + 0.08, JY, JZ);
  barra(0.12, 0.12, JW, -LX + 0.08, JY, JZ);
  for (const lado of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const dobra = peca(new THREE.CapsuleGeometry(0.2, JH + 0.6, 6, 12), P.tecido_vinho, { nome: 'cortina' });
      dobra.position.set(-LX + 0.35, JY + 0.1, JZ + lado * (JW / 2 + 0.2 + i * 0.3));
      cena.add(dobra);
    }
  }
  const varao = peca(new THREE.CylinderGeometry(0.05, 0.05, JW + 2.4, 10), P.ouro, { nome: 'varao' });
  varao.rotation.x = Math.PI / 2;
  varao.position.set(-LX + 0.35, JY + JH / 2 + 0.5, JZ);
  cena.add(varao);
  // Mancha de luar no chão (luz falsa aditiva, formato da janela projetada)
  const forma = new THREE.Shape();
  forma.moveTo(0, -JW / 2); forma.lineTo(0, JW / 2); forma.lineTo(3.6, JW / 2 + 1.0); forma.lineTo(3.6, -JW / 2 + 1.0); forma.closePath();
  const luarChao = new THREE.Mesh(new THREE.ShapeGeometry(forma), new THREE.MeshBasicMaterial({ color: P.luar, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
  luarChao.rotation.x = -Math.PI / 2;
  luarChao.position.set(-LX + 0.3, 0.02, JZ);
  cena.add(luarChao);

  // Guarda-roupa (fundo, entre a parede esquerda e a cama)
  const GX = -4.4;
  const guarda = peca(new RoundedBoxGeometry(3.0, 5.8, 1.5, 3, 0.1), P.madeira, { nome: 'guarda_roupa' });
  guarda.position.set(GX, 2.9, -LZ + 0.8);
  guarda.receiveShadow = true;
  cena.add(guarda);
  for (const x of [-0.72, 0.72]) {
    const porta = peca(new RoundedBoxGeometry(1.32, 4.9, 0.08, 2, 0.05), P.madeira_clara, { nome: 'porta' });
    porta.position.set(GX + x, 3.0, -LZ + 1.57);
    porta.receiveShadow = true;
    cena.add(porta);
    const pux = peca(new THREE.SphereGeometry(0.08, 10, 8), P.ouro, { nome: 'puxador' });
    pux.position.set(GX + x * 0.25, 3.0, -LZ + 1.64);
    cena.add(pux);
  }

  // Tapete com borda
  const borda = malha(new RoundedBoxGeometry(4.6, 0.05, 2.8, 2, 0.02), P.creme, { projeta: false });
  borda.position.set(CAMA.x - 0.4, 0.03, 1.9);
  cena.add(borda);
  const tapete = malha(new RoundedBoxGeometry(4.2, 0.06, 2.4, 2, 0.02), P.tecido_azul, { projeta: false });
  tapete.position.set(CAMA.x - 0.4, 0.04, 1.9);
  cena.add(tapete);

  // Chinelos ao lado da cama
  for (const [dx, rz] of [[0, 0.15], [0.42, -0.1]]) {
    const ch = peca(new RoundedBoxGeometry(0.34, 0.14, 0.62, 3, 0.06), P.couro, { nome: 'chinelo' });
    ch.position.set(CAMA.x + 2.2 + dx, 0.08, 0.15);
    ch.rotation.y = rz;
    cena.add(ch);
  }

  // Planta no canto
  const vaso = peca(new THREE.CylinderGeometry(0.55, 0.42, 1.0, 16), P.telha, { nome: 'vaso' });
  vaso.position.set(-LX + 0.9, 0.5, 3.6);
  cena.add(vaso);
  const folhas = criarArbusto(1.0, 5, [P.folha, P.folha_clara]);
  folhas.position.set(-LX + 0.9, 1.0, 3.6);
  folhas.scale.setScalar(1.1);
  cena.add(folhas);

  // Livros sobre o criado-mudo (blocos de cor)
  const cores = [P.tecido_verde, P.tecido_vinho, P.tecido_azul];
  for (let i = 0; i < 3; i++) {
    const l = peca(new RoundedBoxGeometry(0.55, 0.12, 0.42, 1, 0.02), cores[i], { nome: 'livro' });
    l.position.set(criado.position.x - 0.35, 1.56 + i * 0.12, criado.position.z + 0.2);
    l.rotation.y = (aleatorio(i + 3) - 0.5) * 0.5;
    cena.add(l);
  }

  luzesQuarto(cena, criado.position.clone().add(criado.userData.luz), { luarDe: [-14, 9, 1] });
  return { atualizar() {} };
}
