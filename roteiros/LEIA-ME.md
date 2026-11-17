# Como escrever um roteiro

Um roteiro é um módulo JavaScript em `roteiros/<serie>/parteN.js` que exporta um objeto.
O tempo de cada cena sai das falas (0,075 s por letra, mínimo 0,6 s por fala), até haver áudio.

```
node render.js roteiros/<serie>/parte1.js              # vídeo de prévia em previas/
node render.js roteiros/<serie>/parte1.js --prancha    # 1 quadro por cena (conferência rápida)
node render.js roteiros/<serie>/parte1.js --cena 3     # só a cena 3
node render.js roteiros/<serie>/parte1.js --quadro 120 # um quadro em PNG
node render.js roteiros/<serie>/parte1.js --final      # versão final em prontos/
```

## Estrutura

```js
export default {
  serie: 'super_forca', titulo: 'E SE VOCÊ ACORDASSE COM SUPER FORÇA?', destaque: 'FORÇA', parte: 1,
  cenas: [ /* ... */ ],
};
```

### Cena 3D

```js
{
  id: 'segurar',
  cenario: 'rua',                       // cenarios/<nome>/<nome>.js
  camera: 'lado',                       // câmera da FICHA do cenário, ou:
  // camera: { de: 'baixa', para: { pos, alvo, fov }, ease: 'suave', zoom: 0.04 }
  // camera: { personagem: 'senhor', tipo: 'rosto' | 'corpo', dist, lado, subir, fov }
  transicao: 'flash',                   // opcional
  personagens: [{
    nome: 'senhor',                     // personagens/<nome>/ — SÓ poses/expressões da ficha
    marca: 'meio',                      // marca da FICHA do cenário, ou:
    caminho: [{ t: 0, pos: [x, y, z], rotY }, { t: 2, pos: [...] }],
    andar: { de: 0, ate: 2, ciclo: 0.8 },   // ciclo de caminhada nesse intervalo
    chaves: [
      { t: 0, pose: 'parado', expressao: 'feliz' },
      { t: 0.8, pose: 'puxando', duracao: 0.3 },   // mistura da pose anterior em 0,3 s
      { t: 1.2, expressao: 'espanto' },
    ],
  }],
  objetos: [{ nome: 'carro', chaves: [
    { t: 0, pos: [0, 0, -20], rot: [0, 0, 0] },
    { t: 1, pos: [0, 0, -3], ease: 'linear' },     // ease: suave | linear | entrada | saida
    { t: 1, visivel: false },
    { t: 1, seguir: { junta: 'maoD', offset: [0, -0.2, 0] } },  // gruda numa junta do personagem
  ]}],
  efeitos: [{ tipo: 'impacto', t: 0.85, pos: [0, 1.4, 0], opcoes: { forte: true } }],  // efeitos/<tipo>/
  falas: [
    { texto: 'Sem pensar, | você segura.', destaque: 'segura' },        // "|" = quebra do bloco
    { texto: 'Ué?!', quem: 'senhor', zona: 'alta' },                     // boca do senhor mexe
  ],
  duracao: 2.4,                         // mínimo (opcional); respiro: 0.35 depois da última fala
  selo: { t: 0.5, texto: 'PARTE 2', sub: 'EM BREVE' },
}
```

### Cena 2D (explicativa)

```js
{
  tipo: '2d', zonaLegenda: 'alta',
  falas: [ ... ],
  desenhar(ctx, t, cena) { /* use motor/cena2d.js: senhor2d, pessoaGenerica, peso, barra, seta, textoGrande */ },
}
```
`cena.falas[i].inicio` e `.blocos[j].inicio` dão o tempo de cada fala para sincronizar animações.

## Regras

- Legenda: 1 a 3 palavras por bloco (use `|`), uma palavra-chave em `destaque` por fala.
- Personagens e poses: só os da ficha (`personagens/<nome>/ficha.png`). Pose nova = ficha nova.
- Cortes a cada 1–3 s; alternar ação 3D e explicação 2D (guia, seção 10).
- Prévia em `previas/`; só vai para `prontos/` depois de aprovado.
