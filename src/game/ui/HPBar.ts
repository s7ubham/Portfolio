import Phaser from 'phaser'

export class HPBar {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private fill: Phaser.GameObjects.Rectangle
  private label: Phaser.GameObjects.Text
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
    this.maxWidth = width - 4

    const frame = scene.add.rectangle(0, 0, width, 10, 0x404040)
    const inner = scene.add.rectangle(0, 0, width - 2, 8, 0x202020)
    this.fill = scene.add.rectangle(-this.maxWidth / 2, 0, this.maxWidth, 6, 0x58d058).setOrigin(0, 0.5)
    this.label = scene.add.text(-width / 2, -14, labelText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#f8f8f8',
    })

    this.container = scene.add.container(x, y, [frame, inner, this.fill, this.label])
    this.updateColor()
  }

  setHP(hp: number, animate = true): void {
    this.currentHP = Phaser.Math.Clamp(hp, 0, 100)
    const targetWidth = (this.maxWidth * this.currentHP) / 100

    if (animate) {
      this.scene.tweens.add({
        targets: this.fill,
        width: targetWidth,
        duration: 500,
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
