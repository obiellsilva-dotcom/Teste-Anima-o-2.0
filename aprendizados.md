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
- Ficha de personagem: `node motor/gerar_ficha.js <nome>` gera 18 imagens + `ficha.png` numa só
  sessão do Chrome em ~16 s (abrir o navegador uma vez por imagem levaria ~1 min).
- Personagem deitado num quadro vertical fica minúsculo de frente. Girar ~50° e subir a câmera
  (~35°) deixa o corpo na diagonal e ocupa melhor o quadro.
- Luz pontual do efeito de poder: com intensidade 2,5 tingia o personagem todo de verde; 0,7 com
  alcance 3 só ilumina mãos e peito.
- A sombra de contato é filha da raiz: em pose com a raiz girada (caído), `atualizarSombra`
  (em `motor/poses.js`) recoloca a sombra deitada no chão, sob o quadril.
- `ShapeGeometry` (boca de riso em D) é plana: precisa sair ~0,01 C da superfície da cabeça para
  não sumir dentro da curvatura.
- Motor de roteiros: `render.js` + `motor/player.html`. A duração sai das falas
  (`motor/tempo.js`); `--prancha` dá 1 quadro por cena em ~11 s e evita renderizar o vídeo
  inteiro para conferir enquadramento.
- Cenário cortado: paredes são planos de um lado só, então uma câmera ATRÁS da parede enxerga o
  quarto (boa para ver o rosto de quem está de frente para uma porta). Objetos sólidos na parede
  (porta, batente) precisam ser escondidos nesse plano (`visivel: false`).
- Raiz do personagem fica nos pés: na pose "caido" o corpo se estende 3,9 C a partir da marca;
  a marca de deitar fica perto do PÉ da cama, não no meio.
- Cabeça grande (chibi) + braços curtos: "erguendo" com cotovelo dobrado deixa as mãos abaixo do
  topo da cabeça. Braços retos para cima levam as mãos a ~3,9 C, logo acima da cabeça.
- Câmera ao lado da rua em x>8 cai dentro das casas/árvores; usar câmeras dentro da faixa da rua.
- Legenda com `|` no texto força a quebra dos blocos (o automático às vezes gera 4 palavras).
