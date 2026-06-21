import type { Brand } from './brandData';
import type { BrandDialogue } from './dialogueData';

/**
 * Construye el guion de Ágata para una sala de marca a partir de `brand.result`.
 */
export function buildBrandDialogue(brand: Brand | undefined): BrandDialogue {
  if (!brand || !brand.result) {
    return {
      startNodeId: 'error',
      nodes: {
        error: {
          id: 'error',
          speaker: 'agata',
          text: 'Esta lápida está borrosa... No logro leer su inscripción.',
          options: [{ text: 'Volver al pilar', nextId: '' }],
        }
      }
    };
  }

  const { result } = brand;
  return {
    startNodeId: 'intro',
    nodes: {
      intro: {
        id: 'intro',
        speaker: 'agata',
        text: `Acerquémonos a la lápida de ${brand.name}...`,
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
        text: `⚠️ ${result.conexion}`,
        nextId: 'tactica',
      },
      tactica: {
        id: 'tactica',
        speaker: 'agata',
        text: `💀 ${result.tactica}`,
        nextId: 'frase',
      },
      frase: {
        id: 'frase',
        speaker: 'agata',
        text: `🧪 ${result.fraseClave}`,
        onComplete: 'frase-clave-collected',
        // CORREGIDO: Volvemos a usar 'exit' para que AgataGuide intercepte la acción y ejecute la salida automática
        options: [{ text: '💀 Recoger el Antídoto y volver', nextId: 'exit' }], 
      },
    },
  };
}
