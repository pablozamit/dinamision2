import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import {
  getSafeZones,
  getAgataNpcPosition,
  type SafeZones,
} from '../utils/layout';
import type { BrandDialogue } from '../../data/dialogueData';
import { hubIntroDialogue } from '../../data/dialogueData';
import { findBrandById } from '../../data/brandData';
import { buildBrandDialogue } from '../../data/buildBrandDialogue';

export type AgataAnimState = 'idle' | 'jump' | 'talk' | 'walk';

export class AgataGuide {
  public readonly root: Phaser.GameObjects.Container;
  private readonly scene: Phaser.Scene;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly aura: Phaser.GameObjects.Arc;
  private zones: SafeZones;
  private breatheTween: Phaser.Tweens.Tween | null = null;
  private jumpTween: Phaser.Tweens.Tween | null = null;
  private walkTimer: Phaser.Time.TimerEvent | null = null;
  private activeDialogue: BrandDialogue | null = null;
  private visible = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.zones = getSafeZones(scene.scale);
    this.root = scene.add.container(0, 0).setDepth(80);

    if (!scene.anims.exists('agata-idle-anim')) {
      scene.anims.create({
        key: 'agata-idle-anim',
        frames: scene.anims.generateFrameNumbers('agata-idle', { start: 0, end: 24 }),
        frameRate: 12,
        repeat: -1,
      });
    }
    if (!scene.anims.exists('agata-jump-anim')) {
      scene.anims.create({
        key: 'agata-jump-anim',
        frames: scene.anims.generateFrameNumbers('agata-jump', { start: 0, end: 24 }),
        frameRate: 18,
        repeat: 0,
      });
    }
    if (!scene.anims.exists('agata-walk-anim')) {
      scene.anims.create({
        key: 'agata-walk-anim',
        frames: scene.anims.generateFrameNumbers('agata-walk', { start: 0, end: 15 }),
        frameRate: 14,
        repeat: -1,
      });
    }

    this.aura = scene.add.circle(0, 0, 40, 0x8a2be2, 0.4).setStrokeStyle(2, 0xd32f2f, 0.8);
    this.sprite = scene.add.sprite(0, 0, 'agata-idle');
    this.sprite.setOrigin(0.5, 1);

    this.root.add([this.aura, this.sprite]);

    this.applyLayout();
    this.root.setAlpha(0);

    scene.scale.on('resize', this.onResize, this);

    EventBus.on('start-hub-intro', this.onHubIntro, this);
    EventBus.on('start-pillar-intro', this.onPillarIntro, this);
    EventBus.on('start-brand-dialogue', this.onBrandDialogue, this);
  }

  public showCharacter(): void {
    this.applyLayout();
    if (!this.visible) {
      this.visible = true;
      const targetY = this.root.y;
      this.root.y += 20;
      this.root.setAlpha(0);
      this.scene.tweens.add({
        targets: this.root,
        alpha: 1,
        y: targetY,
        duration: 400,
        ease: 'Cubic.easeOut',
      });
      this.playState('walk');
      this.walkTimer?.remove();
      this.walkTimer = this.scene.time.delayedCall(1000, () => {
        if (!this.activeDialogue) this.playState('idle');
      });
    } else {
      this.root.setAlpha(1);
      this.playState('idle');
    }
  }

  public forceEndDialogue(): void {
    if (this.activeDialogue) this.endDialogue();
  }

  private playDialogue(dialogue: BrandDialogue, brandId?: string): void {
    this.showCharacter();
    this.activeDialogue = dialogue;
  }

  private endDialogue(): void {
    this.activeDialogue = null;
    this.playState('idle');
    EventBus.emit('dialogue-finished');
  }

  public playState(state: AgataAnimState): void {
    if (state === 'idle') {
      this.sprite.play('agata-idle-anim', true);
      this.breatheTween?.resume();
      this.startIdleBreathing();
    } else if (state === 'talk') {
      this.sprite.play('agata-idle-anim', true);
    } else if (state === 'jump') {
      this.jump();
    } else if (state === 'walk') {
      this.breatheTween?.pause();
      this.sprite.play('agata-walk-anim', true);
    }
  }

  private jump(): void {
    if (this.jumpTween?.isPlaying()) return;
    this.breatheTween?.pause();
    this.sprite.play('agata-jump-anim');
    this.jumpTween = this.scene.tweens.add({
      targets: this.sprite,
      y: -40,
      duration: 300,
      yoyo: true,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.sprite.play('agata-idle-anim');
        this.sprite.setY(0);
        this.breatheTween?.resume();
      }
    });
  }

  private startIdleBreathing(): void {
    if (this.breatheTween) return;
    this.breatheTween = this.scene.tweens.add({
      targets: this.sprite,
      scaleY: 1.02,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private applyLayout(): void {
    this.zones = getSafeZones(this.scene.scale);
    const pos = getAgataNpcPosition(this.scene.scale, this.zones);
    this.root.setPosition(pos.x, pos.y);
    this.root.setScale(pos.scale);
    this.sprite.setPosition(0, 0);

    // Aura perfectamente centrada usando la escala real del sprite.
    const auraRadiusFactor = this.zones.isMobile ? 0.35 : 0.4;
    this.aura.setPosition(0, -this.sprite.displayHeight * 0.55);
    this.aura.setRadius(this.sprite.displayWidth * auraRadiusFactor);
  }

  private onResize = (): void => {
    this.applyLayout();
  };

  private onHubIntro = (): void => {
    this.playDialogue(hubIntroDialogue);
  };

  private onPillarIntro = (pillarName: string): void => {
    const dialogue: BrandDialogue = {
      startNodeId: 'start',
      nodes: {
        start: {
          id: 'start', speaker: 'agata',
          text: `¡Cuidado! Has entrado en las ruinas del pilar de ${pillarName}. Toca una lápida para desenterrar su trágico error...`,
          nextId: 'end',
        },
        end: {
          id: 'end', speaker: 'agata',
          text: '¡Cada tumba esconde un Antídoto que necesitas. ¡Investiga!',
          options: [{ text: '💀 ¡A investigar!', nextId: '' }],
        },
      },
    };
    this.playDialogue(dialogue);
  };

  private onBrandDialogue = (brandId: string): void => {
    const brand = findBrandById(brandId);
    if (brand) {
      this.playDialogue(buildBrandDialogue(brand), brandId);
      return;
    }
    this.playDialogue({
      startNodeId: 'start',
      nodes: {
        start: {
          id: 'start', speaker: 'agata',
          text: 'Próximamente más secretos de esta marca…',
          options: [{ text: 'Volver', nextId: 'exit' }],
        },
      },
    });
  };

  public destroy(): void {
    EventBus.off('start-hub-intro', this.onHubIntro, this);
    EventBus.off('start-pillar-intro', this.onPillarIntro, this);
    EventBus.off('start-brand-dialogue', this.onBrandDialogue, this);
    this.scene.scale.off('resize', this.onResize, this);
    this.breatheTween?.stop();
    this.jumpTween?.stop();
    this.walkTimer?.remove();
    this.root.destroy();
  }
}
