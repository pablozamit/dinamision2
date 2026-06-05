/**
 * @deprecated Diálogo de Ágata vive en Phaser (`AgataGuide` + `AgataSpeechBubble`).
 * No montar en App — evita duplicar burbujas desconectadas del sprite.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventBus } from '../game/EventBus';
import { hubIntroDialogue, type BrandDialogue } from '../data/dialogueData';
import { findBrandById } from '../data/brandData';
import { buildBrandDialogue } from '../data/buildBrandDialogue';

export default function DialogueOverlay() {
  const [activeDialogue, setActiveDialogue] = useState<BrandDialogue | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  useEffect(() => {
    const startHubIntro = () => {
      setActiveDialogue(hubIntroDialogue);
      setCurrentNodeId(hubIntroDialogue.startNodeId);
    };

    const startPillarIntro = (pillarName: string) => {
      const pillarIntro: BrandDialogue = {
        startNodeId: 'start',
        nodes: {
          start: {
            id: 'start',
            speaker: 'agata',
            text: `¡Bienvenida al pilar de ${pillarName}! Aquí verás cómo estas marcas lo dan todo.`,
            options: [{ text: '¡A explorar!', nextId: '' }]
          }
        }
      };
      setActiveDialogue(pillarIntro);
      setCurrentNodeId('start');
    };

    const startBrandDialogue = (brandId: string) => {
      const brand = findBrandById(brandId);
      if (brand) {
        const dialogue = buildBrandDialogue(brand);
        setActiveDialogue(dialogue);
        setCurrentNodeId(dialogue.startNodeId);
      } else {
        // Generic fallback if dialogue not found
        const generic: BrandDialogue = {
          startNodeId: 'start',
          nodes: {
            start: {
              id: 'start',
              speaker: 'agata',
              text: `Próximamente descubriremos más sobre esta marca...`,
              options: [{ text: 'Volver', nextId: 'exit' }]
            }
          }
        };
        setActiveDialogue(generic);
        setCurrentNodeId('start');
      }
    };

    EventBus.on('start-hub-intro', startHubIntro);
    EventBus.on('start-pillar-intro', startPillarIntro);
    EventBus.on('start-brand-dialogue', startBrandDialogue);

    return () => {
      EventBus.off('start-hub-intro', startHubIntro);
      EventBus.off('start-pillar-intro', startPillarIntro);
      EventBus.off('start-brand-dialogue', startBrandDialogue);
    };
  }, []);

  if (!activeDialogue || !currentNodeId) return null;

  const node = activeDialogue.nodes[currentNodeId];
  if (!node) return null;

  const handleNext = () => {
    if (node.options && node.options.length > 0) return; // Must pick an option

    if (node.nextId === 'exit' || !node.nextId) {
      closeDialogue();
    } else {
      setCurrentNodeId(node.nextId);
    }
  };

  const handleOptionClick = (nextId: string) => {
    if (nextId === 'exit') {
      closeDialogueAndExit();
    } else if (!nextId) {
      closeDialogue();
    } else {
      setCurrentNodeId(nextId);
    }
  };

  const closeDialogue = () => {
    setActiveDialogue(null);
    setCurrentNodeId(null);
    EventBus.emit('dialogue-finished');
  };

  const closeDialogueAndExit = () => {
    setActiveDialogue(null);
    setCurrentNodeId(null);
    EventBus.emit('dialogue-exit-request');
  };

  return (
    <div className="fi-dialogue-overlay" onClick={handleNext}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentNodeId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fi-dialogue-box"
        >
          <div className="fi-dialogue-content">
            <p className="fi-dialogue-text">{node.text}</p>

            {node.options && (
              <div className="fi-dialogue-options" onClick={(e) => e.stopPropagation()}>
                {node.options.map((opt, i) => (
                  <button
                    key={i}
                    className="fi-dialogue-option-btn"
                    onClick={() => handleOptionClick(opt.nextId)}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {!node.options && (
              <div className="fi-dialogue-hint">
                Toca para continuar...
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
