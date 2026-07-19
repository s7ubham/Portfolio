import Phaser from 'phaser'
import { s } from '@game-types/game'

/** Pause after a line finishes typing so players can read before the next beat */
const READ_PAUSE_MS = 1500

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
      const border = scene.add.rectangle(0, 0, width, height).setStrokeStyle(s(2), 0x303030)
      this.container = scene.add.container(x, y, [bg, border])
    } else {
      this.container = scene.add.container(x, y, [bg])
    }

    this.text = scene.add
      .text(-width / 2 + s(10), -height / 2 + s(8), '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: `${s(7)}px`,
        color: '#202020',
        wordWrap: { width: width - s(20) },
        lineSpacing: s(4),
        resolution: 3,
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
  private readTimer?: Phaser.Time.TimerEvent
  private fullText = ''
  private onComplete?: () => void
  private finished = false

  showMessage(message: string, onComplete?: () => void): void {
    this.fullText = message
    this.onComplete = onComplete
    this.finished = false
    this.timer?.remove(false)
    this.readTimer?.remove(false)
    this.setMessage('')

    if (message.length === 0) {
      this.finish()
      return
    }

    let index = 0
    // Phaser fires (repeat + 1) times — use length - 1 so we end exactly once
    this.timer = this.scene.time.addEvent({
      delay: 30,
      repeat: Math.max(0, message.length - 1),
      callback: () => {
        index += 1
        this.setMessage(message.slice(0, index))
        if (index >= message.length) {
          this.finish()
        }
      },
    })
  }

  skipToEnd(): void {
    this.timer?.remove(false)
    this.setMessage(this.fullText)
    this.finish()
  }

  private finish(): void {
    if (this.finished) return
    this.finished = true
    this.timer?.remove(false)

    const callback = this.onComplete
    this.onComplete = undefined
    if (!callback) return

    // Hold the finished line on screen before advancing
    this.readTimer = this.scene.time.delayedCall(READ_PAUSE_MS, () => {
      callback()
    })
  }
}
