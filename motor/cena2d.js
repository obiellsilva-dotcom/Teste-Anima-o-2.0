// Modo 2D explicativo (guia, seção 7): fundo petróleo com grade dupla e bokeh, objetos flat
// sem contorno com UMA faixa de sombra dura e sombra projetada suave, setas com glow.
// Funções de desenho para os roteiros usarem em cenas { tipo: '2d', desenhar(ctx, t, k) }.

import { PALETA as P } from './paleta.js';

const W = 1080, H = 1920;
function aleatorio(s) { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
export const suave = (x) => { const t = Math.min(Math.max(x, 0), 1); return t * t * (3 - 2 * t); };
export const saidaVolta = (x) => { const t = Math.min(Math.max(x, 0), 1); const c = 1.70158; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };

// Escurece/clareia uma cor hex (faixa de sombra do guia: luminosidade −18%).
export function tom(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.round(Math.min(255, Math.max(0, v * f))));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

// Fundo: degradê radial, grade 270/54 px com parallax 0,3, bokeh derivando.
export function fundo2d(ctx, t, { deslocX = 0, deslocY = 0 } = {}) {
  const g = ctx.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H / 2, H * 0.75);
  g.addColorStop(0, P.petroleo);
  g.addColorStop(1, P.petroleo_borda);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const px = (deslocX * 0.3) % 54, py = (deslocY * 0.3 + t * 6) % 54;
  ctx.save();
  ctx.globalAlpha = 0.25; ctx.strokeStyle = P.grade_fina; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = -54 + px; x < W + 54; x += 54) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = -54 + py; y < H + 54; y += 54) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  ctx.globalAlpha = 0.6; ctx.strokeStyle = P.grade; ctx.lineWidth = 2;
  const PX = (deslocX * 0.3) % 270, PY = (deslocY * 0.3 + t * 6) % 270;
  ctx.beginPath();
  for (let x = -270 + PX; x < W + 270; x += 270) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = -270 + PY; y < H + 270; y += 270) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  ctx.restore();
  // bokeh
  ctx.save();
  ctx.filter = 'blur(40px)';
  for (let i = 0; i < 8; i++) {
    const r = 60 + aleatorio(i) * 160;
    const x = (aleatorio(i * 2) * W + t * (4 + aleatorio(i * 3) * 6)) % (W + 200) - 100;
    const y = aleatorio(i * 5) * H;
    ctx.globalAlpha = 0.06 + aleatorio(i * 7) * 0.08;
    ctx.fillStyle = P.bokeh;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// Sombra projetada suave de um objeto 2D (guia 7: #000 25%, 0/18 px, desfoque 30 px).
export function comSombra(ctx, desenhar) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 18;
  desenhar();
  ctx.restore();
}

