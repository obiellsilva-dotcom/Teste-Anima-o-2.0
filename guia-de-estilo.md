# Guia de estilo

Regras objetivas para todo vídeo do projeto. Medidas pensadas para **1080x1920, 30 fps**.
Quando uma regra disser "px", vale para o quadro final em 1080 de largura.

Este guia **não copia** a referência. Ele parte do que se repete nos quadros de
`referencias/ref01_quadros/` (análise em `referencias/ref01_analise.md`) e define um estilo
próprio. A seção 12 lista o que muda em relação à referência.

---

## 1. O que se repete nas referências (base do estilo)

| Aspecto | O que se repete | Como vira regra aqui |
|---|---|---|
| Formas | Volumes simples: esfera (cabeça), bloco (tronco), cilindro fino (membros), facetas low-poly nos objetos grandes | Toda peça nasce de primitiva simples; nada orgânico ou detalhado |
| Proporções | Cabeça grande, membros finos, cerca de 4,5 cabeças de altura; personagens grandes com cabeça pequena | Herói = 4 cabeças; gigante = 6,5 cabeças (seção 3) |
| Paleta | Fundo quase preto azulado; um único ponto de luz quente; roupas em tons médios dessaturados; um acento neon | Paleta fechada em código (seção 2) |
| Luz | Uma fonte quente forte e pontual + ambiente frio fraco; chão pinta em degradê laranja; vinheta forte | Esquema "uma brasa, um céu frio" (seção 5) |
| Sombra | Faixas chapadas nos personagens; sombra de contato escura e suave no chão | 3 faixas toon + sombra de contato obrigatória (seção 5) |
| Contorno | Não há traço preto grosso. Há uma **borda de luz fina** (rim) na cor da fonte de luz, mais um contorno escuro discreto do próprio tom | Rim colorido de 3 px + contorno tom-sobre-tom de 2 px (seção 4) |
| Textura | Sem foto e sem ruído: variação de cor por peça (lajota, tijolo), juntas escuras | Textura = variação por peça, nunca grão fino (seção 6) |
| Efeitos | Glow em tudo que é energia; faíscas subindo; poeira no impacto; flash e feixe de luz nas viradas | Biblioteca fixa de efeitos (seção 8) |
| 2D explicativo | Fundo petróleo com grade, bokeh, objetos flat com uma faixa de sombra, sem contorno | Regras próprias do modo 2D (seção 7) |
| Legenda | 1–3 palavras, maiúsculas, condensada grossa, branca com sombra, palavra-chave amarela | Seção 9 |

> **Do que você mais gostou:** o pedido veio com o texto `[suas frases do passo anterior]` sem
> preencher. Usei como base o que está em `ref01_analise.md` e o seu pedido inicial (3D toon na
> ação, 2D flat no explicativo, brilho, partículas, câmera viva, legenda com destaque
> amarelo-ouro). Cole suas frases aqui embaixo e eu ajusto o guia:
>
> - _(preencher)_

---

## 2. Paleta (códigos fixos)

Use **só** estas cores. Variações de luz/sombra saem da iluminação ou das regras de faixa,
não de cores novas. Nomes em `snake_case` são os nomes das constantes no código
(`motor/paleta.js`, quando existir).

### 2.1 Masmorra (modo 3D)

