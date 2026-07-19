import Phaser from 'phaser'
import { GameRegistry } from '@game/GameRegistry'
import { AudioManager } from '@game/systems/AudioManager'
import { GAME_HEIGHT, GAME_WIDTH, STARTER_NAMES, s, type StarterId } from '@game-types/game'

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

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'battle-bg').setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
    this.add.rectangle(GAME_WIDTH / 2, s(42), s(220), s(52), 0x101820, 0.45)

    STARTERS.forEach((id, index) => {
      const x = s(50 + index * 70)
      const sprite = this.add.image(x, s(46), `starter-${id}-front`).setScale(1.7)
      sprite.setInteractive({ useHandCursor: true })
      sprite.on('pointerdown', () => {
        this.selectedIndex = index
        this.updateMenu()
        this.confirmSelection()
      })
      this.starterSprites.push(sprite)
    })

    this.add.rectangle(GAME_WIDTH / 2, s(122), s(220), s(56), 0x101820, 0.9)
    this.add.rectangle(GAME_WIDTH / 2, s(122), s(220), s(56)).setStrokeStyle(2, 0xf8f878)

    this.add
      .text(GAME_WIDTH / 2, s(100), 'CHOOSE YOUR POKEMON', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: `${s(7)}px`,
        color: '#f8f878',
        resolution: 3,
      })
      .setOrigin(0.5)

    STARTERS.forEach((id, index) => {
      const text = this.add
        .text(s(28), s(110 + index * 12), STARTER_NAMES[id], {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: `${s(8)}px`,
          color: index === 0 ? '#f8f878' : '#f8f8f8',
          stroke: '#101820',
          strokeThickness: 2,
          resolution: 3,
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.selectedIndex = index
          this.updateMenu()
          this.confirmSelection()
        })

      this.menuTexts.push(text)
    })

    this.cursor = this.add.image(s(16), s(114), 'cursor').setScale(2)

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
    this.cursor.y = s(110 + this.selectedIndex * 12 + 4)

    this.starterSprites.forEach((sprite, index) => {
      sprite.setAlpha(index === this.selectedIndex ? 1 : 0.55)
      sprite.setScale(index === this.selectedIndex ? 2 : 1.6)
      sprite.y = index === this.selectedIndex ? s(42) : s(46)
    })
  }

  private confirmSelection(): void {
    if (this.confirmed) return

    const starterId = STARTERS[this.selectedIndex]
    this.confirmed = true
    GameRegistry.set({ starterId })
    this.audio.playSelect()

    this.add
      .text(GAME_WIDTH / 2, s(78), `Go, ${STARTER_NAMES[starterId]}!`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: `${s(8)}px`,
        color: '#f8f878',
        stroke: '#101820',
        strokeThickness: 3,
        resolution: 3,
      })
      .setOrigin(0.5)

    // Short beat after choosing a starter before battle begins
    this.time.delayedCall(1800, () => this.scene.start('BattleScene'))
  }

  shutdown(): void {
    this.input.keyboard?.off('keydown', this.handleKeyDown, this)
  }
}
