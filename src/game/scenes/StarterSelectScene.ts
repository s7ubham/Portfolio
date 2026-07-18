import Phaser from 'phaser'
import { GameRegistry } from '@game/GameRegistry'
import { TypewriterDialog } from '@game/ui/DialogBox'
import { AudioManager } from '@game/systems/AudioManager'
import { STARTER_NAMES, type StarterId } from '@game-types/game'

const STARTERS: StarterId[] = ['charmander', 'squirtle', 'bulbasaur']

export class StarterSelectScene extends Phaser.Scene {
  private dialog!: TypewriterDialog
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

    this.add.image(120, 80, 'battle-bg').setDisplaySize(240, 160)

    STARTERS.forEach((id, index) => {
      const x = 50 + index * 70
      const sprite = this.add.image(x, 72, `starter-${id}-front`).setScale(1.5)
      this.starterSprites.push(sprite)
    })

    this.dialog = new TypewriterDialog(this, 120, 120, 220, 36)
    this.dialog.showMessage('Choose your Pokémon!')

    STARTERS.forEach((id, index) => {
      const text = this.add
        .text(24, 108 + index * 12, STARTER_NAMES[id], {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '7px',
          color: index === 0 ? '#f8f878' : '#f8f8f8',
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.selectedIndex = index
          this.updateMenu()
          this.confirmSelection()
        })

      this.menuTexts.push(text)
    })

    this.cursor = this.add.image(14, 112, 'cursor')

    this.add
      .text(120, 148, 'ARROWS + ENTER OR TAP', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '5px',
        color: '#f8f8f8',
      })
      .setOrigin(0.5)

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
    this.cursor.y = 108 + this.selectedIndex * 12 + 4

    this.starterSprites.forEach((sprite, index) => {
      sprite.setAlpha(index === this.selectedIndex ? 1 : 0.45)
      sprite.setScale(index === this.selectedIndex ? 1.75 : 1.35)
      if (index === this.selectedIndex) {
        sprite.y = 68
      } else {
        sprite.y = 72
      }
    })
  }

  private confirmSelection(): void {
    if (this.confirmed) return

    const starterId = STARTERS[this.selectedIndex]
    this.confirmed = true
    GameRegistry.set({ starterId })
    this.audio.playSelect()

    this.dialog.showMessage(`You chose ${STARTER_NAMES[starterId]}!`, () => {
      this.time.delayedCall(800, () => this.scene.start('BattleScene'))
    })
  }

  shutdown(): void {
    this.input.keyboard?.off('keydown', this.handleKeyDown, this)
  }
}
