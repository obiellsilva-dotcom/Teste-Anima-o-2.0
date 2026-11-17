// Efeito "impacto" (guia, seção 8): poeira + pedrinhas low-poly + onda no chão + tremor + flash.
//
//   const fx = criarImpacto({ forte: true });
//   fx.position.copy(pontoDoImpacto); cena.add(fx);
//   const { tremor, flash } = fx.userData.atualizar(t);   // t = segundos desde o impacto (pode ser < 0)
//   tremor: deslocamento da câmera em px (6–12 px, 6 quadros, amortecido)
//   flash: opacidade do quadro branco (só se forte; 80% -> 0 em 3 quadros)
// Determinístico.

import * as THREE from 'three';
import { PALETA as P } from '../../motor/paleta.js';
import { GRADIENTE_5 } from '../../motor/toon.js';
import { geoAmassada, facetar } from '../../motor/cenografia.js';

function aleatorio(s) { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

export function criarImpacto({ forte = false, escala = 1, cor = P.pedra_clara, pedras = 12, nuvens = 5, semente = 3, chao = 0 } = {}) {
  const g = new THREE.Group();
  g.name = 'efeito_impacto';

  // Nuvens de poeira (low-poly, translúcidas)
  const nuv = [];
  for (let i = 0; i < nuvens; i++) {
    const m = new THREE.Mesh(facetar(geoAmassada(0.6 * escala, semente + i, 1, 0.22)),
      new THREE.MeshToonMaterial({ color: cor, gradientMap: GRADIENTE_5, transparent: true, opacity: 0, depthWrite: false }));
    const a = (i / nuvens) * Math.PI * 2 + aleatorio(semente + i);
    m.userData = { dir: new THREE.Vector3(Math.cos(a), 0.25 + aleatorio(i * 3) * 0.3, Math.sin(a)), vel: (1.5 + aleatorio(i * 5) * 1.5) * escala };
    g.add(m);
    nuv.push(m);
  }

  // Pedrinhas (parábola com gravidade)
  const pd = [];
  for (let i = 0; i < pedras; i++) {
    const s = semente * 10 + i;
    const m = new THREE.Mesh(facetar(geoAmassada((0.08 + aleatorio(s) * 0.12) * escala, s, 0, 0.3)), new THREE.MeshToonMaterial({ color: i % 3 ? P.pedra : cor, gradientMap: GRADIENTE_5 }));
    m.castShadow = true;
    const a = aleatorio(s * 1.7) * Math.PI * 2;
    const v = (3 + aleatorio(s * 2.3) * 4) * escala;
    m.userData = { v: new THREE.Vector3(Math.cos(a) * v, (5 + aleatorio(s * 3.1) * 5) * escala, Math.sin(a) * v), giro: aleatorio(s * 4.7) * 12 };
    g.add(m);
    pd.push(m);
  }

  // Onda no chão
  const onda = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 48), new THREE.MeshBasicMaterial({ color: P.creme, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  onda.rotation.x = -Math.PI / 2;
  g.add(onda);

  const G = 25;
  g.userData.atualizar = (t) => {
    const ativo = t >= 0;
    g.visible = ativo;
    if (!ativo) return { tremor: 0, flash: 0 };
    // poeira
    for (const m of nuv) {
      const u = Math.min(t / 0.9, 1);
      const d = m.userData;
      const s = (1 - Math.pow(1 - u, 3));
      m.position.copy(d.dir).multiplyScalar(d.vel * s);
      m.position.y += chao - g.position.y + 0.3 * escala;
      m.scale.setScalar(0.4 + s * 1.6);
      m.material.opacity = 0.75 * (1 - u);
    }
    // pedrinhas
    for (const m of pd) {
      const d = m.userData;
      const tt = Math.min(t, 1.2);
      m.position.set(d.v.x * tt, d.v.y * tt - 0.5 * G * tt * tt, d.v.z * tt);
      const yMin = chao - g.position.y + 0.05;
      m.visible = m.position.y > yMin || t < 0.05;
      if (m.position.y < yMin) m.position.y = yMin;
      m.rotation.set(d.giro * tt, d.giro * 0.7 * tt, 0);
    }
    // onda
    const uo = Math.min(t / 0.45, 1);
    onda.position.y = chao - g.position.y + 0.03;
    onda.scale.setScalar(0.3 + uo * 4.5 * escala);
    onda.material.opacity = 0.55 * (1 - uo);
    // tremor: 6 quadros (0,2 s), amortecido; flash: 3 quadros
    const k = Math.max(0, 1 - t / 0.2);
    const tremor = (forte ? 12 : 6) * k * Math.sin(t * 90);
    const flash = forte ? 0.8 * Math.max(0, 1 - t / 0.1) : 0;
    return { tremor, flash };
  };
  return g;
}

export default criarImpacto;
