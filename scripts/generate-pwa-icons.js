/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = ICO
  header.writeUInt16LE(count, 4); // count

  let offset = 6 + (16 * count);
  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.buffer)]);
}

async function generateIcons() {
  const inputLogo = path.join(__dirname, '..', 'public', 'uploads', 'logo-1788085817981.png');
  const outputDir = path.join(__dirname, '..', 'public', 'icons');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Apple Touch Icon (180x180) with dark corporate background
  const appleTouchSize = 180;
  const appleLogoSize = 130;
  const resizedLogoApple = await sharp(inputLogo)
    .resize(appleLogoSize, appleLogoSize, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: appleTouchSize,
      height: appleTouchSize,
      channels: 4,
      background: { r: 9, g: 10, b: 15, alpha: 1 } // #090A0F
    }
  })
  .composite([{ input: resizedLogoApple, gravity: 'center' }])
  .png()
  .toFile(path.join(outputDir, 'apple-touch-icon.png'));

  console.log('Generated apple-touch-icon.png (180x180)');

  // 2. Icon 192x192
  const icon192Size = 192;
  const logo192Size = 140;
  const resizedLogo192 = await sharp(inputLogo)
    .resize(logo192Size, logo192Size, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: icon192Size,
      height: icon192Size,
      channels: 4,
      background: { r: 9, g: 10, b: 15, alpha: 1 }
    }
  })
  .composite([{ input: resizedLogo192, gravity: 'center' }])
  .png()
  .toFile(path.join(outputDir, 'icon-192x192.png'));

  console.log('Generated icon-192x192.png (192x192)');

  // 3. Icon 512x512
  const icon512Size = 512;
  const logo512Size = 380;
  const resizedLogo512 = await sharp(inputLogo)
    .resize(logo512Size, logo512Size, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: icon512Size,
      height: icon512Size,
      channels: 4,
      background: { r: 9, g: 10, b: 15, alpha: 1 }
    }
  })
  .composite([{ input: resizedLogo512, gravity: 'center' }])
  .png()
  .toFile(path.join(outputDir, 'icon-512x512.png'));

  console.log('Generated icon-512x512.png (512x512)');

  // 4. Maskable Icon 512x512 (with safe area margin)
  const maskableLogoSize = 320;
  const resizedLogoMaskable = await sharp(inputLogo)
    .resize(maskableLogoSize, maskableLogoSize, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: icon512Size,
      height: icon512Size,
      channels: 4,
      background: { r: 107, g: 8, b: 8, alpha: 1 } // #6B0808 ESU Maroon
    }
  })
  .composite([{ input: resizedLogoMaskable, gravity: 'center' }])
  .png()
  .toFile(path.join(outputDir, 'icon-maskable-512x512.png'));

  console.log('Generated icon-maskable-512x512.png (512x512)');

  // 5. Multi-resolution favicon.ico (16x16, 32x32, 48x48)
  const icoSizes = [16, 32, 48];
  const pngBuffers = [];
  for (const s of icoSizes) {
    const buf = await sharp(inputLogo)
      .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    pngBuffers.push({ width: s, height: s, buffer: buf });
  }
  const icoBuf = await createIco(pngBuffers);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), icoBuf);
  console.log('Generated public/favicon.ico (16, 32, 48px)');

  // 6. Next.js app/icon.png (32x32)
  const icon32 = await sharp(inputLogo)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(__dirname, '..', 'app', 'icon.png'), icon32);
  console.log('Generated app/icon.png (32x32)');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
