import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { routes } from '../../state/AppState'
import { cx } from '../../lib/util'

export type Stage = 'detect' | 'understand' | 'winback' | 'prove'
export const stages: { id: Stage; num: string; label: string; path: string }[] = [
  { id: 'detect', num: '01', label: 'Detect', path: routes.detect },
  { id: 'understand', num: '02', label: 'Understand', path: routes.understand },
  { id: 'winback', num: '03', label: 'Win back', path: routes.campaign },
  { id: 'prove', num: '04', label: 'Prove', path: routes.results },
]
export const stageLabel = (s: Stage) => stages.find((x) => x.id === s)!.label

export function WorkflowStepper({ current }: { current: Stage }) {
  const navigate = useNavigate()
  const idx = stages.findIndex((s) => s.id === current)
  return (
    <nav aria-label="Recall workflow" data-tour="stepper">
      <ol className="flex flex-wrap items-center gap-1">
        {stages.map((s, i) => {
          const state = i < idx ? 'done' : i === idx ? 'current' : 'todo'
          return (
            <li key={s.id} className="flex items-center gap-1">
              <button
                onClick={() => navigate(s.path)}
                aria-current={state === 'current' ? 'step' : undefined}
                className={cx(
                  'flex h-8 items-center gap-2 rounded-lg px-2.5 text-[13px] transition-colors duration-150',
                  state === 'current' && 'bg-lavender font-medium text-brand',
                  state === 'done' && 'text-ink hover:bg-canvas',
                  state === 'todo' && 'text-faint hover:bg-canvas hover:text-muted',
                )}
              >
                <span className={cx('flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-semibold num', state === 'current' && 'bg-brand text-white', state === 'done' && 'bg-[#EAF6EC] text-[#2F7A3B]', state === 'todo' && 'border border-line text-faint')}>
                  {state === 'done' ? <Check size={11} strokeWidth={3} aria-label="completed" /> : s.num}
                </span>
                {s.label}
              </button>
              {i < stages.length - 1 && <span aria-hidden className={cx('h-px w-6', i < idx ? 'bg-[#BFE0C4]' : 'bg-line')} />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
