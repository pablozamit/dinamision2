/**
 * audio.ts - Efectos de sonido procedurales con Web Audio API.
 *
 * Estrategia: cero assets externos. Cada sonido se genera en runtime
 * combinando osciladores y envolventes. Ventajas:
 *  - 0 KB adicionales al bundle
 *  - Latencia cero (no se descarga nada)
 *  - 100% determinista
 *
 * Web Audio requiere interacción del usuario previa (regla de los
 * navegadores). Por eso, los sonidos solo se reproducen tras el
 * submit del formulario de lead (que cuenta como gesto válido).
 */

let audioContext: AudioContext | null = null;

/**
 * Lazy init del AudioContext. Se llama una vez en el primer sonido.
 * Si la creación falla (navegador muy viejo, modo privado), se desactiva
 * silenciosamente — el juego sigue funcionando sin audio.
 */
function getContext(): AudioContext | null {
  if (audioContext) return audioContext;
  try {
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
    return audioContext;
  } catch {
    return null;
  }
}

/**
 * Reproduce una nota con un oscilador y una envolvente exponencial.
 * Helper privado usado por todos los efectos.
 */
function playTone(
  ctx: AudioContext,
  frequency: number,
  durationMs: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15,
  attackMs: number = 5,
): void {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  const now = ctx.currentTime;
  const attack = attackMs / 1000;
  const duration = durationMs / 1000;
  const decay = duration - attack;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

/**
 * Tipos de efectos disponibles. Mantener el set pequeño y significativo.
 */
export type SoundEffect =
  | 'pickup'
  | 'success'
  | 'fail'
  | 'click'
  | 'portal-enter';

/**
 * Reproduce un efecto procedural. Si no hay contexto de audio
 * disponible, la llamada es no-op (degradación elegante).
 *
 * @param effect - Tipo de sonido a reproducir
 */
export function playSound(effect: SoundEffect): void {
  const ctx = getContext();
  if (!ctx) return;

  switch (effect) {
    case 'pickup':
      // Blip ascendente corto: 880Hz -> 1320Hz
      playTone(ctx, 880, 80, 'sine', 0.12);
      setTimeout(() => playTone(ctx, 1320, 100, 'sine', 0.1), 40);
      break;

    case 'success':
      // Arpegio mayor C-E-G-C: sensación de logro
      playTone(ctx, 523.25, 120, 'triangle', 0.15);
      setTimeout(() => playTone(ctx, 659.25, 120, 'triangle', 0.15), 100);
      setTimeout(() => playTone(ctx, 783.99, 120, 'triangle', 0.15), 200);
      setTimeout(() => playTone(ctx, 1046.5, 250, 'triangle', 0.15), 300);
      break;

    case 'fail':
      // Tono descendente: 300Hz -> 150Hz, sawtooth
      playTone(ctx, 300, 250, 'sawtooth', 0.08);
      setTimeout(() => playTone(ctx, 150, 300, 'sawtooth', 0.06), 150);
      break;

    case 'click':
      // Click UI: square 220Hz, muy corto
      playTone(ctx, 220, 40, 'square', 0.06);
      break;

    case 'portal-enter':
      // Sweep ascendente mágico: 200Hz -> 800Hz
      playTone(ctx, 200, 300, 'sine', 0.1);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
      break;
  }
}
