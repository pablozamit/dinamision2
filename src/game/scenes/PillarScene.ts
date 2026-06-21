import Phaser from 'phaser';
import { AgataGuide } from '../entities/AgataGuide';
import { EventBus } from '../EventBus';
import { pillars, type PillarData, type Brand } from '../../data/brandData';
import { getSafeZones, getPillarStationPositions } from '../utils/layout';

const STATION_DEPTH = 40;
const UI_DEPTH = 200;

/** Referencias visuales de una lápida — todas Graphics/Text, sin Arc (Phaser 4.1 bug). */
type StationVisuals = {
  glow: Phaser.GameObjects.Graphics;
  tombstone: Phaser.GameObjects.Graphics;
  rip: Phaser.GameObjects.Text;
  brandName: Phaser.GameObjects.Text;
  cross: Phaser.GameObjects.Text;
  logoBack: Phaser.GameObjects.Graphics;
  logoRing: Phaser.GameObjects.Graphics;
  logoText: Phaser.GameObjects.Text;
  glowR: number;
  logoR: number;
  tw: number;
  th: number;
};

export class PillarScene extends Phaser.Scene {
  private agata: AgataGuide | null = null;
  private pillarData!: PillarData;
  private stationZones: Phaser.GameObjects.Zone[] = [];
  private playBounds = new Phaser.Geom.Rectangle(0, 0, 0, 0);
  private decor: Phaser.GameObjects.GameObject[] = [];
  private lightningTimer: Phaser.Time.TimerEvent | null = null;
  private tapHint: Phaser.GameObjects.Container | null = null;
  private tapHintTween: Phaser.Tweens.Tween | null = null;

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

    this.createFog();
    this.createDecor(zones);
    this.createStations();
    this.createTapHint();
    this.createBackButton(zones);

    this.agata = new AgataGuide(this);
    this.agata.showCharacter();
    this.time.delayedCall(350, () => {
      EventBus.emit('start-pillar-intro', this.pillarData.name);
    });

    this.cameras.main.setBackgroundColor('#0e040c');
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.scale.on('resize', this.onResize, this);

    this.scheduleLightning();

    // NUEVO: Registra el limpiador para que se ejecute al salir de esta pantalla
    this.events.once('shutdown', this.shutdown, this);