| Nome | Hex | Uso |
|---|---|---|
| `vazio` | `#0b0e14` | Fundo, teto, além do alcance da luz, cor da névoa |
| `pedra_escura` | `#1a1e27` | Paredes no escuro, sombras do cenário |
| `pedra` | `#2c323e` | Cor base de tijolo/parede |
| `pedra_clara` | `#414858` | Tijolos de destaque (1 em cada 6) |
| `piso` | `#2b2629` | Lajota sem luz |
| `piso_quente` | `#7c4a34` | Lajota sob a brasa (cor que a luz deve atingir, não textura) |
| `junta` | `#08090d` | Juntas de piso e tijolo |
| `brasa_nucleo` | `#ffe08a` | Centro de qualquer fonte quente (emissivo) |
| `brasa` | `#ff8526` | Cor da luz quente (PointLight) e das faíscas |
| `brasa_funda` | `#d9431a` | Borda da brasa, rachaduras incandescentes |
| `ambiente_frio` | `#34506e` | Cor da luz ambiente/hemisfério |
| `magia` | `#4ff5cf` | Acento mágico (glow, olhos acesos, runas) |
| `magia_funda` | `#167a68` | Tecido/objeto mágico sem brilho |
| `cristal` | `#a97bff` | Segundo acento (raro: cristais, raridade, item especial) |

### 2.2 Personagens

| Nome | Hex | Uso |
|---|---|---|
| `pele_1` | `#f1c493` | Pele clara |
| `pele_2` | `#d8975f` | Pele média (padrão) |
| `pele_3` | `#a8693f` | Pele morena |
| `pele_4` | `#6e4129` | Pele escura |
| `cabelo` | `#2a1c17` | Cabelo, sobrancelhas |
| `cabelo_branco` | `#ebe7e0` | Cabelo e sobrancelhas grisalhos/brancos |
| `olho` | `#110f16` | Olhos, boca |
| `couro` | `#6b4630` | Coletes, cintos, botas |
| `couro_escuro` | `#3e2a20` | Tiras, detalhes de couro |
| `tecido_azul` | `#3f5d7d` | Roupa |
| `tecido_verde` | `#4a6b3f` | Roupa |
| `tecido_vinho` | `#6c2e36` | Roupa |
| `creme` | `#e3d5b3` | Mangas, faixas, chifres, dentes |
| `metal` | `#5a606d` | Armadura, ferro |
| `metal_claro` | `#9aa1ae` | Aresta/fio de metal |
| `ouro` | `#d9a53a` | Fivelas, moedas, molduras |

Regra de roupa: cada personagem usa **no máximo 3 cores de tecido/couro + pele + 1 acento**.
O acento (`magia`, `cristal` ou `brasa`) ocupa menos de 5% da área do personagem.

### 2.3 Explicativo (modo 2D)

| Nome | Hex | Uso |
|---|---|---|
| `petroleo` | `#0f4652` | Fundo (centro) |
| `petroleo_borda` | `#082a33` | Fundo (bordas, degradê radial) |
| `grade` | `#1e6672` | Linhas principais da grade |
| `grade_fina` | `#145561` | Linhas secundárias |
| `bokeh` | `#3a8c99` | Círculos desfocados (com opacidade baixa) |
| `seta` | `#ff9b33` | Setas, destaques de movimento (com glow) |
| `painel` | `#1a1414` | Fundo de mapas/diagramas encaixados |
| `moldura` | `#f2a444` | Moldura de mapas/diagramas |

### 2.4 Legenda

| Nome | Hex | Uso |
|---|---|---|
| `legenda` | `#ffffff` | Palavras normais |
| `destaque` | `#f5b83d` | Palavra-chave (amarelo-ouro) |
| `legenda_sombra` | `#000000` | Sombra (com opacidade, ver seção 9) |

---

## 3. Proporções dos personagens

Unidade **C = altura da cabeça**. Todo personagem é medido em C.

### 3.1 Herói (padrão) — 4 C de altura

