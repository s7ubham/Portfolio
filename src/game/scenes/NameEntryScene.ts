import Phaser from 'phaser'
import { GameRegistry } from '@game/GameRegistry'
import { TypewriterDialog } from '@game/ui/DialogBox'
import { AudioManager } from '@game/systems/AudioManager'

const MAX_NAME_LENGTH = 10

export class NameEntryScene extends Phaser.Scene {
  private dialog!: TypewriterDialog
  private nameText!: Phaser.GameObjects.Text
  private playerName = ''
  private audio!: AudioManager
  private confirmed = false

  constructor() {
    super('NameEntryScene')
  }

  create(): void {
    GameRegistry.reset()
    this.audio = new AudioManager(this)

    this.add.image(120, 80, 'battle-bg').setDisplaySize(240, 160)

    this.dialog = new TypewriterDialog(this, 120, 120, 220, 36)
    this.dialog.showMessage("What's your name?")

    this.nameText = this.add
      .text(120, 96, '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#f8f8f8',
        backgroundColor: '#303030',
        padding: { x: 6, y: 4 },
      })
      .setOrigin(0.5)

    this.add
      .text(120, 148, 'TYPE NAME + PRESS ENTER', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '5px',
        color: '#f8f8f8',
      })
      .setOrigin(0.5)

    this.input.keyboard?.on('keydown', this.handleKeyDown, this)
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.confirmed) return

    this.audio.unlock()

    if (event.key === 'Enter') {
      if (this.playerName.trim().length === 0) {
        this.dialog.showMessage('Please enter a name!')
        return
      }

      this.confirmed = true
      GameRegistry.set({ playerName: this.playerName.trim() })
      this.audio.playSelect()
      this.dialog.showMessage(`Right! So your name is ${this.playerName.trim()}!`, () => {
        this.time.delayedCall(600, () => this.scene.start('StarterSelectScene'))
      })
      return
    }

    if (event.key === 'Backspace') {
      this.playerName = this.playerName.slice(0, -1)
      this.nameText.setText(this.playerName)
      this.audio.playSelect()
      return
    }

    if (event.key.length === 1 && /^[a-zA-Z0-9 ]$/.test(event.key)) {
      if (this.playerName.length >= MAX_NAME_LENGTH) return
      this.playerName += event.key.toUpperCase()
      this.nameText.setText(this.playerName)
      this.audio.playSelect()
    }
  }

  shutdown(): void {
    this.input.keyboard?.off('keydown', this.handleKeyDown, this)
  }
}
