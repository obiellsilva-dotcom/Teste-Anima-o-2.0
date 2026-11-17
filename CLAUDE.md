# Projeto: vídeos curtos animados só por código

Vertical 1080x1920, 30 fps. Chromium headless grava os quadros (`motor/gravar.js`), ffmpeg junta
vídeo, voz e legenda. Roteiros em JavaScript, motor em `motor/`, comando `render.js` na raiz.

## Regras obrigatórias

1. **Estilo:** seguir `guia-de-estilo.md` em tudo (paleta fechada, toon 3 faixas, contorno
   tom-sobre-tom, legendas). Cores só de `motor/paleta.js`.
2. **Fichas de personagem são lei** (guia, seção 13). Todo personagem que aparece num vídeo vem de
   `personagens/<nome>/<nome>.js`, com expressões e poses da ficha dele
   (`personagens/<nome>/ficha.md` e `ficha.png`). Nunca recriar ou ajustar um personagem dentro de
   um roteiro. Mudança no personagem = editar o modelo, subir `versao`, rodar
   `node motor/gerar_ficha.js <nome>` e pedir aprovação da nova ficha antes de usar.
3. **Antes de entregar um vídeo**, conferir quadros contra a `ficha.png` de cada personagem e o
   checklist do guia (seção 14).
4. **Cada coisa na pasta certa:** `referencias/`, `personagens/`, `cenarios/`, `efeitos/`,
   `roteiros/`, `audio/`, `previas/` (testes), `prontos/` (vídeos finais), `motor/`.
5. Registrar o que aprender (problemas, soluções, medidas) em `aprendizados.md`.

## Personagens aprovados

- `senhor` — O Senhor, personagem principal (ficha v1 aprovada; v2 com `erguendo` e `puxando` aguardando aprovação).

## Comandos

- Vídeo de um roteiro: `node render.js roteiros/<serie>/parteN.js` (ver `roteiros/LEIA-ME.md`; `--prancha`, `--cena N`, `--quadro N`, `--final`)

- Um quadro: `node motor/gravar.js "<pagina.html?params>" saida.png --quadro N`
- Vídeo: `node motor/gravar.js <pagina.html> saida.mp4`
- Ficha de personagem: `node motor/gerar_ficha.js <nome>`
- Ver personagem: `motor/vitrine.html?personagem=<nome>&pose=<pose>&expressao=<expr>&vista=<vista>`
