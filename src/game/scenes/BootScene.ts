import Phaser from 'phaser'
import {
  applyExternalAssetsIfLoaded,
  generateGameTextures,
  loadExternalAssets,
} from '@game/assets/generateTextures'
import { GAME_HEIGHT, GAME_WIDTH, s } from '@game-types/game'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload(): void {
    this.createLoadingBar()
    loadExternalAssets(this)
  }

  create(): void {
    generateGameTextures(this)
    applyExternalAssetsIfLoaded(this)
    this.scene.start('NameEntryScene')
  }

  private createLoadingBar(): void {
    const width = s(180)
    const height = s(12)
    const x = (GAME_WIDTH - width) / 2
    const y = GAME_HEIGHT / 2

    const border = this.add.rectangle(x + width / 2, y + height / 2, width, height)
    border.setStrokeStyle(2, 0xf8f8f8)

    const bar = this.add.rectangle(x + 2, y + 2, 0, height - 4, 0x58d058).setOrigin(0, 0)

    this.load.on('progress', (value: number) => {
      bar.width = (width - 4) * value
    })

    this.add
      .text(GAME_WIDTH / 2, y - s(24), 'LOADING...', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: `${s(8)}px`,
        color: '#f8f8f8',
        resolution: 2,
      })
      .setOrigin(0.5)
  }
}
