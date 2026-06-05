import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Portal, type PillarId } from '../entities/Portal';
import { AgataGuide } from '../entities/AgataGuide';
import { EventBus } from '../EventBus';
import { getSafeZones, getHubPortalPositions } from '../utils/layout';
import { PILLAR_ORDER } from '../../data/pillarAssets';
import { hubIntroDialogue } from '../../data/agataDialogues';

/**
 * `HubScene` - El Nodo Digital con 4 portales e Ágata como guía.
 */
export class HubScene extends Phaser.Scene {
  private player!: Player;
  private portals: Portal[] = [];
  private agata: AgataGuide | null = null;
  private backgroundElements: Phaser.GameObjects.GameObject[] = [];
  private hintText: Phaser.GameObjects.Text | null = null;
  private titleText: Phaser.GameObjects.Text | null = null;
  private subtitleText: Phaser.GameObjects.Text | null = null;
  private playBounds = new Phaser.Geom.Rectangle(0, 0, 0, 0);

  constructor() {
    super({ key: 'HubScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const zones = getSafeZones(this.scale);
    this.playBounds = zones.playArea;

    this.createBackground(width, height, zones.isMobile);
    this.createPortals();
    this.createPlayer(width, height);
    this.createHint(zones.isCoarsePointer);

    this.agata = new AgataGuide(this);
    this.time.delayedCall(300, () => {
      this.agata?.emitAnchorUpdate();
      EventBus.emit('agata-dialogue-open', {
        script: hubIntroDialogue,
        chainIds: ['welcome', 'choose_path'],
      });
    });

    this.scale.on('resize', this.onResize, this);
    this.events.on('portal-clicked', this.handlePortalClick, this);

    this.player.onInteract(() => this.handleInteract());

    this.cameras.main.setBackgroundColor('#0a0a1e');
    EventBus.emit('current-scene-ready', this);
  }

  private createBackground(width: number, height: number, isMobile: boolean): void {
    const cx = width / 2;
    const decorCount = isMobile ? 3 : 6;

    for (let i = 0; i < decorCount; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(this.playBounds.y, height - 80);
      const w = Phaser.Math.Between(40, 100);
      const h = Phaser.Math.Between(8, 16);
      const platform = this.add.rectangle(x, y, w, h, 0x1a1a3a, 0.4);
      platform.setStrokeStyle(1, 0x3a3a6a, 0.5);
      this.tweens.add({
        targets: platform,
        y: y - Phaser.Math.Between(8, 20),
        alpha: 0.6,
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.backgroundElements.push(platform);
    }

    const titleY = this.playBounds.y - (isMobile ? 28 : 36);
    this.titleText = this.add.text(cx, titleY, 'EL NODO DIGITAL', {
      fontSize: isMobile ? '18px' : '22px',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.titleText.setOrigin(0.5, 0.5);
    this.backgroundElements.push(this.titleText);

    const zones = getSafeZones(this.scale);
    const hintLabel = zones.isCoarsePointer
      ? 'Toca un portal brillante para entrar'
      : 'Acércate a un portal. Pulsa E o haz clic para entrar.';

    this.subtitleText = this.add.text(cx, titleY + 28, hintLabel, {
      fontSize: isMobile ? '12px' : '13px',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
      wordWrap: { width: width - 48 },
    });
    this.subtitleText.setOrigin(0.5, 0.5);
    this.backgroundElements.push(this.subtitleText);
  }

  private createPortals(): void {
    const positions = getHubPortalPositions(this.playBounds);
    const lockedMap: Record<PillarId, boolean> = {
      gamification: false,
      acompanamiento: true,
      celebracion: true,
      comunidad: true,
    };

    this.portals = PILLAR_ORDER.map((id, index) =>
      Portal.fromPillar(
        this,
        positions[index].x,
        positions[index].y,
        id,
        lockedMap[id],
        index * 80,
      ),
    );
  }

  private createPlayer(width: number, height: number): void {
    const startY = Math.min(height * 0.82, this.playBounds.bottom - 40);
    this.player = new Player(this, width / 2, startY);
  }

  private createHint(isCoarsePointer: boolean): void {
    this.hintText = this.add.text(0, 0, '', {
      fontSize: '16px',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#00000088',
      padding: { x: 16, y: 8 },
    });
    this.hintText.setOrigin(0.5, 1);
    this.hintText.setVisible(false);

    this.events.on('portal-near', (pillarId: PillarId) => {
      const portal = this.portals.find((p) => p.config.id === pillarId);
      if (portal && this.hintText) {
        const action = isCoarsePointer ? 'Toca' : 'Entrar (E)';
        this.hintText.setText(`${action} · ${portal.config.label}`);
        this.hintText.setPosition(portal.container.x, portal.container.y - 88);
        this.hintText.setVisible(true);
      }
    });

    this.events.on('portal-far', () => {
      this.hintText?.setVisible(false);
    });
  }

  private onResize = (): void => {
    const zones = getSafeZones(this.scale);
    this.playBounds = zones.playArea;
    const positions = getHubPortalPositions(this.playBounds);
    this.portals.forEach((portal, i) => {
      portal.container.setPosition(positions[i].x, positions[i].y);
    });
    this.agata?.emitAnchorUpdate();
  };

  private handleInteract(): void {
    const pos = this.player.getPosition();
    for (const portal of this.portals) {
      if (portal.config.locked) continue;
      const distance = Phaser.Math.Distance.Between(
        pos.x,
        pos.y,
        portal.container.x,
        portal.container.y,
      );
      if (distance < 96) {
        this.enterPortal(portal.config.id);
        return;
      }
    }
  }

  private handlePortalClick(pillarId: PillarId): void {
    const portal = this.portals.find((p) => p.config.id === pillarId);
    if (!portal || portal.config.locked) return;
    this.enterPortal(pillarId);
  }

  private enterPortal(pillarId: PillarId): void {
    EventBus.emit('agata-dialogue-hide');
    EventBus.emit('portal-entered', pillarId);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (pillarId === 'gamification') {
        this.scene.start('PillarGamification');
      }
    });
  }

  update(_time: number, delta: number): void {
    this.player.update(delta, this.playBounds);
    const playerPos = this.player.getPosition();
    for (const portal of this.portals) {
      portal.update(playerPos);
    }
    if (this.time.now % 500 < delta) {
      this.agata?.emitAnchorUpdate();
    }
  }

  shutdown(): void {
    this.scale.off('resize', this.onResize, this);
    this.agata?.destroy();
    this.agata = null;
  }
}