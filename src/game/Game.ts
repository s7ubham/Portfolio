import Phaser from 'phaser'
import { BootScene } from '@game/scenes/BootScene'
import { WelcomeScene } from '@game/scenes/WelcomeScene'
import { NameEntryScene } from '@game/scenes/NameEntryScene'
import { StarterSelectScene } from '@game/scenes/StarterSelectScene'
import { BattleScene } from '@game/scenes/BattleScene'
import { DefeatScene } from '@game/scenes/DefeatScene'
import { GAME_HEIGHT, GAME_WIDTH } from '@game-types/game'
import { resetAudioState } from '@game/systems/AudioManager'

let gameInstance: Phaser.Game | null = null
let resizeHandler: (() => void) | null = null

export function createGame(parent: HTMLElement): Phaser.Game {
  if (gameInstance) {
    destroyGame()
  }

  gameInstance = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#d8f0e0',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent,
      expandParent: true,
      autoRound: true,
    },
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true,
    },
    scene: [BootScene, WelcomeScene, NameEntryScene, StarterSelectScene, BattleScene, DefeatScene],
    audio: {
      disableWebAudio: false,
    },
  })

  resizeHandler = () => {
    gameInstance?.scale.refresh()
  }
  window.addEventListener('resize', resizeHandler)
  window.addEventListener('orientationchange', resizeHandler)
  requestAnimationFrame(() => gameInstance?.scale.refresh())

  return gameInstance
}

export function destroyGame(): void {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    window.removeEventListener('orientationchange', resizeHandler)
    resizeHandler = null
  }

  resetAudioState()

  if (gameInstance) {
    gameInstance.destroy(true)
    gameInstance = null
  }
}

export function getGameInstance(): Phaser.Game | null {
  return gameInstance
}
