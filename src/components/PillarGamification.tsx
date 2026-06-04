import { useState } from 'react';
import AvatarBubble from './AvatarBubble';
import BrandButton from './BrandButton';
import ResultCard from './ResultCard';
import { gamificationBrands } from '../data/brandData';

interface PillarGamificationProps {
  userName: string;
  onContinue: () => void;
}

export default function PillarGamification({ userName, onContinue }: PillarGamificationProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleBrandClick = (brandName: string) => {
    setSelectedBrand(brandName);
    setTimeout(() => setShowResult(true), 300);
  };

  const selectedData = gamificationBrands.find((b) => b.name === selectedBrand);

  return (
    <div className="fi-screen fi-screen--pillar">
      <div className="fi-pillar-inner">
        <div className="fi-pillar-header">
          <span className="fi-pillar-number">PILAR 1</span>
          <h2 className="fi-pillar-title">Gamificación</h2>
          <p className="fi-pillar-greeting">Hola, <strong>{userName}</strong>. Empecemos por descubrir cómo las marcas usan la gamificación para atrapar a sus audiencias.</p>
        </div>
        <AvatarBubble text="¿Qué marca quieres descubrir cómo aplica la gamificación?" />
        <div className={`fi-brands-grid ${showResult ? 'fi-brands-grid--hidden' : ''}`}>
          {gamificationBrands.map((brand) => (
            <BrandButton
              key={brand.name}
              name={brand.name}
              onClick={() => handleBrandClick(brand.name)}
              selected={selectedBrand === brand.name}
            />
          ))}
        </div>
        {showResult && selectedData && (
          <div className="fi-result-animate">
            <ResultCard
              result={selectedData.result}
              continueLabel="Continuar al Pilar 2"
              onContinue={onContinue}
            />
          </div>
        )}
      </div>
    </div>
  );
}
