import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTour } from './TourProvider'
import { useApp } from '../../state/AppState'
import { stageLabel } from '../app-shell/WorkflowStepper'
import { isTypingTarget, prefersReducedMotion } from '../../lib/util'
import { useToast } from '../shared/Toast'
import type { Placement } from './tourSteps'

interface Box { top: number; left: number; width: number; height: number }
const PAD = 8
const TIP_W = 320

const toBox = (r: DOMRect): Box => ({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 })
const same = (a: DOMRect, b: DOMRect) => Math.abs(a.top - b.top) < 0.5 && Math.abs(a.left - b.left) < 0.5 && Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5

function placeTooltip(b: Box | null, th: number, pref: Placement) {
  const vw = window.innerWidth, vh = window.innerHeight, m = 16, gap = 14
  const tw = Math.min(TIP_W, vw - m * 2)
  if (!b) return { left: (vw - tw) / 2, top: (vh - th) / 2 }
  const clampX = (x: number) => Math.min(Math.max(m, x), vw - tw - m)
  const clampY = (y: number) => Math.min(Math.max(m, y), vh - th - m)
  const vis = { top: Math.max(b.top, 0), bottom: Math.min(b.top + b.height, vh) }
  const midY = (vis.top + vis.bottom) / 2
  const opts: Record<Placement, () => { left: number; top: number } | null> = {
    right: () => (b.left + b.width + gap + tw <= vw - m ? { left: b.left + b.width + gap, top: clampY(midY - th / 2) } : null),
    left: () => (b.left - gap - tw >= m ? { left: b.left - gap - tw, top: clampY(midY - th / 2) } : null),
    bottom: () => (b.top + b.height + gap + th <= vh - m ? { left: clampX(b.left + b.width / 2 - tw / 2), top: b.top + b.height + gap } : null),
    top: () => (b.top - gap - th >= m ? { left: clampX(b.left + b.width / 2 - tw / 2), top: b.top - gap - th } : null),
  }
  const order: Placement[] = [pref, ...(['bottom', 'right', 'left', 'top'] as Placement[]).filter((p) => p !== pref)]
  for (const p of order) {
    const pos = opts[p]()
    if (pos) return pos
  }
  // Target fills the viewport: sit inside it, bottom-right, where content is least dense.
  return { left: vw - tw - 24, top: vh - th - 24 }
}

