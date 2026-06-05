import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventBus } from '../game/EventBus';
import type { DialogueScript, DialogueNode, AgataAnimState } from '../data/agataDialogues';

interface AgataDialogueShowPayload {
  script: DialogueScript;
  chainIds?: string[];
}

/**
 * `AgataDialogue` - Burbujas de diálogo de Ágata sobre el canvas (tap + opciones).
 */
export default function AgataDialogue() {
  const [visible, setVisible] = useState(false);
  const [script, setScript] = useState<DialogueScript | null>(null);
  const [chainIds, setChainIds] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  const currentNode: DialogueNode | null =
    script && currentId ? script.nodes[currentId] ?? null : null;

  const emitAnim = useCallback((state: AgataAnimState) => {
    EventBus.emit('agata-anim', { state });
  }, []);

  const showNode = useCallback(
    (node: DialogueNode) => {
      setCurrentId(node.id);
      emitAnim(node.anim ?? 'talk');
    },
    [emitAnim],
  );

  const close = useCallback(() => {
    setVisible(false);
    setScript(null);
    setCurrentId(null);
    setChainIds([]);
    emitAnim('idle');
    EventBus.emit('agata-dialogue-hide');
  }, [emitAnim]);

  const advance = useCallback(() => {
    if (!script || !currentId) return;
    const node = script.nodes[currentId];
    if (node?.choices && node.choices.length > 0) return;

    const chainIndex = chainIds.indexOf(currentId);
    if (chainIndex >= 0 && chainIndex < chainIds.length - 1) {
      const next = script.nodes[chainIds[chainIndex + 1]];
      if (next) showNode(next);
      return;
    }

    close();
  }, [script, currentId, chainIds, showNode, close]);

  const handleChoice = (nextId: string): void => {
    if (!script) return;
    const next = script.nodes[nextId];
    if (next) showNode(next);
  };

  useEffect(() => {
    const onShow = (payload: AgataDialogueShowPayload): void => {
      const ids = payload.chainIds ?? [payload.script.startId];
      setScript(payload.script);
      setChainIds(ids);
      setVisible(true);
      const first = payload.script.nodes[ids[0] ?? payload.script.startId];
      if (first) showNode(first);
      EventBus.emit('agata-dialogue-show');
    };

    const onHide = (): void => close();
    const onAnchor = (pos: { x: number; y: number }): void => setAnchor(pos);

    EventBus.on('agata-dialogue-open', onShow);
    EventBus.on('agata-dialogue-hide', onHide);
    EventBus.on('agata-anchor', onAnchor);

    return () => {
      EventBus.off('agata-dialogue-open', onShow);
      EventBus.off('agata-dialogue-hide', onHide);
      EventBus.off('agata-anchor', onAnchor);
    };
  }, [close, showNode]);

  if (!visible || !currentNode) return null;

  const hasChoices = Boolean(currentNode.choices && currentNode.choices.length > 0);

  return (
    <AnimatePresence>
      <motion.div
        className="fi-agata-dialogue"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25 }}
        style={
          anchor
            ? ({
                '--agata-anchor-x': `${anchor.x}px`,
                '--agata-anchor-y': `${anchor.y}px`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <button
          type="button"
          className="fi-agata-dialogue__bubble"
          onClick={hasChoices ? undefined : advance}
          aria-label={hasChoices ? 'Diálogo de Ágata' : 'Toca para continuar'}
        >
          <span className="fi-agata-dialogue__name">Ágata</span>
          <p className="fi-agata-dialogue__text">{currentNode.text}</p>
          {!hasChoices && (
            <span className="fi-agata-dialogue__hint">Toca para continuar</span>
          )}
        </button>

        {hasChoices && (
          <div className="fi-agata-dialogue__choices">
            {currentNode.choices!.map((choice) => (
              <button
                key={choice.nextId}
                type="button"
                className={`fi-agata-dialogue__choice ${
                  choice.consequence === 'encourage'
                    ? 'fi-agata-dialogue__choice--gold'
                    : ''
                }`}
                onClick={() => handleChoice(choice.nextId)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}