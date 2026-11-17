// Efeito "absorção de poder": energia de fora é sugada para o peito do personagem.
// Guia, seção 8 (glow aditivo, partículas, flash, onda), cor `magia` por padrão.
//
// Linha do tempo (duração padrão 2,4 s; tudo escala com `duracao`):
//   0,00–0,40  círculo de runas se abre no chão; partículas surgem ao redor
//   0,15–1,90  partículas com rastro e fitas em espiral são sugadas para o peito
//   0,50–2,00  núcleo no peito cresce; contorno do personagem acende (aura)
//   2,00–2,40  flash + onda de choque no chão; ficam partículas orbitando o corpo
//
// Uso:
//   const ab = criarAbsorcao({ alturaPeito: 2.3 });
//   ab.position.copy(posicaoDosPesDoPersonagem); cena.add(ab);
//   const { aura, flash } = ab.userData.atualizar(t);   // t em segundos desde o início
//   aura (0–1): acender o rim do personagem na cor do efeito (RIM em motor/toon.js)
//   flash (0–1): opacidade do quadro branco por cima de tudo (2D)
// Determinístico: mesmo t => mesma imagem.

import * as THREE from 'three';
import { PALETA as P } from '../../motor/paleta.js';
import { texturaHalo } from '../brilho.js';

