import { useState, useEffect, useCallback } from 'react';
import { EventBus } from '../game/EventBus';
import type { BrandDialogue, DialogueNode } from '../data/dialogueData';
import { hubIntroDialogue } from '../data/dialogueData';
import { findBrandById } from '../data/brandData';
import { buildBrandDialogue } from '../data/buildBrandDialogue';

interface DialogueState {
  dialogue: BrandDialogue;
  nodeId: string;
  brandId: string | null;
}

export default function AgataDialogueOverlay() {
  const [state, setState] = useState<DialogueState | null>(null);

  const startDialogue = useCallback((dialogue: BrandDialogue, brandId: string | null = null) => {
    setState({ dialogue, nodeId: dialogue.startNodeId, brandId });
  }, []);

  const endDialogue = useCallback(() => {
    setState(null);
    EventBus.emit('dialogue-finished');
  }, []);

  const advance = useCallback((node: DialogueNode) => {
    if (node.options && node.options.length > 0) return;
    if (!node.nextId || node.nextId === 'end' || node.nextId === 'exit') {
      endDialogue();
      return;
    }
    setState((prev) => prev ? { ...prev, nodeId: node.nextId! } : null);
  }, [endDialogue]);

  const handleChoice = useCallback((nextId: string) => {
    if (!nextId || nextId === 'end') { endDialogue(); return; }
    if (nextId === 'exit') { EventBus.emit('dialogue-exit-request'); endDialogue(); return; }
    setState((prev) => prev ? { ...prev, nodeId: nextId } : null);
  }, [endDialogue]);

  useEffect(() => {
    const onHubIntro = () => startDialogue(hubIntroDialogue);

    const onPillarIntro = (pillarName: string) => {
      startDialogue({
        startNodeId: 'start',
        nodes: {
          start: {
            id: 'start', speaker: 'agata',
            text: `¡Cuidado! Has entrado en las ruinas del pilar de ${pillarName}. Toca una lápida para desenterrar su trágico error...`,
            nextId: 'end',
          },
          end: {
            id: 'end', speaker: 'agata',
            text: '¡Cada tumba esconde un Antídoto que necesitas. ¡Investiga!',
            options: [{ text: '💀 ¡A investigar!', nextId: '' }],
          },
        },
      });
    };

    const onBrandDialogue = (brandId: string) => {
      const brand = findBrandById(brandId);
      if (brand) { startDialogue(buildBrandDialogue(brand), brandId); return; }
      startDialogue({
        startNodeId: 'start',
        nodes: {
          start: {
            id: 'start', speaker: 'agata',
            text: 'Próximamente más secretos de esta marca…',
            options: [{ text: 'Volver', nextId: 'exit' }],
          },
        },
      });
    };

    // Listener de seguridad: si Phaser cambia de escena, cerramos el diálogo forzosamente.
    const onSceneReady = () => {
      if (state) {
        setState(null);
      }
    };

    EventBus.on('start-hub-intro', onHubIntro);
    EventBus.on('start-pillar-intro', onPillarIntro);
    EventBus.on('start-brand-dialogue', onBrandDialogue);
    EventBus.on('current-scene-ready', onSceneReady);

    return () => {
      EventBus.off('start-hub-intro', onHubIntro);
      EventBus.off('start-pillar-intro', onPillarIntro);
      EventBus.off('start-brand-dialogue', onBrandDialogue);
      EventBus.off('current-scene-ready', onSceneReady);
    };
  }, [startDialogue, state]);

  useEffect(() => {
    if (!state) return;
    const node = state.dialogue.nodes[state.nodeId];
    if (node?.onComplete === 'frase-clave-collected' && state.brandId) {
      const brand = findBrandById(state.brandId);
      if (brand) EventBus.emit('frase-clave-collected', brand.result.fraseClave);
    }
  }, [state]);

  if (!state) return null;

  const node = state.dialogue.nodes[state.nodeId];
  if (!node) return null;

  const hasChoices = Boolean(node.options && node.options.length > 0);

  return (
    <div className="fi-agata-dialogue" role="dialog" aria-label="Diálogo de Ágata">
      <div
        className="fi-agata-dialogue__bubble"
        onClick={!hasChoices ? () => advance(node) : undefined}
      >
        <span className="fi-agata-dialogue__name">Ágata</span>
        <p className="fi-agata-dialogue__text">{node.text}</p>
        {!hasChoices && (
          <span className="fi-agata-dialogue__hint">Toca para continuar</span>
        )}
      </div>

      {hasChoices && node.options && (
        <div className="fi-agata-dialogue__choices">
          {node.options.map((opt) => (
            <button
              key={opt.nextId}
              className="fi-agata-dialogue__choice"
              onClick={() => handleChoice(opt.nextId)}
            >
              {opt.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
