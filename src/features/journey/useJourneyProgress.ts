import { useCallback, useEffect, useMemo, useState } from 'react'
import { journeyCriteria, journeyStorageKey } from '../../data/journey'

type ProgressState = Record<string, boolean>

function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(journeyStorageKey)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function useJourneyProgress() {
  const [progress, setProgress] = useState<ProgressState>(loadProgress)

  useEffect(() => {
    try {
      localStorage.setItem(journeyStorageKey, JSON.stringify(progress))
    } catch {
      // The experience remains usable when browser storage is unavailable.
    }
  }, [progress])

  const toggleItem = useCallback((id: string) => {
    setProgress((current) => ({ ...current, [id]: !current[id] }))
  }, [])

  const resetProgress = useCallback(() => setProgress({}), [])

  const allItems = useMemo(() => journeyCriteria.flatMap((criterion) => criterion.checklist), [])
  const completedCount = allItems.filter((item) => progress[item.id]).length
  const percent = Math.round((completedCount / allItems.length) * 100)

  return { progress, toggleItem, resetProgress, completedCount, totalCount: allItems.length, percent }
}
