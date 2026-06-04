import Phaser from 'phaser';

/**
 * EventBus - Canal único y desacoplado de comunicación entre Phaser y React.
 *
 * Wrapper sobre `Phaser.Events.EventEmitter` que sigue el patrón oficial
 * del template Phaser + React. Garantiza que:
 *  - Las escenas de Phaser **emiten** eventos (p. ej. `current-scene-ready`).
 *  - Los componentes React **se suscriben** con `EventBus.on()` / `off()`.
 *  - Nunca se accede al `game` o `scene` directamente desde React
 *    fuera de este contrato (regla del proyecto).
 *
 * Eventos definidos:
 *  - `current-scene-ready` → emitido por una escena al terminar `create()`.
 *                            Payload: `Phaser.Scene`
 *  - `game-ready`          → emitido por `main.ts` tras instanciar el juego.
 *                            Payload: `Phaser.Game`
 *
 * @example
 * // Desde Phaser (dentro de una escena)
 * this.events.emit('current-scene-ready', this);
 * EventBus.emit('score-updated', { points: 100 });
 *
 * @example
 * // Desde React
 * useEffect(() => {
 *   const handler = (data: { points: number }) => setScore(data.points);
 *   EventBus.on('score-updated', handler);
 *   return () => { EventBus.off('score-updated', handler); };
 * }, []);
 */
export const EventBus: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();
