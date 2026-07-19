import Phaser from 'phaser'
import { EventBus, GAME_EVENTS } from '@game/EventBus'
import { GAME_HEIGHT, GAME_WIDTH, s } from '@game-types/game'

export class WelcomeScene extends Phaser.Scene {
  private continueListener?: () => void

  constructor() {
    super('WelcomeScene')
  }

  create(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'battle-bg').setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.4)

    this.add
      .text(GAME_WIDTH / 2, s(70), "SUBHAM'S", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: `${s(10)}px`,
        color: '#f8f8f8',
        stroke: '#202020',
        strokeThickness: s(3),
        resolution: 3,
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, s(90), 'PORTFOLIO', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: `${s(14)}px`,
        color: '#f8f878',
        stroke: '#202020',
        strokeThickness: s(4),
        resolution: 3,
      })
      .setOrigin(0.5)

    this.continueListener = () => {
      this.scene.start('NameEntryScene')
    }

    EventBus.on(GAME_EVENTS.WELCOME_CONTINUE, this.continueListener)
    EventBus.emit(GAME_EVENTS.SHOW_WELCOME)
  }

  shutdown(): void {
    if (this.continueListener) {
      EventBus.off(GAME_EVENTS.WELCOME_CONTINUE, this.continueListener)
    }
  }
}
