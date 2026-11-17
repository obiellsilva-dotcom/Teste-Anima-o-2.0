# Aprendizados

- Three.js 0.187 instalado via npm (`node_modules/three`). O pacote não exporta `package.json`:
  para ver a versão, leia o arquivo direto em vez de `require('three/package.json')`.
- Nas referências, o "contorno" dos personagens 3D é uma borda de luz colorida (rim) mais um
  contorno escuro do próprio tom — não traço preto. Ver `guia-de-estilo.md` seção 5.4.
- Módulos ES (Three.js com `import`) não carregam via `file://` no Chrome. O `motor/gravar.js`
  agora sobe um servidor HTTP local (`motor/servidor.js`) na raiz do projeto; a página pode
  receber parâmetros: `"motor/vitrine.html?personagem=senhor"` (use aspas no terminal).
- WebGL no Chrome headless sem GPU: flags `--use-angle=swiftshader --enable-unsafe-swiftshader
  --ignore-gpu-blocklist`. Um quadro 1080x1920 com um personagem leva ~3 s incluindo abrir o
  navegador.
- Renderizar o 3D num canvas WebGL escondido (`preserveDrawingBuffer: true`) e copiar com
  `drawImage` para o canvas 2D principal: fundo, legenda e efeitos 2D ficam no mesmo quadro.
- Three.js r187 removeu `PCFSoftShadowMap` (cai para `PCFShadowMap` com aviso).
- `MeshToonMaterial`: o gradientMap cobre N·L de -1 a 1. Com 3 texels, a luz plena só começa em
  N·L > 0,33 e o rosto fica meio escuro. Usar 4 texels `[70,150,255,255]` (guia 5.2).
- Contorno por casco invertido precisa de normais suaves: usar esfera, cápsula, torno e caixa
  arredondada; cilindro com tampa e caixa comum abrem buracos nas quinas.
- Cabelo: calota com borda variável (`geometriaCalota` em `motor/formas.js`). Uma calota simples
  inclinada para trás quase some vista de frente (o topo da esfera fica em escorço).
