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
  const durationSec = 10
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

  // Short chiptune-style battle loop (louder + square-ish tones)
  const melody = [392, 440, 494, 523, 494, 440, 392, 349, 330, 349, 392, 440]
  const bassLine = [196, 196, 220, 220, 175, 175, 196, 196]

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const noteIndex = Math.floor(t * 2.5) % melody.length
    const bassIndex = Math.floor(t * 2.5) % bassLine.length
    const freq = melody[noteIndex]
    const bassFreq = bassLine[bassIndex]

    const leadPhase = 2 * Math.PI * freq * t
    const bassPhase = 2 * Math.PI * bassFreq * t
    const square = Math.sin(leadPhase) > 0 ? 1 : -1
    const bass = Math.sin(bassPhase) * 0.22
    const lead = square * 0.18
    const sample = (bass + lead) * 32767 * 0.9
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

      const compressed = zlib.deflateSync(raw)
      const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      fs.writeFileSync(
        filepath,
        Buffer.concat([
          signature,
          pngChunk('IHDR', ihdr),
          pngChunk('IDAT', compressed),
          pngChunk('IEND', Buffer.alloc(0)),
        ]),
      )
    },
  }
}

const PALETTE = {
  '.': null,
  k: [24, 24, 32, 255],
  w: [248, 248, 248, 255],
  o: [248, 136, 56, 255],
  O: [216, 80, 32, 255],
  c: [248, 224, 168, 255],
  y: [248, 216, 48, 255],
  Y: [216, 160, 24, 255],
  r: [248, 72, 48, 255],
  R: [200, 40, 32, 255],
  b: [88, 152, 248, 255],
  B: [48, 96, 200, 255],
  t: [184, 144, 96, 255],
  T: [136, 96, 56, 255],
  g: [104, 200, 88, 255],
  G: [56, 144, 48, 255],
  p: [248, 160, 176, 255],
  n: [48, 80, 168, 255],
  N: [32, 48, 120, 255],
  s: [248, 200, 160, 255],
  d: [72, 56, 48, 255],
  m: [168, 184, 200, 255],
  f: [248, 200, 64, 255],
  F: [248, 120, 32, 255],
}

function drawPixelMap(canvas, rows, offsetX = 0, offsetY = 0) {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y]
    for (let x = 0; x < row.length; x++) {
      const color = PALETTE[row[x]]
      if (color) canvas.set(offsetX + x, offsetY + y, color)
    }
  }
}

