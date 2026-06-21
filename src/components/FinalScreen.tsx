interface FinalScreenProps {
  userName: string;
}

export default function FinalScreen({ userName }: FinalScreenProps) {
  return (
    <div className="fi-screen fi-screen--final">
      <div className="fi-final-inner">
        <div className="fi-final-icon-wrap">
          <svg className="fi-final-icon" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="#8a2be2" strokeWidth="2" strokeDasharray="4 3" />
            <text x="32" y="38" textAnchor="middle" fill="#d32f2f" fontSize="28">💀</text>
          </svg>
        </div>
        <p className="fi-final-pretitle">{userName}, has sobrevivido al Museo de los Horrores</p>
        <h2 className="fi-final-title">
          Ya conoces los <span className="fi-text-gold">ERRORES</span> que destruyeron imperios...
          <br />
          pero conocer el error no es lo mismo que
          <br />
          dominar el <span className="fi-text-gold">ANTÍDOTO</span>
        </h2>
        <div className="fi-final-divider" />
        <p className="fi-final-text">
          Has visto cómo Foursquare, Netflix, BlackBerry o Blockbuster cayeron por ignorar los
          4 pilares de la dinamización digital. Pero ver sus tumbas no es suficiente. El Experto
          Universitario en Dinamización Digital te da el sistema completo, las plantillas y el
          acompañamiento para que tu marca no acabe en este cementerio.
        </p>
        <a
          href="https://agatapuig.com/experto-universitario-en-dinamizacion-digital-2025/"
          className="fi-cta-btn fi-cta-btn--giant"
          target="_blank"
          rel="noopener noreferrer"
        >
          Descubrir el Experto Universitario
          <svg className="fi-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
        <p className="fi-final-small">
          Las plazas son limitadas. Cada edición se completa antes del cierre.
        </p>
      </div>
    </div>
  );
}
