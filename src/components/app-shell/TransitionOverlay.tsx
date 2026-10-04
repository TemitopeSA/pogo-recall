import { useEffect, useState } from 'react'
import { useApp } from '../../state/AppState'
import { PogoMark } from '../shared/ui'
import { prefersReducedMotion } from '../../lib/util'

export function TransitionOverlay() {
  const { transition } = useApp()
  const [day, setDay] = useState(1)

  useEffect(() => {
    if (transition?.kind !== 'days') return
    setDay(1)
    if (prefersReducedMotion()) { setDay(30); return }
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1150)
      setDay(Math.max(1, Math.round(1 + 29 * (1 - (1 - p) ** 2))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [transition])

  if (!transition) return null
  return (
    <div className="animate-fade-in absolute inset-0 z-40 flex items-center justify-center bg-canvas/95" role="status" aria-live="polite">
      {transition.kind === 'loading' ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <PogoMark size={36} />
            <span className="absolute -inset-2 animate-spin rounded-[12px] border-2 border-transparent border-t-brand [animation-duration:900ms]" />
          </div>
          <div className="mt-2 text-[14px] font-medium">{transition.label}</div>
          {transition.sub && <div className="text-[13px] text-muted">{transition.sub}</div>}
        </div>
      ) : (
        <div className="w-[320px] text-center">
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">{transition.label}</div>
          <div className="num mt-3 text-[44px] font-medium leading-none">Day {day}</div>
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-brand" style={{ width: `${(day / 30) * 100}%` }} />
          </div>
          <div className="mt-3 text-[13px] text-muted">{transition.sub}</div>
        </div>
      )}
    </div>
  )
}
