import { motion } from 'framer-motion';
import { PILLAR_ASSETS, PILLAR_ORDER } from '../data/pillarAssets';

interface ProgressBarProps {
  completedPillars: number;
  totalPillars: number;
  currentPillar: string | null;
  frasesClaveCount: number;
}

/**
 * HUD del hub — dos zonas: barra de título/progreso + fila de pilares.
 */
export default function ProgressBar({
  completedPillars,
  totalPillars,
  currentPillar,
  frasesClaveCount,
}: ProgressBarProps) {
  const percentage = Math.round((completedPillars / totalPillars) * 100);

  return (
    <header className="fi-hud">
      <div className="fi-hud__topband">
        <h1 className="fi-hud__title">
          <span className="fi-hud__title-full">Museo de los Horrores</span>
          <span className="fi-hud__title-short">Horrores · Dinamización</span>
        </h1>
        <span className="fi-hud__percent" aria-label={`Progreso ${percentage} por ciento`}>
          {percentage}%
        </span>
      </div>

      <div className="fi-hud__pillars-band">
        <nav className="fi-hud__pillars" aria-label="Pilares de la misión">
          <ul className="fi-hud__pillars-list">
            {PILLAR_ORDER.map((id) => {
              const p = PILLAR_ASSETS[id];
              const isActive = currentPillar === id;
              return (
                <li key={p.id}>
                  <div
                    className={`fi-hud__pillar ${isActive ? 'fi-hud__pillar--active' : ''}`}
                    style={{
                      borderColor: `#${(p.color & 0xffffff).toString(16).padStart(6, '0')}`,
                    }}
                    title={p.label}
                  >
                    <img
                      src={p.icon}
                      alt=""
                      className="fi-hud__pillar-icon"
                      width={40}
                      height={40}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="fi-hud__desktop-extra" aria-hidden="true">
        <p className="fi-hud__subtitle fi-hud__mobile-hide">4 criptas · 12 antídotos</p>
        <div className="fi-hud__meta">
          <span className="fi-hud__frases fi-hud__mobile-hide">{frasesClaveCount} antídotos</span>
          <div className="fi-hud__bar-track">
            <motion.div
              className="fi-hud__bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}