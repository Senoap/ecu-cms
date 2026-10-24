// lib/supabaseAdmin.ts
// Klien Supabase sisi server (service role). JANGAN diimpor dari komponen client.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient | null {
  if (client) return client
  const url = process.env.SUPABASE_REST_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return null
  }
  try {
    client = createClient(url, key, { auth: { persistSession: false } })
    return client
  } catch {
    return null
  }
}
