import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { pillars } from '../../data/brandData';
import { PILLAR_ASSETS } from '../../data/pillarAssets';
import { AGATA_FRAME_WIDTH, AGATA_FRAME_HEIGHT } from '../config/agataAssets';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.load.spritesheet('agata-idle', '/assets/characters/agata-idle.png', {
      frameWidth: AGATA_FRAME_WIDTH,
      frameHeight: AGATA_FRAME_HEIGHT,
    });
    this.load.spritesheet('agata-jump', '/assets/characters/agata-jump.png', {
      frameWidth: AGATA_FRAME_WIDTH,
      frameHeight: AGATA_FRAME_HEIGHT,
    });
    this.load.spritesheet('agata-walk', '/assets/characters/agata-walk.png', {
      frameWidth: AGATA_FRAME_WIDTH,
      frameHeight: AGATA_FRAME_HEIGHT,
    });

    for (const pillar of pillars) {
      const asset = PILLAR_ASSETS[pillar.id as keyof typeof PILLAR_ASSETS];
      if (asset) {
        this.load.image(`pillar-icon-${pillar.id}`, asset.icon);
      }
    }

    // Audio SFX/VFX
    this.load.audio('ambient-horror', '/assets/audio/ambient.wav');
    this.load.audio('thunder', '/assets/audio/thunder.wav');
    this.load.audio('stone', '/assets/audio/stone.wav');
  }

  create(): void {
    EventBus.emit('current-scene-ready', this);
    this.scene.start('HubScene');
  }
}