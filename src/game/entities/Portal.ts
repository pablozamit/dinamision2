import Phaser from 'phaser';
import { PILLAR_ASSETS } from '../../data/pillarAssets';

export type PillarId = 'gamification' | 'acompanamiento' | 'celebracion' | 'comunidad';

export interface PortalConfig {
  id: PillarId;
  label: string;
  color: number;
  glowColor: number;
  iconKey: string;
  locked?: boolean;
}

const ICON_DISPLAY_SIZE = 72;
const HIT_RADIUS = 40;

/**
 * `Portal` - Portal del Hub con icono PNG y feedback visual.
 */
export class Portal {
  public readonly container: Phaser.GameObjects.Container;
  public readonly config: PortalConfig;
  private readonly scene: Phaser.Scene;
  private readonly outerRing: Phaser.GameObjects.Arc;
  private readonly innerGlow: Phaser.GameObjects.Arc;
  private readonly icon: Phaser.GameObjects.Image;
  private readonly label: Phaser.GameObjects.Text;
  private readonly counter: Phaser.GameObjects.Text;
  private pulseTween: Phaser.Tweens.Tween | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: PortalConfig,
    appearDelay = 0,
  ) {
    this.scene = scene;
    this.config = config;
    this.container = scene.add.container(x, y);
    this.container.setScale(0);

    this.outerRing = scene.add.circle(0, 0, 52, config.color, 0);
    this.outerRing.setStrokeStyle(3, config.glowColor, 0.65);
    this.container.add(this.outerRing);

    this.innerGlow = scene.add.circle(0, 0, 38, config.glowColor, 0.22);
    this.container.add(this.innerGlow);

    this.icon = scene.add.image(0, 0, config.iconKey);
    const iconScale = ICON_DISPLAY_SIZE / Math.max(this.icon.width, this.icon.height);
    this.icon.setScale(iconScale);
    this.container.add(this.icon);

    this.label = scene.add.text(0, 58, config.label, {
      fontSize: '14px',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.label.setOrigin(0.5, 0.5);
    this.container.add(this.label);

    this.counter = scene.add.text(0, 78, '0/3', {
      fontSize: '12px',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      color: '#f6a000',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.counter.setOrigin(0.5, 0.5);
    this.container.add(this.counter);

    if (config.locked) {
      this.applyLockedStyle();
    } else {
      this.startPulse();
    }

    this.container.setSize(120, 120);

    const hitbox = scene.add.circle(0, 0, HIT_RADIUS, 0x000000, 0);
    hitbox.setInteractive({ useHandCursor: !config.locked });
    if (!config.locked) {
      hitbox.on('pointerdown', () => {
        this.popSelect();
        this.scene.events.emit('portal-clicked', config.id);
      });
      hitbox.on('pointerover', () => this.popHover());
    }
    this.container.add(hitbox);

    scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 450,
      delay: appearDelay,
      ease: 'Back.easeOut',
    });
  }

  private popHover(): void {
    if (this.config.locked) return;
    this.scene.tweens.add({
      targets: this.icon,
      scale: this.icon.scale * 1.08,
      duration: 120,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  private popSelect(): void {
    this.scene.tweens.add({
      targets: [this.icon, this.innerGlow],
      scaleX: '*=1.15',
      scaleY: '*=1.15',
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut',
    });
    this.innerGlow.setAlpha(0.55);
  }

  private startPulse(): void {
    this.pulseTween = this.scene.tweens.add({
      targets: this.outerRing,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private applyLockedStyle(): void {
    this.outerRing.setStrokeStyle(2, 0x444444, 0.4);
    this.innerGlow.setFillStyle(0x444444, 0.1);
    this.icon.setAlpha(0.45);
    this.label.setColor('#888888');
    this.label.setText(`${this.config.label}\n(Próximamente)`);
  }

  public setCompleted(completed: number): void {
    this.counter.setText(`${completed}/3`);
    if (completed === 3) {
      this.outerRing.setStrokeStyle(4, this.config.glowColor, 1);
    }
  }

  public destroy(): void {
    this.pulseTween?.destroy();
    this.container.destroy();
  }

  /** Factory desde configuración central de pilares. */
  public static fromPillar(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: PillarId,
    locked = false,
    appearDelay = 0,
  ): Portal {
    const asset = PILLAR_ASSETS[id];
    return new Portal(
      scene,
      x,
      y,
      {
        id,
        label: asset.label,
        color: asset.color,
        glowColor: asset.glowColor,
        iconKey: `pillar-icon-${id}`,
        locked,
      },
      appearDelay,
    );
  }
}