    EventBus.emit('current-scene-ready', this);
    EventBus.emit('pillar-progress-updated', {
      pillar: this.pillarData.id,
      completed: 0,
      total: this.pillarData.brands.length,
    });
  }

  private createFog(): void {
    if (!this.textures.exists('fog-particle')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 16, 16);
      g.generateTexture('fog-particle', 32, 32);
    }
    const color = this.pillarData.color;
    const emitter = this.add.particles(0, 0, 'fog-particle', {
      x: { min: 0, max: this.scale.width },
      y: { min: this.scale.height - 200, max: this.scale.height },
      lifespan: 8000,
      speedX: { min: -10, max: 10 },
      speedY: { min: -5, max: -15 },
      scale: { start: 4, end: 10 },
      alpha: { start: 0, end: 0.05 },
      tint: color,
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
        'Toca una lápida para desenterrar su horror',
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

  /**
   * Crea las 3 lápidas del pilar usando SOLO Graphics + Text.
   *
   * IMPORTANTE: en Phaser 4.1.0, los `Phaser.GameObjects.Arc` lanzan
   * `Cannot set properties of null (setting 'radius')` al tercer elemento
   * de un bucle cuando hay setStrokeStyle + tween con arrays mixtos.
   * Por eso aqui evitamos Arc completamente y dibujamos circulos con Graphics.
   */
  private createStations(): void {
    const positions = getPillarStationPositions(
      this.playBounds,
      this.pillarData.brands.length,
    );

    const zones = getSafeZones(this.scale);
    const isMobile = zones.isMobile;
    const tw = isMobile ? 82 : 78;
    const th = isMobile ? 110 : 100;
    const fontSizeRip = isMobile ? '11px' : '10px';
    const fontSizeName = isMobile ? '13px' : '11px';
    const fontSizeCross = isMobile ? '16px' : '14px';
    const fontSizeLogo = isMobile ? '14px' : '12px';
    const zoneW = isMobile ? 130 : 96;
    const zoneH = isMobile ? 170 : 120;
    const glowR = isMobile ? 60 : 50;
    const logoR = isMobile ? 16 : 13;

    if (!this.textures.exists('dust-particle')) {
      const dg = this.make.graphics({ x: 0, y: 0 });
      dg.fillStyle(0x887766, 1);
      dg.fillCircle(4, 4, 4);
      dg.generateTexture('dust-particle', 8, 8);
    }

    this.pillarData.brands.forEach((brand, i) => {
      const { x, y } = positions[i];

      // Helper local: dibuja el glow sin recrear el Graphics
      const glow = this.add.graphics().setDepth(STATION_DEPTH).setAlpha(0);
      const drawGlow = (alpha: number): void => {
        glow.clear();
        glow.fillStyle(this.pillarData.glowColor, alpha);
        glow.fillCircle(x, y, glowR);
      };
      drawGlow(0.15);

      // Helper local: dibuja el cuerpo de la lápida sin recrear el Graphics
      const tombstone = this.add.graphics().setDepth(STATION_DEPTH + 1).setAlpha(0);
      const drawTombstone = (borderColor: number, borderAlpha: number): void => {
        tombstone.clear();
        const tx = x - tw / 2;
        const ty = y - th / 2;
        tombstone.fillStyle(0x2a2a3a, 0.9);
        tombstone.fillRoundedRect(tx, ty, tw, th, 8);
        tombstone.lineStyle(2, borderColor, borderAlpha);
        tombstone.strokeRoundedRect(tx, ty, tw, th, 8);
      };
      drawTombstone(0x555566, 0.8);

      const logoY = y - th * 0.58;

      const logoBack = this.add.graphics().setDepth(STATION_DEPTH + 2).setAlpha(0);
      logoBack.fillStyle(0x1a1a2e, 0.9);
      logoBack.fillCircle(x, logoY, logoR);

      const logoRing = this.add.graphics().setDepth(STATION_DEPTH + 2).setAlpha(0);
      logoRing.lineStyle(1, 0x555566, 0.7);
      logoRing.strokeCircle(x, logoY, logoR);

      const initials = brand.name
        .split(' ')
        .map((w) => w.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const rip = this.add
        .text(x, y - th * 0.22, 'R.I.P.', {
          fontSize: fontSizeRip,
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: '#888888',
          fontStyle: 'italic',
        })
        .setOrigin(0.5, 0.5)
        .setDepth(STATION_DEPTH + 2)
        .setAlpha(0);

      const brandName = this.add
        .text(x, y + th * 0.15, brand.name, {
          fontSize: fontSizeName,
          fontStyle: 'bold',
          color: '#aaaaaa',
          fontFamily: 'Montserrat, system-ui, sans-serif',
          stroke: '#000000',
          strokeThickness: 2,
        })
        .setOrigin(0.5, 0.5)
        .setDepth(STATION_DEPTH + 2)
        .setAlpha(0);

      const logoText = this.add
        .text(x, logoY, initials, {
          fontSize: fontSizeLogo,
          fontFamily: 'Montserrat, system-ui, sans-serif',
          color: '#cccccc',
          fontStyle: 'bold',
        })
        .setOrigin(0.5, 0.5)
        .setDepth(STATION_DEPTH + 3)
        .setAlpha(0);

      const cross = this.add
        .text(x, y - th * 0.72, '✝', {
          fontSize: fontSizeCross,
          color: '#666677',
        })
        .setOrigin(0.5, 0.5)
        .setDepth(STATION_DEPTH + 2)
        .setAlpha(0);

      const zone = this.add
        .zone(x, y, zoneW, zoneH)
        .setDepth(STATION_DEPTH + 3)
        .setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this.onStationClick(brand, zone));

      zone.on('pointerover', () => {
        drawGlow(0.4);
        drawTombstone(this.pillarData.glowColor, 0.9);
        this.tweens.add({
          targets: [rip, brandName, cross, logoText],
          scale: 1.06,
          duration: 180,
          yoyo: true,
          ease: 'Quad.easeOut',
        });
      });
      zone.on('pointerout', () => {
        drawGlow(0.15);
        drawTombstone(0x555566, 0.8);
        this.tweens.add({
          targets: [rip, brandName, cross, logoText],
          scale: 1,
          duration: 180,
          yoyo: true,
          ease: 'Quad.easeOut',
        });
      });

      this.stationZones.push(zone);

      // Emergence: alpha simple (sin tween de y para evitar bugs en arrays mixtos)
      const allElements = [rip, brandName, cross, logoText, logoBack, logoRing, glow, tombstone];
      this.tweens.add({
        targets: allElements,
        alpha: 1,
        duration: 500,
        delay: i * 150,
        ease: 'Quad.easeOut',
      });

      // Pulso suave SOLO en alpha del glow Graphics — sin tocar scale de circle
      this.time.delayedCall(500 + i * 150 + 700, () => {
        this.tweens.add({
          targets: glow,
          alpha: 0.45,
          duration: 2200 + i * 200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      });

      const visuals: StationVisuals = {
        glow,
        tombstone,
        rip,
        brandName,
        cross,
        logoBack,
        logoRing,
        logoText,
        glowR,
        logoR,
        tw,
        th,
      };
      zone.setData('brand', brand);
      zone.setData('visuals', visuals);
    });
  }

  private createTapHint(): void {
    if (this.stationZones.length === 0) return;
    const zones = getSafeZones(this.scale);
    if (zones.isMobile) return;

    const tx = this.scale.width / 2;
    const ty = this.scale.height - 36;

    const container = this.add.container(tx, ty).setDepth(UI_DEPTH + 10);

    const arrow = this.add
      .text(0, 0, '👆', { fontSize: '26px' })
      .setOrigin(0.5, 0.5);

    const hintText = this.add
      .text(0, 22, 'Toca una lápida', {
        fontSize: '14px',
        fontFamily: 'Montserrat, system-ui, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);

    const bg = this.add.graphics();
    const padX = 16;
    const padY = 10;
    const w = Math.max(100, hintText.width + padX * 2);
    const h = hintText.displayHeight + arrow.displayHeight + padY * 2 + 6;
    bg.fillStyle(0x000000, 0.55);
    bg.fillRoundedRect(-w / 2, -10, w, h, 14);
    bg.lineStyle(1, 0xf6a000, 0.45);
    bg.strokeRoundedRect(-w / 2, -10, w, h, 14);

    container.add([bg, arrow, hintText]);
    this.tapHint = container;

    this.tapHintTween = this.tweens.add({
      targets: container,
      y: ty - 8,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private destroyTapHint(): void {
    if (this.tapHintTween) {
      this.tapHintTween.stop();
      this.tapHintTween = null;
    }
    if (this.tapHint) {
      this.tapHint.destroy();
      this.tapHint = null;
    }
  }

  private onStationClick(brand: Brand, zone: Phaser.GameObjects.Zone): void {
    this.destroyTapHint();
    this.agata?.forceEndDialogue();

    const visuals = zone.getData('visuals') as StationVisuals | undefined;
    if (!visuals) return;

    const { x, y } = zone;
    const { tombstone, rip, brandName, cross, logoBack, logoRing, logoText, glow, tw, th } = visuals;

    this.stationZones.forEach((z) => z.disableInteractive());

    this.stationZones.forEach((z) => {
      if (z === zone) return;
      const otherVisuals = z.getData('visuals') as StationVisuals | undefined;
      if (!otherVisuals) return;

      const { x: ox, y: oy } = z;
      const {
        tombstone: ot,
        rip: orip,
        brandName: oname,
        cross: ocross,
        logoBack: olb,
        logoRing: olr,
        logoText: olt,
        glow: og,
        tw: otw,
        th: oth,
      } = otherVisuals;

      this.tweens.add({
        targets: [orip, oname, ocross, olb, olr, olt, og],
        alpha: 0.25,
        duration: 300,
        ease: 'Quad.easeOut',
      });
      ot.setAlpha(0.25);
      ot.clear();
      const otx = ox - otw / 2;
      const oty = oy - oth / 2;
      ot.fillStyle(0x1a1a24, 0.7);
      ot.fillRoundedRect(otx, oty, otw, oth, 4);
      ot.lineStyle(2, 0x333344, 0.5);
      ot.strokeRoundedRect(otx, oty, otw, oth, 4);

      const lock = this.add.text(ox, oy - oth * 0.45, '🔒', {
        fontSize: '20px',
      }).setOrigin(0.5, 0.5).setDepth(STATION_DEPTH + 5).setAlpha(0);
      this.tweens.add({
        targets: lock,
        alpha: 0.9,
        scale: 1.2,
        duration: 300,
        ease: 'Back.easeOut',
      });
    });

    this.sound.play('stone', { volume: 0.6 });

    const r = (this.pillarData.glowColor >> 16) & 0xff;
    const g = (this.pillarData.glowColor >> 8) & 0xff;
    const b = this.pillarData.glowColor & 0xff;

    this.cameras.main.flash(200, r, g, b);
    this.cameras.main.shake(200, 0.005);

    const fragmentCount = 12;
    for (let i = 0; i < fragmentCount; i++) {
      const frag = this.add.circle(
        x + Phaser.Math.Between(-tw / 3, tw / 3),
        y + Phaser.Math.Between(-th / 3, th / 3),
        Phaser.Math.Between(3, 8),
        Phaser.Math.Between(0x444455, 0x777788),
      ).setDepth(STATION_DEPTH + 5);
      const angle = Phaser.Math.Between(0, 360);
      const speed = Phaser.Math.Between(40, 140);
      const destX = x + Math.cos(Phaser.Math.DegToRad(angle)) * speed;
      const destY = y + Math.sin(Phaser.Math.DegToRad(angle)) * speed;
      this.tweens.add({
        targets: frag,
        x: destX,
        y: destY,
        alpha: 0,
        scale: 0.2,
        duration: 450,
        ease: 'Quad.easeOut',
        onComplete: () => frag.destroy(),
      });
    }

    this.tweens.add({
      targets: [rip, brandName, cross, logoBack, logoRing, logoText, glow],
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeOut',
    });
    this.tweens.add({
      targets: tombstone,
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeOut',
    });

    this.time.delayedCall(500, () => {
      this.enterRoom(brand);
    });
  }

  private backBtnText: Phaser.GameObjects.Text | null = null;

  private createBackButton(zones: ReturnType<typeof getSafeZones>): void {
    const x = this.playBounds.right - 14;
    const y = this.playBounds.y + (zones.isMobile ? 6 : 12);

    this.backBtnText = this.add
      .text(x, y, '← Cripta', {
        fontSize: zones.isMobile ? '13px' : '15px',
        fontFamily: 'Montserrat, system-ui, sans-serif',
        color: '#ffffff',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(1, 0)
      .setDepth(UI_DEPTH)
      .setInteractive({ useHandCursor: true });

    this.backBtnText.on('pointerdown', () => this.onBackClick());
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
    const isMobile = zones.isMobile;
    this.backBtnText?.setPosition(this.playBounds.right - 14, this.playBounds.y + (isMobile ? 6 : 12));
    this.stationZones.forEach((zone, i) => {
      const { x, y } = positions[i];
      zone.setPosition(x, y);
      const visuals = zone.getData('visuals') as StationVisuals | undefined;
      if (!visuals) return;
      const { tw: stoneW, th: stoneH, glowR, logoR } = visuals;
      const logoY = y - stoneH * 0.58;

      visuals.glow.setPosition(x, y);
      visuals.glow.clear();
      visuals.glow.fillStyle(this.pillarData.glowColor, 0.15);
      visuals.glow.fillCircle(x, y, glowR);

      const tx = x - stoneW / 2;
      const ty = y - stoneH / 2;
      visuals.tombstone.clear();
      visuals.tombstone.fillStyle(0x2a2a3a, 0.9);
      visuals.tombstone.fillRoundedRect(tx, ty, stoneW, stoneH, 8);
      visuals.tombstone.lineStyle(2, 0x555566, 0.8);
      visuals.tombstone.strokeRoundedRect(tx, ty, stoneW, stoneH, 8);

      visuals.logoBack.clear();
      visuals.logoBack.fillStyle(0x1a1a2e, 0.9);
      visuals.logoBack.fillCircle(x, logoY, logoR);

      visuals.logoRing.clear();
      visuals.logoRing.lineStyle(1, 0x555566, 0.7);
      visuals.logoRing.strokeCircle(x, logoY, logoR);

      visuals.rip.setPosition(x, y - stoneH * 0.22);
      visuals.brandName.setPosition(x, y + stoneH * 0.15);
      visuals.cross.setPosition(x, y - stoneH * 0.72);
      visuals.logoText.setPosition(x, logoY);
    });
  };

  private enterRoom(brand: Brand): void {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('RoomScene', { brand, pillarId: this.pillarData.id });
    });
  }

  private returnToHub(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('HubScene');
    });
  }

  shutdown(): void {
    this.scale.off('resize', this.onResize, this);
    if (this.lightningTimer) this.lightningTimer.remove();
    this.destroyTapHint();
    this.stationZones.forEach((z) => z.destroy());
    this.stationZones = [];
    this.decor.forEach((d) => (d as Phaser.GameObjects.GameObject).destroy());
    this.decor = [];
    this.backBtnText?.destroy();
    this.backBtnText = null;
    this.agata?.destroy();
    this.agata = null;
  }
}
