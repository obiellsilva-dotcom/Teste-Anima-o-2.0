#!/usr/bin/env node
// Gravador: abre uma página HTML no Chrome headless, desenha cada quadro e envia ao ffmpeg.
//
// Contrato da página:
//   window.VIDEO = { largura, altura, fps, duracao }   (duracao em segundos)
//   window.desenharQuadro(n)                            desenha o quadro n (pode ser async)
//   um <canvas> do tamanho do vídeo (o primeiro da página é o que é gravado)
//
// A página é servida por HTTP local a partir da raiz do projeto (módulos ES e Three.js
// não carregam via file://). Pode ter parâmetros: "motor/vitrine.html?personagem=senhor".
//
// Uso:
//   node motor/gravar.js <pagina.html> <saida.mp4>
//   node motor/gravar.js <pagina.html> <saida.jpg|.png> --quadro 75   (um quadro só)

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { abrirNavegador } = require('./navegador');

function args() {
  const a = process.argv.slice(2);
  const o = { pagina: a[0], saida: a[1], quadro: null };
  const i = a.indexOf('--quadro');
  if (i >= 0) o.quadro = parseInt(a[i + 1], 10);
  if (!o.pagina || !o.saida) {
    console.error('Uso: node motor/gravar.js <pagina.html[?params]> <saida.mp4|.jpg|.png> [--quadro N]');
    process.exit(1);
  }
  return o;
}

async function main() {
  const o = args();
  const nav = await abrirNavegador();
  // Caminho da página relativo ao diretório atual.
  const [arq, consulta] = o.pagina.split('?');
  const V = await nav.abrir(path.resolve(arq) + (consulta ? '?' + consulta : ''));
  const formato = /\.png$/i.test(o.saida) ? 'image/png' : 'image/jpeg';

  fs.mkdirSync(path.dirname(path.resolve(o.saida)), { recursive: true });

  if (o.quadro !== null) {
    fs.writeFileSync(o.saida, await nav.capturar(o.quadro, formato));
    await nav.fechar();
    console.log('Quadro salvo em', o.saida);
    return;
  }

  const total = Math.round(V.duracao * V.fps);
  const temp = o.saida.replace(/\.mp4$/, '') + '.parcial.mp4';
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(V.fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-r', String(V.fps), '-movflags', '+faststart', temp,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const fim = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg saiu com código ' + c)))));

  const t0 = Date.now();
  for (let n = 0; n < total; n++) {
    const jpg = await nav.capturar(n, 'image/jpeg');
    if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r));
    if (n % 30 === 0) process.stdout.write(`\rQuadro ${n + 1}/${total}`);
  }
  ff.stdin.end();
  await fim;
  await nav.fechar();
  fs.renameSync(temp, o.saida);
  console.log(`\rPronto: ${o.saida} (${total} quadros em ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}

main().catch(e => { console.error(e); process.exit(1); });
