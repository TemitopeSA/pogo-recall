import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { defaultCampaign, type CampaignConfig } from '../data/campaignModel'
import { respond, msgId, type ChatMessage } from '../data/agent'
import { prefersReducedMotion, wait } from '../lib/util'

export type StudyTab = 'summary' | 'report' | 'responses' | 'settings'
export type TransitionKind = 'loading' | 'days'

export interface TransitionState {
  kind: TransitionKind
  label: string
  sub?: string
}

export const routes = {
  detect: '/signals/recall',
  understand: '/signals/recall/study',
  campaign: '/signals/recall/campaign',
  results: '/signals/recall/results',
  chat: '/chat',
} as const

const resultsQuestion = 'Which segment should we target next?'

interface AppState {
  sidebarExpanded: boolean
  setSidebarExpanded: (v: boolean) => void
  studyTab: StudyTab
  setStudyTab: (t: StudyTab) => void
  drawerId: string | null
  setDrawerId: (id: string | null) => void
  campaign: CampaignConfig
  setCampaign: (fn: (c: CampaignConfig) => CampaignConfig) => void
  resetCampaign: () => void
  showErrors: boolean
  setShowErrors: (v: boolean) => void
  launched: boolean
  launchedConfig: CampaignConfig | null
  launch: (config?: CampaignConfig) => void
  unlaunch: () => void
  transition: TransitionState | null
  runTransition: (t: TransitionState, to: string, ms?: number) => Promise<void>
  focusCompetitor: number
  setFocusCompetitor: (v: number) => void
  chat: ChatMessage[]
  setChat: (fn: (m: ChatMessage[]) => ChatMessage[]) => void
  resultsThread: ChatMessage[]
  setResultsThread: (fn: (m: ChatMessage[]) => ChatMessage[]) => void
}

const Ctx = createContext<AppState | null>(null)

const seededChat: ChatMessage[] = (() => {
  const q = 'Summarize Ridgeline’s verified buyer base'
  return [
    { id: 'seed-u', role: 'user', text: q },
    { id: 'seed-a', role: 'assistant', text: '', answer: respond(q) },
  ]
})()

const seededResults: ChatMessage[] = [
  { id: 'res-u', role: 'user', text: resultsQuestion },
  { id: 'res-a', role: 'assistant', text: '', answer: respond(resultsQuestion) },
]

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [studyTab, setStudyTab] = useState<StudyTab>('summary')
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [campaign, setCampaignState] = useState<CampaignConfig>(defaultCampaign)
  const [showErrors, setShowErrors] = useState(false)
  const [launched, setLaunched] = useState(false)
  const [launchedConfig, setLaunchedConfig] = useState<CampaignConfig | null>(null)
  const [transition, setTransition] = useState<TransitionState | null>(null)
  const [focusCompetitor, setFocusCompetitor] = useState(0)
  const [chat, setChatState] = useState<ChatMessage[]>(seededChat)
  const [resultsThread, setResultsState] = useState<ChatMessage[]>(seededResults)
  const transitionSeq = useRef(0)

  const setCampaign = useCallback((fn: (c: CampaignConfig) => CampaignConfig) => setCampaignState(fn), [])
  const resetCampaign = useCallback(() => {
    setCampaignState(defaultCampaign)
    setShowErrors(false)
  }, [])
  const launch = useCallback((config?: CampaignConfig) => {
    setLaunched(true)
    setLaunchedConfig(config ?? defaultCampaign)
  }, [])
  const unlaunch = useCallback(() => {
    setLaunched(false)
    setLaunchedConfig(null)
  }, [])

  const runTransition = useCallback(
    async (t: TransitionState, to: string, ms?: number) => {
      const id = ++transitionSeq.current
      const duration = prefersReducedMotion() ? 250 : (ms ?? (t.kind === 'days' ? 1500 : 650))
      setTransition(t)
      navigate(to)
      await wait(duration)
      if (transitionSeq.current === id) setTransition(null)
    },
    [navigate],
  )

  const value = useMemo<AppState>(
    () => ({
      sidebarExpanded, setSidebarExpanded,
      studyTab, setStudyTab,
      drawerId, setDrawerId,
      campaign, setCampaign, resetCampaign,
      showErrors, setShowErrors,
      launched, launchedConfig, launch, unlaunch,
      transition, runTransition,
      focusCompetitor, setFocusCompetitor,
      chat, setChat: (fn) => setChatState(fn),
      resultsThread, setResultsThread: (fn) => setResultsState(fn),
    }),
    [sidebarExpanded, studyTab, drawerId, campaign, setCampaign, resetCampaign, showErrors, launched, launchedConfig, launch, unlaunch, transition, runTransition, focusCompetitor, chat, resultsThread],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside AppProvider')
  return v
}

export { msgId }
