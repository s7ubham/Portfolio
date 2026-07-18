import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const assetsDir = path.join(root, 'public', 'assets')
const spritesDir = path.join(assetsDir, 'sprites')
const audioDir = path.join(assetsDir, 'audio')

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function writeWav(filepath, frequency, durationSec, volume = 0.25) {
  const sampleRate = 22050
  const numSamples = Math.floor(sampleRate * durationSec)
  const dataSize = numSamples * 2
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const envelope = Math.min(1, i / 200) * Math.max(0, 1 - (i - numSamples + 200) / 200)
    const sample = Math.sin(2 * Math.PI * frequency * t) * volume * envelope * 32767
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.floor(sample))), 44 + i * 2)
  }

  fs.writeFileSync(filepath, buffer)
}

function writeBattleBgm(filepath) {
  const sampleRate = 22050
  const durationSec = 8
  const numSamples = Math.floor(sampleRate * durationSec)
  const dataSize = numSamples * 2
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  const melody = [262, 294, 330, 349, 392, 440, 392, 349, 330, 294, 262, 220]

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const noteIndex = Math.floor(t * 1.5) % melody.length
    const freq = melody[noteIndex]
    const bass = Math.sin(2 * Math.PI * (freq / 2) * t) * 0.06
    const lead = Math.sin(2 * Math.PI * freq * t) * 0.1
    const sample = (bass + lead) * 32767
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.floor(sample))), 44 + i * 2)
  }

  fs.writeFileSync(filepath, buffer)
}

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function createCanvas(width, height) {
  const pixels = new Uint8Array(width * height * 4)
  return {
    width,
    height,
    set(x, y, rgba) {
      if (x < 0 || y < 0 || x >= width || y >= height) return
      const i = (y * width + x) * 4
      pixels[i] = rgba[0]
      pixels[i + 1] = rgba[1]
      pixels[i + 2] = rgba[2]
      pixels[i + 3] = rgba[3]
    },
    fillRect(x, y, w, h, rgba) {
      for (let py = y; py < y + h; py++) {
        for (let px = x; px < x + w; px++) this.set(px, py, rgba)
      }
    },
    toPng(filepath) {
      const raw = Buffer.alloc((width * 4 + 1) * height)
      for (let y = 0; y < height; y++) {
        raw[(width * 4 + 1) * y] = 0
        for (let x = 0; x < width; x++) {
          const offset = (y * width + x) * 4
          const rawOffset = (width * 4 + 1) * y + 1 + x * 4
          raw[rawOffset] = pixels[offset]
          raw[rawOffset + 1] = pixels[offset + 1]
          raw[rawOffset + 2] = pixels[offset + 2]
          raw[rawOffset + 3] = pixels[offset + 3]
        }
      }

      const ihdr = Buffer.alloc(13)
      ihdr.writeUInt32BE(width, 0)
      ihdr.writeUInt32BE(height, 4)
      ihdr[8] = 8
      ihdr[9] = 6
      ihdr[10] = 0
      ihdr[11] = 0
      ihdr[12] = 0

      const compressed = zlib.deflateSync(raw)
      const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      const png = Buffer.concat([
        signature,
        pngChunk('IHDR', ihdr),
        pngChunk('IDAT', compressed),
        pngChunk('IEND', Buffer.alloc(0)),
      ])
      fs.writeFileSync(filepath, png)
    },
  }
}

const C = {
  black: [32, 32, 32, 255],
  white: [248, 248, 248, 255],
  cream: [248, 224, 160, 255],
  orange: [248, 120, 48, 255],
  orangeDark: [200, 72, 32, 255],
  blue: [104, 144, 240, 255],
  blueDark: [56, 88, 176, 255],
  green: [120, 200, 80, 255],
  greenDark: [64, 136, 48, 255],
  yellow: [248, 208, 48, 255],
  yellowDark: [200, 152, 32, 255],
  red: [248, 88, 88, 255],
  pink: [248, 160, 160, 255],
  brown: [160, 112, 64, 255],
  skin: [248, 192, 152, 255],
  navy: [48, 80, 168, 255],
  flame1: [248, 200, 48, 255],
  flame2: [248, 120, 32, 255],
  flame3: [248, 64, 32, 255],
}