| Parte | Medida | Forma |
|---|---|---|
| Cabeça | altura 1,0 C · largura 1,04 C | Esfera levemente achatada no topo (escala Y 0,96) |
| Pescoço | 0,06 C (só um vão; nunca aparece) | — |
| Tronco | altura 1,2 C · largura 0,9 C · profundidade 0,55 C | Bloco com cantos arredondados (raio 0,08 C), leve afunilado na cintura (topo 100%, base 88%) |
| Quadril | altura 0,2 C · largura 0,8 C | Bloco, cor da calça |
| Pernas | 1,55 C (coxa 0,6 + canela 0,5 + bota 0,45) · espessura 0,2 C | Cilindros com junta no joelho |
| Botas | 0,45 C de altura · 0,26 C de largura · bico 0,34 C para frente | Bloco arredondado, sempre mais largo que a perna |
| Braços | 1,3 C (braço 0,62 + antebraço 0,58) · espessura 0,17 C | Cilindros com junta no cotovelo |
| Mãos | esfera 0,24 C (luva sem dedos) | Dedos só em close (máx. polegar separado) |
| Ombros | largura total 1,05 C | Igual à cabeça: cabeça nunca é mais estreita que os ombros |

Soma: 1,0 + 0,06 + 1,2 + 0,2 + 1,55 ≈ **4 C**. As mãos, com o braço caído, chegam à metade da coxa.

### 3.2 Gigante / chefe — 6,5 C de altura

- Cabeça pequena para o corpo: largura da cabeça = **0,35 × largura dos ombros**.
- Ombros 2,6 C, tronco 2,2 C de altura, braços até o joelho (antebraço mais grosso que o braço).
- Formas **facetadas** (low-poly visível, 6–10 lados por cilindro); herói usa formas lisas.
- Sempre tem uma fonte de luz própria (núcleo de `brasa` ou `magia`) no peito ou nos olhos.

### 3.3 Criança / criatura pequena — 3 C

- Mesma cabeça do herói, tronco 0,9 C, pernas 1,0 C. Olhos 15% maiores.

### 3.4 Articulações (obrigatórias no código)

Cada personagem é uma árvore de pivôs, sempre com estes nomes:

```
raiz (no chão, entre os pés)
└─ quadril
   ├─ tronco
   │  ├─ cabeca ─ rosto (olhoE, olhoD, sobrancelhaE, sobrancelhaD, boca)
   │  ├─ ombroE ─ cotoveloE ─ maoE
   │  └─ ombroD ─ cotoveloD ─ maoD
   ├─ coxaE ─ joelhoE ─ peE
   └─ coxaD ─ joelhoD ─ peD
```

O pivô fica **na junta** (topo do membro), para que girar o pivô gire o membro inteiro.

---

## 4. Rosto e expressões

### 4.1 Posição (em fração da cabeça, medida de cima para baixo e do centro para os lados)

| Elemento | Posição vertical | Forma e tamanho |
|---|---|---|
| Olhos | 55% da altura | **Pílula vertical** 0,07 × 0,11 C, cor `olho`; distância entre centros 0,34 C |
| Sobrancelhas | 0,10 C acima do centro do olho | Barra arredondada 0,20 × 0,045 C, cor `cabelo` |
| Boca | 76% da altura | Traço 0,13 × 0,022 C, cor `olho` |
| Nariz | — | Não existe. |
| Orelhas | — | Não aparecem (cabelo/capuz cobre). |

Os elementos ficam **colados à superfície** da esfera (orientados pela normal), não flutuando.

**Exceções por personagem:** a descrição de um personagem pode mudar formato de olho,
espessura de sobrancelha, orelhas etc. Toda exceção fica escrita na ficha dele
(`personagens/<nome>.md`, seção "Exceções ao guia"). Cores continuam só as da paleta.

### 4.2 Tabela de expressões

Só sobrancelha, boca e altura do olho mudam. Ângulos positivos = ponta de dentro para cima.

As **8 expressões oficiais** (valores em `motor/rosto.js`). Nenhuma outra é usada em vídeo.

