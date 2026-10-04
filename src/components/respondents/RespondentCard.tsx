import { Play } from 'lucide-react'
import type { Respondent } from '../../data/respondents'
import { reasonByKey } from '../../data/mockData'
import { Avatar } from '../shared/ui'

export function ReasonTag({ reason }: { reason: Respondent['reason'] }) {
  const r = reasonByKey[reason]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-canvas px-2 py-0.5 text-[11px] font-medium text-[#3d3d3d]">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: r.color }} aria-hidden />
      {r.label}
    </span>
  )
}

export function RespondentCard({ r, onOpen, tour }: { r: Respondent; onOpen: () => void; tour?: string }) {
  return (
    <article data-tour={tour} className="group flex flex-col rounded-xl border border-line bg-white p-4 transition-shadow duration-150 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <Avatar name={r.name} />
        <div className="min-w-0">
          <div className="text-[14px] font-medium">{r.name}</div>
          <div className="text-[12px] text-muted">{r.age} · {r.city}</div>
        </div>
      </div>
      <div className="mt-3"><ReasonTag reason={r.reason} /></div>
      <p className="mt-3 flex-1 text-[13px] leading-relaxed">“{r.quote}”</p>
      <button onClick={onOpen} className="mt-4 inline-flex items-center gap-1.5 self-start rounded-md text-[13px] font-medium text-brand hover:text-brand-hover">
        <Play size={13} /> View interview <span className="num text-[12px] font-normal text-muted">{r.duration}</span>
      </button>
    </article>
  )
}
