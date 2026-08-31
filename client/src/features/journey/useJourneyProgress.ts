import { useCallback, useMemo, useState } from 'react'
import { journeyCriteria } from './data/journey'
import { journeyProgressRepository } from './journey-progress.repository'

type ProgressState = Record<string, boolean>

export function useJourneyProgress() {
  const [progress, setProgress] = useState<ProgressState>(() => journeyProgressRepository.load())

  const updateProgress = useCallback((next: ProgressState) => {
    setProgress(next)
    journeyProgressRepository.save(next)
  }, [])

  const toggleItem = useCallback((id: string) => {
    setProgress((current) => {
      const next = { ...current, [id]: !current[id] }
      journeyProgressRepository.save(next)
      return next
    })
  }, [])

  const resetProgress = useCallback(() => {
    journeyProgressRepository.clear()
    setProgress({})
  }, [])

  const allItems = useMemo(() => journeyCriteria.flatMap((c) => c.checklist), [])
  const completedCount = allItems.filter((item) => progress[item.id]).length
  const percent = Math.round((completedCount / allItems.length) * 100)

  return { progress, toggleItem, resetProgress, completedCount, totalCount: allItems.length, percent, updateProgress }
}
