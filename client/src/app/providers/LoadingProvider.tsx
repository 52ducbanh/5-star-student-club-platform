import { useState, type ReactNode } from 'react'
import { LoadingContext } from './loadingContext'

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isExiting, setIsExiting] = useState(false)
  // A full page load, including F5, always replays the short cinematic intro.
  const [isLoaded, setIsLoaded] = useState(false)

  const startHeroReveal = () => {
    setIsExiting(true)
  }

  const completeLoading = () => {
    setIsLoaded(true)
  }

  return (
    <LoadingContext.Provider
      value={{
        isLoaded,
        isExiting,
        startHeroReveal,
        completeLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}
