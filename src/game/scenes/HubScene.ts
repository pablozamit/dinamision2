import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Portal, type PillarId } from '../entities/Portal';
import { EventBus } from '../EventBus';

/**
 * Posiciones de los 3 portales en el Hub.
 * Calculadas para un viewport típico de 1280x720, escalables.
 */
const PORTAL_POSITIONS: Record<PillarId, { x: number; y: number }> = {
  gamification: { x: 0.25, y: 0.45 },
  acompanamiento: { x: 0.5, y: 0.3 },
  celebracion: { x: 0.75, y: 0.45 },
};

/**
 * `HubScene` - El Nodo Digital: vista central del juego.
 *
 * Vista 2D top-down con:
 *  - Fondo abstracto: líneas brillantes + plataformas flotantes procedurales
 *  - Jugador procedural (sprite generado con primitivas)
 *  - 3 portales: Gamificación (azul, funcional), Acompañamiento (verde, bloqueado),
 *    Celebración (dorado, bloqueado)
 *
 * Controles: flechas/WASD + tap-to-move + 'E' para entrar al portal cercano.
 */
export class HubScene extends Phaser.Scene {
  private player!: Player;
  private portals!: Record<PillarId, Portal>;
  private backgroundElements: Phaser.GameObjects.GameObject[] = [];
  private hintText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'HubScene' });
  }

  /**
   * Preload: vacío en el MVP (todo es procedural).
   * Aquí se cargarían assets externos en futuras versiones.
   */
  preload(): void {
    // MVP: 0 assets. Generación procedural.
  }

  /**
   * Create: construye el mundo del hub.
   * Emite 'current-scene-ready' al terminar (regla del proyecto).
   */
  create(): void {
    const { width, height } = this.scale;

    this.createBackground(width, height);
    this.createPortals(width, height);
    this.createPlayer(width, height);
    this.createHint();

    // Cámara: fondo oscuro para que resalten los portales
    this.cameras.main.setBackgroundColor('#0a0a1e');

    // Listeners globales
    this.events.on('portal-clicked', this.handlePortalClick, this);

    // Click directo en un portal también funciona vía 'E' cuando está cerca
    this.player.onInteract(() => {
      this.handleInteract();
    });

    // Notificar que la escena está lista (regla del proyecto)
    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Crea el fondo abstracto: espacio oscuro con líneas brillantes.
   */
  private createBackground(width: number, height: number): void {
    const cx = width / 2;

    // "Plataformas flotantes" decorativas (rectángulos con tween)
    for (let i = 0; i < 6; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
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

    // "Líneas de conexión" entre los 3 portales (decorativas)
    const colors = [0x3a7bd5, 0x4caf50, 0xf6a000];
    const portalKeys: PillarId[] = ['gamification', 'acompanamiento', 'celebracion'];
    for (let i = 0; i < portalKeys.length; i++) {
      const start = PORTAL_POSITIONS[portalKeys[i]];
      for (let j = i + 1; j < portalKeys.length; j++) {
        const end = PORTAL_POSITIONS[portalKeys[j]];
        const sx = start.x * width;
        const sy = start.y * height;
        const ex = end.x * width;
        const ey = end.y * height;
        const line = this.add.line(0, 0, sx, sy, ex, ey, colors[i], 0.25);
        line.setLineWidth(1, 1);
        line.setOrigin(0, 0);
        this.backgroundElements.push(line);
      }
    }

    // Título flotante "EL NODO DIGITAL" arriba
    const title = this.add.text(cx, 50, 'EL NODO DIGITAL', {
      fontSize: '22px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    title.setOrigin(0.5, 0.5);
    this.backgroundElements.push(title);

    const subtitle = this.add.text(
      cx,
      80,
      'Acércate a un portal. Pulsa E o haz clic para entrar.',
      {
        fontSize: '13px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#aaaaaa',
        stroke: '#000000',
        strokeThickness: 2,
      },
    );
    subtitle.setOrigin(0.5, 0.5);
    this.backgroundElements.push(subtitle);
  }

  /**
   * Instancia los 3 portales.
   * En el MVP, solo Gamificación es interactivo.
   */
  private createPortals(width: number, height: number): void {
    this.portals = {
      gamification: new Portal(this, width * PORTAL_POSITIONS.gamification.x, height * PORTAL_POSITIONS.gamification.y, {
        id: 'gamification',
        label: 'GAMIFICACIÓN',
        color: 0x3a7bd5,
        glowColor: 0x6ec6ff,
      }),
      acompanamiento: new Portal(this, width * PORTAL_POSITIONS.acompanamiento.x, height * PORTAL_POSITIONS.acompanamiento.y, {
        id: 'acompanamiento',
        label: 'ACOMPAÑAMIENTO',
        color: 0x4caf50,
        glowColor: 0x80e27e,
        locked: true,
      }),
      celebracion: new Portal(this, width * PORTAL_POSITIONS.celebracion.x, height * PORTAL_POSITIONS.celebracion.y, {
        id: 'celebracion',
        label: 'CELEBRACIÓN',
        color: 0xf6a000,
        glowColor: 0xffd54f,
        locked: true,
      }),
    };
  }

  /**
   * Crea el jugador en el centro.
   */
  private createPlayer(width: number, height: number): void {
    this.player = new Player(this, width / 2, height * 0.75);
  }

  /**
   * Texto flotante que muestra "Entrar a X" cuando estás cerca de un portal.
   */
  private createHint(): void {
    this.hintText = this.add.text(0, 0, '', {
      fontSize: '18px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#00000088',
      padding: { x: 16, y: 8 },
    });
    this.hintText.setOrigin(0.5, 1);
    this.hintText.setVisible(false);

    this.events.on('portal-near', (pillarId: PillarId) => {
      const portal = this.portals[pillarId];
      if (portal && this.hintText) {
        this.hintText.setText(`Entrar a ${portal.config.label} (E)`);
        this.hintText.setPosition(portal.container.x, portal.container.y - 70);
        this.hintText.setVisible(true);
      }
    });

    this.events.on('portal-far', () => {
      this.hintText?.setVisible(false);
    });
  }

  /**
   * Handler de 'E' o click directo en el portal cercano.
   */
  private handleInteract(): void {
    const pos = this.player.getPosition();
    for (const portal of Object.values(this.portals)) {
      if (portal.config.locked) continue;
      const distance = Phaser.Math.Distance.Between(
        pos.x,
        pos.y,
        portal.container.x,
        portal.container.y,
      );
      if (distance < 90) {
        this.enterPortal(portal.config.id);
        return;
      }
    }
  }

  /**
   * Click directo en un portal (hitbox invisible).
   */
  private handlePortalClick(pillarId: PillarId): void {
    const portal = this.portals[pillarId];
    if (!portal || portal.config.locked) return;
    this.enterPortal(pillarId);
  }

  /**
   * Transición a la escena del pilar.
   */
  private enterPortal(pillarId: PillarId): void {
    EventBus.emit('portal-entered', pillarId);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (pillarId === 'gamification') {
        this.scene.start('PillarGamification');
      }
      // Acompañamiento y Celebración aún no implementados en MVP
    });
  }

  /**
   * Update loop: refresca movimiento del jugador y proximidad de portales.
   */
  update(_time: number, delta: number): void {
    const bounds = new Phaser.Geom.Rectangle(
      40,
      120,
      this.scale.width - 80,
      this.scale.height - 180,
    );
    this.player.update(delta, bounds);
    const playerPos = this.player.getPosition();
    for (const portal of Object.values(this.portals)) {
      portal.update(playerPos);
    }
  }
}
