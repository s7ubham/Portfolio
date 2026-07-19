import Phaser from 'phaser'
import { EventBus, GAME_EVENTS, type NameConfirmedEvent } from '@game/EventBus'
import { GameRegistry } from '@game/GameRegistry'
import { AudioManager } from '@game/systems/AudioManager'

export class NameEntryScene extends Phaser.Scene {
  private audio!: AudioManager
  private nameListener?: (payload: NameConfirmedEvent) => void

  constructor() {
    super('NameEntryScene')
  }

  create(): void {
    GameRegistry.reset()
    this.audio = new AudioManager(this)

    this.add.image(120, 80, 'battle-bg').setDisplaySize(240, 160)
    this.add.rectangle(120, 80, 240, 160, 0x000000, 0.35)

    this.add
      .text(120, 72, "ENTER YOUR NAME", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#f8f878',
        stroke: '#202020',
        strokeThickness: 3,
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