function writeSprite(filepath, drawFn, width = 64, height = 64) {
  const canvas = createCanvas(width, height)
  drawFn(canvas)
  canvas.toPng(filepath)
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

function drawBattleBackground(filepath) {
  // FireRed-style soft seafoam horizontal stripes + grass ovals
  const c = createCanvas(240, 160)
  const stripeA = [216, 240, 224, 255]
  const stripeB = [248, 252, 248, 255]
  const stripeHeight = 3

  for (let y = 0; y < 160; y++) {
    const band = Math.floor(y / stripeHeight) % 2 === 0 ? stripeA : stripeB
    c.fillRect(0, y, 240, 1, band)
  }

  // Enemy grass platform (upper-right)
  drawEllipse(c, 168, 68, 54, 16, [88, 176, 96, 255])
  drawEllipse(c, 168, 66, 48, 12, [120, 200, 120, 255])
  drawEllipse(c, 168, 64, 34, 7, [72, 152, 80, 255])

  // Player grass platform (lower-left)
  drawEllipse(c, 64, 124, 62, 18, [88, 176, 96, 255])
  drawEllipse(c, 64, 122, 54, 13, [120, 200, 120, 255])
  drawEllipse(c, 64, 120, 38, 8, [72, 152, 80, 255])

  c.toPng(filepath)
}

// Compact 32x32 maps, then scaled 2x into 64x64 for crisp GBA look
const CHARMANDER_FRONT = [
  '............kk..............',
  '..........kkookk............',
  '.........kooooook...........',
  '........koooooooook.........',
  '.......koooooooooook........',
  '......koooookkkooook........',
  '......kooookwwkwoook........',
  '......kooookkwkwoook........',
  '......koooooooooook.........',
  '.......koooooccoook.........',
  '.......kooccccccook.........',
  '........koccccccok..........',
  '.......kkoooooookk..........',
  '......koooooooooook.........',
  '.....koooooooooooook........',
  '....koooooooooooooook.......',
  '...koooooooooooooooook......',
  '...koooooooooooooooook......',
  '....koooooooooooooook.......',
  '.....koooooooooooook........',
  '......kooookkkooook.........',
  '.......kook..kook...........',
  '........kk....kk............',
  '.............kf.............',
  '............kFfFk...........',
  '...........kFffFfFk.........',
  '..........kFffffffFk........',
  '...........kFffffFk.........',
  '............kFfFk...........',
  '.............kf.............',
  '............................',
  '............................',
]

const CHARMANDER_BACK = [
  '............kk..............',
  '..........kkOOkk............',
  '.........kOOOOOOk...........',
  '........kOOOOOOOOk..........',
  '.......kOOOOOOOOOOk.........',
  '......kOOOOOOOOOOOOk........',
  '......kOOOOOOOOOOOOk........',
  '......kOOOOOOOOOOOOk........',
  '.......kOOOOOOOOOOk.........',
  '........kOOOOOOOOk..........',
  '.......kkOOOOOOOOkk.........',
  '......kOOOOOOOOOOOOk........',
  '.....kOOOOOOOOOOOOOOk.......',
  '....kOOOOOOOOOOOOOOOOk......',
  '...kOOOOOOOOOOOOOOOOOOk.....',
  '...kOOOOOOOOOOOOOOOOOOk.....',
  '....kOOOOOOOOOOOOOOOOk......',
  '.....kOOOOOOOOOOOOOOk.......',
  '......kOOOOOkOOOOOOk........',
  '.......kOOOk.kOOOOk.........',
  '........kOk...kOk...........',
  '.........k.....k............',
  '..............kf............',
  '.............kFfFk..........',
  '............kFffFfFk........',
  '...........kFffffffFk.......',
  '............kFffffFk........',
  '.............kFfFk..........',
  '..............kf............',
  '............................',
  '............................',
  '............................',
]

const SQUIRTLE_FRONT = [
  '.............kk.............',
  '...........kkbbkk...........',
  '..........kbbbbbbk..........',
  '.........kbbbbbbbbk.........',
  '........kbbbbbbbbbbk........',
  '.......kbbbkkbbkkbbbk.......',
  '.......kbbbkwwkwwkbbk.......',
  '.......kbbbkkwkkwkbbk.......',
  '.......kbbbbbbbbbbbbk.......',
  '........kbbbccccbbbk........',
  '........kbbccccccbbk........',
  '.........kbccccccbk.........',
  '........kktbbbbbbttk........',
  '.......ktbbbbbbbbbbtk.......',
  '......ktbbbbbbbbbbbbtk......',
  '.....ktbbbbbbbbbbbbbbtk.....',
  '....ktbbbbbbbbbbbbbbbbtk....',
  '....ktbbbbbbbbbbbbbbbbtk....',
  '.....ktbbbbbbbbbbbbbbtk.....',
  '......ktbbbbbbbbbbbbtk......',
  '.......ktbbbkktbbbtk........',
  '........kttk..kttk..........',
  '.........kk....kk...........',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
]

const SQUIRTLE_BACK = [
  '.............kk.............',
  '...........kkBBkk...........',
  '..........kBBBBBBk..........',
  '.........kBBBBBBBBk.........',
  '........kBBBBBBBBBBk........',
  '.......kBBBBBBBBBBBBk.......',
  '.......kBBBBBBBBBBBBk.......',
  '.......kBBBBBBBBBBBBk.......',
  '........kBBBBBBBBBBk........',
  '.........kBBBBBBBBk.........',
  '........kkTTTTTTTTkk........',
  '.......kTTTTTTTTTTTTk.......',
  '......kTTTTTTTTTTTTTTk......',
  '.....kTTTTTTTTTTTTTTTTk.....',
  '....kTTTTTTTTTTTTTTTTTTk....',
  '....kTTTTTTTTTTTTTTTTTTk....',
  '.....kTTTTTTTTTTTTTTTTk.....',
  '......kTTTTTTTTTTTTTTk......',
  '.......kTTTTkTTTTTTT........',
  '........kTTk..kTTTk.........',
  '.........kk....kk...........',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
]

const BULBASAUR_FRONT = [
  '..........kGggGGk...........',
  '........kGgggggggGk.........',
  '.......kGgggggggggGk........',
  '......kGgggggggggggGk.......',
  '.....kGggggkGGggggggGk......',
  '.....kGgggk....kggggGk......',
  '......kGggk....kgggGk.......',
  '.......kggkkkkkkggk.........',
  '.........kgggggggk..........',
  '........kgggggggggk.........',
  '.......kggkkggkkgggk........',
  '......kggkrwkkrwkgggk.......',
  '......kggkkwkkkwkgggk.......',
  '......kggggggggggggk........',
  '.......kgggccccgggk.........',
  '........kggccccggk..........',
  '.......kkggggggggkk.........',
  '......kggggggggggggk........',
  '.....kggggggggggggggk.......',
  '....kggggggggggggggggk......',
  '....kggggggggggggggggk......',
  '.....kggggggggggggggk.......',
  '......kgggk..kggggk.........',
  '.......kggk..kgggk..........',
  '........kk....kk............',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
]

const BULBASAUR_BACK = [
  '..........kGGGGkk...........',
  '........kGGGGGGGGk..........',
  '.......kGGGGGGGGGGk.........',
  '......kGGGGGGGGGGGGk........',
  '.....kGGGGGGGGGGGGGGk.......',
  '.....kGGGGGk..kGGGGGk.......',
  '......kGGGGk..kGGGGk........',
  '.......kGGkkkkkkGGk.........',
  '.........kGGGGGGk...........',
  '........kGGGGGGGGk..........',
  '.......kGGGGGGGGGGk.........',
  '......kGGGGGGGGGGGGk........',
  '......kGGGGGGGGGGGGk........',
  '.......kGGGGGGGGGGk.........',
  '........kGGGGGGGGk..........',
  '.......kkGGGGGGGGkk.........',
  '......kGGGGGGGGGGGGk........',
  '.....kGGGGGGGGGGGGGGk.......',
  '....kGGGGGGGGGGGGGGGGk......',
  '....kGGGGGGGGGGGGGGGGk......',
  '.....kGGGGGGGGGGGGGGk.......',
  '......kGGGk..kGGGGk.........',
  '.......kGGk..kGGGk..........',
  '........kk....kk............',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
]

const PIKACHU_FRONT = [
  '..k.........k...............',
  '.kyk.......kyk..............',
  '.kyyk.....kyyk..............',
  '.kyyyk...kyyyk..............',
  '..kyyyk.kyyyk...............',
  '...kyyykyyyk................',
  '....kyyyyyk.................',
  '.....kyyyk..................',
  '....kkyyykk.................',
  '...kyyyyyyyk................',
  '..kyyyyyyyyyk...............',
  '.kyyykkkkkyyyk..............',
  '.kyykwwkwwkyyk..............',
  '.kyykkwkkwkyyk..............',
  '.kyyyyyyyyyyyk..............',
  '..kyypyyypyyk...............',
  '...kyyyyyyyk................',
  '....kyyyyyk.................',
  '...kkyyyyykk................',
  '..kyyyyyyyyyk...............',
  '.kyyyyyyyyyyyk..............',
  '.kyyyyyyyyyyyk..............',
  '..kyyyykkyyyk...............',
  '...kyyykkyyyk...............',
  '....kyk..kyk................',
  '.....k....k.................',
  '...........kYYk.............',
  '............kYYk............',
  '.............kYYk...........',
  '..............kYk...........',
  '...............kk...........',
  '............................',
]

const PIKACHU_BACK = [
  '..k.........k...............',
  '.kYk.......kYk..............',
  '.kYYk.....kYYk..............',
  '.kYYYk...kYYYk..............',
  '..kYYYk.kYYYk...............',
  '...kYYYYkYYk................',
  '....kYYYYk..................',
  '.....kYYYk..................',
  '....kkYYYkk.................',
  '...kYYYYYYYk................',
  '..kYYYYYYYYYk...............',
  '.kYYYYYYYYYYYk..............',
  '.kYYYYYYYYYYYk..............',
  '.kYYYYYYYYYYYk..............',
  '..kYYYYYYYYYk...............',
  '...kYYYYYYYk................',
  '....kYYYYYk.................',
  '...kkYYYYYkk................',
  '..kYYYYYYYYYk...............',
  '.kYYYYYYYYYYYk..............',
  '.kYYYYYYYYYYYk..............',
  '..kYYYYYYYYYk...............',
  '...kYYYkkYYYk...............',
  '....kYYk.kYYk...............',
  '.....kk...kk................',
  '...........kYYk.............',
  '............kYYk............',
  '.............kYYk...........',
  '..............kYk...........',
  '...............kk...........',
  '............................',
  '............................',
]

const TRAINER = [
  '.........kkkkkk.............',
  '.......kkddddddkk...........',
  '......kddddddddddk..........',
  '......kddddddddddk..........',
  '.......kksssssskk...........',
  '........kssssssk............',
  '.......ksskkssssk...........',
  '.......ksskkwsssk...........',
  '.......kssssssssk...........',
  '........kssssssk............',
  '.........kkkkkk.............',
  '.......kknnnnnnkk...........',
  '......knnnnnnnnnnk..........',
  '.....knnnnnnnnnnnnk.........',
  '....knnnnnnnnnnnnnnk........',
  '....knnnnnnnnnnnnnnk........',
  '....knnkknnnnnnkknnk........',
  '....knn..knnnnk..nnk........',
  '....knn..knnnnk..nnk........',
  '.....kk...knnk...kk.........',
  '.........knnkk..............',
  '........knn..nnk............',
  '.......knn....nnk...........',
  '......knn......nnk..........',
  '......knn......nnk..........',
  '......kk........kk..........',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
]

function scaleMap2x(rows) {
  const out = []
  for (const row of rows) {
    let a = ''
    let b = ''
    for (const ch of row) {
      a += ch + ch
      b += ch + ch
    }
    out.push(a, b)
  }
  return out
}

function drawMappedSprite(canvas, rows) {
  const scaled = scaleMap2x(rows)
  const mapW = scaled[0].length
  const mapH = scaled.length
  const ox = Math.floor((64 - mapW) / 2)
  const oy = Math.floor((64 - mapH) / 2)
  drawPixelMap(canvas, scaled, ox, oy)
}

function drawPokeball(canvas) {
  drawEllipse(canvas, 8, 8, 7, 7, PALETTE.w)
  canvas.fillRect(1, 7, 14, 2, PALETTE.k)
  drawEllipse(canvas, 8, 4, 7, 4, PALETTE.r)
  drawEllipse(canvas, 8, 8, 3, 3, PALETTE.w)
  canvas.set(8, 8, PALETTE.k)
}

function drawCursor(canvas) {
  for (let i = 0; i < 6; i++) {
    canvas.set(i, 3 - Math.floor(i / 2), PALETTE.y)
    canvas.set(i, 4 + Math.floor(i / 2), PALETTE.y)
  }
}

function drawFlash(canvas) {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const dx = x - 16
      const dy = y - 16
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 14) {
        canvas.set(x, y, [255, 255, 255, Math.floor((1 - dist / 14) * 200)])
      }
    }
  }
}