export function TourOverlay() {
  const tour = useTour()
  const { transition } = useApp()
  const toast = useToast()
  const { step, active, busy } = tour
  const hidden = !active || busy || !!transition
  const [box, setBox] = useState<Box | null>(null)
  const [ready, setReady] = useState(false)
  const [tipH, setTipH] = useState(180)
  const [vp, setVp] = useState(0)
  const tipRef = useRef<HTMLDivElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  // Locate, scroll to and track the step's target once the screen has settled.
  useEffect(() => {
    if (hidden || !step) { setReady(false); return }
    let raf = 0, frames = 0, stable = 0, cancelled = false, scrolled = false
    let last: DOMRect | null = null
    let el: HTMLElement | null = null
    let ro: ResizeObserver | null = null
    let poll = 0
    let pending = 0
    let foundAt = 0
    const started = performance.now()
    const measure = () => {
      if (pending) return
      pending = requestAnimationFrame(() => {
        pending = 0
        if (el?.isConnected) setBox(toBox(el.getBoundingClientRect()))
        setVp(window.innerWidth * 10000 + window.innerHeight)
      })
    }
    const attach = () => {
      window.addEventListener('resize', measure)
      window.addEventListener('scroll', measure, true)
      if (el) { ro = new ResizeObserver(measure); ro.observe(el) }
      // Safety net for layout shifts that fire no events (late fonts, charts settling).
      poll = window.setInterval(measure, 300)
      setReady(true)
    }
    const loop = () => {
      if (cancelled) return
      frames++
      const now = performance.now()
      el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
      if (el) {
        if (!foundAt) foundAt = now
        if (!scrolled && frames > 1) {
          const tall = el.getBoundingClientRect().height > window.innerHeight * 0.75
          el.scrollIntoView({ block: step.scrollBlock ?? (tall ? 'start' : 'center'), behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
          scrolled = true
        }
        const r = el.getBoundingClientRect()
        stable = last && same(r, last) ? stable + 1 : 0
        last = r
        if (scrolled && r.width > 0 && (stable >= 4 || now - foundAt > 900)) {
          setBox(toBox(r))
          attach()
          return
        }
      }
      if (now - started > 2500) {
        setBox(el ? toBox(el.getBoundingClientRect()) : null)
        attach()
        return
      }
      raf = requestAnimationFrame(loop)
    }
    setReady(false)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      cancelAnimationFrame(pending)
      clearInterval(poll)
      ro?.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [hidden, step])

  useLayoutEffect(() => {
    if (tipRef.current) setTipH(tipRef.current.offsetHeight)
  }, [ready, step, vp])

  useEffect(() => {
    if (ready && !hidden) nextRef.current?.focus({ preventScroll: true })
  }, [ready, hidden, step])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return
      if (e.key === 'ArrowRight') { e.preventDefault(); tour.next() }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); tour.back() }
      else if (e.key === 'Escape') {
        e.preventDefault()
        tour.skip()
        toast('Tour closed. Reopen it any time from the ? button.', 'info')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, tour, toast])

  if (!active || !step) return null
  if (hidden) return null

  const vw = window.innerWidth, vh = window.innerHeight
  const hole = ready ? box : null
  const pos = placeTooltip(hole, tipH, step.placement)
  const ringStyle = hole
    ? { top: hole.top, left: hole.left, width: hole.width, height: hole.height }
    : { top: vh / 2, left: vw / 2, width: 0, height: 0 }

  const blockers = hole
    ? [
        { top: 0, left: 0, width: vw, height: Math.max(0, hole.top) },
        { top: hole.top + hole.height, left: 0, width: vw, height: Math.max(0, vh - hole.top - hole.height) },
        { top: hole.top, left: 0, width: Math.max(0, hole.left), height: hole.height },
        { top: hole.top, left: hole.left + hole.width, width: Math.max(0, vw - hole.left - hole.width), height: hole.height },
      ]
    : [{ top: 0, left: 0, width: vw, height: vh }]

  return (
    <div className="fixed inset-0 z-[60]" aria-live="polite">
      {blockers.map((b, i) => <div key={i} className="absolute" style={b} aria-hidden />)}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-xl transition-all duration-200 ease-out"
        style={{ ...ringStyle, boxShadow: `${hole ? '0 0 0 2px #6B3FE0, ' : ''}0 0 0 9999px rgba(16,10,30,0.52)` }}
      />
      {ready && (
        <div
          ref={tipRef}
          role="dialog"
          aria-labelledby="tour-title"
          aria-describedby="tour-body"
          key={step.id}
          className="animate-pop-in absolute rounded-xl bg-white p-4 shadow-[0_16px_48px_rgba(20,10,40,0.28)] transition-[top,left] duration-200"
          style={{ top: pos.top, left: pos.left, width: Math.min(TIP_W, vw - 32) }}
        >
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-brand">
            Step {tour.index + 1} of {tour.total} · {stageLabel(step.stage)}
          </div>
          <h2 id="tour-title" className="mt-1.5 text-[15px] font-semibold leading-snug">{step.title}</h2>
          <p id="tour-body" className="mt-1.5 text-[13px] leading-relaxed text-muted">{step.body}</p>
          <div className="mt-2.5 flex gap-1" aria-hidden>
            {Array.from({ length: tour.total }, (_, i) => (
              <span key={i} className={`h-1 flex-1 rounded-full ${i <= tour.index ? 'bg-brand' : 'bg-line'}`} />
            ))}
          </div>
          <div className="mt-3.5 flex items-center justify-between">
            <button onClick={() => tour.skip()} className="rounded-md px-1 text-[12px] text-muted hover:text-ink">Skip tour</button>
            <div className="flex gap-1.5">
              <button onClick={tour.back} disabled={tour.index === 0} className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2.5 text-[13px] hover:bg-canvas disabled:opacity-40" aria-label="Previous step">
                <ArrowLeft size={14} /> Back
              </button>
              <button ref={nextRef} onClick={tour.next} className="inline-flex h-8 items-center gap-1 rounded-lg bg-brand px-3 text-[13px] font-medium text-white hover:bg-brand-hover">
                {tour.index === tour.total - 1 ? 'Finish' : 'Next'} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
