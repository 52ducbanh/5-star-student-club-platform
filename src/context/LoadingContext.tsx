import { createContext, useContext, useState, type ReactNode } from 'react'

interface LoadingContextType {
  isLoaded: boolean
  isExiting: boolean
  startHeroReveal: () => void
  completeLoading: () => void
}

const LoadingContext = createContext<LoadingContextType>({
  isLoaded: false,
  isExiting: false,
  startHeroReveal: () => {},
  completeLoading: () => {},
})

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

export function useLoading() {
  return useContext(LoadingContext)
}
