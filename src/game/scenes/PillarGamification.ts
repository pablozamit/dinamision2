import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EventBus } from '../EventBus';
import { playSound } from '../utils/audio';
import { gamificationBrands } from '../../data/brandData';

/**
 * `PillarGamification` - Escena del pilar Gamificación.
 *
 * MVP: solo 1 marca jugable (IKEA).
 *
 * Visual:
 *  - Fondo azul oscuro con monedas y niveles (decoración procedural)
 *  - 1 estación central con el nombre de la marca
 *  - Glow pulsante en la estación
 *
 * Interacción:
 *  - Click o 'E' sobre la estación → emite `brand-selected` con la marca
 *  - El componente React BrandPanel abre el panel drag-drop
 *  - Al completar correctamente, React emite `mechanic-complete` →
 *    la escena muestra partículas, sonido, frase clave flotante
 */
export class PillarGamification extends Phaser.Scene {
  private player!: Player;
  private brandStation: Phaser.GameObjects.Container | null = null;
  private stationHitbox: Phaser.GameObjects.Arc | null = null;
  private stationGlow: Phaser.GameObjects.Arc | null = null;
  private stationName: Phaser.GameObjects.Text | null = null;
  private progressText: Phaser.GameObjects.Text | null = null;
  private completed: boolean = false;
  private hintText: Phaser.GameObjects.Text | null = null;

  /** Marca del MVP. */
  private static readonly MVP_BRAND_NAME = 'IKEA';

  constructor() {
    super({ key: 'PillarGamification' });
  }

  preload(): void {
    // MVP: 0 assets.
  }

