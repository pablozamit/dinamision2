export type AgataAnimState = 'idle' | 'talk' | 'point' | 'wink';

export interface DialogueChoice {
  label: string;
  nextId: string;
  consequence?: 'encourage' | 'caution';
}

export interface DialogueNode {
  id: string;
  text: string;
  anim?: AgataAnimState;
  choices?: DialogueChoice[];
}

export interface DialogueScript {
  startId: string;
  nodes: Record<string, DialogueNode>;
}

export const hubIntroDialogue: DialogueScript = {
  startId: 'welcome',
  nodes: {
    welcome: {
      id: 'welcome',
      text: '¡Bienvenido/a al Nodo Digital! Explora los 4 portales. Cada uno es un pilar de la dinamización digital.',
      anim: 'point',
    },
    choose_path: {
      id: 'choose_path',
      text: '¿Por dónde quieres empezar? No hay respuesta incorrecta… pero sí consecuencias en tu ruta.',
      anim: 'talk',
      choices: [
        { label: 'Ir directo a Gamificación', nextId: 'hint_gamification', consequence: 'encourage' },
        { label: 'Recorrer todo el Hub primero', nextId: 'hint_explore', consequence: 'caution' },
      ],
    },
    hint_gamification: {
      id: 'hint_gamification',
      text: 'Perfecto. Acércate al portal azul y tócalo cuando brille. ¡Allí te espera IKEA!',
      anim: 'wink',
    },
    hint_explore: {
      id: 'hint_explore',
      text: 'Me encanta la curiosidad. Mira los cuatro iconos: cada pilar desbloquea marcas y frases clave.',
      anim: 'idle',
    },
  },
};

export const pillarGamificationEnterDialogue: DialogueScript = {
  startId: 'enter',
  nodes: {
    enter: {
      id: 'enter',
      text: 'Este es el pilar de Gamificación. Acércate a la estación de IKEA y descubre cómo convierten la compra en juego.',
      anim: 'talk',
    },
  },
};

export function getNextNodeId(script: DialogueScript, currentId: string): string | null {
  const node = script.nodes[currentId];
  if (!node) return null;
  if (node.choices && node.choices.length > 0) return null;
  const ids = Object.keys(script.nodes);
  const idx = ids.indexOf(currentId);
  if (idx < 0 || idx >= ids.length - 1) return null;
  return ids[idx + 1] ?? null;
}