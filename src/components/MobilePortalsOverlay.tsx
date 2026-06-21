import { PILLAR_ORDER, PILLAR_ASSETS } from '../data/pillarAssets';
import type { PillarId } from '../game/entities/Portal';

interface Props {
  pillarsCompleted: string[];
  onPortalClick: (pillarId: PillarId) => void;
}

export default function MobilePortalsOverlay({ pillarsCompleted, onPortalClick }: Props) {
  return (
    <div className="fi-mobile-portals-overlay">
      {PILLAR_ORDER.map((id) => {
        const isCompleted = pillarsCompleted.includes(id);
        const asset = PILLAR_ASSETS[id];
        return (
          <button 
            key={id} 
            className={`fi-mobile-portal ${isCompleted ? 'completed' : ''}`}
            onClick={() => onPortalClick(id)}
          >
            <div className="fi-mobile-portal__icon-wrap">
              {asset && <img src={asset.icon} alt="" className="fi-mobile-portal__img" />}
            </div>
            <span className="fi-mobile-portal__label">
              {asset ? asset.label : id}
            </span>
            {isCompleted && <span className="fi-mobile-portal__badge">💀</span>}
          </button>
        );
      })}
    </div>
  );
}
