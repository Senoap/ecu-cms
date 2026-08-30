// app/admin/services/[id]/page.tsx
import { readDB, writeDB, uploadFile } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import path from 'path'
import { redirect } from 'next/navigation'
import { AVAILABLE_ICONS } from '@/components/DynamicIcon'

async function updateServiceDetail(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const desc = formData.get('desc') as string
    const icon = formData.get('icon') as string
    const content = formData.get('content') as string
    const photoFile = formData.get('photoFile') as File

    const db = await readDB()
    const srv = db.services.find(s => s.id === id)
    if (!srv) return

    srv.title = title
    srv.desc = desc
    srv.icon = icon
    srv.content = content

    if (!srv.images) srv.images = []

    // Upload foto baru ke Supabase Storage menggunakan helper uploadFile (bucket: 'uploads')
    if (photoFile && photoFile.size > 0) {
        const bytes = await photoFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `service-${id}-${Date.now()}${path.extname(photoFile.name)}`

        const imageUrl = await uploadFile(buffer, filename, photoFile.type)
        srv.images.push(imageUrl)
    }

    await writeDB(db)
    revalidatePath('/admin/services')
    revalidatePath(`/services/${id}`)
    revalidatePath('/')
}

export default async function AdminEditServicePage({ params }: { params: { id: string } }) {
    const db = await readDB()
    const srv = db.services.find(s => s.id === params.id)

    if (!srv) {
        redirect('/admin/services')
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-16">
            <div className="flex justify-between items-center bg-[#10131C] p-6 rounded-3xl border border-gray-800 shadow-xl">
                <div>
                    <h1 className="text-xl font-black text-white">Edit Layanan: {srv.title}</h1>
                    <p className="text-gray-400 text-xs font-medium">Sesuaikan konten deskripsi mendalam dan tambah foto dokumentasi.</p>
                </div>
                <Link href="/admin/services" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-bold text-gray-300 transition-colors">
                    &larr; Kembali
                </Link>
            </div>

            <form action={updateServiceDetail} className="bg-[#10131C] p-8 rounded-3xl border border-gray-800 shadow-xl space-y-6">
                <input type="hidden" name="id" value={srv.id} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Judul Layanan</label>
                        <input type="text" name="title" defaultValue={srv.title} required className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm font-medium shadow-inner" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Pilih Ikon CMS</label>
                        <select name="icon" defaultValue={srv.icon} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm font-medium shadow-inner">
                            {AVAILABLE_ICONS.map((ic) => (
                                <option key={ic.value} value={ic.value}>{ic.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Deskripsi Singkat (Card)</label>
                    <input type="text" name="desc" defaultValue={srv.desc} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm font-medium shadow-inner" />
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Konten / Deskripsi Lengkap (Halaman Detail)</label>
                    <textarea name="content" rows={5} defaultValue={srv.content} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm font-medium shadow-inner leading-relaxed"></textarea>
                </div>

                {/* Upload Foto Galeri */}
                <div className="space-y-3 pt-4 border-t border-gray-800">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Unggah Foto Galeri Layanan Baru</label>
                    <input type="file" name="photoFile" accept="image/*" className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-xs cursor-pointer file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-800 file:text-white hover:file:bg-gray-700" />

                    {srv.images && srv.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 pt-2">
                            {srv.images.map((img: string, idx: number) => (
                                <div key={idx} className="relative rounded-2xl overflow-hidden border border-gray-800 bg-[#090A0F] h-28">
                                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg cursor-pointer">
                    Simpan Perubahan Layanan
                </button>
            </form>
        </div>
    )
}