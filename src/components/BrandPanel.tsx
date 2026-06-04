import { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { EventBus } from '../game/EventBus';
import type { Brand } from '../data/brandData';

interface BrandPanelProps {
  /** Marca actualmente abierta en el panel. `null` = panel cerrado. */
  brand: Brand | null;
  /** Callback para cerrar el panel (botón X). */
  onClose: () => void;
}

/**
 * `BrandPanel` - Panel overlay que aparece sobre el canvas Phaser.
 *
 * Renderiza:
 *  - Información de la marca (contexto, conexión, táctica, frase clave)
 *  - Mini-mecánica drag-drop para ordenar 4 frases de menos a más gamificadas
 *
 * Validación: solo hay 1 orden correcto (4! = 24 permutaciones).
 *  - Si coincide con `gamificationPhrases` original → emite `mechanic-complete`
 *  - Si no → emite `mechanic-fail` (con feedback visual)
 */
export default function BrandPanel({ brand, onClose }: BrandPanelProps) {
  const [showMechanic, setShowMechanic] = useState(false);

  // Cierra el panel con animación
  const handleClose = (): void => {
    setShowMechanic(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {brand && (
        <motion.div
          className="fi-brand-panel-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleClose}
        >
          <motion.div
            className="fi-brand-panel"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="fi-brand-panel-close"
              onClick={handleClose}
              aria-label="Cerrar panel"
            >
              ×
            </button>

            <div className="fi-brand-panel-header">
              <span className="fi-brand-panel-pillar">PILAR 1 · GAMIFICACIÓN</span>
              <h2 className="fi-brand-panel-title">{brand.name}</h2>
            </div>

            <div className="fi-brand-panel-body">
              <div className="fi-brand-section">
                <h3 className="fi-brand-section-title">Contexto</h3>
                <p className="fi-brand-section-text">{brand.result.contexto}</p>
              </div>

              <div className="fi-brand-section">
                <h3 className="fi-brand-section-title">Conexión con la dinamización</h3>
                <p className="fi-brand-section-text">{brand.result.conexion}</p>
              </div>

              <div className="fi-brand-section">
                <h3 className="fi-brand-section-title">Táctica principal</h3>
                <p className="fi-brand-section-text">{brand.result.tactica}</p>
              </div>

              {!showMechanic ? (
                <motion.button
                  type="button"
                  className="fi-cta-btn fi-cta-btn--gold"
                  onClick={() => setShowMechanic(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Empezar Mini-Mecánica
                  <svg className="fi-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </motion.button>
              ) : brand.result.gamificationPhrases ? (
                <DragDropMechanic
                  phrases={brand.result.gamificationPhrases}
                  brand={brand}
                  onComplete={() => {
                    EventBus.emit('mechanic-complete', { brand });
                    setTimeout(handleClose, 600);
                  }}
                />
              ) : (
                <p className="fi-brand-section-text">Mecánica no disponible para esta marca.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface DragDropMechanicProps {
  phrases: string[];
  brand: Brand;
  onComplete: () => void;
}

/**
 * `DragDropMechanic` - Mini-juego "ordena de menos a más gamificado".
 *
 * Usa `Reorder.Group` de framer-motion para reordenar verticalmente.
 * El usuario debe arrastrar las 4 frases para dejarlas en el orden
 * ascendente de impacto (que es el orden original en `gamificationPhrases`).
 *
 * Validación: compara el array actual con el original carácter por carácter.
 */
function DragDropMechanic({ phrases, brand, onComplete }: DragDropMechanicProps) {
  // Mezcla inicial aleatoria (determinista por marca para no ser siempre igual)
  const initialOrder = useMemo(() => {
    const seed = brand.name.charCodeAt(0) + brand.name.length;
    const shuffled = [...phrases];
    let s = seed;
    for (let i = shuffled.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Comprobar que no quedó en el orden correcto por casualidad
    if (shuffled.every((p, i) => p === phrases[i])) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
    return shuffled;
  }, [phrases, brand.name]);

  const [order, setOrder] = useState(initialOrder);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const handleValidate = (): void => {
    const isCorrect = order.every((phrase, idx) => phrase === phrases[idx]);
    if (isCorrect) {
      setFeedback('correct');
      setTimeout(onComplete, 500);
    } else {
      setFeedback('wrong');
      EventBus.emit('mechanic-fail');
      setTimeout(() => setFeedback('idle'), 1200);
    }
  };

  return (
    <div className="fi-mechanic">
      <h3 className="fi-mechanic-title">Ordena de menos a más gamificado</h3>
      <p className="fi-mechanic-hint">Arrastra para reordenar · menos arriba, más abajo</p>

      <Reorder.Group
        axis="y"
        values={order}
        onReorder={setOrder}
        className="fi-mechanic-list"
      >
        {order.map((phrase, idx) => (
          <Reorder.Item
            key={phrase}
            value={phrase}
            className={`fi-mechanic-item ${feedback === 'wrong' ? 'fi-mechanic-item--shake' : ''}`}
            whileDrag={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
            as="div"
          >
            <span className="fi-mechanic-item-handle">≡</span>
            <span className="fi-mechanic-item-index">{idx + 1}</span>
            <span className="fi-mechanic-item-text">{phrase}</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {feedback === 'correct' ? (
        <motion.div
          className="fi-mechanic-feedback fi-mechanic-feedback--ok"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          ✨ ¡Correcto! Has descifrado la gamificación de {brand.name}
        </motion.div>
      ) : (
        <button
          type="button"
          className="fi-cta-btn fi-cta-btn--gold"
          onClick={handleValidate}
        >
          Validar orden
        </button>
      )}

      {feedback === 'wrong' && (
        <p className="fi-mechanic-feedback fi-mechanic-feedback--err">
          ❌ Orden incorrecto. Revisa las posiciones e inténtalo de nuevo.
        </p>
      )}
    </div>
  );
}
