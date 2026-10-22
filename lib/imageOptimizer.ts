// lib/imageOptimizer.ts
// Sistem Cerdas Optimasi & Kompresi Gambar Otomatis menggunakan Sharp
// Mengubah gambar ukuran besar (hingga 10MB) menjadi puluhan/ratusan KB (format modern WebP)
// dengan tetap mempertahankan detail ketajaman & kejernihan visual saat dipublikasikan.

import sharp from 'sharp'
import path from 'path'

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024 // 10 Megabytes

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
 * Mengoptimalkan buffer gambar secara cerdas:
 * 1. Validasi batas maksimal 10MB.
 * 2. Auto-orientasi EXIF (mencegah foto kamera HP miring/terbalik).
 * 3. Resize cerdas proporsional (max dimension 1400px, tanpa membesarkan gambar kecil).
 * 4. Encode ke WebP dengan smart subsampling (kompresi drastis ke KB dengan ketajaman tinggi).
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
    throw new Error(`Ukuran berkas (${sizeInMB}MB) melebihi batas maksimal 10MB. Harap pilih gambar yang lebih kecil.`)
  }

  const maxWidth = options?.maxWidth ?? 1400
  const maxHeight = options?.maxHeight ?? 1400
  const quality = options?.quality ?? 82
  const effort = options?.effort ?? 4

  try {
    // Siapkan pipeline Sharp
    const image = sharp(buffer)
    const metadata = await image.metadata()

    // Jika bukan gambar yang didukung Sharp, lemparkan error
    if (!metadata.format) {
      throw new Error('Format gambar tidak dikenali oleh sistem pemroses gambar.')
    }

    // Jalankan pipeline transformasi cerdas
    const optimizedBuffer = await image
      .rotate() // Memperbaiki orientasi berdasarkan tag EXIF kamera
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true, // Jangan perbesar jika resolusi asli lebih kecil
      })
      .webp({
        quality,
        effort,
        smartSubsample: true, // Meningkatkan kejernihan teks/garis kontras tinggi
      })
      .toBuffer()

    // Ganti ekstensi file asli menjadi .webp
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
    throw new Error(`Gagal memproses dan mengompresi gambar: ${errorMsg}`)
  }
}