function elipse(ctx, x, y, rx, ry, cor) { ctx.fillStyle = cor; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
function retR(ctx, x, y, w, h, r, cor) {
  ctx.fillStyle = cor; ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill();
}

// O senhor em versão 2D chapada (mesmas proporções e cores da ficha). (x, y) = pés; altura em px.
// braços: 'baixo' | 'cima' (erguendo)
export function senhor2d(ctx, x, y, altura, { bracos = 'baixo', expressao = 'feliz' } = {}) {
  const C = altura / 3.93;            // tamanho da cabeça
  const sh = (c) => tom(c, 0.82);     // faixa de sombra (−18%)
  comSombra(ctx, () => {
    // pernas
    for (const s of [-1, 1]) retR(ctx, x + s * 0.25 * C - 0.15 * C, y - 1.36 * C, 0.3 * C, 1.16 * C, 0.14 * C, P.tecido_azul);
    for (const s of [-1, 1]) retR(ctx, x + s * 0.25 * C - 0.2 * C, y - 0.26 * C, 0.4 * C, 0.26 * C, 0.1 * C, P.couro_escuro);
    // braços
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(x + s * 0.5 * C, y - 2.48 * C);
      ctx.rotate(bracos === 'cima' ? s * -2.95 : s * 0.36);
      retR(ctx, -0.12 * C, 0, 0.24 * C, 0.62 * C, 0.12 * C, P.creme);
      retR(ctx, -0.1 * C, 0.55 * C, 0.2 * C, 0.55 * C, 0.1 * C, P.pele_2);
      elipse(ctx, 0, 1.17 * C, 0.14 * C, 0.15 * C, P.pele_2);
      ctx.restore();
    }
    // corpo (ovo): calça embaixo, camisa em cima, cinto
    elipse(ctx, x, y - 1.55 * C, 0.6 * C, 0.42 * C, P.tecido_azul);
    elipse(ctx, x, y - 2.05 * C, 0.66 * C, 0.78 * C, P.creme);
    ctx.save(); ctx.beginPath(); ctx.ellipse(x, y - 2.05 * C, 0.66 * C, 0.78 * C, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = sh(P.creme); ctx.fillRect(x + 0.32 * C, y - 3 * C, C, 2 * C); ctx.restore();
    retR(ctx, x - 0.66 * C, y - 1.66 * C, 1.32 * C, 0.09 * C, 0.04 * C, P.couro_escuro);
    retR(ctx, x - 0.08 * C, y - 1.68 * C, 0.16 * C, 0.13 * C, 0.02 * C, P.ouro);
    // cabeça
    const cy = y - 3.35 * C;
    elipse(ctx, x - 0.53 * C, cy + 0.02 * C, 0.07 * C, 0.12 * C, P.pele_2);
    elipse(ctx, x + 0.53 * C, cy + 0.02 * C, 0.07 * C, 0.12 * C, sh(P.pele_2));
    elipse(ctx, x, cy, 0.53 * C, 0.5 * C, P.pele_2);
  });
  // faixa de sombra na cabeça, cabelo, rosto
  const cy = y - 3.35 * C;
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, cy, 0.53 * C, 0.5 * C, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = sh(P.pele_2); ctx.beginPath(); ctx.ellipse(x + 0.25 * C, cy + 0.3 * C, 0.6 * C, 0.45 * C, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = P.cabelo_branco; ctx.beginPath(); ctx.ellipse(x, cy - 0.33 * C, 0.62 * C, 0.38 * C, 0, Math.PI, 0); ctx.lineTo(x + 0.62 * C, cy - 0.25 * C); ctx.lineTo(x - 0.62 * C, cy - 0.25 * C); ctx.fill();
  ctx.restore();
  const yo = cy + 0.03 * C;
  elipse(ctx, x - 0.16 * C, yo, 0.038 * C, (expressao === 'espanto' ? 0.05 : 0.038) * C, P.olho);
  elipse(ctx, x + 0.16 * C, yo, 0.038 * C, (expressao === 'espanto' ? 0.05 : 0.038) * C, P.olho);
  const ang = expressao === 'determinado' ? 0.25 : expressao === 'espanto' ? 0 : -0.14;
  for (const s of [-1, 1]) {
    ctx.save(); ctx.translate(x + s * 0.16 * C, yo - (expressao === 'espanto' ? 0.17 : 0.12) * C); ctx.rotate(s * ang);
    retR(ctx, -0.11 * C, -0.037 * C, 0.22 * C, 0.075 * C, 0.037 * C, P.cabelo_branco); ctx.restore();
  }
  ctx.strokeStyle = P.olho; ctx.lineWidth = 0.024 * C; ctx.lineCap = 'round';
  ctx.beginPath();
  if (expressao === 'espanto') { elipse(ctx, x, cy + 0.27 * C, 0.05 * C, 0.065 * C, P.olho); }
  else if (expressao === 'feliz') { ctx.arc(x, cy + 0.17 * C, 0.08 * C, 0.35, Math.PI - 0.35); ctx.stroke(); }
  else { ctx.moveTo(x - 0.07 * C, cy + 0.27 * C); ctx.lineTo(x + 0.07 * C, cy + 0.27 * C); ctx.stroke(); }
}

// Pessoa genérica (ícone cinza, para comparações). (x, y) = pés.
export function pessoaGenerica(ctx, x, y, altura) {
  const C = altura / 4;
  comSombra(ctx, () => {
    const cor = P.metal_claro;
    elipse(ctx, x, y - 3.5 * C, 0.48 * C, 0.48 * C, cor);
    retR(ctx, x - 0.42 * C, y - 2.95 * C, 0.84 * C, 1.4 * C, 0.25 * C, cor);
    for (const s of [-1, 1]) retR(ctx, x + s * 0.22 * C - 0.13 * C, y - 1.65 * C, 0.26 * C, 1.65 * C, 0.13 * C, cor);
    for (const s of [-1, 1]) retR(ctx, x + s * 0.55 * C - 0.1 * C, y - 2.85 * C, 0.2 * C, 1.25 * C, 0.1 * C, cor);
  });
  ctx.fillStyle = tom(P.metal_claro, 0.82);
  ctx.fillRect(x + 0.1 * C, y - 2.95 * C, 0.32 * C, 1.4 * C);
}

// Peso de academia com rótulo. (x, y) = base. tamanho em px (largura).
export function peso(ctx, x, y, tamanho, rotulo) {
  const w = tamanho, h = tamanho * 0.8;
  comSombra(ctx, () => {
    ctx.strokeStyle = P.metal; ctx.lineWidth = w * 0.09;
    ctx.beginPath(); ctx.arc(x, y - h * 0.95, w * 0.22, Math.PI, 0); ctx.stroke();
    retR(ctx, x - w / 2, y - h * 0.85, w, h * 0.85, w * 0.14, P.metal);
  });
  ctx.fillStyle = tom(P.metal, 0.82);
  ctx.fillRect(x + w * 0.18, y - h * 0.85 + w * 0.06, w * 0.28, h * 0.85 - w * 0.12);
  ctx.fillStyle = P.legenda;
  ctx.font = `800 ${Math.round(w * 0.24)}px "Barlow Condensed", sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(rotulo, x, y - h * 0.42);
}

// Barra de medidor com rótulo e valor (0–1).
export function barra(ctx, x, y, w, valor, { cor = P.seta, rotulo = '', h = 46 } = {}) {
  retR(ctx, x, y, w, h, h / 2, 'rgba(0,0,0,0.55)');
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.stroke();
  if (valor > 0) {
    ctx.save(); ctx.shadowColor = cor; ctx.shadowBlur = 24;
    retR(ctx, x + 5, y + 5, Math.max(h - 10, (w - 10) * Math.min(valor, 1)), h - 10, (h - 10) / 2, cor);
    ctx.restore();
  }
  if (rotulo) {
    ctx.fillStyle = P.legenda; ctx.font = `800 40px "Barlow Condensed", sans-serif`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText(rotulo, x, y - 10);
  }
}

// Texto grande (números, rótulos de diagrama) com sombra.
export function textoGrande(ctx, texto, x, y, { tamanho = 120, cor = P.legenda, alinhamento = 'center' } = {}) {
  ctx.save();
  ctx.font = `800 ${tamanho}px "Barlow Condensed", sans-serif`;
  ctx.textAlign = alinhamento; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
  ctx.fillStyle = cor;
  ctx.fillText(texto, x, y);
  ctx.restore();
}

// Seta grossa com glow que se desenha de (x0,y0) a (x1,y1) conforme progresso p (guia: 8–12 quadros).
export function seta(ctx, x0, y0, x1, y1, p, { cor = P.seta, espessura = 26 } = {}) {
  const u = suave(p);
  if (u <= 0) return;
  const xe = x0 + (x1 - x0) * u, ye = y0 + (y1 - y0) * u;
  const ang = Math.atan2(y1 - y0, x1 - x0);
  ctx.save();
  ctx.shadowColor = cor; ctx.shadowBlur = espessura * 2.5;
  ctx.strokeStyle = cor; ctx.lineWidth = espessura; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xe - Math.cos(ang) * espessura, ye - Math.sin(ang) * espessura); ctx.stroke();
  ctx.fillStyle = cor;
  ctx.beginPath();
  ctx.moveTo(xe + Math.cos(ang) * espessura * 0.9, ye + Math.sin(ang) * espessura * 0.9);
  ctx.lineTo(xe + Math.cos(ang + 2.4) * espessura * 1.8, ye + Math.sin(ang + 2.4) * espessura * 1.8);
  ctx.lineTo(xe + Math.cos(ang - 2.4) * espessura * 1.8, ye + Math.sin(ang - 2.4) * espessura * 1.8);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
