import Phaser from 'phaser'
import { GameRegistry } from '@game/GameRegistry'
import { AudioManager } from '@game/systems/AudioManager'
import { STARTER_NAMES, type StarterId } from '@game-types/game'

const STARTERS: StarterId[] = ['charmander', 'squirtle', 'bulbasaur']

export class StarterSelectScene extends Phaser.Scene {
  private cursor!: Phaser.GameObjects.Image
  private menuTexts: Phaser.GameObjects.Text[] = []
  private starterSprites: Phaser.GameObjects.Image[] = []
  private selectedIndex = 0
  private confirmed = false
  private audio!: AudioManager

  constructor() {
    super('StarterSelectScene')
  }

  create(): void {
    this.audio = new AudioManager(this)
    this.selectedIndex = 0
    this.confirmed = false
    this.menuTexts = []
    this.starterSprites = []

    this.audio.unlock()
    this.audio.ensureBgm()

    this.add.image(120, 80, 'battle-bg').setDisplaySize(240, 160)

    this.add.rectangle(120, 42, 220, 52, 0x101820, 0.45)

    STARTERS.forEach((id, index) => {
      const x = 50 + index * 70
      const sprite = this.add.image(x, 46, `starter-${id}-front`).setScale(1.7)
      sprite.setInteractive({ useHandCursor: true })
      sprite.on('pointerdown', () => {
        this.selectedIndex = index
        this.updateMenu()
        this.confirmSelection()
      })
      this.starterSprites.push(sprite)
    })

    this.add.rectangle(120, 122, 220, 56, 0x101820, 0.9)
    this.add.rectangle(120, 122, 220, 56).setStrokeStyle(2, 0xf8f878)

    this.add
      .text(120, 100, 'CHOOSE YOUR POKEMON', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#f8f878',
      })
      .setOrigin(0.5)

    STARTERS.forEach((id, index) => {
      const text = this.add
        .text(28, 110 + index * 12, STARTER_NAMES[id], {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '7px',
          color: index === 0 ? '#f8f878' : '#f8f8f8',
          stroke: '#101820',
          strokeThickness: 2,
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.selectedIndex = index
          this.updateMenu()
          this.confirmSelection()
        })

      this.menuTexts.push(text)
    })

    this.cursor = this.add.image(16, 114, 'cursor')

    this.input.keyboard?.on('keydown', this.handleKeyDown, this)
    this.updateMenu()
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.confirmed) return
    this.audio.unlock()

    if (event.key === 'ArrowUp') {
      this.selectedIndex = (this.selectedIndex - 1 + STARTERS.length) % STARTERS.length
      this.updateMenu()
      this.audio.playSelect()
    } else if (event.key === 'ArrowDown') {
      this.selectedIndex = (this.selectedIndex + 1) % STARTERS.length
      this.updateMenu()
      this.audio.playSelect()
    } else if (event.key === 'Enter') {
      this.confirmSelection()
    }
  }

  private updateMenu(): void {
    this.menuTexts.forEach((text, index) => {
      text.setColor(index === this.selectedIndex ? '#f8f878' : '#f8f8f8')
    })
    this.cursor.y = 110 + this.selectedIndex * 12 + 4

    this.starterSprites.forEach((sprite, index) => {
      sprite.setAlpha(index === this.selectedIndex ? 1 : 0.55)
      sprite.setScale(index === this.selectedIndex ? 2 : 1.6)
      sprite.y = index === this.selectedIndex ? 42 : 46
    })
  }

  private confirmSelection(): void {
    if (this.confirmed) return

    const starterId = STARTERS[this.selectedIndex]
    this.confirmed = true
    GameRegistry.set({ starterId })
    this.audio.playSelect()

    this.time.delayedCall(450, () => this.scene.start('BattleScene'))
  }

  shutdown(): void {
    this.input.keyboard?.off('keydown', this.handleKeyDown, this)
  }
}
