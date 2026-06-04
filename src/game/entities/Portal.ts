import Phaser from 'phaser';

export type PillarId = 'gamification' | 'acompanamiento' | 'celebracion';

export interface PortalConfig {
  id: PillarId;
  label: string;
  /** Color principal del portal (hex). */
  color: number;
  /** Color del aura/glow (hex). */
  glowColor: number;
  /** Si es true, el portal está cerrado/bloqueado. */
  locked?: boolean;
}

/**
 * `Portal` - Entidad visual + lógica de un portal del Hub.
 *
 * Renderizado:
 *  - Anillo exterior pulsante
 *  - Anillo interior con color del pilar
 *  - Texto con el nombre
 *  - Número de marcas completadas (0/3)
 *
 * Cuando el jugador se acerca, el portal entra en estado "near"
 * y emite el evento `portal-near` por el EventBus.
 */
export class Portal {
  public readonly container: Phaser.GameObjects.Container;
  public readonly config: PortalConfig;
  private readonly scene: Phaser.Scene;
  private readonly outerRing: Phaser.GameObjects.Arc;
  private readonly innerGlow: Phaser.GameObjects.Arc;
  private readonly label: Phaser.GameObjects.Text;
  private readonly counter: Phaser.GameObjects.Text;
  private completed: number = 0;
  private isNear: boolean = false;
  private pulseTween: Phaser.Tweens.Tween | null = null;

  /** Radio de proximidad en píxeles. */
  private static readonly PROXIMITY_RADIUS = 90;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PortalConfig) {
    this.scene = scene;
    this.config = config;
    this.container = scene.add.container(x, y);

    // Anillo exterior pulsante (más opaco si está cerca)
    this.outerRing = scene.add.circle(0, 0, 50, config.color, 0.0);
    this.outerRing.setStrokeStyle(3, config.glowColor, 0.6);
    this.container.add(this.outerRing);

    // Aura interior
    this.innerGlow = scene.add.circle(0, 0, 30, config.glowColor, 0.25);
    this.container.add(this.innerGlow);

    // Texto del nombre del pilar
    this.label = scene.add.text(0, 65, config.label, {
      fontSize: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.label.setOrigin(0.5, 0.5);
    this.container.add(this.label);

    // Contador 0/3
    this.counter = scene.add.text(0, 85, '0/3', {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
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

    // Hitbox clickeable (invisible, para tap directo)
    const hitbox = scene.add.circle(0, 0, 50, 0x000000, 0);
    hitbox.setInteractive({ useHandCursor: !config.locked });
    if (!config.locked) {
      hitbox.on('pointerdown', () => {
        this.scene.events.emit('portal-clicked', config.id);
      });
    }
    this.container.add(hitbox);
  }

  /**
   * Pulso constante del anillo. Se intensifica cuando el jugador está cerca.
   */
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

  /**
   * Estilo visual para portales bloqueados (Acompañamiento y Celebración en MVP).
   */
  private applyLockedStyle(): void {
    this.outerRing.setStrokeStyle(2, 0x444444, 0.4);
    this.innerGlow.setFillStyle(0x444444, 0.1);
    this.label.setColor('#888888');
    this.label.setText(`${this.config.label} (Próximamente)`);
  }

  /**
   * Llamado cada frame desde la escena.
   * Detecta proximidad del jugador y emite eventos.
   *
   * @param playerPos - Posición del jugador {x, y}
   */
  public update(playerPos: { x: number; y: number }): void {
    if (this.config.locked) return;

    const distance = Phaser.Math.Distance.Between(
      playerPos.x,
      playerPos.y,
      this.container.x,
      this.container.y,
    );

    const wasNear = this.isNear;
    this.isNear = distance < Portal.PROXIMITY_RADIUS;

    if (this.isNear && !wasNear) {
      this.onPlayerEnter();
    } else if (!this.isNear && wasNear) {
      this.onPlayerExit();
    }
  }

  /**
   * Jugador entró en la zona de proximidad.
   * Resalta el portal y emite evento para que la UI muestre "Entrar a X".
   */
  private onPlayerEnter(): void {
    if (this.pulseTween) {
      this.pulseTween.pause();
    }
    this.scene.tweens.add({
      targets: this.outerRing,
      scaleX: 1.18,
      scaleY: 1.18,
      duration: 200,
      ease: 'Back.easeOut',
    });
    this.innerGlow.setAlpha(0.5);
    this.scene.events.emit('portal-near', this.config.id);
  }

  /**
   * Jugador salió de la zona de proximidad.
   */
  private onPlayerExit(): void {
    this.scene.tweens.add({
      targets: this.outerRing,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Sine.easeOut',
    });
    this.innerGlow.setAlpha(0.25);
    if (this.pulseTween) {
      this.pulseTween.resume();
    }
    this.scene.events.emit('portal-far', this.config.id);
  }

  /**
   * Actualiza el contador de marcas completadas en este pilar.
   *
   * @param completed - Número de marcas completadas (0-3)
   */
  public setCompleted(completed: number): void {
    this.completed = completed;
    this.counter.setText(`${completed}/3`);
    if (completed === 3) {
      this.outerRing.setStrokeStyle(4, this.config.glowColor, 1);
    }
  }

  /**
   * Limpia recursos. Llamar al destruir la escena.
   */
  public destroy(): void {
    this.pulseTween?.destroy();
    this.container.destroy();
  }
}
