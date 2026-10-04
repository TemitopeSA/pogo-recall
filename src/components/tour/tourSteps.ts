import type { Stage } from '../app-shell/WorkflowStepper'
import { routes, type TransitionState } from '../../state/AppState'
import { defaultCampaign, isValid, validate, type CampaignConfig } from '../../data/campaignModel'
import type { useApp } from '../../state/AppState'

type App = ReturnType<typeof useApp>
export type Placement = 'right' | 'left' | 'top' | 'bottom'

export interface TourStep {
  id: string
  stage: Stage
  title: string
  body: string
  target: string
  route: string
  placement: Placement
  /** How to scroll the target into view; defaults to centering it. */
  scrollBlock?: ScrollLogicalPosition
  /** Played only when moving forward into this step from a different screen. */
  transition?: TransitionState
  enter?: (app: App) => void
  exit?: (app: App, dir: 'forward' | 'back') => void
}

export const tourSteps: TourStep[] = [
  {
    id: 'verified-buyers', stage: 'detect', route: routes.detect, target: 'kpi-verified', placement: 'bottom',
    title: 'Start with real purchase behavior.',
    body: 'These are verified buyers, backed by purchase evidence rather than survey claims. Pogo starts with what people actually bought.',
  },
  {
    id: 'competitor-switching', stage: 'detect', route: routes.detect, target: 'competitor-chart', placement: 'right',
    title: 'See exactly where customers went.',
    body: '1,904 buyers switched to competitors. Northstar Bars captured the largest share, giving Ridgeline a concrete recovery opportunity.',
  },
  {
    id: 'lapse-trend', stage: 'detect', route: routes.detect, target: 'lapse-trend', placement: 'left',
    title: 'Find the signal behind the lapse.',
    body: 'Lapses rose after the price increase. The timing raises a question; interviews help uncover what actually drove the change.',
  },
  {
    id: 'research-speed', stage: 'understand', route: routes.understand, target: 'study-header', placement: 'bottom',
    title: 'Ask 250 buyers why they left.',
    body: 'Pogo runs AI-moderated interviews with verified lapsed buyers and delivers the completed study in six hours.',
    transition: { kind: 'loading', label: 'Preparing research view', sub: 'Interviewing 250 verified lapsed buyers' },
    enter: (app) => { app.setDrawerId(null); app.setStudyTab('summary') },
  },
  {
    id: 'key-finding', stage: 'understand', route: routes.understand, target: 'study-insight', placement: 'right',
    title: 'Price is the biggest opportunity.',
    body: "Price leads the switching reasons at 38%. Among price-driven switchers, 62% say they'd return at $2.79 or less.",
    enter: (app) => { app.setDrawerId(null); app.setStudyTab('summary') },
  },
  {
    id: 'respondent', stage: 'understand', route: routes.understand, target: 'drawer-transcript', placement: 'left',
    title: 'Hear it from the customer.',
    body: 'Move beyond percentages. Open a real-feeling interview transcript to see the language behind the decision.',
    enter: (app) => { app.setStudyTab('responses'); app.setDrawerId('tasha') },
    exit: (app) => { app.setDrawerId(null); app.setStudyTab('summary') },
  },
  {
    id: 'segments', stage: 'winback', route: routes.campaign, target: 'segment-selector', placement: 'right',
    title: 'Turn research into action.',
    body: 'Pogo translates reasons for switching into actionable audiences. Start with 724 price-sensitive switchers, or choose a different segment.',
    transition: { kind: 'loading', label: 'Building campaign from research', sub: 'Turning switching reasons into audiences' },
    enter: (app) => { if (!app.launched) app.resetCampaign() },
  },
  {
    id: 'offer', stage: 'winback', route: routes.campaign, target: 'offer-config', placement: 'right',
    title: 'Make the offer measurable.',
    body: 'Choose a relevant incentive and reserve a randomized holdout. That comparison helps distinguish incremental recovery from customers who would have returned anyway.',
    enter: (app) => app.setCampaign((c) => (isValid(validate(c)) && c.holdoutEnabled ? c : { ...c, holdoutEnabled: true, holdoutPct: defaultCampaign.holdoutPct })),
  },
  {
    id: 'consumer', stage: 'winback', route: routes.campaign, target: 'phone-preview', placement: 'left',
    title: 'Show the buyer a clear reason to return.',
    body: 'The offer appears inside the Pogo consumer app. The buyer can activate it, see the reward, and understand when it expires.',
  },
  {
    id: 'results', stage: 'prove', route: routes.results, target: 'results-overview', placement: 'bottom', scrollBlock: 'start',
    title: 'Prove the return.',
    body: 'Thirty days later, 193 of 724 offered buyers returned. The observed return rate was 26.7%, compared with 6.2% in the holdout group.',
    transition: { kind: 'days', label: '30 days later', sub: 'Collecting receipt-verified purchases' },
    enter: (app) => {
      const config: CampaignConfig = isValid(validate(app.campaign)) ? app.campaign : defaultCampaign
      if (!app.launched) app.launch(config)
    },
    exit: (app, dir) => { if (dir === 'back') app.unlaunch() },
  },
  {
    id: 'next-action', stage: 'prove', route: routes.results, target: 'agent-panel', placement: 'left',
    title: 'Find the next growth opportunity.',
    body: 'Pogo connects the outcome to the next experiment. Target out-of-stock lapsers only after confirming that the product is available where they shop.',
    enter: (app) => { if (!app.launched) app.launch(defaultCampaign) },
  },
]
