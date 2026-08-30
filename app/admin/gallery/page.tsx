// app/admin/gallery/page.tsx
import { readDB, writeDB, addNotification, uploadFile, GalleryItem } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import GalleryClient from './GalleryClient'

export default async function AdminGalleryPage() {
  const db = await readDB()
  const galleries = db.galleries || []
  const gallerySection = db.sections.find(s => s.id === 'gallery') || {
    subtitle: 'OUR MOMENTS',
    title: 'GALERI DOKUMENTASI',
    content: 'Dokumentasi kegiatan operasional dan proyek.'
  }

  async function saveHeaderAction(formData: FormData) {
    'use server'
    const db = await readDB()
    const subtitle = formData.get('subtitle') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string

    const secIndex = db.sections.findIndex(s => s.id === 'gallery')
    if (secIndex !== -1) {
      db.sections[secIndex].subtitle = subtitle
      db.sections[secIndex].title = title
      db.sections[secIndex].content = content
    }

    await writeDB(db)
    await addNotification('Memperbarui Header Gallery Section.', 'UPDATE')
    revalidatePath('/admin/gallery')
  }

  async function addGalleryAction(formData: FormData) {
    'use server'
    const db = await readDB()
    if (!db.galleries) db.galleries = []

    const title = formData.get('title') as string
    const desc = formData.get('desc') as string
    const category = formData.get('category') as string || 'Umum'
    const file = formData.get('photoFile') as File

    let imageUrl = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'
    
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileName = `gallery-${Date.now()}-${file.name.replace(/\s+/g, '_')}`
      imageUrl = await uploadFile(buffer, fileName, file.type)
    }

    const newItem: GalleryItem = {
      id: 'gallery-' + Date.now(),
      title,
      desc,
      category,
      imageUrl
    }

    db.galleries.push(newItem)
    await writeDB(db)
    await addNotification(`Menambahkan foto galeri: "${title}" ke kategori "${category}".`, 'CREATE')
    revalidatePath('/admin/gallery')
  }

  async function updateGalleryAction(formData: FormData) {
    'use server'
    const db = await readDB()
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const desc = formData.get('desc') as string
    const category = formData.get('category') as string || 'Umum'
    const file = formData.get('photoFile') as File

    const itemIndex = db.galleries.findIndex(g => g.id === id)
    if (itemIndex !== -1) {
      db.galleries[itemIndex].title = title
      db.galleries[itemIndex].desc = desc
      db.galleries[itemIndex].category = category

      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const fileName = `gallery-${Date.now()}-${file.name.replace(/\s+/g, '_')}`
        db.galleries[itemIndex].imageUrl = await uploadFile(buffer, fileName, file.type)
      }

      await writeDB(db)
      await addNotification(`Memperbarui foto galeri: "${title}".`, 'UPDATE')
      revalidatePath('/admin/gallery')
    }
  }

  async function deleteGalleryAction(formData: FormData) {
    'use server'
    const db = await readDB()
    const id = formData.get('id') as string

    db.galleries = db.galleries.filter(g => g.id !== id)
    await writeDB(db)
    await addNotification('Menghapus foto dari galeri.', 'DELETE')
    revalidatePath('/admin/gallery')
  }

  return (
    <GalleryClient
      galleries={galleries}
      gallerySection={gallerySection}
      saveHeaderAction={saveHeaderAction}
      addGalleryAction={addGalleryAction}
      updateGalleryAction={updateGalleryAction}
      deleteGalleryAction={deleteGalleryAction}
    />
  )
}