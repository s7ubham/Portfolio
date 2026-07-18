import Phaser from 'phaser'

export class DialogBox {
  protected scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private text: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    this.scene = scene

    const bg = scene.textures.exists('dialog-frame')
      ? scene.add.image(0, 0, 'dialog-frame').setDisplaySize(width, height)
      : scene.add.rectangle(0, 0, width, height, 0xf8f8f8, 1)

    if (!scene.textures.exists('dialog-frame')) {
      const border = scene.add.rectangle(0, 0, width, height).setStrokeStyle(2, 0x303030)
      this.container = scene.add.container(x, y, [bg, border])
    } else {
      this.container = scene.add.container(x, y, [bg])
    }

    this.text = scene.add
      .text(-width / 2 + 10, -height / 2 + 8, '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: '#202020',
        wordWrap: { width: width - 20 },
        lineSpacing: 4,
      })
      .setOrigin(0, 0)

    this.container.add(this.text)
  }

  setMessage(message: string): void {
    this.text.setText(message)
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible)
  }

  destroy(): void {
    this.container.destroy()
  }
}

export class TypewriterDialog extends DialogBox {
  private timer?: Phaser.Time.TimerEvent
  private fullText = ''
  private onComplete?: () => void

  showMessage(message: string, onComplete?: () => void): void {
    this.fullText = message
    this.onComplete = onComplete
    this.timer?.remove(false)
    this.setMessage('')

    let index = 0
    this.timer = this.scene.time.addEvent({
      delay: 24,
      repeat: message.length,
      callback: () => {
        index += 1
        this.setMessage(message.slice(0, index))
        if (index >= message.length) {
          this.onComplete?.()
        }
      },
    })
  }

  skipToEnd(): void {
    this.timer?.remove(false)
    this.setMessage(this.fullText)
    this.onComplete?.()
    this.onComplete = undefined
  }
}
