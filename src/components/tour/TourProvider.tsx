import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../state/AppState'
import { tourSteps, type TourStep } from './tourSteps'
import { stages, type Stage } from '../app-shell/WorkflowStepper'

interface TourCtx {
  active: boolean
  index: number
  step: TourStep | null
  total: number
  busy: boolean
  start: (index?: number) => void
  startAtStage: (stage: Stage | null) => void
  next: () => void
  back: () => void
  skip: () => void
  welcomeOpen: boolean
  closeWelcome: () => void
  summaryOpen: boolean
  closeSummary: () => void
  overviewOpen: boolean
  setOverviewOpen: (v: boolean) => void
}

const Ctx = createContext<TourCtx | null>(null)
const WELCOME_KEY = 'pogo-recall-welcome-seen'

function shouldShowWelcome() {
  try { return sessionStorage.getItem(WELCOME_KEY) !== '1' } catch { return true }
}

export function TourProvider({ children }: { children: ReactNode }) {
  const app = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const appRef = useRef(app)
  const pathRef = useRef(location.pathname)
  appRef.current = app
  pathRef.current = location.pathname

  const [index, setIndex] = useState(-1)
  const [busy, setBusy] = useState(false)
  const indexRef = useRef(-1)
  const busyRef = useRef(false)
  const [welcomeOpen, setWelcomeOpen] = useState(() => shouldShowWelcome() && (location.pathname === '/' || location.pathname.startsWith('/signals/recall')))
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [overviewOpen, setOverviewOpen] = useState(false)

  const markSeen = () => { try { sessionStorage.setItem(WELCOME_KEY, '1') } catch { /* storage unavailable */ } }

  const goTo = useCallback(async (i: number, dir: 'forward' | 'back') => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    const prev = tourSteps[indexRef.current]
    prev?.exit?.(appRef.current, dir)
    const s = tourSteps[i]
    indexRef.current = i
    setIndex(i)
    s.enter?.(appRef.current)
    if (pathRef.current !== s.route) {
      if (dir === 'forward' && s.transition) await appRef.current.runTransition(s.transition, s.route)
      else navigate(s.route)
    }
    busyRef.current = false
    setBusy(false)
  }, [navigate])

  const end = useCallback(() => {
    const cur = tourSteps[indexRef.current]
    cur?.exit?.(appRef.current, 'forward')
    indexRef.current = -1
    setIndex(-1)
  }, [])

  const start = useCallback((i = 0) => {
    markSeen()
    setWelcomeOpen(false)
    setSummaryOpen(false)
    setOverviewOpen(false)
    if (indexRef.current >= 0) {
      tourSteps[indexRef.current]?.exit?.(appRef.current, 'back')
      indexRef.current = -1
    }
    if (i === 0) {
      const a = appRef.current
      a.setDrawerId(null)
      a.setStudyTab('summary')
      a.resetCampaign()
      a.unlaunch()
    }
    goTo(i, 'forward')
  }, [goTo])

  const startAtStage = useCallback((stage: Stage | null) => {
    const i = stage ? tourSteps.findIndex((s) => s.stage === stage) : 0
    start(Math.max(0, i))
  }, [start])

  const next = useCallback(() => {
    if (busyRef.current || indexRef.current < 0) return
    if (indexRef.current >= tourSteps.length - 1) {
      end()
      setSummaryOpen(true)
      return
    }
    goTo(indexRef.current + 1, 'forward')
  }, [goTo, end])

  const back = useCallback(() => {
    if (busyRef.current || indexRef.current <= 0) return
    goTo(indexRef.current - 1, 'back')
  }, [goTo])

  // If the user navigates elsewhere mid-tour (e.g. browser back), the overlay simply waits for the target;
  // leaving the Recall workflow entirely ends the tour.
  useEffect(() => {
    if (indexRef.current >= 0 && !busyRef.current && !location.pathname.startsWith('/signals/recall')) end()
  }, [location.pathname, end])

  const value: TourCtx = {
    active: index >= 0,
    index,
    step: index >= 0 ? tourSteps[index] : null,
    total: tourSteps.length,
    busy,
    start,
    startAtStage,
    next,
    back,
    skip: end,
    welcomeOpen,
    closeWelcome: () => { markSeen(); setWelcomeOpen(false) },
    summaryOpen,
    closeSummary: () => setSummaryOpen(false),
    overviewOpen,
    setOverviewOpen,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTour() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useTour outside TourProvider')
  return v
}

export function stageForPath(path: string): Stage | null {
  const match = [...stages].reverse().find((s) => path.startsWith(s.path))
  return match?.id ?? null
}
