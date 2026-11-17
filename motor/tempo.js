// Tempo das falas (sem áudio ainda): duração estimada pelo número de letras,
// divisão em blocos de 1 a 3 palavras para a legenda, e boca mexendo pelo tempo.
// Guia 4.2 (fala) e 9 (legenda). Quando houver áudio, troque estimarFala() pelos tempos reais.

export const FPS = 30;
export const SEG_POR_LETRA = 0.075;     // guia 4.2
export const MIN_FALA = 0.6;            // s
export const MIN_BLOCO = 8 / FPS;       // guia 9: mínimo 8 quadros na tela
export const PAUSA_VIRGULA = 0.2;       // s (boca fecha ≥ 6 quadros)
export const PAUSA_PONTO = 0.3;

const letras = (s) => (s.match(/[\p{L}\p{N}]/gu) || []).length;
// Palavras curtas que grudam na seguinte (não ficam sozinhas num bloco).
const GRUDA = new Set(['a', 'o', 'as', 'os', 'e', 'é', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'um', 'uma', 'que', 'se', 'com', 'por', 'pra', 'sua', 'seu', 'sem', 'mas', 'ao']);

// Divide o texto em blocos de 1 a 3 palavras; quebra depois de pontuação.
export function quebrarEmBlocos(texto, max = 3) {
  // "|" no texto = quebra escolhida pelo roteirista
  if (texto.includes('|')) return texto.split('|').map(s => s.trim()).filter(Boolean);
  const palavras = texto.trim().split(/\s+/);
  const blocos = [];
  let atual = [];
  const fechar = () => { if (atual.length) blocos.push(atual.join(' ')); atual = []; };
  palavras.forEach((p, i) => {
    atual.push(p);
    const pontuou = /[.,!?:;…]$/.test(p);
    const proxima = palavras[i + 1];
    const cheio = atual.length >= max;
    const grudaNaProxima = proxima && GRUDA.has(p.toLowerCase().replace(/[^\p{L}]/gu, '')) && atual.length < max;
    if (pontuou || (cheio && !grudaNaProxima) || atual.length > max) fechar();
  });
  fechar();
  return blocos;
}

// Monta a linha do tempo de uma fala a partir de t0. Devolve { inicio, fim, blocos: [{texto, inicio, fim, pausa}] }.
export function estimarFala(texto, t0 = 0) {
  const blocos = quebrarEmBlocos(texto);
  let t = t0;
  const saida = [];
  for (const b of blocos) {
    const dur = Math.max(MIN_BLOCO, letras(b) * SEG_POR_LETRA);
    const pausa = /[.!?…]$/.test(b) ? PAUSA_PONTO : /[,;:]$/.test(b) ? PAUSA_VIRGULA : 0;
    saida.push({ texto: b, inicio: t, fim: t + dur + pausa, falaFim: t + dur, pausa });
    t += dur + pausa;
  }
  const total = Math.max(MIN_FALA, t - t0);
  if (saida.length) saida[saida.length - 1].fim = t0 + total;
  return { inicio: t0, fim: t0 + total, blocos: saida };
}

// Forma da boca num instante, para quem está falando (guia 4.2: troca a cada 3–4 quadros,
// fecha nas pausas). Devolve null se a pessoa não está falando nesse instante.
const CICLO = ['aberta', 'meia', 'fechada', 'meia', 'aberta', 'fechada', 'meia'];
export function bocaNoInstante(fala, t) {
  if (!fala || t < fala.inicio || t >= fala.fim) return null;
  for (const b of fala.blocos) {
    if (t >= b.inicio && t < b.fim) {
      if (t >= b.falaFim) return 'fechada';
      const q = Math.floor((t - b.inicio) * FPS / 3.5);
      return CICLO[q % CICLO.length];
    }
  }
  return 'fechada';
}
