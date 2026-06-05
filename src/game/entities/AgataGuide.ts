import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { getAgataPosition } from '../utils/layout';
import type { AgataAnimState } from '../../data/agataDialogues';

const FRAME_HEIGHT = 720;
const DISPLAY_SCALE_BASE = 0.22;

export type { AgataAnimState };

/**
 * `AgataGuide` - Personaje guía con sprite sheet y animaciones Phaser.
 */
export class AgataGuide {
  public readonly sprite: Phaser.GameObjects.Sprite;
  private readonly scene: Phaser.Scene;
  private currentAnim: AgataAnimState = 'idle';
  private breatheTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const pos = getAgataPosition(scene.scale, FRAME_HEIGHT, DISPLAY_SCALE_BASE);
    this.sprite = scene.add.sprite(pos.x, pos.y, 'agata', 0);
    this.sprite.setScale(pos.scale);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(50);

    this.createAnimations();
    this.playState('idle');
    this.startIdleBreathing();

    EventBus.on('agata-anim', this.onAnimEvent, this);
    scene.scale.on('resize', this.onResize, this);
  }

  private createAnimations(): void {
    if (this.scene.anims.exists('agata-idle')) return;

    this.scene.anims.create({
      key: 'agata-idle',
      frames: this.scene.anims.generateFrameNumbers('agata', { start: 0, end: 1 }),
      frameRate: 2,
      repeat: -1,
    });

    this.scene.anims.create({
      key: 'agata-talk',
      frames: this.scene.anims.generateFrameNumbers('agata', { frames: [2, 0, 2, 1] }),
      frameRate: 6,
      repeat: -1,
    });

    this.scene.anims.create({
      key: 'agata-point',
      frames: [{ key: 'agata', frame: 3 }],
      frameRate: 1,
      repeat: 0,
    });

    this.scene.anims.create({
      key: 'agata-wink',
      frames: [{ key: 'agata', frame: 4 }],
      frameRate: 1,
      repeat: 0,
    });
  }

  /**
   * Cambia la animación visible de Ágata.
   */
  public playState(state: AgataAnimState): void {
    this.currentAnim = state;
    const key = `agata-${state}`;
    if (state === 'idle') {
      this.sprite.anims.play('agata-idle', true);
      this.startIdleBreathing();
      return;
    }
    this.breatheTween?.stop();
    if (state === 'point' || state === 'wink') {
      this.sprite.once(`animationcomplete-${key}`, () => this.playState('idle'));
      this.sprite.anims.play(key, false);
      return;
    }
    this.sprite.anims.play(key, true);
  }

  private startIdleBreathing(): void {
    this.breatheTween?.stop();
    this.breatheTween = this.scene.tweens.add({
      targets: this.sprite,
      scaleY: this.sprite.scaleY * 1.03,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private onAnimEvent(payload: { state: AgataAnimState }): void {
    this.playState(payload.state);
  }

  private onResize = (): void => {
    const pos = getAgataPosition(this.scene.scale, FRAME_HEIGHT, DISPLAY_SCALE_BASE);
    this.sprite.setPosition(pos.x, pos.y);
    this.sprite.setScale(pos.scale);
  };

  /**
   * Punto de anclaje para burbujas React (coordenadas de pantalla).
   */
  public getAnchor(): { x: number; y: number } {
    const matrix = this.sprite.getWorldTransformMatrix();
    return { x: matrix.tx, y: matrix.ty - this.sprite.displayHeight - 12 };
  }

  public emitAnchorUpdate(): void {
    EventBus.emit('agata-anchor', this.getAnchor());
  }

  public destroy(): void {
    EventBus.off('agata-anim', this.onAnimEvent, this);
    this.scene.scale.off('resize', this.onResize, this);
    this.breatheTween?.destroy();
    this.sprite.destroy();
  }
}