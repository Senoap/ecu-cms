// lib/phone.ts
/**
 * Normalizes phone numbers to WhatsApp international format (e.g. 0812... -> 62812...)
 */
export function formatWhatsAppNumber(phone: string | undefined | null): string {
  if (!phone) return ''
  const digits = phone.replace(/[^0-9]/g, '')
  if (!digits) return ''
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1)
  }
  return digits
}
