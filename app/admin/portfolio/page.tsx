// app/admin/portfolio/page.tsx
import { readDB, writeDB, addNotification, PortfolioItem } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import PortfolioClient from './PortfolioClient'
import fs from 'fs'
import path from 'path'

export default async function AdminPortfolioPage() {
  const db = await readDB()
  const portfolios = db.portfolios || []
  const portfolioHeader = db.portfolioHeader || { tag: 'PROVEN TRACK RECORD', heading: 'PROJECT PORTFOLIO', note: '' }
  const portfolioSection = db.sections.find(s => s.id === 'portfolio') || {
    subtitle: 'PROVEN TRACK RECORD',
    title: 'PROJECT PORTFOLIO',
    content: ''
  }

  async function saveHeaderAction(formData: FormData) {
    'use server'
    const db = await readDB()
    const subtitle = formData.get('subtitle') as string
    const title = formData.get('title') as string
    const note = formData.get('note') as string

    db.portfolioHeader = { tag: subtitle, heading: title, note: note }

    const secIndex = db.sections.findIndex(s => s.id === 'portfolio')
    if (secIndex !== -1) {
      db.sections[secIndex].subtitle = subtitle
      db.sections[secIndex].title = title
      db.sections[secIndex].content = note
    }

    await writeDB(db)
    await addNotification('Memperbarui Header & Catatan Portfolio Section.', 'UPDATE')
    revalidatePath('/admin/portfolio')
    revalidatePath('/')
  }

  async function addPortfolioAction(formData: FormData) {
    'use server'
    const db = await readDB()
    if (!db.portfolios) db.portfolios = []

    const name = formData.get('name') as string
    const desc = formData.get('desc') as string
    const file = formData.get('photoFile') as File

    let imageUrl = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'

    if (file && file.size > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      const fileName = `port-${Date.now()}-${file.name.replace(/\s+/g, '_')}`
      const filePath = path.join(uploadDir, fileName)
      const buffer = Buffer.from(await file.arrayBuffer())
      fs.writeFileSync(filePath, buffer)
      imageUrl = `/uploads/${fileName}`
    }

    const newItem: PortfolioItem = {
      id: 'port-' + Date.now(),
      name,
      desc,
      imageUrl
    }

    db.portfolios.push(newItem)
    await writeDB(db)
    await addNotification(`Menambahkan portofolio klien: "${name}".`, 'CREATE')
    revalidatePath('/admin/portfolio')
    revalidatePath('/')
  }

  async function updatePortfolioAction(formData: FormData) {
    'use server'
    const db = await readDB()
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const desc = formData.get('desc') as string
    const file = formData.get('photoFile') as File

    const index = db.portfolios.findIndex(p => p.id === id)
    if (index !== -1) {
      db.portfolios[index].name = name
      db.portfolios[index].desc = desc

      if (file && file.size > 0) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        const fileName = `port-${Date.now()}-${file.name.replace(/\s+/g, '_')}`
        const filePath = path.join(uploadDir, fileName)
        const buffer = Buffer.from(await file.arrayBuffer())
        fs.writeFileSync(filePath, buffer)
        db.portfolios[index].imageUrl = `/uploads/${fileName}`
      }

      await writeDB(db)
      await addNotification(`Memperbarui portofolio: "${name}".`, 'UPDATE')
      revalidatePath('/admin/portfolio')
      revalidatePath('/')
    }
  }

  async function deletePortfolioAction(formData: FormData) {
    'use server'
    const db = await readDB()
    const id = formData.get('id') as string

    db.portfolios = db.portfolios.filter(p => p.id !== id)
    await writeDB(db)
    await addNotification('Menghapus item dari portofolio.', 'DELETE')
    revalidatePath('/admin/portfolio')
    revalidatePath('/')
  }

  return (
    <PortfolioClient
      portfolios={portfolios}
      portfolioHeader={portfolioHeader}
      portfolioSection={portfolioSection}
      saveHeaderAction={saveHeaderAction}
      addPortfolioAction={addPortfolioAction}
      updatePortfolioAction={updatePortfolioAction}
      deletePortfolioAction={deletePortfolioAction}
    />
  )
}