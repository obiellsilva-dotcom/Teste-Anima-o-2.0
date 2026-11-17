// Efeitos de energia 3D (guia, seção 8): halo aditivo, núcleo, partículas e luz.
// Tudo determinístico: atualizar(t) com o mesmo t dá sempre a mesma imagem.

import * as THREE from 'three';

const cacheTex = new Map();
// Degradê radial branco -> transparente (a cor vem do material).
export function texturaHalo(dureza = 0.25) {
  if (cacheTex.has(dureza)) return cacheTex.get(dureza);
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const g = cv.getContext('2d');
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(dureza, 'rgba(255,255,255,0.55)');
  r.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  cacheTex.set(dureza, t);
  return t;
}

function sprite(cor, tamanho, opacidade = 1, dureza = 0.25) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texturaHalo(dureza), color: cor, transparent: true, opacity: opacidade,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }));
  s.scale.setScalar(tamanho);
  return s;
}

function aleatorio(semente) { const x = Math.sin(semente * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

// Esfera de poder: núcleo claro + halo da cor + partículas em órbita + luz pontual.
// tamanho = diâmetro do núcleo (em C).
export function criarEsferaDePoder({ cor = '#4ff5cf', nucleo = '#eafff9', tamanho = 0.32, particulas = 26, semente = 1, luz = 0.7 } = {}) {
  const g = new THREE.Group();
  g.name = 'efeito_poder';

  const halo = sprite(cor, tamanho * 5, 0.85, 0.18);
  const halo2 = sprite(cor, tamanho * 2.4, 0.9, 0.35);
  const centro = sprite(nucleo, tamanho * 1.15, 1, 0.5);
  g.add(halo, halo2, centro);

  const luzPonto = new THREE.PointLight(cor, luz, 3, 2);
  g.add(luzPonto);

  const parts = [];
  for (let i = 0; i < particulas; i++) {
    const p = sprite(i % 4 === 0 ? nucleo : cor, tamanho * (0.12 + aleatorio(semente + i) * 0.14), 1, 0.4);
    p.userData = {
      raio: tamanho * (0.8 + aleatorio(semente + i * 3.1) * 1.6),
      fase: aleatorio(semente + i * 7.7) * Math.PI * 2,
      vel: 0.25 + aleatorio(semente + i * 5.3) * 0.3,   // voltas por segundo (guia: 0,2–0,5)
      incl: (aleatorio(semente + i * 9.1) - 0.5) * Math.PI,
    };
    g.add(p);
    parts.push(p);
  }

  g.userData.atualizar = (t) => {
    const pulso = 1 + 0.08 * Math.sin(t * Math.PI * 2 * 1.6);   // ±8%, 1,6 Hz
    halo.scale.setScalar(tamanho * 5 * pulso);
    halo2.scale.setScalar(tamanho * 2.4 * pulso);
    luzPonto.intensity = luz * pulso;
    for (const p of parts) {
      const u = p.userData;
      const a = u.fase + t * u.vel * Math.PI * 2;
      const v = new THREE.Vector3(Math.cos(a) * u.raio, Math.sin(a) * u.raio * 0.35, Math.sin(a) * u.raio);
      v.applyAxisAngle(new THREE.Vector3(0, 0, 1), u.incl);
      p.position.copy(v);
    }
  };
  g.userData.atualizar(0);
  return g;
}
