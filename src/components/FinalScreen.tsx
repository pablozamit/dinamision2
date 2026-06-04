interface FinalScreenProps {
  userName: string;
}

export default function FinalScreen({ userName }: FinalScreenProps) {
  return (
    <div className="fi-screen fi-screen--final">
      <div className="fi-final-inner">
        <div className="fi-final-icon-wrap">
          <svg className="fi-final-icon" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="#705893" strokeWidth="2" strokeDasharray="4 3" />
            <path d="M22 32l7 7 13-14" stroke="#f6a000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="fi-final-pretitle">{userName}, has completado el test</p>
        <h2 className="fi-final-title">
          Ya conoces el <span className="fi-text-gold">QUÉ</span>...
          <br />
          pero conocer el QUÉ no es lo mismo que
          <br />
          dominar el <span className="fi-text-gold">CÓMO</span>
        </h2>
        <div className="fi-final-divider" />
        <p className="fi-final-text">
          Has visto cómo IKEA, Starbucks, Duolingo o Spotify aplican los 3 pilares de la
          dinamización digital. Pero verlo no es implementarlo. El Experto Universitario en
          Dinamización Digital te da el sistema completo, las plantillas y el acompañamiento
          para que tu marca también lo logre.
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
