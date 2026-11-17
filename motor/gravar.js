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
const { iniciarServidor } = require('./servidor');

const RAIZ = path.resolve(__dirname, '..');

function carregarPlaywright() {
  try { return require('playwright'); }
  catch {
    for (const p of ['/opt/node-tools/node_modules/playwright', '/opt/npm-tools/node_modules/playwright']) {
      try { return require(p); } catch {}
    }
    throw new Error('Playwright não encontrado');
  }
}

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
  const [arquivo, consulta] = o.pagina.split('?');
  const relativo = path.relative(RAIZ, path.resolve(arquivo)).split(path.sep).join('/');
  if (relativo.startsWith('..')) throw new Error('A página precisa estar dentro do projeto: ' + o.pagina);

  const servidor = await iniciarServidor(RAIZ);
  const { chromium } = carregarPlaywright();
  const browser = await chromium.launch({
    executablePath: fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined,
    args: [
      '--no-sandbox', '--disable-gpu-vsync', '--force-color-profile=srgb',
      // WebGL por software (SwiftShader): funciona sem GPU e dá o mesmo resultado sempre.
      '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
    ],
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('Erro na página:', e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('[página]', m.text()); });
  await page.goto(`${servidor.url}/${relativo}${consulta ? '?' + consulta : ''}`);
  await page.waitForFunction(() => window.VIDEO && window.desenharQuadro, null, { timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  const V = await page.evaluate(() => window.VIDEO);
  await page.setViewportSize({ width: V.largura, height: V.altura });

  const formato = /\.png$/i.test(o.saida) ? 'image/png' : 'image/jpeg';
  const capturar = async (n) => {
    await page.evaluate(async (n) => { await window.desenharQuadro(n); }, n);
    const url = await page.evaluate((f) => document.querySelector('canvas').toDataURL(f, 0.92), formato);
    return Buffer.from(url.split(',')[1], 'base64');
  };

  fs.mkdirSync(path.dirname(path.resolve(o.saida)), { recursive: true });

  const encerrar = async () => { await browser.close(); servidor.fechar(); };

  if (o.quadro !== null) {
    fs.writeFileSync(o.saida, await capturar(o.quadro));
    await encerrar();
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
    const jpg = await capturar(n);
    if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r));
    if (n % 30 === 0) process.stdout.write(`\rQuadro ${n + 1}/${total}`);
  }
  ff.stdin.end();
  await fim;
  await encerrar();
  fs.renameSync(temp, o.saida);
  console.log(`\rPronto: ${o.saida} (${total} quadros em ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}

main().catch(e => { console.error(e); process.exit(1); });
