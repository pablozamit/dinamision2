import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { PILLAR_ASSETS, PILLAR_ORDER } from '../../data/pillarAssets';

/**
 * `PreloadScene` - Carga assets de Ágata e iconos de pilares antes del Hub.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.load.spritesheet('agata', '/assets/characters/agata-sheet.png', {
      frameWidth: 520,
      frameHeight: 720,
    });

    for (const id of PILLAR_ORDER) {
      const asset = PILLAR_ASSETS[id];
      this.load.image(`pillar-icon-${id}`, asset.icon);
    }
  }

  create(): void {
    EventBus.emit('current-scene-ready', this);
    this.scene.start('HubScene');
  }
}