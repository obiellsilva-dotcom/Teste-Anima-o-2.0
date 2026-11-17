// Geometrias reutilizáveis para personagens e objetos.

import * as THREE from 'three';

// Calota de esfera unitária com borda variável: para cada direção horizontal φ
// (0 = frente/+Z, π/2 = lado +X, π = costas), a calota desce do topo até o ângulo polar
// limite(φ) em radianos. Ideal para cabelo, capuz, boné.
// Normais suaves (a direção do ponto), então funciona com o contorno do toon.js.
export function geometriaCalota(limite, segU = 72, segV = 20) {
  const pos = [], nor = [], idx = [];
  for (let j = 0; j <= segV; j++) {
    const v = j / segV;
    for (let i = 0; i <= segU; i++) {
      const phi = (i / segU) * Math.PI * 2;
      const theta = v * limite(phi);
      const x = Math.sin(theta) * Math.sin(phi);
      const y = Math.cos(theta);
      const z = Math.sin(theta) * Math.cos(phi);
      pos.push(x, y, z);
      nor.push(x, y, z);
    }
  }
  const linha = segU + 1;
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * linha + i, b = a + 1, c = a + linha, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

// Limite suave definido por três ângulos: na frente, nos lados e atrás.
export function limiteFrenteLadoTras(frente, lado, tras) {
  const a = (frente + tras) / 4 + lado / 2;
  const c = (frente + tras) / 4 - lado / 2;
  const b = (frente - tras) / 2;
  return (phi) => a + b * Math.cos(phi) + c * Math.cos(2 * phi);
}

// Perfil de torno (pares [raio, y]) suavizado por spline, com recorte opcional em y.
export function geometriaTorno(perfil, { de = -Infinity, ate = Infinity, escala = 1, pontos = 60, lados = 48 } = {}) {
  const curva = new THREE.SplineCurve(perfil.map(([r, y]) => new THREE.Vector2(r, y)));
  const pts = curva.getPoints(pontos)
    .filter(p => p.y >= de && p.y <= ate)
    .map(p => new THREE.Vector2(Math.max(p.x, 0) * escala, p.y));
  return new THREE.LatheGeometry(pts, lados);
}

// Raio de um perfil de torno numa altura y (interpolação linear entre os pontos).
export function raioNoPerfil(perfil, y) {
  for (let i = 1; i < perfil.length; i++) {
    const [r0, y0] = perfil[i - 1], [r1, y1] = perfil[i];
    if (y <= y1) return r0 + (r1 - r0) * ((y - y0) / (y1 - y0));
  }
  return 0;
}
