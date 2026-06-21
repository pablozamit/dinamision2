import Phaser from 'phaser';
import { AgataGuide } from '../entities/AgataGuide';
import { EventBus } from '../EventBus';
import type { Brand } from '../../data/brandData';
import { getSafeZones } from '../utils/layout';

const ROOM_DEPTH = 30;
const UI_DEPTH = 200;

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

    this.events.once('shutdown', this.shutdown, this);

    EventBus.emit('current-scene-ready', this);
    EventBus.emit('brand-selected', this.brand);
  }

  private createRoomDecor(zones: ReturnType<typeof getSafeZones>): void {
    const centerX = this.playBounds.centerX;
    const centerY = this.playBounds.y + this.playBounds.height * 0.45;

    const glow = this.add.graphics().setDepth(ROOM_DEPTH);
    glow.fillStyle(0x705893, 0.12);
    glow.fillCircle(centerX, centerY, zones.isMobile ? 110 : 140);

    const altar = this.add.graphics().setDepth(ROOM_DEPTH + 1);
    const aw = zones.isMobile ? 160 : 220;
    const ah = zones.isMobile ? 120 : 150;
    altar.fillStyle(0x1a1a2e, 0.85);
    altar.fillRoundedRect(centerX - aw / 2, centerY - ah / 2, aw, ah, 12);
    altar.lineStyle(2, 0xf6a000, 0.6);
    altar.strokeRoundedRect(centerX - aw / 2, centerY - ah / 2, aw, ah, 12);

    const initials = this.brand.name
      .split(' ')
      .map((w) => w.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();

    this.add.text(centerX, centerY - (zones.isMobile ? 14 : 20), initials, {
      fontSize: zones.isMobile ? '36px' : '48px',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      alpha: 0.85
    }).setOrigin(0.5, 0.5).setDepth(ROOM_DEPTH + 2);

    this.add.text(centerX, centerY + (zones.isMobile ? 24 : 32), this.brand.name.toUpperCase(), {
      fontSize: zones.isMobile ? '14px' : '16px',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      color: '#f6a000',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5, 0.5).setDepth(ROOM_DEPTH + 2);

    this.tweens.add({
      targets: glow,
      alpha: 0.4,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
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
      .setDepth(UI_DEPTH)
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

  // CORREGIDO: Ahora te expulsa directamente hacia HubScene (los 4 pilares)
  private exitRoom = (): void => {
    EventBus.emit('dialogue-finished');
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('HubScene');
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
