// app/admin/services/[id]/page.tsx
import { readDB, writeDB } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import fs from 'fs'
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

    // Upload foto tambahan jika ada
    if (photoFile && photoFile.size > 0) {
        const bytes = await photoFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `service-${id}-${Date.now()}${path.extname(photoFile.name)}`
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }
        fs.writeFileSync(path.join(uploadDir, filename), buffer)

        if (!srv.images) srv.images = []
        srv.images.push(`/uploads/${filename}`)
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
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex justify-between items-center bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
                <div>
                    <h1 className="text-xl font-bold">Edit Layanan: {srv.title}</h1>
                    <p className="text-gray-400 text-sm">Sesuaikan konten deskripsi mendalam dan tambah foto dokumentasi.</p>
                </div>
                <Link href="/admin/services" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors">
                    &larr; Kembali
                </Link>
            </div>

            <form action={updateServiceDetail} className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg space-y-6">
                <input type="hidden" name="id" value={srv.id} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Judul Layanan</label>
                        <input type="text" name="title" defaultValue={srv.title} required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Pilih Ikon CMS</label>
                        <select name="icon" defaultValue={srv.icon} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white text-sm">
                            {AVAILABLE_ICONS.map((ic) => (
                                <option key={ic.value} value={ic.value}>{ic.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Deskripsi Singkat (Card)</label>
                    <input type="text" name="desc" defaultValue={srv.desc} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Konten / Deskripsi Lengkap (Halaman Detail)</label>
                    <textarea name="content" rows={5} defaultValue={srv.content} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white leading-relaxed"></textarea>
                </div>

                {/* Upload Foto Galeri */}
                <div className="space-y-3 pt-2 border-t border-gray-800">
                    <label className="block text-sm font-medium">Unggah Foto Galeri Layanan Baru</label>
                    <input type="file" name="photoFile" accept="image/*" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white text-sm cursor-pointer" />

                    {srv.images && srv.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 pt-2">
                            {srv.images.map((img, idx) => (
                                <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-950 h-28">
                                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 rounded-xl transition-colors shadow">
                    Simpan Perubahan Layanan
                </button>
            </form>
        </div>
    )
}