| Expressão | Sobrancelha (ângulo · altura) | Olho | Boca |
|---|---|---|---|
| `neutro` | 0° · 0 | normal | traço |
| `feliz` | +8° · +0,02 C | altura 0,9 | arco sorrindo |
| `espanto` | 0° · +0,06 C | 1,35× maior | "o" (elipse 0,09 × 0,12 C) |
| `medo` | +28° · +0,04 C | 1,2× maior | elipse larga e baixa (boca tensa) |
| `raiva` | −26° · −0,035 C | altura 0,75 | arco invertido (cantos para baixo) |
| `determinado` | −12° · −0,02 C | altura 0,85 | traço 15% mais largo |
| `cansado` | +12° · −0,035 C | altura 0,38 (pálpebra pesada) | arco invertido raso |
| `rindo` | +12° · +0,04 C | fechado em arco (∩) | aberta em D, com faixa de dentes `creme` |
| _piscar_ | mantém | altura × 0,1 (4 quadros: 1,0 → 0,1 → 0,1 → 1,0) | mantém |

Nomes antigos aceitos pelo código: `bravo` = `raiva`, `surpreso` = `espanto`.

- **Piscar:** a cada 2,5–4,0 s (sorteado por semente fixa), nunca durante fala de destaque.
- **Fala (sem áudio):** boca alterna entre `fechada` (traço), `meia` (elipse 0,10 × 0,04 C) e
  `aberta` (elipse 0,11 × 0,08 C). Troca a cada 3–4 quadros (≈ 8–10 sílabas/s), fecha nas
  pausas de vírgula/ponto (≥ 6 quadros). Duração estimada: **0,075 s por letra**, mínimo 0,6 s
  por fala.
- Personagem com capuz escuro ou máscara: o rosto vira `vazio`, e olhos/contorno em `magia`
  com glow (mesmas posições).

---

## 5. Luz, sombra e contorno (modo 3D)

### 5.1 Esquema de luz "uma brasa, um céu frio"

| Luz | Tipo | Cor | Intensidade (Three.js, unidades físicas) |
|---|---|---|---|
| Principal | `PointLight` na fonte quente, `decay` 2 | `brasa` | alcance útil ≈ 6 m; o piso a 1 m deve chegar perto de `piso_quente` |
| Ambiente | `HemisphereLight` | céu `ambiente_frio`, chão `vazio` | baixa: personagem longe da luz ainda legível, mas 70% mais escuro |
| Contra-luz (opcional) | `DirectionalLight` atrás do personagem | `#7fa4d9` | só para gerar o rim no lado oposto à brasa |
| Névoa | `Fog` linear | `vazio` | começa a 6 m da câmera, some a 18 m |

- **Uma** fonte quente dominante por plano. Uma segunda (tocha, magia) só se tiver papel na história.
- Fontes de luz têm sempre: objeto emissivo + `PointLight` + halo (sprite aditivo) + faíscas.
- **Vinheta**: escurece as bordas até 55% (radial, começa a 45% do raio).

### 5.2 Sombreado toon (personagens e objetos)

- `MeshToonMaterial` com `gradientMap` de **3 faixas** (filtro `NearestFilter`):

  | Faixa | Valor no gradientMap | Quando |
  |---|---|---|
  | luz | 255 | N·L > 0 |
  | meio | 150 | −0,5 < N·L ≤ 0 |
  | sombra | 70 | N·L ≤ −0,5 |

  No código: textura de 4 texels `[70, 150, 255, 255]` (o Three.js mapeia N·L de −1 a 1 na
  largura toda; 3 texels iguais deixariam meio rosto em meio-tom).

- A sombra **esfria**: o ambiente `ambiente_frio` dá o tom azulado da faixa escura.
  Nunca escurecer por preto/cinza puro.
- Cenário (piso, paredes) usa gradiente de **5 faixas** (valores 40, 90, 140, 200, 255) para
  que a luz no chão pareça degradê em degraus suaves.

### 5.3 Sombras

| Tipo | Regra |
|---|---|
| Contato | **Obrigatória.** Elipse sob cada pé/base: `#000` 60% no centro → 0% na borda, raio 0,55 × largura dos ombros, achatada 0,6 no eixo da câmera |
| Projetada | Da luz principal, `PCFSoftShadowMap`, mapa 1024, opacidade efetiva ~50%; projeta para longe da brasa |
| Oclusão | Nada de AO; o escurecimento vem só da distância da luz e da névoa |

