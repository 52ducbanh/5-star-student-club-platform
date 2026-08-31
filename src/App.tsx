import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { LoadingScreen } from './components/loading/LoadingScreen'
import { LoadingProvider, useLoading } from './context/LoadingContext'
import { HomePage } from './pages/HomePage'
import { JourneyPage } from './pages/JourneyPage'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { NotFoundPage } from './pages/NotFoundPage'

function MainContent() {
  const { isLoaded } = useLoading()
  const location = useLocation()

  return (
    <>
      {!isLoaded && <LoadingScreen />}
      <div aria-hidden={isLoaded ? undefined : true} inert={isLoaded ? undefined : true}>
        <AppShell>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/hanh-trinh-5-tot" element={<JourneyPage />} />
            <Route path="/hoat-dong" element={<ActivitiesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppShell>
      </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <LoadingProvider>
        <MainContent />
      </LoadingProvider>
    </BrowserRouter>
  )
}
