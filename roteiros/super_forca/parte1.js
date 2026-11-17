// Série: "E se você acordasse com super força?" — Parte 1
// Etapas: maçaneta arrancada -> carro erguido -> a rua racha. Gancho: batem à porta.
// Personagem: senhor (ficha v2 — poses "erguendo" e "puxando" pendentes de aprovação).
// Formato: roteiros/LEIA-ME.md. Renderizar: node render.js roteiros/super_forca/parte1.js

import { senhor2d, pessoaGenerica, peso, barra, suave, saidaVolta } from '../../motor/cena2d.js';
import { PALETA as P } from '../../motor/paleta.js';

const PI = Math.PI;
const CARRO_PARADO = -2.95;            // z do carro parado nas mãos do senhor (marca "meio")
const ACIMA_DA_CABECA = [0, 3.95, 1.6];

export default {
  serie: 'super_forca',
  titulo: 'E SE VOCÊ ACORDASSE COM SUPER FORÇA?',
  destaque: 'FORÇA',
  parte: 1,
  personagens: ['senhor'],

  cenas: [
    // 1. Gancho de abertura: a imagem mais forte primeiro.
    {
      id: 'abertura',
      cenario: 'rua',
      camera: { de: 'baixa', para: { pos: [-2.4, 1.1, -4.6], alvo: [0, 3.9, 0.8], fov: 54 } },
      personagens: [{ nome: 'senhor', marca: 'meio', chaves: [{ t: 0, pose: 'erguendo', expressao: 'determinado' }] }],
      objetos: [{ nome: 'carro', chaves: [{ t: 0, pos: ACIMA_DA_CABECA, rot: [0, PI / 2, 0] }] }],
      falas: [{ texto: 'E se você | acordasse com | super força?', destaque: 'força', zona: 'alta' }],
    },

    // 2. Rotina: acorda antes do sol.
    {
      id: 'acordar',
      cenario: 'quarto',
      camera: { de: { pos: [-3.6, 4.8, -0.6], alvo: [0.2, 1.9, -4.4], fov: 46 }, para: { pos: [-3.3, 4.7, -2.2], alvo: [0.2, 1.9, -4.6], fov: 44 } },
      personagens: [{ nome: 'senhor', marca: 'deitado', chaves: [{ t: 0, pose: 'caido', expressao: 'cansado' }, { t: 1.6, expressao: 'neutro' }] }],
      falas: [{ texto: 'Você acorda | antes do sol, | como sempre.', destaque: 'sol' }],
    },

    // 3. Etapa 1: a maçaneta sai na mão.
    {
      id: 'macaneta',
      cenario: 'quarto',
      camera: 'porta_dentro',
      personagens: [{
        nome: 'senhor', marca: 'porta',
        chaves: [
          { t: 0, pose: 'parado', expressao: 'neutro' },
          { t: 0.35, pose: 'puxando', expressao: 'determinado', duracao: 0.3 },
          { t: 1.05, expressao: 'espanto' },
          { t: 1.25, pose: 'parado', duracao: 0.45 },
        ],
      }],
      objetos: [
        { nome: 'porta_conjunto', chaves: [{ t: 0, visivel: false }] },   // câmera atrás da parede: porta seria um tapume
        { nome: 'macaneta', chaves: [{ t: 1.05, seguir: { junta: 'maoD', offset: [0, -0.24, 0.12] } }] },
      ],
      efeitos: [{ tipo: 'impacto', t: 1.05, pos: [4.68, 2.45, -5.5], opcoes: { escala: 0.25, pedras: 8, nuvens: 3, chao: 0 } }],
      falas: [
        { texto: 'Mas a maçaneta | fica na mão.', destaque: 'maçaneta' },
        { texto: 'Ué?!', quem: 'senhor', zona: 'alta' },
      ],
    },

    // 4. Explicação 2D: 50 kg contra 2 toneladas.
    {
      id: 'explicacao',
      tipo: '2d',
      zonaLegenda: 'alta',
      falas: [
        { texto: 'Uma pessoa comum | ergue | cinquenta quilos.', destaque: 'cinquenta quilos' },
        { texto: 'Você? | Duas toneladas.', destaque: 'duas toneladas' },
      ],
      desenhar(ctx, t, c) {
        const [f0, f1] = c.falas;
        const comum = suave((t - f0.inicio - 0.2) / 0.5);
        const voce = suave((t - f1.blocos[1].inicio) / 0.6);
        pessoaGenerica(ctx, 300, 1330, 520);
        if (t > f0.inicio + 0.4) peso(ctx, 300, 760 + (1 - saidaVolta((t - f0.inicio - 0.4) / 0.35)) * 60, 150, '50 KG');
        senhor2d(ctx, 770, 1330, 560, { bracos: voce > 0.05 ? 'cima' : 'baixo', expressao: voce > 0.05 ? 'feliz' : 'espanto' });
        if (voce > 0) peso(ctx, 770, 690 + (1 - saidaVolta((t - f1.blocos[1].inicio) / 0.4)) * 90, 340, '2.000 KG');
        barra(ctx, 120, 1460, 360, 0.025 * comum, { rotulo: 'PESSOA COMUM', cor: P.metal_claro });
        barra(ctx, 580, 1460, 380, voce, { rotulo: 'VOCÊ', cor: P.seta });
      },
    },

    // 5. Na rua: um carro desce sem freio.
    {
      id: 'rua',
      cenario: 'rua',
      camera: 'calcada',
      personagens: [{
        nome: 'senhor', caminho: [{ t: 0, pos: [5.0, 0.35, 2.5], rotY: 0.05 }, { t: 2.6, pos: [5.0, 0.35, 6.8], rotY: 0.05 }],
        andar: { de: 0, ate: 2.6, ciclo: 0.8 },
        chaves: [{ t: 0, pose: 'parado', expressao: 'feliz' }, { t: 2.5, expressao: 'espanto' }],
      }],
      objetos: [{ nome: 'carro', chaves: [{ t: 0, pos: [0, 0, -48], ease: 'linear' }, { t: 3.2, pos: [0, 0, -16], ease: 'linear' }] }],
      falas: [{ texto: 'Na rua, | um carro desce | sem freio.', destaque: 'freio' }],
    },

    // 6. Etapa 2a: segura o carro com as mãos.
    {
      id: 'segurar',
      cenario: 'rua',
      camera: { de: 'frente_esq', zoom: 0.06 },
      transicao: 'flash',
      personagens: [{ nome: 'senhor', marca: 'meio', chaves: [{ t: 0, pose: 'poder', expressao: 'determinado' }] }],
      objetos: [{
        nome: 'carro',
        chaves: [
          { t: 0, pos: [0, 0, -22] },
          { t: 0.85, pos: [0, 0, CARRO_PARADO], ease: 'linear' },
          { t: 1.0, pos: [0, 0, CARRO_PARADO - 0.25], ease: 'saida' },
          { t: 1.25, pos: [0, 0, CARRO_PARADO], ease: 'suave' },
        ],
      }],
      efeitos: [{ tipo: 'impacto', t: 0.85, pos: [0, 1.4, 0.15], opcoes: { forte: true, escala: 0.9, chao: 0 } }],
      falas: [{ t: 0.0, texto: 'Sem pensar, | você segura.', destaque: 'segura' }],
    },

    // 7. Etapa 2b: ergue o carro acima da cabeça.
    {
      id: 'erguer',
      cenario: 'rua',
      camera: { de: 'baixa', para: { pos: [-3.8, 0.6, -6.6], alvo: [0, 4.2, 0.4], fov: 58 } },
      personagens: [{
        nome: 'senhor', marca: 'meio',
        chaves: [
          { t: 0, pose: 'poder', expressao: 'espanto' },
          { t: 0.35, pose: 'erguendo', duracao: 0.55 },
          { t: 1.7, expressao: 'rindo' },
        ],
      }],
      objetos: [{
        nome: 'carro',
        chaves: [
          { t: 0, pos: [0, 0, CARRO_PARADO], rot: [0, 0, 0] },
          { t: 0.35, pos: [0, 0, CARRO_PARADO], rot: [0, 0, 0] },
          { t: 0.95, pos: [0, 3.95, -1.0], rot: [0.12, 0, 0], ease: 'saida' },
          { t: 1.4, pos: ACIMA_DA_CABECA, rot: [0, PI / 2, 0] },
        ],
      }],
      falas: [{ texto: 'E ergue | o carro | como uma caixa.', destaque: 'caixa' }],
    },

    // 8. Etapa 3: um passo racha a rua.
    {
      id: 'passo',
      cenario: 'rua',
      camera: { de: 'geral', para: { pos: [-1.6, 3.6, 13.5], alvo: [0.4, 2.4, 1.5], fov: 50 } },
      personagens: [{
        nome: 'senhor', caminho: [{ t: 0, pos: [0, 0, 1.6], rotY: 0.1 }, { t: 1.2, pos: [0, 0, 3.0], rotY: 0.1 }],
        andar: { de: 0, ate: 1.2, ciclo: 0.8 },
        chaves: [{ t: 0, pose: 'parado', expressao: 'feliz' }, { t: 1.35, expressao: 'medo' }],
      }],
      efeitos: [
        { tipo: 'impacto', t: 1.2, pos: [0.25, 0.2, 3.3], opcoes: { forte: true, escala: 0.8, chao: 0 } },
        { tipo: 'rachadura', t: 1.2, pos: [0.25, 0, 3.3], opcoes: { comprimento: 26, angulo: 0, duracao: 1.1, galhos: 8 } },
      ],
      falas: [
        { texto: 'Mas quando | você dá | um passo…', destaque: 'passo' },
        { texto: 'a rua inteira | racha.', destaque: 'racha' },
      ],
    },

    // 9. Vista aérea: o estrago.
    {
      id: 'estrago',
      cenario: 'rua',
      camera: { de: 'aerea', zoom: 0.08 },
      personagens: [{ nome: 'senhor', marca: 'meio_frente', chaves: [{ t: 0, pose: 'parado', expressao: 'medo' }] }],
      efeitos: [{ tipo: 'rachadura', t: -0.9, pos: [0.25, 0, 3.3], opcoes: { comprimento: 26, angulo: 0, duracao: 1.1, galhos: 8 } }],
      falas: [{ texto: 'Você ainda | não sabe | controlar isso.', destaque: 'controlar' }],
    },

    // 10. Gancho: à noite, batem à porta (a maçaneta continua faltando).
    {
      id: 'porta',
      cenario: 'quarto',
      camera: { de: 'porta_frente', zoom: 0.07 },
      objetos: [
        { nome: 'macaneta', chaves: [{ t: 0, visivel: false }] },
        { nome: 'fresta', chaves: [{ t: 0, visivel: true }] },
        { nome: 'fresta_luz', chaves: [{ t: 0, visivel: true }] },
        { nome: 'sombras_porta', chaves: [{ t: 0, visivel: false }, { t: 1.5, visivel: true }] },
      ],
      falas: [
        { texto: 'Naquela noite… | batem | na sua porta.', destaque: 'porta' },
        { texto: 'Toc. Toc.', quem: 'som', zona: 'centro' },
        { texto: 'Precisamos | conversar.', quem: 'voz', zona: 'centro', destaque: 'conversar' },
      ],
    },

    // 11. Reação + selo da parte 2.
    {
      id: 'reacao',
      cenario: 'quarto',
      camera: { personagem: 'senhor', tipo: 'rosto', dist: 3.6, lado: 0.25 },
      personagens: [{ nome: 'senhor', marca: 'olhando_porta', chaves: [{ t: 0, pose: 'parado', expressao: 'medo' }] }],
      duracao: 2.4,
      selo: { t: 0.5, texto: 'PARTE 2', sub: 'EM BREVE', y: 0.74 },
    },
  ],
};
