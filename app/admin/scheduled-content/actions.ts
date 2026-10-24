// app/admin/scheduled-content/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth'
import { 
  readDB, 
  writeDB, 
  addNotification, 
  uploadFile, 
  deleteFile, 
  autoPurgeExpiredScheduledContents,
  type ScheduledContentItem 
} from '@/lib/db'

export async function purgeExpiredScheduledContentAction() {
  await requirePermission('scheduled-content')
  const result = await autoPurgeExpiredScheduledContents()
  revalidatePath('/admin/scheduled-content')
  revalidatePath('/')
  return result
}

export async function createScheduledContentAction(formData: FormData) {
  await requirePermission('scheduled-content')

  const type = (String(formData.get('type') ?? 'daily') as 'daily' | 'monthly')
  const title = String(formData.get('title') ?? '').trim()
  const badge = String(formData.get('badge') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  const startDate = String(formData.get('startDate') ?? '').trim()
  const endDate = String(formData.get('endDate') ?? '').trim()
  const imageUrlRaw = String(formData.get('imageUrl') ?? '').trim()
  const isActive = formData.get('isActive') !== 'false'

  if (!title) throw new Error('Judul konten wajib diisi.')
  if (!content) throw new Error('Isi konten wajib diisi.')
  if (!startDate || !endDate) throw new Error('Tanggal mulai dan tanggal selesai wajib diisi.')
  if (startDate > endDate) throw new Error('Tanggal mulai tidak boleh lebih besar dari tanggal selesai.')

  let finalImageUrl = imageUrlRaw

  // Handle file upload jika ada file gambar yang diunggah
  const imageFile = formData.get('imageFile') as File | null
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const ext = imageFile.name.split('.').pop() || 'jpg'
    const fileName = `content-${type}-${Date.now()}.${ext}`
    finalImageUrl = await uploadFile(buffer, fileName, imageFile.type || 'image/jpeg')
  }

  const db = await readDB()
  if (!db.scheduledContents) db.scheduledContents = []

  const newItem: ScheduledContentItem = {
    id: 'sc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    type,
    title,
    badge: badge || (type === 'daily' ? 'DAILY HIGHLIGHT' : 'EDISI BULAN INI'),
    content,
    imageUrl: finalImageUrl || undefined,
    startDate,
    endDate,
    isActive,
    createdAt: Date.now(),
  }

  db.scheduledContents.unshift(newItem)
  await writeDB(db)
  await addNotification(`Menambahkan konten terjadwal (${type}): "${title}".`, 'CREATE')

  revalidatePath('/admin/scheduled-content')
  revalidatePath('/')
}

export async function updateScheduledContentAction(formData: FormData) {
  await requirePermission('scheduled-content')

  const id = String(formData.get('id') ?? '')
  const type = (String(formData.get('type') ?? 'daily') as 'daily' | 'monthly')
  const title = String(formData.get('title') ?? '').trim()
  const badge = String(formData.get('badge') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  const startDate = String(formData.get('startDate') ?? '').trim()
  const endDate = String(formData.get('endDate') ?? '').trim()
  const imageUrlRaw = String(formData.get('imageUrl') ?? '').trim()
  const isActive = formData.get('isActive') !== 'false'

  if (!id) throw new Error('ID konten tidak valid.')
  if (!title) throw new Error('Judul konten wajib diisi.')
  if (!content) throw new Error('Isi konten wajib diisi.')
  if (!startDate || !endDate) throw new Error('Tanggal mulai dan tanggal selesai wajib diisi.')
  if (startDate > endDate) throw new Error('Tanggal mulai tidak boleh lebih besar dari tanggal selesai.')

  let finalImageUrl = imageUrlRaw

  const db = await readDB()
  if (!db.scheduledContents) db.scheduledContents = []

  const idx = db.scheduledContents.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('Konten terjadwal tidak ditemukan.')

  const imageFile = formData.get('imageFile') as File | null
  if (imageFile && imageFile.size > 0) {
    const oldItem = db.scheduledContents[idx]
    if (oldItem?.imageUrl) {
      const oldFileName = oldItem.imageUrl.split('/').pop()
      if (oldFileName) await deleteFile(oldFileName)
    }
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const ext = imageFile.name.split('.').pop() || 'jpg'
    const fileName = `content-${type}-${Date.now()}.${ext}`
    finalImageUrl = await uploadFile(buffer, fileName, imageFile.type || 'image/jpeg')
  }

  db.scheduledContents[idx] = {
    ...db.scheduledContents[idx],
    type,
    title,
    badge: badge || (type === 'daily' ? 'DAILY HIGHLIGHT' : 'EDISI BULAN INI'),
    content,
    imageUrl: finalImageUrl || undefined,
    startDate,
    endDate,
    isActive,
  }

  await writeDB(db)
  await addNotification(`Memperbarui konten terjadwal (${type}): "${title}".`, 'UPDATE')

  revalidatePath('/admin/scheduled-content')
  revalidatePath('/')
}

export async function deleteScheduledContentAction(formData: FormData) {
  await requirePermission('scheduled-content')

  const id = String(formData.get('id') ?? '')
  if (!id) return

  const db = await readDB()
  if (!db.scheduledContents) return

  const target = db.scheduledContents.find((c) => c.id === id)
  if (target?.imageUrl) {
    const fileName = target.imageUrl.split('/').pop()
    if (fileName) await deleteFile(fileName)
  }

  db.scheduledContents = db.scheduledContents.filter((c) => c.id !== id)

  await writeDB(db)
  await addNotification(`Menghapus konten terjadwal: "${target?.title || id}".`, 'DELETE')

  revalidatePath('/admin/scheduled-content')
  revalidatePath('/')
}

export async function toggleScheduledContentActiveAction(formData: FormData) {
  await requirePermission('scheduled-content')

  const id = String(formData.get('id') ?? '')
  const db = await readDB()
  if (!db.scheduledContents) return

  const item = db.scheduledContents.find((c) => c.id === id)
  if (item) {
    item.isActive = !item.isActive
    await writeDB(db)
    await addNotification(`Mengubah status aktif konten "${item.title}" menjadi ${item.isActive ? 'Aktif' : 'Non-aktif'}.`, 'UPDATE')
    revalidatePath('/admin/scheduled-content')
    revalidatePath('/')
  }
}