  create(): void {
    const { width, height } = this.scale;

    this.createBackground(width, height);
    this.createStation(width, height);
    this.createPlayer(width, height);
    this.createProgressIndicator(width, height);
    this.createHint();

    this.cameras.main.setBackgroundColor('#0a1428');

    this.player.onInteract(() => this.handleInteract());

    // Escuchar el resultado del panel React
    EventBus.on('mechanic-complete', this.handleMechanicComplete, this);
    EventBus.on('mechanic-fail', this.handleMechanicFail, this);

    // Cuando React cierra el panel sin completar (usuario canceló)
    EventBus.on('panel-closed', this.handlePanelClosed, this);

    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Fondo temático de Gamificación: azul profundo + decoración.
   */
  private createBackground(width: number, height: number): void {
    // Título del pilar
    const title = this.add.text(width / 2, 50, 'PILAR 1 · GAMIFICACIÓN', {
      fontSize: '22px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#6ec6ff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    title.setOrigin(0.5, 0.5);

    // Subtítulo
    const subtitle = this.add.text(width / 2, 80, 'Acércate a la marca y pulsa E', {
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2,
    });
    subtitle.setOrigin(0.5, 0.5);

    // "Monedas" decorativas flotando
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(150, height - 50);
      const coin = this.add.circle(x, y, 6, 0xf6a000, 0.6);
      coin.setStrokeStyle(1, 0xffd54f, 0.8);
      this.tweens.add({
        targets: coin,
        y: y - Phaser.Math.Between(15, 30),
        alpha: 0.2,
        duration: Phaser.Math.Between(2500, 4500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  /**
   * Estación central: el "stand" de la marca MVP.
   */
  private createStation(width: number, height: number): void {
    const cx = width / 2;
    const cy = height * 0.45;

    this.brandStation = this.add.container(cx, cy);

    // Glow pulsante
    this.stationGlow = this.add.circle(0, 0, 50, 0x3a7bd5, 0.3);
    this.stationGlow.setStrokeStyle(2, 0x6ec6ff, 0.7);
    this.brandStation.add(this.stationGlow);

    // Cuerpo de la estación (rectángulo)
    const body = this.add.rectangle(0, 0, 80, 80, 0x1a4ba0, 0.8);
    body.setStrokeStyle(3, 0x6ec6ff, 1);
    this.brandStation.add(body);

    // Icono central (estrella = "premio")
    const star = this.add.star(0, 0, 5, 14, 24, 0xf6a000, 1);
    star.setStrokeStyle(2, 0xffd54f, 1);
    this.brandStation.add(star);

    // Nombre de la marca
    this.stationName = this.add.text(0, 60, PillarGamification.MVP_BRAND_NAME, {
      fontSize: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.stationName.setOrigin(0.5, 0.5);
    this.brandStation.add(this.stationName);

    // Hitbox invisible clickeable
    this.stationHitbox = this.add.circle(0, 0, 50, 0x000000, 0);
    this.stationHitbox.setInteractive({ useHandCursor: !this.completed });
    this.stationHitbox.on('pointerdown', () => this.handleInteract());
    this.brandStation.add(this.stationHitbox);

    // Pulso constante del glow
    this.tweens.add({
      targets: this.stationGlow,
      scaleX: 1.15,
      scaleY: 1.15,
      alpha: 0.15,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Rotación lenta de la estrella
    this.tweens.add({
      targets: star,
      angle: 360,
      duration: 8000,
      repeat: -1,
      ease: 'Linear',
    });
  }

  /**
   * Jugador aparece abajo.
   */
  private createPlayer(width: number, height: number): void {
    this.player = new Player(this, width / 2, height * 0.8);
  }

  /**
   * Indicador de progreso del pilar (esquina).
   */
  private createProgressIndicator(width: number, _height: number): void {
    this.progressText = this.add.text(width - 20, 20, '0/3 marcas', {
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f6a000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.progressText.setOrigin(1, 0);
  }

  /**
   * Hint flotante que aparece cuando el jugador está cerca de la estación.
   */
  private createHint(): void {
    this.hintText = this.add.text(0, 0, '', {
      fontSize: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#00000088',
      padding: { x: 12, y: 6 },
    });
    this.hintText.setOrigin(0.5, 1);
    this.hintText.setVisible(false);
  }

  /**
   * Pulsa la estación cuando el jugador está cerca.
   */
  private updateProximityHint(nearStation: boolean): void {
    if (nearStation && !this.completed) {
      this.hintText?.setText('Investigar (E)');
      this.hintText?.setPosition(this.brandStation!.x, this.brandStation!.y - 80);
      this.hintText?.setVisible(true);
    } else {
      this.hintText?.setVisible(false);
    }
  }

  /**
   * 'E' o click en la estación → abre panel React.
   */
  private handleInteract(): void {
    if (this.completed) return;
    const pos = this.player.getPosition();
    const distance = Phaser.Math.Distance.Between(
      pos.x,
      pos.y,
      this.brandStation!.x,
      this.brandStation!.y,
    );
    if (distance > 100) return;

    const brand = gamificationBrands.find((b) => b.name === PillarGamification.MVP_BRAND_NAME);
    if (!brand) return;

    playSound('click');
    EventBus.emit('brand-selected', brand);
  }

  /**
   * Callback cuando React confirma que la mecánica drag-drop fue correcta.
   * Muestra partículas, sonido, frase clave flotante.
   */
  private handleMechanicComplete(data: { brand: { name: string; result: { fraseClave: string } } }): void {
    if (data.brand.name !== PillarGamification.MVP_BRAND_NAME) return;
    if (this.completed) return;

    this.completed = true;
    playSound('success');

    // Marcar estación como completada
    if (this.stationGlow) {
      this.stationGlow.setFillStyle(0x4caf50, 0.5);
      this.stationGlow.setStrokeStyle(3, 0x80e27e, 1);
    }
    this.stationHitbox?.disableInteractive();
    this.progressText?.setText('1/3 marcas');

    // Partículas de éxito
    if (this.brandStation) {
      this.spawnSuccessParticles(this.brandStation.x, this.brandStation.y);
    }

    // Frase clave flotante que sube
    this.showFloatingFraseClave(data.brand.result.fraseClave);

    // Notificar al HUD
    EventBus.emit('pillar-progress-updated', { pillar: 'gamification', completed: 1, total: 3 });
  }

  /**
   * Callback de mecánica fallida (orden incorrecto).
   * Shake de la estación.
   */
  private handleMechanicFail(): void {
    playSound('fail');
    if (this.brandStation) {
      this.tweens.add({
        targets: this.brandStation,
        x: this.brandStation.x + 8,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut',
      });
    }
  }

  /**
   * Panel cerrado sin completar: reactivamos la estación.
   */
  private handlePanelClosed(): void {
    // Estado idle, nada que hacer
  }

  /**
   * Crea 20 partículas de éxito alrededor de un punto.
   */
  private spawnSuccessParticles(x: number, y: number): void {
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = Phaser.Math.Between(80, 180);
      const particle = this.add.circle(x, y, 4, 0xf6a000, 1);
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.3,
        duration: 700,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  /**
   * Texto con la frase clave que flota hacia arriba y se desvanece.
   */
  private showFloatingFraseClave(frase: string): void {
    const text = this.add.text(
      this.brandStation!.x,
      this.brandStation!.y - 30,
      frase,
      {
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffd54f',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
        wordWrap: { width: 400 },
      },
    );
    text.setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: text,
      y: text.y - 120,
      alpha: 0,
      duration: 2500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        text.destroy();
        // Notificar al HUD que la frase se recogió
        EventBus.emit('frase-clave-collected', frase);
      },
    });
  }

  update(_time: number, delta: number): void {
    if (!this.player) return;
    const bounds = new Phaser.Geom.Rectangle(
      40,
      120,
      this.scale.width - 80,
      this.scale.height - 180,
    );
    this.player.update(delta, bounds);

    // Proximidad a la estación
    if (this.brandStation && !this.completed) {
      const pos = this.player.getPosition();
      const dist = Phaser.Math.Distance.Between(
        pos.x,
        pos.y,
        this.brandStation.x,
        this.brandStation.y,
      );
      this.updateProximityHint(dist < 100);
    }
  }
}
