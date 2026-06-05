import Phaser from 'phaser';
import type { DialogueNode, DialogueOption } from '../../data/dialogueData';

const BUBBLE_DEPTH = 120;
const PADDING = 16;
/**
 * Burbuja de diálogo dibujada en Phaser, anclada al personaje.
 */
export class AgataSpeechBubble {
  public readonly container: Phaser.GameObjects.Container;
  private readonly scene: Phaser.Scene;
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly nameText: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  private readonly hintText: Phaser.GameObjects.Text;
  private readonly choiceTexts: Phaser.GameObjects.Text[] = [];
  private choiceZones: Phaser.GameObjects.Zone[] = [];
  private onAdvance: (() => void) | null = null;
  private onChoice: ((nextId: string) => void) | null = null;
  private bubbleW = 280;
  private bubbleH = 100;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setDepth(BUBBLE_DEPTH).setVisible(false);
    this.bg = scene.add.graphics();
    this.nameText = scene.add.text(0, 0, 'ÁGATA', {
      fontFamily: 'Montserrat, system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#705893',
    });
    this.bodyText = scene.add.text(0, 0, '', {
      fontFamily: 'Montserrat, system-ui, sans-serif',
      fontSize: '15px',
      color: '#1a1a2e',
      wordWrap: { width: 260 },
      lineSpacing: 4,
    });
    this.hintText = scene.add.text(0, 0, 'Toca para continuar', {
      fontFamily: 'Montserrat, system-ui, sans-serif',
      fontSize: '11px',
      color: '#888888',
      fontStyle: 'italic',
    });
    this.container.add([this.bg, this.nameText, this.bodyText, this.hintText]);
  }

  public show(
    node: DialogueNode,
    anchorX: number,
    anchorTopY: number,
    maxWidth: number,
    handlers: { onAdvance: () => void; onChoice: (nextId: string) => void },
  ): void {
    this.onAdvance = handlers.onAdvance;
    this.onChoice = handlers.onChoice;
    this.clearChoices();

    const isMobile = this.scene.scale.width <= 480;
    this.bubbleW = Math.min(maxWidth, isMobile ? 350 : 320);
    this.bodyText.setWordWrapWidth(this.bubbleW - PADDING * 2);

    this.nameText.setText('ÁGATA');
    this.bodyText.setText(node.text);

    const hasChoices = Boolean(node.options && node.options.length > 0);
    this.hintText.setVisible(!hasChoices);

    let contentH = PADDING + 18 + this.bodyText.height + 12;
    if (hasChoices && node.options) {
      node.options.forEach((opt, i) => {
        const btn = this.createChoiceButton(opt, i);
        contentH += btn.height + 10;
      });
    } else {
      contentH += 20;
    }

    this.bubbleH = contentH + PADDING;
    this.redrawBubble();
    this.layoutAt(anchorX, anchorTopY);
    this.container.setVisible(true);
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      y: this.container.y - 8,
      duration: 220,
      ease: 'Back.easeOut',
    });
  }

  private createChoiceButton(opt: DialogueOption, index: number): Phaser.GameObjects.Text {
    const y = PADDING + 18 + this.bodyText.height + 16 + index * 44;
    const label = this.scene.add
      .text(PADDING, y, opt.text, {
        fontFamily: 'Montserrat, system-ui, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#705893',
        padding: { x: 14, y: 10 },
        fixedWidth: this.bubbleW - PADDING * 2,
        wordWrap: { width: this.bubbleW - PADDING * 2 - 28 },
      })
      .setInteractive({ useHandCursor: true });
    label.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event?.stopPropagation();
      this.onChoice?.(opt.nextId);
    });
    this.choiceTexts.push(label);
    this.container.add(label);
    return label;
  }

  private clearChoices(): void {
    this.choiceTexts.forEach((t) => t.destroy());
    this.choiceZones.forEach((z) => z.destroy());
    this.choiceTexts.length = 0;
    this.choiceZones.length = 0;
  }

  private redrawBubble(): void {
    const w = this.bubbleW;
    const h = this.bubbleH;
    const r = 18;
    this.bg.clear();
    this.bg.fillStyle(0xffffff, 0.97);
    this.bg.lineStyle(2, 0x705893, 0.45);
    this.bg.fillRoundedRect(0, 0, w, h, r);
    this.bg.strokeRoundedRect(0, 0, w, h, r);

    // Comic tail (más fina y centrada hacia Ágata)
    const tailX = w * 0.15;
    this.bg.fillTriangle(tailX, h, tailX + 24, h, tailX + 8, h + 12);
    this.bg.lineStyle(2, 0x705893, 0.45);
    this.bg.lineBetween(tailX, h, tailX + 8, h + 12);
    this.bg.lineBetween(tailX + 24, h, tailX + 8, h + 12);

    this.nameText.setPosition(PADDING, PADDING);
    this.bodyText.setPosition(PADDING, PADDING + 18);
    this.hintText.setPosition(PADDING, h - 24);
  }

  private layoutAt(anchorX: number, anchorTopY: number): void {
    const isMobile = this.scene.scale.width <= 480;
    const margin = 8;

    if (isMobile) {
      const x = Phaser.Math.Clamp(
        anchorX - this.bubbleW / 2,
        margin,
        this.scene.scale.width - this.bubbleW - margin,
      );
      this.container.setPosition(x, anchorTopY);
      return;
    }

    let x = anchorX - this.bubbleW * 0.2;
    x = Phaser.Math.Clamp(x, margin, this.scene.scale.width - this.bubbleW - margin);
    const y = anchorTopY - this.bubbleH - 10;
    this.container.setPosition(x, y);
  }

  public setPosition(anchorX: number, anchorTopY: number, maxWidth: number): void {
    const isMobile = this.scene.scale.width <= 480;
    this.bubbleW = Math.min(maxWidth, isMobile ? 350 : 320);
    this.bodyText.setWordWrapWidth(this.bubbleW - PADDING * 2);
    this.redrawBubble();
    this.layoutAt(anchorX, anchorTopY);
  }

  public enableTapAdvance(): void {
    this.choiceZones.forEach((z) => z.destroy());
    this.choiceZones.length = 0;
    const zone = this.scene.add
      .zone(0, 0, this.bubbleW, this.bubbleH)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });
    zone.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.hintText.visible) {
        p.event?.stopPropagation();
        this.onAdvance?.();
      }
    });
    this.container.add(zone);
    this.container.sendToBack(zone);
    this.choiceZones.push(zone);
  }

  public hide(): void {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 180,
      onComplete: () => {
        this.container.setVisible(false);
        this.clearChoices();
      },
    });
  }

  public destroy(): void {
    this.clearChoices();
    this.container.destroy();
  }
}