// Legenda (guia, seção 9): 1–3 palavras, MAIÚSCULAS, Barlow Condensed 800, 88 px,
// palavra-chave em amarelo-ouro, sombra dura + suave, sem contorno, entrada "pop" em 4 quadros.

import { PALETA as P } from './paleta.js';

export const FONTE_LEGENDA = '"Barlow Condensed"';

// Carrega a fonte do pacote local (licença OFL). Chamar uma vez antes de desenhar.
export async function carregarFonteLegenda() {
  const f = new FontFace('Barlow Condensed', 'url(/node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-800-normal.woff2)', { weight: '800' });
  await f.load();
  document.fonts.add(f);
}

const ZONAS = { alta: 0.17, baixa: 0.73, centro: 0.5 };
const normal = (s) => s.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z0-9]/g, '');

// Desenha um bloco de legenda.
//   texto: "você segura."   destaque: "segura" (ou lista)   zona: alta | baixa | centro
//   idade: segundos desde que o bloco apareceu (para o pop de entrada)
export function desenharLegenda(ctx, { texto, destaque = [], zona = 'baixa', idade = 1, W = 1080, H = 1920, tamanho = 88 }) {
  const destaques = new Set((Array.isArray(destaque) ? destaque : [destaque]).flatMap(d => d.split(/\s+/)).map(normal).filter(Boolean));
  const palavras = texto.toUpperCase().split(/\s+/);
  let fonte = tamanho;
  const medir = () => {
    ctx.font = `800 ${fonte}px ${FONTE_LEGENDA}, "DejaVu Sans Condensed", sans-serif`;
    const espaco = ctx.measureText(' ').width;
    const larguras = palavras.map(p => ctx.measureText(p).width + fonte * 0.01 * p.length);
    return { espaco, larguras, total: larguras.reduce((a, b) => a + b, 0) + espaco * (palavras.length - 1) };
  };
  let m = medir();
  const maxL = W * 0.8;                     // guia: 80% da tela; reduz o tamanho, não quebra
  if (m.total > maxL) { fonte = Math.floor(fonte * maxL / m.total); m = medir(); }

  // Pop: escala 0,86 -> 1,05 -> 1,0 e opacidade 0 -> 1 em 4 quadros
  const q = idade * 30;
  const escala = q >= 4 ? 1 : q < 2 ? 0.86 + (1.05 - 0.86) * (q / 2) : 1.05 - 0.05 * ((q - 2) / 2);
  const alfa = Math.min(1, q / 3 + 0.15);

  const cy = H * (ZONAS[zona] ?? zona);
  ctx.save();
  ctx.translate(W / 2, cy);
  ctx.scale(escala, escala);
  ctx.globalAlpha = alfa;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${fonte * 0.01}px`;
  let x = -m.total / 2;
  palavras.forEach((p, i) => {
    const cor = destaques.has(normal(p)) ? P.destaque : P.legenda;
    // sombra suave
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6; ctx.shadowOffsetX = 0;
    ctx.fillStyle = cor;
    ctx.fillText(p, x, 0);
    // sombra dura
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 4;
    ctx.fillText(p, x, 0);
    x += m.larguras[i] + m.espaco;
  });
  ctx.restore();
}
