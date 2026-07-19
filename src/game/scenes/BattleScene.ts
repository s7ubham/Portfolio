import Phaser from 'phaser'
import { EventBus, GAME_EVENTS } from '@game/EventBus'
import { GameRegistry } from '@game/GameRegistry'
import { BattleSystem } from '@game/systems/BattleSystem'
import { AudioManager } from '@game/systems/AudioManager'
import { TypewriterDialog } from '@game/ui/DialogBox'
import { HPBar } from '@game/ui/HPBar'
import {
  ATTACK_LABELS,
  STARTER_NAMES,
  type AttackType,
} from '@game-types/game'

type BattlePhase = 'intro' | 'menu' | 'attack' | 'panel' | 'counter' | 'end'

export class BattleScene extends Phaser.Scene {
  private battleSystem = new BattleSystem()
  private dialog!: TypewriterDialog
  private hpBar!: HPBar
  private audio!: AudioManager
  private phase: BattlePhase = 'intro'
  private menuItems: Phaser.GameObjects.Text[] = []
  private menuCursor!: Phaser.GameObjects.Image
  private selectedMenuIndex = 0
  private playerSprite!: Phaser.GameObjects.Image
  private enemySprite!: Phaser.GameObjects.Image
  private pendingAttack: AttackType | null = null
  private panelListener?: (...args: unknown[]) => void
  private menuPanel?: Phaser.GameObjects.Rectangle

  constructor() {
    super('BattleScene')
  }

  create(): void {
    this.battleSystem.reset()
    this.phase = 'intro'
    this.pendingAttack = null
    this.selectedMenuIndex = 0
    this.audio = new AudioManager(this)
    this.audio.unlock()
    this.audio.ensureBgm()

    const { starterId, playerName } = GameRegistry.get()

    this.add.image(120, 80, 'battle-bg').setDisplaySize(240, 160)

    // Enemy Pokémon on upper-right grass oval
    this.enemySprite = this.add.image(168, 52, 'pikachu-front').setScale(1.85)

    // Player Pokémon on lower-left grass oval
    this.playerSprite = this.add
      .image(56, 108, `starter-${starterId}-back`)
      .setScale(2)

    // FireRed-style beige enemy status box (top-left)
    this.add.rectangle(62, 28, 112, 34, 0xf8f0d8)
    this.add.rectangle(62, 28, 112, 34).setStrokeStyle(3, 0x585868)

    this.add
      .text(16, 16, 'SUBHAM', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#202020',
      })

