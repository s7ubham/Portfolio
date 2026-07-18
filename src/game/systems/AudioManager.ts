import Phaser from 'phaser'

export class AudioManager {
  private scene: Phaser.Scene
  private unlocked = false
  private bgm?: Phaser.Sound.BaseSound

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  unlock(): void {
    if (this.unlocked) return
    this.unlocked = true

    if (this.scene.cache.audio.exists('bgm-battle')) {
      this.bgm = this.scene.sound.add('bgm-battle', { loop: true, volume: 0.35 })
      this.bgm.play()
    }
  }

  playSelect(): void {
    this.playSfx('sfx-select', 0.4)
  }

  playAttack(): void {
    this.playSfx('sfx-attack', 0.5)
  }

  playHit(): void {
    this.playSfx('sfx-hit', 0.5)
  }

  playCapture(): void {
    this.playSfx('sfx-capture', 0.6)
  }

  stopBgm(): void {
    this.bgm?.stop()
  }

  private playSfx(key: string, volume: number): void {
    if (!this.unlocked || !this.scene.cache.audio.exists(key)) return
    this.scene.sound.play(key, { volume })
  }
}
