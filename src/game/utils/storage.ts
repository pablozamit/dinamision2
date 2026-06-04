/**
 * Estado persistido de la sesión de juego en localStorage.
 * Permite al usuario cerrar y volver sin perder progreso.
 */
export interface GameProgress {
  name: string;
  email: string;
  startedAt: number;
  pillarsCompleted: string[];
  frasesClave: string[];
  currentPillar: string | null;
}

const STORAGE_KEY = 'agatapuig-mission-progress-v1';

/**
 * Guarda el estado del juego en localStorage.
 * No lanza errores: si falla (modo privado, cuota), degrada silenciosamente.
 *
 * @param progress - Estado a persistir
 */
export function saveProgress(progress: GameProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage no disponible: continuar sin persistencia
  }
}

/**
 * Recupera el estado del juego de localStorage.
 *
 * @returns Estado persistido o `null` si no existe o es inválido.
 */
export function loadProgress(): GameProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidProgress(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Elimina el progreso persistido. Llamado al enviar el lead si
 * queremos reset limpio, o desde el CTA final al cerrar sesión.
 */
export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorar
  }
}

/**
 * Validador runtime: comprueba que el objeto tiene la forma de `GameProgress`.
 * Defensivo contra datos corruptos o de versiones anteriores.
 */
function isValidProgress(value: unknown): value is GameProgress {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === 'string' &&
    typeof v.email === 'string' &&
    typeof v.startedAt === 'number' &&
    Array.isArray(v.pillarsCompleted) &&
    Array.isArray(v.frasesClave) &&
    (v.currentPillar === null || typeof v.currentPillar === 'string')
  );
}

/**
 * Crea un estado inicial con los datos del lead.
 * Helper para que el componente MissionIntro no tenga que ensamblar el objeto.
 */
export function createInitialProgress(name: string, email: string): GameProgress {
  return {
    name,
    email,
    startedAt: Date.now(),
    pillarsCompleted: [],
    frasesClave: [],
    currentPillar: null,
  };
}
