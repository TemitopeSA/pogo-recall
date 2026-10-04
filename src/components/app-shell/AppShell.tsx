import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TransitionOverlay } from './TransitionOverlay'
import { TourOverlay } from '../tour/TourOverlay'
import { HelpButton, OverviewModal, SummaryModal, WelcomeModal } from '../tour/TourModals'

export function AppShell() {
  const { pathname } = useLocation()
  useEffect(() => { document.getElementById('main-scroll')?.scrollTo({ top: 0 }) }, [pathname])
  return (
    <div className="flex h-full overflow-hidden bg-canvas">
      <Sidebar />
      <div className="relative min-w-0 flex-1">
        <main id="main-scroll" className="h-full overflow-y-auto overflow-x-hidden">
          <div className="flex min-h-full flex-col">
            <div className="flex-1">
              <Outlet />
            </div>
            <footer className="px-8 pb-6 pt-10 text-[11px] text-faint">Concept prototype. Mock data.</footer>
          </div>
        </main>
        <TransitionOverlay />
      </div>
      <HelpButton />
      <TourOverlay />
      <WelcomeModal />
      <SummaryModal />
      <OverviewModal />
    </div>
  )
}
