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
      text: '¡Hola! Soy Ágata. Bienvenida al Museo de la Dinamización Digital.',
      nextId: 'intro_2',
    },
    intro_2: {
      id: 'intro_2',
      speaker: 'agata',
      text: 'Aquí descubrirás cómo las grandes marcas conectan con sus clientes de forma humana y dinámica.',
      nextId: 'intro_3',
    },
    intro_3: {
      id: 'intro_3',
      speaker: 'agata',
      text: 'Pulsa el pilar donde quieras empezar. No hace falta moverte: elige y entra directamente.',
      nextId: 'end',
    },
    end: {
      id: 'end',
      speaker: 'agata',
      text: '¿Lista para empezar?',
      options: [{ text: '¡Vamos!', nextId: '' }],
    },
  },
};