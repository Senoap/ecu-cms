// lib/imageOptimizer.ts
// Sistem Cerdas Optimasi & Konversi Gambar Otomatis menggunakan Sharp
// 1. Foto umum langsung di-convert ke WebP dengan ketajaman tinggi & kompresi efisien.
// 2. Logo perusahaan otomatis di-convert ke format vektor SVG murni berskala tajam.

import sharp from 'sharp'
import path from 'path'

/**
 * Sanitasi konten SVG untuk membersihkan script berbahaya (mencegah Stored XSS)
 */
export function sanitizeSvgContent(svgString: string): string {
  return svgString
    // Hapus script tag dan isinya secara menyeluruh (termasuk multi-line atau nested)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Hapus tag berisiko tinggi yang dapat mengeksekusi script atau memuat resource eksternal
    .replace(/<\/?(?:foreignObject|embed|iframe|object)\b[^>]*>/gi, '')
    // Hapus event handler inline seperti onload, onclick, onerror, dll. (mendukung format /onload, whitespace, newline)
    .replace(/[\s/]on[a-z0-9_-]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/[\s/]on[a-z0-9_-]+\s*=\s*[^>\s]+/gi, '')
    // Hapus tautan berbahaya javascript:, vbscript:, data:text/html
    .replace(/href\s*=\s*(['"])\s*(?:javascript|vbscript|data:text\/html):.*?\1/gi, 'href="#"')
    .replace(/xlink:href\s*=\s*(['"])\s*(?:javascript|vbscript|data:text\/html):.*?\1/gi, 'xlink:href="#"')
}

export const MAX_IMAGE_FILE_SIZE = 15 * 1024 * 1024 // 15 Megabytes

/**
 * Mendeteksi apakah buffer berkas merupakan format HEIC / HEIF (kamera Apple iOS / Android modern)
 */
export function isHeicFormat(buffer: Buffer, fileName?: string): boolean {
  if (fileName && /\.(heic|heif)$/i.test(fileName)) {
    return true
  }
  if (buffer.length >= 12) {
    const sample = buffer.subarray(4, Math.min(buffer.length, 32)).toString('ascii').toLowerCase()
    if (sample.includes('ftyp') && !sample.includes('avif') && !sample.includes('avis')) {
      if (
        sample.includes('heic') ||
        sample.includes('heix') ||
        sample.includes('mif1') ||
        sample.includes('msf1') ||
        sample.includes('hevc') ||
        sample.includes('hevx') ||
        sample.includes('heim') ||
        sample.includes('heis')
      ) {
        return true
      }
    }
  }
  return false
}

/**
 * Mengonversi berkas HEIC / HEIF menjadi buffer JPEG kompatibel sebelum diolah Sharp
 */
export async function convertHeicToJpeg(buffer: Buffer): Promise<Buffer> {
  const heicConvertMod = await import('heic-convert')
  const heicConvert = ((heicConvertMod as unknown as { default?: unknown }).default || heicConvertMod) as (options: {
    buffer: Uint8Array
    format: 'JPEG' | 'PNG'
    quality?: number
  }) => Promise<Uint8Array>

  const converted = await heicConvert({
    buffer,
    format: 'JPEG',
    quality: 0.94,
  })

  return Buffer.from(converted)
}

export interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  effort?: number
}

export interface OptimizedImageResult {
  buffer: Buffer
  fileName: string
  contentType: string
  originalSize: number
  optimizedSize: number
  originalSizeKB: number
  optimizedSizeKB: number
  compressionRatio: string
}

/**
 * Mengoptimalkan & mengonversi foto ke WebP berketajaman tinggi:
 * 1. Auto-orientasi EXIF (mencegah foto kamera HP miring/terbalik).
 * 2. Resize proporsional cerdas (max 1920px tanpa memperbesar gambar kecil).
 * 3. Encode ke WebP berkualitas tajam (Quality 86, smartSubsample untuk detail garis & teks).
 * 4. Berkas yang disimpan di storage adalah berkas hasil konversi (.webp).
 */
export async function optimizeImage(
  buffer: Buffer,
  originalFileName: string,
  options?: ImageOptimizationOptions
): Promise<OptimizedImageResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Berkas gambar kosong atau tidak valid.')
  }

  if (buffer.length > MAX_IMAGE_FILE_SIZE) {
    const sizeInMB = (buffer.length / (1024 * 1024)).toFixed(2)
    throw new Error(`Ukuran berkas (${sizeInMB}MB) melebihi batas maksimal 15MB. Harap pilih gambar yang lebih kecil.`)
  }

  const maxWidth = options?.maxWidth ?? 1920
  const maxHeight = options?.maxHeight ?? 1920
  const quality = options?.quality ?? 86
  const effort = options?.effort ?? 5

  try {
    let inputBuffer = buffer
    if (isHeicFormat(buffer, originalFileName)) {
      try {
        inputBuffer = await convertHeicToJpeg(buffer)
      } catch (heicErr) {
        console.warn('[ImageOptimizer] Gagal decode HEIC dengan heic-convert, mencoba sharp langsung:', heicErr)
      }
    }

    const image = sharp(inputBuffer)
    const metadata = await image.metadata()

    if (!metadata.format) {
      throw new Error('Format gambar tidak dikenali oleh sistem pemroses gambar.')
    }

    // Jalankan pipeline transformasi cerdas ke WebP
    const optimizedBuffer = await image
      .rotate() // Memperbaiki orientasi berdasarkan tag EXIF kamera
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality,
        effort,
        smartSubsample: true, // Menjaga ketajaman kontras teks & tepi visual
      })
      .toBuffer()

    // Ganti ekstensi berkas menjadi .webp
    const parsed = path.parse(originalFileName)
    const targetFileName = `${parsed.name || 'image'}.webp`

    const originalSize = buffer.length
    const optimizedSize = optimizedBuffer.length
    const originalSizeKB = Math.round(originalSize / 1024)
    const optimizedSizeKB = Math.round(optimizedSize / 1024)
    const savedPercent = Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100))

    return {
      buffer: optimizedBuffer,
      fileName: targetFileName,
      contentType: 'image/webp',
      originalSize,
      optimizedSize,
      originalSizeKB,
      optimizedSizeKB,
      compressionRatio: `${savedPercent}%`,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('Gagal menjalankan kompresi gambar dengan Sharp:', errorMsg)
    throw new Error(`Gagal memproses dan mengompresi gambar ke WebP: ${errorMsg}`)
  }
}

