import Phaser from 'phaser'
import { BootScene } from '@game/scenes/BootScene'
import { NameEntryScene } from '@game/scenes/NameEntryScene'
import { StarterSelectScene } from '@game/scenes/StarterSelectScene'
import { BattleScene } from '@game/scenes/BattleScene'
import { DefeatScene } from '@game/scenes/DefeatScene'
import { GAME_HEIGHT, GAME_WIDTH } from '@game-types/game'

let gameInstance: Phaser.Game | null = null

export function createGame(parent: HTMLElement): Phaser.Game {
  if (gameInstance) {
    gameInstance.destroy(true)
    gameInstance = null
  }

  gameInstance = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#000000',
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      zoom: 1,
    },
    scene: [BootScene, NameEntryScene, StarterSelectScene, BattleScene, DefeatScene],
    audio: {
      disableWebAudio: false,
    },
  })

  return gameInstance
}

export function destroyGame(): void {
  if (gameInstance) {
    gameInstance.destroy(true)
    gameInstance = null
  }
}

export function getGameInstance(): Phaser.Game | null {
  return gameInstance
}
