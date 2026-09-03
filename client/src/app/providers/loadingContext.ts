import { createContext, useContext } from 'react'

export interface LoadingContextType {
  isLoaded: boolean
  isExiting: boolean
  startHeroReveal: () => void
  completeLoading: () => void
}

export const LoadingContext = createContext<LoadingContextType>({
  isLoaded: false,
  isExiting: false,
  startHeroReveal: () => {},
  completeLoading: () => {},
})

export function useLoading(): LoadingContextType {
  return useContext(LoadingContext)
}
