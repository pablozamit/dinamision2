import { BrandResult } from '../data/brandData';

interface ResultCardProps {
  result: BrandResult;
  continueLabel: string;
  onContinue: () => void;
}

export default function ResultCard({ result, continueLabel, onContinue }: ResultCardProps) {
  return (
    <div className="fi-result-card">
      <div className="fi-result-section">
        <span className="fi-result-label">Contexto</span>
        <p className="fi-result-text">{result.contexto}</p>
      </div>
      <div className="fi-result-section">
        <span className="fi-result-label">Conexión</span>
        <p className="fi-result-text">{result.conexion}</p>
      </div>
      <div className="fi-result-section">
        <span className="fi-result-label">Táctica</span>
        <p className="fi-result-text">{result.tactica}</p>
      </div>
      <div className="fi-result-section fi-result-section--highlight">
        <span className="fi-result-label">Frase Clave</span>
        <p className="fi-result-text fi-result-text--quote">{result.fraseClave}</p>
      </div>
      <button onClick={onContinue} className="fi-continue-btn">
        {continueLabel}
        <svg className="fi-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
