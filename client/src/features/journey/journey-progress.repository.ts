import { journeyStorageKey } from './data/journey'

type JourneyProgress = Record<string, boolean>

export interface IJourneyProgressRepository {
  load(): JourneyProgress
  save(progress: JourneyProgress): void
  clear(): void
}

export class LocalStorageJourneyProgressRepository implements IJourneyProgressRepository {
  load(): JourneyProgress {
    try {
      const raw = localStorage.getItem(journeyStorageKey)
      if (!raw) return {}
      const parsed = JSON.parse(raw) as unknown
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as JourneyProgress)
        : {}
    } catch { return {} }
  }
  save(progress: JourneyProgress): void {
    try { localStorage.setItem(journeyStorageKey, JSON.stringify(progress)) } catch { /* noop */ }
  }
  clear(): void {
    try { localStorage.removeItem(journeyStorageKey) } catch { /* noop */ }
  }
}

export const journeyProgressRepository: IJourneyProgressRepository =
  new LocalStorageJourneyProgressRepository()
