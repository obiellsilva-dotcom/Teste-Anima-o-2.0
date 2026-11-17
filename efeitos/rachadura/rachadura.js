// Efeito "rachadura": o chão racha a partir de um ponto, correndo nos dois sentidos de uma direção,
// com galhos, lascas que levantam e poeira na ponta. Guia, seção 8.
//
//   const fx = criarRachadura({ comprimento: 22, angulo: 0 });   // angulo 0 = ao longo de Z
//   fx.position.set(x, alturaDoChao, z); cena.add(fx);
//   const { tremor } = fx.userData.atualizar(t);   // t = segundos desde o início (pode ser < 0)
// Determinístico.

import * as THREE from 'three';
import { PALETA as P } from '../../motor/paleta.js';
import { GRADIENTE_5 } from '../../motor/toon.js';
import { geoAmassada, facetar } from '../../motor/cenografia.js';

function aleatorio(s) { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
const saida = (x) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 2.2);

// Caminho em zigue-zague a partir da origem, numa direção (no plano XZ).
function caminho(dir, comprimento, passo, semente, desvio = 0.35) {
  const pts = [new THREE.Vector2(0, 0)];
  const lado = new THREE.Vector2(-dir.y, dir.x);
  let acum = 0;
  for (let i = 1; acum < comprimento; i++) {
    acum += passo * (0.7 + aleatorio(semente + i) * 0.6);
    const off = (aleatorio(semente + i * 3.3) - 0.5) * 2 * desvio;
    pts.push(dir.clone().multiplyScalar(acum).addScaledVector(lado, off));
  }
  return pts;
}

// Faixa plana sobre o chão (ordem por segmento, para crescer com drawRange).
function faixa(pts, largura0, largura1, y) {
  const pos = [];
  const idx = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, pts.length - 1)];
    const d = b.clone().sub(a).normalize();
    const n = new THREE.Vector2(-d.y, d.x);
    const w = (largura0 + (largura1 - largura0) * (i / (pts.length - 1))) / 2;
    pos.push(pts[i].x + n.x * w, y, pts[i].y + n.y * w, pts[i].x - n.x * w, y, pts[i].y - n.y * w);
    if (i > 0) { const k = (i - 1) * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  g.setIndex(idx);
  return g;
}

