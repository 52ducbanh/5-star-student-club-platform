import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { LoadingScreen } from '@/app/loading/LoadingScreen'
import { useLoading } from '@/app/providers/LoadingProvider'
import { GameShell } from '@/app/shells/GameShell'
import { MarketingShell } from '@/app/shells/MarketingShell'
import { ActivitiesPage } from '@/features/activities/pages/ActivitiesPage'
import { JourneyPage } from '@/features/journey/pages/JourneyPage'
import { HomePage } from '@/marketing/pages/HomePage'
import { NotFoundPage } from './NotFoundPage'

const StarprintPage = lazy(() => import('@/features/starprint/pages/StarprintPage'))
const StarprintResultPage = lazy(() => import('@/features/starprint/pages/StarprintResultPage'))
const SkyPage = lazy(() => import('@/features/starprint/pages/SkyPage'))

function GameRouteFallback({ label }: { label: string }) {
  return (
    <div className="game-loading">
      <p>{label}</p>
    </div>
  )
}

export function AppRoutes() {
  const { isLoaded } = useLoading()
  const location = useLocation()
  const isGameRoute =
    location.pathname.startsWith('/starprint') ||
    location.pathname.startsWith('/sky') ||
    location.pathname.startsWith('/star')

  return (
    <>
      {!isLoaded && !isGameRoute && <LoadingScreen />}
      <div
        aria-hidden={!isLoaded && !isGameRoute ? true : undefined}
        inert={!isLoaded && !isGameRoute ? true : undefined}
      >
        <Routes location={location}>
          <Route element={<GameShell />}>
            <Route
              path="/starprint"
              element={
                <Suspense fallback={<GameRouteFallback label="Đang tải STARPRINT..." />}>
                  <StarprintPage />
                </Suspense>
              }
            />
            <Route
              path="/starprint/result/:id"
              element={
                <Suspense fallback={<GameRouteFallback label="Đang tải kết quả..." />}>
                  <StarprintResultPage />
                </Suspense>
              }
            />
            <Route
              path="/star/:id"
              element={
                <Suspense fallback={<GameRouteFallback label="Đang tải kết quả..." />}>
                  <StarprintResultPage readOnly={true} />
                </Suspense>
              }
            />
            <Route
              path="/sky"
              element={
                <Suspense fallback={<GameRouteFallback label="Đang tải 5SS Sky..." />}>
                  <SkyPage />
                </Suspense>
              }
            />
          </Route>

          <Route element={<MarketingShell />}>
            <Route index element={<HomePage />} />
            <Route path="/hanh-trinh-5-tot" element={<JourneyPage />} />
            <Route path="/hoat-dong" element={<ActivitiesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </div>
    </>
  )
}