function drawEllipse(canvas, cx, cy, rx, ry, color) {
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      if ((x * x) / (rx * rx + 0.01) + (y * y) / (ry * ry + 0.01) <= 1) {
        canvas.set(cx + x, cy + y, color)
      }
    }
  }
}

function writeSprite(filepath, drawFn, width = 64, height = 64) {
  const canvas = createCanvas(width, height)
  drawFn(canvas)
  canvas.toPng(filepath)
}

function drawBattleBackground(filepath) {
  const c = createCanvas(240, 160)

  for (let y = 0; y < 70; y++) {
    const t = y / 70
    const r = Math.floor(120 + t * 40)
    const g = Math.floor(168 + t * 20)
    const b = Math.floor(216 - t * 40)
    c.fillRect(0, y, 240, 1, [r, g, b, 255])
  }

  c.fillRect(0, 70, 240, 8, [200, 184, 136, 255])
  for (let x = 0; x < 240; x += 16) {
    c.fillRect(x, 72, 8, 6, [120, 104, 80, 255])
  }

  for (let y = 78; y < 160; y++) {
    const t = (y - 78) / 82
    const r = Math.floor(72 + t * 16)
    const g = Math.floor(152 + t * 24)
    const b = Math.floor(72 + t * 8)
    c.fillRect(0, y, 240, 1, [r, g, b, 255])
  }

  drawEllipse(c, 120, 118, 90, 18, [96, 168, 80, 255])
  drawEllipse(c, 120, 120, 78, 12, [72, 136, 64, 255])

  for (let x = 0; x < 240; x += 12) {
    c.set(x, 132 + (x % 24 === 0 ? 0 : 1), [56, 112, 48, 255])
  }

  for (let i = 0; i < 240; i += 8) {
    c.fillRect(i, 40 + (i % 16), 4, 8, [88, 136, 96, 255])
  }

  c.toPng(filepath)
}

function drawCharmander(canvas, back = false) {
  const cx = 32
  const cy = back ? 36 : 34

  if (back) {
    drawEllipse(canvas, cx, cy + 4, 14, 12, C.orangeDark)
    drawEllipse(canvas, cx, cy, 12, 10, C.orange)
    drawEllipse(canvas, cx - 4, cy - 8, 6, 5, C.orange)
    canvas.fillRect(cx + 8, cy + 2, 10, 4, C.orange)
    drawEllipse(canvas, cx + 16, cy + 4, 4, 3, C.flame1)
    drawEllipse(canvas, cx + 18, cy + 2, 3, 3, C.flame2)
    canvas.set(cx + 19, cy, C.flame3)
  } else {
    drawEllipse(canvas, cx, cy + 2, 13, 11, C.orangeDark)
    drawEllipse(canvas, cx, cy, 11, 9, C.orange)
    drawEllipse(canvas, cx - 2, cy + 4, 7, 6, C.cream)
    canvas.set(cx - 6, cy - 2, C.white)
    canvas.set(cx - 5, cy - 2, C.black)
    canvas.set(cx + 6, cy - 2, C.white)
    canvas.set(cx + 7, cy - 2, C.black)
    drawEllipse(canvas, cx + 12, cy + 6, 5, 4, C.flame1)
    drawEllipse(canvas, cx + 14, cy + 4, 4, 4, C.flame2)
    canvas.set(cx + 15, cy + 2, C.flame3)
    canvas.set(cx + 16, cy + 1, C.flame3)
  }
}

function drawSquirtle(canvas, back = false) {
  const cx = 32
  const cy = back ? 36 : 34

  if (back) {
    drawEllipse(canvas, cx, cy + 4, 14, 12, C.blueDark)
    drawEllipse(canvas, cx, cy, 12, 10, C.blue)
    drawEllipse(canvas, cx, cy - 6, 10, 8, C.brown)
    canvas.fillRect(cx - 8, cy + 6, 16, 8, C.brown)
  } else {
    drawEllipse(canvas, cx, cy + 2, 13, 11, C.blueDark)
    drawEllipse(canvas, cx, cy, 11, 9, C.blue)
    drawEllipse(canvas, cx, cy - 4, 9, 7, C.cream)
    canvas.set(cx - 5, cy - 2, C.white)
    canvas.set(cx - 4, cy - 2, C.black)
    canvas.set(cx + 5, cy - 2, C.white)
    canvas.set(cx + 6, cy - 2, C.black)
    drawEllipse(canvas, cx - 10, cy + 4, 4, 3, C.brown)
    drawEllipse(canvas, cx + 10, cy + 4, 4, 3, C.brown)
  }
}

