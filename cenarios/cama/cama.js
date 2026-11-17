// Cenário "cama": close da cama para cenas de dormir/acordar.
// Também exporta os objetos (cama, criado-mudo com abajur) usados no quarto.
//
// Unidade: C (altura da cabeça do personagem). Cama de casal para o senhor (3,93 C de altura).
// Cabeceira em -Z, pé da cama em +Z.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETA as P } from '../../motor/paleta.js';
import { peca } from '../../motor/toon.js';
import { malha, matEmissivo, texturaTabuas, matCenario } from '../../motor/cenografia.js';
import { texturaHalo } from '../../efeitos/brilho.js';

export const MEDIDAS_CAMA = { largura: 3.6, comprimento: 5.4, alturaColchao: 1.45 };

// Cama: objeto interativo (personagem deita nela) => peças com contorno (guia 5.4).
export function criarCama({ cobertor = P.tecido_vinho } = {}) {
  const { largura: L, comprimento: C, alturaColchao: A } = MEDIDAS_CAMA;
  const g = new THREE.Group();
  g.name = 'cama';
  const comSombra = (m) => { m.receiveShadow = true; m.castShadow = true; return m; };

  // Estrutura de madeira
  const estrutura = comSombra(peca(new RoundedBoxGeometry(L, 0.55, C, 3, 0.1), P.madeira, { nome: 'estrutura' }));
  estrutura.position.y = 0.62;
  g.add(estrutura);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const pe = comSombra(peca(new RoundedBoxGeometry(0.32, 0.4, 0.32, 2, 0.06), P.madeira_escura, { nome: 'pe_cama' }));
    pe.position.set(x * (L / 2 - 0.2), 0.2, z * (C / 2 - 0.2));
    g.add(pe);
  }

  // Cabeceira com dois painéis e borda arredondada
  const cabeceira = comSombra(peca(new RoundedBoxGeometry(L + 0.3, 3.1, 0.3, 4, 0.14), P.madeira, { nome: 'cabeceira' }));
  cabeceira.position.set(0, 1.55, -C / 2 - 0.05);
  g.add(cabeceira);
  for (const x of [-0.8, 0.8]) {
    const painel = comSombra(peca(new RoundedBoxGeometry(1.25, 1.5, 0.12, 3, 0.08), P.madeira_escura, { nome: 'painel' }));
    painel.position.set(x, 2.15, -C / 2 + 0.12);
    g.add(painel);
  }
  // Peseira baixa
  const peseira = comSombra(peca(new RoundedBoxGeometry(L + 0.2, 1.3, 0.24, 3, 0.1), P.madeira, { nome: 'peseira' }));
  peseira.position.set(0, 0.95, C / 2 + 0.02);
  g.add(peseira);

  // Colchão (lençol creme)
  const colchao = comSombra(peca(new RoundedBoxGeometry(L - 0.2, 0.6, C - 0.2, 4, 0.2), P.creme, { nome: 'colchao' }));
  colchao.position.y = A - 0.3;
  g.add(colchao);

  // Travesseiros
  for (const x of [-0.85, 0.85]) {
    const t = comSombra(peca(new RoundedBoxGeometry(1.5, 0.42, 0.95, 5, 0.2), P.creme, { nome: 'travesseiro' }));
    t.position.set(x, A + 0.2, -C / 2 + 0.75);
    t.rotation.x = -0.18;
    t.scale.set(1, 1, 1);
    g.add(t);
  }

  // Cobertor dobrado no pé da cama, com faixa de dobra
  const cob = comSombra(peca(new RoundedBoxGeometry(L - 0.05, 0.32, 1.7, 4, 0.14), cobertor, { nome: 'cobertor' }));
  cob.position.set(0, A + 0.1, C / 2 - 1.0);
  g.add(cob);
  const dobra = comSombra(peca(new RoundedBoxGeometry(L, 0.36, 0.5, 4, 0.16), cobertor, { nome: 'cobertor_dobra' }));
  dobra.position.set(0, A + 0.22, C / 2 - 1.75);
  g.add(dobra);

  // Onde o personagem deita (pose "caido" da ficha, cabeça no travesseiro).
  g.userData.marcas = {
    deitado: { pos: [0, A, -0.15], rotY: -Math.PI / 2 },
  };
  return g;
}

