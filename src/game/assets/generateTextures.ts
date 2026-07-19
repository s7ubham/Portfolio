import Phaser from 'phaser'
import type { StarterId } from '@game-types/game'

const STARTER_COLORS: Record<StarterId, number> = {
  charmander: 0xf87830,
  squirtle: 0x6890f0,
  bulbasaur: 0x78c850,
}

const SPRITE_FILES = [
  'battle-bg',
  'trainer-enemy',
  'pikachu-front',
  'pikachu-back',
  'pokeball',
  'cursor',
  'flash',
  'sparkle',
  'platform',
  'dialog-frame',
  ...(['charmander', 'squirtle', 'bulbasaur'] as StarterId[]).flatMap((id) => [
    `starter-${id}-front`,
    `starter-${id}-back`,
  ]),
]

export function generateGameTextures(scene: Phaser.Scene): void {
  generateBattleBackground(scene)
  generateStarterSprites(scene)
  generatePikachuSprite(scene)
  generateTrainerSprite(scene)
  generateUiTextures(scene)
  generateEffectTextures(scene)
}

function generateBattleBackground(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 })
  const w = 480
  const h = 320

  for (let y = 0; y < h; y++) {
    const band = Math.floor(y / 6) % 2 === 0
    g.fillStyle(band ? 0xd8f0e0 : 0xf8fcf8, 1)
    g.fillRect(0, y, w, 1)
  }

  g.fillStyle(0x58b060, 1)
  g.fillEllipse(336, 136, 216, 64)
  g.fillStyle(0x78c878, 1)
  g.fillEllipse(336, 132, 192, 48)
  g.fillStyle(0x58b060, 1)
  g.fillEllipse(128, 248, 248, 72)
  g.fillStyle(0x78c878, 1)
  g.fillEllipse(128, 244, 216, 52)

  g.generateTexture('battle-bg', w, h)
  g.destroy()
}

function generateStarterSprites(scene: Phaser.Scene): void {
  ;(['charmander', 'squirtle', 'bulbasaur'] as StarterId[]).forEach((id) => {
    const color = STARTER_COLORS[id]
    createPokemonSprite(scene, `starter-${id}-back`, color, true)
    createPokemonSprite(scene, `starter-${id}-front`, color, false)
  })
}

function createPokemonSprite(
  scene: Phaser.Scene,
  key: string,
  color: number,
  isBack: boolean,
): void {
  const g = scene.make.graphics({ x: 0, y: 0 })
  const bodyColor = color
  const accent = Phaser.Display.Color.ValueToColor(color).darken(20).color

  g.fillStyle(accent, 1)
  g.fillEllipse(32, isBack ? 40 : 36, 28, 24)
  g.fillStyle(bodyColor, 1)
  g.fillEllipse(32, isBack ? 38 : 34, 24, 20)
  g.fillStyle(0xf8f8f8, 1)
  g.fillCircle(isBack ? 24 : 40, isBack ? 30 : 26, 4)
  g.fillStyle(0x202020, 1)
  g.fillCircle(isBack ? 25 : 41, isBack ? 30 : 26, 2)

  if (!isBack) {
    g.fillStyle(accent, 1)
    g.fillTriangle(48, 34, 56, 30, 56, 38)
  }

  g.generateTexture(key, 64, 64)
  g.destroy()
}

function generatePikachuSprite(scene: Phaser.Scene): void {
  createPokemonSprite(scene, 'pikachu-front', 0xf8d030, false)
  createPokemonSprite(scene, 'pikachu-back', 0xf8d030, true)
}

function generateTrainerSprite(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 })
  g.fillStyle(0x3050a8, 1)
  g.fillRect(24, 28, 16, 24)
  g.fillStyle(0xf8c8a8, 1)
  g.fillCircle(32, 22, 10)
  g.fillStyle(0x383838, 1)
  g.fillRect(20, 14, 24, 8)
  g.generateTexture('trainer-enemy', 64, 64)
  g.destroy()
}

function generateUiTextures(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 })
  g.fillStyle(0xf8f8f8, 1)
  g.fillRect(0, 0, 220, 40)
  g.lineStyle(2, 0x303030, 1)
  g.strokeRect(0, 0, 220, 40)
  g.generateTexture('dialog-box', 220, 40)
  g.clear()

  g.fillStyle(0xf85858, 1)
  g.fillCircle(8, 8, 7)
  g.fillStyle(0xffffff, 1)
  g.fillRect(4, 6, 8, 2)
  g.fillRect(6, 4, 2, 8)
  g.generateTexture('pokeball', 16, 16)
  g.clear()

  g.fillStyle(0xf8f8f8, 1)
  g.fillTriangle(0, 0, 8, 4, 0, 8)
  g.generateTexture('cursor', 8, 8)
  g.destroy()
}

function generateEffectTextures(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 })
  g.fillStyle(0xffffff, 0.8)
  g.fillCircle(16, 16, 14)
  g.generateTexture('flash', 32, 32)
  g.clear()

  for (let i = 0; i < 4; i++) {
    g.fillStyle(0xf8f878, 1)
    g.fillRect(8 + i * 4, 8, 2, 16)
    g.fillRect(8, 8 + i * 4, 16, 2)
  }
  g.generateTexture('sparkle', 32, 32)
  g.destroy()
}

export function loadExternalAssets(scene: Phaser.Scene): void {
  for (const key of SPRITE_FILES) {
    scene.load.image(`${key}-file`, `/assets/sprites/${key}.png`)
  }

  scene.load.audio('bgm-battle', ['/assets/audio/bgm-battle.wav'])
  scene.load.audio('sfx-select', ['/assets/audio/sfx-select.wav'])
  scene.load.audio('sfx-attack', ['/assets/audio/sfx-attack.wav'])
  scene.load.audio('sfx-hit', ['/assets/audio/sfx-hit.wav'])
  scene.load.audio('sfx-capture', ['/assets/audio/sfx-capture.wav'])
}

export function applyExternalAssetsIfLoaded(scene: Phaser.Scene): void {
  for (const key of SPRITE_FILES) {
    const fileKey = `${key}-file`
    if (scene.textures.exists(fileKey)) {
      if (scene.textures.exists(key)) {
        scene.textures.remove(key)
      }
      scene.textures.addImage(
        key,
        scene.textures.get(fileKey).getSourceImage() as HTMLImageElement,
      )
    }
  }
}
