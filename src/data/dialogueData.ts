export interface DialogueOption {
  text: string;
  nextId: string;
}

export interface DialogueNode {
  id: string;
  speaker: 'agata' | 'player';
  text: string;
  options?: DialogueOption[];
  nextId?: string;
  /** Evento EventBus a emitir al mostrar este nodo (p. ej. frase-clave-collected). */
  onComplete?: string;
}

export interface BrandDialogue {
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
}

export const hubIntroDialogue: BrandDialogue = {
  startNodeId: 'welcome',
  nodes: {
    welcome: {
      id: 'welcome',
      speaker: 'agata',
      text: '¡Ssshh! Soy Ágata... y acabas de entrar en la zona prohibida del Museo.',
      nextId: 'intro_2',
    },
    intro_2: {
      id: 'intro_2',
      speaker: 'agata',
      text: 'Esto es el Museo de los Horrores de la Dinamización Digital. Aquí yacen las marcas que lo tuvieron todo... y lo perdieron por no respetar los 4 pilares.',
      nextId: 'intro_3',
    },
    intro_3: {
      id: 'intro_3',
      speaker: 'agata',
      text: 'Tu misión: desenterrar los 12 Antídotos ocultos en las lápidas de estas marcas caídas. Cada uno te protegerá de cometer sus mismos errores.',
      nextId: 'end',
    },
    end: {
      id: 'end',
      speaker: 'agata',
      text: '¿Te atreves a entrar? Pulsa un portal para empezar...',
      options: [{ text: '💀 Adelante...', nextId: '' }],
    },
  },
};