import Phaser from 'phaser'
import { EventBus, GAME_EVENTS, type NameConfirmedEvent } from '@game/EventBus'
import { GameRegistry } from '@game/GameRegistry'
import { AudioManager } from '@game/systems/AudioManager'
import { GAME_HEIGHT, GAME_WIDTH, s } from '@game-types/game'

export class NameEntryScene extends Phaser.Scene {
  private audio!: AudioManager
  private nameListener?: (payload: NameConfirmedEvent) => void

  constructor() {
    super('NameEntryScene')
  }

  create(): void {
    GameRegistry.reset()
    this.audio = new AudioManager(this)

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'battle-bg').setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.35)

    this.add
      .text(GAME_WIDTH / 2, s(72), 'ENTER YOUR NAME', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: `${s(10)}px`,
        color: '#f8f878',
        stroke: '#202020',
        strokeThickness: s(4),
        resolution: 3,
      })
      .setOrigin(0.5)

    this.nameListener = (payload) => {
      this.audio.unlock()
      this.audio.ensureBgm()
      this.audio.playSelect()
      GameRegistry.set({ playerName: payload.playerName })
      this.scene.start('StarterSelectScene')
    }

    EventBus.on(GAME_EVENTS.NAME_CONFIRMED, this.nameListener)
    EventBus.emit(GAME_EVENTS.SHOW_NAME_ENTRY)
  }

  shutdown(): void {
    if (this.nameListener) {
      EventBus.off(GAME_EVENTS.NAME_CONFIRMED, this.nameListener)
    }
  }
}
