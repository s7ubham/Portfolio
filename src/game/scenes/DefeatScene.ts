import Phaser from 'phaser'
import { GameRegistry } from '@game/GameRegistry'
import { AudioManager } from '@game/systems/AudioManager'
import { TypewriterDialog } from '@game/ui/DialogBox'
import { STARTER_NAMES } from '@game-types/game'

export class DefeatScene extends Phaser.Scene {
  private dialog!: TypewriterDialog
  private audio!: AudioManager
  private pokeball!: Phaser.GameObjects.Image
  private playerSprite!: Phaser.GameObjects.Image
  private sparkle!: Phaser.GameObjects.Image

  constructor() {
    super('DefeatScene')
  }

  create(): void {
    const { starterId, playerName } = GameRegistry.get()
    this.audio = new AudioManager(this)
    this.audio.stopBgm()

    this.add.image(120, 80, 'battle-bg').setDisplaySize(240, 160).setTint(0x888888)

    this.playerSprite = this.add
      .image(56, 108, `starter-${starterId}-back`)
      .setScale(1.4)
      .setAlpha(0.6)

    this.pokeball = this.add.image(56, 60, 'pokeball').setScale(1.5).setVisible(false)
    this.sparkle = this.add.image(56, 108, 'sparkle').setVisible(false)

    this.dialog = new TypewriterDialog(this, 120, 132, 220, 36)

    this.dialog.showMessage(`${playerName} has no more Pokémon!`, () => {
      this.dialog.showMessage('You have been defeated!', () => {
        this.playCaptureSequence()
      })
    })
  }

  private playCaptureSequence(): void {
    this.audio.playCapture()
    this.pokeball.setVisible(true)

    this.tweens.add({
      targets: this.pokeball,
      y: 108,
      duration: 400,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.tweens.add({
          targets: this.pokeball,
          angle: 360,
          duration: 600,
          onComplete: () => {
            this.playerSprite.setVisible(false)
            this.sparkle.setVisible(true)

            this.tweens.add({
              targets: this.sparkle,
              alpha: { from: 1, to: 0 },
              scale: { from: 1, to: 2 },
              duration: 800,
              onComplete: () => this.showFinalMessage(),
            })
          },
        })
      },
    })
  }

  private showFinalMessage(): void {
    const { starterId } = GameRegistry.get()

    this.dialog.showMessage(
      `Subham caught ${GameRegistry.getPlayerName()}'s ${STARTER_NAMES[starterId]}!`,
      () => {
        this.dialog.showMessage("Thanks for visiting Subham's portfolio!", () => {
          this.add
            .text(120, 80, 'THE END', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '16px',
              color: '#f8f878',
            })
            .setOrigin(0.5)
            .setAlpha(0)

          this.tweens.add({
            targets: this.children.list[this.children.list.length - 1],
            alpha: 1,
            duration: 1200,
          })
        })
      },
    )
  }
}
