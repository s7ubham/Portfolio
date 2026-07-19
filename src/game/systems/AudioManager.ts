import Phaser from 'phaser'

let audioUnlocked = false
let sharedBgm: Phaser.Sound.BaseSound | null = null

export class AudioManager {
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  unlock(): void {
    if (this.scene.sound.locked) {
      this.scene.sound.unlock()
    }

    audioUnlocked = true
    this.ensureBgm()
  }

  ensureBgm(): void {
    if (!audioUnlocked) return
    if (!this.scene.cache.audio.exists('bgm-battle')) return

    if (sharedBgm && sharedBgm.isPlaying) return

    if (sharedBgm) {
      sharedBgm.destroy()
      sharedBgm = null
    }

    sharedBgm = this.scene.sound.add('bgm-battle', {
      loop: true,
      volume: 0.45,
    })

    try {
      sharedBgm.play()
    } catch {
      // Browser may still block until another gesture
    }
  }

  playSelect(): void {
    this.playSfx('sfx-select', 0.45)
  }

  playAttack(): void {
    this.playSfx('sfx-attack', 0.55)
  }

  playHit(): void {
    this.playSfx('sfx-hit', 0.55)
  }

  playCapture(): void {
    this.playSfx('sfx-capture', 0.65)
  }

  stopBgm(): void {
    if (sharedBgm) {
      sharedBgm.stop()
      sharedBgm.destroy()
      sharedBgm = null
    }
  }

  private playSfx(key: string, volume: number): void {
    if (!audioUnlocked || !this.scene.cache.audio.exists(key)) return
    this.scene.sound.play(key, { volume })
  }
}

export function resetAudioState(): void {
  if (sharedBgm) {
    sharedBgm.stop()
    sharedBgm.destroy()
    sharedBgm = null
  }
  audioUnlocked = false
}