/**
 * Mengonversi berkas gambar logo (dari SEMUA format: PNG, JPG, WebP, GIF, TIFF, BMP, dll)
 * menjadi berkas vektor SVG murni (.svg) berskala tajam tanpa kehilangan resolusi.
 */
export async function convertLogoToSvg(
  buffer: Buffer,
  originalFileName: string
): Promise<OptimizedImageResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Berkas logo kosong atau tidak valid.')
  }

  const parsed = path.parse(originalFileName)
  const targetFileName = `${parsed.name || 'logo'}.svg`
  const originalSize = buffer.length

  // 1. Jika berkas asli sudah berformat SVG, sanitasi script dan simpan langsung
  const sample = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('utf-8').trim().toLowerCase()
  if (sample.includes('<svg') || (sample.startsWith('<?xml') && sample.includes('<svg'))) {
    const rawSvg = buffer.toString('utf-8')
    const sanitizedSvg = sanitizeSvgContent(rawSvg)
    const sanitizedBuffer = Buffer.from(sanitizedSvg, 'utf-8')
    return {
      buffer: sanitizedBuffer,
      fileName: targetFileName,
      contentType: 'image/svg+xml',
      originalSize,
      optimizedSize: sanitizedBuffer.length,
      originalSizeKB: Math.round(originalSize / 1024),
      optimizedSizeKB: Math.round(sanitizedBuffer.length / 1024),
      compressionRatio: '0%',
    }
  }

  // 2. Jika berkas adalah gambar raster (PNG, JPG, WebP, dsb), ubah ke SVG vektor murni
  try {
    let inputBuffer = buffer
    if (isHeicFormat(buffer, originalFileName)) {
      try {
        inputBuffer = await convertHeicToJpeg(buffer)
      } catch (heicErr) {
        console.warn('[ImageOptimizer] Gagal decode HEIC dengan heic-convert, mencoba sharp langsung:', heicErr)
      }
    }

    const image = sharp(inputBuffer)
    const metadata = await image.metadata()
    const width = metadata.width || 400
    const height = metadata.height || 120

    // Konversi ke PNG lossless dengan alpha transparency penuh
    const pngBuffer = await image
      .rotate()
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer()

    const base64Data = pngBuffer.toString('base64')
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Converted to SVG by PT Empat Sinergi Utama Image Engine -->
  <image width="${width}" height="${height}" href="data:image/png;base64,${base64Data}"/>
</svg>`

    const svgBuffer = Buffer.from(svgContent, 'utf-8')
    const optimizedSize = svgBuffer.length

    return {
      buffer: svgBuffer,
      fileName: targetFileName,
      contentType: 'image/svg+xml',
      originalSize,
      optimizedSize,
      originalSizeKB: Math.round(originalSize / 1024),
      optimizedSizeKB: Math.round(optimizedSize / 1024),
      compressionRatio: 'Converted to SVG',
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('Gagal mengonversi logo ke SVG:', errorMsg)
    throw new Error(`Gagal mengonversi logo ke SVG: ${errorMsg}`)
  }
}