function drawBulbasaur(canvas, back = false) {
  const cx = 32
  const cy = back ? 36 : 34

  if (back) {
    drawEllipse(canvas, cx, cy + 6, 14, 10, C.greenDark)
    drawEllipse(canvas, cx, cy, 12, 9, C.green)
    drawEllipse(canvas, cx, cy - 8, 12, 8, C.green)
    canvas.set(cx - 4, cy - 12, C.greenDark)
    canvas.set(cx, cy - 14, C.green)
    canvas.set(cx + 4, cy - 12, C.greenDark)
  } else {
    drawEllipse(canvas, cx, cy + 2, 13, 10, C.greenDark)
    drawEllipse(canvas, cx, cy, 11, 8, C.green)
    drawEllipse(canvas, cx, cy - 6, 10, 7, C.green)
    drawEllipse(canvas, cx + 2, cy + 4, 6, 5, C.cream)
    canvas.set(cx - 5, cy - 1, C.red)
    canvas.set(cx + 5, cy - 1, C.red)
    canvas.set(cx - 4, cy, C.black)
    canvas.set(cx + 6, cy, C.black)
    for (let i = -6; i <= 6; i += 3) {
      canvas.set(cx + i, cy - 10, C.greenDark)
      canvas.set(cx + i, cy - 12, C.green)
    }
  }
}

function drawPikachu(canvas, back = false) {
  const cx = 32
  const cy = back ? 36 : 34

  if (back) {
    drawEllipse(canvas, cx, cy + 4, 14, 12, C.yellowDark)
    drawEllipse(canvas, cx, cy, 12, 10, C.yellow)
    canvas.fillRect(cx - 6, cy - 14, 4, 10, C.yellow)
    canvas.fillRect(cx + 2, cy - 14, 4, 10, C.yellow)
    canvas.fillRect(cx + 10, cy + 4, 8, 3, C.yellowDark)
  } else {
    drawEllipse(canvas, cx, cy + 2, 13, 11, C.yellowDark)
    drawEllipse(canvas, cx, cy, 11, 9, C.yellow)
    canvas.fillRect(cx - 12, cy - 10, 5, 12, C.yellow)
    canvas.fillRect(cx + 7, cy - 10, 5, 12, C.yellow)
    canvas.set(cx - 10, cy - 12, C.black)
    canvas.set(cx + 9, cy - 12, C.black)
    canvas.set(cx - 5, cy, C.black)
    canvas.set(cx - 4, cy, C.white)
    canvas.set(cx + 5, cy, C.black)
    canvas.set(cx + 6, cy, C.white)
    canvas.set(cx - 7, cy + 4, C.pink)
    canvas.set(cx + 7, cy + 4, C.pink)
    canvas.fillRect(cx + 10, cy + 6, 10, 4, C.yellowDark)
    canvas.set(cx + 19, cy + 7, C.yellow)
  }
}

function drawTrainer(canvas) {
  const cx = 32
  drawEllipse(canvas, cx, 18, 10, 9, C.skin)
  canvas.fillRect(cx - 12, 14, 24, 6, C.black)
  canvas.fillRect(cx - 10, 26, 20, 22, C.navy)
  canvas.fillRect(cx - 8, 48, 8, 12, C.navy)
  canvas.fillRect(cx, 48, 8, 12, C.navy)
  canvas.fillRect(cx - 12, 28, 4, 16, C.navy)
  canvas.fillRect(cx + 8, 28, 4, 16, C.navy)
  canvas.set(cx - 4, 18, C.black)
  canvas.set(cx + 4, 18, C.black)
}

