# Ficha — o senhor (personagem principal)

Código: `personagens/senhor.js` · Prévia: `previas/senhor_frente.png`, `previas/senhor_tres_quartos.png`

Para ver de novo:

```
node motor/gravar.js "motor/vitrine.html?personagem=senhor&expressao=feliz" previas/senhor_frente.png --quadro 0
```

Parâmetros da vitrine: `expressao` (neutro, feliz, bravo, surpreso, preocupado, determinado),
`vista` (frente, tres_quartos, perfil, costas), `pose` (parado, acenar).

## Quem é

54 anos. Acordou milionário depois de anos trabalhando. Alegre, cuidadoso, gentil, muito
trabalhador. Expressão padrão: `feliz`.

## Visual

| Item | Escolha | Cor (paleta) |
|---|---|---|
| Pele | média | `pele_2` #d8975f |
| Cabelo | branco, curto; testa alta, acima das orelhas, cobre a nuca | `cabelo_branco` #ebe7e0 |
| Sobrancelhas | grossas (0,075 C) e brancas | `cabelo_branco` |
| Olhos | pequenos e redondos (0,075 C) | `olho` #110f16 |
| Orelhas | redondas, medianas (0,25 C de altura), viradas 26° para a frente | `pele_2` |
| Camisa | social, manga dobrada no cotovelo (trabalhador), 3 botões | `creme` #e3d5b3 |
| Calça | cintura alta, sobe até a barriga | `tecido_azul` #3f5d7d |
| Cinto e sapatos | couro escuro | `couro_escuro` #3e2a20 |
| Acento | fivela e relógio de ouro no pulso esquerdo (o único sinal de riqueza) | `ouro` #d9a53a |

## Proporções (C = altura da cabeça)

- Altura total: 3,93 C (guia: herói = 4 C).
- Cabeça: 1,0 C de altura, 1,06 C de largura (redonda e grande).
- Corpo em forma de ovo: barriga com 1,33 C de largura (mais larga que a cabeça); ombros com 1,0 C.
- Pernas retas, sem afinar: 0,30 C de espessura; coxa 0,56 + canela 0,54 C (quadril a 1,36 C do chão).
- Braços: 0,58 + 0,52 C, afastados 20° pela barriga na pose de repouso.

## Juntas (para animar)

`raiz > quadril > tronco > cabeca > rosto`, `tronco > ombroE/D > cotoveloE/D > maoE/D`,
`quadril > coxaE/D > joelhoE/D > peE/D`. O tronco gira na altura do cinto; a cintura da calça
e o cinto acompanham o quadril.

Acesso no código:

```js
const senhor = criarSenhor({ expressao: 'feliz' });
const j = senhor.userData.juntas;     // j.ombroD.rotation.z = -2.5 ...
senhor.userData.rosto.definirExpressao('surpreso');
senhor.userData.rosto.definirBoca('aberta');   // fala: fechada | meia | aberta
senhor.userData.rosto.piscar(1);                // 0 = aberto, 1 = fechado
```

## Exceções ao guia (pedidas na descrição do personagem)

- **Olhos redondos** em vez de pílula (guia 4.1): a descrição pede "olhos pequenos e redondos".
- **Orelhas visíveis** (o guia diz que normalmente não aparecem): cabelo curto, e a descrição
  pede orelha redonda e mediana.
- **Sobrancelhas** 0,075 C de espessura (guia: 0,045 C) e 0,22 C de largura: "grossas".
- **Pernas** mais grossas que o padrão (0,30 C contra 0,20 C), para sustentar o corpo gordo.
