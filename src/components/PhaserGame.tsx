import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import StartGame from '../game/main';
import { EventBus } from '../game/EventBus';

/**
 * Referencia mutable al estado vivo del juego Phaser.
 *
 * Permite a un componente padre (p. ej. `App.tsx`) acceder a la
 * instancia de `Phaser.Game` y a la escena activa sin acoplarse
 * a la implementación interna.
 *
 * Importante: la comunicación de datos (puntos, vidas, eventos)
 * se hace SIEMPRE vía `EventBus`, no mutando este ref directamente.
 */
export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface PhaserGameProps {
  /**
   * Ref externo opcional. Si se omite, se usa un ref interno local.
   * Útil para que `App.tsx` pueda acceder al juego desde fuera.
   */
  ref?: RefObject<IRefPhaserGame | null>;
}

/**
 * `PhaserGame` - Componente React que monta una instancia de Phaser 4.
 *
 * Responsabilidades:
 *  1. Crear el juego al montarse (llamando a `StartGame`).
 *  2. Suscribirse al evento `current-scene-ready` del EventBus
 *     para trackear qué escena está activa.
 *  3. Destruir la instancia de Phaser al desmontarse (cleanup
 *     riguroso para evitar memory leaks y canvases huérfanos).
 *
 * No contiene lógica de juego: las escenas viven en `src/game/scenes/`.
 *
 * @example
 * // En App.tsx
 * const gameRef = useRef<IRefPhaserGame>({ game: null, scene: null });
 * return <PhaserGame ref={gameRef} />;
 */
function PhaserGame({ ref: externalRef }: PhaserGameProps) {
  const internalRef = useRef<IRefPhaserGame>({ game: null, scene: null });
  const refToUse: RefObject<IRefPhaserGame> = (externalRef ?? internalRef) as RefObject<IRefPhaserGame>;

  useEffect(() => {
    const game = StartGame('phaser-container');
    refToUse.current.game = game;

    const handleSceneReady = (scene: Phaser.Scene): void => {
      refToUse.current.scene = scene;
    };

    EventBus.on('current-scene-ready', handleSceneReady);

    return () => {
      EventBus.off('current-scene-ready', handleSceneReady);
      const ref = refToUse.current;
      ref.game = null;
      ref.scene = null;
      game.destroy(true);
    };
  }, [refToUse]);

  return <div id="phaser-container" style={{ width: '100%', height: '100%' }} />;
}

export default PhaserGame;
