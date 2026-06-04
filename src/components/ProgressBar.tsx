import { motion } from 'framer-motion';

interface ProgressBarProps {
  /** Progreso total 0-3 pilares completados. */
  completedPillars: number;
  /** Total de pilares. */
  totalPillars: number;
  /** Pilar actualmente activo (para resaltar). */
  currentPillar: string | null;
  /** Frases clave recogidas hasta ahora. */
  frasesClaveCount: number;
}

/**
 * `ProgressBar` - HUD superior React sobre el canvas de Phaser.
 *
 * Muestra:
 *  - Progreso total de la misión
 *  - 3 iconos de pilares (se iluminan al completarse)
 *  - Contador de Frases Clave recogidas
 *
 * Es un overlay posicionado absolutamente; no interfiere con el canvas.
 */
export default function ProgressBar({
  completedPillars,
  totalPillars,
  currentPillar,
  frasesClaveCount,
}: ProgressBarProps) {
  const percentage = Math.round((completedPillars / totalPillars) * 100);

  const pillars = [
    { id: 'gamification', label: 'GAM', color: '#3a7bd5' },
    { id: 'acompanamiento', label: 'ACOMP', color: '#4caf50' },
    { id: 'celebracion', label: 'CELEB', color: '#f6a000' },
  ];

  return (
    <motion.div
      className="fi-hud-progress"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="fi-hud-progress-row">
        <div className="fi-hud-progress-label">
          <span className="fi-hud-progress-text">Progreso de la Misión</span>
          <span className="fi-hud-progress-percentage">{percentage}%</span>
        </div>
        <div className="fi-hud-progress-bar">
          <motion.div
            className="fi-hud-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="fi-hud-pillars">
        {pillars.map((p) => {
          const isActive = currentPillar === p.id;
          return (
            <motion.div
              key={p.id}
              className={`fi-hud-pillar ${isActive ? 'fi-hud-pillar--active' : ''}`}
              style={{ borderColor: p.color }}
              animate={isActive ? { scale: [1, 1.08, 1] } : {}}
              transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
            >
              <span className="fi-hud-pillar-dot" style={{ background: p.color }} />
              <span className="fi-hud-pillar-label">{p.label}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="fi-hud-frases">
        <span className="fi-hud-frases-icon">✨</span>
        <span className="fi-hud-frases-text">{frasesClaveCount} frases recogidas</span>
      </div>
    </motion.div>
  );
}
