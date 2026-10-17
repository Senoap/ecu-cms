// app/admin/applications/cv/[id]/route.ts
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabaseAdmin'

// Redirect ke signed URL (berlaku 60 detik). Hanya admin.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new NextResponse('Unauthorized', { status: 401 })
  const { id } = await params
  const supabase = getAdminClient()
  const { data } = await supabase.from('applications').select('cv_path').eq('id', id).maybeSingle()
  if (!data?.cv_path) return new NextResponse('Not found', { status: 404 })
  const { data: signed, error } = await supabase.storage.from('cv').createSignedUrl(data.cv_path as string, 60)
  if (error || !signed) return new NextResponse('Gagal membuat tautan', { status: 500 })
  return NextResponse.redirect(signed.signedUrl)
}