function drawSparkle(canvas) {
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    for (let r = 0; r < 12; r++) {
      canvas.set(
        Math.floor(16 + Math.cos(angle) * r),
        Math.floor(16 + Math.sin(angle) * r),
        [248, 248, 120, 255 - r * 18],
      )
    }
  }
  canvas.set(16, 16, [255, 255, 255, 255])
}

function drawPlatform(canvas) {
  drawEllipse(canvas, 32, 20, 30, 8, [88, 136, 72, 255])
  drawEllipse(canvas, 32, 22, 24, 5, [64, 112, 56, 255])
  drawEllipse(canvas, 32, 18, 20, 3, [120, 168, 96, 180])
}

function drawDialogFrame(canvas) {
  canvas.fillRect(0, 0, 220, 44, PALETTE.w)
  canvas.fillRect(2, 2, 216, 40, [248, 244, 224, 255])
  for (let i = 0; i < 220; i++) {
    canvas.set(i, 0, PALETTE.k)
    canvas.set(i, 1, PALETTE.k)
    canvas.set(i, 42, PALETTE.k)
    canvas.set(i, 43, PALETTE.k)
  }
  for (let i = 0; i < 44; i++) {
    canvas.set(0, i, PALETTE.k)
    canvas.set(1, i, PALETTE.k)
    canvas.set(218, i, PALETTE.k)
    canvas.set(219, i, PALETTE.k)
  }
  canvas.fillRect(4, 4, 4, 4, PALETTE.k)
  canvas.fillRect(212, 4, 4, 4, PALETTE.k)
  canvas.fillRect(4, 36, 4, 4, PALETTE.k)
  canvas.fillRect(212, 36, 4, 4, PALETTE.k)
}

