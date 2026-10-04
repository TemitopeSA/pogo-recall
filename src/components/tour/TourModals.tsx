import { ArrowRight, CircleHelp, Compass, Play, RotateCcw } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Modal } from '../shared/Modal'
import { Button, PogoMark, Menu } from '../shared/ui'
import { stageForPath, useTour } from './TourProvider'
import { tourSteps } from './tourSteps'
import { stageLabel, stages } from '../app-shell/WorkflowStepper'
import { funnel, results, segments, study } from '../../data/mockData'

export function WelcomeModal() {
  const tour = useTour()
  return (
    <Modal open={tour.welcomeOpen} onClose={tour.closeWelcome} labelledBy="welcome-title" width="max-w-[440px]">
      <div className="px-8 pb-7 pt-9 text-center">
        <PogoMark size={40} className="mx-auto" />
        <div className="mt-5 text-[11px] font-medium uppercase tracking-[0.08em] text-brand">New in Signals</div>
        <h1 id="welcome-title" className="mt-1.5 text-[24px] font-semibold tracking-tight">Pogo Recall</h1>
        <p className="mx-auto mt-2 max-w-[320px] text-[14px] leading-relaxed text-muted">From why they left to proof they came back, in one workflow.</p>
        <ol className="mx-auto mt-6 grid max-w-[340px] grid-cols-4 gap-1 text-[11px] text-muted">
          {stages.map((s) => (
            <li key={s.id} className="rounded-lg border border-line px-1 py-2">
              <div className="num text-[10px] text-faint">{s.num}</div>
              <div className="mt-0.5 font-medium text-ink">{s.label}</div>
            </li>
          ))}
        </ol>
        <div className="mt-7 flex flex-col gap-2">
          <Button variant="primary" className="h-10 w-full text-[14px]" onClick={() => tour.start(0)} data-autofocus>
            <Play size={15} /> Start guided tour
          </Button>
          <Button variant="ghost" className="h-10 w-full text-[14px]" onClick={tour.closeWelcome}>Explore on my own</Button>
        </div>
        <p className="mt-4 text-[11px] text-faint">Concept prototype. Fictional brand and mock data.</p>
      </div>
    </Modal>
  )
}

export function SummaryModal() {
  const tour = useTour()
  const metrics = [
    { value: funnel.switched.toLocaleString(), label: 'Switched to competitors' },
    { value: String(study.interviews), label: `Interviewed in ${study.hours} hours` },
    { value: String(segments[0].count), label: 'Offered a path back' },
    { value: String(results.returned), label: `Returned · ${results.roi}x ROI` },
  ]
  return (
    <Modal open={tour.summaryOpen} onClose={tour.closeSummary} labelledBy="summary-title" width="max-w-[720px]">
      <div className="px-8 pb-7 pt-9 text-center">
        <PogoMark size={32} className="mx-auto" />
        <h1 id="summary-title" className="mt-4 text-[22px] font-semibold tracking-tight">From lost customer to verified return.</h1>
        <ol className="mt-7 flex flex-wrap items-stretch justify-center gap-2">
          {metrics.map((m, i) => (
            <li key={m.label} className="flex items-center gap-2">
              <div className="animate-rise-in w-[118px] rounded-xl border border-line px-3 py-4" style={{ animationDelay: `${i * 120}ms` }}>
                <div className={`num text-[26px] font-medium leading-none ${i === 3 ? 'text-brand' : ''}`}>{m.value}</div>
                <div className="mt-2 text-[12px] leading-snug text-muted">{m.label}</div>
              </div>
              {i < metrics.length - 1 && <ArrowRight size={16} className="text-faint" aria-hidden />}
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-7 max-w-[460px] text-[14px] leading-relaxed">
          Only Pogo can do this: we see the purchase, ask the why, and verify the return.
        </p>
        <p className="mt-2 text-[11px] text-faint">ROI is a modeled annualized estimate. All figures are fictional mock data.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => tour.start(0)}><RotateCcw size={14} /> Replay tour</Button>
          <Button variant="primary" onClick={tour.closeSummary} data-autofocus>Explore freely</Button>
        </div>
      </div>
    </Modal>
  )
}

export function OverviewModal() {
  const tour = useTour()
  return (
    <Modal open={tour.overviewOpen} onClose={() => tour.setOverviewOpen(false)} labelledBy="overview-title" width="max-w-[520px]">
      <div className="p-6">
        <h1 id="overview-title" className="text-[16px] font-semibold">Tour overview</h1>
        <p className="mt-1 text-[13px] text-muted">Eleven steps across the Recall workflow. Jump to any step.</p>
        <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {stages.map((s) => (
            <div key={s.id}>
              <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-faint"><span className="num">{s.num}</span> {s.label}</div>
              <ul className="mt-1.5 space-y-1">
                {tourSteps.map((t, i) => t.stage === s.id && (
                  <li key={t.id}>
                    <button onClick={() => tour.start(i)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-canvas">
                      <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-[11px] text-muted">{i + 1}</span>
                      <span className="text-[13px]">{t.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export function HelpButton() {
  const tour = useTour()
  const { pathname } = useLocation()
  const stage = stageForPath(pathname)
  if (tour.active) return null
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Menu
        align="right"
        up
        trigger={({ toggle, open }) => (
          <button onClick={toggle} aria-label="Help and guided tour" aria-expanded={open} className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:bg-canvas">
            <CircleHelp size={18} />
          </button>
        )}
        items={[
          { label: stage ? `Start guided tour (${stageLabel(stage)})` : 'Start guided tour', icon: <Play size={14} />, onSelect: () => tour.startAtStage(stage) },
          { label: 'Replay tour from start', icon: <RotateCcw size={14} />, onSelect: () => tour.start(0) },
          { label: 'Tour overview', icon: <Compass size={14} />, onSelect: () => tour.setOverviewOpen(true) },
        ]}
      />
    </div>
  )
}