    this.add
      .text(16, 26, 'PIKACHU', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#202020',
      })

    this.add
      .text(100, 26, 'Lv50', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#202020',
      })

    // Player status box (mid-right)
    this.add.rectangle(168, 88, 120, 42, 0xf8f0d8)
    this.add.rectangle(168, 88, 120, 42).setStrokeStyle(3, 0x585868)

    this.add
      .text(116, 72, playerName.toUpperCase().slice(0, 8), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#202020',
      })

    this.add
      .text(116, 82, STARTER_NAMES[starterId].toUpperCase().slice(0, 10), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '5px',
        color: '#202020',
      })

    this.hpBar = new HPBar(this, 168, 98, 78, 'HP')
    this.hpBar.setHP(100, false)

    this.dialog = new TypewriterDialog(this, 120, 138, 228, 40)

    this.createAttackMenu()
    this.hideAttackMenu()

    this.panelListener = () => this.onPanelClosed()
    EventBus.on(GAME_EVENTS.PANEL_CLOSED, this.panelListener)

    this.input.keyboard?.on('keydown', this.handleKeyDown, this)

    this.dialog.showMessage(
      'SUBHAM wants to battle! Pick an attack to showcase his skills!',
      () => this.showAttackMenu(),
    )
  }

  private createAttackMenu(): void {
    this.menuPanel = this.add.rectangle(168, 132, 130, 50, 0xf8f8f8)
    this.menuPanel.setStrokeStyle(3, 0x483878)
    this.menuPanel.setDepth(5)

    const attacks = this.battleSystem.getAvailableAttacks()

    attacks.forEach((attack, index) => {
      const col = index % 2
      const row = Math.floor(index / 2)
      const text = this.add
        .text(118 + col * 58, 118 + row * 14, ATTACK_LABELS[attack], {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '6px',
          color: '#202020',
        })
        .setDepth(6)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          if (this.phase !== 'menu') return
          this.selectedMenuIndex = index
          this.updateMenuCursor()
          this.selectAttack()
        })

      this.menuItems.push(text)
    })

    this.menuCursor = this.add.image(110, 122, 'cursor').setDepth(6)
  }

  private refreshAttackMenu(): void {
    this.menuItems.forEach((item) => item.destroy())
    this.menuItems = []
    this.menuCursor?.destroy()
    this.menuPanel?.destroy()

    this.createAttackMenu()
    this.selectedMenuIndex = 0
    this.updateMenuCursor()
  }

  private showAttackMenu(): void {
    this.phase = 'menu'
    this.refreshAttackMenu()
    this.menuItems.forEach((item) => item.setVisible(true))
    this.menuCursor.setVisible(true)
    this.menuPanel?.setVisible(true)
    this.dialog.showMessage('What will you do?')
  }

  private hideAttackMenu(): void {
    this.menuItems.forEach((item) => item.setVisible(false))
    this.menuCursor?.setVisible(false)
    this.menuPanel?.setVisible(false)
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.phase !== 'menu') return

    const attacks = this.battleSystem.getAvailableAttacks()

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      this.selectedMenuIndex = (this.selectedMenuIndex - 1 + attacks.length) % attacks.length
      this.updateMenuCursor()
      this.audio.playSelect()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      this.selectedMenuIndex = (this.selectedMenuIndex + 1) % attacks.length
      this.updateMenuCursor()
      this.audio.playSelect()
    } else if (event.key === 'Enter') {
      this.selectAttack()
    }
  }

  private updateMenuCursor(): void {
    const col = this.selectedMenuIndex % 2
    const row = Math.floor(this.selectedMenuIndex / 2)
    this.menuCursor.x = 110 + col * 58
    this.menuCursor.y = 122 + row * 14
  }

  private selectAttack(): void {
    if (this.phase !== 'menu') return

    const attacks = this.battleSystem.getAvailableAttacks()
    const attackType = attacks[this.selectedMenuIndex]
    if (!attackType) return

    this.phase = 'attack'
    this.hideAttackMenu()
    this.pendingAttack = attackType
    this.audio.playAttack()

    const label = ATTACK_LABELS[attackType]
    this.dialog.showMessage(`${GameRegistry.getPlayerName()} used ${label}!`, () => {
      this.playAttackAnimation(() => this.openProfilePanel(attackType))
    })
  }

  private playAttackAnimation(onComplete: () => void): void {
    const flash = this.add.image(120, 80, 'flash').setAlpha(0).setScale(2)

    this.tweens.add({
      targets: this.playerSprite,
      x: 72,
      duration: 120,
      yoyo: true,
    })

    this.tweens.add({
      targets: flash,
      alpha: 0.6,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        flash.destroy()
        onComplete()
      },
    })
  }

  private openProfilePanel(attackType: AttackType): void {
    this.phase = 'panel'
    this.scene.pause()
    EventBus.emit(GAME_EVENTS.SHOW_PROFILE_PANEL, { attackType })
  }

  private onPanelClosed(): void {
    if (this.phase !== 'panel' || !this.pendingAttack) return

    this.scene.resume()
    this.phase = 'counter'
    const attackType = this.pendingAttack
    this.audio.ensureBgm()

    this.dialog.showMessage("Subham's Pikachu used Counter!", () => {
      this.playCounterAnimation(() => {
        const newHP = this.battleSystem.applyAttack(attackType)
        this.hpBar.setHP(newHP)
        this.audio.playHit()

        this.cameras.main.flash(200, 255, 64, 64)

        if (this.battleSystem.isDefeated()) {
          this.time.delayedCall(800, () => {
            this.phase = 'end'
            this.scene.start('DefeatScene')
          })
        } else {
          this.dialog.showMessage('The attack was super effective!', () => {
            this.pendingAttack = null
            this.showAttackMenu()
          })
        }
      })
    })
  }

  private playCounterAnimation(onComplete: () => void): void {
    const flash = this.add.image(168, 52, 'flash').setAlpha(0)

    this.tweens.add({
      targets: this.enemySprite,
      x: 148,
      duration: 120,
      yoyo: true,
    })

    this.tweens.add({
      targets: flash,
      alpha: 0.8,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        flash.destroy()
        onComplete()
      },
    })
  }

  shutdown(): void {
    if (this.panelListener) {
      EventBus.off(GAME_EVENTS.PANEL_CLOSED, this.panelListener)
    }
    this.input.keyboard?.off('keydown', this.handleKeyDown, this)
  }
}
