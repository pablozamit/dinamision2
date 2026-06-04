import { useState } from 'react';
import AvatarBubble from './AvatarBubble';
import BrandButton from './BrandButton';
import ResultCard from './ResultCard';
import { acompanamientoBrands } from '../data/brandData';

interface PillarAcompanamientoProps {
  userName: string;
  onContinue: () => void;
}

export default function PillarAcompanamiento({ userName, onContinue }: PillarAcompanamientoProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleBrandClick = (brandName: string) => {
    setSelectedBrand(brandName);
    setTimeout(() => setShowResult(true), 300);
  };

  const selectedData = acompanamientoBrands.find((b) => b.name === selectedBrand);

  return (
    <div className="fi-screen fi-screen--pillar">
      <div className="fi-pillar-inner">
        <div className="fi-pillar-header">
          <span className="fi-pillar-number">PILAR 2</span>
          <h2 className="fi-pillar-title">Acompañamiento</h2>
          <p className="fi-pillar-greeting">Seguimos, <strong>{userName}</strong>. Ahora vamos a ver cómo las marcas logran que sus clientes nunca se sientan solos.</p>
        </div>
        <AvatarBubble text="¿Qué marca quieres descubrir en el pilar de Acompañamiento?" />
        <div className={`fi-brands-grid ${showResult ? 'fi-brands-grid--hidden' : ''}`}>
          {acompanamientoBrands.map((brand) => (
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
              continueLabel="Continuar al Pilar 3"
              onContinue={onContinue}
            />
          </div>
        )}
      </div>
    </div>
  );
}
