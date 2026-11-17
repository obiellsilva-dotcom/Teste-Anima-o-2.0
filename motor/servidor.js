// Servidor estático mínimo, servindo a raiz do projeto em 127.0.0.1.
// Necessário porque o Chrome não carrega módulos ES (import) a partir de file://.

const http = require('http');
const fs = require('fs');
const path = require('path');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.glb': 'model/gltf-binary',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
};

function iniciarServidor(raiz) {
  raiz = path.resolve(raiz);
  const servidor = http.createServer((req, res) => {
    const caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const arquivo = path.join(raiz, caminho);
    if (!arquivo.startsWith(raiz)) { res.writeHead(403); return res.end(); }
    fs.readFile(arquivo, (erro, dados) => {
      if (erro) { res.writeHead(404); return res.end('não encontrado: ' + caminho); }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo).toLowerCase()] || 'application/octet-stream' });
      res.end(dados);
    });
  });
  return new Promise(resolve => {
    servidor.listen(0, '127.0.0.1', () => {
      resolve({ url: `http://127.0.0.1:${servidor.address().port}`, fechar: () => servidor.close() });
    });
  });
}

module.exports = { iniciarServidor };
