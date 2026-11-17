// Abre o Chrome headless (WebGL por software) com um servidor local na raiz do projeto.
// Usado por gravar.js (vídeo/quadro) e gerar_ficha.js (várias imagens numa sessão só).

const path = require('path');
const fs = require('fs');
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

async function abrirNavegador() {
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
  const erros = [];
  page.on('pageerror', e => { erros.push(e.message); console.error('Erro na página:', e.message); });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('[página]', m.text()); });

  // Abre "pasta/pagina.html?params" (caminho relativo ao projeto ou absoluto dentro dele).
  async function abrir(pagina) {
    const [arquivo, consulta] = pagina.split('?');
    const relativo = path.relative(RAIZ, path.resolve(RAIZ, arquivo)).split(path.sep).join('/');
    if (relativo.startsWith('..')) throw new Error('A página precisa estar dentro do projeto: ' + pagina);
    erros.length = 0;
    await page.goto(`${servidor.url}/${relativo}${consulta ? '?' + consulta : ''}`);
    await page.waitForFunction(() => (window.VIDEO && window.desenharQuadro) || window.__erroFatal, null, { timeout: 30000 })
      .catch(() => { throw new Error(`Página não ficou pronta: ${pagina}\n${erros.join('\n')}`); });
    const fatal = await page.evaluate(() => window.__erroFatal);
    if (fatal) throw new Error(`Erro na página ${pagina}: ${fatal}`);
    await page.evaluate(() => document.fonts.ready);
    const V = await page.evaluate(() => window.VIDEO);
    await page.setViewportSize({ width: V.largura, height: V.altura });
    return V;
  }

  async function capturar(n, formato = 'image/jpeg') {
    await page.evaluate(async (n) => { await window.desenharQuadro(n); }, n);
    const url = await page.evaluate((f) => document.querySelector('canvas').toDataURL(f, 0.92), formato);
    return Buffer.from(url.split(',')[1], 'base64');
  }

  async function fechar() { await browser.close(); servidor.fechar(); }

  return { page, abrir, capturar, fechar, RAIZ };
}

module.exports = { abrirNavegador, RAIZ };
