// app/admin/users/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth'
import { readDB, writeDB, addNotification, type CmsUser } from '@/lib/db'
import { hashPassword } from '@/lib/password'

export async function createUserAction(formData: FormData) {
  await requirePermission('users')

  const username = String(formData.get('username') ?? '').trim().toLowerCase()
  const name = String(formData.get('name') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const role = String(formData.get('role') ?? '').trim() || 'Staff'
  const canReceiveCareerNotif = formData.get('canReceiveCareerNotif') === 'on' || formData.get('canReceiveCareerNotif') === 'true'
  const isActive = formData.get('isActive') !== 'false'

  // Ambil semua permission yang dicentang
  const permissions: string[] = []
  for (const [key, val] of formData.entries()) {
    if (key.startsWith('perm_') && (val === 'on' || val === 'true')) {
      permissions.push(key.replace('perm_', ''))
    }
  }

  if (!username || username.length < 3) {
    throw new Error('Username minimal 3 karakter.')
  }
  if (!name) {
    throw new Error('Nama pengguna wajib diisi.')
  }
  if (!password || password.length < 5) {
    throw new Error('Password minimal 5 karakter.')
  }

  const db = await readDB()
  if (!db.cmsUsers) db.cmsUsers = []

  // Cegah duplikasi username
  if (db.cmsUsers.some((u) => u.username.toLowerCase() === username) || username === 'admin') {
    throw new Error(`Username "${username}" sudah digunakan. Silakan gunakan username lain.`)
  }

  const newUser: CmsUser = {
    id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    username,
    passwordHash: hashPassword(password),
    name,
    role,
    permissions,
    canReceiveCareerNotif,
    isActive,
    createdAt: Date.now(),
  }

  db.cmsUsers.push(newUser)
  await writeDB(db)
  await addNotification(`Menambahkan pengguna CMS baru: "${name}" (@${username}) dengan role "${role}".`, 'CREATE')

  revalidatePath('/admin/users')
  revalidatePath('/admin', 'layout')
}

export async function updateUserAction(formData: FormData) {
  await requirePermission('users')

  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const role = String(formData.get('role') ?? '').trim() || 'Staff'
  const canReceiveCareerNotif = formData.get('canReceiveCareerNotif') === 'on' || formData.get('canReceiveCareerNotif') === 'true'
  const isActive = formData.get('isActive') !== 'false'

  const permissions: string[] = []
  for (const [key, val] of formData.entries()) {
    if (key.startsWith('perm_') && (val === 'on' || val === 'true')) {
      permissions.push(key.replace('perm_', ''))
    }
  }

  const db = await readDB()
  if (!db.cmsUsers) db.cmsUsers = []

  const index = db.cmsUsers.findIndex((u) => u.id === id)
  if (index === -1) {
    throw new Error('Pengguna tidak ditemukan.')
  }

  const existing = db.cmsUsers[index]
  const updatedUser: CmsUser = {
    ...existing,
    name: name || existing.name,
    role: role || existing.role,
    permissions,
    canReceiveCareerNotif,
    isActive,
  }

  if (password && password.trim().length >= 5) {
    updatedUser.passwordHash = hashPassword(password.trim())
  }

  db.cmsUsers[index] = updatedUser
  await writeDB(db)
  await addNotification(`Memperbarui data pengguna CMS: "${updatedUser.name}".`, 'UPDATE')

  revalidatePath('/admin/users')
  revalidatePath('/admin', 'layout')
}

export async function deleteUserAction(formData: FormData) {
  await requirePermission('users')

  const id = String(formData.get('id') ?? '')
  if (!id) return

  const db = await readDB()
  if (!db.cmsUsers) return

  const target = db.cmsUsers.find((u) => u.id === id)
  db.cmsUsers = db.cmsUsers.filter((u) => u.id !== id)

  await writeDB(db)
  await addNotification(`Menghapus pengguna CMS: "${target?.name || id}".`, 'DELETE')

  revalidatePath('/admin/users')
  revalidatePath('/admin', 'layout')
}

export async function toggleUserStatusAction(formData: FormData) {
  await requirePermission('users')

  const id = String(formData.get('id') ?? '')
  const db = await readDB()
  if (!db.cmsUsers) return

  const user = db.cmsUsers.find((u) => u.id === id)
  if (user) {
    user.isActive = !user.isActive
    await writeDB(db)
    await addNotification(`Mengubah status pengguna "${user.name}" menjadi ${user.isActive ? 'Aktif' : 'Non-aktif'}.`, 'UPDATE')
    revalidatePath('/admin/users')
    revalidatePath('/admin', 'layout')
  }
}
