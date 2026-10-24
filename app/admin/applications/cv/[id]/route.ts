// app/admin/applications/cv/[id]/route.ts
import { NextResponse } from 'next/server'
import { getCurrentUser, canUserAccessMenu } from '@/lib/auth'
import { getCvDownload } from '@/lib/applications'

// Buka / Unduh CV pelamar (Signed URL jika di Supabase, atau langsung kirim buffer jika di VPS lokal). Hanya admin berizin 'applications'.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })
  if (!canUserAccessMenu(user, 'applications')) {
    return new NextResponse('Forbidden: Anda tidak memiliki izin untuk mengakses dokumen CV pelamar.', { status: 403 })
  }
  const { id } = await params

  const result = await getCvDownload(id)
  if (!result) return new NextResponse('Berkas CV tidak ditemukan', { status: 404 })

  if ('signedUrl' in result) {
    return NextResponse.redirect(result.signedUrl)
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    status: 200,
    headers: {
      'Content-Type': result.mimeType,
      'Content-Disposition': `inline; filename="${result.fileName}"`,
    },
  })
}
