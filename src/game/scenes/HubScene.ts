import Phaser from 'phaser';
import { Portal, type PillarId } from '../entities/Portal';
import { AgataGuide } from '../entities/AgataGuide';
import { EventBus } from '../EventBus';
import { getSafeZones, getHubPortalPositions } from '../utils/layout';
import { loadProgress } from '../utils/storage';
import { PILLAR_ORDER } from '../../data/pillarAssets';

/**
 * Hub del museo: Ágata NPC, portales táctiles (sin avatar jugador).
 */
export class HubScene extends Phaser.Scene {
  private portals: Portal[] = [];
  private agata: AgataGuide | null = null;
  private decor: Phaser.GameObjects.GameObject[] = [];
  private playBounds = new Phaser.Geom.Rectangle(0, 0, 0, 0);
  private introPlayed = false;
  private lightningTimer: Phaser.Time.TimerEvent | null = null;
  private pillarsCompleted: string[] = [];

  constructor() {
    super({ key: 'HubScene' });
  }

  init(data?: { pillarsCompleted?: string[] }): void {
    // La escena se reutiliza: permitir volver a mostrar Ágata e intro
    this.introPlayed = false;
    const stored = loadProgress();
    this.pillarsCompleted = data?.pillarsCompleted ?? stored?.pillarsCompleted ?? [];
  }

  create(): void {
    const zones = getSafeZones(this.scale);
    this.playBounds = zones.playArea;

    this.createFog();
    this.createDecor(zones);
    this.createPortals();

    this.agata = new AgataGuide(this);
    this.agata.showCharacter();

    EventBus.on('lead-capture-complete', this.startIntro, this);
    this.time.delayedCall(400, () => this.startIntro());

    this.scale.on('resize', this.onResize, this);
    this.events.on('portal-clicked', this.handlePortalClick, this);

    this.cameras.main.setBackgroundColor('#0a030d');
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Reproducir ambiente si no está sonando ya
    const ambient = this.sound.get('ambient-horror');
    if (!ambient || !ambient.isPlaying) {
      this.sound.play('ambient-horror', { loop: true, volume: 0.3 });
    }

    this.scheduleLightning();

    EventBus.emit('current-scene-ready', this);
  }

  private startIntro = (): void => {
    if (this.introPlayed) return;
    this.introPlayed = true;
    EventBus.emit('start-hub-intro');
  };

  private createFog(): void {
    if (!this.textures.exists('fog-particle')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 16, 16);
      g.generateTexture('fog-particle', 32, 32);
    }
    const emitter = this.add.particles(0, 0, 'fog-particle', {
      x: { min: 0, max: this.scale.width },
      y: { min: this.scale.height - 200, max: this.scale.height },
      lifespan: 8000,
      speedX: { min: -10, max: 10 },
      speedY: { min: -5, max: -15 },
      scale: { start: 4, end: 10 },
      alpha: { start: 0, end: 0.05 },
      tint: 0x6a2b82,
      blendMode: 'ADD',
      frequency: 200,
    });
    emitter.setDepth(5);
  }

  private scheduleLightning(): void {
    const nextDelay = Phaser.Math.Between(5000, 15000);
    this.lightningTimer = this.time.delayedCall(nextDelay, () => {
      this.triggerLightning();
      this.scheduleLightning();
    });
  }

  private triggerLightning(): void {
    this.sound.play('thunder', { volume: 0.5 });
    this.cameras.main.flash(200, 200, 200, 255);
    this.cameras.main.shake(150, 0.002);
  }

  private createDecor(zones: ReturnType<typeof getSafeZones>): void {
    const { width, height } = this.scale;
    const count = zones.isMobile ? 3 : 5;

    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(this.playBounds.x, width - 24);
      const y = Phaser.Math.Between(this.playBounds.y, height - 60);
      const platform = this.add.rectangle(x, y, 60, 10, 0x1a0a2a, 0.35);
      platform.setStrokeStyle(1, 0x3a1a4a, 0.4);
      this.tweens.add({
        targets: platform,
        y: y - 12,
        alpha: 0.55,
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.decor.push(platform);
    }

    if (!zones.isMobile) {
      const hint = this.add.text(width / 2, this.playBounds.y - 8, 'Explora los portales del horror', {
        fontSize: '14px',
        fontFamily: 'Montserrat, system-ui, sans-serif',
        color: '#aaaaaa',
      });
      hint.setOrigin(0.5, 1);
      this.decor.push(hint);
    }
  }

  private createPortals(): void {
    const positions = getHubPortalPositions(this.playBounds);
    this.portals = PILLAR_ORDER.map((id, index) => {
      const portal = Portal.fromPillar(this, positions[index].x, positions[index].y, id, false, index * 70);
      if (this.pillarsCompleted.includes(id)) {
        portal.markCompleted();
      }
      return portal;
    });
  }

  private onResize = (): void => {
    const zones = getSafeZones(this.scale);
    this.playBounds = zones.playArea;
    const positions = getHubPortalPositions(this.playBounds);
    this.portals.forEach((portal, i) => {
      portal.container.setPosition(positions[i].x, positions[i].y);
    });
  };

  private handlePortalClick(pillarId: PillarId): void {
    this.agata?.forceEndDialogue();
    this.enterPortal(pillarId);
  }

  private enterPortal(pillarId: PillarId): void {
    EventBus.emit('portal-entered', pillarId);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('PillarScene', { pillarId });
    });
  }

  shutdown(): void {
    this.scale.off('resize', this.onResize, this);
    this.events.off('portal-clicked', this.handlePortalClick, this);
    EventBus.off('lead-capture-complete', this.startIntro, this);
    if (this.lightningTimer) this.lightningTimer.remove();
    this.agata?.destroy();
    this.agata = null;
  }
}