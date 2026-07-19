import Phaser from 'phaser'
import { s } from '@game-types/game'

export class HPBar {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private fill: Phaser.GameObjects.Rectangle
  private maxWidth: number
  private currentHP = 100

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    labelText: string,
  ) {
    this.scene = scene
    this.maxWidth = width - s(4)

    const label = scene.add.text(-width / 2, -s(8), labelText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: `${s(5)}px`,
      color: '#e05050',
      resolution: 3,
    })

    const frame = scene.add.rectangle(s(8), 0, width, s(8), 0x404040)
    const inner = scene.add.rectangle(s(8), 0, width - s(2), s(5), 0xf8f8f8)
    this.fill = scene.add
      .rectangle(s(8) - this.maxWidth / 2, 0, this.maxWidth, s(4), 0x58d058)
      .setOrigin(0, 0.5)

    this.container = scene.add.container(x, y, [label, frame, inner, this.fill])
    this.updateColor()
  }

  setHP(hp: number, animate = true): void {
    this.currentHP = Phaser.Math.Clamp(hp, 0, 100)
    const targetWidth = (this.maxWidth * this.currentHP) / 100

    if (animate) {
      this.scene.tweens.add({
        targets: this.fill,
        width: targetWidth,
        duration: 600,
        ease: 'Quad.easeOut',
        onUpdate: () => this.updateColor(),
      })
    } else {
      this.fill.width = targetWidth
      this.updateColor()
    }
  }

  getHP(): number {
    return this.currentHP
  }

  private updateColor(): void {
    const ratio = this.fill.width / this.maxWidth
    if (ratio > 0.5) {
      this.fill.setFillStyle(0x58d058)
    } else if (ratio > 0.2) {
      this.fill.setFillStyle(0xf8d030)
    } else {
      this.fill.setFillStyle(0xf85858)
    }
  }

  destroy(): void {
    this.container.destroy()
  }
}