### 5.4 Contorno

| Onde | Regra |
|---|---|
| Personagens e objetos interativos | **Contorno tom-sobre-tom**: casco invertido (inverted hull) na cor do próprio material × 0,35, espessura **2 px** no plano médio (≈ 0,012 C). Nunca preto puro. |
| Borda de luz (rim) | Fresnel no lado iluminado de trás: **3 px**, cor da luz que está atrás (`brasa` perto do fogo, `#7fa4d9` no escuro, `magia` perto de magia), opacidade 70–90% |
| Cenário | **Sem contorno.** Separação feita pelas juntas (seção 6). |
| Close no rosto | Contorno sobe para 3 px; rim até 5 px. |

---

## 6. Cenários e textura

- **Lajota de piso:** 1,0 m × 1,0 m (ou 1,0 × 1,5 m, alternando por fileira). Junta = **3% do
  lado** (≈ 6–10 px no plano médio), cor `junta`. Cada lajota sorteia variação de
  luminosidade de **±5%** e rotação de matiz de ±3° (semente fixa por lajota).
- **Tijolo:** 0,6 × 0,25 m, fiadas desencontradas pela metade, junta 4% da altura do tijolo.
  1 em cada 6 tijolos usa `pedra_clara`; 1 em cada 20 fica 2 cm saliente.
- **Proibido:** foto, normal map realista, ruído fino/grão, sujeira pintada. Detalhe vem de
  geometria (lascas, pedras soltas, correntes, argolas) e não de textura.
- **Low-poly:** pedras e escombros com 6–12 faces visíveis (`IcosahedronGeometry` detalhe 0,
  `flatShading: true`).
- **Profundidade:** em planos de ação, um objeto de primeiro plano (pilar, corrente, ombro de
  personagem) escuro e desfocado cruzando 10–25% do quadro, pelo menos 1 vez a cada 3 cortes.

---

## 7. Modo 2D explicativo

- **Fundo:** degradê radial de `petroleo` (centro) para `petroleo_borda` (cantos).
- **Grade:** linhas `grade` a cada **270 px** (4 colunas), espessura 2 px, 60% de opacidade;
  linhas `grade_fina` a cada 54 px, 1 px, 25%. A grade se move junto com a câmera
  (parallax 0,3).
- **Bokeh:** 6–10 círculos `bokeh`, raio 60–220 px, opacidade 6–14%, desfoque 40 px,
  derivando 4–10 px/s.
- **Objetos:** flat, **sem contorno**. Cada objeto = cor base + **uma** faixa de sombra de
  borda dura (cor base com luminosidade −18%) sempre no lado inferior direito + sombra
  projetada suave (`#000` 25%, deslocada 0/18 px, desfoque 30 px).
- **Pessoa 2D:** mesmas proporções da seção 3, mesma cara da seção 4 (versão chapada).
- **Setas e energia:** `seta` com glow (halo 2,5× a espessura), ponta triangular grossa,
  entram desenhando-se em 8–12 quadros.
- **Diagramas/mapas:** caixa `painel` com moldura `moldura` de 6 px, cantos com raio 6 px.
- **Ícones de dado** (cronômetro, barra de vida, dinheiro): fundo escuro 85%, borda 3 px clara,
  número em fonte da legenda.

---

## 8. Efeitos

Todos os efeitos usam **semente fixa** por quadro: renderizar o mesmo quadro duas vezes dá a
mesma imagem.

