import type { StateStorage } from 'zustand/middleware'

// Keep the game usable when browser storage is disabled or its quota is reached.
const memory = new Map<string, string>()
export const gameSessionStorage: StateStorage = {
  getItem(name) {
    if (memory.has(name)) return memory.get(name)!
    try { return sessionStorage.getItem(name) } catch { return null }
  },
  setItem(name, value) {
    memory.set(name, value)
    try { sessionStorage.setItem(name, value) } catch {
      // Persist progress without the portrait when the image exceeds the quota.
      try {
        const entry = JSON.parse(value)
        entry.state.photoPreviewUrl = null
        sessionStorage.setItem(name, JSON.stringify(entry))
      } catch { /* memory remains available for this page */ }
    }
  },
  removeItem(name) {
    memory.delete(name)
    try { sessionStorage.removeItem(name) } catch { /* unavailable */ }
  },
}

export function isLocalPortrait(value: unknown): value is string {
  return typeof value === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(value)
}
