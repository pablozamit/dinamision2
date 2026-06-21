import Phaser from 'phaser';
import { AgataSpeechBubble } from './AgataSpeechBubble';
import { EventBus } from '../EventBus';
import {
  getSafeZones,
  getAgataNpcPosition,
  type SafeZones,
} from '../utils/layout';
import type { BrandDialogue, DialogueNode } from '../../data/dialogueData';
import { hubIntroDialogue } from '../../data/dialogueData';
import { findBrandById } from '../../data/brandData';
import { buildBrandDialogue } from '../../data/buildBrandDialogue';

export type AgataAnimState = 'idle' | 'jump' | 'talk' | 'walk';

export class AgataGuide {
  public readonly root: Phaser.GameObjects.Container;
  private readonly scene: Phaser.Scene;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly aura: Phaser.GameObjects.Arc;
  private readonly bubble: AgataSpeechBubble;
  private zones: SafeZones;
  private breatheTween: Phaser.Tweens.Tween | null = null;
  private jumpTween: Phaser.Tweens.Tween | null = null;
  private walkTimer: Phaser.Time.TimerEvent | null = null;
  private activeDialogue: BrandDialogue | null = null;
  private currentNodeId: string | null = null;
  private activeBrandId: string | null = null;
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

    this.aura = scene.add
      .circle(0, 0, 40, 0x8a2be2, 0.4)
      .setStrokeStyle(2, 0xd32f2f, 0.8);

    this.sprite = scene.add.sprite(0, 0, 'agata-idle');
    this.sprite.setOrigin(0.5, 1);

    this.root.add([this.aura, this.sprite]);
    // CORREGIDO: Recuperamos la burbuja de Phaser nativa.
    this.bubble = new AgataSpeechBubble(scene);

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

  public playDialogue(dialogue: BrandDialogue, brandId?: string): void {
    this.showCharacter();
    this.activeDialogue = dialogue;
    this.activeBrandId = brandId ?? null;
    this.showNode(dialogue.startNodeId);
  }

  private showNode(nodeId: string): void {
    if (!this.activeDialogue) return;
    const node = this.activeDialogue.nodes[nodeId];
    if (!node) {
      this.endDialogue();
      return;
    }
    this.currentNodeId = nodeId;

    if (node.onComplete === 'frase-clave-collected' && this.activeBrandId) {
      const brand = findBrandById(this.activeBrandId);
      if (brand) {
        EventBus.emit('frase-clave-collected', brand.result.fraseClave);
      }
    }

    const anchor = this.getBubbleAnchor();
    this.bubble.show(node, anchor.x, anchor.y, anchor.maxWidth, {
      onAdvance: () => this.advanceFromNode(node),
      onChoice: (nextId) => this.handleChoice(nextId),
    });
    this.bubble.enableTapAdvance();
  }

  private advanceFromNode(node: DialogueNode): void {
    if (node.options && node.options.length > 0) return;
    if (node.nextId === 'exit' || node.nextId === 'end' || !node.nextId) {
      this.endDialogue();
      return;
    }
    this.showNode(node.nextId);
  }

  private handleChoice(nextId: string): void {
    if (!nextId) {
      this.endDialogue();
      return;
    }
    if (nextId === 'exit') {
      EventBus.emit('dialogue-exit-request');
      this.endDialogue();
      return;
    }
    this.showNode(nextId);
  }

  private endDialogue(): void {
    this.bubble.hide();
    this.activeDialogue = null;
    this.currentNodeId = null;
    this.activeBrandId = null;
    this.playState('idle');
    EventBus.emit('dialogue-finished');
  }

  public playState(state: AgataAnimState): void {
    if (state === 'idle') {
      this.sprite.play('agata-idle-anim', true);
      this.breatheTween?.resume();
      this.startIdleBreathing();
    } else if (state === 'talk') {
      // Habría que añadir animaciones de talk, de momento idle.
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

  public isDialogueBlocking(): boolean {
    return this.activeDialogue !== null;
  }

  private applyLayout(): void {
    this.zones = getSafeZones(this.scene.scale);
    const pos = getAgataNpcPosition(this.scene.scale, this.zones);
    this.root.setPosition(pos.x, pos.y);
    this.root.setScale(pos.scale);
    this.sprite.setPosition(0, 0);

    // CORREGIDO: Reducimos el radio del aura morada en móviles para que no se corte por el borde.
    const auraRadiusFactor = this.zones.isMobile ? 0.35 : 0.4;
    this.aura.setPosition(0, -this.sprite.displayHeight * 0.45);
    this.aura.setRadius(this.sprite.displayWidth * auraRadiusFactor);

    if (this.currentNodeId && this.activeDialogue) {
      const anchor = this.getBubbleAnchor();
      this.bubble.setPosition(anchor.x, anchor.y, anchor.maxWidth);
    }
  }

  // CORREGIDO: Recuperamos el cálculo del ancla de la burbuja nativa de Phaser.
  private getBubbleAnchor(): { x: number; y: number; maxWidth: number } {
    const pos = getAgataNpcPosition(this.scene.scale, this.zones);
    if (this.zones.isMobile) {
      const headY = this.root.y - this.sprite.displayHeight - 8;
      return {
        x: this.root.x,
        y: headY,
        maxWidth: this.scene.scale.width * 0.82,
      };
    }
    const headY = this.root.y - this.sprite.displayHeight - 5;
    return {
      x: this.root.x,
      y: headY,
      maxWidth: pos.bubbleMaxWidth,
    };
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
          id: 'start',
          speaker: 'agata',
          text: `¡Cuidado! Has entrado en las ruinas del pilar de ${pillarName}. Toca una lápida para desenterrar su trágico error...`,
          nextId: 'end',
        },
        end: {
          id: 'end',
          speaker: 'agata',
          text: 'Cada tumba esconde un Antídoto que necesitas. ¡Investiga!',
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
          id: 'start',
          speaker: 'agata',
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
    this.bubble.destroy();
    this.root.destroy();
  }
}
