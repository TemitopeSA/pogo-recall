import { useEffect, useRef, useState } from 'react'
import { ChevronRight, Pause, Play, X } from 'lucide-react'
import { respondentById, transcriptFor, type Respondent } from '../../data/respondents'
import { reasonByKey } from '../../data/mockData'
import { useApp } from '../../state/AppState'
import { useTour } from '../tour/TourProvider'
import { Avatar, PogoMark } from '../shared/ui'
import { ReasonTag } from './RespondentCard'
import { cx } from '../../lib/util'

export function ThoughtRow({ seconds, steps, label }: { seconds: number; steps: string[]; label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="text-[12px]">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="inline-flex items-center gap-1 rounded-md text-muted hover:text-ink">
        <ChevronRight size={13} className={cx('transition-transform duration-150', open && 'rotate-90')} />
        {label ?? `Thought for ${seconds} seconds`}
      </button>
      {open && (
        <ol className="animate-fade-in mt-2 space-y-1.5 border-l border-line pl-3 text-muted">
          {steps.map((s, i) => <li key={i}><span className="num mr-1.5 text-faint">{i + 1}.</span>{s}</li>)}
        </ol>
      )}
    </div>
  )
}

function parseTime(t: string) { const [m, s] = t.split(':').map(Number); return m * 60 + s }
function fmtTime(s: number) { return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` }

function Video({ r }: { r: Respondent }) {
  const total = parseTime(r.duration)
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(51)
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setPos((p) => Math.min(total, p + 1)), 1000)
    return () => clearInterval(id)
  }, [playing, total])
  useEffect(() => { if (pos >= total) setPlaying(false) }, [pos, total])
  useEffect(() => { setPlaying(false); setPos(51) }, [r.id])
  const thumbs = [0.08, 0.27, 0.5, 0.71, 0.9]
  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#26232D]">
        {/* CSS-built interview still */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[#1D1B22]" />
        <div className="absolute left-[8%] top-[14%] h-[38%] w-[22%] rounded-md bg-[#3A3644]" />
        <div className="absolute bottom-0 left-1/2 h-[46%] w-[46%] -translate-x-1/2 rounded-t-[999px] bg-[#4A4458]" />
        <div className="absolute left-1/2 top-[22%] h-[30%] w-[19%] -translate-x-1/2 rounded-full bg-[#6A6178]" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 text-[11px] text-white">
          <PogoMark size={14} inverted /> AI-moderated interview
        </div>
        <button
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause interview video' : 'Play interview video'}
          className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-lg transition-transform hover:scale-105"
        >
          {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <div className="absolute inset-x-3 bottom-2.5 flex items-center gap-2 text-[11px] text-white">
          <span className="num">{fmtTime(pos)}</span>
          <div className="h-1 flex-1 rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${(pos / total) * 100}%` }} />
          </div>
          <span className="num">{r.duration}</span>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {thumbs.map((f) => (
          <button key={f} onClick={() => setPos(Math.round(total * f))} className="group relative aspect-video overflow-hidden rounded-md bg-[#2E2A36]" aria-label={`Jump to ${fmtTime(total * f)}`}>
            <div className="absolute bottom-0 left-1/2 h-1/2 w-1/2 -translate-x-1/2 rounded-t-full bg-[#4A4458]" />
            <span className="num absolute bottom-0.5 right-1 text-[9px] text-white/80">{fmtTime(total * f)}</span>
            <span className="absolute inset-0 ring-brand group-hover:ring-2" />
          </button>
        ))}
      </div>
    </div>
  )
}

export function RespondentDrawer() {
  const { drawerId, setDrawerId } = useApp()
  const tour = useTour()
  const [shown, setShown] = useState<Respondent | null>(null)
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (drawerId) {
      setShown(respondentById[drawerId])
      const raf = requestAnimationFrame(() => setOpen(true))
      return () => cancelAnimationFrame(raf)
    }
    setOpen(false)
    const t = setTimeout(() => setShown(null), 240)
    return () => clearTimeout(t)
  }, [drawerId])

  useEffect(() => {
    if (!drawerId) return
    if (!tour.active) closeRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !tour.active) setDrawerId(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerId, tour.active, setDrawerId])

  if (!shown) return null
  const r = shown
  const reason = reasonByKey[r.reason]
  const transcript = transcriptFor(r)

  return (
    <div className="fixed inset-0 z-50">
      <div className={cx('absolute inset-0 bg-[rgba(16,10,30,0.3)] transition-opacity duration-200', open ? 'opacity-100' : 'opacity-0')} onClick={() => setDrawerId(null)} aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Interview with ${r.name}`}
        className={cx('absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.12)] transition-transform duration-[240ms] ease-out', open ? 'translate-x-0' : 'translate-x-full')}
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar name={r.name} size={40} />
            <div>
              <div className="text-[15px] font-semibold">{r.name}</div>
              <div className="text-[12px] text-muted">{r.age} · {r.city} · Verified buyer for {r.tenure}</div>
            </div>
          </div>
          <button ref={closeRef} onClick={() => setDrawerId(null)} aria-label="Close interview" className="rounded-md p-1.5 text-muted hover:bg-canvas hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <Video r={r} />
          <dl className="grid grid-cols-3 gap-3 text-[12px]">
            <div><dt className="text-muted">Primary reason</dt><dd className="mt-1"><ReasonTag reason={r.reason} /></dd></div>
            <div><dt className="text-muted">Switched to</dt><dd className="mt-1 font-medium">{r.switchedTo}</dd></div>
            <div><dt className="text-muted">Usual retailer</dt><dd className="mt-1 font-medium">{r.retailer}</dd></div>
          </dl>
          <div data-tour="drawer-transcript" className="rounded-xl border border-line p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold">Transcript</h3>
              <span className="text-[11px] text-faint">Coded as “{reason.label}”</span>
            </div>
            <div className="mt-2"><ThoughtRow seconds={18} label="Show Work · Thought for 18 seconds" steps={[
              `Matched ${r.name} to a verified Ridgeline purchase history (${r.tenure})`,
              `Confirmed a later ${r.switchedTo === 'No replacement' ? 'gap in bar purchases' : `${r.switchedTo} purchase at ${r.retailer}`}`,
              'Asked five key questions with adaptive follow-ups',
              `Coded the primary switching reason as “${reason.label}”`,
            ]} /></div>
            <ol className="mt-4 space-y-4">
              {transcript.map((line, i) => (
                <li key={i} className="flex gap-3">
                  {line.speaker === 'interviewer' ? <PogoMark size={24} inverted className="mt-0.5" /> : <Avatar name={r.name} size={24} className="mt-0.5 text-[9px]" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-faint">
                      {line.speaker === 'interviewer' ? 'Interviewer' : 'Respondent'}
                      <span className="num font-normal normal-case tracking-normal">{line.time}</span>
                    </div>
                    <p className={cx('mt-1 text-[13px] leading-relaxed', line.speaker === 'interviewer' && 'text-muted')}>“{line.text}”</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </aside>
    </div>
  )
}
