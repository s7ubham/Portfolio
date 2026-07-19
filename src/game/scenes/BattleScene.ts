import Phaser from 'phaser'
import { EventBus, GAME_EVENTS } from '@game/EventBus'
import { GameRegistry } from '@game/GameRegistry'
import { BattleSystem } from '@game/systems/BattleSystem'
import { AudioManager } from '@game/systems/AudioManager'
import { TypewriterDialog } from '@game/ui/DialogBox'
import { HPBar } from '@game/ui/HPBar'
import {
  ATTACK_LABELS,
  GAME_HEIGHT,
  GAME_WIDTH,
  STARTER_NAMES,
  s,
  type AttackType,
} from '@game-types/game'

type BattlePhase = 'intro' | 'menu' | 'attack' | 'panel' | 'counter' | 'end'

const POST_ATTACK_DELAY_MS = 1600
const POST_HIT_DELAY_MS = 1800
const PRE_PANEL_DELAY_MS = 900

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
  private menuPanel?: Phaser.GameObjects.Rectangle
  private handlingPanelClose = false

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

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'battle-bg').setDisplaySize(GAME_WIDTH, GAME_HEIGHT)

    this.enemySprite = this.add.image(s(168), s(52), 'pikachu-front').setScale(1.85)
    this.playerSprite = this.add.image(s(56), s(108), `starter-${starterId}-back`).setScale(2)

    this.add.rectangle(s(62), s(28), s(112), s(34), 0xf8f0d8)
    this.add.rectangle(s(62), s(28), s(112), s(34)).setStrokeStyle(s(3), 0x585868)

    this.add.text(s(16), s(16), 'SUBHAM', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: `${s(7)}px`,
      color: '#202020',
      resolution: 3,
    })

    this.add.text(s(16), s(28), 'PIKACHU', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: `${s(7)}px`,
      color: '#202020',
      resolution: 3,
    })

    this.add.text(s(100), s(28), 'Lv50', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: `${s(7)}px`,
      color: '#202020',
      resolution: 3,
    })

    this.add.rectangle(s(168), s(88), s(120), s(42), 0xf8f0d8)
    this.add.rectangle(s(168), s(88), s(120), s(42)).setStrokeStyle(s(3), 0x585868)

    this.add.text(s(116), s(72), playerName.toUpperCase().slice(0, 8), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: `${s(7)}px`,
      color: '#202020',
      resolution: 3,
    })

    this.add.text(s(116), s(84), STARTER_NAMES[starterId].toUpperCase().slice(0, 10), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: `${s(6)}px`,
      color: '#202020',
      resolution: 3,
    })

    this.hpBar = new HPBar(this, s(168), s(98), s(78), 'HP')
    this.hpBar.setHP(100, false)

    this.dialog = new TypewriterDialog(this, GAME_WIDTH / 2, s(138), s(228), s(40))

    this.createAttackMenu()
    this.hideAttackMenu()
    this.handlingPanelClose = false

    this.input.keyboard?.on('keydown', this.handleKeyDown, this)

    this.dialog.showMessage(
      'SUBHAM wants to battle! Pick an attack to showcase his skills!',
      () => this.showAttackMenu(),
    )
  }

  private createAttackMenu(): void {
    this.menuPanel = this.add.rectangle(s(168), s(132), s(130), s(50), 0xf8f8f8)
    this.menuPanel.setStrokeStyle(s(3), 0x483878)
    this.menuPanel.setDepth(5)

    const attacks = this.battleSystem.getAvailableAttacks()

    attacks.forEach((attack, index) => {
      const col = index % 2
      const row = Math.floor(index / 2)
      const text = this.add
        .text(s(118 + col * 58), s(118 + row * 14), ATTACK_LABELS[attack], {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: `${s(7)}px`,
          color: '#202020',
          resolution: 3,
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

    this.menuCursor = this.add.image(s(110), s(122), 'cursor').setScale(2).setDepth(6)
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
    this.handlingPanelClose = false
    this.input.enabled = true
    if (this.input.keyboard) this.input.keyboard.enabled = true
    this.game.canvas.style.pointerEvents = 'auto'
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
    this.menuCursor.x = s(110 + col * 58)
    this.menuCursor.y = s(122 + row * 14)
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
      this.playAttackAnimation(() => {
        this.time.delayedCall(PRE_PANEL_DELAY_MS, () => this.openProfilePanel(attackType))
      })
    })
  }

  private playAttackAnimation(onComplete: () => void): void {
    const flash = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'flash').setAlpha(0).setScale(3)

    this.tweens.add({
      targets: this.playerSprite,
      x: s(72),
      duration: 140,
      yoyo: true,
    })

    this.tweens.add({
      targets: flash,
      alpha: 0.6,
      duration: 120,
      yoyo: true,
      onComplete: () => {
        flash.destroy()
        onComplete()
      },
    })
  }

  private openProfilePanel(attackType: AttackType): void {
    // Prevent duplicate opens (e.g. dialog callback firing more than once)
    if (this.phase === 'panel') return

    this.phase = 'panel'
    this.handlingPanelClose = false
    this.input.enabled = false
    if (this.input.keyboard) this.input.keyboard.enabled = false
    this.game.canvas.style.pointerEvents = 'none'
    this.scene.pause()

    EventBus.once(GAME_EVENTS.PANEL_CLOSED, () => this.onPanelClosed())
    EventBus.emit(GAME_EVENTS.SHOW_PROFILE_PANEL, { attackType })
  }

  private onPanelClosed(): void {
    if (this.handlingPanelClose) return
    if (this.phase !== 'panel' || !this.pendingAttack) return

    this.handlingPanelClose = true
    this.scene.resume()
    this.phase = 'counter'
    const attackType = this.pendingAttack
    this.audio.ensureBgm()

    this.time.delayedCall(POST_ATTACK_DELAY_MS, () => {
      this.dialog.showMessage("Subham's Pikachu used Counter!", () => {
        this.playCounterAnimation(() => {
          const newHP = this.battleSystem.applyAttack(attackType)
          this.hpBar.setHP(newHP)
          this.audio.playHit()
          this.cameras.main.flash(220, 255, 64, 64)

          this.time.delayedCall(POST_HIT_DELAY_MS, () => {
            if (this.battleSystem.isDefeated()) {
              this.phase = 'end'
              this.dialog.showMessage('Your Pokémon fainted...', () => {
                this.time.delayedCall(900, () => this.scene.start('DefeatScene'))
              })
            } else {
              this.dialog.showMessage('The attack was super effective!', () => {
                this.time.delayedCall(700, () => {
                  this.pendingAttack = null
                  this.showAttackMenu()
                })
              })
            }
          })
        })
      })
    })
  }

  private playCounterAnimation(onComplete: () => void): void {
    const flash = this.add.image(s(168), s(52), 'flash').setAlpha(0).setScale(2)

    this.tweens.add({
      targets: this.enemySprite,
      x: s(148),
      duration: 140,
      yoyo: true,
    })

    this.tweens.add({
      targets: flash,
      alpha: 0.8,
      duration: 120,
      yoyo: true,
      onComplete: () => {
        flash.destroy()
        onComplete()
      },
    })
  }

  shutdown(): void {
    EventBus.off(GAME_EVENTS.PANEL_CLOSED)
    this.input.keyboard?.off('keydown', this.handleKeyDown, this)
  }
}
