// lib/applications.ts
import { getAdminClient } from './supabaseAdmin'

export type ApplicationStatus = 'new' | 'reviewed' | 'interview' | 'accepted' | 'rejected'
export const APPLICATION_STATUSES: ApplicationStatus[] = ['new', 'reviewed', 'interview', 'accepted', 'rejected']

export interface Application {
  id: string
  ref_code: string
  career_id: string
  career_title: string
  name: string
  phone: string
  email: string
  education: string | null
  cover_note: string | null
  cv_path: string
  status: ApplicationStatus
  created_at: string
}

export async function listApplications(): Promise<Application[]> {
  const { data, error } = await getAdminClient()
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) throw new Error(error.message)
  return (data || []) as Application[]
}

export async function countNewApplications(): Promise<number> {
  try {
    const { count } = await getAdminClient()
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new')
    return count || 0
  } catch {
    return 0
  }
}

// ---- Pengaturan aplikasi (key/value), mis. email HR. Tidak perlu "deploy" draft. ----
export async function getAppSetting(key: string): Promise<string> {
  try {
    const { data } = await getAdminClient().from('app_settings').select('value').eq('key', key).maybeSingle()
    return (data?.value as string) || ''
  } catch {
    return ''
  }
}

export async function setAppSetting(key: string, value: string): Promise<void> {
  const { error } = await getAdminClient().from('app_settings').upsert({ key, value })
  if (error) throw new Error(error.message)
}

export const HR_EMAIL_KEY = 'hr_email'
