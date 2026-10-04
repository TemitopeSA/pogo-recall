import { useState } from 'react'
import { Check, Eye, X } from 'lucide-react'
import { segments, reasonByKey, type SegmentId } from '../../data/mockData'
import { updateConfig } from '../../data/campaignModel'
import { useApp } from '../../state/AppState'
import { Card, useClickOutside } from '../shared/ui'
import { ReasonTag } from '../respondents/RespondentCard'
import { cx } from '../../lib/util'

function SegmentDetail({ id, onClose }: { id: SegmentId; onClose: () => void }) {
  const ref = useClickOutside(true, onClose)
  const s = segments.find((x) => x.id === id)!
  return (
    <div ref={ref} role="dialog" aria-label={`${s.name} details`} className="animate-pop-in absolute left-0 right-0 top-full z-30 mt-1.5 rounded-xl border border-line bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between">
        <div className="text-[13px] font-semibold">{s.name}</div>
        <button onClick={onClose} aria-label="Close segment details" className="rounded p-0.5 text-muted hover:text-ink"><X size={14} /></button>
      </div>
      <div className="mt-1 text-[12px] text-muted">Primary reason: {reasonByKey[s.reason].label}</div>
      <ul className="mt-3 space-y-1.5 text-[12px]">
        {s.characteristics.map((c) => <li key={c} className="flex gap-2"><Check size={13} className="mt-0.5 shrink-0 text-c-green" />{c}</li>)}
      </ul>
      <div className="mt-3 rounded-lg bg-lavender p-2.5 text-[12px] leading-relaxed"><span className="font-medium text-brand">Recommended action · </span>{s.recommendation}</div>
    </div>
  )
}

export function SegmentSelector() {
  const { campaign, setCampaign, showErrors } = useApp()
  const [detail, setDetail] = useState<SegmentId | null>(null)
  const total = campaign.segments.reduce((s, id) => s + segments.find((x) => x.id === id)!.count, 0)
  const toggle = (id: SegmentId) =>
    setCampaign((c) => updateConfig(c, { segments: c.segments.includes(id) ? c.segments.filter((x) => x !== id) : [...c.segments, id] }))

  return (
    <Card data-tour="segment-selector" className="flex h-full flex-col p-5">
      <h2 className="text-[14px] font-semibold">Who should we bring back?</h2>
      <p className="mt-0.5 text-[12px] text-muted">Segments identified from verified purchase behavior and interviews.</p>
      <ul className="mt-4 space-y-2.5">
        {segments.map((s) => {
          const on = campaign.segments.includes(s.id)
          return (
            <li key={s.id} className="relative">
              <div className={cx('rounded-xl border p-3.5 transition-colors duration-150', on ? 'border-brand bg-lavender' : 'border-line bg-white hover:bg-canvas')}>
                <label className="relative flex cursor-pointer items-start gap-3">
                  <input type="checkbox" aria-label={`${s.name}, ${s.count} buyers`} checked={on} onChange={() => toggle(s.id)} className="peer absolute left-0 top-0.5 m-0 h-4 w-4 cursor-pointer opacity-0" />
                  <span aria-hidden className={cx('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-1', on ? 'border-brand bg-brand text-white' : 'border-[#C4C4C4] bg-white')}>
                    {on && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-medium">{s.name}</span>
                      <span className="num text-[13px]">{s.count}</span>
                    </span>
                    <span className="mt-1 block text-[12px] leading-snug text-muted">{s.description}</span>
                  </span>
                </label>
                <div className="mt-2.5 flex items-center justify-between pl-7">
                  <ReasonTag reason={s.reason} />
                  <button onClick={() => setDetail(detail === s.id ? null : s.id)} aria-expanded={detail === s.id} className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:text-brand-hover">
                    <Eye size={13} /> View segment
                  </button>
                </div>
              </div>
              {detail === s.id && <SegmentDetail id={s.id} onClose={() => setDetail(null)} />}
            </li>
          )
        })}
      </ul>
      <div className="mt-auto pt-4">
        <div className="flex items-baseline justify-between rounded-lg border border-line px-3.5 py-3">
          <span className="text-[12px] text-muted">{campaign.segments.length > 1 ? 'Estimated target audience' : 'Target audience'}</span>
          <span className="num text-[18px] font-medium">{total.toLocaleString()}</span>
        </div>
        {campaign.segments.length > 1 && <p className="mt-2 text-[11px] leading-snug text-faint">Sum of selected segments. Overlap between segments is not modeled, so the deduplicated audience may be smaller.</p>}
        {showErrors && campaign.segments.length === 0 && <p role="alert" className="mt-2 text-[12px] text-c-coral">Select at least one audience segment.</p>}
      </div>
    </Card>
  )
}
