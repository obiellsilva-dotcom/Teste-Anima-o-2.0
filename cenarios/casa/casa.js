// Cenário "casa": chalé no mundo novo, à noite.
// Luz: janelas acesas + lampião da porta (quentes, dominantes) + luar frio por trás.
// Frente da casa = +Z.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETA as P } from '../../motor/paleta.js';
import { peca, GRADIENTE_5 } from '../../motor/toon.js';
import {
  malha, matCenario, matEmissivo, texturaTabuas, texturaTijolos, texturaManchas,
  criarArvore, criarArbusto, criarPedra, aleatorio, geoAmassada,
} from '../../motor/cenografia.js';
import { texturaHalo } from '../../efeitos/brilho.js';

export const FICHA = {
  nome: 'casa',
  titulo: 'Casa',
  descricao: 'Chalé no mundo novo à noite: janelas acesas, lampião na porta, chaminé com fumaça, cerca e trilha de pedras.',
  cameras: {
    geral: { pos: [6.2, 4.0, 19.5], alvo: [0, 3.9, 0], fov: 48 },
    porta: { pos: [2.4, 2.6, 8.5], alvo: [0, 2.4, 3], fov: 42 },
  },
  marcas: {
    caminho: { pos: [0.7, 0, 7.2], rotY: 0.25 },
    porta: { pos: [0, 0, 4.4], rotY: 0 },
  },
  fundo: { topo: P.ceu_noite, base: P.ceu_alto, lua: { x: 0.22, y: 0.16 }, estrelas: 70 },
  rim: { cor: P.luar, dir: [-1.5, 1.4, -2] },
  vinheta: 0.6,
};

const L = 8, Pf = 6, AP = 4.2, BASE = 0.8;   // largura, profundidade, altura da parede, fundação

function halo(cor, tam, op = 0.6) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaHalo(0.2), color: cor, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.setScalar(tam);
  return s;
}