function drawPokeball(canvas) {
  drawEllipse(canvas, 8, 8, 7, 7, C.white)
  canvas.fillRect(1, 7, 14, 2, C.black)
  drawEllipse(canvas, 8, 4, 7, 4, C.red)
  drawEllipse(canvas, 8, 8, 3, 3, C.white)
  canvas.set(8, 8, C.black)
}

function drawCursor(canvas) {
  for (let i = 0; i < 6; i++) {
    canvas.set(i, 3 - Math.floor(i / 2), C.white)
    canvas.set(i, 4 + Math.floor(i / 2), C.white)
  }
}

function drawFlash(canvas) {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const dx = x - 16
      const dy = y - 16
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 14) {
        const alpha = Math.floor((1 - dist / 14) * 200)
        canvas.set(x, y, [255, 255, 255, alpha])
      }
    }
  }
}

function drawSparkle(canvas) {
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    for (let r = 0; r < 12; r++) {
      const x = Math.floor(16 + Math.cos(angle) * r)
      const y = Math.floor(16 + Math.sin(angle) * r)
      canvas.set(x, y, [248, 248, 120, 255 - r * 18])
    }
  }
  canvas.set(16, 16, [255, 255, 255, 255])
}

function drawPlatform(canvas) {
  drawEllipse(canvas, 32, 20, 30, 8, [88, 136, 72, 255])
  drawEllipse(canvas, 32, 22, 24, 5, [64, 112, 56, 255])
}

function drawDialogFrame(canvas) {
  canvas.fillRect(0, 0, 220, 44, C.white)
  canvas.fillRect(2, 2, 216, 40, [240, 240, 248, 255])
  for (let i = 0; i < 220; i++) {
    canvas.set(i, 0, C.black)
    canvas.set(i, 43, C.black)
  }
  for (let i = 0; i < 44; i++) {
    canvas.set(0, i, C.black)
    canvas.set(219, i, C.black)
  }
  canvas.fillRect(4, 4, 4, 4, C.black)
  canvas.fillRect(212, 4, 4, 4, C.black)
  canvas.fillRect(4, 36, 4, 4, C.black)
  canvas.fillRect(212, 36, 4, 4, C.black)
}

ensureDir(spritesDir)
ensureDir(audioDir)

drawBattleBackground(path.join(spritesDir, 'battle-bg.png'))
writeSprite(path.join(spritesDir, 'favicon.png'), drawPokeball, 32, 32)

const starters = [
  ['charmander', drawCharmander],
  ['squirtle', drawSquirtle],
  ['bulbasaur', drawBulbasaur],
]

for (const [name, drawFn] of starters) {
  writeSprite(path.join(spritesDir, `starter-${name}-front.png`), (c) => drawFn(c, false))
  writeSprite(path.join(spritesDir, `starter-${name}-back.png`), (c) => drawFn(c, true))
}

writeSprite(path.join(spritesDir, 'pikachu-front.png'), (c) => drawPikachu(c, false))
writeSprite(path.join(spritesDir, 'pikachu-back.png'), (c) => drawPikachu(c, true))
writeSprite(path.join(spritesDir, 'trainer-enemy.png'), drawTrainer)
writeSprite(path.join(spritesDir, 'pokeball.png'), drawPokeball, 16, 16)
writeSprite(path.join(spritesDir, 'cursor.png'), drawCursor, 8, 8)
writeSprite(path.join(spritesDir, 'flash.png'), drawFlash, 32, 32)
writeSprite(path.join(spritesDir, 'sparkle.png'), drawSparkle, 32, 32)
writeSprite(path.join(spritesDir, 'platform.png'), drawPlatform)
writeSprite(path.join(spritesDir, 'dialog-frame.png'), drawDialogFrame, 220, 44)

writeWav(path.join(audioDir, 'sfx-select.wav'), 880, 0.08)
writeWav(path.join(audioDir, 'sfx-attack.wav'), 440, 0.2)
writeWav(path.join(audioDir, 'sfx-hit.wav'), 220, 0.25, 0.35)
writeWav(path.join(audioDir, 'sfx-capture.wav'), 660, 0.5, 0.2)
writeBattleBgm(path.join(audioDir, 'bgm-battle.wav'))

console.log('Generated assets in public/assets/')
