import { useState } from 'react';
import AvatarBubble from './AvatarBubble';
import BrandButton from './BrandButton';
import ResultCard from './ResultCard';
import { celebracionBrands } from '../data/brandData';

interface PillarCelebracionProps {
  userName: string;
  onContinue: () => void;
}

export default function PillarCelebracion({ userName, onContinue }: PillarCelebracionProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleBrandClick = (brandName: string) => {
    setSelectedBrand(brandName);
    setTimeout(() => setShowResult(true), 300);
  };

  const selectedData = celebracionBrands.find((b) => b.name === selectedBrand);

  return (
    <div className="fi-screen fi-screen--pillar">
      <div className="fi-pillar-inner">
        <div className="fi-pillar-header">
          <span className="fi-pillar-number">PILAR 3</span>
          <h2 className="fi-pillar-title">Celebración</h2>
          <p className="fi-pillar-greeting">Último pilar, <strong>{userName}</strong>. Descubre cómo las marcas celebran a sus clientes y los convierten en embajadores.</p>
        </div>
        <AvatarBubble text="¿Qué marca quieres descubrir en el pilar de Celebración?" />
        <div className={`fi-brands-grid ${showResult ? 'fi-brands-grid--hidden' : ''}`}>
          {celebracionBrands.map((brand) => (
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
              continueLabel="Ver Diagnóstico Final"
              onContinue={onContinue}
            />
          </div>
        )}
      </div>
    </div>
  );
}
