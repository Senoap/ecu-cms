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

/**
 * Validasi biner gambar untuk SEMUA jenis format berkas gambar:
 * Mendukung PNG, JPG/JPEG, WEBP, GIF, BMP, TIFF, AVIF, HEIC, ICO, dan SVG.
 */
export function validateImageBuffer(buffer: Buffer, fileName?: string): { valid: boolean; mime?: string; message?: string } {
  if (!buffer || buffer.length < 4) {
    return { valid: false, message: 'Berkas gambar terlalu kecil atau kosong.' }
  }

  // 1. Cek PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
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

  // 4. Cek GIF: 47 49 46 38 (GIF87a / GIF89a)
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38
  ) {
    return { valid: true, mime: 'image/gif' }
  }

  // 5. Cek BMP: 42 4D (BM)
  if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
    return { valid: true, mime: 'image/bmp' }
  }

  // 6. Cek TIFF: 49 49 2A 00 (Little Endian) atau 4D 4D 00 2A (Big Endian)
  if (
    buffer.length >= 4 &&
    ((buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2A && buffer[3] === 0x00) ||
     (buffer[0] === 0x4D && buffer[1] === 0x4D && buffer[2] === 0x00 && buffer[3] === 0x2A))
  ) {
    return { valid: true, mime: 'image/tiff' }
  }

  // 7. Cek AVIF / HEIC / HEIF (Mendukung foto kamera iPhone & Android modern)
  if (fileName && /\.(heic|heif)$/i.test(fileName) && buffer.length >= 12) {
    return { valid: true, mime: 'image/heic' }
  }
  if (buffer.length >= 12) {
    const ftyp = buffer.subarray(4, 12).toString('ascii').toLowerCase()
    if (ftyp.includes('ftyp')) {
      if (ftyp.includes('avif') || ftyp.includes('avis')) {
        return { valid: true, mime: 'image/avif' }
      }
      return { valid: true, mime: 'image/heic' }
    }
  }

  // 8. Cek ICO: 00 00 01 00
  if (buffer.length >= 4 && buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00) {
    return { valid: true, mime: 'image/x-icon' }
  }

  // 9. Cek SVG: Berkas teks XML yang diawali <svg atau <?xml dan memuat elemen <svg
  const sample = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('utf-8').trim().toLowerCase()
  if (sample.includes('<svg') || (sample.startsWith('<?xml') && sample.includes('<svg'))) {
    const fullText = buffer.toString('utf-8').toLowerCase()
    // Pastikan tidak ada tag script jahat langsung
    if (fullText.includes('<script') || fullText.includes('javascript:') || /[\s/]on[a-z0-9_-]+\s*=/i.test(fullText)) {
      return {
        valid: false,
        message: 'Berkas SVG memuat kode skrip berbahaya (JavaScript/Event Handler) yang dilarang demi keamanan.',
      }
    }
    return { valid: true, mime: 'image/svg+xml' }
  }

  // Tolak berkas yang bukan gambar sama sekali (HTML murni, executable, dll)
  if (sample.startsWith('<!doctype html') || sample.startsWith('<html') || sample.startsWith('<body')) {
    return {
      valid: false,
      message: 'Berkas HTML tidak diizinkan. Harap unggah berkas gambar yang sah.',
    }
  }

  return {
    valid: false,
    message: 'Format gambar tidak dikenali. Harap unggah berkas gambar seperti PNG, JPG, JPEG, WEBP, GIF, SVG, BMP, AVIF, atau TIFF.',
  }
}
