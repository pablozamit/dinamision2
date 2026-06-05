import Phaser from 'phaser';
import { AgataGuide } from '../entities/AgataGuide';
import { EventBus } from '../EventBus';
import { pillars, type PillarData, type Brand } from '../../data/brandData';
import { getSafeZones, getPillarStationPositions } from '../utils/layout';

const STATION_DEPTH = 40;
const UI_DEPTH = 200;

export class PillarScene extends Phaser.Scene {
  private agata: AgataGuide | null = null;
  private pillarData!: PillarData;
  private stationZones: Phaser.GameObjects.Zone[] = [];
  private playBounds = new Phaser.Geom.Rectangle(0, 0, 0, 0);
  private decor: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: 'PillarScene' });
  }

  init(data: { pillarId?: string }): void {
    const pillarId = data?.pillarId;
    const found = pillarId ? pillars.find((p) => p.id === pillarId) : undefined;
    if (!found) {
      this.scene.start('HubScene');
      return;
    }
    this.pillarData = found;
  }

  create(): void {
    if (!this.pillarData) return;

    const zones = getSafeZones(this.scale);
    this.playBounds = zones.playArea;

    this.createDecor(zones);
    this.createStations();
    this.createBackButton(zones);

    this.agata = new AgataGuide(this);
    this.agata.showCharacter();
    this.time.delayedCall(350, () => {
      EventBus.emit('start-pillar-intro', this.pillarData.name);
    });

    this.cameras.main.setBackgroundColor('#0a1428');
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.scale.on('resize', this.onResize, this);

    EventBus.emit('current-scene-ready', this);
    EventBus.emit('pillar-progress-updated', {
      pillar: this.pillarData.id,
      completed: 0,
      total: this.pillarData.brands.length,
    });
  }

  private createDecor(zones: ReturnType<typeof getSafeZones>): void {
    if (!zones.isMobile) {
      const title = this.add.text(
        this.scale.width / 2,
        zones.hudTop + 8,
        this.pillarData.name.toUpperCase(),
        {
          fontSize: '14px',
          fontFamily: 'Montserrat, system-ui, sans-serif',
          color: Phaser.Display.Color.IntegerToColor(this.pillarData.glowColor).rgba,
          fontStyle: 'bold',
        },
      );
      title.setOrigin(0.5, 0);
      title.setAlpha(0.65);
      this.decor.push(title);
    }

    if (!zones.isMobile) {
      const hint = this.add.text(
        this.playBounds.centerX,
        this.playBounds.y - 6,
        'Toca una marca para entrar en su historia',
        {
          fontSize: '12px',
          fontFamily: 'Montserrat, system-ui, sans-serif',
          color: '#666666',
        },
      );
      hint.setOrigin(0.5, 1);
      this.decor.push(hint);
    }
  }

  private createStations(): void {
    const positions = getPillarStationPositions(
      this.playBounds,
      this.pillarData.brands.length,
    );

    this.pillarData.brands.forEach((brand, i) => {
      const { x, y } = positions[i];

      const glow = this.add.circle(x, y, 42, this.pillarData.color, 0.2).setDepth(STATION_DEPTH);
      const body = this.add
        .rectangle(x, y, 64, 64, 0x1a4ba0, 0.85)
        .setStrokeStyle(3, this.pillarData.glowColor, 1)
        .setDepth(STATION_DEPTH + 1);
      const name = this.add
        .text(x, y + 48, brand.name, {
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#ffffff',
          fontFamily: 'Montserrat, system-ui, sans-serif',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5, 0)
        .setDepth(STATION_DEPTH + 2);

      const zone = this.add
        .zone(x, y, 88, 110)
        .setDepth(STATION_DEPTH + 3)
        .setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this.onStationClick(brand));
      zone.on('pointerover', () => {
        this.tweens.add({
          targets: glow,
          scale: 1.2,
          duration: 120,
          yoyo: true,
        });
      });
      this.stationZones.push(zone);

      this.tweens.add({
        targets: glow,
        scale: 1.15,
        alpha: 0.08,
        duration: 1500 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      zone.setData('brand', brand);
      zone.setData('visuals', { glow, body, name });
    });
  }

  private onStationClick(brand: Brand): void {
    this.agata?.forceEndDialogue();
    this.enterRoom(brand);
  }

  private createBackButton(zones: ReturnType<typeof getSafeZones>): void {
    const x = this.playBounds.right - 12;
    const y = this.playBounds.y + (zones.isMobile ? 6 : 12);
    const backBtn = this.add
      .text(x, y, '← Museo', {
        fontSize: zones.isMobile ? '13px' : '15px',
        fontFamily: 'Montserrat, system-ui, sans-serif',
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0)
      .setDepth(UI_DEPTH)
      .setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev?: Event) => {
      ev?.stopPropagation();
      this.onBackClick();
    });
  }

  private onBackClick(): void {
    this.agata?.forceEndDialogue();
    this.returnToHub();
  }

  private onResize = (): void => {
    const zones = getSafeZones(this.scale);
    this.playBounds = zones.playArea;
    const positions = getPillarStationPositions(
      this.playBounds,
      this.pillarData.brands.length,
    );
    this.stationZones.forEach((zone, i) => {
      const { x, y } = positions[i];
      zone.setPosition(x, y);
      const visuals = zone.getData('visuals') as {
        glow: Phaser.GameObjects.Arc;
        body: Phaser.GameObjects.Rectangle;
        name: Phaser.GameObjects.Text;
      };
      if (visuals) {
        visuals.glow.setPosition(x, y);
        visuals.body.setPosition(x, y);
        visuals.name.setPosition(x, y + 48);
      }
    });
  };

  private enterRoom(brand: Brand): void {
    EventBus.emit('dialogue-finished');
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('RoomScene', { brand, pillarId: this.pillarData.id });
    });
  }

  private returnToHub(): void {
    EventBus.emit('dialogue-finished');
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('HubScene');
    });
  }

  shutdown(): void {
    this.scale.off('resize', this.onResize, this);
    this.stationZones.forEach((z) => z.destroy());
    this.stationZones = [];
    this.agata?.destroy();
    this.agata = null;
  }
}