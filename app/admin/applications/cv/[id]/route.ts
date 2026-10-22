// app/admin/applications/cv/[id]/route.ts
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { getCvDownload } from '@/lib/applications'

// Buka / Unduh CV pelamar (Signed URL jika di Supabase, atau langsung kirim buffer jika di VPS lokal). Hanya admin.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new NextResponse('Unauthorized', { status: 401 })
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
