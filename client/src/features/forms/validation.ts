import { siteConfig } from '../../config/site'

export function isValidEmail(value: string) {
  const validSyntax = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value)
  if (!validSyntax) return false
  if (!siteConfig.emailDomain) return true
  return value.toLowerCase().endsWith(`@${siteConfig.emailDomain.toLowerCase().replace(/^@/, '')}`)
}

export function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return /^[+\d][\d\s().-]+$/.test(value) && digits.length >= 9 && digits.length <= 12
}

export function required(value: string) {
  return value.trim().length > 0
}
