import { useState } from 'react';

interface LeadCaptureProps {
  onSubmit: (name: string, email: string) => void;
}

export default function LeadCapture({ onSubmit }: LeadCaptureProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) newErrors.name = 'Tu nombre es necesario';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Necesitamos un email válido';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(name, email);
  };

  return (
    <div className="fi-screen fi-screen--lead">
      <div className="fi-lead-inner">
        <div className="fi-lead-badge">
          <span className="fi-lead-badge-dot" />
          <span>Test exclusivo</span>
        </div>
        <h1 className="fi-lead-title">
          TEST DE DINAMIZACIÓN
          <br />
          <span className="fi-title-accent">DIGITAL Y SOCIAL</span>
          <span className="fi-title-reg">®</span>
        </h1>
        <p className="fi-lead-subtitle">
          Descubre cómo las marcas más inteligentes aplican los 3 pilares que convierten
          audiencias pasivas en comunidades activas y rentables.
        </p>
        <div className="fi-lead-divider" />
        <form onSubmit={handleSubmit} className="fi-lead-form">
          <div className="fi-field-group">
            <label className="fi-field-label" htmlFor="fi-name">
              Tu nombre
            </label>
            <input
              id="fi-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Ej: María"
              className={`fi-field-input ${errors.name ? 'fi-field-input--error' : ''}`}
            />
            {errors.name && <span className="fi-field-error">{errors.name}</span>}
          </div>
          <div className="fi-field-group">
            <label className="fi-field-label" htmlFor="fi-email">
              Tu email
            </label>
            <input
              id="fi-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="maria@ejemplo.com"
              className={`fi-field-input ${errors.email ? 'fi-field-input--error' : ''}`}
            />
            {errors.email && <span className="fi-field-error">{errors.email}</span>}
          </div>
          <button type="submit" className="fi-cta-btn fi-cta-btn--gold">
            Comenzar Test
            <svg className="fi-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </form>
        <p className="fi-lead-disclaimer">
          🔒 Tus datos están seguros. Solo te enviaremos contenido relevante.
        </p>
      </div>
    </div>
  );
}
