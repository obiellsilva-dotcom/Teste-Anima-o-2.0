#!/usr/bin/env node
// Gera a ficha oficial de um personagem: vistas, expressões, poses e a imagem-resumo ficha.png.
//
// Uso: node motor/gerar_ficha.js <nome>        (ex.: node motor/gerar_ficha.js senhor)
//
// Saída em personagens/<nome>/:
//   vistas/frente.png, tres_quartos.png, perfil.png, costas.png   (1080x1920)
//   expressoes/<expressao>.png                                     (1080x1080, close do rosto)
//   poses/<pose>.png                                               (1080x1920)
//   ficha.json (manifesto) e ficha.png (resumo)

const fs = require('fs');
const path = require('path');
const { abrirNavegador, RAIZ } = require('./navegador');

const VISTAS = [
  ['frente', 'Frente'],
  ['tres_quartos', '3/4'],
  ['perfil', 'Perfil'],
  ['costas', 'Costas'],
];

async function main() {
  const nome = process.argv[2];
  if (!nome) { console.error('Uso: node motor/gerar_ficha.js <nome>'); process.exit(1); }
  const pasta = path.join(RAIZ, 'personagens', nome);
  if (!fs.existsSync(path.join(pasta, nome + '.js'))) throw new Error(`Modelo não encontrado: personagens/${nome}/${nome}.js`);
  for (const sub of ['vistas', 'expressoes', 'poses']) fs.mkdirSync(path.join(pasta, sub), { recursive: true });

  const nav = await abrirNavegador();
  const t0 = Date.now();
  const salvar = async (params, arquivo) => {
    await nav.abrir(`motor/vitrine.html?personagem=${nome}&${params}`);
    fs.writeFileSync(path.join(pasta, arquivo), await nav.capturar(0, 'image/png'));
    console.log('  ' + arquivo);
  };

  await nav.abrir(`motor/vitrine.html?personagem=${nome}`);
  const FICHA = await nav.page.evaluate(() => window.FICHA);

  const manifesto = {
    nome, titulo: FICHA.titulo || nome, versao: FICHA.versao || 1, descricao: FICHA.descricao || '',
    regras: FICHA.regras || [],
    cores: [
      ['Pele', FICHA.pele], ['Cabelo', FICHA.cabelo], ['Camisa', FICHA.camisa],
      ['Calça', FICHA.calca], ['Couro', FICHA.couro], ['Acento', FICHA.acento],
    ].filter(([, c]) => c),
    vistas: [], expressoes: [], poses: [],
  };

  console.log('Vistas');
  for (const [v, titulo] of VISTAS) {
    await salvar(`vista=${v}&pose=parado`, `vistas/${v}.png`);
    manifesto.vistas.push({ arquivo: `vistas/${v}.png`, titulo });
  }

  console.log('Expressões');
  for (const ex of FICHA.expressoes) {
    await salvar(`expressao=${ex}&enquadrar=rosto&w=1080&h=1080`, `expressoes/${ex}.png`);
    manifesto.expressoes.push({ arquivo: `expressoes/${ex}.png`, titulo: ex });
  }

  console.log('Poses');
  for (const p of FICHA.poses) {
    const info = FICHA.posesInfo[p];
    const cam = info.ficha || {};
    const params = [`pose=${p}`, `vista=${cam.vista ?? 'frente'}`];
    if (cam.elev !== undefined) params.push(`elev=${cam.elev}`);
    await salvar(params.join('&'), `poses/${p}.png`);
    manifesto.poses.push({ arquivo: `poses/${p}.png`, titulo: info.titulo, sub: info.expressao || '' });
  }

  fs.writeFileSync(path.join(pasta, 'ficha.json'), JSON.stringify(manifesto, null, 2));

  console.log('Resumo');
  await nav.abrir(`motor/ficha.html?personagem=${nome}`);
  fs.writeFileSync(path.join(pasta, 'ficha.png'), await nav.capturar(0, 'image/png'));
  console.log('  ficha.png');

  await nav.fechar();
  console.log(`Ficha de "${nome}" gerada em ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

main().catch(e => { console.error(e); process.exit(1); });