const suave = (a, b, x) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };
const entrada = (x) => x * x * x;                       // easeInCubic (acelera para dentro)
const saidaVolta = (x) => { const c = 1.70158; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; }; // easeOutBack
function aleatorio(s) { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

function sprite(cor, op = 1, dureza = 0.3) {
  return new THREE.Sprite(new THREE.SpriteMaterial({
    map: texturaHalo(dureza), color: cor, transparent: true, opacity: op,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }));
}

let texRuna = null;
function texturaRuna() {
  if (texRuna) return texRuna;
  const S = 1024, c = S / 2;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d');
  g.strokeStyle = g.fillStyle = '#ffffff';
  g.lineCap = 'round';
  const anel = (r, w) => { g.lineWidth = w; g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke(); };
  anel(480, 14); anel(440, 5); anel(300, 8); anel(150, 5);
  // runas: losangos e traços entre os anéis externos
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    g.save(); g.translate(c + Math.cos(a) * 460, c + Math.sin(a) * 460); g.rotate(a);
    if (i % 2) { g.beginPath(); g.moveTo(-14, 0); g.lineTo(0, -10); g.lineTo(14, 0); g.lineTo(0, 10); g.closePath(); g.fill(); }
    else { g.fillRect(-4, -14, 8, 28); }
    g.restore();
  }
  // estrela de 6 pontas (dois triângulos) entre os anéis do meio
  g.lineWidth = 7;
  for (const giro of [0, Math.PI / 3]) {
    g.beginPath();
    for (let k = 0; k <= 3; k++) { const a = giro + (k / 3) * Math.PI * 2 - Math.PI / 2; const x = c + Math.cos(a) * 300, y = c + Math.sin(a) * 300; k ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  // raios internos
  g.lineWidth = 4;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    g.beginPath(); g.moveTo(c + Math.cos(a) * 160, c + Math.sin(a) * 160); g.lineTo(c + Math.cos(a) * 285, c + Math.sin(a) * 285); g.stroke();
  }
  texRuna = new THREE.CanvasTexture(cv);
  return texRuna;
}

export function criarAbsorcao({
  cor = P.magia, nucleo = '#eafff9', alturaPeito = 2.3, raio = 3.4, particulas = 70, fitas = 4, duracao = 2.4, semente = 7,
} = {}) {
  const k = duracao / 2.4;                // escala da linha do tempo
  const g = new THREE.Group();
  g.name = 'efeito_absorcao';
  const peito = new THREE.Vector3(0, alturaPeito, 0);

  // ---- Círculo de runas no chão
  const matRuna = new THREE.MeshBasicMaterial({ map: texturaRuna(), color: cor, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const runa = new THREE.Mesh(new THREE.PlaneGeometry(raio * 1.5, raio * 1.5), matRuna);
  runa.rotation.x = -Math.PI / 2;
  runa.position.y = 0.03;
  g.add(runa);
  const brilhoChao = sprite(cor, 0, 0.15);
  brilhoChao.position.y = 0.3;
  g.add(brilhoChao);

  // ---- Partículas com rastro
  const parts = [];
  for (let i = 0; i < particulas; i++) {
    const s = semente * 100 + i;
    const info = {
      ang: aleatorio(s) * Math.PI * 2,
      alt: 0.2 + aleatorio(s * 1.3) * 4.6,
      r: raio * (0.75 + aleatorio(s * 1.7) * 0.45),
      atraso: (0.15 + aleatorio(s * 2.3) * 0.95) * k,
      viagem: (0.6 + aleatorio(s * 2.9) * 0.35) * k,
      giro: 1.0 + aleatorio(s * 3.7) * 0.8,
      tam: 0.1 + aleatorio(s * 4.1) * 0.12,
      clara: aleatorio(s * 5.3) < 0.25,
    };
    const cabeca = sprite(info.clara ? nucleo : cor, 1, 0.4);
    const rastro = [0.05, 0.1, 0.16].map(() => sprite(cor, 0.5, 0.4));
    g.add(cabeca, ...rastro);
    parts.push({ info, cabeca, rastro });
  }
  const posParticula = (info, u, alvo) => {
    const e = entrada(u);
    const r = info.r * (1 - e);
    const a = info.ang + info.giro * e * Math.PI;
    alvo.set(Math.cos(a) * r, info.alt + (alturaPeito - info.alt) * e, Math.sin(a) * r);
    return alvo;
  };

  // ---- Fitas em espiral (aparecem como cometas: janela que corre pelo tubo)
  const listaFitas = [];
  for (let i = 0; i < fitas; i++) {
    const s = semente * 50 + i;
    const a0 = (i / fitas) * Math.PI * 2 + aleatorio(s) * 0.5;
    const alt0 = 0.3 + aleatorio(s * 1.9) * 3.5;
    const pts = [];
    for (let j = 0; j <= 40; j++) {
      const u = j / 40, e = u * u;
      const r = raio * 1.05 * (1 - e);
      const a = a0 + e * Math.PI * 1.6;
      pts.push(new THREE.Vector3(Math.cos(a) * r, alt0 + (alturaPeito - alt0) * e, Math.sin(a) * r));
    }
    const tubular = 80, radial = 6;
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), tubular, 0.045, radial, false);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: i % 2 ? nucleo : cor, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    m.frustumCulled = false;
    g.add(m);
    listaFitas.push({ m, tubular, radial, atraso: (0.35 + i * 0.22) * k, viagem: 1.0 * k });
  }

  // ---- Núcleo no peito + luz
  const halo = sprite(cor, 0, 0.15);
  const centro = sprite(nucleo, 0, 0.5);
  halo.position.copy(peito); centro.position.copy(peito);
  g.add(halo, centro);
  const luz = new THREE.PointLight(cor, 0, 7, 2);
  luz.position.copy(peito).add(new THREE.Vector3(0, 0, 0.8));
  g.add(luz);

  // ---- Flash e onda de choque
  const flash3d = sprite('#ffffff', 0, 0.3);
  flash3d.position.copy(peito);
  g.add(flash3d);
  const onda = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 64), new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  onda.rotation.x = -Math.PI / 2;
  onda.position.y = 0.05;
  g.add(onda);

  // ---- Partículas que ficam orbitando o corpo depois
  const restos = [];
  for (let i = 0; i < 14; i++) {
    const sp = sprite(i % 3 ? cor : nucleo, 0, 0.4);
    sp.userData = { a: aleatorio(semente + i * 9) * Math.PI * 2, r: 0.9 + aleatorio(semente + i * 3) * 0.8, h: 0.4 + aleatorio(semente + i * 5) * 3.2, v: 0.3 + aleatorio(i * 7) * 0.3 };
    g.add(sp);
    restos.push(sp);
  }

  const tmp = new THREE.Vector3();
  g.userData.duracao = duracao;
  g.userData.atualizar = (t) => {
    // Runas
    const abre = saidaVolta(suave(0, 0.4 * k, t));
    const fecha = suave(2.0 * k, 2.4 * k, t);
    runa.scale.setScalar(Math.max(abre, 0.001) * (1 + fecha * 0.5));
    runa.rotation.z = t * 0.6;
    matRuna.opacity = 0.9 * suave(0, 0.3 * k, t) * (1 - fecha);
    brilhoChao.material.opacity = 0.5 * suave(0, 0.4 * k, t) * (1 - fecha);
    brilhoChao.scale.setScalar(raio * 2.2);

    // Partículas
    for (const { info, cabeca, rastro } of parts) {
      const u = (t - info.atraso) / info.viagem;
      const vis = u > 0 && u < 1;
      cabeca.visible = vis;
      rastro.forEach(r => (r.visible = vis));
      // antes de partir, a partícula aparece parada no lugar (surge)
      const surgir = suave(info.atraso - 0.25 * k, info.atraso, t);
      if (u <= 0 && surgir > 0) {
        cabeca.visible = true;
        posParticula(info, 0, cabeca.position);
        cabeca.material.opacity = surgir;
        cabeca.scale.setScalar(info.tam * surgir);
        continue;
      }
      if (!vis) continue;
      posParticula(info, u, cabeca.position);
      cabeca.material.opacity = 1;
      cabeca.scale.setScalar(info.tam * (1 - 0.6 * u));
      rastro.forEach((r, j) => {
        const du = [0.05, 0.1, 0.16][j];
        posParticula(info, Math.max(u - du, 0), r.position);
        r.material.opacity = 0.5 * (1 - j / 3) * Math.min(u / du, 1);
        r.scale.setScalar(info.tam * (0.8 - j * 0.2) * (1 - 0.5 * u));
      });
    }

    // Fitas
    for (const f of listaFitas) {
      const u = (t - f.atraso) / f.viagem;
      if (u <= 0 || u >= 1.35) { f.m.visible = false; continue; }
      f.m.visible = true;
      const fim = Math.min(u, 1), ini = Math.max(u - 0.35, 0);
      const porSeg = f.radial * 6;
      const a = Math.floor(ini * f.tubular), b = Math.ceil(fim * f.tubular);
      f.m.geometry.setDrawRange(a * porSeg, Math.max(b - a, 0) * porSeg);
      f.m.material.opacity = 0.85 * (1 - suave(1.0, 1.35, u));
    }

    // Núcleo e aura
    const carga = suave(0.5 * k, 2.0 * k, t);
    const pulso = 1 + 0.1 * Math.sin(t * 14);
    halo.material.opacity = 0.9 * carga;
    halo.scale.setScalar((0.6 + 2.6 * carga) * pulso);
    centro.material.opacity = carga;
    centro.scale.setScalar((0.2 + 0.7 * carga) * pulso);
    const aura = suave(1.3 * k, 2.0 * k, t) * (1 - 0.4 * suave(2.3 * k, 3.0 * k, t));
    luz.intensity = 2.2 * carga + 1.5 * aura;

    // Flash e onda
    const fl = suave(1.95 * k, 2.02 * k, t) * (1 - suave(2.02 * k, 2.2 * k, t));
    flash3d.material.opacity = fl;
    flash3d.scale.setScalar(2 + fl * 8);
    const uo = (t - 2.0 * k) / (0.5 * k);
    onda.visible = uo > 0 && uo < 1;
    if (onda.visible) {
      onda.scale.setScalar(0.5 + uo * raio * 2);
      onda.material.opacity = 0.9 * (1 - uo);
    }

    // Restos orbitando
    const resto = suave(2.0 * k, 2.3 * k, t);
    for (const sp of restos) {
      const d = sp.userData;
      const a = d.a + t * d.v * Math.PI * 2;
      sp.position.set(Math.cos(a) * d.r, d.h + Math.sin(t * 2 + d.a) * 0.15, Math.sin(a) * d.r);
      sp.material.opacity = resto * (0.6 + 0.4 * Math.sin(t * 5 + d.a));
      sp.scale.setScalar(0.14);
    }

    return { aura, flash: fl * 0.8 };
  };
  g.userData.atualizar(0);
  return g;
}

export default criarAbsorcao;
