import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AppProvider } from './state/AppState'
import { ToastProvider } from './components/shared/Toast'
import { TourProvider } from './components/tour/TourProvider'
import { AppShell } from './components/app-shell/AppShell'
import { DetectPage } from './pages/DetectPage'
import { UnderstandPage } from './pages/UnderstandPage'
import { CampaignPage } from './pages/CampaignPage'
import { ResultsPage } from './pages/ResultsPage'
import { ChatPage } from './pages/ChatPage'
import { AudiencesPage, HomePage, InsightsPage, ProjectsPage, PurchaseMetricsPage, SignalFeedPage, StudiesPage } from './pages/SupportingPage'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          <TourProvider>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/signals/recall" element={<DetectPage />} />
                <Route path="/signals/recall/study" element={<UnderstandPage />} />
                <Route path="/signals/recall/campaign" element={<CampaignPage />} />
                <Route path="/signals/recall/results" element={<ResultsPage />} />
                <Route path="/signals" element={<SignalFeedPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/audiences" element={<AudiencesPage />} />
                <Route path="/studies" element={<StudiesPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/purchase-metrics" element={<PurchaseMetricsPage />} />
                <Route path="*" element={<Navigate to="/signals/recall" replace />} />
              </Route>
            </Routes>
          </TourProvider>
        </AppProvider>
      </ToastProvider>
      <Analytics />
    </BrowserRouter>
  )
}