export function criarRachadura({ comprimento = 20, angulo = 0, largura = 0.32, duracao = 1.0, galhos = 6, semente = 5, nosDoisSentidos = true } = {}) {
  const g = new THREE.Group();
  g.name = 'efeito_rachadura';
  const matBorda = new THREE.MeshBasicMaterial({ color: P.pedra_clara, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const matFenda = new THREE.MeshBasicMaterial({ color: P.junta, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });

  const trilhas = [];   // { pts, malhas, inicio (s), fim (s) }
  const novaTrilha = (pts, w0, w1, t0, t1) => {
    const borda = new THREE.Mesh(faixa(pts, w0 * 1.9, w1 * 1.9, 0.015), matBorda);
    const fenda = new THREE.Mesh(faixa(pts, w0, w1, 0.02), matFenda);
    borda.renderOrder = 1; fenda.renderOrder = 2;
    g.add(borda, fenda);
    trilhas.push({ pts, malhas: [borda, fenda], t0, t1 });
  };

  const sentidos = nosDoisSentidos ? [1, -1] : [1];
  const principais = [];
  sentidos.forEach((s, k) => {
    const dir = new THREE.Vector2(Math.sin(angulo) * s, Math.cos(angulo) * s);
    const pts = caminho(dir, comprimento * (k ? 0.75 : 1), 0.7, semente + k * 50);
    novaTrilha(pts, largura, largura * 0.15, 0, duracao * (k ? 0.85 : 1));
    principais.push({ pts, t1: duracao * (k ? 0.85 : 1) });
  });

  // Galhos: nascem quando a fenda principal passa pelo ponto
  for (let i = 0; i < galhos; i++) {
    const pr = principais[i % principais.length];
    const j = 2 + Math.floor(aleatorio(semente + i * 7) * (pr.pts.length - 4));
    const origem = pr.pts[j];
    const prox = pr.pts[j + 1].clone().sub(origem).normalize();
    const giro = (aleatorio(semente + i * 11) < 0.5 ? -1 : 1) * (0.5 + aleatorio(semente + i * 13) * 0.6);
    const dir = prox.clone().rotateAround(new THREE.Vector2(), giro);
    const pts = caminho(dir, 1.5 + aleatorio(semente + i * 17) * 2.5, 0.45, semente + i * 31, 0.2).map(p => p.add(origem));
    const tNasce = pr.t1 * saidaInv(j / (pr.pts.length - 1));
    novaTrilha(pts, largura * 0.5, largura * 0.08, tNasce, tNasce + 0.35);
  }

  // Lascas que levantam e poeira ao longo da fenda principal
  const lascas = [];
  const poeira = [];
  principais.forEach((pr, k) => {
    for (let i = 2; i < pr.pts.length; i += 3) {
      const s = semente + k * 100 + i;
      const p = pr.pts[i];
      const tPassa = pr.t1 * saidaInv(i / (pr.pts.length - 1));
      const l = new THREE.Mesh(facetar(new THREE.BoxGeometry(0.5 + aleatorio(s) * 0.4, 0.16, 0.4 + aleatorio(s * 2) * 0.3)), new THREE.MeshToonMaterial({ color: P.pedra, gradientMap: GRADIENTE_5 }));
      l.castShadow = true;
      const lado = aleatorio(s * 3) < 0.5 ? -1 : 1;
      l.position.set(p.x + lado * 0.3, 0.05, p.y);
      l.userData = { tPassa, giro: lado * (0.35 + aleatorio(s * 5) * 0.4), eixo: aleatorio(s * 7) < 0.5 ? 'x' : 'z' };
      g.add(l);
      lascas.push(l);
      const pz = new THREE.Mesh(facetar(geoAmassada(0.45, s, 1, 0.2)), new THREE.MeshToonMaterial({ color: P.pedra_clara, gradientMap: GRADIENTE_5, transparent: true, opacity: 0, depthWrite: false }));
      pz.position.set(p.x, 0.3, p.y);
      pz.userData = { tPassa };
      g.add(pz);
      poeira.push(pz);
    }
  });

  g.userData.atualizar = (t) => {
    g.visible = t >= 0;
    if (t < 0) return { tremor: 0, flash: 0 };
    for (const tr of trilhas) {
      const u = saida((t - tr.t0) / (tr.t1 - tr.t0));
      const segs = Math.floor(u * (tr.pts.length - 1));
      for (const m of tr.malhas) { m.visible = segs > 0; m.geometry.setDrawRange(0, segs * 6); }
    }
    for (const l of lascas) {
      const u = Math.min(Math.max((t - l.userData.tPassa) / 0.25, 0), 1);
      l.visible = u > 0;
      l.rotation[l.userData.eixo] = l.userData.giro * u;
      l.position.y = 0.05 + 0.12 * u;
    }
    for (const pz of poeira) {
      const u = (t - pz.userData.tPassa) / 0.8;
      pz.visible = u > 0 && u < 1;
      if (!pz.visible) continue;
      pz.scale.setScalar(0.5 + u * 1.8);
      pz.position.y = 0.3 + u * 0.8;
      pz.material.opacity = 0.6 * (1 - u);
    }
    // tremor contínuo enquanto racha, mais forte no começo
    const k = Math.max(0, 1 - t / (duracao + 0.3));
    return { tremor: 9 * k * Math.sin(t * 70), flash: 0 };
  };
  return g;
}

// Inverso de "saida" (em que instante relativo a fenda chega à fração f do caminho).
function saidaInv(f) { return 1 - Math.pow(1 - Math.min(Math.max(f, 0), 1), 1 / 2.2); }

export default criarRachadura;
