import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createInitialProgress, saveProgress, type GameProgress } from '../game/utils/storage';
import { EventBus } from '../game/EventBus';

interface MissionIntroProps {
  /** Callback con el progreso inicial cuando el lead se registra. */
  onComplete: (progress: GameProgress) => void;
}

/**
 * `MissionIntro` - Landing + captura de lead del juego.
 */
export default function MissionIntro({ onComplete }: MissionIntroProps) {
  const [phase, setPhase] = useState<'intro' | 'form' | 'welcome'>('intro');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  // Genera partículas para el efecto de bienvenida
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1.5, // Las partículas duran hasta 3 segundos
      size: 4 + Math.random() * 8,
    })),
  );

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) newErrors.name = 'Tu nombre es necesario';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Necesitamos un email válido';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const progress = createInitialProgress(name, email);
    saveProgress(progress);
    setPhase('welcome');
    EventBus.emit('lead-capture-complete', progress);
    
    // CORREGIDO: Subimos de 1600ms a 3500ms para dar tiempo a leer y permitir 
    // que el ciclo de vida de las partículas de framer-motion termine limpiamente.
    setTimeout(() => onComplete(progress), 3500);
  };

  return (
    <div className="fi-screen fi-screen--mission">
      <div className="fi-mission-bg" />

      <div className="fi-mission-layout">
        <div className="fi-mission-main">
          <AnimatePresence mode="wait">
            {phase === 'intro' && (
              <motion.div
                key="intro"
                className="fi-mission-inner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <div className="fi-mission-badge">
                  <span className="fi-mission-badge-dot" />
                  <span>agatapuig.com</span>
                </div>

                <h1 className="fi-mission-title">
                  <span className="fi-mission-pre">Misión:</span>
                  <br />
                  <span className="fi-mission-title-main">Sobrevive al Museo</span>
                  <br />
                  <span className="fi-mission-accent">de los Horrores de la Dinamización</span>
                </h1>

                <p className="fi-mission-subtitle">
                  En 8 minutos descubrirás los errores fatales que destruyeron a las marcas más grandes del mundo... y los Antídotos para que tu negocio no cometa los mismos.
                </p>

                <motion.button
                  type="button"
                  className="fi-cta-btn fi-cta-btn--gold fi-cta-btn--giant"
                  onClick={() => setPhase('form')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Entrar en la Cripta
                  <svg className="fi-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </motion.button>

                <p className="fi-mission-disclaimer">
                  ⏱ 8 minutos &nbsp;·&nbsp; 💀 12 Horrores &nbsp;·&nbsp; 🧪 12 Antídotos
                </p>
              </motion.div>
            )}

            {phase === 'form' && (
              <motion.div
                key="form"
                className="fi-mission-inner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="fi-form-title">
                  Regístrate como <span className="fi-text-gold">Investigador del Horror</span>
                </h2>
                <p className="fi-form-subtitle">
                  Para guardar tu progreso y recibir tu dossier de Antídotos.
                </p>
                <div className="fi-lead-divider" />
                <form onSubmit={handleSubmit} className="fi-lead-form">
                  <div className="fi-field-group">
                    <label className="fi-field-label" htmlFor="mi-name">
                      Tu nombre
                    </label>
                    <input
                      id="mi-name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="Ej: María"
                      className={`fi-field-input ${errors.name ? 'fi-field-input--error' : ''}`}
                      autoFocus
                    />
                    {errors.name && <span className="fi-field-error">{errors.name}</span>}
                  </div>
                  <div className="fi-field-group">
                    <label className="fi-field-label" htmlFor="mi-email">
                      Tu email
                    </label>
                    <input
                      id="mi-email"
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
                  <button type="submit" className="fi-cta-btn fi-cta-btn--gold fi-cta-btn--giant">
                    Registrarme
                    <svg className="fi-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </form>
                <p className="fi-lead-disclaimer">
                  🔒 Tus datos están seguros. Solo te enviaremos contenido relevante.
                </p>
              </motion.div>
            )}

            {phase === 'welcome' && (
              <motion.div
                key="welcome"
                className="fi-mission-welcome"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="fi-particles">
                  {particles.map((p) => (
                    <motion.span
                      key={p.id}
                      className="fi-particle"
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                      transition={{ duration: p.duration, delay: p.delay, repeat: 0 }}
                    />
                  ))}
                </div>
                <motion.h2
                  className="fi-welcome-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Bienvenido/a a la Cripta, <span className="fi-text-gold">{name}</span>.
                </motion.h2>
                <motion.p
                  className="fi-welcome-subtitle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  Tu investigación comienza ahora... si te atreves.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
