import Phaser from 'phaser';
import { Portal, type PillarId } from '../entities/Portal';
import { AgataGuide } from '../entities/AgataGuide';
import { EventBus } from '../EventBus';
import { getSafeZones, getHubPortalPositions } from '../utils/layout';
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

  constructor() {
    super({ key: 'HubScene' });
  }

  init(): void {
    // La escena se reutiliza: permitir volver a mostrar Ágata e intro
    this.introPlayed = false;
  }

  create(): void {
    const zones = getSafeZones(this.scale);
    this.playBounds = zones.playArea;

    this.createDecor(zones);
    this.createPortals();

    this.agata = new AgataGuide(this);
    this.agata.showCharacter();

    EventBus.on('lead-capture-complete', this.startIntro, this);
    this.time.delayedCall(400, () => this.startIntro());

    this.scale.on('resize', this.onResize, this);
    this.events.on('portal-clicked', this.handlePortalClick, this);

    this.cameras.main.setBackgroundColor('#0a0a1e');
    this.cameras.main.fadeIn(500, 0, 0, 0);
    EventBus.emit('current-scene-ready', this);
  }

  private startIntro = (): void => {
    if (this.introPlayed) return;
    this.introPlayed = true;
    EventBus.emit('start-hub-intro');
  };

  private createDecor(zones: ReturnType<typeof getSafeZones>): void {
    const { width, height } = this.scale;
    const count = zones.isMobile ? 3 : 5;

    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(this.playBounds.x, width - 24);
      const y = Phaser.Math.Between(this.playBounds.y, height - 60);
      const platform = this.add.rectangle(x, y, 60, 10, 0x1a1a3a, 0.35);
      platform.setStrokeStyle(1, 0x3a3a6a, 0.4);
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
      const hint = this.add.text(width / 2, this.playBounds.y - 8, 'Pulsa el pilar donde quieras empezar', {
        fontSize: '13px',
        fontFamily: 'Montserrat, system-ui, sans-serif',
        color: '#888888',
      });
      hint.setOrigin(0.5, 1);
      this.decor.push(hint);
    }
  }

  private createPortals(): void {
    const positions = getHubPortalPositions(this.playBounds);
    this.portals = PILLAR_ORDER.map((id, index) =>
      Portal.fromPillar(this, positions[index].x, positions[index].y, id, false, index * 70),
    );
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
    EventBus.emit('dialogue-finished');
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
    this.agata?.destroy();
    this.agata = null;
  }
}