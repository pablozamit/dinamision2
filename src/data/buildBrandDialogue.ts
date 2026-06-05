import type { Brand } from './brandData';
import type { BrandDialogue } from './dialogueData';

/**
 * Construye el guion de Ágata para una sala de marca a partir de `brand.result`.
 */
export function buildBrandDialogue(brand: Brand): BrandDialogue {
  const { result } = brand;
  return {
    startNodeId: 'intro',
    nodes: {
      intro: {
        id: 'intro',
        speaker: 'agata',
        text: `Entremos en la historia de ${brand.name}.`,
        nextId: 'contexto',
      },
      contexto: {
        id: 'contexto',
        speaker: 'agata',
        text: result.contexto,
        nextId: 'conexion',
      },
      conexion: {
        id: 'conexion',
        speaker: 'agata',
        text: result.conexion,
        nextId: 'tactica',
      },
      tactica: {
        id: 'tactica',
        speaker: 'agata',
        text: result.tactica,
        nextId: 'frase',
      },
      frase: {
        id: 'frase',
        speaker: 'agata',
        text: result.fraseClave,
        onComplete: 'frase-clave-collected',
        options: [{ text: 'Volver al pilar', nextId: 'exit' }],
      },
    },
  };
}