// Criado-mudo com abajur aceso (fonte quente do quarto).
export function criarCriadoMudo() {
  const g = new THREE.Group();
  g.name = 'criado_mudo';
  const comSombra = (m) => { m.receiveShadow = true; m.castShadow = true; return m; };
  const corpo = comSombra(peca(new RoundedBoxGeometry(1.5, 1.5, 1.3, 3, 0.08), P.madeira, { nome: 'criado' }));
  corpo.position.y = 0.75;
  g.add(corpo);
  const gaveta = comSombra(peca(new RoundedBoxGeometry(1.25, 0.5, 0.08, 2, 0.04), P.madeira_clara, { nome: 'gaveta' }));
  gaveta.position.set(0, 1.0, 0.66);
  g.add(gaveta);
  const puxador = peca(new THREE.SphereGeometry(0.06, 10, 8), P.ouro, { nome: 'puxador', sombra: false });
  puxador.position.set(0, 1.0, 0.72);
  g.add(puxador);

  // Abajur: base, haste, cúpula (emissiva por dentro), lâmpada
  const base = comSombra(peca(new THREE.CylinderGeometry(0.28, 0.34, 0.12, 20), P.ouro, { nome: 'abajur_base' }));
  base.position.y = 1.56;
  g.add(base);
  const haste = peca(new THREE.CylinderGeometry(0.045, 0.045, 0.8, 10), P.ouro, { nome: 'abajur_haste' });
  haste.position.y = 1.98;
  g.add(haste);
  const cupula = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.55, 0.62, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: P.janela_luz, side: THREE.DoubleSide, toneMapped: false }),
  );
  cupula.position.y = 2.45;
  g.add(cupula);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texturaHalo(0.2), color: P.lampada, transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }));
  halo.scale.setScalar(3.2);
  halo.position.y = 2.4;
  g.add(halo);

  // Despertador (detalhe)
  const relogio = peca(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 20), P.tecido_azul, { nome: 'despertador' });
  relogio.rotation.x = Math.PI / 2;
  relogio.position.set(0.45, 1.72, 0.25);
  g.add(relogio);
  const mostrador = new THREE.Mesh(new THREE.CircleGeometry(0.15, 20), matEmissivo(P.creme));
  mostrador.position.set(0.45, 1.72, 0.315);
  g.add(mostrador);

  g.userData.luz = new THREE.Vector3(0, 2.4, 0); // posição local da lâmpada
  return g;
}

// Luz do abajur: quente, dominante, com sombra.
export function luzAbajur(posMundo, intensidade = 9) {
  const l = new THREE.PointLight(P.lampada, intensidade, 22, 1.6);
  l.position.copy(posMundo);
  l.castShadow = true;
  l.shadow.mapSize.set(1024, 1024);
  l.shadow.bias = -0.002;
  l.shadow.radius = 3;
  return l;
}

// ---------------- Cenário de close
export const FICHA = {
  nome: 'cama',
  titulo: 'Cama',
  descricao: 'Close da cama no quarto à noite. Abajur quente à direita, luar frio pela esquerda.',
  cameras: {
    close: { pos: [4.8, 5.8, 6.4], alvo: [0.5, 1.9, -1.2], fov: 50 },
    travesseiro: { pos: [1.8, 3.2, 1.2], alvo: [0, 1.8, -2.2], fov: 40 },
  },
  marcas: { deitado: { pos: [0, MEDIDAS_CAMA.alturaColchao, -0.15], rotY: -Math.PI / 2 } },
  fundo: { topo: P.rodape, base: P.vazio },
  rim: { cor: P.luar, dir: [-2, 1, -1] },
  vinheta: 0.6,
};

export function montar(cena) {
  const C = MEDIDAS_CAMA.comprimento;
  const piso = malha(new THREE.PlaneGeometry(16, 16), '#ffffff', {
    material: matCenario('#ffffff', { mapa: texturaTabuas({ cor: P.madeira, corClara: P.madeira_clara, junta: P.madeira_escura, tabuas: 10, semente: 4, repetir: [3, 3] }) }),
    projeta: false,
  });
  piso.rotation.x = -Math.PI / 2;
  cena.add(piso);

  const parede = malha(new THREE.PlaneGeometry(16, 9), P.parede_quarto, { projeta: false });
  parede.position.set(0, 4.5, -C / 2 - 0.25);
  cena.add(parede);
  const rodape = malha(new THREE.BoxGeometry(16, 0.35, 0.1), P.rodape);
  rodape.position.set(0, 0.17, -C / 2 - 0.2);
  cena.add(rodape);

  cena.add(criarCama());
  const criado = criarCriadoMudo();
  criado.position.set(2.85, 0, -C / 2 + 0.6);
  cena.add(criado);

  // Quadro na parede (moldura ouro, paisagem simples)
  const moldura = peca(new RoundedBoxGeometry(2.2, 1.5, 0.12, 2, 0.04), P.ouro, { nome: 'moldura' });
  moldura.position.set(-0.2, 5.0, -C / 2 - 0.15);
  cena.add(moldura);
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.2), matCenario(P.folha));
  tela.position.set(-0.2, 5.0, -C / 2 - 0.08);
  cena.add(tela);

  luzesQuarto(cena, criado.position.clone().add(criado.userData.luz));
  return { atualizar() {} };
}

// Luz padrão de quarto à noite (também usada pelo cenário "quarto").
export function luzesQuarto(cena, posAbajur, { luarDe = [-8, 7, 2] } = {}) {
  cena.add(new THREE.HemisphereLight(P.luar, P.rodape, 0.55));
  cena.add(luzAbajur(posAbajur));
  const luar = new THREE.DirectionalLight(P.luar, 0.9);
  luar.position.set(...luarDe);
  luar.castShadow = true;
  luar.shadow.mapSize.set(2048, 2048);
  Object.assign(luar.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 0.5, far: 40 });
  luar.shadow.bias = -0.001;
  cena.add(luar);
  cena.fog = new THREE.Fog(P.vazio, 18, 40);
}
