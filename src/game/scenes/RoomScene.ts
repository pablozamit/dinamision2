import Phaser from 'phaser';
import { AgataGuide } from '../entities/AgataGuide';
import { EventBus } from '../EventBus';
import type { Brand } from '../../data/brandData';
import { getSafeZones } from '../utils/layout';

export class RoomScene extends Phaser.Scene {
  private agata: AgataGuide | null = null;
  private brand!: Brand;
  private pillarId!: string;
  private playBounds = new Phaser.Geom.Rectangle(0, 0, 0, 0);
  private exitHint: Phaser.GameObjects.Text | null = null;
  private pillarCompletedEmitted = false;

  constructor() {
    super({ key: 'RoomScene' });
  }

  init(data: { brand: Brand; pillarId: string }): void {
    this.brand = data.brand;
    this.pillarId = data.pillarId;
  }

  create(): void {
    const zones = getSafeZones(this.scale);
    this.playBounds = zones.playArea;

    this.createRoomDecor(zones);
    this.createBackControl(zones);

    this.agata = new AgataGuide(this);
    this.agata.showCharacter();
    this.time.delayedCall(350, () => {
      EventBus.emit('start-brand-dialogue', this.brand.id);
    });

    EventBus.on('dialogue-finished', this.onDialogueFinished, this);
    EventBus.on('dialogue-exit-request', this.exitRoom, this);
    EventBus.on('frase-clave-collected', this.onFraseClaveCollected, this);

    this.cameras.main.setBackgroundColor('#080408');
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.scale.on('resize', this.onResize, this);

    // NUEVO: Registra el limpiador para que se ejecute al salir de esta pantalla
    this.events.once('shutdown', this.shutdown, this);

    EventBus.emit('current-scene-ready', this);
    EventBus.emit('brand-selected', this.brand);
  }

  private createRoomDecor(zones: ReturnType<typeof getSafeZones>): void {
    const { width } = this.scale;
    if (!zones.isMobile) {
      this.add
        .text(width / 2, zones.hudTop + 6, this.brand.name, {
          fontSize: '13px',
          fontFamily: 'Montserrat, system-ui, sans-serif',
          color: '#887799',
        })
        .setOrigin(0.5, 0);
    }

    const slots = 3;
    for (let i = 0; i < slots; i++) {
      const x = this.playBounds.x + (this.playBounds.width / (slots + 1)) * (i + 1);
      const y = this.playBounds.y + this.playBounds.height * 0.42;
      const rect = this.add.rectangle(x, y, 100, 130, 0x1a0a2a, 0.45);
      rect.setStrokeStyle(2, 0x3a1a4a, 0.8);
      this.tweens.add({
        targets: rect,
        alpha: 0.75,
        duration: 2000 + i * 400,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private createBackControl(zones: ReturnType<typeof getSafeZones>): void {
    const x = this.playBounds.right - 12;
    const y = this.playBounds.y + (zones.isMobile ? 6 : 12);
    const btn = this.add
      .text(x, y, '← Cripta', {
        fontSize: '13px',
        fontFamily: 'Montserrat, system-ui, sans-serif',
        color: '#fff',
        backgroundColor: '#00000088',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0)
      .setDepth(200)
      .setInteractive({ useHandCursor: true });
    btn.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev?: Event) => {
      ev?.stopPropagation();
      this.agata?.forceEndDialogue();
      this.exitRoom();
    });

    this.exitHint = this.add
      .text(this.playBounds.centerX, this.playBounds.bottom - 12, '', {
        fontSize: '12px',
        color: '#888',
        fontFamily: 'Montserrat, system-ui, sans-serif',
      })
      .setOrigin(0.5, 1)
      .setVisible(false);
  }

  private onDialogueFinished = (): void => {
    if (this.exitHint) {
      this.exitHint.setText('Pulsa ← Cripta para volver');
      this.exitHint.setVisible(true);
    }
  };

  private onFraseClaveCollected = (): void => {
    if (this.pillarCompletedEmitted) return;
    this.pillarCompletedEmitted = true;
    EventBus.emit('pillar-completed', this.pillarId);
  };

  private onResize = (): void => {
    const zones = getSafeZones(this.scale);
    this.playBounds = zones.playArea;
  };

  private exitRoom = (): void => {
    EventBus.emit('dialogue-finished');
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('PillarScene', { pillarId: this.pillarId });
    });
  };

  shutdown(): void {
    EventBus.off('dialogue-finished', this.onDialogueFinished, this);
    EventBus.off('dialogue-exit-request', this.exitRoom, this);
    EventBus.off('frase-clave-collected', this.onFraseClaveCollected, this);
    this.scale.off('resize', this.onResize, this);
    this.agata?.destroy();
    this.agata = null;
  }
}