const FIRE_RED_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen'

const OFFICIAL_SPRITES = [
  ['starter-bulbasaur-front.png', `${FIRE_RED_BASE}/1.png`],
  ['starter-bulbasaur-back.png', `${FIRE_RED_BASE}/back/1.png`],
  ['starter-charmander-front.png', `${FIRE_RED_BASE}/4.png`],
  ['starter-charmander-back.png', `${FIRE_RED_BASE}/back/4.png`],
  ['starter-squirtle-front.png', `${FIRE_RED_BASE}/7.png`],
  ['starter-squirtle-back.png', `${FIRE_RED_BASE}/back/7.png`],
  ['pikachu-front.png', `${FIRE_RED_BASE}/25.png`],
  ['pikachu-back.png', `${FIRE_RED_BASE}/back/25.png`],
]

async function downloadOfficialSprites() {
  for (const [filename, url] of OFFICIAL_SPRITES) {
    const filepath = path.join(spritesDir, filename)
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const buffer = Buffer.from(await response.arrayBuffer())
      fs.writeFileSync(filepath, buffer)
      console.log(`Downloaded ${filename}`)
    } catch (error) {
      console.warn(`Failed to download ${filename}, using procedural fallback:`, error.message)
      if (filename.includes('charmander')) {
        writeSprite(filepath, (c) => drawMappedSprite(c, filename.includes('back') ? CHARMANDER_BACK : CHARMANDER_FRONT))
      } else if (filename.includes('squirtle')) {
        writeSprite(filepath, (c) => drawMappedSprite(c, filename.includes('back') ? SQUIRTLE_BACK : SQUIRTLE_FRONT))
      } else if (filename.includes('bulbasaur')) {
        writeSprite(filepath, (c) => drawMappedSprite(c, filename.includes('back') ? BULBASAUR_BACK : BULBASAUR_FRONT))
      } else if (filename.includes('pikachu')) {
        writeSprite(filepath, (c) => drawMappedSprite(c, filename.includes('back') ? PIKACHU_BACK : PIKACHU_FRONT))
      }
    }
  }
}

