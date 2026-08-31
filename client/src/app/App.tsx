import { BrowserRouter } from 'react-router-dom'
import { LoadingProvider } from '@/app/providers/LoadingProvider'
import { AppRoutes } from '@/app/routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <LoadingProvider>
        <AppRoutes />
      </LoadingProvider>
    </BrowserRouter>
  )
}