| Efeito | Regra |
|---|---|
| Glow | Sprite aditivo com degradê radial; raio = 3–5× o tamanho do núcleo; núcleo `brasa_nucleo` → borda `brasa` 0%. Pulso: ±8% de escala, 1,2–2 Hz |
| Faíscas | 2–5 px, sobem 60–140 px/s com zigue-zague leve; vida 0,8–1,6 s; cor `#fff3c4` → `brasa` → `brasa_funda` → 0%. 20–40 vivas por fonte |
| Partículas mágicas | Bolinhas `magia` 4–8 px com glow, flutuam em órbita lenta (0,2–0,5 volta/s) |
| Poeira de impacto | 8–14 pedrinhas low-poly + 3–5 nuvens (`pedra_clara`, 40% → 0%), espalham em 10 quadros, caem por gravidade |
| Flash | Quadro branco 80% → 0% em 3 quadros, só em impacto forte ou virada |
| Feixe de luz | Coluna vertical aditiva, 60–120 px de largura, `#fff4d6` 60%, entra em 4 quadros, sai em 8; usada como transição |
| Tremor de câmera | Impacto: 6–12 px, 6 quadros, amortecido |
| Rachadura incandescente | Linhas `brasa_funda` com glow no piso, abrem em 6–10 quadros |

---

## 9. Legenda

| Item | Regra |
|---|---|
| Fonte | Sem serifa **condensada, peso 800** (padrão: Barlow Condensed ExtraBold, licença OFL; alternativa: Oswald 700) |
| Tamanho | **88 px** (altura de maiúscula ≈ 62 px) |
| Caixa | Tudo em MAIÚSCULAS, espaçamento entre letras +1% |
| Palavras | 1 a 3 por vez; **uma** palavra-chave em `destaque` no máximo |
| Cor | `legenda`; palavra-chave `destaque` |
| Sombra | Duas camadas: dura `0 4px 0 rgba(0,0,0,0.55)` + suave `0 6px 18px rgba(0,0,0,0.7)`. Sem contorno (stroke). |
| Largura máx. | 80% da tela (864 px); se passar, reduz o tamanho, não quebra linha |
| Posição | Zona alta: centro em **y = 17%** (326 px) · Zona baixa: centro em **y = 73%** (1400 px). Escolher a zona que não cobre o rosto |
| Margens seguras | Nada importante nos 8% de cima, 18% de baixo e 12% da direita (botões das redes) |
| Entrada | "pop" em 4 quadros: escala 0,86 → 1,05 → 1,0, opacidade 0 → 1 |
| Saída | Corte seco ao trocar de legenda (sem fade) |
| Sincronia | Troca no início da primeira sílaba da palavra seguinte; mínimo 8 quadros na tela |

---

## 10. Câmera e cortes

| Item | Regra |
|---|---|
| Lente (3D) | `PerspectiveCamera` com FOV vertical 50° (planos abertos) a 30° (closes) |
| Movimento | Câmera **nunca parada**: deriva mínima de 2% de zoom ou 0,5°/s de órbita em todo plano |
| Corte | A cada 1–3 s, acompanhando a legenda |
| Planos | Revezar: aberto (sala), médio (corpo inteiro), close (rosto), contra-plongée (chefe, câmera na altura do joelho), plongée/aéreo (mapa) |
| Regra de altura | Herói: câmera na altura do peito. Gigante: câmera abaixo da cintura dele, olhando para cima 15–30° |
| Suavização | Toda transição de câmera usa easeInOutCubic; aproximações lentas 1,5–3 s |
| Alternância | Ação 3D → explicação 2D → ação 3D; no máximo 3 planos seguidos do mesmo modo |

---

## 11. Movimento dos personagens

| Fase | Duração (a 30 fps) | Regra |
|---|---|---|
| Antecipação | 4–8 quadros | Recuo contrário ao golpe (10–25% da amplitude) |
| Ação | 3–6 quadros | Arco amplo, rápido |
| Exagero (overshoot) | 2–3 quadros | Passa 5–10% do ponto final |
| Assentamento | 6–12 quadros | Volta e pausa curta |
| Respiração parada | ciclo 2,4 s | Tronco escala Y ±1,5%, cabeça acompanha |
| Caminhada | ciclo 0,8 s (24 quadros) | Quadril sobe/desce 0,04 C; braços opostos às pernas, ±25° |
| Olhar | — | Cabeça vira antes do corpo (4 quadros de atraso) |

