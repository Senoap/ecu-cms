// app/admin/gallery/page.tsx
import { readDB, writeDB, addNotification, uploadFile, deleteFile, GalleryItem } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requirePermission, requirePagePermission } from '@/lib/auth'
import GalleryClient from './GalleryClient'

export default async function AdminGalleryPage() {
  await requirePagePermission('gallery')
  const db = await readDB()
  const galleries = db.galleries || []
  const gallerySection = db.sections.find(s => s.id === 'gallery') || {
    subtitle: 'OUR MOMENTS',
    title: 'GALERI DOKUMENTASI',
    content: 'Dokumentasi kegiatan operasional dan proyek.'
  }

  const rawCategories = (db.galleryCategories && db.galleryCategories.length > 0)
    ? db.galleryCategories
    : ['Keamanan', 'Kebersihan']

  const categories = Array.from(new Set([
    ...rawCategories,
    ...galleries.map(g => g.category || 'Umum')
  ])).filter(Boolean)

  async function saveHeaderAction(formData: FormData) {
    'use server'
    await requirePermission('gallery')
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
    revalidatePath('/admin', 'layout')
    revalidatePath('/')
  }

  async function addCategoryAction(formData: FormData) {
    'use server'
    await requirePermission('gallery')
    const db = await readDB()
    const name = (formData.get('name') as string || '').trim()
    if (!name) return

    if (!db.galleryCategories) {
      db.galleryCategories = Array.from(new Set((db.galleries || []).map(g => g.category || 'Umum'))).filter(Boolean)
    }

    const exists = db.galleryCategories.some(c => c.toLowerCase() === name.toLowerCase())
    if (!exists) {
      db.galleryCategories.push(name)
      await writeDB(db)
      await addNotification(`Menambahkan kategori galeri baru: "${name}".`, 'CREATE')
      revalidatePath('/admin/gallery')
      revalidatePath('/admin', 'layout')
      revalidatePath('/')
    }
  }

  async function updateCategoryAction(formData: FormData) {
    'use server'
    await requirePermission('gallery')
    const db = await readDB()
    const oldName = (formData.get('oldName') as string || '').trim()
    const newName = (formData.get('newName') as string || '').trim()
    if (!oldName || !newName || oldName.toLowerCase() === newName.toLowerCase()) return

    if (!db.galleryCategories) {
      db.galleryCategories = Array.from(new Set((db.galleries || []).map(g => g.category || 'Umum'))).filter(Boolean)
    }

    db.galleryCategories = db.galleryCategories.map(c => c.toLowerCase() === oldName.toLowerCase() ? newName : c)
    db.galleryCategories = Array.from(new Set(db.galleryCategories))

    if (db.galleries) {
      db.galleries.forEach(g => {
        if ((g.category || 'Umum').toLowerCase() === oldName.toLowerCase()) {
          g.category = newName
        }
      })
    }

    await writeDB(db)
    await addNotification(`Mengubah nama kategori galeri: "${oldName}" menjadi "${newName}".`, 'UPDATE')
    revalidatePath('/admin/gallery')
    revalidatePath('/admin', 'layout')
    revalidatePath('/')
  }

  async function deleteCategoryAction(formData: FormData) {
    'use server'
    await requirePermission('gallery')
    const db = await readDB()
    const name = (formData.get('name') as string || '').trim()
    if (!name) return

    if (!db.galleryCategories) {
      db.galleryCategories = Array.from(new Set((db.galleries || []).map(g => g.category || 'Umum'))).filter(Boolean)
    }

    db.galleryCategories = db.galleryCategories.filter(c => c.toLowerCase() !== name.toLowerCase())

    if (db.galleries) {
      db.galleries.forEach(g => {
        if ((g.category || 'Umum').toLowerCase() === name.toLowerCase()) {
          g.category = 'Umum'
        }
      })
    }

    await writeDB(db)
    await addNotification(`Menghapus kategori galeri: "${name}".`, 'DELETE')
    revalidatePath('/admin/gallery')
    revalidatePath('/admin', 'layout')
    revalidatePath('/')
  }

  async function addGalleryAction(formData: FormData) {
    'use server'
    await requirePermission('gallery')
    const db = await readDB()
    if (!db.galleries) db.galleries = []

    const title = formData.get('title') as string
    const desc = formData.get('desc') as string
    const category = (formData.get('category') as string || 'Umum').trim()
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

    // Pastikan kategori baru juga terdaftar di db.galleryCategories
    if (!db.galleryCategories) {
      db.galleryCategories = ['Keamanan', 'Kebersihan']
    }
    if (!db.galleryCategories.some(c => c.toLowerCase() === category.toLowerCase())) {
      db.galleryCategories.push(category)
    }

    await writeDB(db)
    await addNotification(`Menambahkan foto galeri: "${title}" ke kategori "${category}".`, 'CREATE')
    revalidatePath('/admin/gallery')
    revalidatePath('/admin', 'layout')
    revalidatePath('/')
  }

  async function updateGalleryAction(formData: FormData) {
    'use server'
    await requirePermission('gallery')
    const db = await readDB()
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const desc = formData.get('desc') as string
    const category = (formData.get('category') as string || 'Umum').trim()
    const file = formData.get('photoFile') as File

    const itemIndex = db.galleries.findIndex(g => g.id === id)
    if (itemIndex !== -1) {
      db.galleries[itemIndex].title = title
      db.galleries[itemIndex].desc = desc
      db.galleries[itemIndex].category = category

      if (file && file.size > 0) {
        if (db.galleries[itemIndex].imageUrl) {
          const oldFile = db.galleries[itemIndex].imageUrl.split('/').pop()
          if (oldFile) await deleteFile(oldFile)
        }
        const buffer = Buffer.from(await file.arrayBuffer())
        const fileName = `gallery-${Date.now()}-${file.name.replace(/\s+/g, '_')}`
        db.galleries[itemIndex].imageUrl = await uploadFile(buffer, fileName, file.type)
      }

      // Pastikan kategori juga ada di db.galleryCategories
      if (!db.galleryCategories) {
        db.galleryCategories = ['Keamanan', 'Kebersihan']
      }
      if (!db.galleryCategories.some(c => c.toLowerCase() === category.toLowerCase())) {
        db.galleryCategories.push(category)
      }

      await writeDB(db)
      await addNotification(`Memperbarui foto galeri: "${title}".`, 'UPDATE')
      revalidatePath('/admin/gallery')
      revalidatePath('/admin', 'layout')
      revalidatePath('/')
    }
  }

  async function deleteGalleryAction(formData: FormData) {
    'use server'
    await requirePermission('gallery')
    const db = await readDB()
    const id = formData.get('id') as string

    const target = db.galleries.find(g => g.id === id)
    if (target?.imageUrl) {
      const fileName = target.imageUrl.split('/').pop()
      if (fileName) await deleteFile(fileName)
    }

    db.galleries = db.galleries.filter(g => g.id !== id)
    await writeDB(db)
    await addNotification('Menghapus foto dari galeri.', 'DELETE')
    revalidatePath('/admin/gallery')
    revalidatePath('/admin', 'layout')
    revalidatePath('/')
  }

  return (
    <GalleryClient
      galleries={galleries}
      categories={categories}
      gallerySection={gallerySection}
      saveHeaderAction={saveHeaderAction}
      addGalleryAction={addGalleryAction}
      updateGalleryAction={updateGalleryAction}
      deleteGalleryAction={deleteGalleryAction}
      addCategoryAction={addCategoryAction}
      updateCategoryAction={updateCategoryAction}
      deleteCategoryAction={deleteCategoryAction}
    />
  )
}
