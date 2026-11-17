// Poses oficiais do senhor (ficha, regra obrigatória). Formato em motor/poses.js.
// Convenções das juntas: rotation.x negativo leva braço/perna para a FRENTE;
// joelho.x positivo dobra o joelho; ombro.z positivo afasta o braço E (negativo, o D).
// Repouso do modelo: ombroE z=+0.36, ombroD z=-0.36, cotovelo x=-0.12, cotoveloE z=-0.18, cotoveloD z=+0.18.

const PI = Math.PI;

export const POSES = {
  parado: {
    titulo: 'Parado',
    ficha: { vista: 'frente' },
    expressao: 'feliz',
    juntas: {},
  },

  // Quadro de contato do ciclo de caminhada: perna E à frente, braço D à frente.
  andando: {
    titulo: 'Andando',
    ficha: { vista: 'tres_quartos' },
    expressao: 'feliz',
    raiz: { pos: [0, -0.05, 0] },
    juntas: {
      quadril: [0, -0.08, 0],
      tronco: [0.04, 0.1, 0],
      cabeca: [0, -0.06, 0],
      coxaE: [-0.4, 0, 0], joelhoE: [0.06, 0, 0], peE: [0.14, 0, 0],
      coxaD: [0.32, 0, 0], joelhoD: [0.3, 0, 0], peD: [-0.32, 0, 0],
      ombroE: [0.45, 0, 0.3], cotoveloE: [-0.2, 0, -0.15],
      ombroD: [-0.5, 0, -0.3], cotoveloD: [-0.5, 0, 0.15],
    },
  },

  // Passada no ar: tronco inclinado, perna D à frente, braços dobrados a 90°.
  correndo: {
    titulo: 'Correndo',
    ficha: { vista: 'tres_quartos' },
    expressao: 'determinado',
    raiz: { pos: [0, 0.06, 0] },
    juntas: {
      quadril: [0.06, 0.12, 0],
      tronco: [0.3, -0.12, 0],
      cabeca: [-0.25, 0.05, 0],
      coxaD: [-1.0, 0, 0], joelhoD: [1.1, 0, 0], peD: [0.05, 0, 0],
      coxaE: [0.55, 0, 0], joelhoE: [1.3, 0, 0], peE: [0.35, 0, 0],
      ombroD: [0.8, 0, -0.3], cotoveloD: [-1.5, 0, 0.1],
      ombroE: [-1.0, 0, 0.3], cotoveloE: [-1.45, 0, -0.1],
    },
  },

  // Braço D esticado apontando para o lado dele, mão E na cintura.
  apontando: {
    titulo: 'Apontando',
    ficha: { vista: 'frente' },
    expressao: 'feliz',
    extras: { indicadorD: true },
    juntas: {
      tronco: [0, -0.1, 0.03],
      cabeca: [0, -0.4, 0.04],
      ombroD: [-0.3, 0, -1.62], cotoveloD: [0, 0, 0.04],
      ombroE: [0.15, 0, 0.75], cotoveloE: [-0.3, 0, -1.75],
      coxaE: [0, 0, 0.06], coxaD: [0, 0, -0.06],
    },
  },

  // Mãos estendidas à frente soltando poder (efeito "poder" entre as mãos).
  poder: {
    titulo: 'Soltando poder',
    ficha: { vista: 'tres_quartos' },
    expressao: 'determinado',
    efeito: 'poder',
    raiz: { pos: [0, -0.06, 0] },
    juntas: {
      tronco: [0.12, 0, 0],
      cabeca: [-0.12, 0, 0],
      ombroE: [-1.45, 0, -0.32], cotoveloE: [-0.08, 0, 0], maoE: [-0.5, 0, 0],
      ombroD: [-1.45, 0, 0.32], cotoveloD: [-0.08, 0, 0], maoD: [-0.5, 0, 0],
      coxaE: [-0.32, 0, 0.1], joelhoE: [0.38, 0, 0], peE: [-0.06, 0, 0],
      coxaD: [0.36, 0, -0.1], joelhoD: [0.1, 0, 0], peD: [-0.46, 0, 0],
    },
  },

  // Caído de costas no chão, cabeça para a esquerda da tela, joelho E dobrado.
  caido: {
    titulo: 'Caído',
    ficha: { vista: -50, elev: 35 },
    expressao: 'cansado',
    raiz: { pos: [0, 0.55, 0], rot: [-PI / 2, PI / 2, 0], ordem: 'YXZ' },
    sombra: [2.6, 1.4],
    juntas: {
      cabeca: [-0.15, -0.55, 0],
      ombroE: [0, 0, 1.25], cotoveloE: [-0.4, 0, 0.35],
      ombroD: [0, 0, -1.35], cotoveloD: [-0.2, 0, -0.3],
      coxaE: [-0.75, 0, 0.12], joelhoE: [1.35, 0, 0], peE: [-0.55, 0, 0],
      coxaD: [0, 0, -0.12], joelhoD: [0.12, 0, 0],
    },
  },
};
