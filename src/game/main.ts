import Phaser from 'phaser';
import { EventBus } from './EventBus';
import { HubScene } from './scenes/HubScene';
import { PillarGamification } from './scenes/PillarGamification';

/**
 * Configuración base del juego Phaser 4.
 *
 * Notas de diseño:
 *  - `scale.RESIZE` + `autoCenter.CENTER_BOTH` permite que el canvas
 *    se adapte al contenedor React (mobile + desktop).
 *  - `activePointers: 3` habilita multitouch básico.
 *  - `pixelArt: false` porque el branding de Ágata Puig es
 *    vectorial/premium, no retro (mantener coherencia con la marca).
 *  - Las escenas se registran en el array `scene: []`.
 *    Se cargarán dinámicamente cuando se creen en `src/game/scenes/`.
 *  - Color de fondo: púrpura corporativo (`#705893`) para evitar
 *    flash blanco en el primer frame.
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#705893',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'phaser-container',
    width: '100%',
    height: '100%',
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  input: {
    activePointers: 3,
  },
  banner: false,
  scene: [HubScene, PillarGamification],
};

/**
 * Crea e inicializa una nueva instancia del juego Phaser.
 *
 * @param containerId - ID del elemento DOM (generado por el componente
 *                      React `<PhaserGame />`) donde se montará el canvas.
 * @returns Instancia de `Phaser.Game` lista para funcionar.
 *
 * Tras crear el juego, emite el evento `game-ready` en el EventBus
 * para notificar al componente React que puede registrar listeners
 * de escenas (`current-scene-ready`).
 */
export default function StartGame(containerId: string): Phaser.Game {
  const game = new Phaser.Game({
    ...config,
    parent: containerId,
  });

  EventBus.emit('game-ready', game);

  return game;
}
