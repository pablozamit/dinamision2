import { motion } from 'framer-motion';
import { PILLAR_ASSETS, PILLAR_ORDER } from '../data/pillarAssets';

interface ProgressBarProps {
  completedPillars: number;
  totalPillars: number;
  currentPillar: string | null;
  frasesClaveCount: number;
}

/**
 * `ProgressBar` - HUD superior con iconos de los 4 pilares.
 */
export default function ProgressBar({
  completedPillars,
  totalPillars,
  currentPillar,
  frasesClaveCount,
}: ProgressBarProps) {
  const percentage = Math.round((completedPillars / totalPillars) * 100);

  return (
    <motion.div
      className="fi-hud-progress"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="fi-hud-progress-row">
        <div className="fi-hud-progress-label">
          <span className="fi-hud-progress-text">Misión</span>
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
        {PILLAR_ORDER.map((id) => {
          const p = PILLAR_ASSETS[id];
          const isActive = currentPillar === id;
          return (
            <motion.div
              key={p.id}
              className={`fi-hud-pillar ${isActive ? 'fi-hud-pillar--active' : ''}`}
              style={{
                borderColor: `#${(p.color & 0xffffff).toString(16).padStart(6, '0')}`,
              }}
              animate={isActive ? { scale: [1, 1.06, 1] } : {}}
              transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
            >
              <img
                src={p.icon}
                alt={p.label}
                className="fi-hud-pillar-icon"
                width={32}
                height={32}
              />
              <span className="fi-hud-pillar-label">{p.label.slice(0, 5)}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="fi-hud-frases">
        <span className="fi-hud-frases-icon">✨</span>
        <span className="fi-hud-frases-text">{frasesClaveCount} frases</span>
      </div>
    </motion.div>
  );
}