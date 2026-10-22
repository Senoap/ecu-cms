// lib/fileSecurity.ts
// Validasi berkas biner (Magic Bytes) untuk mencegah upload script/malware terselubung

/**
 * Sanitasi nama berkas untuk mencegah Path Traversal (e.g. ../../) dan Null Byte Injection
 */
export function sanitizeFilename(filename: string): string {
  // Hapus path traversal, null bytes, dan karakter berbahaya
  const base = filename.replace(/^.*[\\/]/, '').replace(/\0/g, '')
  // Batasi hanya karakter alfanumerik, dash, underscore, dan dot
  const sanitized = base.replace(/[^a-zA-Z0-9._-]/g, '_')
  // Cegah nama berkas kosong atau tersembunyi (diawali titik)
  return sanitized.replace(/^\.+/, '') || `file_${Date.now()}`
}

/**
 * Validasi biner berkas PDF (Magic Bytes: %PDF-)
 */
export function validatePdfBuffer(buffer: Buffer): { valid: boolean; message?: string } {
  if (!buffer || buffer.length < 5) {
    return { valid: false, message: 'Ukuran berkas terlalu kecil atau kosong.' }
  }

  // Cek Magic Number PDF: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
  const header = buffer.subarray(0, 5).toString('ascii')
  if (!header.startsWith('%PDF-')) {
    return {
      valid: false,
      message: 'Format berkas tidak valid. Berkas bukan merupakan dokumen PDF resmi.',
    }
  }

  return { valid: true }
}

/**
 * Validasi biner gambar (PNG, JPEG, WEBP)
 * Secara tegas menolak berkas SVG/HTML untuk mencegah serangan Stored XSS melalui gambar.
 */
export function validateImageBuffer(buffer: Buffer): { valid: boolean; mime?: string; message?: string } {
  if (!buffer || buffer.length < 8) {
    return { valid: false, message: 'Berkas gambar terlalu kecil atau kosong.' }
  }

  // 1. Cek PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return { valid: true, mime: 'image/png' }
  }

  // 2. Cek JPEG/JPG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, mime: 'image/jpeg' }
  }

  // 3. Cek WEBP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { valid: true, mime: 'image/webp' }
  }

  // Tolak format yang rentan atau tidak didukung
  const prefixAscii = buffer.subarray(0, 50).toString('utf-8').toLowerCase()
  if (prefixAscii.includes('<svg') || prefixAscii.includes('<?xml') || prefixAscii.includes('<html') || prefixAscii.includes('<script')) {
    return {
      valid: false,
      message: 'Berkas SVG / XML / HTML tidak diizinkan demi alasan keamanan XSS. Harap gunakan format PNG, JPG, atau WEBP.',
    }
  }

  return {
    valid: false,
    message: 'Format gambar tidak didukung. Harap unggah berkas PNG, JPG, JPEG, atau WEBP.',
  }
}
