// app/api/admin/heic-preview/route.ts
import { NextRequest, NextResponse } from 'next/server'
import sharp, { type Sharp } from 'sharp'
import { isHeicFormat, decodeHeicToSharp } from '@/lib/imageOptimizer'
import { validateImageBuffer } from '@/lib/fileSecurity'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Berkas foto tidak ditemukan.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const validation = validateImageBuffer(buffer, file.name)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message || 'Format gambar tidak didukung.' }, { status: 400 })
    }

    let imageInstance: Sharp
    if (isHeicFormat(buffer, file.name)) {
      imageInstance = await decodeHeicToSharp(buffer)
    } else {
      imageInstance = sharp(buffer, { limitInputPixels: 100_000_000 }).rotate()
    }

    // Buat thumbnail WebP tajam dan ringan untuk pratinjau instan di browser
    const previewBuffer = await imageInstance
      .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()

    const base64 = previewBuffer.toString('base64')
    const dataUrl = `data:image/webp;base64,${base64}`

    return NextResponse.json({
      success: true,
      previewUrl: dataUrl,
    })
  } catch (err: unknown) {
    console.error('[HEIC Preview API Error]:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal memproses pratinjau foto.' },
      { status: 500 }
    )
  }
}
