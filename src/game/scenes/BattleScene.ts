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

    const { starterId, playerName } = GameRegistry.get()

    this.add.image(120, 80, 'battle-bg').setDisplaySize(240, 160)

    this.add.image(168, 58, 'platform').setScale(0.9).setAlpha(0.85)
    this.add.image(56, 114, 'platform').setScale(0.85).setAlpha(0.85)

    this.add.image(180, 36, 'trainer-enemy').setScale(1.3)
    this.enemySprite = this.add.image(168, 52, 'pikachu-front').setScale(1.5)

    this.playerSprite = this.add
      .image(56, 108, `starter-${starterId}-back`)
      .setScale(1.6)

    this.add
      .text(148, 18, 'SUBHAM', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#f8f8f8',
      })
      .setOrigin(0.5)

    this.add
      .text(148, 26, 'PIKACHU', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '5px',
        color: '#f8f8f8',
      })
      .setOrigin(0.5)

    this.add
      .text(56, 82, playerName.toUpperCase(), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#f8f8f8',
      })
      .setOrigin(0.5)

    this.add
      .text(56, 90, STARTER_NAMES[starterId].toUpperCase(), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '5px',
        color: '#f8f8f8',
      })
      .setOrigin(0.5)

    this.hpBar = new HPBar(this, 56, 98, 70, 'HP')
    this.hpBar.setHP(100, false)

    this.dialog = new TypewriterDialog(this, 120, 132, 220, 36)

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
    const attacks = this.battleSystem.getAvailableAttacks()

    attacks.forEach((attack, index) => {
      const text = this.add
        .text(130, 108 + index * 12, ATTACK_LABELS[attack], {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '7px',
          color: '#f8f8f8',
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          if (this.phase !== 'menu') return
          this.selectedMenuIndex = index
          this.updateMenuCursor()
          this.selectAttack()
        })

      this.menuItems.push(text)
    })

    this.menuCursor = this.add.image(118, 112, 'cursor')
  }

  private refreshAttackMenu(): void {
    this.menuItems.forEach((item) => item.destroy())
    this.menuItems = []
    this.menuCursor?.destroy()

    const attacks = this.battleSystem.getAvailableAttacks()
    attacks.forEach((attack, index) => {
      const text = this.add
        .text(130, 108 + index * 12, ATTACK_LABELS[attack], {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '7px',
          color: '#f8f8f8',
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          if (this.phase !== 'menu') return
          this.selectedMenuIndex = index
          this.updateMenuCursor()
          this.selectAttack()
        })

      this.menuItems.push(text)
    })

    this.menuCursor = this.add.image(118, 112, 'cursor')
    this.selectedMenuIndex = 0
    this.updateMenuCursor()
  }

  private showAttackMenu(): void {
    this.phase = 'menu'
    this.refreshAttackMenu()
    this.menuItems.forEach((item) => item.setVisible(true))
    this.menuCursor.setVisible(true)
    this.dialog.showMessage('What will you do?')
  }

  private hideAttackMenu(): void {
    this.menuItems.forEach((item) => item.setVisible(false))
    this.menuCursor?.setVisible(false)
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.phase !== 'menu') return

    const attacks = this.battleSystem.getAvailableAttacks()

    if (event.key === 'ArrowUp') {
      this.selectedMenuIndex = (this.selectedMenuIndex - 1 + attacks.length) % attacks.length
      this.updateMenuCursor()
      this.audio.playSelect()
    } else if (event.key === 'ArrowDown') {
      this.selectedMenuIndex = (this.selectedMenuIndex + 1) % attacks.length
      this.updateMenuCursor()
      this.audio.playSelect()
    } else if (event.key === 'Enter') {
      this.selectAttack()
    }
  }

  private updateMenuCursor(): void {
    this.menuCursor.y = 108 + this.selectedMenuIndex * 12 + 4
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