Peso: personagem grande tem antecipação e assentamento **2×** mais longos que o herói.

---

## 12. O que é nosso (diferente da referência)

Para não ser cópia, estas escolhas são deliberadamente outras:

1. **Olhos em pílula vertical**, não pontos redondos; **sem nariz** em nenhum modo.
2. **Herói com 4 cabeças** de altura (a referência fica em ~4,5) e **botas sempre mais largas
   que a perna**, dando silhueta de "peão" estável.
3. **Mãos em luva sem dedos** (esfera) em qualquer plano que não seja close.
4. **Rim de luz colorido + contorno tom-sobre-tom** como assinatura; nunca traço preto.
5. **Acento mágico água-marinha `#4ff5cf` + cristal violeta `#a97bff`**, em vez de um verde
   neon único.
6. **Sombra azulada** obrigatória (luz quente / sombra fria em todo plano 3D).
7. Grade 2D com **duas espessuras** (270 px e 54 px) e parallax.
8. Nenhum personagem, criatura, armadura ou cenário da referência é reproduzido: os
   personagens do projeto são criados em `personagens/` a partir das proporções da seção 3.

---

## 13. Fichas oficiais de personagem (obrigatórias)

Todo personagem aprovado tem uma ficha em `personagens/<nome>/`, e ela é **regra obrigatória em
todos os vídeos**:

```
personagens/<nome>/
  <nome>.js      modelo 3D (única fonte do personagem)
  poses.js       poses oficiais
  ficha.md       regras, proporções, cores, exceções ao guia
  ficha.png      imagem-resumo (vistas, expressões, poses, regras)
  ficha.json     manifesto gerado
  vistas/  expressoes/  poses/   imagens de referência geradas
```

1. **Vídeo só usa o modelo da ficha.** Importar `personagens/<nome>/<nome>.js`; nunca recriar,
   copiar ou ajustar o personagem dentro de um roteiro.
2. **Só expressões e poses da ficha.** O código recusa nomes fora da ficha
   (`definirExpressao` e a vitrine dão erro). Animação = transição entre poses da ficha
   (`misturarPoses` em `motor/poses.js`) mais movimentos secundários (respiração, piscar, fala).
3. **Mudou o personagem? Mude a ficha primeiro.** Pose nova, roupa nova ou ajuste de proporção:
   editar o modelo/`poses.js`, subir `versao` na FICHA, rodar
   `node motor/gerar_ficha.js <nome>` e pedir aprovação da nova `ficha.png` antes de usar.
4. **Antes de entregar um vídeo**, comparar os quadros com a `ficha.png`: proporção, cores,
   relógio/acessórios no lado certo, expressão permitida.
5. **Dedos:** mãos são luvas sem dedos; um personagem pode ter dedo indicador como peça extra,
   visível só nas poses que a ficha dele indicar (ex.: `apontando`).

---

## 14. Checklist antes de aprovar um quadro

- [ ] Personagens idênticos à ficha (`personagens/<nome>/ficha.png`), com expressão e pose da ficha?
- [ ] Só cores da seção 2?
- [ ] Uma fonte quente dominante e sombra fria?
- [ ] Sombra de contato sob todo personagem?
- [ ] Contorno tom-sobre-tom 2 px e rim 3 px (nada preto puro)?
- [ ] Proporção 4 C (herói) ou 6,5 C (gigante)?
- [ ] Legenda com 1–3 palavras, no máximo um destaque, fora das margens de UI?
- [ ] Câmera em movimento?
- [ ] Mesmo quadro renderizado duas vezes sai idêntico?
