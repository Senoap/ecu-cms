// app/admin/login/actions.ts
'use server'

import { cookies } from 'next/headers'

export async function loginAdmin(formData: FormData) {
  const password = formData.get('password') as string
  const secretPassword = process.env.ADMIN_PASSWORD
  if (!secretPassword || password !== secretPassword) {
    return { success: false, message: 'Konfigurasi server salah atau password keliru.' }
  }

  if (password === secretPassword) {
    const cookieStore = await cookies()
    cookieStore.set('esu_admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 jam
      path: '/',
    })
    return { success: true }
  }

  return { success: false, message: 'Password salah, silakan coba lagi.' }
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete('esu_admin_session')
  return { success: true }
}