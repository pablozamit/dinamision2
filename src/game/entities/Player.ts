import Phaser from 'phaser';

export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Velocidad base del jugador en píxeles/segundo.
 * Ajustada para que el hub se recorra en ~4-6 segundos.
 */
const PLAYER_SPEED = 220;

/**
 * `Player` - Sprite procedural del aventurero digital.
 *
 * Se construye con `Phaser.GameObjects.Container` agrupando:
 *  - Cuerpo (rectángulo azul eléctrico)
 *  - Cabeza (círculo)
 *  - Ojos (dos puntos)
 *  - Aura dorada (anillo pulsante)
 *
 * 100% generado con primitivas de Phaser — sin assets externos.
 *
 * Controles soportados:
 *  - Teclado: flechas + WASD
 *  - Touch/click: tap-to-move (cámara Phaser, no es tap-and-hold)
 */
export class Player {
  public readonly container: Phaser.GameObjects.Container;
  private readonly scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private keyW: Phaser.Input.Keyboard.Key | null = null;
  private keyA: Phaser.Input.Keyboard.Key | null = null;
  private keyS: Phaser.Input.Keyboard.Key | null = null;
  private keyD: Phaser.Input.Keyboard.Key | null = null;
  private keyE: Phaser.Input.Keyboard.Key | null = null;
  private tapTarget: { x: number; y: number } | null = null;
  private onInteractCallback: (() => void) | null = null;

  /** Dirección actual de la cara (para feedback visual). */
  private facing: Direction = 'down';

  /** Aura dorada pulsante (referencia para el tween). */
  private readonly aura: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);

    // Aura dorada (debajo del cuerpo para que se vea como halo)
    this.aura = scene.add.circle(0, 0, 28, 0xf6a000, 0.25);
    this.aura.setStrokeStyle(2, 0xf6a000, 0.6);
    this.container.add(this.aura);

    // Cuerpo (rectángulo con esquinas redondeadas simuladas)
    const body = scene.add.rectangle(0, 4, 18, 22, 0x3a7bd5, 1);
    body.setStrokeStyle(2, 0x1a4ba0, 1);
    this.container.add(body);

    // Cabeza (círculo)
    const head = scene.add.circle(0, -10, 9, 0xf5d5a0, 1);
    head.setStrokeStyle(2, 0x705893, 1);
    this.container.add(head);

    // Ojos
    const leftEye = scene.add.circle(-3, -11, 1.5, 0x1a1a2e, 1);
    const rightEye = scene.add.circle(3, -11, 1.5, 0x1a1a2e, 1);
    this.container.add([leftEye, rightEye]);

    // Brillo del ojo derecho según dirección
    this.container.setSize(40, 50);

    this.setupInput();
    this.startAuraTween();
  }

  /**
   * Pulso constante del aura dorada para feedback de "vivo".
   */
  private startAuraTween(): void {
    this.scene.tweens.add({
      targets: this.aura,
      scaleX: 1.15,
      scaleY: 1.15,
      alpha: 0.15,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Configura listeners de teclado + tap-to-move.
   */
  private setupInput(): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyE = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

      this.keyE.on('down', () => {
        this.onInteractCallback?.();
      });
    }

    // Tap-to-move: clic/touch en el suelo
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.tapTarget = { x: pointer.worldX, y: pointer.worldY };
    });
  }

  /**
   * Registra el callback que se invoca al pulsar 'E'.
   * Usado por las escenas para detectar interacción con portales/estaciones.
   *
   * @param callback - Función a ejecutar
   */
  public onInteract(callback: () => void): void {
    this.onInteractCallback = callback;
  }

  /**
   * Update loop. Llamar desde `scene.update(time, delta)`.
   *
   * @param delta - Delta time en ms (proporcionado por Phaser)
   * @param bounds - Opcional: límites rectangulares del mundo {x, y, width, height}
   */
  public update(delta: number, bounds?: Phaser.Geom.Rectangle): void {
    const speed = PLAYER_SPEED * (delta / 1000);
    let dx = 0;
    let dy = 0;

    // Teclado: prioridad sobre tap
    if (this.cursors) {
      if (this.cursors.left.isDown || this.keyA?.isDown) {
        dx -= 1;
        this.facing = 'left';
      } else if (this.cursors.right.isDown || this.keyD?.isDown) {
        dx += 1;
        this.facing = 'right';
      }
      if (this.cursors.up.isDown || this.keyW?.isDown) {
        dy -= 1;
        this.facing = 'up';
      } else if (this.cursors.down.isDown || this.keyS?.isDown) {
        dy += 1;
        this.facing = 'down';
      }
    }

    // Tap-to-move (solo si no hay input de teclado activo)
    if (dx === 0 && dy === 0 && this.tapTarget) {
      const tx = this.tapTarget.x;
      const ty = this.tapTarget.y;
      const px = this.container.x;
      const py = this.container.y;
      const distance = Phaser.Math.Distance.Between(px, py, tx, ty);
      if (distance < 6) {
        this.tapTarget = null;
      } else {
        const angle = Phaser.Math.Angle.Between(px, py, tx, ty);
        dx = Math.cos(angle);
        dy = Math.sin(angle);
        if (Math.abs(dx) > Math.abs(dy)) {
          this.facing = dx > 0 ? 'right' : 'left';
        } else {
          this.facing = dy > 0 ? 'down' : 'up';
        }
      }
    }

    // Normalizar vector diagonal
    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
    }

    // Aplicar movimiento
    if (dx !== 0 || dy !== 0) {
      this.container.x += dx * speed;
      this.container.y += dy * speed;
    }

    // Limitar a bounds
    if (bounds) {
      if (this.container.x < bounds.x) this.container.x = bounds.x;
      if (this.container.y < bounds.y) this.container.y = bounds.y;
      if (this.container.x > bounds.x + bounds.width) {
        this.container.x = bounds.x + bounds.width;
      }
      if (this.container.y > bounds.y + bounds.height) {
        this.container.y = bounds.y + bounds.height;
      }
    }
  }

  /**
   * Posición actual del jugador.
   */
  public getPosition(): { x: number; y: number } {
    return { x: this.container.x, y: this.container.y };
  }

  /**
   * Limpia listeners. Llamar al destruir la escena.
   */
  public destroy(): void {
    this.keyE?.removeAllListeners();
    this.scene.input.off('pointerdown');
    this.onInteractCallback = null;
    this.container.destroy();
  }
}