async function main() {
  ensureDir(spritesDir)
  ensureDir(audioDir)

  drawBattleBackground(path.join(spritesDir, 'battle-bg.png'))
  writeSprite(path.join(spritesDir, 'favicon.png'), drawPokeball, 32, 32)
  writeSprite(path.join(spritesDir, 'trainer-enemy.png'), (c) => drawMappedSprite(c, TRAINER))
  writeSprite(path.join(spritesDir, 'pokeball.png'), drawPokeball, 16, 16)
  writeSprite(path.join(spritesDir, 'cursor.png'), drawCursor, 8, 8)
  writeSprite(path.join(spritesDir, 'flash.png'), drawFlash, 32, 32)
  writeSprite(path.join(spritesDir, 'sparkle.png'), drawSparkle, 32, 32)
  writeSprite(path.join(spritesDir, 'platform.png'), drawPlatform)
  writeSprite(path.join(spritesDir, 'dialog-frame.png'), drawDialogFrame, 220, 44)

  await downloadOfficialSprites()

  writeWav(path.join(audioDir, 'sfx-select.wav'), 880, 0.08)
  writeWav(path.join(audioDir, 'sfx-attack.wav'), 440, 0.2)
  writeWav(path.join(audioDir, 'sfx-hit.wav'), 220, 0.25, 0.35)
  writeWav(path.join(audioDir, 'sfx-capture.wav'), 660, 0.5, 0.2)
  writeBattleBgm(path.join(audioDir, 'bgm-battle.wav'))

  console.log('Generated assets in public/assets/')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
