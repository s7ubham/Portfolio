import Phaser from 'phaser'
import { EventBus, GAME_EVENTS } from '@game/EventBus'
import { GameRegistry } from '@game/GameRegistry'
import { AudioManager } from '@game/systems/AudioManager'
import { TypewriterDialog } from '@game/ui/DialogBox'
import { GAME_HEIGHT, GAME_WIDTH, STARTER_NAMES, s } from '@game-types/game'

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

    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'battle-bg')
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setTint(0x888888)

    this.playerSprite = this.add
      .image(s(56), s(102), `starter-${starterId}-back`)
      .setScale(1.9)
      .setAlpha(0.6)

    this.pokeball = this.add.image(s(56), s(56), 'pokeball').setScale(2).setVisible(false)
    this.sparkle = this.add.image(s(56), s(102), 'sparkle').setScale(2).setVisible(false)

    this.dialog = new TypewriterDialog(this, GAME_WIDTH / 2, s(132), s(220), s(36))

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
      y: s(102),
      duration: 450,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.tweens.add({
          targets: this.pokeball,
          angle: 360,
          duration: 650,
          onComplete: () => {
            this.playerSprite.setVisible(false)
            this.sparkle.setVisible(true)

            this.tweens.add({
              targets: this.sparkle,
              alpha: { from: 1, to: 0 },
              scale: { from: 2, to: 3.5 },
              duration: 900,
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
          const endText = this.add
            .text(GAME_WIDTH / 2, s(70), 'THE END', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: `${s(18)}px`,
              color: '#f8f878',
              stroke: '#202020',
              strokeThickness: s(4),
              resolution: 3,
            })
            .setOrigin(0.5)
            .setAlpha(0)

          this.tweens.add({
            targets: endText,
            alpha: 1,
            duration: 900,
            onComplete: () => {
              this.time.delayedCall(700, () => {
                EventBus.emit(GAME_EVENTS.SHOW_END_LINKS)
              })
            },
          })
        })
      },
    )
  }
}
