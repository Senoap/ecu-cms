// lib/faviconHelper.ts
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

function createIco(pngBuffers: { width: number; height: number; buffer: Buffer }[]): Buffer {
  const count = pngBuffers.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: 1 = ICO
  header.writeUInt16LE(count, 4) // count

  let offset = 6 + 16 * count
  const entries: Buffer[] = []
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0)
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1)
    entry.writeUInt8(0, 2) // palette
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // planes
    entry.writeUInt16LE(32, 6) // bpp
    entry.writeUInt32LE(item.buffer.length, 8) // size
    entry.writeUInt32LE(offset, 12) // offset
    entries.push(entry)
    offset += item.buffer.length
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.buffer)])
}

export async function generateFaviconFromBuffer(imageBuffer: Buffer) {
  try {
    const sizes = [16, 32, 48]
    const pngBuffers: { width: number; height: number; buffer: Buffer }[] = []
    for (const s of sizes) {
      const buf = await sharp(imageBuffer)
        .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
      pngBuffers.push({ width: s, height: s, buffer: buf })
    }
    const icoBuf = createIco(pngBuffers)

    const publicFavicon = path.join(process.cwd(), 'public', 'favicon.ico')
    await fs.writeFile(publicFavicon, icoBuf)

    const appIcon = path.join(process.cwd(), 'app', 'icon.png')
    const icon32 = await sharp(imageBuffer)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
    await fs.writeFile(appIcon, icon32)
  } catch (err) {
    console.warn('Gagal meng-generate favicon.ico dari logo:', err)
  }
}
