import Phaser from 'phaser'
import {
  applyExternalAssetsIfLoaded,
  generateGameTextures,
  loadExternalAssets,
} from '@game/assets/generateTextures'

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
    const width = 180
    const height = 12
    const x = (240 - width) / 2
    const y = 80

    const border = this.add.rectangle(x + width / 2, y + height / 2, width, height)
    border.setStrokeStyle(2, 0xf8f8f8)

    const bar = this.add.rectangle(x + 2, y + 2, 0, height - 4, 0x58d058).setOrigin(0, 0)

    this.load.on('progress', (value: number) => {
      bar.width = (width - 4) * value
    })

    this.add
      .text(120, 56, 'LOADING...', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#f8f8f8',
      })
      .setOrigin(0.5)
  }
}
