// Sistema de poses: uma pose é um conjunto de rotações de juntas (nomes do guia 3.4) mais,
// opcionalmente, deslocamento/rotação da raiz, expressão, extras (peças opcionais) e efeito.
//
// Formato:
//   {
//     juntas: { ombroD: [x, y, z], joelhoE: [x, 0, 0], ... },   // radianos, absolutos
//     raiz: { pos: [x, y, z], rot: [x, y, z], ordem: 'XYZ' },    // opcional
//     sombra: [escalaX, escalaZ],                               // opcional (deitado = alongada)
//     expressao: 'determinado',                                 // opcional (sugestão)
//     extras: { indicadorD: true },                             // peças opcionais visíveis
//     efeito: 'poder',                                          // opcional
//   }
// Juntas não citadas voltam ao repouso do modelo.

import * as THREE from 'three';

export function registrarRepouso(personagem) {
  const rep = {};
  for (const [nome, j] of Object.entries(personagem.userData.juntas)) {
    rep[nome] = { rot: j.rotation.clone(), pos: j.position.clone() };
  }
  rep.__raiz = { rot: personagem.rotation.clone(), pos: personagem.position.clone() };
  personagem.userData.repouso = rep;
}

function vetorRepouso(personagem, nome) {
  const r = personagem.userData.repouso[nome].rot;
  return [r.x, r.y, r.z];
}

// Mistura duas poses (t = 0 -> a, t = 1 -> b). Útil para animar entre poses-chave.
export function misturarPoses(personagem, a, b, t) {
  const nomes = new Set([...Object.keys(a.juntas || {}), ...Object.keys(b.juntas || {})]);
  const juntas = {};
  for (const n of nomes) {
    const va = (a.juntas && a.juntas[n]) || vetorRepouso(personagem, n);
    const vb = (b.juntas && b.juntas[n]) || vetorRepouso(personagem, n);
    juntas[n] = va.map((v, i) => v + (vb[i] - v) * t);
  }
  const ra = a.raiz || {}, rb = b.raiz || {};
  const lerp3 = (p, q, d) => (p || d).map((v, i) => v + ((q || d)[i] - v) * t);
  return {
    juntas,
    raiz: { pos: lerp3(ra.pos, rb.pos, [0, 0, 0]), rot: lerp3(ra.rot, rb.rot, [0, 0, 0]), ordem: (t < 0.5 ? ra.ordem : rb.ordem) || 'YXZ' },
    sombra: lerp3(a.sombra, b.sombra, [1, 1]),
    extras: t < 0.5 ? a.extras : b.extras,
  };
}

// Aplica a pose no personagem. "base" é a posição/rotação da raiz no mundo (onde ele está na cena).
export function aplicarPose(personagem, pose, { base = null } = {}) {
  if (!personagem.userData.repouso) registrarRepouso(personagem);
  const rep = personagem.userData.repouso;
  const juntas = personagem.userData.juntas;

  for (const [nome, j] of Object.entries(juntas)) {
    j.rotation.copy(rep[nome].rot);
    j.position.copy(rep[nome].pos);
  }
  for (const [nome, v] of Object.entries(pose.juntas || {})) {
    if (!juntas[nome]) throw new Error(`Junta inexistente na pose: ${nome}`);
    juntas[nome].rotation.set(v[0], v[1], v[2]);
  }

  // Raiz
  const b = base || { pos: rep.__raiz.pos, rotY: rep.__raiz.rot.y };
  personagem.userData.chao = b.pos.y;   // altura do apoio (chão, colchão...) para a sombra
  const r = pose.raiz || {};
  const pos = r.pos || [0, 0, 0];
  personagem.position.set(b.pos.x + pos[0], b.pos.y + pos[1], b.pos.z + pos[2]);
  personagem.rotation.order = r.ordem || 'YXZ';
  const rot = r.rot || [0, 0, 0];
  personagem.rotation.set(rot[0], (b.rotY || 0) + rot[1], rot[2]);

  // Peças opcionais (ex.: dedo indicador)
  const extras = personagem.userData.extras || {};
  for (const [nome, obj] of Object.entries(extras)) obj.visible = !!(pose.extras && pose.extras[nome]);

  atualizarSombra(personagem, pose.sombra || [1, 1]);
}

// A sombra de contato fica sempre deitada no chão, sob o quadril, mesmo com a raiz girada.
const _q = new THREE.Quaternion();
const _deitar = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
const _v = new THREE.Vector3();
export function atualizarSombra(personagem, escala = [1, 1]) {
  const sombra = personagem.getObjectByName('sombra_contato');
  if (!sombra) return;
  personagem.updateWorldMatrix(true, true);
  const quadril = personagem.userData.juntas.quadril;
  quadril.getWorldPosition(_v);
  _v.y = (personagem.userData.chao ?? 0) + 0.02;
  personagem.worldToLocal(_v);
  sombra.position.copy(_v);
  personagem.getWorldQuaternion(_q).invert();
  sombra.quaternion.copy(_q).multiply(_deitar);
  sombra.scale.set(escala[0], escala[1], 1);
}

// Espelha uma pose (lado E <-> D). Usado para alternar passos no ciclo de caminhada.
export function espelharPose(pose) {
  const troca = (n) => n.replace(/E$/, '\u0000').replace(/D$/, 'E').replace('\u0000', 'D');
  const juntas = {};
  for (const [n, v] of Object.entries(pose.juntas || {})) juntas[troca(n)] = [v[0], -v[1], -v[2]];
  const r = pose.raiz || {};
  return {
    ...pose,
    juntas,
    raiz: { ...r, pos: r.pos ? [-r.pos[0], r.pos[1], r.pos[2]] : undefined, rot: r.rot ? [r.rot[0], -r.rot[1], -r.rot[2]] : undefined },
    extras: pose.extras ? Object.fromEntries(Object.entries(pose.extras).map(([k, v]) => [troca(k), v])) : undefined,
  };
}