export function montar(cena) {
  const animados = [];

  // Chão
  const texGrama = texturaManchas({ cor: P.grama, cores: [P.folha, P.folha_escura, P.folha_clara], manchas: 40, semente: 21, repetir: [6, 6] });
  const chao = malha(new THREE.PlaneGeometry(90, 90), '#ffffff', { material: matCenario('#ffffff', { mapa: texGrama }), projeta: false });
  chao.rotation.x = -Math.PI / 2;
  cena.add(chao);

  const casa = new THREE.Group();
  casa.name = 'chale';
  cena.add(casa);

  // Fundação de pedra
  const texPedra = texturaTijolos({ cor: P.pedra, corClara: P.pedra_clara, junta: P.pedra_escura, fiadas: 3, porFiada: 6, semente: 5, repetir: [3, 1] });
  const fund = malha(new THREE.BoxGeometry(L + 0.4, BASE, Pf + 0.4), '#ffffff', { material: matCenario('#ffffff', { mapa: texPedra }) });
  fund.position.y = BASE / 2;
  casa.add(fund);

  // Paredes de tábuas
  const texParede = texturaTabuas({ cor: P.madeira, corClara: P.madeira_clara, junta: P.madeira_escura, tabuas: 9, emendas: 1, semente: 8, repetir: [1, 1] });
  const paredes = malha(new THREE.BoxGeometry(L, AP, Pf), '#ffffff', { material: matCenario('#ffffff', { mapa: texParede }) });
  paredes.position.y = BASE + AP / 2;
  casa.add(paredes);
  for (const [x, z] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const poste = malha(new THREE.BoxGeometry(0.35, AP, 0.35), P.madeira_escura);
    poste.position.set(x * (L / 2), BASE + AP / 2, z * (Pf / 2));
    casa.add(poste);
  }

  // Oitão (triângulo da frente e de trás) + telhado de duas águas
  const ALT_TELHADO = 3.2;
  const tri = new THREE.Shape();
  tri.moveTo(-L / 2, 0); tri.lineTo(L / 2, 0); tri.lineTo(0, ALT_TELHADO); tri.closePath();
  const oitao = malha(new THREE.ExtrudeGeometry(tri, { depth: Pf, bevelEnabled: false }), '#ffffff', { material: matCenario('#ffffff', { mapa: texParede }) });
  oitao.position.set(0, BASE + AP, -Pf / 2);
  casa.add(oitao);
  const incl = Math.atan2(ALT_TELHADO, L / 2);
  const comp = Math.hypot(ALT_TELHADO, L / 2) + 0.9;
  const texTelha = texturaTijolos({ cor: P.telha, corClara: P.telha, junta: '#4a2219', fiadas: 7, porFiada: 8, semente: 9, repetir: [1, 1] });
  for (const lado of [-1, 1]) {
    const agua = malha(new THREE.BoxGeometry(comp, 0.32, Pf + 1.2), '#ffffff', { material: matCenario('#ffffff', { mapa: texTelha }) });
    agua.rotation.z = -lado * incl;
    agua.position.set(lado * (L / 4 + 0.05), BASE + AP + ALT_TELHADO / 2 + 0.2, 0);
    casa.add(agua);
  }
  const cumeeira = malha(new THREE.CylinderGeometry(0.22, 0.22, Pf + 1.3, 8), P.madeira_escura);
  cumeeira.rotation.x = Math.PI / 2;
  cumeeira.position.set(0, BASE + AP + ALT_TELHADO + 0.3, 0);
  casa.add(cumeeira);

  // Chaminé + fumaça
  const chamine = malha(new THREE.BoxGeometry(0.9, 2.6, 0.9), '#ffffff', { material: matCenario('#ffffff', { mapa: texturaTijolos({ cor: P.pedra, corClara: P.pedra_clara, junta: P.pedra_escura, fiadas: 6, porFiada: 2, semente: 12 }) }) });
  chamine.position.set(2.2, BASE + AP + 2.4, -1.2);
  casa.add(chamine);
  for (let i = 0; i < 6; i++) {
    const f = new THREE.Mesh(geoAmassada(0.4, 80 + i, 1, 0.2), new THREE.MeshToonMaterial({ color: P.pedra_clara, transparent: true, opacity: 0.5, gradientMap: GRADIENTE_5 }));
    cena.add(f);
    animados.push((t) => {
      const u = ((t * 0.25 + i / 6) % 1);
      f.position.set(2.2 + u * 1.6 + Math.sin(u * 6 + i) * 0.2, BASE + AP + 3.9 + u * 3.2, -1.2 - u * 0.4);
      f.scale.setScalar(0.6 + u * 1.4);
      f.material.opacity = 0.55 * (1 - u);
    });
  }

  // Porta
  const FZ = Pf / 2;
  const porta = peca(new RoundedBoxGeometry(1.7, 3.0, 0.18, 3, 0.08), P.madeira_escura, { nome: 'porta' });
  porta.position.set(0, BASE + 1.5, FZ + 0.05);
  casa.add(porta);
  for (const y of [0.9, 2.1]) {
    const tira = peca(new RoundedBoxGeometry(1.5, 0.12, 0.06, 1, 0.02), P.metal, { nome: 'dobradica' });
    tira.position.set(0, BASE + y, FZ + 0.16);
    casa.add(tira);
  }
  const macaneta = peca(new THREE.SphereGeometry(0.09, 12, 8), P.ouro, { nome: 'macaneta' });
  macaneta.position.set(0.55, BASE + 1.45, FZ + 0.2);
  casa.add(macaneta);
  const degrau = malha(new RoundedBoxGeometry(2.6, 0.35, 1.1, 2, 0.06), P.pedra_clara);
  degrau.position.set(0, 0.6, FZ + 0.7);
  casa.add(degrau);
  const degrau2 = malha(new RoundedBoxGeometry(3.0, 0.35, 1.0, 2, 0.06), P.pedra);
  degrau2.position.set(0, 0.2, FZ + 1.3);
  casa.add(degrau2);

  // Janelas acesas (frente), com floreira
  const janela = (x, y, z, w, h) => {
    const vidro = new THREE.Mesh(new THREE.PlaneGeometry(w, h), matEmissivo(P.janela_luz));
    vidro.position.set(x, y, z + 0.02);
    casa.add(vidro);
    const b = (bw, bh, bx, by) => { const m = peca(new RoundedBoxGeometry(bw, bh, 0.16, 2, 0.04), P.madeira_escura, { nome: 'moldura' }); m.position.set(x + bx, y + by, z + 0.08); casa.add(m); };
    b(w + 0.3, 0.18, 0, h / 2); b(w + 0.3, 0.18, 0, -h / 2); b(0.18, h + 0.3, -w / 2, 0); b(0.18, h + 0.3, w / 2, 0);
    b(0.1, h, 0, 0); b(w, 0.1, 0, 0);
    const brilho = halo(P.lampada, Math.max(w, h) * 2.6, 0.35);
    brilho.position.set(x, y, z + 0.4);
    casa.add(brilho);
    const luz = new THREE.PointLight(P.janela_luz, 3.5, 9, 1.8);
    luz.position.set(x, y - 0.2, z + 1.2);
    casa.add(luz);
    animados.push((t) => { luz.intensity = 3.5 * (0.94 + 0.06 * Math.sin(t * 7 + x)); });   // tremular de vela
    // floreira
    const caixa = peca(new RoundedBoxGeometry(w + 0.3, 0.35, 0.5, 2, 0.05), P.madeira, { nome: 'floreira' });
    caixa.position.set(x, y - h / 2 - 0.3, z + 0.3);
    casa.add(caixa);
    const cores = [P.cristal, P.ouro, P.tecido_vinho, P.creme];
    for (let i = 0; i < 6; i++) {
      const fl = peca(new THREE.SphereGeometry(0.12, 10, 8), cores[i % 4], { nome: 'flor', sombra: false });
      fl.position.set(x - w / 2 + 0.1 + i * (w - 0.2) / 5, y - h / 2 - 0.05, z + 0.32 + (i % 2) * 0.1);
      casa.add(fl);
    }
    const folhas = criarArbusto(0.35, 70 + x, [P.folha, P.folha_clara]);
    folhas.position.set(x, y - h / 2 - 0.25, z + 0.3);
    casa.add(folhas);
  };
  janela(-2.5, BASE + 2.3, FZ, 1.6, 1.5);
  janela(2.5, BASE + 2.3, FZ, 1.6, 1.5);
  // Janela redonda no oitão
  const redonda = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), matEmissivo(P.janela_luz));
  redonda.position.set(0, BASE + AP + 1.2, FZ + 0.03);
  casa.add(redonda);
  const aro = peca(new THREE.TorusGeometry(0.58, 0.09, 8, 24), P.madeira_escura, { nome: 'aro' });
  aro.position.set(0, BASE + AP + 1.2, FZ + 0.08);
  casa.add(aro);
  const hRed = halo(P.lampada, 2.2, 0.3);
  hRed.position.set(0, BASE + AP + 1.2, FZ + 0.3);
  casa.add(hRed);

  // Lampião ao lado da porta (fonte quente principal)
  const suporte = peca(new RoundedBoxGeometry(0.12, 0.12, 0.6, 1, 0.03), P.metal, { nome: 'suporte' });
  suporte.position.set(1.35, BASE + 3.1, FZ + 0.3);
  casa.add(suporte);
  const lampiao = peca(new RoundedBoxGeometry(0.42, 0.6, 0.42, 2, 0.06), P.metal, { nome: 'lampiao' });
  lampiao.position.set(1.35, BASE + 2.8, FZ + 0.55);
  casa.add(lampiao);
  const chama = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.3), matEmissivo(P.brasa_nucleo));
  chama.position.copy(lampiao.position).add(new THREE.Vector3(0, -0.02, 0.07));
  casa.add(chama);
  const hLamp = halo(P.lampada, 2.8, 0.75);
  hLamp.position.copy(lampiao.position).add(new THREE.Vector3(0, 0, 0.3));
  casa.add(hLamp);
  const luzLamp = new THREE.PointLight(P.lampada, 14, 16, 1.6);
  luzLamp.position.copy(lampiao.position).add(new THREE.Vector3(0, -0.1, 0.5));
  luzLamp.castShadow = true;
  luzLamp.shadow.mapSize.set(1024, 1024);
  luzLamp.shadow.bias = -0.002;
  casa.add(luzLamp);
  animados.push((t) => { const p = 0.95 + 0.05 * Math.sin(t * 9) * Math.sin(t * 3.7); luzLamp.intensity = 14 * p; hLamp.scale.setScalar(2.8 * p); });

  // Trilha de pedras chatas até a porta
  for (let i = 0; i < 9; i++) {
    const z = FZ + 2.3 + i * 1.25;
    const pd = malha(new THREE.CylinderGeometry(0.55 + aleatorio(i) * 0.2, 0.6 + aleatorio(i) * 0.2, 0.12, 7), P.pedra_clara, { flat: true, projeta: false });
    pd.position.set(Math.sin(i * 0.7) * 0.4 + (i % 2 ? 0.35 : -0.35), 0.05, z);
    pd.rotation.y = aleatorio(i * 3) * 3;
    cena.add(pd);
  }

  // Cerca baixa
  for (const lado of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const x = lado * (2.4 + i * 1.6);
      const poste = peca(new RoundedBoxGeometry(0.22, 1.5, 0.22, 2, 0.05), P.madeira, { nome: 'cerca_poste' });
      poste.position.set(x, 0.75, FZ + 4.2);
      cena.add(poste);
    }
    for (const y of [0.55, 1.1]) {
      const trave = peca(new RoundedBoxGeometry(6.6, 0.14, 0.12, 1, 0.04), P.madeira, { nome: 'cerca_trave' });
      trave.position.set(lado * 5.6, y, FZ + 4.2);
      cena.add(trave);
    }
  }

  // Arbustos rente à casa, árvores e pedras
  for (let i = 0; i < 6; i++) {
    const ab = criarArbusto(0.8, 90 + i, [P.folha, P.folha_escura]);
    ab.position.set(-3.6 + i * 1.45 + (i >= 3 ? 1.4 : 0) - (i >= 3 ? 0 : 0.3), 0, FZ + 0.6);
    if (Math.abs(ab.position.x) < 1.6) continue;
    cena.add(ab);
  }
  for (const [x, z, alt, copa, s] of [[-8.5, -2, 11, 3.0, 3], [9, -4, 12, 3.2, 7], [-13, 6, 10, 2.8, 11], [14, 4, 11, 3.0, 13], [-5, -12, 13, 3.4, 17], [6, -14, 13, 3.4, 19]]) {
    const arv = criarArvore({ altura: alt, raioCopa: copa, semente: s, cores: [P.folha_escura, P.folha], tronco: P.madeira_escura });
    arv.position.set(x, 0, z);
    cena.add(arv);
  }
  for (const [x, z] of [[-4.6, 8.5], [5.2, 9.5], [3.4, 5.4]]) {
    const pd = criarPedra(0.5, x * 7 + z, P.pedra);
    pd.position.set(x, 0.1, z);
    cena.add(pd);
  }

  // Vaga-lumes
  for (let i = 0; i < 14; i++) {
    const sp = halo(i % 3 ? P.janela_luz : P.magia, 0.16 + aleatorio(i) * 0.1, 0.9);
    const b = new THREE.Vector3((aleatorio(i * 2) - 0.5) * 16, 0.6 + aleatorio(i * 3) * 3, 3 + aleatorio(i * 4) * 9);
    cena.add(sp);
    animados.push((t) => {
      const a = t * 0.5 + i * 2.1;
      sp.position.set(b.x + Math.cos(a) * 0.5, b.y + Math.sin(a * 1.4) * 0.3, b.z + Math.sin(a) * 0.5);
      sp.material.opacity = 0.5 + 0.5 * Math.sin(t * 2.5 + i);
    });
  }

  // Luzes: luar por trás (frio), céu noturno
  cena.add(new THREE.HemisphereLight('#4d6894', '#1a2420', 0.75));
  const luar = new THREE.DirectionalLight(P.luar, 1.1);
  luar.position.set(-12, 14, -14);
  luar.castShadow = true;
  luar.shadow.mapSize.set(2048, 2048);
  Object.assign(luar.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 60 });
  luar.shadow.bias = -0.001;
  cena.add(luar);
  cena.fog = new THREE.Fog('#1a2740', 20, 60);

  return { atualizar(t) { for (const f of animados) f(t); } };
}
