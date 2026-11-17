#!/usr/bin/env node
// Renderiza um roteiro (roteiros/**/*.js) em vídeo vertical 1080x1920, 30 fps.
//
// Uso:
//   node render.js roteiros/super_forca/parte1.js                 -> previas/super_forca_parte1.mp4
//   node render.js roteiros/super_forca/parte1.js --final         -> prontos/super_forca_parte1.mp4
//   node render.js roteiros/super_forca/parte1.js --quadro 120    -> previas/super_forca_parte1_q120.png
//   node render.js roteiros/super_forca/parte1.js --prancha       -> previas/super_forca_parte1_prancha.png
//   node render.js roteiros/super_forca/parte1.js --cena 3        -> só a cena 3 (prévia rápida)
//   --saida <arquivo>  escolhe o arquivo de saída
//
// Sem áudio por enquanto (legenda + boca pelo tempo estimado). Quando houver voz em audio/,
// o ffmpeg junta aqui.

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { abrirNavegador, RAIZ } = require('./motor/navegador');

function args() {
  const a = process.argv.slice(2);
  const o = { roteiro: a[0], final: a.includes('--final'), prancha: a.includes('--prancha'), quadro: null, cena: null, saida: null };
  const pegar = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : null; };
  if (pegar('--quadro') !== null) o.quadro = parseInt(pegar('--quadro'), 10);
  if (pegar('--cena') !== null) o.cena = parseInt(pegar('--cena'), 10);
  o.saida = pegar('--saida');
  if (!o.roteiro) { console.error('Uso: node render.js <roteiro.js> [--final | --quadro N | --prancha | --cena N] [--saida arquivo]'); process.exit(1); }
  return o;
}

async function main() {
  const o = args();
  const rel = path.relative(RAIZ, path.resolve(o.roteiro)).split(path.sep).join('/');
  if (!fs.existsSync(path.join(RAIZ, rel))) throw new Error('Roteiro não encontrado: ' + rel);
  const base = rel.replace(/^roteiros\//, '').replace(/\.js$/, '').replace(/\//g, '_');
  const pasta = o.final ? 'prontos' : 'previas';

  const nav = await abrirNavegador();
  const V = await nav.abrir(`motor/player.html?roteiro=${rel}`);
  const linha = await nav.page.evaluate(() => window.LINHA_DO_TEMPO);
  console.log(`Roteiro: ${rel} · ${linha.length} cenas · ${V.duracao.toFixed(1)} s`);
  linha.forEach((c, i) => console.log(`  ${String(i + 1).padStart(2)}. ${c.id.padEnd(22)} ${c.inicio.toFixed(2)}–${c.fim.toFixed(2)} s  ${c.falas.join(' / ')}`));

  if (o.quadro !== null) {
    const saida = o.saida || path.join(pasta, `${base}_q${o.quadro}.png`);
    fs.writeFileSync(saida, await nav.capturar(o.quadro, 'image/png'));
    console.log('Quadro salvo em', saida);
    return nav.fechar();
  }

  if (o.prancha) {
    // Um quadro por cena (aos 60% dela) montados lado a lado com o nome e o tempo.
    const quadros = [];
    for (const c of linha) {
      const n = Math.floor((c.inicio + (c.fim - c.inicio) * 0.6) * V.fps);
      quadros.push({ img: (await nav.capturar(n, 'image/jpeg')).toString('base64'), id: c.id, t: `${c.inicio.toFixed(1)}s` });
    }
    const colunas = Math.min(5, quadros.length);
    const png = await nav.page.evaluate(async ({ quadros, colunas }) => {
      const w = 324, h = 576, m = 16, topo = 44;
      const linhas = Math.ceil(quadros.length / colunas);
      const cv = document.createElement('canvas');
      cv.width = colunas * (w + m) + m; cv.height = linhas * (h + topo + m) + m;
      const g = cv.getContext('2d');
      g.fillStyle = '#0b0e14'; g.fillRect(0, 0, cv.width, cv.height);
      for (let i = 0; i < quadros.length; i++) {
        const im = new Image();
        im.src = 'data:image/jpeg;base64,' + quadros[i].img;
        await im.decode();
        const x = m + (i % colunas) * (w + m), y = m + Math.floor(i / colunas) * (h + topo + m);
        g.fillStyle = '#f5b83d'; g.font = '800 24px "Barlow Condensed", sans-serif';
        g.fillText(`${i + 1}. ${quadros[i].id}`, x, y + 26);
        g.fillStyle = '#9aa1ae'; g.textAlign = 'right'; g.fillText(quadros[i].t, x + w, y + 26); g.textAlign = 'left';
        g.drawImage(im, x, y + topo, w, h);
      }
      return cv.toDataURL('image/png');
    }, { quadros, colunas });
    const saida = o.saida || path.join(pasta, `${base}_prancha.png`);
    fs.writeFileSync(saida, Buffer.from(png.split(',')[1], 'base64'));
    console.log('Prancha salva em', saida);
    return nav.fechar();
  }

  let n0 = 0, n1 = Math.round(V.duracao * V.fps);
  if (o.cena) {
    const c = linha[o.cena - 1];
    if (!c) throw new Error('Cena inexistente: ' + o.cena);
    n0 = Math.round(c.inicio * V.fps); n1 = Math.round(c.fim * V.fps);
  }
  const saida = o.saida || path.join(pasta, `${base}${o.cena ? '_cena' + o.cena : ''}.mp4`);
  fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
  const temp = saida.replace(/\.mp4$/, '') + '.parcial.mp4';
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(V.fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-r', String(V.fps), '-movflags', '+faststart', temp,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const fim = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg saiu com código ' + c)))));
  const t0 = Date.now();
  for (let n = n0; n < n1; n++) {
    const jpg = await nav.capturar(n, 'image/jpeg');
    if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r));
    if ((n - n0) % 30 === 0) process.stdout.write(`\rQuadro ${n - n0 + 1}/${n1 - n0}`);
  }
  ff.stdin.end();
  await fim;
  await nav.fechar();
  fs.renameSync(temp, saida);
  console.log(`\rPronto: ${saida} (${n1 - n0} quadros em ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
