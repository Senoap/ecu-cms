// lib/audit.ts
// Server-side audit helper yang mengaitkan user yang sedang login dengan catatan audit log
import { getCurrentUser } from './auth'
import { addNotification as addDbNotification, deployDB as deployDbBase } from './db'

export async function addAuditNotification(
  message: string,
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'DEPLOY' | 'CAREER',
  category: 'system' | 'career' = 'system'
) {
  let userInfo: { userName?: string; userEmail?: string; userRole?: string } | undefined
  try {
    const user = await getCurrentUser()
    if (user) {
      userInfo = {
        userName: user.name,
        userEmail: user.username,
        userRole: user.role
      }
    }
  } catch {
    // Abaikan jika dipanggil di luar konteks request / cookies
  }
  return addDbNotification(message, type, category, userInfo)
}

export async function deployWithAudit() {
  let userInfo: { userName?: string; userEmail?: string; userRole?: string } | undefined
  try {
    const user = await getCurrentUser()
    if (user) {
      userInfo = {
        userName: user.name,
        userEmail: user.username,
        userRole: user.role
      }
    }
  } catch {
    // Abaikan jika dipanggil di luar konteks request / cookies
  }
  return deployDbBase(userInfo)
}
